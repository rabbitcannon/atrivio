import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import Stripe from 'stripe';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private stripe: Stripe;

  constructor(private supabase: SupabaseService) {
    const stripeKey = process.env['STRIPE_SECRET_KEY'];
    if (!stripeKey) {
      this.logger.warn('STRIPE_SECRET_KEY not configured - webhook verification will be skipped');
      // Use a dummy key to prevent initialization error
      this.stripe = new Stripe('sk_test_dummy_key_for_initialization');
    } else {
      this.stripe = new Stripe(stripeKey);
    }
  }

  /**
   * Verify and process a Stripe webhook event
   */
  async handleWebhook(payload: string, signature: string): Promise<{ received: boolean }> {
    let event: Stripe.Event;

    const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];

    if (webhookSecret) {
      // Production: verify signature
      try {
        event = this.stripe.webhooks.constructEvent(
          payload,
          signature,
          webhookSecret
        );
        this.logger.log(`Verified webhook signature for event ${event.id}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        this.logger.error(`Webhook signature verification failed: ${message}`);
        throw new BadRequestException({
          code: 'INVALID_WEBHOOK_SIGNATURE',
          message: 'Invalid webhook signature',
        });
      }
    } else {
      // Development without webhook secret: parse directly (for testing)
      this.logger.warn('STRIPE_WEBHOOK_SECRET not configured - skipping signature verification');
      try {
        event = JSON.parse(payload) as Stripe.Event;
      } catch {
        throw new BadRequestException({
          code: 'INVALID_WEBHOOK_PAYLOAD',
          message: 'Invalid JSON payload',
        });
      }
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
   * For Connect webhooks, event.account contains the connected account ID
   */
  private async processEvent(event: Stripe.Event): Promise<void> {
    this.logger.log(`Processing event: ${event.type}${event.account ? ` for account ${event.account}` : ''}`);

    // For Connect webhooks, the connected account ID is in event.account
    const connectedAccountId = event.account;

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
        await this.handlePayoutCreated(event.data.object, connectedAccountId);
        break;

      case 'payout.updated':
      case 'payout.paid':
      case 'payout.failed':
      case 'payout.canceled':
        await this.handlePayoutUpdated(event.data.object);
        break;

      // Payment events
      case 'payment_intent.succeeded':
        await this.handlePaymentSucceeded(event.data.object, connectedAccountId);
        break;

      case 'payment_intent.payment_failed':
        await this.handlePaymentFailed(event.data.object, connectedAccountId);
        break;

      // Charge events - handle charge.succeeded for direct charges
      case 'charge.succeeded':
        await this.handleChargeSucceeded(event.data.object, connectedAccountId);
        break;

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
  private async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    const stripeAccountId = account.id;
    const detailsSubmitted = account.details_submitted;
    const chargesEnabled = account.charges_enabled;
    const payoutsEnabled = account.payouts_enabled;
    const country = account.country;
    const defaultCurrency = account.default_currency;
    const businessType = account.business_type;
    const businessProfile = account.business_profile;
    const capabilities = account.capabilities;
    const requirements = account.requirements;

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
        business_name: businessProfile?.name || undefined,
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
  private async handleAccountDeauthorized(application: Stripe.Application): Promise<void> {
    const accountId = application.id;

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
   * For Connect webhooks, connectedAccountId comes from event.account
   */
  private async handlePayoutCreated(
    payout: Stripe.Payout,
    connectedAccountId?: string
  ): Promise<void> {
    const destination = typeof payout.destination === 'string' ? payout.destination : payout.destination?.id;
    const payoutId = payout.id;
    const amount = payout.amount;
    const currency = payout.currency;
    const payoutStatus = payout.status;
    const arrivalDate = payout.arrival_date;
    const method = payout.method;
    const destinationType = payout.type;

    // Use connectedAccountId from event, fallback to payout destination
    const stripeAccountId = connectedAccountId || destination;

    if (!stripeAccountId) {
      this.logger.warn('Payout without account identifier');
      return;
    }

    // Get internal account ID
    const { data: account } = await this.supabase.adminClient
      .from('stripe_accounts')
      .select('id')
      .eq('stripe_account_id', stripeAccountId)
      .single();

    if (!account) {
      this.logger.warn(`No account found for payout: ${stripeAccountId}`);
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
        destination_last4: undefined, // Bank account last4 not directly available from payout object
      });

    if (error) {
      throw new InternalServerErrorException(`Failed to create payout: ${error.message}`);
    }

    this.logger.log(`Created payout record for ${payoutId} on account ${stripeAccountId}`);
  }

  /**
   * Handle payout status updates
   */
  private async handlePayoutUpdated(payout: Stripe.Payout): Promise<void> {
    const payoutId = payout.id;
    const payoutStatus = payout.status;
    const failureCode = payout.failure_code;
    const failureMessage = payout.failure_message;

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
   * For Connect webhooks, connectedAccountId comes from event.account
   */
  private async handlePaymentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
    connectedAccountId?: string
  ): Promise<void> {
    // Get connected account ID: prefer event.account, fallback to PaymentIntent fields
    const onBehalfOf = typeof paymentIntent.on_behalf_of === 'string'
      ? paymentIntent.on_behalf_of
      : paymentIntent.on_behalf_of?.id;
    const transferDestination = typeof paymentIntent.transfer_data?.destination === 'string'
      ? paymentIntent.transfer_data.destination
      : paymentIntent.transfer_data?.destination?.id;
    const stripeAccountId = connectedAccountId || onBehalfOf || transferDestination;

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

    const latestCharge = typeof paymentIntent.latest_charge === 'string'
      ? paymentIntent.latest_charge
      : paymentIntent.latest_charge?.id;

    // Calculate fees
    const amount = paymentIntent.amount;
    const platformFee = paymentIntent.application_fee_amount || 0;
    const stripeFee = Math.round(amount * 0.029 + 30); // Estimate Stripe fee

    // Use upsert to handle race conditions with charge.succeeded event
    const { error } = await this.supabase.adminClient
      .from('stripe_transactions')
      .upsert({
        stripe_account_id: account.id,
        stripe_payment_intent_id: paymentIntent.id,
        stripe_charge_id: latestCharge,
        type: 'charge',
        status: 'succeeded',
        amount,
        currency: paymentIntent.currency,
        platform_fee: platformFee,
        stripe_fee: stripeFee,
        net_amount: amount - platformFee - stripeFee,
        description: paymentIntent.description,
        customer_email: paymentIntent.receipt_email,
        metadata: paymentIntent.metadata,
      }, { onConflict: 'stripe_charge_id', ignoreDuplicates: true });

    if (error) {
      throw new InternalServerErrorException(`Failed to create transaction: ${error.message}`);
    }

    this.logger.log(`Processed transaction for payment ${paymentIntent.id} on account ${stripeAccountId}`);
  }

  /**
   * Handle failed payment
   */
  private async handlePaymentFailed(
    paymentIntent: Stripe.PaymentIntent,
    connectedAccountId?: string
  ): Promise<void> {
    const onBehalfOf = typeof paymentIntent.on_behalf_of === 'string'
      ? paymentIntent.on_behalf_of
      : paymentIntent.on_behalf_of?.id;
    const transferDestination = typeof paymentIntent.transfer_data?.destination === 'string'
      ? paymentIntent.transfer_data.destination
      : paymentIntent.transfer_data?.destination?.id;
    const stripeAccountId = connectedAccountId || onBehalfOf || transferDestination;

    if (!stripeAccountId) return;

    const { data: account } = await this.supabase.adminClient
      .from('stripe_accounts')
      .select('id')
      .eq('stripe_account_id', stripeAccountId)
      .single();

    if (!account) return;

    const lastPaymentError = paymentIntent.last_payment_error;

    const { error } = await this.supabase.adminClient
      .from('stripe_transactions')
      .insert({
        stripe_account_id: account.id,
        stripe_payment_intent_id: paymentIntent.id,
        type: 'charge',
        status: 'failed',
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        platform_fee: 0,
        stripe_fee: 0,
        net_amount: 0,
        description: lastPaymentError?.message || 'Payment failed',
        customer_email: paymentIntent.receipt_email,
        metadata: {
          error_code: lastPaymentError?.code,
          error_message: lastPaymentError?.message,
        },
      });

    if (error) {
      throw new InternalServerErrorException(`Failed to log failed payment: ${error.message}`);
    }
  }

  /**
   * Handle successful charge (for direct charges on Connect accounts)
   * This handles the charge.succeeded event which fires for direct charges
   */
  private async handleChargeSucceeded(
    charge: Stripe.Charge,
    connectedAccountId?: string
  ): Promise<void> {
    if (!connectedAccountId) {
      this.logger.warn('Charge without connected account, skipping');
      return;
    }

    const { data: account } = await this.supabase.adminClient
      .from('stripe_accounts')
      .select('id')
      .eq('stripe_account_id', connectedAccountId)
      .single();

    if (!account) {
      this.logger.warn(`No account found: ${connectedAccountId}`);
      return;
    }

    // Get payment intent ID if available
    const paymentIntentId = typeof charge.payment_intent === 'string'
      ? charge.payment_intent
      : charge.payment_intent?.id;

    // Calculate fees
    const amount = charge.amount;
    const applicationFee = charge.application_fee_amount || 0;
    // For direct charges, the balance transaction contains actual fees
    const stripeFee = Math.round(amount * 0.029 + 30); // Estimate if not available

    // Use upsert to handle race conditions with payment_intent.succeeded event
    const { error } = await this.supabase.adminClient
      .from('stripe_transactions')
      .upsert({
        stripe_account_id: account.id,
        stripe_payment_intent_id: paymentIntentId,
        stripe_charge_id: charge.id,
        type: 'charge',
        status: 'succeeded',
        amount,
        currency: charge.currency,
        platform_fee: applicationFee,
        stripe_fee: stripeFee,
        net_amount: amount - applicationFee - stripeFee,
        description: charge.description,
        customer_email: charge.receipt_email || charge.billing_details?.email,
        metadata: charge.metadata,
      }, { onConflict: 'stripe_charge_id', ignoreDuplicates: true });

    if (error) {
      throw new InternalServerErrorException(`Failed to create transaction: ${error.message}`);
    }

    this.logger.log(`Processed transaction for charge ${charge.id} on account ${connectedAccountId}`);
  }

  /**
   * Handle refund
   */
  private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    const amountRefunded = charge.amount_refunded;
    const amount = charge.amount;
    const chargeId = charge.id;

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
  private async handleDisputeCreated(dispute: Stripe.Dispute): Promise<void> {
    const chargeId = typeof dispute.charge === 'string' ? dispute.charge : dispute.charge?.id;

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
