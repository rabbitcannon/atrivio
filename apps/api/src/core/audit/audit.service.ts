import type { OrgId, UserId } from '@atrivio/shared';
import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';

/**
 * Audit event types for platform-level actions
 */
export type AuditAction =
  // Organization lifecycle
  | 'organization.created'
  | 'organization.updated'
  | 'organization.suspended'
  | 'organization.reactivated'
  | 'organization.deleted'
  // Subscription events
  | 'subscription.created'
  | 'subscription.upgraded'
  | 'subscription.downgraded'
  | 'subscription.canceled'
  | 'subscription.payment_failed'
  // Stripe Connect events
  | 'stripe.account_created'
  | 'stripe.account_connected'
  | 'stripe.account_restricted'
  | 'stripe.account_disabled'
  | 'stripe.payout_failed'
  // User events
  | 'user.registered'
  | 'user.updated'
  | 'user.deleted'
  | 'user.super_admin_granted'
  | 'user.super_admin_revoked'
  | 'user.impersonated'
  // Feature flags
  | 'feature_flag.created'
  | 'feature_flag.updated'
  | 'feature_flag.deleted'
  | 'feature.enabled'
  | 'feature.disabled'
  // Platform settings
  | 'setting.updated'
  // Announcements
  | 'announcement.created'
  | 'announcement.updated'
  | 'announcement.deleted'
  // Rate limits
  | 'rate_limit.created'
  | 'rate_limit.updated'
  | 'rate_limit.deleted'
  // System events
  | 'system.error'
  | 'system.maintenance_enabled'
  | 'system.maintenance_disabled';

export type ActorType = 'user' | 'system' | 'api_key' | 'webhook';

export type ResourceType =
  | 'organization'
  | 'user'
  | 'subscription'
  | 'stripe_account'
  | 'feature_flag'
  | 'platform_setting'
  | 'announcement'
  | 'rate_limit'
  | 'system';

export interface AuditEventParams {
  actorId?: UserId | null | undefined;
  actorType?: ActorType;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId?: string | null | undefined;
  orgId?: OrgId | null | undefined;
  changes?: Record<string, { from?: unknown; to?: unknown }> | null | undefined;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null | undefined;
  userAgent?: string | null | undefined;
}

/**
 * Platform-level actions that should appear in super admin dashboard
 * These have no org_id or are platform-wide significance
 */
