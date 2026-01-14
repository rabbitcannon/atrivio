// Server-side API exports (for Server Components, Server Actions, Route Handlers)
export { type ApiError, type ApiResponse, apiServer, serverApi } from './server';

// Re-export types
export * from './types';

import type { OrgRole } from '@atrivio/shared';
import { createClient } from '@/lib/supabase/server';
import { serverApi } from './server';
import type {
  Attraction,
  AttractionsResponse,
  InAppNotificationsResponse,
  NotificationCategory,
  NotificationChannel,
  NotificationStatus,
  NotificationsResponse,
  NotificationTemplate,
  Organization,
  OrganizationListItem,
  OrganizationMembersResponse,
  PageStatus,
  PreferencesResponse,
  PublicStorefront,
  QueueConfig,
  QueueEntriesResponse,
  QueueEntryStatus,
  QueueStats,
  StaffMember,
  StaffResponse,
  StorefrontAnnouncement,
  StorefrontDomain,
  StorefrontFaq,
  StorefrontNavigation,
  StorefrontPage,
  StorefrontSettings,
  TemplatesResponse,
  Zone,
} from './types';

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
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

/**
 * Server-side authorization check for pages.
 * Resolves orgId and validates user has one of the allowed roles.
 * Returns the resolved orgId and role if authorized, or null if not.
 */
export async function requireRole(
  orgIdentifier: string,
  allowedRoles: OrgRole[]
): Promise<{ orgId: string; role: OrgRole } | null> {
  // Resolve slug to UUID
  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) return null;

  // Get user's role in this org
  const role = await getCurrentUserRole(orgId);
  if (!role) return null;

  // Check if user has one of the allowed roles
  if (!allowedRoles.includes(role)) return null;

  return { orgId, role };
}

/**
 * Check if a feature flag is enabled for an organization.
 * Uses the Supabase RPC function directly.
 */
export async function isFeatureEnabled(orgId: string, featureKey: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase.rpc('is_feature_enabled', {
      p_flag_key: featureKey,
      p_user_id: user?.id || null,
      p_org_id: orgId,
    });

    if (error) {
      return false;
    }

    return data === true;
  } catch {
    return false;
  }
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
  return serverApi.get<{ data: Zone[] }>(
    `/organizations/${orgId}/attractions/${attractionId}/zones`
  );
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
export async function getAttractionSeasons(
  orgId: string,
  attractionId: string,
  filters?: { year?: number; status?: string }
) {
  const params = new URLSearchParams();
  if (filters?.year) params.set('year', filters.year.toString());
  if (filters?.status) params.set('status', filters.status);
  const query = params.toString();
  return serverApi.get<{ data: Season[] }>(
    `/organizations/${orgId}/attractions/${attractionId}/seasons${query ? `?${query}` : ''}`
  );
}

// ============================================================================
// Payments API (Server-side)
// ============================================================================

export type StripeAccountStatus = 'pending' | 'onboarding' | 'active' | 'restricted' | 'disabled';
export type TransactionType = 'charge' | 'refund' | 'transfer' | 'payout' | 'fee' | 'adjustment';
export type TransactionStatus =
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'
  | 'disputed';
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
export async function getTransactionSummary(
  orgId: string,
  filters?: { start_date?: string; end_date?: string }
) {
  const params = new URLSearchParams();
  if (filters?.start_date) params.set('start_date', filters.start_date);
  if (filters?.end_date) params.set('end_date', filters.end_date);
  const query = params.toString();
  return serverApi.get<TransactionSummary>(
    `/organizations/${orgId}/payments/transactions/summary${query ? `?${query}` : ''}`
  );
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
  return serverApi.get<TransactionsResponse>(
    `/organizations/${orgId}/payments/transactions${query ? `?${query}` : ''}`
  );
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
  return serverApi.get<PayoutsResponse>(
    `/organizations/${orgId}/payments/payouts${query ? `?${query}` : ''}`
  );
}

// ============================================================================
// Virtual Queue API (Server-side)
// ============================================================================

/**
 * Get queue config for an attraction
 */
export async function getQueueConfig(orgId: string, attractionId: string) {
  return serverApi.get<QueueConfig>(
    `/organizations/${orgId}/attractions/${attractionId}/queue/config`
  );
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
  return serverApi.post<QueueConfig>(
    `/organizations/${orgId}/attractions/${attractionId}/queue/config`,
    data
  );
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
  return serverApi.patch<QueueConfig>(
    `/organizations/${orgId}/attractions/${attractionId}/queue/config`,
    data
  );
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
  return serverApi.patch(
    `/organizations/${orgId}/attractions/${attractionId}/queue/entries/${entryId}/status`,
    {
      status,
      notes,
    }
  );
}

