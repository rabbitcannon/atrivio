/**
 * API Response Types for the Haunt Platform
 * These types match the response shapes from the NestJS API
 */

// ============================================================================
// Common Types
// ============================================================================

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    total: number;
    [key: string]: unknown;
  };
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone?: string | null;
}

// ============================================================================
// Organization Types
// ============================================================================

export interface OrganizationListItem {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  status: 'active' | 'suspended' | 'deleted';
  stripe_onboarding_complete: boolean;
  role: OrgRole;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  logo_url: string | null;
  address: Address | null;
  timezone: string;
  status: 'active' | 'suspended' | 'deleted';
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  settings: Record<string, unknown>;
  membership: {
    role: OrgRole;
    is_owner: boolean;
    joined_at: string;
  } | null;
  stats: {
    member_count: number;
    attraction_count: number;
  };
  created_at: string;
  updated_at: string;
}

export type OrgRole =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'hr'
  | 'box_office'
  | 'finance'
  | 'actor'
  | 'scanner';

export interface OrganizationMember {
  id: string;
  user: User;
  role: OrgRole;
  is_owner: boolean;
  status: 'active' | 'removed';
  joined_at: string;
  invited_by: {
    id: string;
    name: string;
  } | null;
}

export interface OrganizationMembersResponse {
  data: OrganizationMember[];
  meta: {
    total: number;
    by_role: Record<string, number>;
  };
}

// ============================================================================
// Attraction Types
// ============================================================================

export type AttractionStatus = 'draft' | 'published' | 'active' | 'archived';

export interface Season {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed';
  start_date: string;
  end_date: string;
}

export interface Zone {
  id: string;
  name: string;
  description: string | null;
  capacity: number | null;
  color: string | null;
  sort_order: number;
  staff_count?: number;
}

export interface AttractionListItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  type_name?: string;
  logo_url: string | null;
  cover_image_url: string | null;
  status: AttractionStatus;
  intensity_level: number | null;
  capacity?: number | null;
  zones_count?: number;
  address: Address | null;
  city: string | null;
  state: string | null;
  current_season: Season | null;
  created_at: string;
}

export interface Attraction {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  type: string;
  type_name?: string;
  description: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  website: string | null;
  email: string | null;
  phone: string | null;
  address: Address | null;
  coordinates: Coordinates | null;
  timezone: string;
  status: AttractionStatus;
  capacity: number | null;
  min_age: number | null;
  intensity_level: number | null;
  duration_minutes: number | null;
  settings: Record<string, unknown>;
  seo_metadata: Record<string, unknown> | null;
  zones: Zone[];
  zones_count?: number;
  amenities: string[];
  current_season: Season | null;
  created_at: string;
  updated_at: string;
}

export interface AttractionsResponse {
  data: AttractionListItem[];
}

// ============================================================================
// Staff Types
// ============================================================================

export type StaffStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';
export type EmploymentType = 'full_time' | 'part_time' | 'seasonal' | 'contractor';

export interface StaffSkill {
  id?: string;
  skill: string;
  level: number;
  endorsed_by?: {
    id: string;
    name: string;
  } | null;
  created_at?: string;
}

export interface StaffCertification {
  id: string;
  type: string;
  certificate_number: string | null;
  issued_at: string | null;
  expires_at: string | null;
  verified: boolean;
  verified_by: {
    id: string;
    name: string;
  } | null;
  verified_at: string | null;
}

export interface StaffCertificationSummary {
  valid: string[];
  expiring_soon: string[];
  expired: string[];
}

export interface StaffAttraction {
  id: string;
  name: string;
  is_primary: boolean;
  zones?: {
    id: string;
    name: string;
  }[];
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation?: string;
}

export interface StaffListItem {
  id: string;
  user: User;
  employee_id: string | null;
  role: OrgRole;
  status: StaffStatus;
  employment_type: EmploymentType | null;
  hire_date: string | null;
  attractions: StaffAttraction[];
  skills: StaffSkill[];
  certifications: StaffCertificationSummary;
}

