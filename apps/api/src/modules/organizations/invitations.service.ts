import { randomBytes } from 'node:crypto';
import type { OrgId, OrgRole, UserId } from '@atrivio/shared';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RbacService } from '../../core/rbac/rbac.service.js';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { SubscriptionsService } from '../payments/subscriptions.service.js';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    private supabase: SupabaseService,
    private rbacService: RbacService,
    private notificationsService: NotificationsService,
    private config: ConfigService,
    private subscriptionsService: SubscriptionsService
  ) {}

  /**
   * Create an invitation
   */
  async create(
    orgId: OrgId,
    email: string,
    role: OrgRole,
    inviterId: UserId,
    inviterRole: OrgRole
  ) {
    // Check if inviter can invite to this role
    if (!this.rbacService.canInviteToRole(inviterRole, role)) {
      throw new ForbiddenException({
        code: 'ROLE_ESCALATION',
        message: 'Cannot invite to this role',
      });
    }

    // Check staff member limit for org's subscription tier
    const subscription = await this.subscriptionsService.getSubscription(orgId);
    const limit = subscription.limits.staffMembers;

    if (limit !== -1) {
      // -1 means unlimited
      // Count active members + pending invitations
      const { count: memberCount } = await this.supabase.adminClient
        .from('org_memberships')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'active');

      const { count: pendingCount } = await this.supabase.adminClient
        .from('org_invitations')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', orgId)
        .eq('status', 'pending');

      const totalCount = (memberCount || 0) + (pendingCount || 0);

      if (totalCount >= limit) {
        throw new ForbiddenException({
          code: 'STAFF_LIMIT_REACHED',
          message: `Your ${subscription.tier} plan allows up to ${limit} staff member(s). Please upgrade to add more.`,
        });
      }
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
      `
      )
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'INVITATION_CREATE_FAILED',
        message: error.message,
      });
    }

    // Get organization name for the email
    const { data: org } = await this.supabase.adminClient
      .from('organizations')
      .select('name')
      .eq('id', orgId)
      .single();

    const orgName = org?.name || 'your organization';

    // Send invitation email
    const inviter = invite.inviter as unknown as {
      id: string;
      first_name: string;
      last_name: string;
    } | null;
    const inviterName = inviter ? `${inviter.first_name} ${inviter.last_name}`.trim() : 'Someone';

    const appUrl = this.config.get('APP_URL') || 'http://localhost:3000';
    const inviteUrl = `${appUrl}/invite/${token}`;

    const emailSubject = `You've been invited to join ${orgName}`;
    const emailBody = `Hi,

${inviterName} has invited you to join ${orgName} as a ${role}.

Click the link below to accept your invitation:
${inviteUrl}

This invitation will expire in 7 days.

If you weren't expecting this invitation, you can safely ignore this email.

—
Atrivio Platform`;

    try {
      await this.notificationsService.sendEmail(email, emailSubject, emailBody, orgId);
      this.logger.log(`Invitation email sent to ${email} for org ${orgId}`);
    } catch (emailError) {
      // Log the error but don't fail the invitation creation
      this.logger.error(`Failed to send invitation email to ${email}:`, emailError);
    }
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
      `
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
      `
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
      invited_by: inviter ? `${inviter.first_name} ${inviter.last_name}`.trim() : null,
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
      `
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

    // Safety check: verify staff limit hasn't been reached since invitation was sent
    const subscription = await this.subscriptionsService.getSubscription(invite.org_id);
    const limit = subscription.limits.staffMembers;

    if (limit !== -1) {
      const { count: memberCount } = await this.supabase.adminClient
        .from('org_memberships')
        .select('id', { count: 'exact', head: true })
        .eq('org_id', invite.org_id)
        .eq('status', 'active');

      if (memberCount !== null && memberCount >= limit) {
        throw new ForbiddenException({
          code: 'STAFF_LIMIT_REACHED',
          message: `This organization has reached their staff member limit. Please contact the organization owner to upgrade their plan.`,
        });
      }
    }

    // Create membership
    const { data: membership, error: memberError } = await this.supabase.adminClient
      .from('org_memberships')
      .insert({
        org_id: invite.org_id,
        user_id: userId,
        role: invite.role,
        is_owner: false,
        status: 'active',
        invited_by: invite.invited_by,
      })
      .select('id')
      .single();

    if (memberError || !membership) {
      throw new BadRequestException({
        code: 'INVITATION_ACCEPT_FAILED',
        message: memberError?.message || 'Failed to create membership',
      });
    }

    // Create staff profile (required for time tracking and staff features)
    const { error: staffError } = await this.supabase.adminClient.from('staff_profiles').insert({
      id: membership.id,
      org_id: invite.org_id,
      status: 'active',
      employment_type: 'seasonal', // Default for invited staff
    });

    if (staffError) {
      // Log but don't fail - staff profile can be created later
      this.logger.warn(`Failed to create staff profile for invited user: ${staffError.message}`);
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

    const org = invite.organizations as unknown as {
      id: string;
      name: string;
      slug: string;
    } | null;
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