/**
 * Call the next batch from the queue
 */
export async function callNextBatch(orgId: string, attractionId: string, count?: number) {
  return serverApi.post(`/organizations/${orgId}/attractions/${attractionId}/queue/call-next`, {
    count,
  });
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
  return serverApi.get<TemplatesResponse>(
    `/organizations/${orgId}/notifications/templates${query ? `?${query}` : ''}`
  );
}

/**
 * Get a specific notification template
 */
export async function getNotificationTemplate(
  orgId: string,
  templateKey: string,
  channel: NotificationChannel
) {
  return serverApi.get<NotificationTemplate>(
    `/organizations/${orgId}/notifications/templates/${templateKey}/${channel}`
  );
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
  return serverApi.get<NotificationsResponse>(
    `/organizations/${orgId}/notifications/history${query ? `?${query}` : ''}`
  );
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
  return serverApi.get<InAppNotificationsResponse>(
    `/notifications/inbox${query ? `?${query}` : ''}`
  );
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
  return serverApi.get<PreferencesResponse>(
    `/notifications/preferences${query ? `?${query}` : ''}`
  );
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

// ============================================================================
// Storefronts API (Server-side) - Per-Attraction Scoped
// ============================================================================

/**
 * Get storefront settings for an attraction
 */
export async function getStorefrontSettings(orgId: string, attractionId: string) {
  return serverApi.get<{ settings: StorefrontSettings }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront`
  );
}

/**
 * Update storefront settings
 */
export async function updateStorefrontSettings(
  orgId: string,
  attractionId: string,
  data: {
    tagline?: string;
    description?: string;
    hero?: {
      imageUrl?: string;
      videoUrl?: string;
      title?: string;
      subtitle?: string;
    };
    theme?: {
      preset?: string;
      primaryColor?: string;
      secondaryColor?: string;
      accentColor?: string;
      backgroundColor?: string;
      textColor?: string;
      fontHeading?: string;
      fontBody?: string;
      customCss?: string;
    };
    social?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      tiktok?: string;
      youtube?: string;
    };
    seo?: {
      title?: string;
      description?: string;
      keywords?: string[];
      ogImageUrl?: string;
    };
    analytics?: {
      googleAnalyticsId?: string;
      facebookPixelId?: string;
      customHeadScripts?: string;
    };
    features?: {
      showAttractions?: boolean;
      showCalendar?: boolean;
      showFaq?: boolean;
      showReviews?: boolean;
      featuredAttractionIds?: string[];
    };
    showAddress?: boolean;
    showPhone?: boolean;
    showEmail?: boolean;
  }
) {
  return serverApi.patch<{ settings: StorefrontSettings }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront`,
    data
  );
}

/**
 * Publish storefront
 */
export async function publishStorefront(orgId: string, attractionId: string) {
  return serverApi.post<{ published: boolean; publishedAt: string }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/publish`,
    {}
  );
}

/**
 * Unpublish storefront
 */
export async function unpublishStorefront(orgId: string, attractionId: string) {
  return serverApi.post<{ published: boolean }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/unpublish`,
    {}
  );
}

/**
 * Get storefront preview URL
 */
export async function getStorefrontPreviewUrl(orgId: string, attractionId: string) {
  return serverApi.get<{ previewUrl: string }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/preview`
  );
}

// ===================== Storefront Pages =====================

/**
 * Get storefront pages
 */
export async function getStorefrontPages(orgId: string, attractionId: string, status?: PageStatus) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  const query = params.toString();
  return serverApi.get<{ pages: StorefrontPage[] }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/pages${query ? `?${query}` : ''}`
  );
}

/**
 * Get a single storefront page
 */
