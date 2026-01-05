// Server-side API exports (for Server Components, Server Actions, Route Handlers)
export { serverApi, apiServer, type ApiError, type ApiResponse } from './server';

// Re-export types
export * from './types';

import { serverApi } from './server';
import { createClient } from '@/lib/supabase/server';
import type {
  Organization,
  OrganizationListItem,
  OrganizationMembersResponse,
  AttractionsResponse,
  Attraction,
  StaffResponse,
  StaffMember,
  Zone,
  QueueConfig,
  QueueEntriesResponse,
  QueueStats,
  QueueEntryStatus,
  NotificationTemplate,
  Notification,
  NotificationChannel,
  NotificationStatus,
  NotificationCategory,
  InAppNotification,
  NotificationPreference,
  TemplatesResponse,
  NotificationsResponse,
  InAppNotificationsResponse,
  PreferencesResponse,
} from './types';

import type { OrgRole } from '@haunt/shared';

// ============================================================================
// Org ID Resolution
// ============================================================================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Check if a string is a valid UUID
 */
export function isUUID(str: string): boolean {
  return UUID_REGEX.test(str);
}

/**
 * Resolve an org identifier (slug or UUID) to an org UUID.
 * If the identifier is already a UUID, returns it directly.
 * If it's a slug, looks up the org in the database.
 */
export async function resolveOrgId(orgIdentifier: string): Promise<string | null> {
  // If it's already a UUID, return it
  if (isUUID(orgIdentifier)) {
    return orgIdentifier;
  }

  // Otherwise, it's a slug - look it up
  const supabase = await createClient();
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('slug', orgIdentifier)
    .single();

  return org?.id ?? null;
}

/**
 * Get the current user's role in an organization.
 * Returns null if the user is not a member.
 */
export async function getCurrentUserRole(orgId: string): Promise<OrgRole | null> {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get their membership in this org
  const { data: membership } = await supabase
    .from('org_memberships')
    .select('role')
    .eq('org_id', orgId)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  return (membership?.role as OrgRole) ?? null;
}

// ============================================================================
// Organizations API (Server-side)
// ============================================================================

/**
 * Get all organizations for the current user
 */
export async function getOrganizations() {
  return serverApi.get<{ data: OrganizationListItem[] }>('/organizations');
}

/**
 * Get a single organization by ID
 */
export async function getOrganization(orgId: string) {
  return serverApi.get<Organization>(`/organizations/${orgId}`);
}

/**
 * Get members of an organization
 */
export async function getOrganizationMembers(orgId: string) {
  return serverApi.get<OrganizationMembersResponse>(`/organizations/${orgId}/members`);
}

// ============================================================================
// Attractions API (Server-side)
// ============================================================================

/**
 * Get all attractions for an organization
 */
export async function getAttractions(orgId: string) {
  return serverApi.get<AttractionsResponse>(`/organizations/${orgId}/attractions`);
}

/**
 * Get a single attraction by ID
 */
export async function getAttraction(orgId: string, attractionId: string) {
  return serverApi.get<Attraction>(`/organizations/${orgId}/attractions/${attractionId}`);
}

/**
 * Get zones for an attraction
 */
export async function getAttractionZones(orgId: string, attractionId: string) {
  return serverApi.get<{ data: Zone[] }>(`/organizations/${orgId}/attractions/${attractionId}/zones`);
}

// ============================================================================
// Attraction Types (Server-side, direct Supabase access)
// ============================================================================

export interface AttractionType {
  id: string;
  key: string;
  name: string;
  category: string | null;
  icon: string | null;
}

/**
 * Get all attraction types (uses Supabase directly as there's no API endpoint)
 */
export async function getAttractionTypes(): Promise<AttractionType[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('attraction_types')
    .select('id, key, name, category, icon')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    console.error('Failed to fetch attraction types:', error);
    return [];
  }

  return data || [];
}

// ============================================================================
// Staff API (Server-side)
// ============================================================================

/**
 * Get all staff members for an organization
 */
export async function getStaff(orgId: string, filters?: { status?: string; role?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.role) params.set('role', filters.role);
  const query = params.toString();
  return serverApi.get<StaffResponse>(`/organizations/${orgId}/staff${query ? `?${query}` : ''}`);
}

/**
 * Get a single staff member by ID
 */
export async function getStaffMember(orgId: string, staffId: string) {
  return serverApi.get<StaffMember>(`/organizations/${orgId}/staff/${staffId}`);
}

// ============================================================================
// Seasons API (Server-side)
// ============================================================================

