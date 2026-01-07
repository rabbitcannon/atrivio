import { Injectable, Logger } from '@nestjs/common';
import type { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import type { Redis } from 'ioredis';

/**
 * Request metrics data point
 */
export interface RequestMetric {
  path: string;
  method: string;
  statusCode: number;
  duration: number;
  timestamp: number;
}

/**
 * Aggregated metrics for health checks
 */
export interface AggregatedMetrics {
  requests_per_minute: number;
  error_rate: number;
  avg_response_time_ms: number;
  total_requests: number;
  error_count: number;
}

/**
 * Service for collecting and aggregating request metrics
 * Uses Redis for storage with automatic expiration
 */
@Injectable()
export class MetricsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MetricsService.name);
  private redis: Redis | null = null;
  private readonly METRICS_KEY = 'api:metrics:requests';
  private readonly METRICS_TTL = 300; // 5 minutes of data retention

  async onModuleInit() {
    const redisUrl = process.env['REDIS_URL'];
    if (!redisUrl) {
      this.logger.warn('REDIS_URL not configured - metrics will not be collected');
      return;
    }

    try {
      const { Redis } = await import('ioredis');
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
      await this.redis.connect();
      this.logger.log('Metrics service connected to Redis');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.warn(`Failed to connect to Redis for metrics: ${message}`);
      this.redis = null;
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }

  /**
   * Record a request metric
   */
  async recordRequest(metric: RequestMetric): Promise<void> {
    if (!this.redis) {
      return; // Silently skip if Redis not available
    }

    try {
      const data = JSON.stringify(metric);
      const score = metric.timestamp;

      // Add to sorted set with timestamp as score
      await this.redis.zadd(this.METRICS_KEY, score, data);

      // Remove old entries (older than TTL)
      const cutoff = Date.now() - this.METRICS_TTL * 1000;
      await this.redis.zremrangebyscore(this.METRICS_KEY, '-inf', cutoff);
    } catch (err) {
      // Don't let metrics collection failures affect the app
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.debug(`Failed to record metric: ${message}`);
    }
  }

  /**
   * Get aggregated metrics for the last N seconds
   */
  async getAggregatedMetrics(windowSeconds: number = 60): Promise<AggregatedMetrics> {
    const defaultMetrics: AggregatedMetrics = {
      requests_per_minute: 0,
      error_rate: 0,
      avg_response_time_ms: 0,
      total_requests: 0,
      error_count: 0,
    };

    if (!this.redis) {
      return defaultMetrics;
    }

    try {
      const now = Date.now();
      const windowStart = now - windowSeconds * 1000;

      // Get all metrics within the window
      const results = await this.redis.zrangebyscore(
        this.METRICS_KEY,
        windowStart,
        now,
      );

      if (results.length === 0) {
        return defaultMetrics;
      }

      // Parse and aggregate
      let totalDuration = 0;
      let errorCount = 0;
      const metrics: RequestMetric[] = [];

      for (const result of results) {
        try {
          const metric = JSON.parse(result) as RequestMetric;
          metrics.push(metric);
          totalDuration += metric.duration;
          if (metric.statusCode >= 400) {
            errorCount++;
          }
        } catch {
          // Skip invalid entries
        }
      }

      const totalRequests = metrics.length;
      const requestsPerMinute = (totalRequests / windowSeconds) * 60;
      const errorRate = totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;
      const avgResponseTime = totalRequests > 0 ? totalDuration / totalRequests : 0;

      return {
        requests_per_minute: Math.round(requestsPerMinute * 10) / 10,
        error_rate: Math.round(errorRate * 100) / 100,
        avg_response_time_ms: Math.round(avgResponseTime),
        total_requests: totalRequests,
        error_count: errorCount,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.debug(`Failed to get aggregated metrics: ${message}`);
      return defaultMetrics;
    }
  }

  /**
   * Check if metrics collection is available
   */
  isAvailable(): boolean {
    return this.redis !== null;
  }
}