export async function getStorefrontPage(orgId: string, attractionId: string, pageId: string) {
  return serverApi.get<{ page: StorefrontPage }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/pages/${pageId}`
  );
}

/**
 * Create a storefront page
 */
export async function createStorefrontPage(
  orgId: string,
  attractionId: string,
  data: {
    pageType: string;
    slug?: string;
    title: string;
    content?: string;
    contentFormat?: string;
    metaTitle?: string;
    metaDescription?: string;
    ogImageUrl?: string;
    featuredImageUrl?: string;
    status?: string;
    sortOrder?: number;
    showInNav?: boolean;
  }
) {
  // Transform to snake_case for API
  const payload: Record<string, unknown> = {
    page_type: data.pageType,
    title: data.title,
  };
  if (data.slug !== undefined) payload.slug = data.slug;
  if (data.content !== undefined) payload.content = data.content;
  if (data.contentFormat !== undefined) payload.content_format = data.contentFormat;
  if (data.featuredImageUrl !== undefined) payload.featured_image_url = data.featuredImageUrl;
  if (data.status !== undefined) payload.status = data.status;
  if (data.sortOrder !== undefined) payload.sort_order = data.sortOrder;
  if (data.showInNav !== undefined) payload.show_in_nav = data.showInNav;

  // SEO fields are nested
  if (data.metaTitle !== undefined || data.metaDescription !== undefined || data.ogImageUrl !== undefined) {
    payload.seo = {
      ...(data.metaTitle !== undefined && { title: data.metaTitle }),
      ...(data.metaDescription !== undefined && { description: data.metaDescription }),
      ...(data.ogImageUrl !== undefined && { og_image_url: data.ogImageUrl }),
    };
  }

  return serverApi.post<{ page: StorefrontPage }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/pages`,
    payload
  );
}

/**
 * Update a storefront page
 */
export async function updateStorefrontPage(
  orgId: string,
  attractionId: string,
  pageId: string,
  data: Partial<{
    slug: string;
    title: string;
    content: string;
    contentFormat: string;
    metaTitle: string;
    metaDescription: string;
    ogImageUrl: string;
    featuredImageUrl: string;
    status: string;
    sortOrder: number;
    showInNav: boolean;
  }>
) {
  // Transform to snake_case for API
  const payload: Record<string, unknown> = {};
  if (data.slug !== undefined) payload.slug = data.slug;
  if (data.title !== undefined) payload.title = data.title;
  if (data.content !== undefined) payload.content = data.content;
  if (data.contentFormat !== undefined) payload.content_format = data.contentFormat;
  if (data.featuredImageUrl !== undefined) payload.featured_image_url = data.featuredImageUrl;
  if (data.status !== undefined) payload.status = data.status;
  if (data.sortOrder !== undefined) payload.sort_order = data.sortOrder;
  if (data.showInNav !== undefined) payload.show_in_nav = data.showInNav;

  // SEO fields are nested
  if (data.metaTitle !== undefined || data.metaDescription !== undefined || data.ogImageUrl !== undefined) {
    payload.seo = {
      ...(data.metaTitle !== undefined && { title: data.metaTitle }),
      ...(data.metaDescription !== undefined && { description: data.metaDescription }),
      ...(data.ogImageUrl !== undefined && { og_image_url: data.ogImageUrl }),
    };
  }

  return serverApi.patch<{ page: StorefrontPage }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/pages/${pageId}`,
    payload
  );
}

/**
 * Delete a storefront page
 */
export async function deleteStorefrontPage(orgId: string, attractionId: string, pageId: string) {
  return serverApi.delete(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/pages/${pageId}`
  );
}

// ===================== Storefront Domains =====================

/**
 * Get storefront domains
 */
export async function getStorefrontDomains(orgId: string, attractionId: string) {
  return serverApi.get<{ domains: StorefrontDomain[] }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/domains`
  );
}

/**
 * Add a custom domain
 */
export async function addStorefrontDomain(orgId: string, attractionId: string, domain: string) {
  return serverApi.post<{ domain: StorefrontDomain }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/domains`,
    { domain }
  );
}

/**
 * Verify a domain
 */
export async function verifyStorefrontDomain(
  orgId: string,
  attractionId: string,
  domainId: string
) {
  return serverApi.post<{ domain: StorefrontDomain }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/domains/${domainId}/verify`,
    {}
  );
}

/**
 * Set primary domain
 */
export async function setStorefrontPrimaryDomain(
  orgId: string,
  attractionId: string,
  domainId: string
) {
  return serverApi.post<{ success: boolean }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/domains/${domainId}/set-primary`,
    {}
  );
}

/**
 * Delete a domain
 */
export async function deleteStorefrontDomain(
  orgId: string,
  attractionId: string,
  domainId: string
) {
  return serverApi.delete(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/domains/${domainId}`
  );
}

/**
 * Get domain limits for organization
 */
export async function getStorefrontDomainLimits(orgId: string, attractionId: string) {
  return serverApi.get<{
    limits: {
      customDomainCount: number;
      customDomainLimit: number;
      remaining: number;
      customDomainsByAttraction: Array<{
        attractionId: string;
        attractionName: string;
        domains: string[];
      }>;
    };
  }>(`/organizations/${orgId}/attractions/${attractionId}/storefront/domains/limits`);
}

// ===================== Storefront FAQs =====================

/**
 * Get storefront FAQs
 */
export async function getStorefrontFaqs(orgId: string, attractionId: string, category?: string) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  const query = params.toString();
  return serverApi.get<{ faqs: StorefrontFaq[] }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/faqs${query ? `?${query}` : ''}`
  );
}

