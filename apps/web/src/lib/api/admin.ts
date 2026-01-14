'use client';

import { api } from './client';

// ============================================================================
// ADMIN TYPES
// ============================================================================

export interface AdminDashboardStats {
  stats: {
    total_users: number;
    total_organizations: number;
    total_attractions: number;
    active_seasons: number;
    tickets_sold_today: number;
    revenue_today: number;
  };
  growth: {
    users_7d: number;
    users_30d: number;
    orgs_7d: number;
    orgs_30d: number;
  };
  health: Record<string, string>;
  recent_activity: Array<{
    action: string;
    resource_type: string;
    created_at: string;
    actor: { first_name: string; last_name: string; email: string } | null;
  }>;
}

export interface AdminUser {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  is_super_admin: boolean;
  created_at: string;
  updated_at: string;
  org_count?: number;
  organizations?: Array<{ id: string; name: string; role: string }>;
  audit_summary?: {
    recent_actions: number;
    last_action_at: string | null;
  };
}

export interface AdminUserListResponse {
  data: AdminUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface AdminOrg {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended' | 'deleted';
  owner: { id: string; email: string; name: string } | null;
  member_count: number;
  attraction_count: number;
  stripe_connected: boolean;
  total_revenue: number;
  created_at: string;
}

export interface AdminOrgDetail extends AdminOrg {
  members: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    is_owner: boolean;
  }>;
  attractions: Array<{ id: string; name: string; status: string }>;
  stats: {
    total_tickets_sold: number;
    total_revenue: number;
    active_staff: number;
  };
}

