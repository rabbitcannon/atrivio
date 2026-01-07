import type { OrgId, UserId } from '@haunt/shared';
import {
  canManageRole,
  ORG_ROLE_HIERARCHY,
  type OrgRole,
  type Permission,
  ROLE_PERMISSIONS,
} from '@haunt/shared';
import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';

@Injectable()
export class RbacService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Check if a role has a specific permission
   */
  hasPermission(role: OrgRole, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];

    // Check for exact match
    if (permissions.includes(permission)) {
      return true;
    }

    // Check for :manage permission (implies all CRUD)
    const [resource, action] = permission.split(':');
    if (!action) {
      return false;
    }
    const managePermission = `${resource}:manage` as Permission;
    if (
      permissions.includes(managePermission) &&
      ['create', 'read', 'update', 'delete'].includes(action)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Check if a role has any of the given permissions
   */
  hasAnyPermission(role: OrgRole, permissions: Permission[]): boolean {
    return permissions.some((p) => this.hasPermission(role, p));
  }

  /**
   * Check if a role has all of the given permissions
   */
  hasAllPermissions(role: OrgRole, permissions: Permission[]): boolean {
    return permissions.every((p) => this.hasPermission(role, p));
  }

  /**
   * Get all permissions for a role
   */
  getPermissions(role: OrgRole): Permission[] {
    return (ROLE_PERMISSIONS[role] || []) as Permission[];
  }

  /**
   * Check if actor role can manage target role
   */
  canManage(actorRole: OrgRole, targetRole: OrgRole): boolean {
    return canManageRole(actorRole, targetRole);
  }

  /**
   * Get role hierarchy level
   */
  getRoleLevel(role: OrgRole): number {
    return ORG_ROLE_HIERARCHY[role] || 0;
  }

  /**
   * Check if user is super admin
   */
  async isSuperAdmin(userId: UserId): Promise<boolean> {
    const { data } = await this.supabase.adminClient
      .from('platform_admins')
      .select('id')
      .eq('user_id', userId)
      .single();

    return !!data;
  }

  /**
   * Get user's role in an organization
   */
  async getUserRole(userId: UserId, orgId: OrgId): Promise<OrgRole | null> {
    const { data } = await this.supabase.adminClient
      .from('org_memberships')
      .select('role')
      .eq('user_id', userId)
      .eq('org_id', orgId)
      .eq('status', 'active')
      .single();

    return data?.role as OrgRole | null;
  }

  /**
   * Check if user can invite to a specific role
   * Users can only invite to roles lower than their own
   */
  canInviteToRole(inviterRole: OrgRole, targetRole: OrgRole): boolean {
    // Only owner can promote to admin
    if (targetRole === 'admin' && inviterRole !== 'owner') {
      return false;
    }

    // Can't invite to owner role (owner is created on org creation)
    if (targetRole === 'owner') {
      return false;
    }

    return this.canManage(inviterRole, targetRole);
  }

  /**
   * Check if user can modify another user's role
   */
  canModifyRole(
    actorRole: OrgRole,
    currentRole: OrgRole,
    newRole: OrgRole,
    isTargetOwner: boolean
  ): boolean {
    // Cannot modify owner
    if (isTargetOwner) {
      return false;
    }

    // Only owner can promote to admin
    if (newRole === 'admin' && actorRole !== 'owner') {
      return false;
    }

    // Can't promote to owner
    if (newRole === 'owner') {
      return false;
    }

    // Must have higher rank than both current and new role
    return this.canManage(actorRole, currentRole) && this.canManage(actorRole, newRole);
  }
}
