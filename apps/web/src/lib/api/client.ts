'use client';

import { createClient } from '@/lib/supabase/client';
import type {
  Organization,
  OrganizationListItem,
  OrganizationMembersResponse,
  OrganizationMember,
  OrgRole,
  AttractionsResponse,
  Attraction,
  StaffResponse,
  StaffMember,
  StaffSkill,
  StaffCertification,
  TimeEntry,
  TimeEntriesResponse,
  Zone,
} from './types';

const API_BASE_URL = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3001/api/v1';

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

/**
 * Client-side API client for Client Components.
 * Uses the browser Supabase client to get auth tokens.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (session?.access_token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${session.access_token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: 'An unexpected error occurred',
        statusCode: response.status,
      }));
      return { data: null, error };
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return { data: null as T, error: null };
    }

    const data: T = await response.json();
    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: {
        message: err instanceof Error ? err.message : 'Network error',
        statusCode: 0,
      },
    };
  }
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string) => apiClient<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => apiClient<T>(endpoint, { method: 'DELETE' }),
};

// ============================================================================
// Client-side API Functions (for use in Client Components)
// ============================================================================

// Re-export types for convenience
export type {
  Organization,
  OrganizationListItem,
  OrganizationMembersResponse,
  AttractionsResponse,
  Attraction,
  StaffResponse,
  StaffMember,
  StaffSkill,
  StaffCertification,
  TimeEntry,
  TimeEntriesResponse,
  Zone,
  OrgRole,
  OrganizationMember,
  StaffListItem,
} from './types';

/**
 * Get all organizations for the current user (client-side)
 */
export async function getOrganizations() {
  return api.get<{ data: OrganizationListItem[] }>('/organizations');
}

/**
 * Create a new organization (client-side)
 */
export async function createOrganization(data: {
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  website?: string;
  timezone?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}) {
  return api.post<Organization & { membership: { role: string; is_owner: boolean } }>('/organizations', data);
}

/**
 * Get a single organization by ID (client-side)
 */
export async function getOrganization(orgId: string) {
  return api.get<Organization>(`/organizations/${orgId}`);
}

/**
 * Update an organization (client-side)
 */
export async function updateOrganization(
  orgId: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    website?: string;
    timezone?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
    settings?: Record<string, unknown>;
  }
) {
  return api.patch<Organization>(`/organizations/${orgId}`, data);
}

/**
 * Get members of an organization (client-side)
 */
export async function getOrganizationMembers(orgId: string) {
  return api.get<OrganizationMembersResponse>(`/organizations/${orgId}/members`);
}

/**
 * Update a member's role (client-side)
 */
export async function updateMemberRole(orgId: string, memberId: string, role: OrgRole) {
  return api.patch<OrganizationMember>(`/organizations/${orgId}/members/${memberId}`, { role });
}

/**
 * Remove a member from the organization (client-side)
 */
export async function removeMember(orgId: string, memberId: string) {
  return api.delete<{ message: string }>(`/organizations/${orgId}/members/${memberId}`);
}

/**
 * Get all attractions for an organization (client-side)
 */
export async function getAttractions(orgId: string) {
  return api.get<AttractionsResponse>(`/organizations/${orgId}/attractions`);
}

/**
 * Get a single attraction by ID (client-side)
 */
export async function getAttraction(orgId: string, attractionId: string) {
  return api.get<Attraction>(`/organizations/${orgId}/attractions/${attractionId}`);
}

/**
 * Get zones for an attraction (client-side)
 */
export async function getAttractionZones(orgId: string, attractionId: string) {
  return api.get<{ data: Zone[] }>(`/organizations/${orgId}/attractions/${attractionId}/zones`);
}

/**
 * Create an attraction (client-side)
 */
export async function createAttraction(
  orgId: string,
  data: {
    name: string;
    slug: string;
    type_id: string;
    description?: string;
    capacity?: number;
    min_age?: number;
    intensity_level?: number;
    duration_minutes?: number;
  }
) {
  return api.post<Attraction>(`/organizations/${orgId}/attractions`, data);
}

/**
 * Update an attraction (client-side)
 */
export async function updateAttraction(
  orgId: string,
  attractionId: string,
  data: {
    name?: string;
    description?: string;
    capacity?: number;
    min_age?: number;
    intensity_level?: number;
    duration_minutes?: number;
  }
) {
  return api.patch<Attraction>(`/organizations/${orgId}/attractions/${attractionId}`, data);
}

/**
 * Get all staff members for an organization (client-side)
 */
export async function getStaff(orgId: string, filters?: { status?: string; role?: string }) {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.role) params.set('role', filters.role);
  const query = params.toString();
  return api.get<StaffResponse>(`/organizations/${orgId}/staff${query ? `?${query}` : ''}`);
}

/**
 * Get a single staff member by ID (client-side)
 */
export async function getStaffMember(orgId: string, staffId: string) {
  return api.get<StaffMember>(`/organizations/${orgId}/staff/${staffId}`);
}

/**
 * Update a staff member (client-side)
 */