export interface AdminOrgListResponse {
  data: AdminOrg[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  org_count: number;
  user_count: number;
  metadata?: Record<string, unknown>;
  updated_at: string;
}

export interface FeatureFlagDetail {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  org_ids: string[];
  user_ids: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlagListResponse {
  flags: FeatureFlag[];
}

export interface PlatformSetting {
  key: string;
  value: unknown;
  default_value?: unknown;
  value_type: string;
  category: string;
  description: string | null;
  updated_at: string;
}

export interface PlatformSettingsResponse {
  settings: PlatformSetting[];
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'critical' | 'maintenance' | 'feature';
  active: boolean;
  target_roles: string[];
  target_org_ids: string[];
  starts_at: string | null;
  ends_at: string | null;
  expires_at: string | null;
  is_dismissible: boolean;
  created_by: string;
  created_at: string;
  view_count: number;
  dismiss_count: number;
}

export interface AnnouncementListResponse {
  announcements: Announcement[];
}

export interface AuditLog {
  id: string;
  actor: { id: string; email: string; name: string } | null;
  actor_type: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  target_type: string | null;
  target_id: string | null;
  org_id: string | null;
  changes: Record<string, { from: unknown; to: unknown }> | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogListResponse {
  data: AuditLog[];
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ServiceStatus {
  status: string;
  latency_ms?: number;
  message?: string;
  last_check?: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  // Services can be either an object (from API) or array (after transformation)
  services: Record<string, ServiceStatus> | Array<ServiceStatus & { name: string }>;
  metrics: {
    uptime_seconds?: number;
    memory?: {
      used: number;
      total: number;
    };
    cpu?: {
      load_average: number[];
      cores: number;
    };
    database?: {
      active_connections: number;
      max_connections: number;
      pool_size: number;
    };
    requests?: {
      total: number;
      errors: number;
      avg_response_ms: number;
    };
    requests_per_minute?: number;
    error_rate?: number;
    avg_response_time_ms?: number;
  };
}

export interface RateLimitRule {
  id: string;
  name: string;
  endpoint_pattern: string;
  requests_per_minute: number;
  requests_per_hour: number | null;
  burst_limit: number | null;
  applies_to: 'all' | 'authenticated' | 'anonymous' | 'specific_orgs';
  org_ids: string[];
  enabled: boolean;
  created_at: string;
}

export interface RateLimitListResponse {
  rules: RateLimitRule[];
}

// ============================================================================
// ADMIN API FUNCTIONS
// ============================================================================

// Dashboard
export async function getAdminDashboard() {
  return api.get<AdminDashboardStats>('/admin/dashboard');
}

// Users
export async function getAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  is_super_admin?: boolean;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.search) searchParams.set('search', params.search);
  if (params?.is_super_admin !== undefined)
    searchParams.set('is_super_admin', String(params.is_super_admin));
  const query = searchParams.toString();
  return api.get<AdminUserListResponse>(`/admin/users${query ? `?${query}` : ''}`);
}

export async function getAdminUser(userId: string) {
  return api.get<AdminUser>(`/admin/users/${userId}`);
}

export async function updateAdminUser(userId: string, data: { is_super_admin?: boolean }) {
  return api.patch<AdminUser>(`/admin/users/${userId}`, data);
}

export async function deleteAdminUser(
  userId: string,
  _data: { confirm: boolean; reason?: string }
) {
  return api.delete<{ message: string; id: string }>(`/admin/users/${userId}`);
}

// Organizations
export async function getAdminOrganizations(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'suspended' | 'deleted';
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.search) searchParams.set('search', params.search);
  if (params?.status) searchParams.set('status', params.status);
  const query = searchParams.toString();
  return api.get<AdminOrgListResponse>(`/admin/organizations${query ? `?${query}` : ''}`);
}

export async function getAdminOrganization(orgId: string) {
  return api.get<AdminOrgDetail>(`/admin/organizations/${orgId}`);
}

export async function suspendOrganization(
  orgId: string,
  data: { reason: string; notify_owner?: boolean }
) {
  return api.post<{ message: string; id: string; reason: string }>(
    `/admin/organizations/${orgId}/suspend`,
    data
  );
}

export async function reactivateOrganization(orgId: string) {
  return api.post<{ message: string; id: string }>(`/admin/organizations/${orgId}/reactivate`, {});
}

// Feature Flags
export async function getFeatureFlags() {
  return api.get<FeatureFlagListResponse>('/admin/feature-flags');
}

export async function getFeatureFlag(flagId: string) {
  return api.get<FeatureFlagDetail>(`/admin/feature-flags/${flagId}`);
}

export async function createFeatureFlag(data: {
  key: string;
  name: string;
  description?: string;
  enabled?: boolean;
}) {
  return api.post<FeatureFlag>('/admin/feature-flags', data);
}

export async function updateFeatureFlag(
  flagId: string,
  data: {
    name?: string;
    description?: string;
    enabled?: boolean;
    org_ids?: string[];
    user_ids?: string[];
    metadata?: Record<string, unknown>;
  }
) {
  return api.patch<FeatureFlagDetail>(`/admin/feature-flags/${flagId}`, data);
}

export async function deleteFeatureFlag(flagId: string) {
  return api.delete<{ message: string; id: string }>(`/admin/feature-flags/${flagId}`);
}

// Platform Settings
export async function getPlatformSettings() {
  return api.get<PlatformSettingsResponse>('/admin/settings');
}

// Alias for backwards compatibility
export const getSettings = getPlatformSettings;

export async function updatePlatformSetting(key: string, data: { value: unknown }) {
  return api.patch<{ key: string; value: unknown; message: string }>(
    `/admin/settings/${key}`,
    data
  );
}

// Alias for backwards compatibility
export const updateSetting = updatePlatformSetting;

export async function setMaintenanceMode(data: {
  enabled: boolean;
  message?: string;
  allow_admins?: boolean;
}) {
  return api.post<{ key: string; value: unknown; message: string }>(
    '/admin/settings/maintenance',
    data
  );
}

// Announcements
export async function getAnnouncements() {
  return api.get<AnnouncementListResponse>('/admin/announcements');
}

export async function createAnnouncement(data: {
  title: string;
  content: string;
  type?: 'info' | 'warning' | 'critical' | 'maintenance' | 'feature';
  active?: boolean;
  target_roles?: string[];
  starts_at?: string;
  expires_at?: string;
  is_dismissible?: boolean;
}) {
  return api.post<Announcement>('/admin/announcements', data);
}

export async function updateAnnouncement(
  announcementId: string,
  data: { title?: string; content?: string; active?: boolean; expires_at?: string }
) {
  return api.patch<Announcement>(`/admin/announcements/${announcementId}`, data);
}

export async function deleteAnnouncement(announcementId: string) {
  return api.delete<{ message: string; id: string }>(`/admin/announcements/${announcementId}`);
}

// Audit Logs
export async function getAuditLogs(params?: {
  page?: number;
  limit?: number;
  search?: string;
  actor_id?: string;
  org_id?: string;
  action?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.search) searchParams.set('search', params.search);
  if (params?.actor_id) searchParams.set('actor_id', params.actor_id);
  if (params?.org_id) searchParams.set('org_id', params.org_id);
  if (params?.action) searchParams.set('action', params.action);
  if (params?.resource_type) searchParams.set('resource_type', params.resource_type);
  if (params?.start_date) searchParams.set('start_date', params.start_date);
  if (params?.end_date) searchParams.set('end_date', params.end_date);
  const query = searchParams.toString();
  return api.get<AuditLogListResponse>(`/admin/audit-logs${query ? `?${query}` : ''}`);
}

// System Health
export async function getSystemHealth() {
  return api.get<SystemHealth>('/admin/health');
}

// Rate Limits
export async function getRateLimits() {
  return api.get<RateLimitListResponse>('/admin/rate-limits');
}

export async function createRateLimit(data: {
  name: string;
  endpoint_pattern: string;
  requests_per_minute: number;
  requests_per_hour?: number;
  burst_limit?: number;
  applies_to?: 'all' | 'authenticated' | 'anonymous' | 'specific_orgs';
}) {
  return api.post<RateLimitRule>('/admin/rate-limits', data);
}

export async function updateRateLimit(
  ruleId: string,
  data: { enabled?: boolean; requests_per_minute?: number }
) {
  return api.patch<RateLimitRule>(`/admin/rate-limits/${ruleId}`, data);
}

export async function deleteRateLimit(ruleId: string) {
  return api.delete<{ message: string; id: string }>(`/admin/rate-limits/${ruleId}`);
}

// ============================================================================
// TRAFFIC MONITORING
// ============================================================================

export interface EndpointStats {
  endpoint: string;
  requestCount: number;
  uniqueUsers: number;
  uniqueIps: number;
  requestsPerMinute: number;
}

export interface UserTrafficStats {
  userId: string;
  email?: string;
  requestCount: number;
  topEndpoints: { endpoint: string; count: number }[];
  wouldBeThrottled: boolean;
  throttleDetails?: {
    endpoint: string;
    limit: number;
    actual: number;
  };
}

export interface ThrottleEvent {
  userId: string | null;
  ip: string;
  endpoint: string;
  ruleName: string;
  limit: number;
  actual: number;
  timestamp: number;
}

export interface TrafficStats {
  totalRequests: number;
  requestsPerMinute: number;
  topEndpoints: EndpointStats[];
  topUsers: UserTrafficStats[];
  recentThrottleEvents: ThrottleEvent[];
  trafficOverTime: { minute: number; count: number }[];
}

export interface RealTimeTrafficStats {
  currentMinuteRequests: number;
  activeUsers: number;
  activeIps: number;
  throttleEventsLastHour: number;
}

export async function getTrafficStats(windowMinutes: number = 60) {
  return api.get<TrafficStats>(`/admin/traffic?window=${windowMinutes}`);
}

export async function getRealTimeTraffic() {
  return api.get<RealTimeTrafficStats>('/admin/traffic/realtime');
}

// Platform Fee
export interface OrgPlatformFee {
  org_id: string;
  org_name: string;
  platform_fee_percent: number;
  is_custom: boolean;
  custom_fee: number | null;
  global_default: number;
}

export async function getOrgPlatformFee(orgId: string) {
  return api.get<OrgPlatformFee>(`/admin/organizations/${orgId}/platform-fee`);
}

export async function setOrgPlatformFee(
  orgId: string,
  data: { platform_fee_percent: number | null }
) {
  return api.patch<OrgPlatformFee>(`/admin/organizations/${orgId}/platform-fee`, data);
}

// Organization Features
export interface OrgFeature {
  id: string;
  key: string;
  name: string;
  description: string | null;
  tier: string;
  enabled_for_org: boolean;
  globally_enabled: boolean;
  accessible: boolean;
}

export interface OrgFeaturesResponse {
  org_id: string;
  org_name: string;
  features: OrgFeature[];
}

export interface ToggleOrgFeatureResponse {
  message: string;
  org_id: string;
  flag_key: string;
  enabled: boolean;
}

export async function getOrgFeatures(orgId: string) {
  return api.get<OrgFeaturesResponse>(`/admin/organizations/${orgId}/features`);
}

export async function toggleOrgFeature(orgId: string, flagKey: string, enabled: boolean) {
  return api.post<ToggleOrgFeatureResponse>(`/admin/organizations/${orgId}/features`, {
    flag_key: flagKey,
    enabled,
  });
}

// ============================================================================
// PLATFORM REVENUE
// ============================================================================

export interface RevenueSummary {
  summary: {
    total_platform_fees: number;
    total_transactions: number;
    total_gross_volume: number;
  };
  periods: {
    today: { fees: number; transactions: number };
    last_7_days: { fees: number; transactions: number };
    last_30_days: { fees: number; transactions: number };
    this_month: { fees: number };
  };
}

export interface RevenueByOrg {
  organizations: Array<{
    org_id: string;
    org_name: string;
    org_slug: string;
    stripe_account_id: string | null;
    total_platform_fees: number;
    total_transactions: number;
    total_gross_volume: number;
    avg_transaction_amount: number;
    platform_fee_percent: number;
  }>;
  meta: { page: number; limit: number };
}

export interface RevenueTrend {
  trend: Array<{
    date: string;
    platform_fees: number;
    transaction_count: number;
    gross_volume: number;
  }>;
  period_days: number;
}

export async function getRevenueSummary() {
  return api.get<RevenueSummary>('/admin/revenue');
}

export async function getRevenueByOrg(params?: {
  page?: number;
  limit?: number;
  start_date?: string;
  end_date?: string;
}) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.start_date) searchParams.set('start_date', params.start_date);
  if (params?.end_date) searchParams.set('end_date', params.end_date);
  const query = searchParams.toString();
  return api.get<RevenueByOrg>(`/admin/revenue/by-org${query ? `?${query}` : ''}`);
}

