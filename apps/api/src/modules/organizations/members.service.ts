import type { OrgId, OrgRole } from '@atrivio/shared';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RbacService } from '../../core/rbac/rbac.service.js';
import { SupabaseService } from '../../shared/database/supabase.service.js';

@Injectable()
export class MembersService {
  constructor(
    private supabase: SupabaseService,
    private rbacService: RbacService
  ) {}

  /**
   * List members of an organization
   */
  async findAll(
    orgId: OrgId,
    filters?: {
      role?: OrgRole;
      status?: string;
      search?: string;
    }
  ) {
    let query = this.supabase.adminClient
      .from('org_memberships')
      .select(
        `
        id,
        role,
        is_owner,
        status,
        created_at,
        invited_by,
        profiles!org_memberships_user_id_fkey (
          id,
          email,
          first_name,
          last_name,
          avatar_url
        ),
        inviter:profiles!org_memberships_invited_by_fkey (
          id,
          first_name,
          last_name
        )
      `
      )
      .eq('org_id', orgId);

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    } else {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    if (error) {
      throw new BadRequestException({
        code: 'MEMBER_LIST_FAILED',
        message: error.message,
      });
    }

    // Calculate stats
    const byRole: Record<string, number> = {};
    data.forEach((m: any) => {
      byRole[m.role] = (byRole[m.role] || 0) + 1;
    });

    return {
      data: data.map((m: any) => ({
        id: m.id,
        user: {
          id: m.profiles.id,
          email: m.profiles.email,
          first_name: m.profiles.first_name,
          last_name: m.profiles.last_name,
          avatar_url: m.profiles.avatar_url,
        },
        role: m.role,
        is_owner: m.is_owner,
        status: m.status,
        joined_at: m.created_at,
        invited_by: m.inviter
          ? {
              id: m.inviter.id,
              name: `${m.inviter.first_name} ${m.inviter.last_name}`.trim(),
            }
          : null,
      })),
      meta: {
        total: data.length,
        by_role: byRole,
      },
    };
  }

  /**
   * Update member role
   */
  async updateRole(orgId: OrgId, memberId: string, newRole: OrgRole, actorRole: OrgRole) {
    // Get current membership
    const { data: member, error } = await this.supabase.adminClient
      .from('org_memberships')
      .select('id, role, is_owner, user_id')
      .eq('id', memberId)
      .eq('org_id', orgId)
      .single();

    if (error || !member) {
      throw new NotFoundException({
        code: 'MEMBER_NOT_FOUND',
        message: 'Member not found',
      });
    }

    // Check permissions
    const canModify = this.rbacService.canModifyRole(
      actorRole,
      member.role as OrgRole,
      newRole,
      member.is_owner
    );

    if (!canModify) {
      if (member.is_owner) {
        throw new ForbiddenException({
          code: 'ORG_OWNER_PROTECTED',
          message: 'Cannot modify owner role',
        });
      }
      if (newRole === 'admin' && actorRole !== 'owner') {
        throw new ForbiddenException({
          code: 'ROLE_ESCALATION',
          message: 'Only owner can promote to admin',
        });
      }
      throw new ForbiddenException({
        code: 'ROLE_ESCALATION',
        message: 'Cannot assign this role',
      });
    }

    // Update role
    const { data: updated, error: updateError } = await this.supabase.adminClient
      .from('org_memberships')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', memberId)
      .select('id, role, updated_at')
      .single();

    if (updateError) {
      throw new BadRequestException({
        code: 'MEMBER_UPDATE_FAILED',
        message: updateError.message,
      });
    }

    return updated;
  }

  /**
   * Remove member from organization
   */
  async remove(orgId: OrgId, memberId: string, actorRole: OrgRole) {
    // Get membership
    const { data: member, error } = await this.supabase.adminClient
      .from('org_memberships')
      .select('id, role, is_owner, user_id')
      .eq('id', memberId)
      .eq('org_id', orgId)
      .single();

    if (error || !member) {
      throw new NotFoundException({
        code: 'MEMBER_NOT_FOUND',
        message: 'Member not found',
      });
    }

    // Cannot remove owner
    if (member.is_owner) {
      throw new ForbiddenException({
        code: 'ORG_OWNER_PROTECTED',
        message: 'Cannot remove organization owner',
      });
    }

    // Check if actor can manage this member
    if (!this.rbacService.canManage(actorRole, member.role as OrgRole)) {
      throw new ForbiddenException({
        code: 'MEMBER_FORBIDDEN',
        message: 'Cannot remove member with higher role',
      });
    }

    // Update status to removed (soft delete)
    const { error: deleteError } = await this.supabase.adminClient
      .from('org_memberships')
      .update({
        status: 'removed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', memberId);

    if (deleteError) {
      throw new BadRequestException({
        code: 'MEMBER_REMOVE_FAILED',
        message: deleteError.message,
      });
    }

    return { message: 'Member removed successfully' };
  }
}