export interface Season {
  id: string;
  attraction_id: string;
  name: string;
  year: number;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

/**
 * Get all seasons for an attraction
 */
export async function getAttractionSeasons(orgId: string, attractionId: string, filters?: { year?: number; status?: string }) {
  const params = new URLSearchParams();
  if (filters?.year) params.set('year', filters.year.toString());
  if (filters?.status) params.set('status', filters.status);
  const query = params.toString();
  return serverApi.get<{ data: Season[] }>(`/organizations/${orgId}/attractions/${attractionId}/seasons${query ? `?${query}` : ''}`);
}

// ============================================================================
// Payments API (Server-side)
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

/**
 * Get Stripe account status for an organization
 */
export async function getPaymentStatus(orgId: string) {
  return serverApi.get<StripeAccountStatusResponse>(`/organizations/${orgId}/payments/status`);
}

/**
 * Get transaction summary for an organization
 */
export async function getTransactionSummary(orgId: string, filters?: { start_date?: string; end_date?: string }) {
  const params = new URLSearchParams();
  if (filters?.start_date) params.set('start_date', filters.start_date);
  if (filters?.end_date) params.set('end_date', filters.end_date);
  const query = params.toString();
  return serverApi.get<TransactionSummary>(`/organizations/${orgId}/payments/transactions/summary${query ? `?${query}` : ''}`);
}

/**
 * Get transactions for an organization
 */
export async function getTransactions(
  orgId: string,
  filters?: {
    start_date?: string;
    end_date?: string;
    type?: TransactionType;
    status?: TransactionStatus;
    limit?: number;
    offset?: number;
  }
) {
  const params = new URLSearchParams();
  if (filters?.start_date) params.set('start_date', filters.start_date);
  if (filters?.end_date) params.set('end_date', filters.end_date);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.limit) params.set('limit', filters.limit.toString());
  if (filters?.offset) params.set('offset', filters.offset.toString());
  const query = params.toString();
  return serverApi.get<TransactionsResponse>(`/organizations/${orgId}/payments/transactions${query ? `?${query}` : ''}`);
}

/**
 * Get payouts for an organization
 */
export async function getPayouts(
  orgId: string,
  filters?: {
    status?: PayoutStatus;
    limit?: number;
    offset?: number;
  }
) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.limit) params.set('limit', filters.limit.toString());
  if (filters?.offset) params.set('offset', filters.offset.toString());
  const query = params.toString();
  return serverApi.get<PayoutsResponse>(`/organizations/${orgId}/payments/payouts${query ? `?${query}` : ''}`);
}

// ============================================================================
// Virtual Queue API (Server-side)
// ============================================================================

/**
 * Get queue config for an attraction
 */
export async function getQueueConfig(orgId: string, attractionId: string) {
  return serverApi.get<QueueConfig>(`/organizations/${orgId}/attractions/${attractionId}/queue/config`);
}

/**
 * Create queue config for an attraction
 */
export async function createQueueConfig(
  orgId: string,
  attractionId: string,
  data: {
    name: string;
    isActive?: boolean;
    capacityPerBatch?: number;
    batchIntervalMinutes?: number;
    maxWaitMinutes?: number;
    maxQueueSize?: number;
    allowRejoin?: boolean;
    requireCheckIn?: boolean;
    notificationLeadMinutes?: number;
    expiryMinutes?: number;
  }
) {
  return serverApi.post<QueueConfig>(`/organizations/${orgId}/attractions/${attractionId}/queue/config`, data);
}

/**
 * Update queue config for an attraction
 */
export async function updateQueueConfig(
  orgId: string,
  attractionId: string,
  data: Partial<{
    name: string;
    isActive: boolean;
    isPaused: boolean;
    capacityPerBatch: number;
    batchIntervalMinutes: number;
    maxWaitMinutes: number;
    maxQueueSize: number;
    allowRejoin: boolean;
    requireCheckIn: boolean;
    notificationLeadMinutes: number;
    expiryMinutes: number;
  }>
) {
  return serverApi.patch<QueueConfig>(`/organizations/${orgId}/attractions/${attractionId}/queue/config`, data);
}

/**
 * Get queue entries for an attraction
 */
export async function getQueueEntries(
  orgId: string,
  attractionId: string,
  filters?: {
    status?: QueueEntryStatus;
    search?: string;
    limit?: number;
    offset?: number;
  }
) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);
  if (filters?.limit) params.set('limit', filters.limit.toString());
  if (filters?.offset) params.set('offset', filters.offset.toString());
  const query = params.toString();
  return serverApi.get<QueueEntriesResponse>(
    `/organizations/${orgId}/attractions/${attractionId}/queue/entries${query ? `?${query}` : ''}`
  );
}

