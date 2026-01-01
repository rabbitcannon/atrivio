import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type { OrgId } from '@haunt/shared';
import type {
  CreateOnboardingLinkDto,
  CreateDashboardLinkDto,
  ListTransactionsDto,
  ListPayoutsDto,
  CreateRefundDto,
} from './dto/payments.dto.js';
// Note: In production, import Stripe from 'stripe'
// import Stripe from 'stripe';

// Default platform fee if not configured
const DEFAULT_PLATFORM_FEE_PERCENT = 3.0;

@Injectable()
export class PaymentsService {
  // In production, initialize Stripe client
  // private stripe: Stripe;

  constructor(private supabase: SupabaseService) {
    // In production:
    // this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    //   apiVersion: '2023-10-16',
    // });
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

    // In production, create Stripe account:
    // const account = await this.stripe.accounts.create({
    //   type: 'express',
    //   country: 'US',
    //   email: org.email,
    //   business_type: 'company',
    //   metadata: { org_id: orgId },
    // });

    // For development, simulate account creation
    const mockStripeAccountId = `acct_${Date.now()}`;

    // Store account in database
    const { data: stripeAccount, error: insertError } = await this.supabase.adminClient
      .from('stripe_accounts')
      .insert({
        org_id: orgId,
        stripe_account_id: mockStripeAccountId,
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

    // In production:
    // const link = await this.stripe.accountLinks.create({
    //   account: account.stripe_account_id,
    //   refresh_url: dto.refresh_url || `${process.env.APP_URL}/stripe/refresh`,
    //   return_url: dto.return_url || `${process.env.APP_URL}/stripe/return`,
    //   type: 'account_onboarding',
    // });

    // For development, return mock link
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update status to onboarding
    await this.supabase.adminClient
      .from('stripe_accounts')
      .update({
        status: 'onboarding',
        onboarding_url: `https://connect.stripe.com/setup/e/${account.stripe_account_id}`,
      })
      .eq('org_id', orgId);

    return {
      url: `https://connect.stripe.com/setup/e/${account.stripe_account_id}`,
      expires_at: expiresAt.toISOString(),
    };
  }

  /**
   * Create a dashboard login link for the Express account
   */
  async createDashboardLink(orgId: OrgId, dto: CreateDashboardLinkDto) {
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

    // In production:
    // const link = await this.stripe.accounts.createLoginLink(
    //   account.stripe_account_id,
    //   { redirect_url: dto.return_url }
    // );

    // For development, return mock link
    return {
      url: `https://connect.stripe.com/express/${account.stripe_account_id}`,
    };
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

    return data?.[0] || {
      total_charges: 0,
      total_refunds: 0,
      total_fees: 0,
      net_revenue: 0,
      transaction_count: 0,
    };
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
   * Create a refund for a transaction
   */
  async createRefund(orgId: OrgId, dto: CreateRefundDto) {
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

    // In production, process refund through Stripe:
    // const refund = await this.stripe.refunds.create({
    //   payment_intent: transaction.stripe_payment_intent_id,
    //   amount: refundAmount,
    // }, {
    //   stripeAccount: account.stripe_account_id,
    // });

    // Create refund transaction record
    const { data: refundRecord, error } = await this.supabase.adminClient
      .from('stripe_transactions')
      .insert({
        stripe_account_id: transaction.stripe_account_id,
        stripe_payment_intent_id: transaction.stripe_payment_intent_id,
        stripe_refund_id: `re_${Date.now()}`,
        type: 'refund',
        status: 'succeeded',
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
