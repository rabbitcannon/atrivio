import type { LightMyRequestResponse } from 'fastify';
import { getTestApp } from './test-app.js';

export interface RequestOptions {
  token?: string;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
  statusCode: number;
  body: T;
  headers: Record<string, string>;
}

async function makeRequest<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  url: string,
  options: RequestOptions & { body?: unknown } = {}
): Promise<ApiResponse<T>> {
  const app = getTestApp();
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...options.headers,
  };

  if (options.token) {
    headers['authorization'] = `Bearer ${options.token}`;
  }

  const response: LightMyRequestResponse = await app.inject({
    method,
    url: `/api/v1${url}`,
    headers,
    payload: options.body,
  });

  let body: T;
  try {
    body = JSON.parse(response.body) as T;
  } catch {
    body = response.body as T;
  }

  return {
    statusCode: response.statusCode,
    body,
    headers: response.headers as Record<string, string>,
  };
}

export function get<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
  return makeRequest<T>('GET', url, options);
}

export function post<T = unknown>(
  url: string,
  body?: unknown,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return makeRequest<T>('POST', url, { ...options, body });
}

export function patch<T = unknown>(
  url: string,
  body?: unknown,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return makeRequest<T>('PATCH', url, { ...options, body });
}

export function put<T = unknown>(
  url: string,
  body?: unknown,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  return makeRequest<T>('PUT', url, { ...options, body });
}

export function del<T = unknown>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
  return makeRequest<T>('DELETE', url, options);
}
