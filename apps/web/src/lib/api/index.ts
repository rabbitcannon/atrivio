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