/**
 * Update a queue entry's status
 */
export async function updateQueueEntryStatus(
  orgId: string,
  attractionId: string,
  entryId: string,
  status: QueueEntryStatus,
  notes?: string
) {
  return serverApi.patch(`/organizations/${orgId}/attractions/${attractionId}/queue/entries/${entryId}/status`, {
    status,
    notes,
  });
}

/**
 * Call the next batch from the queue
 */
export async function callNextBatch(orgId: string, attractionId: string, count?: number) {
  return serverApi.post(`/organizations/${orgId}/attractions/${attractionId}/queue/call-next`, { count });
}

/**
 * Get queue statistics for an attraction
 */
export async function getQueueStats(orgId: string, attractionId: string, date?: string) {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  const query = params.toString();
  return serverApi.get<QueueStats>(
    `/organizations/${orgId}/attractions/${attractionId}/queue/stats${query ? `?${query}` : ''}`
  );
}

// ============================================================================
// Notifications API (Server-side)
// ============================================================================

/**
 * Get notification templates for an organization
 */
export async function getNotificationTemplates(orgId: string, channel?: NotificationChannel) {
  const params = new URLSearchParams();
  if (channel) params.set('channel', channel);
  const query = params.toString();
  return serverApi.get<TemplatesResponse>(`/organizations/${orgId}/notifications/templates${query ? `?${query}` : ''}`);
}

/**
 * Get a specific notification template
 */
export async function getNotificationTemplate(orgId: string, templateKey: string, channel: NotificationChannel) {
  return serverApi.get<NotificationTemplate>(`/organizations/${orgId}/notifications/templates/${templateKey}/${channel}`);
}

/**
 * Update a notification template
 */
export async function updateNotificationTemplate(
  orgId: string,
  templateId: string,
  data: {
    subject?: string;
    body?: string;
    isActive?: boolean;
  }
) {
  return serverApi.patch(`/organizations/${orgId}/notifications/templates/${templateId}`, data);
}

/**
 * Get notification history for an organization
 */
export async function getNotificationHistory(
  orgId: string,
  filters?: {
    channel?: NotificationChannel;
    status?: NotificationStatus;
    limit?: number;
    offset?: number;
  }
) {
  const params = new URLSearchParams();
  if (filters?.channel) params.set('channel', filters.channel);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.limit) params.set('limit', filters.limit.toString());
  if (filters?.offset) params.set('offset', filters.offset.toString());
  const query = params.toString();
  return serverApi.get<NotificationsResponse>(`/organizations/${orgId}/notifications/history${query ? `?${query}` : ''}`);
}

/**
 * Send a notification using a template
 */
export async function sendNotification(
  orgId: string,
  data: {
    templateKey: string;
    channel: NotificationChannel;
    recipientIds?: string[];
    recipientEmails?: string[];
    recipientPhones?: string[];
    variables?: Record<string, string>;
    scheduleAt?: string;
  }
) {
  return serverApi.post(`/organizations/${orgId}/notifications/send`, data);
}

/**
 * Send a direct notification (without template)
 */
export async function sendDirectNotification(
  orgId: string,
  data: {
    channel: 'email' | 'sms';
    email?: string;
    phone?: string;
    subject?: string;
    body: string;
    category?: NotificationCategory;
  }
) {
  return serverApi.post(`/organizations/${orgId}/notifications/send-direct`, data);
}

/**
 * Get user's in-app notifications
 */
export async function getInAppNotifications(filters?: { read?: boolean; limit?: number }) {
  const params = new URLSearchParams();
  if (filters?.read !== undefined) params.set('read', filters.read.toString());
  if (filters?.limit) params.set('limit', filters.limit.toString());
  const query = params.toString();
  return serverApi.get<InAppNotificationsResponse>(`/notifications/inbox${query ? `?${query}` : ''}`);
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  return serverApi.post(`/notifications/${notificationId}/read`, {});
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  return serverApi.post('/notifications/read-all', {});
}

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences(orgId?: string) {
  const params = new URLSearchParams();
  if (orgId) params.set('orgId', orgId);
  const query = params.toString();
  return serverApi.get<PreferencesResponse>(`/notifications/preferences${query ? `?${query}` : ''}`);
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(
  preferences: Array<{
    category: NotificationCategory;
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    pushEnabled?: boolean;
  }>,
  orgId?: string
) {
  const params = new URLSearchParams();
  if (orgId) params.set('orgId', orgId);
  const query = params.toString();
  return serverApi.patch(`/notifications/preferences${query ? `?${query}` : ''}`, { preferences });
}