const PLATFORM_ACTIONS: AuditAction[] = [
  'organization.created',
  'organization.suspended',
  'organization.reactivated',
  'organization.deleted',
  'subscription.created',
  'subscription.upgraded',
  'subscription.downgraded',
  'subscription.canceled',
  'subscription.payment_failed',
  'stripe.account_created',
  'stripe.account_connected',
  'stripe.account_restricted',
  'stripe.account_disabled',
  'stripe.payout_failed',
  'user.registered',
  'user.super_admin_granted',
  'user.super_admin_revoked',
  'user.impersonated',
  'user.deleted',
  'feature_flag.created',
  'feature_flag.updated',
  'feature_flag.deleted',
  'setting.updated',
  'announcement.created',
  'announcement.updated',
  'announcement.deleted',
  'rate_limit.created',
  'rate_limit.updated',
  'rate_limit.deleted',
  'system.error',
  'system.maintenance_enabled',
  'system.maintenance_disabled',
];

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private supabase: SupabaseService) {}

  /**
   * Log an audit event
   */
  async log(params: AuditEventParams): Promise<string | null> {
    const {
      actorId = null,
      actorType = actorId ? 'user' : 'system',
      action,
      resourceType,
      resourceId = null,
      orgId = null,
      changes = null,
      metadata = {},
      ipAddress = null,
      userAgent = null,
    } = params;

    try {
      const { data, error } = await this.supabase.adminClient
        .from('audit_logs')
        .insert({
          actor_id: actorId,
          actor_type: actorType,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          org_id: orgId,
          changes,
          metadata: {
            ...metadata,
            is_platform_event: PLATFORM_ACTIONS.includes(action),
          },
          ip_address: ipAddress,
          user_agent: userAgent,
        })
        .select('id')
        .single();

      if (error) {
        this.logger.error(`Failed to log audit event: ${error.message}`, {
          action,
          resourceType,
          resourceId,
        });
        return null;
      }

      this.logger.debug(`Audit logged: ${action} on ${resourceType}/${resourceId || 'n/a'}`);
      return data.id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Audit logging failed: ${message}`);
      return null;
    }
  }

  /**
   * Get recent platform-level activity for super admin dashboard
   */
  async getRecentPlatformActivity(limit = 10): Promise<
    Array<{
      id: string;
      action: string;
      resource_type: string;
      resource_id: string | null;
      org_id: string | null;
      actor_type: ActorType;
      created_at: string;
      actor: {
        id: string | null;
        email: string | null;
        display_name: string | null;
      } | null;
      metadata: Record<string, unknown>;
      org_name?: string | null;
    }>
  > {
    // Get platform-level events (either no org or platform-significant actions)
    const { data, error } = await this.supabase.adminClient
      .from('audit_logs')
      .select(
        `
        id,
        action,
        resource_type,
        resource_id,
        org_id,
        actor_type,
        created_at,
        metadata,
        actor:profiles!audit_logs_actor_id_fkey (
          id,
          email,
          display_name
        )
      `
      )
      .in('action', PLATFORM_ACTIONS)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      this.logger.error(`Failed to fetch platform activity: ${error.message}`);
      return [];
    }

    // Fetch org names for events that have org_id
    const orgIds = [...new Set(data?.filter((d) => d.org_id).map((d) => d.org_id))];
    let orgNames: Record<string, string> = {};

    if (orgIds.length > 0) {
      const { data: orgs } = await this.supabase.adminClient
        .from('organizations')
        .select('id, name')
        .in('id', orgIds);

      if (orgs) {
        orgNames = Object.fromEntries(orgs.map((o) => [o.id, o.name]));
      }
    }

    return (data || []).map((row) => ({
      id: row.id,
      action: row.action,
      resource_type: row.resource_type,
      resource_id: row.resource_id,
      org_id: row.org_id,
      actor_type: (row.actor_type as ActorType) || 'system',
      created_at: row.created_at,
      actor: (Array.isArray(row.actor) ? row.actor[0] : row.actor) as {
        id: string | null;
        email: string | null;
        display_name: string | null;
      } | null,
      metadata: (row.metadata as Record<string, unknown>) || {},
      org_name: row.org_id ? orgNames[row.org_id] || null : null,
    }));
  }

  /**
   * Get paginated audit logs with filtering
   */
  async getAuditLogs(options: {
    page?: number;
    limit?: number;
    action?: string;
    resourceType?: string;
    orgId?: string;
    actorId?: string;
    startDate?: string;
    endDate?: string;
    platformOnly?: boolean;
  }): Promise<{
    data: Array<{
      id: string;
      action: string;
      resource_type: string;
      resource_id: string | null;
      org_id: string | null;
      changes: Record<string, unknown> | null;
      metadata: Record<string, unknown>;
      ip_address: string | null;
      created_at: string;
      actor: {
        id: string | null;
        email: string | null;
        display_name: string | null;
      } | null;
      org_name?: string | null;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const {
      page = 1,
      limit = 50,
      action,
      resourceType,
      orgId,
      actorId,
      startDate,
      endDate,
      platformOnly = false,
    } = options;

    const offset = (page - 1) * limit;

    // Build query
    let query = this.supabase.adminClient
      .from('audit_logs')
      .select(
        `
        id,
        action,
        resource_type,
        resource_id,
        org_id,
        changes,
        metadata,
        ip_address,
        created_at,
        actor:profiles!audit_logs_actor_id_fkey (
          id,
          email,
          display_name
        )
      `,
        { count: 'exact' }
      )
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (platformOnly) {
      query = query.in('action', PLATFORM_ACTIONS);
    }
    if (action) {
      query = query.eq('action', action);
    }
    if (resourceType) {
      query = query.eq('resource_type', resourceType);
    }
    if (orgId) {
      query = query.eq('org_id', orgId);
    }
    if (actorId) {
      query = query.eq('actor_id', actorId);
    }
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      this.logger.error(`Failed to fetch audit logs: ${error.message}`);
      return {
        data: [],
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }

    // Fetch org names
    const orgIds = [...new Set(data?.filter((d) => d.org_id).map((d) => d.org_id))];
    let orgNames: Record<string, string> = {};

    if (orgIds.length > 0) {
      const { data: orgs } = await this.supabase.adminClient
        .from('organizations')
        .select('id, name')
        .in('id', orgIds);

      if (orgs) {
        orgNames = Object.fromEntries(orgs.map((o) => [o.id, o.name]));
      }
    }

    const total = count || 0;

    return {
      data: (data || []).map((row) => ({
        id: row.id,
        action: row.action,
        resource_type: row.resource_type,
        resource_id: row.resource_id,
        org_id: row.org_id,
        changes: row.changes as Record<string, unknown> | null,
        metadata: (row.metadata as Record<string, unknown>) || {},
        ip_address: row.ip_address,
        created_at: row.created_at,
        actor: (Array.isArray(row.actor) ? row.actor[0] : row.actor) as {
          id: string | null;
          email: string | null;
          display_name: string | null;
        } | null,
        org_name: row.org_id ? orgNames[row.org_id] || null : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get distinct action types for filtering
   */
  async getDistinctActions(): Promise<string[]> {
    const { data } = await this.supabase.adminClient
      .from('audit_logs')
      .select('action')
      .limit(1000);

    if (!data) return [];

    return [...new Set(data.map((d) => d.action))].sort();
  }

  /**
   * Get distinct resource types for filtering
   */
  async getDistinctResourceTypes(): Promise<string[]> {
    const { data } = await this.supabase.adminClient
      .from('audit_logs')
      .select('resource_type')
      .limit(1000);

    if (!data) return [];

    return [...new Set(data.map((d) => d.resource_type))].sort();
  }
}
