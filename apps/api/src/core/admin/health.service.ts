import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import { MetricsService } from '../metrics/metrics.service.js';

export interface ServiceHealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency_ms: number;
  message?: string;
  last_check: string;
}

export interface SystemHealthResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: Record<string, ServiceHealthCheck>;
  metrics: {
    requests_per_minute: number;
    error_rate: number;
    avg_response_time_ms: number;
  };
  checked_at: string;
}

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private supabase: SupabaseService,
    private metricsService: MetricsService
  ) {}

  /**
   * Perform all health checks and return aggregated results
   */
  async checkAll(): Promise<SystemHealthResult> {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkStripe(),
      this.checkApi(),
    ]);

    const services: Record<string, ServiceHealthCheck> = {};
    for (const check of checks) {
      services[check.name] = check;
    }

    // Determine overall status
    const statuses = checks.map((c) => c.status);
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (statuses.includes('unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (statuses.includes('degraded')) {
      overallStatus = 'degraded';
    }

    // Log health checks to database for history
    await this.logHealthChecks(checks);

    return {
      status: overallStatus,
      services,
      metrics: await this.getRequestMetrics(),
      checked_at: new Date().toISOString(),
    };
  }

  /**
   * Check database connectivity and latency
   */
  async checkDatabase(): Promise<ServiceHealthCheck> {
    const start = Date.now();
    const name = 'database';

    try {
      const client = this.supabase.adminClient;

      // Simple query to test connection
      const { error } = await client.from('profiles').select('id').limit(1).single();

      const latency = Date.now() - start;

      // Even if no row found, connection is OK
      if (error && error.code !== 'PGRST116') {
        return {
          name,
          status: 'unhealthy',
          latency_ms: latency,
          message: error.message,
          last_check: new Date().toISOString(),
        };
      }

      // Check latency thresholds
      if (latency > 1000) {
        return {
          name,
          status: 'degraded',
          latency_ms: latency,
          message: 'High latency detected',
          last_check: new Date().toISOString(),
        };
      } else if (latency > 500) {
        return {
          name,
          status: 'degraded',
          latency_ms: latency,
          message: 'Elevated latency',
          last_check: new Date().toISOString(),
        };
      }

      return {
        name,
        status: 'healthy',
        latency_ms: latency,
        last_check: new Date().toISOString(),
      };
    } catch (err) {
      const latency = Date.now() - start;
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Database health check failed: ${message}`);

      return {
        name,
        status: 'unhealthy',
        latency_ms: latency,
        message,
        last_check: new Date().toISOString(),
      };
    }
  }

  /**
   * Check Redis connectivity (if configured)
   */
  async checkRedis(): Promise<ServiceHealthCheck> {
    const start = Date.now();
    const name = 'redis';
    const redisUrl = process.env['REDIS_URL'];

    if (!redisUrl) {
      return {
        name,
        status: 'healthy',
        latency_ms: 0,
        message: 'Not configured (optional)',
        last_check: new Date().toISOString(),
      };
    }

    try {
      // Dynamic import to avoid issues if ioredis not installed
      const { Redis } = await import('ioredis');
      const redis = new Redis(redisUrl, {
        connectTimeout: 5000,
        lazyConnect: true,
      });

      await redis.connect();
      await redis.ping();
      const latency = Date.now() - start;
      await redis.quit();

      if (latency > 100) {
        return {
          name,
          status: 'degraded',
          latency_ms: latency,
          message: 'High latency detected',
          last_check: new Date().toISOString(),
        };
      }

      return {
        name,
        status: 'healthy',
        latency_ms: latency,
        last_check: new Date().toISOString(),
      };
    } catch (err) {
      const latency = Date.now() - start;
      const message = err instanceof Error ? err.message : 'Connection failed';

      // If Redis is optional and fails, mark as degraded not unhealthy
      this.logger.warn(`Redis health check failed: ${message}`);

      return {
        name,
        status: 'degraded',
        latency_ms: latency,
        message: `Not available: ${message}`,
        last_check: new Date().toISOString(),
      };
    }
  }

  /**
   * Check Stripe API connectivity
   */
  async checkStripe(): Promise<ServiceHealthCheck> {
    const start = Date.now();
    const name = 'stripe';
    const stripeKey = process.env['STRIPE_SECRET_KEY'];

    if (!stripeKey) {
      return {
        name,
        status: 'healthy',
        latency_ms: 0,
        message: 'Not configured',
        last_check: new Date().toISOString(),
      };
    }

    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeKey);

      // Light API call to check connectivity
      await stripe.balance.retrieve();
      const latency = Date.now() - start;

      if (latency > 2000) {
        return {
          name,
          status: 'degraded',
          latency_ms: latency,
          message: 'High latency detected',
          last_check: new Date().toISOString(),
        };
      }

      return {
        name,
        status: 'healthy',
        latency_ms: latency,
        last_check: new Date().toISOString(),
      };
    } catch (err) {
      const latency = Date.now() - start;
      const message = err instanceof Error ? err.message : 'API check failed';
      this.logger.error(`Stripe health check failed: ${message}`);

      return {
        name,
        status: 'unhealthy',
        latency_ms: latency,
        message,
        last_check: new Date().toISOString(),
      };
    }
  }

  /**
   * Self-check for API server
   */
  async checkApi(): Promise<ServiceHealthCheck> {
    const start = Date.now();
    const name = 'api';

    try {
      // Check memory usage
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
      const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;

      const latency = Date.now() - start;
      let status: 'healthy' | 'degraded' = 'healthy';
      let message = `Memory: ${heapUsedMB}MB / ${heapTotalMB}MB`;

      if (heapUsagePercent > 90) {
        status = 'degraded';
        message = `High memory usage: ${heapUsagePercent.toFixed(1)}%`;
      } else if (heapUsagePercent > 80) {
        status = 'degraded';
        message = `Elevated memory usage: ${heapUsagePercent.toFixed(1)}%`;
      }

      return {
        name,
        status,
        latency_ms: latency,
        message,
        last_check: new Date().toISOString(),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Self-check failed';
      return {
        name,
        status: 'unhealthy',
        latency_ms: Date.now() - start,
        message,
        last_check: new Date().toISOString(),
      };
    }
  }

  /**
   * Log health check results to database
   */
  private async logHealthChecks(checks: ServiceHealthCheck[]): Promise<void> {
    const client = this.supabase.adminClient;

    try {
      const logs = checks.map((check) => ({
        service: check.name,
        status: check.status,
        latency_ms: check.latency_ms,
        message: check.message || null,
        checked_at: check.last_check,
      }));

      await client.from('system_health_logs').insert(logs);
    } catch (err) {
      // Don't fail the health check if logging fails
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Failed to log health checks: ${message}`);
    }
  }

  /**
   * Get request metrics from recent requests (last 60 seconds)
   */
  private async getRequestMetrics(): Promise<{
    requests_per_minute: number;
    error_rate: number;
    avg_response_time_ms: number;
  }> {
    const metrics = await this.metricsService.getAggregatedMetrics(60);
    return {
      requests_per_minute: metrics.requests_per_minute,
      error_rate: metrics.error_rate,
      avg_response_time_ms: metrics.avg_response_time_ms,
    };
  }
}
