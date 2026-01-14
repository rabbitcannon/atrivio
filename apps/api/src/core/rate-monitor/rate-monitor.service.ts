import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Injectable, Logger } from '@nestjs/common';
import type { Redis } from 'ioredis';
import { SupabaseService } from '../../shared/database/supabase.service.js';

/**
 * Traffic data point for monitoring
 */
export interface TrafficDataPoint {
  endpoint: string;
  method: string;
  userId: string | null;
  orgId: string | null;
  ip: string;
  timestamp: number;
}

/**
 * Aggregated traffic stats for an endpoint
 */
export interface EndpointStats {
  endpoint: string;
  requestCount: number;
  uniqueUsers: number;
  uniqueIps: number;
  requestsPerMinute: number;
}

/**
 * User traffic stats
 */
export interface UserTrafficStats {
  userId: string;
  email?: string;
  requestCount: number;
  topEndpoints: { endpoint: string; count: number }[];
  wouldBeThrottled: boolean;
  throttleDetails?: {
    endpoint: string;
    limit: number;
    actual: number;
  };
}

/**
 * Rate limit violation (would-be throttle)
 */
export interface ThrottleEvent {
  userId: string | null;
  ip: string;
  endpoint: string;
  ruleName: string;
  limit: number;
  actual: number;
  timestamp: number;
}

/**
 * Cached rate limit rule
 */
interface RateLimitRule {
  id: string;
  name: string;
  endpoint_pattern: string;
  requests_per_minute: number;
  requests_per_hour: number | null;
  applies_to: 'all' | 'authenticated' | 'anonymous' | 'specific_orgs';
  enabled: boolean;
}

/**
 * Service for monitoring API traffic and detecting would-be rate limit violations.
 * Does NOT enforce rate limits - only logs and tracks for visibility.
 */
