import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type {
  ListUsersDto,
  UpdateUserDto,
  DeleteUserDto,
  ListOrganizationsDto,
  UpdateOrganizationDto,
  SuspendOrganizationDto,
  DeleteOrganizationDto,
  SetOrgPlatformFeeDto,
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
  UpdateSettingDto,
  MaintenanceModeDto,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  ListAuditLogsDto,
  HealthHistoryDto,
  CreateRateLimitDto,
  UpdateRateLimitDto,
} from './dto/admin.dto.js';

// Type helpers for Supabase query results
type AnyRecord = Record<string, unknown>;

@Injectable()
export class AdminService {
  constructor(private supabase: SupabaseService) {}

  // ============================================================================
  // DASHBOARD
  // ============================================================================

  async getDashboardStats() {
    const client = this.supabase.adminClient;

    // Today's date boundaries in UTC
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setUTCHours(23, 59, 59, 999);

    // Get counts in parallel
    const [
      { count: totalUsers },
      { count: totalOrgs },
      { count: totalAttractions },
      healthLogs,
      todayOrders,
      todayTickets,
    ] = await Promise.all([
      client.from('profiles').select('*', { count: 'exact', head: true }),
      client.from('organizations').select('*', { count: 'exact', head: true }),
      client.from('attractions').select('*', { count: 'exact', head: true }),
      client
        .from('system_health_logs')
        .select('service, status, latency_ms, checked_at')
        .order('checked_at', { ascending: false })
        .limit(10),
      // Today's completed orders for revenue
      client
        .from('orders')
        .select('total')
        .gte('completed_at', todayStart.toISOString())
        .lte('completed_at', todayEnd.toISOString())
        .in('status', ['completed', 'partially_refunded']),
      // Today's tickets sold (count of order_items)
      client
        .from('order_items')
        .select('quantity, orders!inner(completed_at, status)')
        .gte('orders.completed_at', todayStart.toISOString())
        .lte('orders.completed_at', todayEnd.toISOString())
        .in('orders.status', ['completed', 'partially_refunded']),
    ]);

    // Calculate today's revenue
    const revenueToday = ((todayOrders.data || []) as AnyRecord[])
      .reduce((sum, order) => sum + (Number(order['total']) || 0), 0);

    // Calculate today's ticket count
    const ticketsSoldToday = ((todayTickets.data || []) as AnyRecord[])
      .reduce((sum, item) => sum + (Number(item['quantity']) || 0), 0);

    // Get growth stats (7d and 30d)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      { count: users7d },
      { count: users30d },
      { count: orgs7d },
      { count: orgs30d },
    ] = await Promise.all([
      client
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),
      client
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo),
      client
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),
      client
        .from('organizations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo),
    ]);

    // Build health status from recent logs
    const healthStatus: Record<string, string> = {};
    const seen = new Set<string>();

    for (const log of (healthLogs.data || []) as AnyRecord[]) {
      const service = log['service'] as string;
      if (!seen.has(service)) {
        seen.add(service);
        healthStatus[service] = log['status'] as string;
      }
    }

    // Get recent activity (audit logs)
    const { data: recentActivity } = await client
      .from('audit_logs')
      .select(`
        action,
        resource_type,
        created_at,
        actor:profiles!actor_id(first_name, last_name, email)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      stats: {
        total_users: totalUsers || 0,
        total_organizations: totalOrgs || 0,
        total_attractions: totalAttractions || 0,
        active_seasons: 0, // Seasons feature not yet implemented
        tickets_sold_today: ticketsSoldToday,
        revenue_today: revenueToday, // In cents
      },
      growth: {
        users_7d: users7d || 0,
        users_30d: users30d || 0,
        orgs_7d: orgs7d || 0,
        orgs_30d: orgs30d || 0,
      },
      health: healthStatus,
      recent_activity: recentActivity || [],
    };
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  async listUsers(dto: ListUsersDto) {
    const client = this.supabase.adminClient;
    const { page = 1, limit = 20, search, is_super_admin, created_after, created_before, has_orgs } = dto;

    let query = client
      .from('profiles')
      .select(`
        id,
        email,
        first_name,
        last_name,
        avatar_url,
        is_super_admin,
        created_at,
        updated_at
      `, { count: 'exact' });

    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    if (is_super_admin !== undefined) {
      query = query.eq('is_super_admin', is_super_admin);
    }

    if (created_after) {
      query = query.gte('created_at', created_after);
    }

    if (created_before) {
      query = query.lte('created_at', created_before);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data, count, error } = await query;

    if (error) {
      throw new BadRequestException({
        code: 'USER_LIST_FAILED',
        message: error.message,
      });
    }

    // Get org counts for each user
    const userIds = ((data || []) as AnyRecord[]).map((u) => u['id'] as string);
    const { data: memberships } = await client
      .from('org_memberships')
      .select('user_id, org_id, role, organizations(id, name)')
      .in('user_id', userIds)
      .eq('status', 'active');

    // Group memberships by user
    const userOrgs: Record<string, Array<{ id: string; name: string; role: string }>> = {};
    for (const m of (memberships || []) as AnyRecord[]) {
      const userId = m['user_id'] as string;
      if (!userOrgs[userId]) {
        userOrgs[userId] = [];
      }
      const org = m['organizations'] as AnyRecord;
      if (org) {
        userOrgs[userId].push({
          id: org['id'] as string,
          name: org['name'] as string,
          role: m['role'] as string,
        });
      }
    }

    // Filter by has_orgs if specified
    let filteredData = (data || []) as AnyRecord[];
    if (has_orgs !== undefined) {
      filteredData = filteredData.filter((u) => {
        const userId = u['id'] as string;
        const hasOrgsCount = (userOrgs[userId]?.length || 0) > 0;
        return has_orgs ? hasOrgsCount : !hasOrgsCount;
      });
    }

    return {
      data: filteredData.map((u) => {
        const userId = u['id'] as string;
        return {
          ...u,
          org_count: userOrgs[userId]?.length || 0,
          organizations: userOrgs[userId] || [],
        };
      }),
      meta: {
        total: count || 0,
        page,
        limit,
      },
    };
  }

  async getUser(userId: string) {
    const client = this.supabase.adminClient;

    const { data: user, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    // Get organizations
    const { data: memberships } = await client
      .from('org_memberships')
      .select(`
        role,
        is_owner,
        created_at,
        organizations(id, name, slug)
      `)
      .eq('user_id', userId)
      .eq('status', 'active');

    // Get recent audit log count
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: recentActions } = await client
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('actor_id', userId)
      .gte('created_at', thirtyDaysAgo);

    // Get last action
    const { data: lastAction } = await client
      .from('audit_logs')
      .select('created_at')
      .eq('actor_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return {
      ...user,
      organizations: ((memberships || []) as AnyRecord[]).map((m) => {
        const org = m['organizations'] as AnyRecord;
        return {
          id: org?.['id'] as string,
          name: org?.['name'] as string,
          slug: org?.['slug'] as string,
          role: m['role'] as string,
          is_owner: m['is_owner'] as boolean,
          joined_at: m['created_at'] as string,
        };
      }),
      audit_summary: {
        recent_actions: recentActions || 0,
        last_action_at: (lastAction as AnyRecord | null)?.['created_at'] || null,
      },
    };
  }

  async updateUser(userId: string, dto: UpdateUserDto, adminId: string) {
    if (userId === adminId && dto.is_super_admin === false) {
      throw new ForbiddenException({
        code: 'ADMIN_ACTION_FORBIDDEN',
        message: 'Cannot remove your own super admin status',
      });
    }

    const client = this.supabase.adminClient;

    // Get current state for audit log
    const { data: current } = await client
      .from('profiles')
      .select('is_super_admin, email')
      .eq('id', userId)
      .single();

    if (!current) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    const updateData: AnyRecord = {
      updated_at: new Date().toISOString(),
    };

    const changes: Record<string, { from: unknown; to: unknown }> = {};

    if (dto.is_super_admin !== undefined && dto.is_super_admin !== current.is_super_admin) {
      updateData['is_super_admin'] = dto.is_super_admin;
      changes['is_super_admin'] = { from: current.is_super_admin, to: dto.is_super_admin };
    }

    if (Object.keys(updateData).length === 1) {
      // Only updated_at, no actual changes
      return this.getUser(userId);
    }

    const { error } = await client.from('profiles').update(updateData).eq('id', userId);

    if (error) {
      throw new BadRequestException({
        code: 'USER_UPDATE_FAILED',
        message: error.message,
      });
    }

    // Log audit event
    await this.logAuditEvent({
      actorId: adminId,
      action: 'user.update',
      resourceType: 'user',
      resourceId: userId,
      changes,
    });

    return this.getUser(userId);
  }

  async deleteUser(userId: string, dto: DeleteUserDto, adminId: string) {
    if (!dto.confirm) {
      throw new BadRequestException({
        code: 'ADMIN_CONFIRMATION_REQUIRED',
        message: 'Deletion must be confirmed',
      });
    }

    if (userId === adminId) {
      throw new ForbiddenException({
        code: 'ADMIN_ACTION_FORBIDDEN',
        message: 'Cannot delete your own account',
      });
    }

    const client = this.supabase.adminClient;

    // Check user exists
    const { data: user } = await client.from('profiles').select('email').eq('id', userId).single();

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    // Soft delete by clearing PII and marking deleted
    const { error } = await client
      .from('profiles')
      .update({
        email: `deleted_${userId}@deleted.haunt.dev`,
        first_name: 'Deleted',
        last_name: 'User',
        phone: null,
        avatar_url: null,
        is_super_admin: false,
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw new BadRequestException({
        code: 'USER_DELETE_FAILED',
        message: error.message,
      });
    }

    // Log audit event
    await this.logAuditEvent({
      actorId: adminId,
      action: 'user.delete',
      resourceType: 'user',
      resourceId: userId,
      metadata: { reason: dto.reason, original_email: user.email },
    });

    return {
      message: 'User deleted',
      id: userId,
    };
  }

  async impersonateUser(userId: string, adminId: string) {
    const client = this.supabase.adminClient;

    // Check user exists
    const { data: user } = await client.from('profiles').select('email').eq('id', userId).single();

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    // Log audit event
    await this.logAuditEvent({
      actorId: adminId,
      action: 'user.impersonate',
      resourceType: 'user',
      resourceId: userId,
      metadata: { target_email: user.email },
    });

    // Note: Actual impersonation token generation would require
    // Supabase admin API or custom JWT signing
    // For now, return placeholder
    return {
      token: null, // Would be generated JWT
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
      warning: 'All actions will be logged',
      note: 'Impersonation requires additional Supabase configuration',
    };
  }

  // ============================================================================
  // ORGANIZATION MANAGEMENT
  // ============================================================================

  async listOrganizations(dto: ListOrganizationsDto) {
    const client = this.supabase.adminClient;
    const { page = 1, limit = 20, search, status, stripe_connected, created_after, created_before } = dto;

    let query = client
      .from('organizations')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (stripe_connected !== undefined) {
      query = query.eq('stripe_onboarding_complete', stripe_connected);
    }

    if (created_after) {
      query = query.gte('created_at', created_after);
    }

    if (created_before) {
      query = query.lte('created_at', created_before);
    }

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data, count, error } = await query;

    if (error) {
      throw new BadRequestException({
        code: 'ORG_LIST_FAILED',
        message: error.message,
      });
    }

    // Get owner and counts for each org
    const orgIds = ((data || []) as AnyRecord[]).map((o) => o['id'] as string);

    const [membershipsResult, attractionsResult, ordersResult] = await Promise.all([
      client
        .from('org_memberships')
        .select('org_id, user_id, role, is_owner, profiles(id, email, first_name, last_name)')
        .in('org_id', orgIds)
        .eq('status', 'active'),
      client
        .from('attractions')
        .select('org_id')
        .in('org_id', orgIds),
      client
        .from('orders')
        .select('org_id, total')
        .in('org_id', orgIds)
        .in('status', ['completed', 'partially_refunded']),
    ]);

    // Group data by org
    const orgOwners: Record<string, { id: string; email: string; name: string }> = {};
    const orgMemberCounts: Record<string, number> = {};
    const orgAttractionCounts: Record<string, number> = {};
    const orgRevenue: Record<string, number> = {};

    for (const m of (membershipsResult.data || []) as AnyRecord[]) {
      const orgId = m['org_id'] as string;
      orgMemberCounts[orgId] = (orgMemberCounts[orgId] || 0) + 1;
      if (m['is_owner'] && m['profiles']) {
        const p = m['profiles'] as AnyRecord;
        orgOwners[orgId] = {
          id: p['id'] as string,
          email: p['email'] as string,
          name: `${p['first_name'] || ''} ${p['last_name'] || ''}`.trim(),
        };
      }
    }

    for (const a of (attractionsResult.data || []) as AnyRecord[]) {
      const orgId = a['org_id'] as string;
      orgAttractionCounts[orgId] = (orgAttractionCounts[orgId] || 0) + 1;
    }

    for (const o of (ordersResult.data || []) as AnyRecord[]) {
      const orgId = o['org_id'] as string;
      orgRevenue[orgId] = (orgRevenue[orgId] || 0) + (Number(o['total']) || 0);
    }

    return {
      data: ((data || []) as AnyRecord[]).map((o) => {
        const orgId = o['id'] as string;
        return {
          id: orgId,
          name: o['name'] as string,
          slug: o['slug'] as string,
          status: o['status'] as string,
          owner: orgOwners[orgId] || null,
          member_count: orgMemberCounts[orgId] || 0,
          attraction_count: orgAttractionCounts[orgId] || 0,
          stripe_connected: o['stripe_onboarding_complete'] as boolean,
          total_revenue: orgRevenue[orgId] || 0, // In cents
          created_at: o['created_at'] as string,
        };
      }),
      meta: {
        total: count || 0,
        page,
        limit,
      },
    };
  }

  async getOrganization(orgId: string) {
    const client = this.supabase.adminClient;

    const { data: org, error } = await client
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (error || !org) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    // Get members, attractions, and order stats in parallel
    const [membersResult, attractionsResult, ordersResult, orderItemsResult] = await Promise.all([
      client
        .from('org_memberships')
        .select(`
          role,
          is_owner,
          profiles(id, email, first_name, last_name)
        `)
        .eq('org_id', orgId)
        .eq('status', 'active'),
      client
        .from('attractions')
        .select('id, name, status')
        .eq('org_id', orgId),
      // Total revenue from completed orders
      client
        .from('orders')
        .select('total')
        .eq('org_id', orgId)
        .in('status', ['completed', 'partially_refunded']),
      // Total tickets sold (sum of order item quantities)
      client
        .from('order_items')
        .select('quantity, orders!inner(org_id, status)')
        .eq('orders.org_id', orgId)
        .in('orders.status', ['completed', 'partially_refunded']),
    ]);

    const members = membersResult.data || [];
    const attractions = attractionsResult.data || [];

    // Calculate totals
    const totalRevenue = ((ordersResult.data || []) as AnyRecord[])
      .reduce((sum, order) => sum + (Number(order['total']) || 0), 0);
    const totalTicketsSold = ((orderItemsResult.data || []) as AnyRecord[])
      .reduce((sum, item) => sum + (Number(item['quantity']) || 0), 0);

    return {
      ...org,
      members: (members as AnyRecord[]).map((m) => {
        const p = m['profiles'] as AnyRecord;
        return {
          id: p?.['id'] as string,
          email: p?.['email'] as string,
          name: `${p?.['first_name'] || ''} ${p?.['last_name'] || ''}`.trim(),
          role: m['role'] as string,
          is_owner: m['is_owner'] as boolean,
        };
      }),
      attractions: attractions || [],
      stats: {
        total_tickets_sold: totalTicketsSold,
        total_revenue: totalRevenue, // In cents
        active_staff: members.length,
      },
    };
  }

  async updateOrganization(orgId: string, dto: UpdateOrganizationDto, adminId: string) {
    const client = this.supabase.adminClient;

    const { data: current } = await client.from('organizations').select('status').eq('id', orgId).single();

    if (!current) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    const changes: Record<string, { from: unknown; to: unknown }> = {};
    const updateData: AnyRecord = {
      updated_at: new Date().toISOString(),
    };

    if (dto.status && dto.status !== current.status) {
      updateData['status'] = dto.status;
      changes['status'] = { from: current.status, to: dto.status };
    }

    if (dto.notes) {
      updateData['admin_notes'] = dto.notes;
    }

    const { error } = await client.from('organizations').update(updateData).eq('id', orgId);

    if (error) {
      throw new BadRequestException({
        code: 'ORG_UPDATE_FAILED',
        message: error.message,
      });
    }

    await this.logAuditEvent({
      actorId: adminId,
      action: 'organization.update',
      resourceType: 'organization',
      resourceId: orgId,
      orgId,
      changes,
    });

    return this.getOrganization(orgId);
  }

  async suspendOrganization(orgId: string, dto: SuspendOrganizationDto, adminId: string) {
    const client = this.supabase.adminClient;

    const { data: org } = await client
      .from('organizations')
      .select('status, name')
      .eq('id', orgId)
      .single();

    if (!org) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    if (org.status === 'suspended') {
      throw new BadRequestException({
        code: 'ORG_ALREADY_SUSPENDED',
        message: 'Organization is already suspended',
      });
    }

    const { error } = await client
      .from('organizations')
      .update({
        status: 'suspended',
        suspended_at: new Date().toISOString(),
        suspension_reason: dto.reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgId);

    if (error) {
      throw new BadRequestException({
        code: 'ORG_SUSPEND_FAILED',
        message: error.message,
      });
    }

    await this.logAuditEvent({
      actorId: adminId,
      action: 'organization.suspend',
      resourceType: 'organization',
      resourceId: orgId,
      orgId,
      metadata: { reason: dto.reason, notify_owner: dto.notify_owner },
    });

    // TODO: Send email notification if dto.notify_owner

    return {
      message: 'Organization suspended',
      id: orgId,
      reason: dto.reason,
    };
  }

  async reactivateOrganization(orgId: string, adminId: string) {
    const client = this.supabase.adminClient;

    const { data: org } = await client.from('organizations').select('status').eq('id', orgId).single();

    if (!org) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    if (org.status !== 'suspended') {
      throw new BadRequestException({
        code: 'ORG_NOT_SUSPENDED',
        message: 'Organization is not suspended',
      });
    }

    const { error } = await client
      .from('organizations')
      .update({
        status: 'active',
        suspended_at: null,
        suspension_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgId);

    if (error) {
      throw new BadRequestException({
        code: 'ORG_REACTIVATE_FAILED',
        message: error.message,
      });
    }

    await this.logAuditEvent({
      actorId: adminId,
      action: 'organization.reactivate',
      resourceType: 'organization',
      resourceId: orgId,
      orgId,
    });

    return {
      message: 'Organization reactivated',
      id: orgId,
    };
  }

  async deleteOrganization(orgId: string, dto: DeleteOrganizationDto, adminId: string) {
    const client = this.supabase.adminClient;

    const { data: org } = await client.from('organizations').select('slug, name').eq('id', orgId).single();

    if (!org) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    if (dto.confirm_slug !== org.slug) {
      throw new BadRequestException({
        code: 'ADMIN_CONFIRMATION_REQUIRED',
        message: 'Organization slug does not match',
      });
    }

    const { error } = await client
      .from('organizations')
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgId);

    if (error) {
      throw new BadRequestException({
        code: 'ORG_DELETE_FAILED',
        message: error.message,
      });
    }

    await this.logAuditEvent({
      actorId: adminId,
      action: 'organization.delete',
      resourceType: 'organization',
      resourceId: orgId,
      orgId,
      metadata: { reason: dto.reason, org_name: org.name },
    });

    return {
      message: 'Organization deleted',
      id: orgId,
    };
  }

  async setOrgPlatformFee(orgId: string, dto: SetOrgPlatformFeeDto, adminId: string) {
    const client = this.supabase.adminClient;

    // Check org exists and get current fee
    const { data: org } = await client
      .from('organizations')
      .select('name, platform_fee_percent')
      .eq('id', orgId)
      .single();

    if (!org) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    const oldFee = org.platform_fee_percent;
    const newFee = dto.platform_fee_percent ?? null;

    const { error } = await client
      .from('organizations')
      .update({
        platform_fee_percent: newFee,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgId);

    if (error) {
      throw new BadRequestException({
        code: 'ORG_FEE_UPDATE_FAILED',
        message: error.message,
      });
    }

    await this.logAuditEvent({
      actorId: adminId,
      action: 'organization.platform_fee.update',
      resourceType: 'organization',
      resourceId: orgId,
      orgId,
      changes: { platform_fee_percent: { from: oldFee, to: newFee } },
      metadata: { org_name: org.name },
    });

    // Get the effective fee (with global fallback)
    return this.getOrgPlatformFee(orgId);
  }

  async getOrgPlatformFee(orgId: string) {
    const client = this.supabase.adminClient;

    // Get org-specific fee
    const { data: org, error: orgError } = await client
      .from('organizations')
      .select('name, platform_fee_percent')
      .eq('id', orgId)
      .single();

    if (orgError || !org) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    // Get global default
    const { data: setting } = await client
      .from('platform_settings')
      .select('value')
      .eq('key', 'stripe_platform_fee_percent')
      .single();

    const globalDefault = setting?.value ? Number(setting.value) : 3.0;
    const customFee = org.platform_fee_percent !== null ? Number(org.platform_fee_percent) : null;

    return {
      org_id: orgId,
      org_name: org.name,
      platform_fee_percent: customFee ?? globalDefault,
      is_custom: customFee !== null,
      custom_fee: customFee,
      global_default: globalDefault,
    };
  }

  async getOrgFeatures(orgId: string) {
    const client = this.supabase.adminClient;

    // Verify org exists
    const { data: org, error: orgError } = await client
      .from('organizations')
      .select('id, name')
      .eq('id', orgId)
      .single();

    if (orgError || !org) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    // Get all feature flags
    const { data: flags, error: flagsError } = await client
      .from('feature_flags')
      .select('id, key, name, description, enabled, org_ids, metadata')
      .order('name', { ascending: true });

    if (flagsError) {
      throw new BadRequestException({
        code: 'FLAGS_FETCH_FAILED',
        message: flagsError.message,
      });
    }

    // Map flags with their enabled state for this org
    const features = ((flags || []) as AnyRecord[]).map((flag) => {
      const orgIds = (flag['org_ids'] as string[] | null) || [];
      const metadata = (flag['metadata'] as Record<string, unknown>) || {};
      const isEnabledForOrg = orgIds.includes(orgId);
      const isGloballyEnabled = flag['enabled'] as boolean;

      return {
        id: flag['id'] as string,
        key: flag['key'] as string,
        name: flag['name'] as string,
        description: flag['description'] as string | null,
        tier: (metadata['tier'] as string) || 'basic',
        enabled_for_org: isEnabledForOrg,
        globally_enabled: isGloballyEnabled,
        // Feature is accessible if globally enabled OR specifically enabled for this org
        accessible: isGloballyEnabled || isEnabledForOrg,
      };
    });

    return {
      org_id: orgId,
      org_name: org.name,
      features,
    };
  }

  async toggleOrgFeature(orgId: string, flagKey: string, enabled: boolean, adminId: string) {
    const client = this.supabase.adminClient;

    // Verify org exists
    const { data: org, error: orgError } = await client
      .from('organizations')
      .select('id, name')
      .eq('id', orgId)
      .single();

    if (orgError || !org) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    // Get the feature flag
    const { data: flag, error: flagError } = await client
      .from('feature_flags')
      .select('id, key, name, org_ids')
      .eq('key', flagKey)
      .single();

    if (flagError || !flag) {
      throw new NotFoundException({
        code: 'FLAG_NOT_FOUND',
        message: 'Feature flag not found',
      });
    }

    const currentOrgIds = (flag.org_ids as string[] | null) || [];
    let newOrgIds: string[];

    if (enabled) {
      // Add org to the list if not already there
      newOrgIds = currentOrgIds.includes(orgId) ? currentOrgIds : [...currentOrgIds, orgId];
    } else {
      // Remove org from the list
      newOrgIds = currentOrgIds.filter((id) => id !== orgId);
    }

    const { error: updateError } = await client
      .from('feature_flags')
      .update({
        org_ids: newOrgIds,
        updated_at: new Date().toISOString(),
      })
      .eq('id', flag.id);

    if (updateError) {
      throw new BadRequestException({
        code: 'FLAG_UPDATE_FAILED',
        message: updateError.message,
      });
    }

    await this.logAuditEvent({
      actorId: adminId,
      action: enabled ? 'feature.enable' : 'feature.disable',
      resourceType: 'feature_flag',
      resourceId: flag.id,
      orgId,
      changes: { org_ids: { from: currentOrgIds, to: newOrgIds } },
      metadata: { flag_key: flagKey, flag_name: flag.name, org_name: org.name },
    });

    return {
      message: `Feature ${enabled ? 'enabled' : 'disabled'} for organization`,
      org_id: orgId,
      flag_key: flagKey,
      enabled,
    };
  }

  // ============================================================================
  // FEATURE FLAGS
  // ============================================================================

  async listFeatureFlags() {
    const client = this.supabase.adminClient;

    const { data, error } = await client
      .from('feature_flags')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException({
        code: 'FLAG_LIST_FAILED',
        message: error.message,
      });
    }

    return {
      flags: ((data || []) as AnyRecord[]).map((f) => ({
        id: f['id'],
        key: f['key'],
        name: f['name'],
        description: f['description'],
        enabled: f['enabled'],
        rollout_percentage: f['rollout_percentage'],
        org_count: (f['org_ids'] as string[] | null)?.length || 0,
        user_count: (f['user_ids'] as string[] | null)?.length || 0,
        updated_at: f['updated_at'],
      })),
    };
  }

  async getFeatureFlag(flagId: string) {
    const client = this.supabase.adminClient;

    const { data, error } = await client
      .from('feature_flags')
      .select('*')
      .eq('id', flagId)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'FLAG_NOT_FOUND',
        message: 'Feature flag not found',
      });
    }

    return {
      id: data.id,
      key: data.key,
      name: data.name,
      description: data.description,
      enabled: data.enabled,
      rollout_percentage: data.rollout_percentage,
      org_ids: data.org_ids || [],
      user_ids: data.user_ids || [],
      metadata: data.metadata || {},
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  async createFeatureFlag(dto: CreateFeatureFlagDto, adminId: string) {
    const client = this.supabase.adminClient;

    // Check key uniqueness
    const { data: existing } = await client.from('feature_flags').select('id').eq('key', dto.key).single();

    if (existing) {
      throw new BadRequestException({
        code: 'FLAG_KEY_EXISTS',
        message: 'Feature flag key already exists',
      });
    }

    const { data, error } = await client
      .from('feature_flags')
      .insert({
        key: dto.key,
        name: dto.name,
        description: dto.description,
        enabled: dto.enabled ?? false,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'FLAG_CREATE_FAILED',
        message: error.message,
      });
    }

    await this.logAuditEvent({
      actorId: adminId,
      action: 'feature_flag.create',
      resourceType: 'feature_flag',
      resourceId: data.id,
      metadata: { key: dto.key },
    });

    return data;
  }

  async updateFeatureFlag(flagId: string, dto: UpdateFeatureFlagDto, adminId: string) {
    const client = this.supabase.adminClient;

    const { data: current } = await client.from('feature_flags').select('*').eq('id', flagId).single();

    if (!current) {
      throw new NotFoundException({
        code: 'FLAG_NOT_FOUND',
        message: 'Feature flag not found',
      });
    }

    const updateData: AnyRecord = {
      updated_at: new Date().toISOString(),
    };

    const changes: Record<string, { from: unknown; to: unknown }> = {};

    if (dto.name !== undefined) {
      updateData['name'] = dto.name;
      changes['name'] = { from: current.name, to: dto.name };
    }
    if (dto.description !== undefined) {
      updateData['description'] = dto.description;
    }
    if (dto.enabled !== undefined) {
      updateData['enabled'] = dto.enabled;
      changes['enabled'] = { from: current.enabled, to: dto.enabled };
    }
    if (dto.rollout_percentage !== undefined) {
      updateData['rollout_percentage'] = dto.rollout_percentage;
      changes['rollout_percentage'] = { from: current.rollout_percentage, to: dto.rollout_percentage };
    }
    if (dto.org_ids !== undefined) {
      updateData['org_ids'] = dto.org_ids;
    }
    if (dto.user_ids !== undefined) {
      updateData['user_ids'] = dto.user_ids;
    }
    if (dto.metadata !== undefined) {
      updateData['metadata'] = dto.metadata;
    }

    const { data, error } = await client
      .from('feature_flags')
      .update(updateData)
      .eq('id', flagId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'FLAG_UPDATE_FAILED',
        message: error.message,
      });
    }

    await this.logAuditEvent({
      actorId: adminId,
      action: 'feature_flag.update',
      resourceType: 'feature_flag',
      resourceId: flagId,
      changes,
      metadata: { key: current.key },
    });

    return data;
  }

  async deleteFeatureFlag(flagId: string, adminId: string) {
    const client = this.supabase.adminClient;

    const { data: flag } = await client.from('feature_flags').select('key').eq('id', flagId).single();

    if (!flag) {
      throw new NotFoundException({
        code: 'FLAG_NOT_FOUND',
        message: 'Feature flag not found',
      });
    }

    const { error } = await client.from('feature_flags').delete().eq('id', flagId);

    if (error) {
      throw new BadRequestException({
        code: 'FLAG_DELETE_FAILED',
        message: error.message,
      });
    }

    await this.logAuditEvent({
      actorId: adminId,
      action: 'feature_flag.delete',
      resourceType: 'feature_flag',
      resourceId: flagId,
      metadata: { key: flag.key },
    });

    return {
      message: 'Feature flag deleted',
      id: flagId,
    };
  }

  // ============================================================================
  // PLATFORM SETTINGS
  // ============================================================================

  async getSettings() {
    const client = this.supabase.adminClient;

    const { data, error } = await client.from('platform_settings').select('*');

    if (error) {
      throw new BadRequestException({
        code: 'SETTINGS_FETCH_FAILED',
        message: error.message,
      });
    }

    // Metadata for known settings (category, value_type, default_value)
    const settingsMetadata: Record<
      string,
      { category: string; value_type: string; default_value: unknown }
    > = {
      maintenance_mode: {
        category: 'system',
        value_type: 'object',
        default_value: { enabled: false, message: null, allow_admins: true },
      },
      registration_enabled: {
        category: 'security',
        value_type: 'boolean',
        default_value: true,
      },
      max_orgs_per_user: {
        category: 'limits',
        value_type: 'number',
        default_value: 5,
      },
      default_trial_days: {
        category: 'billing',
        value_type: 'number',
        default_value: 14,
      },
      stripe_platform_fee_percent: {
        category: 'billing',
        value_type: 'number',
        default_value: 3.0,
      },
    };

    // Return as array with all expected fields
    const settings = (data || []).map((s: AnyRecord) => {
      const key = s['key'] as string;
      const metadata = settingsMetadata[key] || {
        category: 'general',
        value_type: typeof s['value'],
        default_value: null,
      };

      return {
        key,
        value: s['value'],
        description: s['description'] as string | null,
        updated_at: s['updated_at'] as string,
        value_type: metadata.value_type,
        category: metadata.category,
        default_value: metadata.default_value,
      };
    });

    return { settings };
  }

  async updateSetting(key: string, dto: UpdateSettingDto, adminId: string) {
    const client = this.supabase.adminClient;

    const { data: current } = await client.from('platform_settings').select('value').eq('key', key).single();

    if (!current) {
      throw new NotFoundException({
        code: 'SETTING_NOT_FOUND',
        message: 'Platform setting not found',
      });
    }

    const { error } = await client
      .from('platform_settings')
      .update({
        value: dto.value,
        updated_by: adminId,
        updated_at: new Date().toISOString(),
      })
      .eq('key', key);

    if (error) {
      throw new BadRequestException({
        code: 'SETTING_UPDATE_FAILED',
        message: error.message,
      });
    }

    await this.logAuditEvent({
      actorId: adminId,
      action: 'setting.update',
      resourceType: 'platform_setting',
      changes: { [key]: { from: current.value, to: dto.value } },
    });

    return {
      key,
      value: dto.value,
      message: 'Setting updated',
    };
  }

  async setMaintenanceMode(dto: MaintenanceModeDto, adminId: string) {
    const value = {
      enabled: dto.enabled,
      message: dto.message || null,
      allow_admins: dto.allow_admins ?? true,
    };

    return this.updateSetting('maintenance_mode', { value }, adminId);
  }

  // ============================================================================
  // ANNOUNCEMENTS
  // ============================================================================

  async listAnnouncements() {
    const client = this.supabase.adminClient;

    const { data, error } = await client
      .from('platform_announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException({
        code: 'ANNOUNCEMENTS_FETCH_FAILED',
        message: error.message,
      });
    }

    // Get dismiss counts
    const announcementIds = ((data || []) as AnyRecord[]).map((a) => a['id'] as string);
    const { data: dismissals } = await client
      .from('announcement_dismissals')
      .select('announcement_id')
      .in('announcement_id', announcementIds);

    const dismissCounts: Record<string, number> = {};
    for (const d of (dismissals || []) as AnyRecord[]) {
      const annId = d['announcement_id'] as string;
      dismissCounts[annId] = (dismissCounts[annId] || 0) + 1;
    }

    return {
      announcements: ((data || []) as AnyRecord[]).map((a) => ({
        ...a,
        view_count: 0, // Would need tracking
        dismiss_count: dismissCounts[a['id'] as string] || 0,
      })),
    };
  }

  async createAnnouncement(dto: CreateAnnouncementDto, adminId: string) {
    const client = this.supabase.adminClient;

    const { data, error } = await client
      .from('platform_announcements')
      .insert({
        title: dto.title,
        content: dto.content,
        type: dto.type || 'info',
        target_roles: dto.target_roles || [],
        target_org_ids: dto.target_org_ids || [],
        starts_at: dto.starts_at || new Date().toISOString(),
        expires_at: dto.expires_at || null,
        is_dismissible: dto.is_dismissible ?? true,
        created_by: adminId,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'ANNOUNCEMENT_CREATE_FAILED',
        message: error.message,
      });
    }

    await this.logAuditEvent({
      actorId: adminId,
      action: 'announcement.create',
      resourceType: 'announcement',
      resourceId: data.id,
      metadata: { title: dto.title, type: dto.type },
    });

    return data;
  }

  async updateAnnouncement(announcementId: string, dto: UpdateAnnouncementDto, adminId: string) {
    const client = this.supabase.adminClient;

    const { data: current } = await client
      .from('platform_announcements')
      .select('title')
      .eq('id', announcementId)
      .single();

    if (!current) {
      throw new NotFoundException({
        code: 'ANNOUNCEMENT_NOT_FOUND',
        message: 'Announcement not found',
      });
    }

    const updateData: AnyRecord = {
      updated_at: new Date().toISOString(),
    };

    if (dto.title) updateData['title'] = dto.title;
    if (dto.content) updateData['content'] = dto.content;
    if (dto.type) updateData['type'] = dto.type;
    if (dto.expires_at) updateData['expires_at'] = dto.expires_at;

    const { data, error } = await client
      .from('platform_announcements')
      .update(updateData)
      .eq('id', announcementId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'ANNOUNCEMENT_UPDATE_FAILED',
        message: error.message,
      });
    }

    await this.logAuditEvent({
      actorId: adminId,
      action: 'announcement.update',
      resourceType: 'announcement',
      resourceId: announcementId,
    });

    return data;
  }

  async deleteAnnouncement(announcementId: string, adminId: string) {
    const client = this.supabase.adminClient;

    const { data: announcement } = await client
      .from('platform_announcements')
      .select('title')
      .eq('id', announcementId)
      .single();

    if (!announcement) {
      throw new NotFoundException({
        code: 'ANNOUNCEMENT_NOT_FOUND',
        message: 'Announcement not found',
      });
    }

    const { error } = await client.from('platform_announcements').delete().eq('id', announcementId);

    if (error) {
      throw new BadRequestException({
        code: 'ANNOUNCEMENT_DELETE_FAILED',
        message: error.message,
      });
    }

    await this.logAuditEvent({
      actorId: adminId,
      action: 'announcement.delete',
      resourceType: 'announcement',
      resourceId: announcementId,
      metadata: { title: announcement.title },
    });

    return {
      message: 'Announcement deleted',
      id: announcementId,
    };
  }

  // ============================================================================
  // AUDIT LOGS
  // ============================================================================

  async listAuditLogs(dto: ListAuditLogsDto) {
    const client = this.supabase.adminClient;
    const { page = 1, limit = 20, actor_id, org_id, action, resource_type, start_date, end_date } = dto;

    let query = client
      .from('audit_logs')
      .select(`
        id,
        actor_id,
        actor_type,
        action,
        resource_type,
        resource_id,
        org_id,
        changes,
        ip_address,
        created_at,
        actor:profiles!actor_id(id, email, first_name, last_name)
      `, { count: 'exact' });

    if (actor_id) query = query.eq('actor_id', actor_id);
    if (org_id) query = query.eq('org_id', org_id);
    if (action) query = query.eq('action', action);
    if (resource_type) query = query.eq('resource_type', resource_type);
    if (start_date) query = query.gte('created_at', start_date);
    if (end_date) query = query.lte('created_at', end_date);

    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1).order('created_at', { ascending: false });

    const { data, count, error } = await query;

    if (error) {
      throw new BadRequestException({
        code: 'AUDIT_LOGS_FETCH_FAILED',
        message: error.message,
      });
    }

    return {
      data: ((data || []) as AnyRecord[]).map((log) => {
        const actor = log['actor'] as AnyRecord | null;
        return {
          id: log['id'],
          actor: actor
            ? {
                id: actor['id'],
                email: actor['email'],
                name: `${actor['first_name'] || ''} ${actor['last_name'] || ''}`.trim(),
              }
            : null,
          actor_type: log['actor_type'],
          action: log['action'],
          resource_type: log['resource_type'],
          resource_id: log['resource_id'],
          org_id: log['org_id'],
          changes: log['changes'],
          ip_address: log['ip_address'],
          created_at: log['created_at'],
        };
      }),
      meta: {
        total: count || 0,
        page,
        limit,
      },
    };
  }

  async exportAuditLogs(dto: ListAuditLogsDto & { format?: 'csv' | 'json' }) {
    // Get all logs matching criteria (with higher limit for export)
    const allLogs = await this.listAuditLogs({ ...dto, limit: 10000 });

    if (dto.format === 'csv') {
      const headers = ['id', 'actor_email', 'actor_type', 'action', 'resource_type', 'resource_id', 'org_id', 'created_at'];
      const rows = allLogs.data.map((log) => [
        log.id,
        log.actor?.email || 'system',
        log.actor_type,
        log.action,
        log.resource_type,
        log.resource_id || '',
        log.org_id || '',
        log.created_at,
      ]);

      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      return {
        content: csv,
        contentType: 'text/csv',
        filename: `audit-logs-${new Date().toISOString().split('T')[0]}.csv`,
      };
    }

    return {
      content: JSON.stringify(allLogs.data, null, 2),
      contentType: 'application/json',
      filename: `audit-logs-${new Date().toISOString().split('T')[0]}.json`,
    };
  }

  // ============================================================================
  // SYSTEM HEALTH
  // ============================================================================

  async getSystemHealth() {
    const client = this.supabase.adminClient;

    // Get latest health status for each service
    const { data: healthLogs } = await client
      .from('system_health_logs')
      .select('service, status, latency_ms, checked_at')
      .order('checked_at', { ascending: false })
      .limit(50);

    const services: Record<string, { status: string; latency_ms: number; last_check: string }> = {};
    const seen = new Set<string>();

    for (const log of (healthLogs || []) as AnyRecord[]) {
      const service = log['service'] as string;
      if (!seen.has(service)) {
        seen.add(service);
        services[service] = {
          status: log['status'] as string,
          latency_ms: log['latency_ms'] as number,
          last_check: log['checked_at'] as string,
        };
      }
    }

    // Determine overall status
    const statuses = Object.values(services).map((s) => s.status);
    let overallStatus = 'healthy';
    if (statuses.includes('unhealthy')) {
      overallStatus = 'unhealthy';
    } else if (statuses.includes('degraded')) {
      overallStatus = 'degraded';
    }

    return {
      status: overallStatus,
      services,
      metrics: {
        requests_per_minute: 0, // Would need actual metrics collection
        error_rate: 0,
        avg_response_time_ms: 0,
      },
    };
  }

  async getHealthHistory(dto: HealthHistoryDto) {
    const client = this.supabase.adminClient;
    const { service, hours = 24 } = dto;

    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    let query = client
      .from('system_health_logs')
      .select('service, status, latency_ms, checked_at')
      .gte('checked_at', since)
      .order('checked_at', { ascending: true });

    if (service) {
      query = query.eq('service', service);
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException({
        code: 'HEALTH_HISTORY_FAILED',
        message: error.message,
      });
    }

    return {
      service: service || 'all',
      data_points: data || [],
    };
  }

  // ============================================================================
  // RATE LIMITS
  // ============================================================================

  async listRateLimits() {
    const client = this.supabase.adminClient;

    const { data, error } = await client
      .from('rate_limit_rules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException({
        code: 'RATE_LIMITS_FETCH_FAILED',
        message: error.message,
      });
    }

    return { rules: data || [] };
  }

  async createRateLimit(dto: CreateRateLimitDto, adminId: string) {
    const client = this.supabase.adminClient;

    const { data, error } = await client
      .from('rate_limit_rules')
      .insert({
        name: dto.name,
        endpoint_pattern: dto.endpoint_pattern,
        requests_per_minute: dto.requests_per_minute,
        requests_per_hour: dto.requests_per_hour,
        burst_limit: dto.burst_limit,
        applies_to: dto.applies_to || 'all',
        org_ids: dto.org_ids || [],
        enabled: true,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'RATE_LIMIT_CREATE_FAILED',
        message: error.message,
      });
    }

    await this.logAuditEvent({
      actorId: adminId,
      action: 'rate_limit.create',
      resourceType: 'rate_limit',
      resourceId: data.id,
      metadata: { name: dto.name, endpoint: dto.endpoint_pattern },
    });

    return data;
  }

  async updateRateLimit(ruleId: string, dto: UpdateRateLimitDto, adminId: string) {
    const client = this.supabase.adminClient;

    const { data: current } = await client.from('rate_limit_rules').select('name').eq('id', ruleId).single();

    if (!current) {
      throw new NotFoundException({
        code: 'RATE_LIMIT_NOT_FOUND',
        message: 'Rate limit rule not found',
      });
    }

    const updateData: AnyRecord = {
      updated_at: new Date().toISOString(),
    };

    if (dto.name !== undefined) updateData['name'] = dto.name;
    if (dto.requests_per_minute !== undefined) updateData['requests_per_minute'] = dto.requests_per_minute;
    if (dto.requests_per_hour !== undefined) updateData['requests_per_hour'] = dto.requests_per_hour;
    if (dto.burst_limit !== undefined) updateData['burst_limit'] = dto.burst_limit;
    if (dto.enabled !== undefined) updateData['enabled'] = dto.enabled;

    const { data, error } = await client
      .from('rate_limit_rules')
      .update(updateData)
      .eq('id', ruleId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'RATE_LIMIT_UPDATE_FAILED',
        message: error.message,
      });
    }

    await this.logAuditEvent({
      actorId: adminId,
      action: 'rate_limit.update',
      resourceType: 'rate_limit',
      resourceId: ruleId,
    });

    return data;
  }

  async deleteRateLimit(ruleId: string, adminId: string) {
    const client = this.supabase.adminClient;

    const { data: rule } = await client.from('rate_limit_rules').select('name').eq('id', ruleId).single();

    if (!rule) {
      throw new NotFoundException({
        code: 'RATE_LIMIT_NOT_FOUND',
        message: 'Rate limit rule not found',
      });
    }

    const { error } = await client.from('rate_limit_rules').delete().eq('id', ruleId);

    if (error) {
      throw new BadRequestException({
        code: 'RATE_LIMIT_DELETE_FAILED',
        message: error.message,
      });
    }

    await this.logAuditEvent({
      actorId: adminId,
      action: 'rate_limit.delete',
      resourceType: 'rate_limit',
      resourceId: ruleId,
      metadata: { name: rule.name },
    });

    return {
      message: 'Rate limit rule deleted',
      id: ruleId,
    };
  }

  // ============================================================================
  // AUDIT LOGGING HELPER
  // ============================================================================

  private async logAuditEvent(params: {
    actorId: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    orgId?: string;
    changes?: Record<string, { from: unknown; to: unknown }>;
    metadata?: Record<string, unknown>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    const client = this.supabase.adminClient;

    try {
      await client.from('audit_logs').insert({
        actor_id: params.actorId,
        actor_type: 'user',
        action: params.action,
        resource_type: params.resourceType,
        resource_id: params.resourceId || null,
        org_id: params.orgId || null,
        changes: params.changes || null,
        metadata: params.metadata || {},
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null,
      });
    } catch (error) {
      // Don't fail the main operation if audit logging fails
      console.error('Failed to log audit event:', error);
    }
  }

  // ============================================================================
  // PLATFORM REVENUE
  // ============================================================================

  async getRevenueSummary() {
    const client = this.supabase.adminClient;

    const { data, error } = await client.rpc('get_platform_revenue_summary');

    if (error) {
      throw new BadRequestException({
        code: 'REVENUE_SUMMARY_FAILED',
        message: error.message,
      });
    }

    const row = data?.[0] || {
      total_platform_fees: 0,
      total_transactions: 0,
      total_gross_volume: 0,
      fees_today: 0,
      fees_7d: 0,
      fees_30d: 0,
      fees_this_month: 0,
      transactions_today: 0,
      transactions_7d: 0,
      transactions_30d: 0,
    };

    return {
      summary: {
        total_platform_fees: Number(row.total_platform_fees || 0),
        total_transactions: Number(row.total_transactions || 0),
        total_gross_volume: Number(row.total_gross_volume || 0),
      },
      periods: {
        today: {
          fees: Number(row.fees_today || 0),
          transactions: Number(row.transactions_today || 0),
        },
        last_7_days: {
          fees: Number(row.fees_7d || 0),
          transactions: Number(row.transactions_7d || 0),
        },
        last_30_days: {
          fees: Number(row.fees_30d || 0),
          transactions: Number(row.transactions_30d || 0),
        },
        this_month: {
          fees: Number(row.fees_this_month || 0),
        },
      },
    };
  }

  async getRevenueByOrg(dto: { page?: number; limit?: number; start_date?: string; end_date?: string }) {
    const client = this.supabase.adminClient;
    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const offset = (page - 1) * limit;

    const { data, error } = await client.rpc('get_platform_revenue_by_org', {
      p_limit: limit,
      p_offset: offset,
      p_start_date: dto.start_date || null,
      p_end_date: dto.end_date || null,
    });

    if (error) {
      throw new BadRequestException({
        code: 'REVENUE_BY_ORG_FAILED',
        message: error.message,
      });
    }

    return {
      organizations: ((data || []) as AnyRecord[]).map((r) => ({
        org_id: r['org_id'],
        org_name: r['org_name'],
        org_slug: r['org_slug'],
        stripe_account_id: r['stripe_account_id'],
        total_platform_fees: Number(r['total_platform_fees'] || 0),
        total_transactions: Number(r['total_transactions'] || 0),
        total_gross_volume: Number(r['total_gross_volume'] || 0),
        avg_transaction_amount: Number(r['avg_transaction_amount'] || 0),
        platform_fee_percent: Number(r['platform_fee_percent'] || 3.0),
      })),
      meta: {
        page,
        limit,
      },
    };
  }

  async getRevenueTrend(days: number = 30) {
    const client = this.supabase.adminClient;

    const { data, error } = await client.rpc('get_platform_revenue_trend', {
      p_days: days,
    });

    if (error) {
      throw new BadRequestException({
        code: 'REVENUE_TREND_FAILED',
        message: error.message,
      });
    }

    return {
      trend: ((data || []) as AnyRecord[]).map((r) => ({
        date: r['date'],
        platform_fees: Number(r['platform_fees'] || 0),
        transaction_count: Number(r['transaction_count'] || 0),
        gross_volume: Number(r['gross_volume'] || 0),
      })),
      period_days: days,
    };
  }

  async syncAllTransactions() {
    const client = this.supabase.adminClient;

    // Check if Stripe is configured
    const stripeKey = process.env['STRIPE_SECRET_KEY'];
    if (!stripeKey) {
      throw new BadRequestException({
        code: 'STRIPE_NOT_CONFIGURED',
        message: 'Stripe is not configured. Please set STRIPE_SECRET_KEY.',
      });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(stripeKey);

    // Get all Stripe accounts from database for mapping
    const { data: accounts } = await client
      .from('stripe_accounts')
      .select('id, org_id, stripe_account_id');

    const accountMap = new Map(
      (accounts || []).map((a) => [a.stripe_account_id, { id: a.id, org_id: a.org_id }])
    );

    let totalSynced = 0;
    const orgStats: Record<string, number> = {};

    try {
      // Fetch application fees from YOUR platform account
      // These are the platform fees collected from connected accounts
      const appFees = await stripe.applicationFees.list({ limit: 100 });

      for (const fee of appFees.data) {
        // Get the connected account this fee came from
        const connectedAccountId = fee.account as string;
        const accountInfo = accountMap.get(connectedAccountId);

        if (!accountInfo) {
          // Unknown connected account, skip
          continue;
        }

        // Get the original charge to get more details
        let chargeDetails: { description?: string; customer_email?: string; payment_intent?: string } = {};
        if (fee.charge) {
          try {
            const charge = await stripe.charges.retrieve(
              fee.charge as string,
              { stripeAccount: connectedAccountId }
            );
            if (charge.description) chargeDetails.description = charge.description;
            const email = charge.billing_details?.email || charge.receipt_email;
            if (email) chargeDetails.customer_email = email;
            if (charge.payment_intent) chargeDetails.payment_intent = charge.payment_intent as string;
          } catch {
            // Charge lookup failed, continue without details
          }
        }

        // Upsert the transaction with the actual platform fee from Stripe
        const { error: upsertError } = await client
          .from('stripe_transactions')
          .upsert(
            {
              stripe_account_id: accountInfo.id,
              stripe_payment_intent_id: chargeDetails.payment_intent || null,
              stripe_charge_id: fee.charge as string || fee.id,
              type: 'charge',
              status: 'succeeded',
              amount: fee.amount, // Original charge amount
              currency: fee.currency,
              platform_fee: fee.amount, // The application fee IS the platform fee
              stripe_fee: 0,
              net_amount: 0, // Org's net is handled separately
              description: chargeDetails.description || `Application fee ${fee.id}`,
              customer_email: chargeDetails.customer_email || null,
              metadata: {},
              created_at: new Date(fee.created * 1000).toISOString(),
            },
            {
              onConflict: 'stripe_charge_id',
              ignoreDuplicates: true,
            }
          );

        if (!upsertError) {
          totalSynced++;
          orgStats[accountInfo.org_id] = (orgStats[accountInfo.org_id] || 0) + 1;
        }
      }

      // Also sync balance transactions to see direct platform revenue
      const balanceTransactions = await stripe.balanceTransactions.list({
        limit: 100,
        type: 'application_fee',
      });

      return {
        message: `Synced ${totalSynced} platform fee transactions`,
        total_transactions: totalSynced,
        application_fees_found: appFees.data.length,
        balance_transactions_found: balanceTransactions.data.length,
        by_org: orgStats,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      throw new BadRequestException({
        code: 'STRIPE_SYNC_FAILED',
        message: `Failed to sync from Stripe: ${message}`,
      });
    }
  }
}
