import { getSession } from '@/lib/supabase/server';

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
 * Server-side API client for Server Components, Server Actions, and Route Handlers.
 * Uses the server-side Supabase client to get auth tokens.
 */
export async function apiServer<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const session = await getSession();

  // Debug logging for auth issues
  if (process.env.NODE_ENV === 'development') {
    console.log('[apiServer] Endpoint:', endpoint);
    console.log('[apiServer] Session exists:', !!session);
    console.log('[apiServer] Has access_token:', !!session?.access_token);
  }

  const headers: HeadersInit = {
    // Only set Content-Type for requests with a body
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  if (session?.access_token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${session.access_token}`;
    if (process.env.NODE_ENV === 'development') {
      console.log('[apiServer] Auth header set with token (first 20 chars):', session.access_token.substring(0, 20));
    }
  } else if (process.env.NODE_ENV === 'development') {
    console.warn('[apiServer] No access token - request will be unauthenticated');
  }

  // Log full request details
  if (process.env.NODE_ENV === 'development') {
    console.log('[apiServer] Full URL:', `${API_BASE_URL}${endpoint}`);
    console.log('[apiServer] Method:', options.method || 'GET');
    console.log('[apiServer] Headers:', JSON.stringify(headers, null, 2));
    if (options.body) {
      console.log('[apiServer] Body:', options.body);
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      // Ensure fresh data in Server Components
      cache: 'no-store',
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        message: 'An unexpected error occurred',
        statusCode: response.status,
      }));
      if (process.env.NODE_ENV === 'development') {
        console.error('[apiServer] API error:', response.status, error);
      }
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

// Convenience methods for server-side use
export const serverApi = {
  get: <T>(endpoint: string) => apiServer<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: unknown) =>
    apiServer<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    apiServer<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    apiServer<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => apiServer<T>(endpoint, { method: 'DELETE' }),
};