export interface StaffMember {
  id: string;
  user: User;
  employee_id: string | null;
  role: OrgRole;
  status: StaffStatus;
  employment_type: EmploymentType | null;
  hire_date: string | null;
  date_of_birth: string | null;
  shirt_size: string | null;
  hourly_rate: number | null;
  emergency_contact: EmergencyContact | null;
  attractions: StaffAttraction[];
  skills: StaffSkill[];
  certifications: StaffCertification[];
  documents: {
    id: string;
    type: string;
    name: string;
    file_url: string;
    file_size: number;
    uploaded_by: string | null;
    created_at: string;
  }[];
  waivers: {
    type: string;
    signed_at: string;
    version: string;
  }[];
  time_summary: {
    current_week_hours: number;
    current_month_hours: number;
    season_total_hours: number;
  };
  notes: string | null;
  created_at: string;
}

export interface StaffResponse {
  data: StaffListItem[];
  meta: {
    total: number;
    by_status: Record<string, number>;
    by_role: Record<string, number>;
  };
}

// ============================================================================
// Time Tracking Types
// ============================================================================

export type TimeEntryStatus = 'pending' | 'approved';

export interface TimeEntry {
  id: string;
  date: string | null;
  clock_in: string;
  clock_out: string | null;
  break_minutes: number | null;
  total_hours: number | null;
  attraction: {
    id: string;
    name: string;
  } | null;
  status: TimeEntryStatus;
  approved_by: string | null;
  notes: string | null;
}

export interface TimeEntriesResponse {
  entries: TimeEntry[];
  summary: {
    total_hours: number;
    total_entries: number;
    pending_approval: number;
  };
}

// ============================================================================
// Scheduling Types
// ============================================================================

export type ScheduleStatus =
  | 'draft'
  | 'scheduled'
  | 'published'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'no_show'
  | 'canceled';

export type AvailabilityType =
  | 'available'
  | 'unavailable'
  | 'preferred'
  | 'time_off_approved'
  | 'time_off_pending';

export type SwapType = 'swap' | 'drop' | 'pickup';
export type SwapStatus = 'pending' | 'approved' | 'rejected' | 'canceled' | 'expired';

