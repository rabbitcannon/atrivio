'use client';

import { createClient } from '@/lib/supabase/client';
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
 * Get a single organization by ID (client-side)
 */
export async function getOrganization(orgId: string) {
  return api.get<Organization>(`/organizations/${orgId}`);
}

/**
 * Get members of an organization (client-side)
 */
export async function getOrganizationMembers(orgId: string) {
  return api.get<OrganizationMembersResponse>(`/organizations/${orgId}/members`);
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
