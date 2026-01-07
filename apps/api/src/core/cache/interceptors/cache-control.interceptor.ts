import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { FastifyReply } from 'fastify';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Metadata key for cache control configuration
 */
export const CACHE_CONTROL_KEY = 'cache_control';

/**
 * Cache control configuration options
 */
export interface CacheControlOptions {
  /** Cache type: public (CDN cacheable) or private (browser only) */
  type?: 'public' | 'private';
  /** Max age in seconds (default: 60) */
  maxAge?: number;
  /** Stale-while-revalidate in seconds */
  staleWhileRevalidate?: number;
  /** Don't cache at all */
  noCache?: boolean;
  /** No store directive */
  noStore?: boolean;
}

/**
 * Decorator to set cache control headers on endpoints
 *
 * @example
 * // Cache for 5 minutes, public (CDN cacheable)
 * @CacheControl({ type: 'public', maxAge: 300 })
 *
 * @example
 * // Cache for 1 hour with stale-while-revalidate
 * @CacheControl({ type: 'public', maxAge: 3600, staleWhileRevalidate: 60 })
 *
 * @example
 * // Disable caching
 * @CacheControl({ noCache: true })
 */
export const CacheControl = (options: CacheControlOptions) =>
  SetMetadata(CACHE_CONTROL_KEY, options);

/**
 * Interceptor that sets Cache-Control headers based on endpoint configuration
 */
@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const options = this.reflector.get<CacheControlOptions>(
      CACHE_CONTROL_KEY,
      context.getHandler()
    );

    // If no cache control decorator, don't set headers
    if (!options) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse<FastifyReply>();
        const headerValue = this.buildCacheControlHeader(options);

        if (headerValue) {
          response.header('Cache-Control', headerValue);
        }
      })
    );
  }

  private buildCacheControlHeader(options: CacheControlOptions): string {
    const directives: string[] = [];

    // No store takes precedence
    if (options.noStore) {
      return 'no-store';
    }

    // No cache
    if (options.noCache) {
      directives.push('no-cache');
      return directives.join(', ');
    }

    // Public vs private
    if (options.type === 'public') {
      directives.push('public');
    } else if (options.type === 'private') {
      directives.push('private');
    }

    // Max age
    if (options.maxAge !== undefined) {
      directives.push(`max-age=${options.maxAge}`);
    }

    // Stale-while-revalidate
    if (options.staleWhileRevalidate !== undefined) {
      directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
    }

    return directives.join(', ');
  }
}