export interface ScheduleRole {
  id: string;
  name: string;
  color: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Schedule {
  id: string;
  org_id: string;
  attraction_id: string;
  staff_id: string | null;
  role_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: ScheduleStatus;
  notes: string | null;
  staff: {
    id: string;
    org_memberships: {
      user_id: string;
      profiles: {
        first_name: string;
        last_name: string;
        email: string;
      };
    };
  } | null;
  role: ScheduleRole;
  attraction: {
    id: string;
    name: string;
  };
}

export interface ShiftTemplate {
  id: string;
  org_id: string;
  attraction_id: string;
  name: string;
  role_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  staff_count: number;
  is_active: boolean;
  notes: string | null;
  role: ScheduleRole;
  attraction: {
    id: string;
    name: string;
  };
}

export interface StaffAvailability {
  id: string;
  staff_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  availability_type: AvailabilityType;
  effective_from: string | null;
  effective_to: string | null;
  notes: string | null;
}

export interface ShiftSwapRequest {
  id: string;
  org_id: string;
  schedule_id: string;
  swap_type: SwapType;
  status: SwapStatus;
  reason: string | null;
  admin_notes: string | null;
  created_at: string;
  schedule: Schedule;
  target_schedule: Schedule | null;
  requesting_staff: {
    id: string;
    org_memberships: {
      user_id: string;
      profiles: {
        first_name: string;
        last_name: string;
        email: string;
      };
    };
  };
  target_staff: {
    id: string;
    org_memberships: {
      user_id: string;
      profiles: {
        first_name: string;
        last_name: string;
        email: string;
      };
    };
  } | null;
}

// ============================================================================
// Inventory Types (F10)
// ============================================================================

export interface InventoryType {
  id: string;
  org_id: string | null;
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  requires_checkout: boolean;
  is_consumable: boolean;
  track_condition: boolean;
  is_active: boolean;
  created_at: string;
}

export interface InventoryCategory {
  id: string;
  org_id: string;
  parent_id: string | null;
  name: string;
  description: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  children?: InventoryCategory[];
  item_count?: number;
}

export type CheckoutCondition = 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
export type InventoryTransactionType =
  | 'purchase'
  | 'adjustment'
  | 'checkout'
  | 'return'
  | 'transfer'
  | 'damaged'
  | 'lost'
  | 'disposed';

export interface InventoryItem {
  id: string;
  org_id: string;
  attraction_id: string | null;
  category_id: string | null;
  type_id: string;
  sku: string;
  name: string;
  description: string | null;
  quantity: number;
  min_quantity: number;
  max_quantity: number | null;
  unit: string;
  cost_cents: number | null;
  location: string | null;
  condition: CheckoutCondition | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  type?: InventoryType;
  category?: InventoryCategory;
  attraction?: { id: string; name: string };
}

export interface InventoryCheckout {
  id: string;
  org_id: string;
  item_id: string;
  staff_id: string;
  quantity: number;
  checked_out_at: string;
  due_date: string | null;
  returned_at: string | null;
  checked_out_by: string;
  returned_by: string | null;
  condition_out: CheckoutCondition | null;
  condition_in: CheckoutCondition | null;
  notes: string | null;
  item?: { id: string; name: string; sku: string };
  staff?: { id: string };
  checked_out_by_user?: { id: string; first_name: string; last_name: string };
  returned_by_user?: { id: string; first_name: string; last_name: string } | null;
}

export interface InventoryTransaction {
  id: string;
  org_id: string;
  item_id: string;
  type: InventoryTransactionType;
  quantity: number;
  previous_qty: number;
  new_qty: number;
  reason: string | null;
  reference_type: string | null;
  reference_id: string | null;
  performed_by: string;
  created_at: string;
  // Relations
  item?: { id: string; name: string; sku: string };
  performed_by_user?: { id: string; first_name: string; last_name: string };
}

export interface InventorySummary {
  totalItems: number;
  totalCategories: number;
  totalTypes: number;
  lowStockItems: number;
  activeCheckouts: number;
  overdueCheckouts: number;
  recentTransactions: InventoryTransaction[];
  lowStockAlerts: InventoryItem[];
}

// ============================================================================
// Virtual Queue Types (F11)
// ============================================================================

export type QueueEntryStatus =
  | 'waiting'
  | 'notified'
  | 'called'
  | 'checked_in'
  | 'expired'
  | 'left'
  | 'no_show';

export interface QueueConfig {
  id: string;
  attraction_id: string;
  name: string;
  is_active: boolean;
  is_paused: boolean;
  capacity_per_batch: number;
  batch_interval_minutes: number;
  max_wait_minutes: number;
  max_queue_size: number;
  allow_rejoin: boolean;
  require_check_in: boolean;
  notification_lead_minutes: number;
  expiry_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface QueueEntry {
  id: string;
  confirmation_code: string;
  guest_name: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  party_size: number;
  position: number;
  status: QueueEntryStatus;
  joined_at: string;
  estimated_time: string | null;
  notified_at: string | null;
  called_at: string | null;
  checked_in_at: string | null;
  expired_at: string | null;
  left_at: string | null;
  notes: string | null;
}

export interface QueueEntriesResponse {
  data: QueueEntry[];
  total: number;
  summary: {
    totalWaiting: number;
    totalServedToday: number;
    avgWaitMinutes: number;
    nextBatchTime: string;
  };
}

export interface QueueStats {
  today: {
    totalJoined: number;
    totalServed: number;
    totalExpired: number;
    totalLeft: number;
    totalNoShow: number;
    avgWaitMinutes: number | null;
    maxWaitMinutes: number | null;
    currentInQueue: number;
  };
  byHour: Array<{
    hour: string;
    joined: number;
    served: number;
    expired: number;
    avgWait: number | null;
    maxSize: number;
  }>;
}

export interface PublicQueueStatus {
  isOpen: boolean;
  isPaused: boolean;
  currentWaitMinutes: number;
  peopleInQueue: number;
  queueSize: number;
  status: 'accepting' | 'paused' | 'full' | 'closed';
  message: string;
}

export interface QueuePosition {
  confirmationCode: string;
  position: number;
  status: string;
  partySize: number;
  peopleAhead: number;
  estimatedWaitMinutes: number;
  estimatedTime: string;
  joinedAt: string;
  queueName: string;
  attractionName: string;
}

// ============================================================================
// Notifications Types (F12)
// ============================================================================

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';
export type NotificationStatus =
  | 'pending'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'opened'
  | 'clicked'
  | 'failed'
  | 'bounced'
  | 'unsubscribed';
export type NotificationCategory =
  | 'tickets'
  | 'queue'
  | 'schedule'
  | 'announcements'
  | 'marketing'
  | 'system';
export type RecipientType = 'user' | 'customer' | 'staff' | 'guest';
export type DevicePlatform = 'ios' | 'android' | 'web';

export interface NotificationTemplate {
  id: string;
  key: string;
  name: string;
  description: string | null;
  channel: NotificationChannel;
  subject: string | null;
  body: string;
  variables: string[];
  isSystem: boolean;
  isActive: boolean;
}

export interface Notification {
  id: string;
  channel: NotificationChannel;
  category: NotificationCategory;
  recipientEmail: string | null;
  recipientPhone: string | null;
  subject: string | null;
  body: string;
  status: NotificationStatus;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  error: string | null;
  createdAt: string;
}

export interface InAppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface NotificationPreference {
  category: NotificationCategory;
  categoryName: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
}

export interface NotificationsResponse {
  data: Notification[];
  total: number;
}

export interface TemplatesResponse {
  data: NotificationTemplate[];
}

export interface InAppNotificationsResponse {
  data: InAppNotification[];
  unreadCount: number;
}

export interface PreferencesResponse {
  data: NotificationPreference[];
}

// ============================================================================
// Storefront Types (F14)
// These types match the API response format (camelCase)
// ============================================================================

export type ContentFormat = 'markdown' | 'html' | 'blocks';
export type PageType =
  | 'home'
  | 'about'
  | 'faq'
  | 'contact'
  | 'rules'
  | 'jobs'
  | 'gallery'
  | 'custom';
export type PageStatus = 'draft' | 'published' | 'archived';
export type DomainType = 'subdomain' | 'custom';
export type DomainStatus = 'pending' | 'verifying' | 'active' | 'failed' | 'expired';
export type SslStatus = 'pending' | 'provisioning' | 'active' | 'failed';
export type AnnouncementType = 'info' | 'warning' | 'critical' | 'success' | 'promo';
export type AnnouncementPosition = 'banner' | 'popup' | 'inline';

export interface StorefrontSettings {
  id: string;
  tagline: string | null;
  description: string | null;
  hero: {
    imageUrl: string | null;
    videoUrl: string | null;
    title: string | null;
    subtitle: string | null;
  };
  theme: {
    preset: string | null;
    primaryColor: string | null;
    secondaryColor: string | null;
    accentColor: string | null;
    backgroundColor: string | null;
    textColor: string | null;
    headerBgColor: string | null;
    headerTextColor: string | null;
    fontHeading: string | null;
    fontBody: string | null;
    customCss: string | null;
    backgroundImageUrl: string | null;
    backgroundPosition: string | null;
    backgroundSize: string | null;
    backgroundRepeat: string | null;
    backgroundAttachment: string | null;
    backgroundOverlay: string | null;
  };
  social: {
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    tiktok: string | null;
    youtube: string | null;
  };
  seo: {
    title: string | null;
    description: string | null;
    keywords: string[] | null;
    ogImageUrl: string | null;
  };
  analytics: {
    googleAnalyticsId: string | null;
    facebookPixelId: string | null;
    customHeadScripts: string | null;
  };
  features: {
    showAttractions: boolean | null;
    showCalendar: boolean | null;
    showFaq: boolean | null;
    showTickets: boolean | null;
    showReviews: boolean | null;
    featuredAttractionIds: string[] | null;
  };
  // Contact visibility
  showAddress?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
  isPublished: boolean;
  publishedAt: string | null;
}

export interface StorefrontPage {
  id: string;
  slug: string;
  title: string;
  content: string | null;
  contentFormat: ContentFormat;
  pageType: PageType;
  status: PageStatus;
  showInNav: boolean;
  seo: {
    title: string | null;
    description: string | null;
    ogImageUrl: string | null;
  };
  updatedAt: string;
}

export interface StorefrontDomain {
  id: string;
  domain: string;
  domainType: DomainType;
  isPrimary: boolean;
  status: DomainStatus;
  sslStatus: SslStatus;
  verifiedAt: string | null;
  verification?: {
    method: string;
    recordName: string;
    recordValue: string;
    instructions: string;
  };
}

export interface StorefrontFaq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isPublished: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface StorefrontAnnouncement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  position: AnnouncementPosition;
  linkUrl: string | null;
  linkText: string | null;
  startsAt: string | null;
  endsAt: string | null;
  isActive: boolean;
  isDismissible: boolean;
  announcementType?: AnnouncementType; // Alias for backwards compat
  showOnHome?: boolean;
}

export interface StorefrontNavItem {
  id: string;
  label: string;
  linkType: 'home' | 'page' | 'external' | 'tickets' | 'faq';
  type?: 'page' | 'link' | 'dropdown'; // Alias for backwards compat
  pageId: string | null;
  externalUrl: string | null;
  url?: string; // Alias for backwards compat
  openInNewTab: boolean;
  openNewTab?: boolean; // Alias for backwards compat
  sortOrder: number;
  children?: StorefrontNavItem[];
}

export interface StorefrontNavigation {
  header: StorefrontNavItem[];
  footer: StorefrontNavItem[];
}

export interface PublicStorefrontContact {
  showAddress: boolean;
  showPhone: boolean;
  showEmail: boolean;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
  };
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  phone?: string;
  email?: string;
}