/**
 * Create a FAQ
 */
export async function createStorefrontFaq(
  orgId: string,
  attractionId: string,
  data: {
    question: string;
    answer: string;
    category?: string;
    isFeatured?: boolean;
  }
) {
  return serverApi.post<{ faq: StorefrontFaq }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/faqs`,
    data
  );
}

/**
 * Update a FAQ
 */
export async function updateStorefrontFaq(
  orgId: string,
  attractionId: string,
  faqId: string,
  data: Partial<{
    question: string;
    answer: string;
    category: string;
    isFeatured: boolean;
    isActive: boolean;
  }>
) {
  return serverApi.patch<{ faq: StorefrontFaq }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/faqs/${faqId}`,
    data
  );
}

/**
 * Delete a FAQ
 */
export async function deleteStorefrontFaq(orgId: string, attractionId: string, faqId: string) {
  return serverApi.delete(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/faqs/${faqId}`
  );
}

/**
 * Reorder FAQs
 */
export async function reorderStorefrontFaqs(
  orgId: string,
  attractionId: string,
  order: Array<{ id: string; sortOrder: number }>
) {
  return serverApi.post<{ success: boolean }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/faqs/reorder`,
    { order }
  );
}

// ===================== Storefront Announcements =====================

/**
 * Get storefront announcements
 */
export async function getStorefrontAnnouncements(orgId: string, attractionId: string) {
  return serverApi.get<{ announcements: StorefrontAnnouncement[] }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/announcements`
  );
}

/**
 * Create an announcement
 */
export async function createStorefrontAnnouncement(
  orgId: string,
  attractionId: string,
  data: {
    title: string;
    content: string;
    announcementType?: string;
    startsAt?: string;
    endsAt?: string;
    showOnHome?: boolean;
  }
) {
  return serverApi.post<{ announcement: StorefrontAnnouncement }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/announcements`,
    data
  );
}

/**
 * Update an announcement
 */
export async function updateStorefrontAnnouncement(
  orgId: string,
  attractionId: string,
  announcementId: string,
  data: Partial<{
    title: string;
    content: string;
    announcementType: string;
    startsAt: string;
    endsAt: string;
    isActive: boolean;
    showOnHome: boolean;
  }>
) {
  return serverApi.patch<{ announcement: StorefrontAnnouncement }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/announcements/${announcementId}`,
    data
  );
}

/**
 * Delete an announcement
 */
export async function deleteStorefrontAnnouncement(
  orgId: string,
  attractionId: string,
  announcementId: string
) {
  return serverApi.delete(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/announcements/${announcementId}`
  );
}

// ===================== Storefront Navigation =====================

/**
 * Get storefront navigation
 */