@Injectable()
export class RateMonitorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RateMonitorService.name);
  private redis: Redis | null = null;
  private rules: RateLimitRule[] = [];
  private rulesRefreshInterval: NodeJS.Timeout | null = null;

  // Redis key prefixes
  private readonly TRAFFIC_KEY = 'api:traffic:requests';
  private readonly THROTTLE_KEY = 'api:traffic:throttle_events';
  private readonly USER_TRAFFIC_PREFIX = 'api:traffic:user:';
  private readonly ENDPOINT_TRAFFIC_PREFIX = 'api:traffic:endpoint:';
  private readonly TTL_SECONDS = 3600; // 1 hour of data retention

  constructor(private supabase: SupabaseService) {}

  async onModuleInit() {
    const redisUrl = process.env['REDIS_URL'];
    if (!redisUrl) {
      this.logger.warn('REDIS_URL not configured - traffic monitoring disabled');
      return;
    }

    try {
      const { Redis } = await import('ioredis');
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
      await this.redis.connect();
      this.logger.log('Rate monitor service connected to Redis');

      // Load rate limit rules
      await this.refreshRules();

      // Refresh rules every 5 minutes
      this.rulesRefreshInterval = setInterval(
        () => this.refreshRules(),
        5 * 60 * 1000
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.warn(`Failed to connect to Redis for rate monitoring: ${message}`);
      this.redis = null;
    }
  }

  async onModuleDestroy() {
    if (this.rulesRefreshInterval) {
      clearInterval(this.rulesRefreshInterval);
    }
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }

  /**
   * Refresh rate limit rules from database
   */
  private async refreshRules(): Promise<void> {
    try {
      const { data, error } = await this.supabase.adminClient
        .from('rate_limit_rules')
        .select('*')
        .eq('enabled', true);

      if (error) {
        this.logger.warn(`Failed to load rate limit rules: ${error.message}`);
        return;
      }

      this.rules = (data || []) as RateLimitRule[];
      this.logger.debug(`Loaded ${this.rules.length} rate limit rules`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.warn(`Failed to refresh rate limit rules: ${message}`);
    }
  }

  /**
   * Record a request and check if it would exceed rate limits
   */
  async recordRequest(data: TrafficDataPoint): Promise<void> {
    if (!this.redis) return;

    try {
      const now = Date.now();
      const minuteKey = Math.floor(now / 60000); // Bucket by minute

      // Fire and forget - don't await these operations
      const pipeline = this.redis.pipeline();

      // Track overall traffic
      pipeline.zadd(this.TRAFFIC_KEY, now, JSON.stringify(data));
      pipeline.zremrangebyscore(this.TRAFFIC_KEY, '-inf', now - this.TTL_SECONDS * 1000);

      // Track per-user traffic (if authenticated)
      if (data.userId) {
        const userKey = `${this.USER_TRAFFIC_PREFIX}${data.userId}:${minuteKey}`;
        pipeline.hincrby(userKey, data.endpoint, 1);
        pipeline.expire(userKey, this.TTL_SECONDS);
      }

      // Track per-endpoint traffic
      const endpointKey = `${this.ENDPOINT_TRAFFIC_PREFIX}${this.normalizeEndpoint(data.endpoint)}:${minuteKey}`;
      pipeline.hincrby(endpointKey, 'count', 1);
      pipeline.sadd(`${endpointKey}:users`, data.userId || data.ip);
      pipeline.sadd(`${endpointKey}:ips`, data.ip);
      pipeline.expire(endpointKey, this.TTL_SECONDS);
      pipeline.expire(`${endpointKey}:users`, this.TTL_SECONDS);
      pipeline.expire(`${endpointKey}:ips`, this.TTL_SECONDS);

      await pipeline.exec();

      // Check for would-be throttle violations (async, non-blocking)
      this.checkThrottleViolation(data).catch(() => {
        // Ignore errors in background check
      });
    } catch {
      // Don't let monitoring failures affect the app
    }
  }

  /**
   * Check if a request would have been throttled
   */
  private async checkThrottleViolation(data: TrafficDataPoint): Promise<void> {
    if (!this.redis) return;

    const now = Date.now();
    const minuteKey = Math.floor(now / 60000);

    for (const rule of this.rules) {
      if (!this.matchesEndpoint(data.endpoint, rule.endpoint_pattern)) continue;
      if (!this.matchesScope(data, rule)) continue;

      // Get current count for this user/ip on this endpoint
      let count = 0;
      if (data.userId) {
        const userKey = `${this.USER_TRAFFIC_PREFIX}${data.userId}:${minuteKey}`;
        const val = await this.redis.hget(userKey, data.endpoint);
        count = val ? parseInt(val, 10) : 0;
      } else {
        // For anonymous, track by IP
        const ipKey = `${this.USER_TRAFFIC_PREFIX}ip:${data.ip}:${minuteKey}`;
        const val = await this.redis.hget(ipKey, data.endpoint);
        count = val ? parseInt(val, 10) : 0;
      }

      // Check if would exceed limit
      if (count >= rule.requests_per_minute) {
        const event: ThrottleEvent = {
          userId: data.userId,
          ip: data.ip,
          endpoint: data.endpoint,
          ruleName: rule.name,
          limit: rule.requests_per_minute,
          actual: count,
          timestamp: now,
        };

        // Log the would-be violation
        this.logger.warn(
          `Would-be throttle: ${data.userId || data.ip} on ${data.endpoint} - ${count}/${rule.requests_per_minute} req/min (${rule.name})`
        );

        // Store for dashboard
        await this.redis.zadd(this.THROTTLE_KEY, now, JSON.stringify(event));
        await this.redis.zremrangebyscore(this.THROTTLE_KEY, '-inf', now - this.TTL_SECONDS * 1000);
      }
    }
  }

  /**
   * Check if endpoint matches a pattern (supports * wildcard)
   */
  private matchesEndpoint(endpoint: string, pattern: string): boolean {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars except *
      .replace(/\*/g, '.*'); // Convert * to .*

    return new RegExp(`^${regexPattern}$`).test(endpoint);
  }

  /**
   * Check if request matches rule scope
   */
  private matchesScope(data: TrafficDataPoint, rule: RateLimitRule): boolean {
    switch (rule.applies_to) {
      case 'all':
        return true;
      case 'authenticated':
        return data.userId !== null;
      case 'anonymous':
        return data.userId === null;
      case 'specific_orgs':
        // Would need to check org_ids array - skip for now
        return false;
      default:
        return true;
    }
  }

  /**
   * Normalize endpoint for grouping (replace IDs with placeholders)
   */
  private normalizeEndpoint(endpoint: string): string {
    return endpoint
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
      .replace(/\/\d+/g, '/:num');
  }

  /**
   * Get traffic statistics for the dashboard
   */
  async getTrafficStats(windowMinutes: number = 60): Promise<{
    totalRequests: number;
    requestsPerMinute: number;
    topEndpoints: EndpointStats[];
    topUsers: UserTrafficStats[];
    recentThrottleEvents: ThrottleEvent[];
    trafficOverTime: { minute: number; count: number }[];
  }> {
    if (!this.redis) {
      return {
        totalRequests: 0,
        requestsPerMinute: 0,
        topEndpoints: [],
        topUsers: [],
        recentThrottleEvents: [],
        trafficOverTime: [],
      };
    }

    const now = Date.now();
    const windowStart = now - windowMinutes * 60 * 1000;

    try {
      // Get all traffic data points in window
      const trafficData = await this.redis.zrangebyscore(
        this.TRAFFIC_KEY,
        windowStart,
        now
      );

      // Parse and aggregate
      const endpointCounts: Record<string, { count: number; users: Set<string>; ips: Set<string> }> = {};
      const userCounts: Record<string, { count: number; endpoints: Record<string, number> }> = {};
      const timeSeriesData: Record<number, number> = {};

      for (const raw of trafficData) {
        try {
          const point = JSON.parse(raw) as TrafficDataPoint;
          const normalizedEndpoint = this.normalizeEndpoint(point.endpoint);
          const minuteBucket = Math.floor(point.timestamp / 60000);

          // Endpoint stats
          if (!endpointCounts[normalizedEndpoint]) {
            endpointCounts[normalizedEndpoint] = { count: 0, users: new Set(), ips: new Set() };
          }
          endpointCounts[normalizedEndpoint].count++;
          if (point.userId) endpointCounts[normalizedEndpoint].users.add(point.userId);
          endpointCounts[normalizedEndpoint].ips.add(point.ip);

          // User stats
          if (point.userId) {
            let userStats = userCounts[point.userId];
            if (!userStats) {
              userStats = { count: 0, endpoints: {} };
              userCounts[point.userId] = userStats;
            }
            userStats.count++;
            userStats.endpoints[normalizedEndpoint] =
              (userStats.endpoints[normalizedEndpoint] || 0) + 1;
          }

          // Time series
          timeSeriesData[minuteBucket] = (timeSeriesData[minuteBucket] || 0) + 1;
        } catch {
          // Skip invalid entries
        }
      }

      // Get throttle events
      const throttleData = await this.redis.zrangebyscore(
        this.THROTTLE_KEY,
        windowStart,
        now
      );
      const throttleEvents: ThrottleEvent[] = throttleData
        .map((raw) => {
          try {
            return JSON.parse(raw) as ThrottleEvent;
          } catch {
            return null;
          }
        })
        .filter((e): e is ThrottleEvent => e !== null)
        .slice(-50); // Last 50 events

      // Format top endpoints
      const topEndpoints: EndpointStats[] = Object.entries(endpointCounts)
        .map(([endpoint, stats]) => ({
          endpoint,
          requestCount: stats.count,
          uniqueUsers: stats.users.size,
          uniqueIps: stats.ips.size,
          requestsPerMinute: Math.round((stats.count / windowMinutes) * 10) / 10,
        }))
        .sort((a, b) => b.requestCount - a.requestCount)
        .slice(0, 20);

      // Format top users
      const topUsers: UserTrafficStats[] = Object.entries(userCounts)
        .map(([userId, stats]) => ({
          userId,
          requestCount: stats.count,
          topEndpoints: Object.entries(stats.endpoints)
            .map(([endpoint, count]) => ({ endpoint, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5),
          wouldBeThrottled: throttleEvents.some((e) => e.userId === userId),
        }))
        .sort((a, b) => b.requestCount - a.requestCount)
        .slice(0, 20);

      // Format time series
      const trafficOverTime = Object.entries(timeSeriesData)
        .map(([minute, count]) => ({ minute: parseInt(minute, 10), count }))
        .sort((a, b) => a.minute - b.minute);

      const totalRequests = trafficData.length;

      return {
        totalRequests,
        requestsPerMinute: Math.round((totalRequests / windowMinutes) * 10) / 10,
        topEndpoints,
        topUsers,
        recentThrottleEvents: throttleEvents.reverse(),
        trafficOverTime,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Failed to get traffic stats: ${message}`);
      return {
        totalRequests: 0,
        requestsPerMinute: 0,
        topEndpoints: [],
        topUsers: [],
        recentThrottleEvents: [],
        trafficOverTime: [],
      };
    }
  }

  /**
   * Get real-time traffic snapshot
   */
  async getRealTimeStats(): Promise<{
    currentMinuteRequests: number;
    activeUsers: number;
    activeIps: number;
    throttleEventsLastHour: number;
  }> {
    if (!this.redis) {
      return {
        currentMinuteRequests: 0,
        activeUsers: 0,
        activeIps: 0,
        throttleEventsLastHour: 0,
      };
    }

    const now = Date.now();
    const minuteStart = now - 60000;
    const hourStart = now - 3600000;

    try {
      const [currentMinute, throttleCount] = await Promise.all([
        this.redis.zcount(this.TRAFFIC_KEY, minuteStart, now),
        this.redis.zcount(this.THROTTLE_KEY, hourStart, now),
      ]);

      // Get unique users/IPs from last minute
      const recentTraffic = await this.redis.zrangebyscore(
        this.TRAFFIC_KEY,
        minuteStart,
        now
      );

      const users = new Set<string>();
      const ips = new Set<string>();

      for (const raw of recentTraffic) {
        try {
          const point = JSON.parse(raw) as TrafficDataPoint;
          if (point.userId) users.add(point.userId);
          ips.add(point.ip);
        } catch {
          // Skip invalid
        }
      }

      return {
        currentMinuteRequests: currentMinute,
        activeUsers: users.size,
        activeIps: ips.size,
        throttleEventsLastHour: throttleCount,
      };
    } catch {
      return {
        currentMinuteRequests: 0,
        activeUsers: 0,
        activeIps: 0,
        throttleEventsLastHour: 0,
      };
    }
  }

  /**
   * Check if monitoring is available
   */
  isAvailable(): boolean {
    return this.redis !== null;
  }
}
