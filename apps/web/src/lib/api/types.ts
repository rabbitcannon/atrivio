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