export async function updateStaffMember(
  orgId: string,
  staffId: string,
  data: {
    employee_id?: string;
    status?: 'active' | 'inactive' | 'on_leave' | 'terminated';
    employment_type?: 'full_time' | 'part_time' | 'seasonal' | 'contractor';
    hourly_rate?: number;
    shirt_size?: string;
    emergency_contact?: {
      name: string;
      phone: string;
      relation?: string;
    };
    notes?: string;
  }
) {
  return api.patch<StaffMember>(`/organizations/${orgId}/staff/${staffId}`, data);
}

// ============================================================================
// Staff Skills API (Client-side)
// ============================================================================

/**
 * Get skills for a staff member (client-side)
 */
export async function getStaffSkills(orgId: string, staffId: string) {
  return api.get<{ data: StaffSkill[] }>(`/organizations/${orgId}/staff/${staffId}/skills`);
}

/**
 * Add or update a skill for a staff member (client-side)
 */
export async function addStaffSkill(
  orgId: string,
  staffId: string,
  data: {
    skill: string;
    level: number;
    notes?: string;
  }
) {
  return api.post<StaffSkill>(`/organizations/${orgId}/staff/${staffId}/skills`, data);
}

/**
 * Remove a skill from a staff member (client-side)
 */
export async function removeStaffSkill(orgId: string, staffId: string, skillId: string) {
  return api.delete<{ message: string }>(`/organizations/${orgId}/staff/${staffId}/skills/${skillId}`);
}

// ============================================================================
// Staff Certifications API (Client-side)
// ============================================================================

/**
 * Get certifications for a staff member (client-side)
 */
export async function getStaffCertifications(orgId: string, staffId: string) {
  return api.get<{ data: StaffCertification[] }>(`/organizations/${orgId}/staff/${staffId}/certifications`);
}

/**
 * Add a certification for a staff member (client-side)
 */
export async function addStaffCertification(
  orgId: string,
  staffId: string,
  data: {
    type: string;
    certificate_number?: string;
    issued_at: string;
    expires_at?: string;
  }
) {
  return api.post<StaffCertification>(`/organizations/${orgId}/staff/${staffId}/certifications`, data);
}

/**
 * Verify a certification (client-side)
 */
export async function verifyCertification(orgId: string, staffId: string, certId: string) {
  return api.post<StaffCertification>(`/organizations/${orgId}/staff/${staffId}/certifications/${certId}/verify`, {});
}

/**
 * Remove a certification from a staff member (client-side)
 */
export async function removeCertification(orgId: string, staffId: string, certId: string) {
  return api.delete<{ message: string }>(`/organizations/${orgId}/staff/${staffId}/certifications/${certId}`);
}

// ============================================================================
// Time Tracking API (Client-side)
// ============================================================================

/**
 * Get time entries for a staff member (client-side)
 */
export async function getTimeEntries(
  orgId: string,
  staffId: string,
  filters?: { start_date?: string; end_date?: string; status?: string }
) {
  const params = new URLSearchParams();
  if (filters?.start_date) params.set('start_date', filters.start_date);
  if (filters?.end_date) params.set('end_date', filters.end_date);
  if (filters?.status) params.set('status', filters.status);
  const query = params.toString();
  return api.get<TimeEntriesResponse>(`/organizations/${orgId}/staff/${staffId}/time${query ? `?${query}` : ''}`);
}

/**
 * Clock in for a staff member (client-side)
 */
export async function clockIn(orgId: string, staffId: string, attractionId: string) {
  return api.post<TimeEntry>(`/organizations/${orgId}/staff/${staffId}/time/clock-in`, {
    attraction_id: attractionId,
  });
}

/**
 * Clock out for a staff member (client-side)
 */
export async function clockOut(
  orgId: string,
  staffId: string,
  data?: { break_minutes?: number; notes?: string }
) {
  return api.post<TimeEntry>(`/organizations/${orgId}/staff/${staffId}/time/clock-out`, data || {});
}

/**
 * Update a time entry (client-side)
 */
export async function updateTimeEntry(
  orgId: string,
  entryId: string,
  data: {
    clock_in?: string;
    clock_out?: string;
    break_minutes?: number;
    notes?: string;
  }
) {
  return api.patch<TimeEntry>(`/organizations/${orgId}/time-entries/${entryId}`, data);
}

/**
 * Approve a time entry (client-side)
 */
export async function approveTimeEntry(orgId: string, entryId: string) {
  return api.post<TimeEntry>(`/organizations/${orgId}/time-entries/${entryId}/approve`, {});
}

// ============================================================================
// Invitations API (Client-side)
// ============================================================================

export interface Invitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
}

/**
 * Create an invitation to add a staff member (client-side)
 */
export async function createInvitation(
  orgId: string,
  email: string,
  role: string
) {
  return api.post<Invitation>(`/organizations/${orgId}/invitations`, { email, role });
}

/**
 * List pending invitations (client-side)
 */
export async function getInvitations(orgId: string) {
  return api.get<{ data: Invitation[] }>(`/organizations/${orgId}/invitations`);
}