export async function getStorefrontNavigation(orgId: string, attractionId: string) {
  return serverApi.get<{ navigation: StorefrontNavigation }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/navigation`
  );
}

/**
 * Input type for navigation items (camelCase for frontend convenience)
 */
interface NavItemInput {
  label: string;
  linkType: 'home' | 'page' | 'tickets' | 'faq' | 'external';
  pageId?: string;
  externalUrl?: string;
  openInNewTab?: boolean;
}

/**
 * Transform navigation item from frontend format to API format (snake_case)
 */
function transformNavItem(item: NavItemInput) {
  return {
    label: item.label,
    link_type: item.linkType,
    page_id: item.pageId || undefined,
    external_url: item.externalUrl || undefined,
    open_in_new_tab: item.openInNewTab ?? false,
  };
}

/**
 * Update storefront navigation
 */
export async function updateStorefrontNavigation(
  orgId: string,
  attractionId: string,
  navigation: {
    header: NavItemInput[];
    footer: NavItemInput[];
  }
) {
  // Transform from frontend camelCase to API snake_case
  const payload = {
    header: navigation.header.map(transformNavItem),
    footer: navigation.footer.map(transformNavItem),
  };

  return serverApi.put<{ navigation: StorefrontNavigation }>(
    `/organizations/${orgId}/attractions/${attractionId}/storefront/navigation`,
    payload
  );
}

// ===================== Public Storefront =====================

/**
 * Get public storefront by identifier (slug or domain)
 */
export async function getPublicStorefront(identifier: string) {
  return serverApi.get<PublicStorefront>(`/storefronts/${identifier}`);
}

/**
 * Get public page by identifier and slug
 */
export async function getPublicStorefrontPage(identifier: string, slug: string) {
  return serverApi.get<{ page: StorefrontPage }>(`/storefronts/${identifier}/pages/${slug}`);
}

/**
 * Get public FAQs by identifier (attraction slug or domain)
 */
export async function getPublicStorefrontFaqs(identifier: string, category?: string) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  const query = params.toString();
  return serverApi.get<{ faqs: StorefrontFaq[] }>(
    `/storefronts/${identifier}/faqs${query ? `?${query}` : ''}`
  );
}

/**
 * Get public ticket types for a storefront
 */
export async function getPublicTicketTypes(identifier: string) {
  return serverApi.get<{ ticketTypes: import('./types').PublicTicketType[] }>(
    `/storefronts/${identifier}/tickets`
  );
}

// ===================== Public Checkout =====================
// These functions are used from client components and don't require auth

const PUBLIC_API_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001/api/v1';

export interface CheckoutItem {
  ticketTypeId: string;
  timeSlotId?: string;
  quantity: number;
}

export interface CreateCheckoutSessionRequest {
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  items: CheckoutItem[];
  promoCode?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  checkoutUrl: string;
  sessionId: string;
  orderId: string;
  orderNumber: string;
  total: number;
  platformFee: number;
  currency: string;
}

export interface VerifiedCheckout {
  success: boolean;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    customerEmail: string;
    tickets: Array<{
      id: string;
      ticketNumber: string;
      barcode: string;
    }>;
  };
}

/** @deprecated Use VerifiedCheckout instead */
export interface ConfirmPaymentRequest {
  paymentIntentId: string;
  waiverAccepted?: boolean;
  customerName?: string;
}

/** @deprecated Use VerifiedCheckout instead */
export interface OrderConfirmation {
  success: boolean;
  order: {
    id: string;
    orderNumber: string;
    status: string;
    tickets: Array<{
      id: string;
      ticketNumber: string;
      barcode: string;
    }>;
  };
}

export interface OrderStatus {
  orderId: string;
  orderNumber: string;
  status: string;
  total: number;
  ticketCount: number;
  customerEmail: string;
}

/**
 * Create a Stripe Checkout session for ticket purchase (public, no auth required)
 * Returns a checkout URL to redirect the customer to Stripe's hosted checkout
 */
export async function createCheckoutSession(
  identifier: string,
  data: CreateCheckoutSessionRequest
): Promise<CheckoutSession> {
  const response = await fetch(`${PUBLIC_API_URL}/storefronts/${identifier}/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Checkout failed' }));
    throw new Error(error.message || 'Failed to create checkout session');
  }

  return response.json();
}

/**
 * Verify a Stripe Checkout session and complete the order (public, no auth required)
 * Call this after Stripe redirects back to the success page
 */
export async function verifyCheckoutSession(
  identifier: string,
  sessionId: string
): Promise<VerifiedCheckout> {
  const response = await fetch(
    `${PUBLIC_API_URL}/storefronts/${identifier}/checkout/verify/${sessionId}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Verification failed' }));
    throw new Error(error.message || 'Failed to verify checkout session');
  }

  return response.json();
}

/**
 * @deprecated Use verifyCheckoutSession instead
 */
export async function confirmPayment(
  identifier: string,
  data: ConfirmPaymentRequest
): Promise<OrderConfirmation> {
  const response = await fetch(`${PUBLIC_API_URL}/storefronts/${identifier}/checkout/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Payment confirmation failed' }));
    throw new Error(error.message || 'Failed to confirm payment');
  }

  return response.json();
}

/**
 * Get order status by order ID or payment intent ID (public, no auth required)
 */
export async function getOrderStatus(
  identifier: string,
  orderIdOrPaymentIntent: string
): Promise<OrderStatus> {
  const response = await fetch(
    `${PUBLIC_API_URL}/storefronts/${identifier}/checkout/status/${orderIdOrPaymentIntent}`
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Order not found' }));
    throw new Error(error.message || 'Failed to get order status');
  }

  return response.json();
}

/**
 * Cancel a pending checkout (public, no auth required)
 */
export async function cancelCheckout(
  identifier: string,
  paymentIntentId: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${PUBLIC_API_URL}/storefronts/${identifier}/checkout/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentIntentId }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Cancel failed' }));
    throw new Error(error.message || 'Failed to cancel checkout');
  }

  return response.json();
}
