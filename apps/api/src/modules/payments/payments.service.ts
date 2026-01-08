import type { OrgId } from '@atrivio/shared';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type {
  CreateDashboardLinkDto,
  CreateOnboardingLinkDto,
  CreateRefundDto,
  ListPayoutsDto,
  ListTransactionsDto,
} from './dto/payments.dto.js';

// Default platform fee if not configured
const DEFAULT_PLATFORM_FEE_PERCENT = 3.0;

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(private supabase: SupabaseService) {
    const stripeKey = process.env['STRIPE_SECRET_KEY'];
    if (!stripeKey) {
      this.logger.warn('STRIPE_SECRET_KEY not configured - Stripe operations will fail');
      // Use a dummy key to prevent initialization error - actual calls will fail
      this.stripe = new Stripe('sk_test_dummy_key_for_initialization');
    } else {
      this.stripe = new Stripe(stripeKey);
    }
  }

  /**
   * Check if Stripe is properly configured
   */
  private ensureStripeConfigured(): void {
    if (!process.env['STRIPE_SECRET_KEY']) {
      throw new BadRequestException({
        code: 'STRIPE_NOT_CONFIGURED',
        message: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
      });
    }
  }

  /**
   * Get effective platform fee percentage for an organization
   * Uses org-specific fee if set, otherwise global default
   */
  async getPlatformFee(orgId: OrgId): Promise<{ percent: number; isCustom: boolean }> {
    // Try to get org-specific fee first
    const { data: org } = await this.supabase.adminClient
      .from('organizations')
      .select('platform_fee_percent')
      .eq('id', orgId)
      .single();

    if (org?.platform_fee_percent !== null && org?.platform_fee_percent !== undefined) {
      return {
        percent: Number(org.platform_fee_percent),
        isCustom: true,
      };
    }

    // Fall back to global default
    const { data: setting } = await this.supabase.adminClient
      .from('platform_settings')
      .select('value')
      .eq('key', 'stripe_platform_fee_percent')
      .single();

    return {
      percent: setting?.value ? Number(setting.value) : DEFAULT_PLATFORM_FEE_PERCENT,
      isCustom: false,
    };
  }

  /**
   * Calculate platform fee amount from transaction amount
   */
  async calculatePlatformFee(orgId: OrgId, amountCents: number): Promise<number> {
    const { percent } = await this.getPlatformFee(orgId);
    return Math.round(amountCents * (percent / 100));
  }

  /**
   * Get Stripe account status for an organization
   */
  async getAccountStatus(orgId: OrgId) {
    const { data, error } = await this.supabase.adminClient
      .from('stripe_accounts')
      .select('*')
      .eq('org_id', orgId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new BadRequestException({
        code: 'STRIPE_STATUS_FAILED',
        message: error.message,
      });
    }

    if (!data) {
      return {
        is_connected: false,
        status: null,
        charges_enabled: false,
        payouts_enabled: false,
        needs_onboarding: true,
        stripe_account_id: null,
        business_name: null,
      };
    }

    return {
      is_connected: true,
      status: data.status,
      charges_enabled: data.charges_enabled,
      payouts_enabled: data.payouts_enabled,
      needs_onboarding: data.status === 'pending' || data.status === 'onboarding',
      stripe_account_id: data.stripe_account_id,
      business_name: data.business_name,
      details_submitted: data.details_submitted,
      country: data.country,
      default_currency: data.default_currency,
    };
  }

  /**
   * Create a Stripe Connect Express account for an organization
   * Returns onboarding link
   */
  async createAccount(orgId: OrgId, dto: CreateOnboardingLinkDto) {
    this.ensureStripeConfigured();

    // Check if account already exists
    const { data: existing } = await this.supabase.adminClient
      .from('stripe_accounts')
      .select('id, status')
      .eq('org_id', orgId)
      .single();

    if (existing) {
      throw new ConflictException({
        code: 'STRIPE_ACCOUNT_EXISTS',
        message: 'Organization already has a Stripe account',
      });
    }

    // Get organization details for account creation
    const { data: org, error: orgError } = await this.supabase.adminClient
      .from('organizations')
      .select('name, email')
      .eq('id', orgId)
      .single();

    if (orgError || !org) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    // Create Stripe Express account
    let stripeAccount: Stripe.Account;
    try {
      stripeAccount = await this.stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: org.email || undefined,
        business_type: 'company',
        metadata: { org_id: orgId },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });
      this.logger.log(`Created Stripe account ${stripeAccount.id} for org ${orgId}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown Stripe error';
      this.logger.error(`Failed to create Stripe account: ${message}`);
      throw new BadRequestException({
        code: 'STRIPE_ACCOUNT_CREATE_FAILED',
        message: `Failed to create Stripe account: ${message}`,
      });
    }

    const stripeAccountId = stripeAccount.id;

    // Store account in database
    const { error: insertError } = await this.supabase.adminClient
      .from('stripe_accounts')
      .insert({
        org_id: orgId,
        stripe_account_id: stripeAccountId,
        status: 'pending',
        business_name: org.name,
      })
      .select()
      .single();

    if (insertError) {
      throw new BadRequestException({
        code: 'STRIPE_ACCOUNT_CREATE_FAILED',
        message: insertError.message,
      });
    }

    // Generate onboarding link
    return this.createOnboardingLink(orgId, dto);
  }

  /**
   * Create an onboarding link for incomplete account setup
   */
  async createOnboardingLink(orgId: OrgId, dto: CreateOnboardingLinkDto) {
    this.ensureStripeConfigured();

    const { data: account, error } = await this.supabase.adminClient
      .from('stripe_accounts')
      .select('stripe_account_id, status')
      .eq('org_id', orgId)
      .single();

    if (error || !account) {
      throw new NotFoundException({
        code: 'STRIPE_ACCOUNT_NOT_FOUND',
        message: 'No Stripe account found for this organization',
      });
    }

    // Create Stripe account link for onboarding
    let accountLink: Stripe.AccountLink;
    try {
      const appUrl =
        process.env['NEXT_PUBLIC_SUPABASE_URL']?.replace(':54321', ':3000') ||
        'http://localhost:3000';
      accountLink = await this.stripe.accountLinks.create({
        account: account.stripe_account_id,
        refresh_url: dto.refresh_url || `${appUrl}/stripe/refresh`,
        return_url: dto.return_url || `${appUrl}/stripe/return`,
        type: 'account_onboarding',
      });
      this.logger.log(`Created onboarding link for account ${account.stripe_account_id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown Stripe error';
      this.logger.error(`Failed to create onboarding link: ${message}`);
      throw new BadRequestException({
        code: 'STRIPE_ONBOARDING_LINK_FAILED',
        message: `Failed to create onboarding link: ${message}`,
      });
    }

    // Update status to onboarding
    await this.supabase.adminClient
      .from('stripe_accounts')
      .update({
        status: 'onboarding',
        onboarding_url: accountLink.url,
      })
      .eq('org_id', orgId);

    return {
      url: accountLink.url,
      expires_at: new Date(accountLink.expires_at * 1000).toISOString(),
    };
  }

  /**
   * Sync account status directly from Stripe
   * Useful for local development where webhooks may not work reliably
   */
  async syncAccountStatus(orgId: OrgId) {
    this.ensureStripeConfigured();

    const { data: account, error } = await this.supabase.adminClient
      .from('stripe_accounts')
      .select('stripe_account_id, status')
      .eq('org_id', orgId)
      .single();

    if (error || !account) {
      throw new NotFoundException({
        code: 'STRIPE_ACCOUNT_NOT_FOUND',
        message: 'No Stripe account found for this organization',
      });
    }

    // Fetch current status from Stripe
    let stripeAccount: Stripe.Account;
    try {
      stripeAccount = await this.stripe.accounts.retrieve(account.stripe_account_id);
      this.logger.log(
        `Synced account ${account.stripe_account_id}: charges_enabled=${stripeAccount.charges_enabled}, details_submitted=${stripeAccount.details_submitted}`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown Stripe error';
      this.logger.error(`Failed to retrieve Stripe account: ${message}`);
      throw new BadRequestException({
        code: 'STRIPE_SYNC_FAILED',
        message: `Failed to sync with Stripe: ${message}`,
      });
    }

    // Determine status based on Stripe account state
    let status: 'pending' | 'onboarding' | 'active' | 'restricted' | 'disabled';
    if (stripeAccount.charges_enabled && stripeAccount.payouts_enabled) {
      status = 'active';
    } else if (stripeAccount.details_submitted) {
      status = 'restricted'; // Submitted but not fully enabled
    } else {
      status = 'onboarding'; // Still needs to complete onboarding
    }

    // Update database with current Stripe state
    const { error: updateError } = await this.supabase.adminClient
      .from('stripe_accounts')
      .update({
        status,
        charges_enabled: stripeAccount.charges_enabled || false,
        payouts_enabled: stripeAccount.payouts_enabled || false,
        details_submitted: stripeAccount.details_submitted || false,
        country: stripeAccount.country || null,
        default_currency: stripeAccount.default_currency || null,
        business_name: stripeAccount.business_profile?.name || account.stripe_account_id,
        updated_at: new Date().toISOString(),
      })
      .eq('org_id', orgId);

    if (updateError) {
      throw new BadRequestException({
        code: 'STRIPE_SYNC_UPDATE_FAILED',
        message: updateError.message,
      });
    }

    // Return the updated status
    return this.getAccountStatus(orgId);
  }

  /**
   * Create a dashboard login link for the Express account
   */
  async createDashboardLink(orgId: OrgId, _dto: CreateDashboardLinkDto) {
    this.ensureStripeConfigured();

    const { data: account, error } = await this.supabase.adminClient
      .from('stripe_accounts')
      .select('stripe_account_id, status')
      .eq('org_id', orgId)
      .single();

    if (error || !account) {
      throw new NotFoundException({
        code: 'STRIPE_ACCOUNT_NOT_FOUND',
        message: 'No Stripe account found for this organization',
      });
    }

    if (account.status !== 'active') {
      throw new BadRequestException({
        code: 'STRIPE_ACCOUNT_NOT_ACTIVE',
        message: 'Stripe account must complete onboarding first',
      });
    }

    // Create Stripe login link for Express dashboard
    try {
      const loginLink = await this.stripe.accounts.createLoginLink(account.stripe_account_id);
      this.logger.log(`Created dashboard link for account ${account.stripe_account_id}`);
      return {
        url: loginLink.url,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown Stripe error';
      this.logger.error(`Failed to create dashboard link: ${message}`);
      throw new BadRequestException({
        code: 'STRIPE_DASHBOARD_LINK_FAILED',
        message: `Failed to create dashboard link: ${message}`,
      });
    }
  }

  /**
   * Get transaction history for an organization
   */
  async listTransactions(orgId: OrgId, filters: ListTransactionsDto) {
    // First get the stripe account
    const { data: account } = await this.supabase.adminClient
      .from('stripe_accounts')
      .select('id')
      .eq('org_id', orgId)
      .single();

    if (!account) {
      return { data: [], total: 0 };
    }

    let query = this.supabase.adminClient
      .from('stripe_transactions')
      .select('*', { count: 'exact' })
      .eq('stripe_account_id', account.id)
      .order('created_at', { ascending: false });

    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new BadRequestException({
        code: 'TRANSACTIONS_LIST_FAILED',
        message: error.message,
      });
    }

    return {
      data: data || [],
      total: count || 0,
      limit,
      offset,
    };
  }

  /**
   * Get transaction summary for an organization
   */
  async getTransactionSummary(orgId: OrgId, startDate?: string, endDate?: string) {
    const { data: account } = await this.supabase.adminClient
      .from('stripe_accounts')
      .select('id')
      .eq('org_id', orgId)
      .single();

    if (!account) {
      return {
        total_charges: 0,
        total_refunds: 0,
        total_fees: 0,
        net_revenue: 0,
        transaction_count: 0,
      };
    }

    // Use the database function for summary
    const { data, error } = await this.supabase.adminClient.rpc('get_transaction_summary', {
      p_stripe_account_id: account.id,
      p_start_date: startDate || null,
      p_end_date: endDate || null,
    });

    if (error) {
      throw new BadRequestException({
        code: 'TRANSACTION_SUMMARY_FAILED',
        message: error.message,
      });
    }

    return (
      data?.[0] || {
        total_charges: 0,
        total_refunds: 0,
        total_fees: 0,
        net_revenue: 0,
        transaction_count: 0,
      }
    );
  }

  /**
   * Get payout history for an organization
   */
  async listPayouts(orgId: OrgId, filters: ListPayoutsDto) {
    const { data: account } = await this.supabase.adminClient
      .from('stripe_accounts')
      .select('id')
      .eq('org_id', orgId)
      .single();

    if (!account) {
      return { data: [], total: 0 };
    }

    let query = this.supabase.adminClient
      .from('stripe_payouts')
      .select('*', { count: 'exact' })
      .eq('stripe_account_id', account.id)
      .order('created_at', { ascending: false });

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new BadRequestException({
        code: 'PAYOUTS_LIST_FAILED',
        message: error.message,
      });
    }

    return {
      data: data || [],
      total: count || 0,
      limit,
      offset,
    };
  }

  /**
   * Get a single transaction by ID
   */
  async getTransaction(orgId: OrgId, transactionId: string) {
    const { data: account } = await this.supabase.adminClient
      .from('stripe_accounts')
      .select('id')
      .eq('org_id', orgId)
      .single();

    if (!account) {
      throw new NotFoundException({
        code: 'STRIPE_ACCOUNT_NOT_FOUND',
        message: 'No Stripe account found',
      });
    }

    const { data, error } = await this.supabase.adminClient
      .from('stripe_transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('stripe_account_id', account.id)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'TRANSACTION_NOT_FOUND',
        message: 'Transaction not found',
      });
    }

    return data;
  }

  /**
   * Sync transactions from Stripe API
   * Pulls historical charges and stores them in the database
   */
  async syncTransactions(orgId: OrgId) {
    this.ensureStripeConfigured();

    // Get the stripe account for this org
    const { data: account, error: accountError } = await this.supabase.adminClient
      .from('stripe_accounts')
      .select('id, stripe_account_id, status')
      .eq('org_id', orgId)
      .single();

    if (accountError || !account) {
      throw new NotFoundException({
        code: 'STRIPE_ACCOUNT_NOT_FOUND',
        message: 'No Stripe account found for this organization',
      });
    }

    if (account.status !== 'active') {
      throw new BadRequestException({
        code: 'STRIPE_ACCOUNT_NOT_ACTIVE',
        message: 'Stripe account must be active to sync transactions',
      });
    }

    // Fetch charges from Stripe for this connected account
    let charges: Stripe.Charge[];
    try {
      const response = await this.stripe.charges.list(
        { limit: 100 },
        { stripeAccount: account.stripe_account_id }
      );
      charges = response.data;
      this.logger.log(
        `Fetched ${charges.length} charges from Stripe for account ${account.stripe_account_id}`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown Stripe error';
      this.logger.error(`Failed to fetch charges from Stripe: ${message}`);
      throw new BadRequestException({
        code: 'STRIPE_SYNC_FAILED',
        message: `Failed to fetch charges from Stripe: ${message}`,
      });
    }

    let syncedCount = 0;
    let skippedCount = 0;

    // Process each charge
    for (const charge of charges) {
      // Only process succeeded charges
      if (charge.status !== 'succeeded') {
        continue;
      }

      // Calculate platform fee (we don't have the original fee info, so estimate)
      const { percent } = await this.getPlatformFee(orgId);
      const platformFee = Math.round(charge.amount * (percent / 100));

      // Get Stripe's fee from the balance transaction if available
      let stripeFee = 0;
      if (charge.balance_transaction && typeof charge.balance_transaction === 'object') {
        stripeFee = charge.balance_transaction.fee || 0;
      }

      // Upsert the transaction (ignore duplicates)
      const { error: upsertError } = await this.supabase.adminClient
        .from('stripe_transactions')
        .upsert(
          {
            stripe_account_id: account.id,
            stripe_payment_intent_id: (charge.payment_intent as string) || null,
            stripe_charge_id: charge.id,
            type: 'charge',
            status: 'succeeded',
            amount: charge.amount,
            currency: charge.currency,
            platform_fee: platformFee,
            stripe_fee: stripeFee,
            net_amount: charge.amount - platformFee - stripeFee,
            description: charge.description || null,
            customer_email: charge.billing_details?.email || charge.receipt_email || null,
            metadata: charge.metadata || {},
            created_at: new Date(charge.created * 1000).toISOString(),
          },
          {
            onConflict: 'stripe_charge_id',
            ignoreDuplicates: true,
          }
        );

      if (upsertError) {
        this.logger.warn(`Failed to upsert charge ${charge.id}: ${upsertError.message}`);
        skippedCount++;
      } else {
        syncedCount++;
      }
    }

    this.logger.log(`Sync complete: ${syncedCount} synced, ${skippedCount} skipped`);

    return {
      synced_count: syncedCount,
      skipped_count: skippedCount,
      message: `Successfully synced ${syncedCount} transactions from Stripe`,
    };
  }

  /**
   * Create a refund for a transaction
   */
  async createRefund(orgId: OrgId, dto: CreateRefundDto) {
    this.ensureStripeConfigured();

    // Get the original transaction
    const transaction = await this.getTransaction(orgId, dto.transaction_id);

    if (transaction.type !== 'charge') {
      throw new BadRequestException({
        code: 'INVALID_REFUND_TARGET',
        message: 'Can only refund charge transactions',
      });
    }

    if (transaction.status !== 'succeeded') {
      throw new BadRequestException({
        code: 'TRANSACTION_NOT_REFUNDABLE',
        message: 'Can only refund succeeded transactions',
      });
    }

    const refundAmount = dto.amount || transaction.amount;

    if (refundAmount > transaction.amount) {
      throw new BadRequestException({
        code: 'REFUND_AMOUNT_TOO_HIGH',
        message: 'Refund amount cannot exceed original transaction amount',
      });
    }

    // Get the Stripe account for connected account refund
    const { data: stripeAccountData } = await this.supabase.adminClient
      .from('stripe_accounts')
      .select('stripe_account_id')
      .eq('id', transaction.stripe_account_id)
      .single();

    // Process refund through Stripe
    let stripeRefund: Stripe.Refund;
    try {
      stripeRefund = await this.stripe.refunds.create(
        {
          payment_intent: transaction.stripe_payment_intent_id,
          amount: refundAmount,
          reason: (dto.reason as Stripe.RefundCreateParams.Reason) || 'requested_by_customer',
        },
        {
          stripeAccount: stripeAccountData?.stripe_account_id,
        }
      );
      this.logger.log(`Created refund ${stripeRefund.id} for ${refundAmount} cents`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown Stripe error';
      this.logger.error(`Failed to create refund: ${message}`);
      throw new BadRequestException({
        code: 'STRIPE_REFUND_FAILED',
        message: `Failed to process refund: ${message}`,
      });
    }

    // Create refund transaction record
    const { data: refundRecord, error } = await this.supabase.adminClient
      .from('stripe_transactions')
      .insert({
        stripe_account_id: transaction.stripe_account_id,
        stripe_payment_intent_id: transaction.stripe_payment_intent_id,
        stripe_refund_id: stripeRefund.id,
        type: 'refund',
        status: stripeRefund.status || 'succeeded',
        amount: refundAmount,
        currency: transaction.currency,
        platform_fee: 0,
        stripe_fee: 0,
        net_amount: -refundAmount,
        description: dto.reason || 'Refund',
        customer_email: transaction.customer_email,
        order_id: transaction.order_id,
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException({
        code: 'REFUND_FAILED',
        message: error.message,
      });
    }

    // Update original transaction status
    const newStatus = refundAmount === transaction.amount ? 'refunded' : 'partially_refunded';
    await this.supabase.adminClient
      .from('stripe_transactions')
      .update({ status: newStatus })
      .eq('id', dto.transaction_id);

    return refundRecord;
  }
}