/**
 * Cancel an invitation (client-side)
 */
export async function cancelInvitation(orgId: string, invitationId: string) {
  return api.delete<{ message: string }>(`/organizations/${orgId}/invitations/${invitationId}`);
}

// ============================================================================
// Zones API (Client-side)
// ============================================================================

/**
 * Create a zone for an attraction (client-side)
 */
export async function createZone(
  orgId: string,
  attractionId: string,
  data: {
    name: string;
    description?: string;
    capacity?: number;
    color?: string;
  }
) {
  return api.post<Zone>(`/organizations/${orgId}/attractions/${attractionId}/zones`, data);
}

/**
 * Update a zone (client-side)
 */
export async function updateZone(
  orgId: string,
  attractionId: string,
  zoneId: string,
  data: {
    name?: string;
    description?: string;
    capacity?: number;
    color?: string;
  }
) {
  return api.patch<Zone>(`/organizations/${orgId}/attractions/${attractionId}/zones/${zoneId}`, data);
}

/**
 * Delete a zone (client-side)
 */
export async function deleteZone(orgId: string, attractionId: string, zoneId: string) {
  return api.delete<{ message: string }>(`/organizations/${orgId}/attractions/${attractionId}/zones/${zoneId}`);
}

/**
 * Reorder zones (client-side)
 */
export async function reorderZones(orgId: string, attractionId: string, zoneIds: string[]) {
  return api.put<{ data: Zone[] }>(`/organizations/${orgId}/attractions/${attractionId}/zones/reorder`, { zone_ids: zoneIds });
}

// ============================================================================
// Seasons API (Client-side)
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
 * Get all seasons for an attraction (client-side)
 */
export async function getSeasons(orgId: string, attractionId: string, filters?: { year?: number; status?: string }) {
  const params = new URLSearchParams();
  if (filters?.year) params.set('year', filters.year.toString());
  if (filters?.status) params.set('status', filters.status);
  const query = params.toString();
  return api.get<{ data: Season[] }>(`/organizations/${orgId}/attractions/${attractionId}/seasons${query ? `?${query}` : ''}`);
}

/**
 * Create a season for an attraction (client-side)
 */
export async function createSeason(
  orgId: string,
  attractionId: string,
  data: {
    name: string;
    year: number;
    start_date: string;
    end_date: string;
  }
) {
  return api.post<Season>(`/organizations/${orgId}/attractions/${attractionId}/seasons`, data);
}

/**
 * Update a season (client-side)
 */
export async function updateSeason(
  orgId: string,
  attractionId: string,
  seasonId: string,
  data: {
    name?: string;
    year?: number;
    start_date?: string;
    end_date?: string;
    status?: 'upcoming' | 'active' | 'completed' | 'cancelled';
  }
) {
  return api.patch<Season>(`/organizations/${orgId}/attractions/${attractionId}/seasons/${seasonId}`, data);
}

/**
 * Delete a season (client-side)
 */
export async function deleteSeason(orgId: string, attractionId: string, seasonId: string) {
  return api.delete<{ message: string }>(`/organizations/${orgId}/attractions/${attractionId}/seasons/${seasonId}`);
}

// ============================================================================
// Quick Time Clock API (Self-service, Client-side)
// ============================================================================

export interface TimeClockStatus {
  is_clocked_in: boolean;
  current_entry: {
    id: string;
    clock_in: string;
    attraction: { id: string; name: string } | null;
    duration_minutes: number;
  } | null;
  staff_id: string;
  attractions: { id: string; name: string; is_primary: boolean }[];
}

export interface ActiveStaffEntry {
  entry_id: string;
  staff_id: string;
  user: { first_name: string; last_name: string; avatar_url?: string } | null;
  clock_in: string;
  attraction: { id: string; name: string } | null;
  duration_minutes: number;
}

export interface OrgBySlug {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
}

/**
 * Get organization by slug (for time clock page)
 */
export async function getOrgBySlug(slug: string) {
  return api.get<OrgBySlug>(`/organizations/by-slug/${slug}`);
}

/**
 * Get current user's time clock status (self-service)
 */
export async function getMyTimeStatus(orgId: string) {
  return api.get<TimeClockStatus>(`/organizations/${orgId}/time/my-status`);
}

/**
 * Self-service clock in
 */
export async function selfClockIn(orgId: string, attractionId: string) {
  return api.post<TimeEntry>(`/organizations/${orgId}/time/clock-in`, {
    attraction_id: attractionId,
  });
}

/**
 * Self-service clock out
 */
export async function selfClockOut(
  orgId: string,
  data?: { break_minutes?: number; notes?: string }
) {
  return api.post<TimeEntry>(`/organizations/${orgId}/time/clock-out`, data || {});
}

/**
 * Get currently clocked-in staff (manager view)
 */
export async function getActiveClockedIn(orgId: string) {
  return api.get<{ data: ActiveStaffEntry[]; count: number }>(`/organizations/${orgId}/time/active`);
}
