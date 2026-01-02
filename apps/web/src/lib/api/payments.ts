'use client';

import { api } from './client';

// ============================================================================
// Payment Types
// ============================================================================

export type StripeAccountStatus = 'pending' | 'onboarding' | 'active' | 'restricted' | 'disabled';
export type TransactionType = 'charge' | 'refund' | 'transfer' | 'payout' | 'fee' | 'adjustment';
export type TransactionStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'partially_refunded' | 'disputed';
export type PayoutStatus = 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled';

export interface StripeAccountStatusResponse {
  is_connected: boolean;
  status: StripeAccountStatus | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  needs_onboarding: boolean;
  stripe_account_id: string | null;
  business_name: string | null;
  details_submitted?: boolean;
  country?: string;
  default_currency?: string;
}

export interface OnboardingLinkResponse {
  url: string;
  expires_at: string;
}

export interface DashboardLinkResponse {
  url: string;
}

export interface Transaction {
  id: string;
  stripe_account_id: string;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  stripe_refund_id: string | null;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  platform_fee: number;
  stripe_fee: number;
  net_amount: number;
  description: string | null;
  customer_email: string | null;
  order_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface TransactionsResponse {
  data: Transaction[];
  total: number;
  limit: number;
  offset: number;
}

export interface TransactionSummary {
  total_charges: number;
  total_refunds: number;
  total_fees: number;
  net_revenue: number;
  transaction_count: number;
}

export interface Payout {
  id: string;
  stripe_account_id: string;
  stripe_payout_id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  arrival_date: string | null;
  method: string | null;
  destination_type: string | null;
  destination_last4: string | null;
  failure_code: string | null;
  failure_message: string | null;
  created_at: string;
}

export interface PayoutsResponse {
  data: Payout[];
  total: number;
  limit: number;
  offset: number;
}

export interface TransactionFilters {
  start_date?: string;
  end_date?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  limit?: number;
  offset?: number;
}

export interface PayoutFilters {
  status?: PayoutStatus;
  limit?: number;
  offset?: number;
}

// ============================================================================
// Payments API Functions (Client-side)
// ============================================================================

/**
 * Get Stripe account status for an organization
 */
export async function getPaymentStatus(orgId: string) {
  return api.get<StripeAccountStatusResponse>(`/organizations/${orgId}/payments/status`);
}

/**
 * Create Stripe Connect account and start onboarding
 */
export async function createStripeAccount(
  orgId: string,
  data?: {
    return_url?: string;
    refresh_url?: string;
  }
) {
  return api.post<OnboardingLinkResponse>(`/organizations/${orgId}/payments/connect`, data || {});
}

/**
 * Generate new onboarding link for incomplete setup
 */
export async function createOnboardingLink(
  orgId: string,
  data?: {
    return_url?: string;
    refresh_url?: string;
  }
) {
  return api.post<OnboardingLinkResponse>(`/organizations/${orgId}/payments/onboarding-link`, data || {});
}

/**
 * Generate Stripe Express dashboard login link
 */
export async function createDashboardLink(
  orgId: string,
  data?: {
    return_url?: string;
  }
) {
  return api.post<DashboardLinkResponse>(`/organizations/${orgId}/payments/dashboard-link`, data || {});
}

/**
 * Sync Stripe account status from Stripe API
 * Useful for local development where webhooks may not work reliably
 */
export async function syncStripeAccount(orgId: string) {
  return api.post<StripeAccountStatusResponse>(`/organizations/${orgId}/payments/sync`, {});
}

export interface SyncTransactionsResponse {
  synced_count: number;
  skipped_count: number;
  message: string;
}

/**
 * Sync transactions from Stripe API
 * Pulls historical charges and stores them in the database
 */
export async function syncTransactions(orgId: string) {
  return api.post<SyncTransactionsResponse>(`/organizations/${orgId}/payments/transactions/sync`, {});
}

/**
 * Get transactions for an organization
 */
export async function getTransactions(orgId: string, filters?: TransactionFilters) {
  const params = new URLSearchParams();
  if (filters?.start_date) params.set('start_date', filters.start_date);
  if (filters?.end_date) params.set('end_date', filters.end_date);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.limit) params.set('limit', filters.limit.toString());
  if (filters?.offset) params.set('offset', filters.offset.toString());
  const query = params.toString();
  return api.get<TransactionsResponse>(`/organizations/${orgId}/payments/transactions${query ? `?${query}` : ''}`);
}

/**
 * Get transaction summary for an organization
 */
export async function getTransactionSummary(
  orgId: string,
  filters?: { start_date?: string; end_date?: string }
) {
  const params = new URLSearchParams();
  if (filters?.start_date) params.set('start_date', filters.start_date);
  if (filters?.end_date) params.set('end_date', filters.end_date);
  const query = params.toString();
  return api.get<TransactionSummary>(`/organizations/${orgId}/payments/transactions/summary${query ? `?${query}` : ''}`);
}

/**
 * Get a single transaction by ID
 */
export async function getTransaction(orgId: string, transactionId: string) {
  return api.get<Transaction>(`/organizations/${orgId}/payments/transactions/${transactionId}`);
}

/**
 * Create a refund for a transaction
 */
export async function createRefund(
  orgId: string,
  data: {
    transaction_id: string;
    amount?: number;
    reason?: string;
  }
) {
  return api.post<Transaction>(`/organizations/${orgId}/payments/refunds`, data);
}

/**
 * Get payouts for an organization
 */
export async function getPayouts(orgId: string, filters?: PayoutFilters) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.limit) params.set('limit', filters.limit.toString());
  if (filters?.offset) params.set('offset', filters.offset.toString());
  const query = params.toString();
  return api.get<PayoutsResponse>(`/organizations/${orgId}/payments/payouts${query ? `?${query}` : ''}`);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format cents to currency string
 */
export function formatCurrency(cents: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

/**
 * Get status badge variant for account status
 */
export function getAccountStatusVariant(status: StripeAccountStatus | null): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default';
    case 'onboarding':
    case 'pending':
      return 'secondary';
    case 'restricted':
      return 'outline';
    case 'disabled':
      return 'destructive';
    default:
      return 'secondary';
  }
}

/**
 * Get status badge variant for transaction status
 */
export function getTransactionStatusVariant(status: TransactionStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'succeeded':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'failed':
    case 'disputed':
      return 'destructive';
    case 'refunded':
    case 'partially_refunded':
      return 'outline';
    default:
      return 'secondary';
  }
}

/**
 * Get status badge variant for payout status
 */
export function getPayoutStatusVariant(status: PayoutStatus): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'paid':
      return 'default';
    case 'pending':
    case 'in_transit':
      return 'secondary';
    case 'failed':
      return 'destructive';
    case 'canceled':
      return 'outline';
    default:
      return 'secondary';
  }
}
