import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
// In production: import Stripe from 'stripe';

interface StripeEvent {
  id: string;
  type: string;
  api_version: string;
  data: {
    object: Record<string, unknown>;
    previous_attributes?: Record<string, unknown>;
  };
  created: number;
}

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(private supabase: SupabaseService) {}

  /**
   * Verify and process a Stripe webhook event
   */
  async handleWebhook(payload: string, signature: string): Promise<{ received: boolean }> {
    let event: StripeEvent;

    // In production, verify signature:
    // try {
    //   event = this.stripe.webhooks.constructEvent(
    //     payload,
    //     signature,
    //     process.env.STRIPE_WEBHOOK_SECRET!
    //   );
    // } catch (err) {
    //   throw new BadRequestException('Invalid webhook signature');
    // }

    // For development, parse directly
    try {
      event = JSON.parse(payload) as StripeEvent;
    } catch {
      throw new BadRequestException({
        code: 'INVALID_WEBHOOK_PAYLOAD',
        message: 'Invalid JSON payload',
      });
    }

    // Check for idempotency - have we already processed this event?
    const { data: existing } = await this.supabase.adminClient
      .from('stripe_webhooks')
      .select('id, processed')
      .eq('stripe_event_id', event.id)
      .single();

    if (existing?.processed) {
      this.logger.log(`Event ${event.id} already processed, skipping`);
      return { received: true };
    }

    // Store the event for processing
    const { error: insertError } = await this.supabase.adminClient
      .from('stripe_webhooks')
      .upsert({
        stripe_event_id: event.id,
        type: event.type,
        api_version: event.api_version,
        payload: event,
        processed: false,
        attempts: existing ? (existing.id ? 1 : 0) : 0,
      });

    if (insertError) {
      this.logger.error(`Failed to store webhook event: ${insertError.message}`);
    }

    // Process the event
    try {
      await this.processEvent(event);

      // Mark as processed
      await this.supabase.adminClient
        .from('stripe_webhooks')
        .update({
          processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq('stripe_event_id', event.id);

      return { received: true };
    } catch (error) {
      // Log error but don't fail the webhook
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to process event ${event.id}: ${errorMessage}`);

      await this.supabase.adminClient
        .from('stripe_webhooks')
        .update({
          error: errorMessage,
          attempts: (existing?.id ? 1 : 0) + 1,
        })
        .eq('stripe_event_id', event.id);

      // Return success to Stripe to prevent retries for known errors
      return { received: true };
    }
  }

  /**
   * Process different event types
   */
  private async processEvent(event: StripeEvent): Promise<void> {
    this.logger.log(`Processing event: ${event.type}`);

    switch (event.type) {
      // Account events
      case 'account.updated':
        await this.handleAccountUpdated(event.data.object);
        break;

      case 'account.application.deauthorized':
        await this.handleAccountDeauthorized(event.data.object);
        break;

      // Payout events
      case 'payout.created':
        await this.handlePayoutCreated(event.data.object);
        break;

      case 'payout.updated':
      case 'payout.paid':
      case 'payout.failed':
      case 'payout.canceled':
        await this.handlePayoutUpdated(event.data.object);
        break;

      // Payment events
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object);
        break;

      // Charge events
      case 'charge.refunded':
        await this.handleChargeRefunded(event.data.object);
        break;

      case 'charge.dispute.created':
        await this.handleDisputeCreated(event.data.object);
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  /**
   * Handle account.updated - sync account status
   */
  private async handleAccountUpdated(account: Record<string, unknown>): Promise<void> {
    const stripeAccountId = account['id'] as string;
    const detailsSubmitted = account['details_submitted'] as boolean | undefined;
    const chargesEnabled = account['charges_enabled'] as boolean | undefined;
    const payoutsEnabled = account['payouts_enabled'] as boolean | undefined;
    const country = account['country'] as string | undefined;
    const defaultCurrency = account['default_currency'] as string | undefined;
    const businessType = account['business_type'] as string | undefined;
    const businessProfile = account['business_profile'] as Record<string, unknown> | undefined;
    const businessName = account['business_name'] as string | undefined;
    const capabilities = account['capabilities'];
    const requirements = account['requirements'];

    // Determine status based on account state
    let status = 'pending';
    if (detailsSubmitted && chargesEnabled) {
      status = 'active';
    } else if (detailsSubmitted) {
      status = 'restricted';
    } else {
      status = 'onboarding';
    }

    const { error } = await this.supabase.adminClient
      .from('stripe_accounts')
      .update({
        status,
        charges_enabled: chargesEnabled ?? false,
        payouts_enabled: payoutsEnabled ?? false,
        details_submitted: detailsSubmitted ?? false,
        country,
        default_currency: defaultCurrency,
        business_type: businessType,
        business_name: (businessProfile?.['name'] as string) || businessName,
        metadata: {
          capabilities,
          requirements,
        },
      })
      .eq('stripe_account_id', stripeAccountId);

    if (error) {
      throw new InternalServerErrorException(`Failed to update account: ${error.message}`);
    }

    this.logger.log(`Updated account ${stripeAccountId} to status: ${status}`);
  }

  /**
   * Handle account deauthorization
   */
  private async handleAccountDeauthorized(account: Record<string, unknown>): Promise<void> {
    const accountId = account['id'] as string;

    const { error } = await this.supabase.adminClient
      .from('stripe_accounts')
      .update({ status: 'disabled' })
      .eq('stripe_account_id', accountId);

    if (error) {
      throw new InternalServerErrorException(`Failed to disable account: ${error.message}`);
    }

    this.logger.log(`Disabled account ${accountId}`);
  }

  /**
   * Handle payout created
   */
  private async handlePayoutCreated(payout: Record<string, unknown>): Promise<void> {
    const destination = payout['destination'] as string;
    const payoutId = payout['id'] as string;
    const amount = payout['amount'] as number;
    const currency = payout['currency'] as string;
    const payoutStatus = payout['status'] as string;
    const arrivalDate = payout['arrival_date'] as number | undefined;
    const method = payout['method'] as string | undefined;
    const destinationType = payout['destination_type'] as string | undefined;
    const destinationObj = payout['destination'] as Record<string, unknown> | undefined;

    // Get internal account ID
    const { data: account } = await this.supabase.adminClient
      .from('stripe_accounts')
      .select('id')
      .eq('stripe_account_id', destination)
      .single();

    if (!account) {
      this.logger.warn(`No account found for payout destination: ${destination}`);
      return;
    }

    const { error } = await this.supabase.adminClient
      .from('stripe_payouts')
      .insert({
        stripe_account_id: account.id,
        stripe_payout_id: payoutId,
        amount,
        currency,
        status: payoutStatus,
        arrival_date: arrivalDate
          ? new Date(arrivalDate * 1000).toISOString().split('T')[0]
          : null,
        method,
        destination_type: destinationType,
        destination_last4: typeof destinationObj === 'object' ? (destinationObj?.['last4'] as string | undefined) : undefined,
      });

    if (error) {
      throw new InternalServerErrorException(`Failed to create payout: ${error.message}`);
    }
  }

  /**
   * Handle payout status updates
   */
  private async handlePayoutUpdated(payout: Record<string, unknown>): Promise<void> {
    const payoutId = payout['id'] as string;
    const payoutStatus = payout['status'] as string;
    const failureCode = payout['failure_code'] as string | undefined;
    const failureMessage = payout['failure_message'] as string | undefined;

    const { error } = await this.supabase.adminClient
      .from('stripe_payouts')
      .update({
        status: payoutStatus,
        failure_code: failureCode,
        failure_message: failureMessage,
      })
      .eq('stripe_payout_id', payoutId);

    if (error) {
      throw new InternalServerErrorException(`Failed to update payout: ${error.message}`);
    }
  }

  /**
   * Handle successful payment
   */
  private async handlePaymentSucceeded(paymentIntent: Record<string, unknown>): Promise<void> {
    // Get internal account ID from the connected account
    const onBehalfOf = paymentIntent['on_behalf_of'] as string | undefined;
    const transferData = paymentIntent['transfer_data'] as Record<string, unknown> | undefined;
    const stripeAccountId = onBehalfOf || (transferData?.['destination'] as string | undefined);

    if (!stripeAccountId) {
      this.logger.warn('Payment without connected account, skipping');
      return;
    }

    const { data: account } = await this.supabase.adminClient
      .from('stripe_accounts')
      .select('id')
      .eq('stripe_account_id', stripeAccountId)
      .single();

    if (!account) {
      this.logger.warn(`No account found: ${stripeAccountId}`);
      return;
    }

    // Calculate fees
    const amount = paymentIntent['amount'] as number;
    const platformFee = (paymentIntent['application_fee_amount'] as number) || 0;
    const stripeFee = Math.round(amount * 0.029 + 30); // Estimate Stripe fee

    const { error } = await this.supabase.adminClient
      .from('stripe_transactions')
      .insert({
        stripe_account_id: account.id,
        stripe_payment_intent_id: paymentIntent['id'] as string,
        stripe_charge_id: paymentIntent['latest_charge'] as string | undefined,
        type: 'charge',
        status: 'succeeded',
        amount,
        currency: paymentIntent['currency'] as string,
        platform_fee: platformFee,
        stripe_fee: stripeFee,
        net_amount: amount - platformFee - stripeFee,
        description: paymentIntent['description'] as string | undefined,
        customer_email: paymentIntent['receipt_email'] as string | undefined,
        metadata: paymentIntent['metadata'],
      });

    if (error) {
      throw new InternalServerErrorException(`Failed to create transaction: ${error.message}`);
    }
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(paymentIntent: Record<string, unknown>): Promise<void> {
    const onBehalfOf = paymentIntent['on_behalf_of'] as string | undefined;
    const transferData = paymentIntent['transfer_data'] as Record<string, unknown> | undefined;
    const stripeAccountId = onBehalfOf || (transferData?.['destination'] as string | undefined);

    if (!stripeAccountId) return;

    const { data: account } = await this.supabase.adminClient
      .from('stripe_accounts')
      .select('id')
      .eq('stripe_account_id', stripeAccountId)
      .single();

    if (!account) return;

    const lastPaymentError = paymentIntent['last_payment_error'] as Record<string, unknown> | undefined;

    const { error } = await this.supabase.adminClient
      .from('stripe_transactions')
      .insert({
        stripe_account_id: account.id,
        stripe_payment_intent_id: paymentIntent['id'] as string,
        type: 'charge',
        status: 'failed',
        amount: paymentIntent['amount'] as number,
        currency: paymentIntent['currency'] as string,
        platform_fee: 0,
        stripe_fee: 0,
        net_amount: 0,
        description: (lastPaymentError?.['message'] as string) || 'Payment failed',
        customer_email: paymentIntent['receipt_email'] as string | undefined,
        metadata: {
          error_code: lastPaymentError?.['code'],
          error_message: lastPaymentError?.['message'],
        },
      });

    if (error) {
      throw new InternalServerErrorException(`Failed to log failed payment: ${error.message}`);
    }
  }

  /**
   * Handle refund
   */
  private async handleChargeRefunded(charge: Record<string, unknown>): Promise<void> {
    const amountRefunded = charge['amount_refunded'] as number;
    const amount = charge['amount'] as number;
    const chargeId = charge['id'] as string;

    // Update existing transaction status
    const { error } = await this.supabase.adminClient
      .from('stripe_transactions')
      .update({
        status: amountRefunded === amount ? 'refunded' : 'partially_refunded',
      })
      .eq('stripe_charge_id', chargeId);

    if (error) {
      this.logger.warn(`Failed to update refunded transaction: ${error.message}`);
    }
  }

  /**
   * Handle dispute
   */
  private async handleDisputeCreated(dispute: Record<string, unknown>): Promise<void> {
    const chargeId = dispute['charge'] as string;

    // Update transaction status
    const { error } = await this.supabase.adminClient
      .from('stripe_transactions')
      .update({ status: 'disputed' })
      .eq('stripe_charge_id', chargeId);

    if (error) {
      this.logger.warn(`Failed to update disputed transaction: ${error.message}`);
    }
  }
}