export interface PublicStorefront {
  org: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    website: string | null;
    timezone: string;
  };
  attraction: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    logoUrl?: string | null;
  };
  contact: PublicStorefrontContact;
  storefront: StorefrontSettings;
  pages?: StorefrontPage[];
  announcements: StorefrontAnnouncement[];
  navigation: StorefrontNavigation;
  domain: string | { current: string; canonical: string };
}

export interface PublicTicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  category: string | null;
  includes: string[] | null;
  maxPerOrder: number;
  minPerOrder: number;
  isAvailable: boolean;
}

// ============================================================================
// Check-In Types (F9)
// ============================================================================

export type CheckInMethod =
  | 'barcode_scan'
  | 'qr_scan'
  | 'manual_lookup'
  | 'order_number'
  | 'walk_up';
export type LookupType = 'email' | 'phone' | 'order_number' | 'ticket_number' | 'name';
export type QueueStatus = 'pending' | 'late' | 'no_show';
export type CapacityStatus = 'normal' | 'busy' | 'critical' | 'full';
export type WalkUpPaymentMethod = 'cash' | 'card' | 'comp';

export interface CheckInScanRequest {
  barcode: string;
  stationId?: string;
  method: CheckInMethod;
  guestCount?: number;
  notes?: string;
}

export interface CheckInScanResponse {
  success: boolean;
  ticket?: {
    id: string;
    ticketNumber: string;
    ticketType: string;
    guestName: string | null;
    timeSlot: string | null;
  };
  order?: {
    orderNumber: string;
    ticketCount: number;
    checkedInCount: number;
  };
  waiverRequired: boolean;
  waiverSigned: boolean;
  checkInId?: string;
  error?: string;
  message?: string;
  checkedInAt?: string;
  requiresWaiver?: boolean;
}

