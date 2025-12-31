import {
  Injectable,
  ForbiddenException,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import { RbacService } from '../../core/rbac/rbac.service.js';
import type { OrgId, UserId, OrgRole } from '@haunt/shared';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(
    private supabase: SupabaseService,
    private rbacService: RbacService,
  ) {}

  /**
   * Create an invitation
   */
  async create(
    orgId: OrgId,
    email: string,
    role: OrgRole,
    inviterId: UserId,
    inviterRole: OrgRole,
  ) {
    // Check if inviter can invite to this role
    if (!this.rbacService.canInviteToRole(inviterRole, role)) {
      throw new ForbiddenException({
        code: 'ROLE_ESCALATION',
        message: 'Cannot invite to this role',
      });
    }

    // Check if user is already a member
    const { data: existingMember } = await this.supabase.adminClient
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingMember) {
      const { data: membership } = await this.supabase.adminClient
        .from('org_memberships')
        .select('id')
        .eq('org_id', orgId)
        .eq('user_id', existingMember.id)
        .eq('status', 'active')
        .single();

      if (membership) {
        throw new ConflictException({
          code: 'MEMBER_ALREADY_EXISTS',
          message: 'User is already a member of this organization',
        });
      }
    }

    // Check for existing pending invitation
    const { data: existingInvite } = await this.supabase.adminClient
      .from('org_invitations')
      .select('id')
      .eq('org_id', orgId)
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingInvite) {
      throw new ConflictException({
        code: 'INVITATION_ALREADY_EXISTS',
        message: 'Pending invitation already exists for this email',
      });
    }

    // Generate invitation token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Create invitation
    const { data: invite, error } = await this.supabase.adminClient
      .from('org_invitations')
      .insert({
        org_id: orgId,
        email,
        role,
        token,
        invited_by: inviterId,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
      })
      .select(
        `
        id,
        email,
        role,
        expires_at,
        created_at,
        inviter:profiles!org_invitations_invited_by_fkey (
          id,
          first_name,
          last_name
        )
      `,
      )
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'INVITATION_CREATE_FAILED',
        message: error.message,
      });
    }

    // TODO: Send invitation email

    const inviter = invite.inviter as unknown as { id: string; first_name: string; last_name: string } | null;
    return {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      expires_at: invite.expires_at,
      invited_by: inviter
        ? {
            id: inviter.id,
            name: `${inviter.first_name} ${inviter.last_name}`.trim(),
          }
        : null,
    };
  }

  /**
   * List pending invitations for an organization
   */
  async findAll(orgId: OrgId) {
    const { data, error } = await this.supabase.adminClient
      .from('org_invitations')
      .select(
        `
        id,
        email,
        role,
        expires_at,
        created_at,
        inviter:profiles!org_invitations_invited_by_fkey (
          id,
          first_name,
          last_name
        )
      `,
      )
      .eq('org_id', orgId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException({
        code: 'INVITATION_LIST_FAILED',
        message: error.message,
      });
    }

    return {
      data: data.map((i: any) => ({
        id: i.id,
        email: i.email,
        role: i.role,
        expires_at: i.expires_at,
        created_at: i.created_at,
        invited_by: i.inviter
          ? {
              id: i.inviter.id,
              name: `${i.inviter.first_name} ${i.inviter.last_name}`.trim(),
            }
          : null,
      })),
    };
  }

  /**
   * Cancel an invitation
   */
  async cancel(orgId: OrgId, invitationId: string) {
    const { error } = await this.supabase.adminClient
      .from('org_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId)
      .eq('org_id', orgId)
      .eq('status', 'pending');

    if (error) {
      throw new BadRequestException({
        code: 'INVITATION_CANCEL_FAILED',
        message: error.message,
      });
    }

    return { message: 'Invitation cancelled' };
  }

  /**
   * Get invitation by token (public)
   */
  async getByToken(token: string) {
    const { data: invite, error } = await this.supabase.adminClient
      .from('org_invitations')
      .select(
        `
        id,
        role,
        expires_at,
        organizations (
          name,
          logo_url
        ),
        inviter:profiles!org_invitations_invited_by_fkey (
          first_name,
          last_name
        )
      `,
      )
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (error || !invite) {
      throw new NotFoundException({
        code: 'INVITATION_INVALID',
        message: 'Invalid or expired invitation',
      });
    }

    // Check expiry
    if (new Date(invite.expires_at) < new Date()) {
      throw new BadRequestException({
        code: 'INVITATION_EXPIRED',
        message: 'This invitation has expired',
      });
    }

    const org = invite.organizations as unknown as { name: string; logo_url: string | null } | null;
    const inviter = invite.inviter as unknown as { first_name: string; last_name: string } | null;
    return {
      organization: {
        name: org?.name ?? '',
        logo_url: org?.logo_url ?? null,
      },
      role: invite.role,
      invited_by: inviter
        ? `${inviter.first_name} ${inviter.last_name}`.trim()
        : null,
      expires_at: invite.expires_at,
    };
  }

  /**
   * Accept an invitation
   */
  async accept(token: string, userId: UserId) {
    // Get invitation
    const { data: invite, error } = await this.supabase.adminClient
      .from('org_invitations')
      .select(
        `
        id,
        org_id,
        email,
        role,
        expires_at,
        invited_by,
        organizations (
          id,
          name,
          slug
        )
      `,
      )
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (error || !invite) {
      throw new BadRequestException({
        code: 'INVITATION_INVALID',
        message: 'Invalid invitation token',
      });
    }

    // Check expiry
    if (new Date(invite.expires_at) < new Date()) {
      throw new BadRequestException({
        code: 'INVITATION_EXPIRED',
        message: 'This invitation has expired',
      });
    }

    // Check if already a member
    const { data: existingMember } = await this.supabase.adminClient
      .from('org_memberships')
      .select('id')
      .eq('org_id', invite.org_id)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (existingMember) {
      throw new ConflictException({
        code: 'MEMBER_ALREADY_EXISTS',
        message: 'You are already a member of this organization',
      });
    }

    // Create membership
    const { error: memberError } = await this.supabase.adminClient
      .from('org_memberships')
      .insert({
        org_id: invite.org_id,
        user_id: userId,
        role: invite.role,
        is_owner: false,
        status: 'active',
        invited_by: invite.invited_by,
      });

    if (memberError) {
      throw new BadRequestException({
        code: 'INVITATION_ACCEPT_FAILED',
        message: memberError.message,
      });
    }

    // Update invitation status
    await this.supabase.adminClient
      .from('org_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: userId,
      })
      .eq('id', invite.id);

    const org = invite.organizations as unknown as { id: string; name: string; slug: string } | null;
    return {
      message: 'Invitation accepted',
      organization: {
        id: org?.id ?? '',
        name: org?.name ?? '',
        slug: org?.slug ?? '',
      },
      role: invite.role,
    };
  }
}