export async function getRevenueTrend(days: number = 30) {
  return api.get<RevenueTrend>(`/admin/revenue/trend?days=${days}`);
}

export interface SyncTransactionsResult {
  message: string;
  application_fees_found: number;
  total_synced: number;
  connected_accounts: number;
  errors?: string[];
}

export async function syncAllTransactions() {
  return api.post<SyncTransactionsResult>('/admin/revenue/sync', {});
}

// ============================================================================
// SUBSCRIPTION TIERS
// ============================================================================

export interface SubscriptionTierConfig {
  tier: 'free' | 'pro' | 'enterprise';
  name: string;
  description: string;
  monthlyPriceCents: number;
  monthlyPrice: string;
  transactionFeePercentage: number;
  transactionFeeFixedCents: number;
  transactionFee: string;
  limits: {
    customDomains: number;
    attractions: number;
    staffMembers: number;
  };
  features: string[];
  isActive: boolean;
  displayOrder: number;
  metadata: Record<string, unknown>;
  stripePriceId: string | null;
  organizationsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionTiersResponse {
  tiers: SubscriptionTierConfig[];
}

export interface UpdateSubscriptionTierParams {
  name?: string;
  description?: string;
  monthly_price_cents?: number;
  transaction_fee_percentage?: number;
  transaction_fee_fixed_cents?: number;
  custom_domains_limit?: number;
  attractions_limit?: number;
  staff_members_limit?: number;
  features?: string[];
  is_active?: boolean;
  display_order?: number;
  metadata?: Record<string, unknown>;
  stripe_price_id?: string | null;
}

export async function getSubscriptionTiers() {
  return api.get<SubscriptionTiersResponse>('/admin/subscription-tiers');
}

export async function getSubscriptionTier(tier: string) {
  return api.get<SubscriptionTierConfig>(`/admin/subscription-tiers/${tier}`);
}

export async function updateSubscriptionTier(tier: string, data: UpdateSubscriptionTierParams) {
  return api.patch<{ message: string; tier: SubscriptionTierConfig }>(
    `/admin/subscription-tiers/${tier}`,
    data
  );
}