export interface LookupRequest {
  query: string;
  type: LookupType;
}

export interface LookupTicket {
  id: string;
  ticketNumber: string;
  ticketType: string;
  timeSlot: string | null;
  status: string;
  checkedIn: boolean;
}

export interface LookupOrder {
  orderNumber: string;
  customerName: string | null;
  tickets: LookupTicket[];
}

export interface LookupResponse {
  orders: LookupOrder[];
}

export interface RecordWaiverRequest {
  ticketId: string;
  orderId?: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  guestDob?: string;
  isMinor?: boolean;
  guardianName?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  signatureData?: string;
  waiverVersion?: string;
}

export interface CapacityResponse {
  currentCount: number;
  capacity: number;
  percentage: number;
  status: CapacityStatus;
  estimatedWaitMinutes: number;
  checkedInLastHour: number;
  byTimeSlot: {
    slot: string;
    expected: number;
    checkedIn: number;
  }[];
}

export interface CheckInStats {
  date: string;
  totalCheckedIn: number;
  totalExpected: number;
  checkInRate: number;
  byHour: { hour: string; count: number }[];
  byStation: { station: string; count: number }[];
  byMethod: { method: string; count: number }[];
  avgCheckInTimeSeconds: number;
}

export interface QueueItem {
  ticketId: string;
  guestName: string | null;
  timeSlot: string;
  status: QueueStatus;
  minutesUntil?: number;
  minutesLate?: number;
}

