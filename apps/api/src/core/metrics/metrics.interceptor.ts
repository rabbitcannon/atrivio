import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Observable } from 'rxjs';
import { throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service.js';

/**
 * Global interceptor that records request metrics
 * Captures: path, method, status code, duration
 */
@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // Skip if metrics not available
    if (!this.metricsService.isAvailable()) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const response = context.switchToHttp().getResponse<FastifyReply>();
    const startTime = Date.now();

    // Extract path without query params
    const path = (request.url ?? '/').split('?')[0] ?? '/';
    const method = request.method ?? 'GET';

    return next.handle().pipe(
      tap(() => {
        // Record successful request
        const duration = Date.now() - startTime;
        this.recordMetric(path, method, response.statusCode, duration);
      }),
      catchError((error) => {
        // Record failed request
        const duration = Date.now() - startTime;
        const statusCode = error.status || error.statusCode || 500;
        this.recordMetric(path, method, statusCode, duration);
        return throwError(() => error);
      })
    );
  }

  private recordMetric(path: string, method: string, statusCode: number, duration: number): void {
    // Fire and forget - don't await
    this.metricsService.recordRequest({
      path,
      method,
      statusCode,
      duration,
      timestamp: Date.now(),
    });
  }
}
