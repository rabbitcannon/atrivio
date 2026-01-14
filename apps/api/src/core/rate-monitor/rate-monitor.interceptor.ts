import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RateMonitorService } from './rate-monitor.service.js';

/**
 * Interceptor that records request traffic for monitoring.
 * Does NOT enforce rate limits - only collects data for visibility.
 */
@Injectable()
export class RateMonitorInterceptor implements NestInterceptor {
  constructor(private rateMonitorService: RateMonitorService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Skip if monitoring not available
    if (!this.rateMonitorService.isAvailable()) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();

    // Extract request data
    const endpoint = (request.url ?? '/').split('?')[0] ?? '/';
    const method = request.method ?? 'GET';

    // Get user info from request (set by JwtAuthGuard)
    const user = (request as { user?: { id?: string } }).user;
    const userId = user?.id || null;

    // Get org info from request (set by TenantInterceptor)
    const tenant = (request as { tenant?: { orgId?: string } }).tenant;
    const orgId = tenant?.orgId || null;

    // Get client IP
    const ip = this.getClientIp(request);

    // Record the request (fire and forget)
    this.rateMonitorService.recordRequest({
      endpoint,
      method,
      userId,
      orgId,
      ip,
      timestamp: Date.now(),
    });

    return next.handle().pipe(
      tap({
        // Could add response tracking here if needed
      })
    );
  }

  /**
   * Extract client IP from request headers
   */
  private getClientIp(request: FastifyRequest): string {
    // Check common proxy headers
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
      return ips?.trim() || 'unknown';
    }

    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      const ip = Array.isArray(realIp) ? realIp[0] : realIp;
      return ip || 'unknown';
    }

    // Fallback to socket IP
    return request.ip || 'unknown';
  }
}