export interface QueueResponse {
  pending: QueueItem[];
  late: QueueItem[];
}

export interface WalkUpSaleRequest {
  ticketTypeId: string;
  quantity: number;
  guestNames?: string[];
  paymentMethod: WalkUpPaymentMethod;
  waiverSigned?: boolean;
  notes?: string;
}

export interface CheckInStation {
  id: string;
  name: string;
  location: string | null;
  deviceId: string | null;
  isActive: boolean;
  lastActivity: string | null;
  todayCount: number;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStationRequest {
  name: string;
  location?: string;
  deviceId?: string;
  isActive?: boolean;
  settings?: Record<string, unknown>;
}

export interface UpdateStationRequest {
  name?: string;
  location?: string;
  deviceId?: string;
  isActive?: boolean;
  settings?: Record<string, unknown>;
}

export interface CheckInRecord {
  id: string;
  ticketId: string;
  ticketNumber: string;
  ticketType: string;
  guestName: string | null;
  orderNumber: string | null;
  checkedInAt: string;
  checkedInBy: string;
  stationId: string | null;
  stationName: string | null;
  method: CheckInMethod;
}

// ============================================================================
// Analytics Types (F13)
// ============================================================================

export type AnalyticsPeriod =
  | 'today'
  | 'yesterday'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | 'custom';

export type AnalyticsGroupBy = 'hour' | 'day' | 'week' | 'month';

export interface AnalyticsQueryParams {
  attractionId?: string;
  period?: AnalyticsPeriod;
  startDate?: string;
  endDate?: string;
  groupBy?: AnalyticsGroupBy;
  includeComparison?: boolean;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface PeriodComparison {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'flat';
}

export interface DashboardSummary {
  ticketsSold: number;
  ticketsCheckedIn: number;
  checkInRate: number;
  totalOrders: number;
  grossRevenue: number;
  netRevenue: number;
  totalRefunds: number;
  totalDiscounts: number;
  avgOrderValue: number;
  uniqueCustomers: number;
}

export interface DashboardComparison {
  ticketsSold?: PeriodComparison;
  grossRevenue?: PeriodComparison;
  totalOrders?: PeriodComparison;
  checkInRate?: PeriodComparison;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  comparison?: DashboardComparison;
  revenueChart: TimeSeriesDataPoint[];
  ordersChart: TimeSeriesDataPoint[];
  checkInsChart: TimeSeriesDataPoint[];
  startDate: string;
  endDate: string;
}

export interface RevenueBreakdownItem {
  id: string;
  name: string;
  revenue: number;
  percentage: number;
  orders: number;
}

export interface RevenueResponse {
  grossRevenue: number;
  netRevenue: number;
  refunds: number;
  discounts: number;
  byAttraction: RevenueBreakdownItem[];
  byTicketType: RevenueBreakdownItem[];
  trend: TimeSeriesDataPoint[];
  startDate: string;
  endDate: string;
}

export interface AttendanceBreakdownItem {
  id: string;
  name: string;
  revenue: number; // Actually count, using revenue field
  percentage: number;
  orders: number; // Actually count
}

export interface AttendanceResponse {
  totalCheckIns: number;
  totalTicketsSold: number;
  checkInRate: number;
  peakAttendance: number;
  peakAttendanceTime: string | null;
  checkInsTrend: TimeSeriesDataPoint[];
  byAttraction: AttendanceBreakdownItem[];
  startDate: string;
  endDate: string;
}

export interface TicketTypePerformance {
  id: string;
  name: string;
  attractionName: string;
  quantitySold: number;
  revenue: number;
  checkedIn: number;
  checkInRate: number;
  avgPerOrder: number;
  refunded: number;
}

export interface TicketAnalyticsResponse {
  totalTicketTypes: number;
  totalQuantitySold: number;
  totalRevenue: number;
  ticketTypes: TicketTypePerformance[];
  startDate: string;
  endDate: string;
}
