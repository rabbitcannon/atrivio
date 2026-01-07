import { type OrgId, type OrgRole, ROLE_PERMISSIONS, type UserId } from '@haunt/shared';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';

export interface TenantContext {
  orgId: OrgId;
  orgName: string;
  orgSlug: string;
  userId: UserId;
  role: OrgRole;
  isOwner: boolean;
  permissions: string[];
}

export interface Membership {
  orgId: OrgId;
  role: OrgRole;
  isOwner: boolean;
  status: string;
}

@Injectable()
export class TenancyService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Get user's membership for a specific organization
   */
  async getMembership(userId: UserId, orgId: OrgId): Promise<Membership | null> {
    const { data, error } = await this.supabase.adminClient
      .from('org_memberships')
      .select('org_id, role, is_owner, status')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      return null;
    }

    return {
      orgId: data.org_id as OrgId,
      role: data.role as OrgRole,
      isOwner: data.is_owner,
      status: data.status,
    };
  }

  /**
   * Get all organizations a user belongs to
   */
  async getUserOrganizations(userId: UserId): Promise<
    Array<{
      orgId: OrgId;
      orgName: string;
      orgSlug: string;
      role: OrgRole;
      isOwner: boolean;
    }>
  > {
    const { data, error } = await this.supabase.adminClient
      .from('org_memberships')
      .select(
        `
        org_id,
        role,
        is_owner,
        organizations (
          id,
          name,
          slug
        )
      `
      )
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error || !data) {
      return [];
    }

    return data.map((m: any) => ({
      orgId: m.org_id as OrgId,
      orgName: m.organizations.name,
      orgSlug: m.organizations.slug,
      role: m.role as OrgRole,
      isOwner: m.is_owner,
    }));
  }

  /**
   * Resolve tenant context from org ID parameter
   * Validates that the user has access to the organization
   */
  async resolveTenantContext(userId: UserId, orgId: OrgId): Promise<TenantContext> {
    // Get membership
    const membership = await this.getMembership(userId, orgId);

    if (!membership) {
      throw new ForbiddenException({
        code: 'ORG_FORBIDDEN',
        message: 'You do not have access to this organization',
      });
    }

    // Get org details
    const { data: org, error } = await this.supabase.adminClient
      .from('organizations')
      .select('id, name, slug')
      .eq('id', orgId)
      .single();

    if (error || !org) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    // Get permissions for role
    const permissions = this.getPermissionsForRole(membership.role);

    return {
      orgId: org.id as OrgId,
      orgName: org.name,
      orgSlug: org.slug,
      userId,
      role: membership.role,
      isOwner: membership.isOwner,
      permissions,
    };
  }

  /**
   * Check if user is a super admin (platform level)
   */
  async isSuperAdmin(userId: UserId): Promise<boolean> {
    const { data } = await this.supabase.adminClient
      .from('profiles')
      .select('is_super_admin')
      .eq('id', userId)
      .single();

    return !!data?.is_super_admin;
  }

  /**
   * Resolve organization by UUID or slug
   */
  async resolveOrg(identifier: string): Promise<{ id: OrgId; name: string; slug: string } | null> {
    // Check if it's a UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    );

    const { data } = await this.supabase.adminClient
      .from('organizations')
      .select('id, name, slug')
      .eq(isUUID ? 'id' : 'slug', identifier)
      .single();

    if (!data) return null;

    return {
      id: data.id as OrgId,
      name: data.name,
      slug: data.slug,
    };
  }

  /**
   * Resolve attraction by UUID or slug (within an organization)
   */
  async resolveAttraction(
    orgId: OrgId,
    identifier: string
  ): Promise<{ id: string; name: string; slug: string } | null> {
    // Check if it's a UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    );

    const { data } = await this.supabase.adminClient
      .from('attractions')
      .select('id, name, slug')
      .eq('org_id', orgId)
      .eq(isUUID ? 'id' : 'slug', identifier)
      .single();

    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
    };
  }

  /**
   * Get permissions for a role
   */
  private getPermissionsForRole(role: OrgRole): string[] {
    return ROLE_PERMISSIONS[role] || [];
  }
}
