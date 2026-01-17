import type { OrgId, UserId } from '@atrivio/shared';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from '../../core/audit/audit.service.js';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type { CreateOrgDto, UpdateOrgDto } from './dto/organizations.dto.js';

@Injectable()
export class OrganizationsService {
  constructor(
    private supabase: SupabaseService,
    private audit: AuditService
  ) {}

  /**
   * Create a new organization
   * Creator becomes the owner automatically
   * Only users with no orgs OR owner/admin role can create new orgs
   */
  async create(userId: UserId, dto: CreateOrgDto) {
    // Check if user has any existing memberships
    const { data: memberships } = await this.supabase.adminClient
      .from('org_memberships')
      .select('role, is_owner')
      .eq('user_id', userId)
      .eq('status', 'active');

    const hasMemberships = memberships && memberships.length > 0;

    // If user has memberships, they must be owner or admin of at least one org
    if (hasMemberships) {
      const hasHighLevelRole = memberships.some(
        (m) => m.is_owner || m.role === 'owner' || m.role === 'admin'
      );

      if (!hasHighLevelRole) {
        throw new BadRequestException({
          code: 'ORG_CREATE_NOT_ALLOWED',
          message: 'Only organization owners and admins can create new organizations.',
        });
      }
    }

    // Check organization limit for this user (count orgs they own)
    const { count: orgCount } = await this.supabase.adminClient
      .from('org_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_owner', true)
      .eq('status', 'active');

    // Get max orgs limit from platform settings
    const { data: limitSetting } = await this.supabase.adminClient
      .from('platform_settings')
      .select('value')
      .eq('key', 'max_orgs_per_user')
      .single();

    const maxOrgs = limitSetting?.value ? Number(limitSetting.value) : 5;

    if (orgCount !== null && orgCount >= maxOrgs) {
      throw new BadRequestException({
        code: 'ORG_LIMIT_REACHED',
        message: `You have reached the maximum number of organizations (${maxOrgs}). Contact support if you need to create more.`,
      });
    }

    // Check if slug is taken
    const { data: existing } = await this.supabase.adminClient
      .from('organizations')
      .select('id')
      .eq('slug', dto.slug)
      .single();

    if (existing) {
      throw new ConflictException({
        code: 'ORG_SLUG_TAKEN',
        message: 'This organization slug is already in use',
      });
    }

    // Create organization
    const { data: org, error: orgError } = await this.supabase.adminClient
      .from('organizations')
      .insert({
        name: dto.name,
        slug: dto.slug,
        email: dto.email,
        phone: dto.phone,
        website: dto.website,
        address: dto.address,
        timezone: dto.timezone || 'America/New_York',
        status: 'active',
        settings: {},
      })
      .select()
      .single();

    if (orgError) {
      throw new BadRequestException({
        code: 'ORG_CREATE_FAILED',
        message: orgError.message,
      });
    }

    // Create owner membership
    const { data: membership, error: memberError } = await this.supabase.adminClient
      .from('org_memberships')
      .insert({
        org_id: org.id,
        user_id: userId,
        role: 'owner',
        is_owner: true,
        status: 'active',
      })
      .select('id')
      .single();

    if (memberError || !membership) {
      // Rollback org creation
      await this.supabase.adminClient.from('organizations').delete().eq('id', org.id);

      throw new BadRequestException({
        code: 'ORG_CREATE_FAILED',
        message: memberError?.message || 'Failed to create membership',
      });
    }

    // Create staff profile for the owner (required for time tracking and staff features)
    const { error: staffError } = await this.supabase.adminClient.from('staff_profiles').insert({
      id: membership.id,
      org_id: org.id,
      status: 'active',
      employment_type: 'full_time',
    });

    if (staffError) {
      // Log but don't fail - staff profile can be created later
      console.warn(`Failed to create staff profile for owner: ${staffError.message}`);
    }

    // Log audit event for new organization
    await this.audit.log({
      actorId: userId,
      action: 'organization.created',
      resourceType: 'organization',
      resourceId: org.id,
      orgId: org.id as OrgId,
      metadata: {
        org_name: org.name,
        org_slug: org.slug,
        subscription_tier: 'free',
      },
    });

    return {
      ...org,
      membership: {
        role: 'owner',
        is_owner: true,
      },
    };
  }

  /**
   * Get organizations for a user
   */
  async findByUser(userId: UserId) {
    const { data, error } = await this.supabase.adminClient
      .from('org_memberships')
      .select(
        `
        role,
        organizations (
          id,
          name,
          slug,
          logo_url,
          status,
          stripe_onboarding_complete
        )
      `
      )
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      throw new BadRequestException({
        code: 'ORG_LIST_FAILED',
        message: error.message,
      });
    }

    return {
      data: data
        .filter((m: any) => m.organizations != null)
        .map((m: any) => ({
          id: m.organizations.id,
          name: m.organizations.name,
          slug: m.organizations.slug,
          logo_url: m.organizations.logo_url,
          status: m.organizations.status,
          stripe_onboarding_complete: m.organizations.stripe_onboarding_complete,
          role: m.role,
        })),
    };
  }

  /**
   * Get organization by ID
   */
  async findById(orgId: OrgId, userId?: UserId) {
    const { data: org, error } = await this.supabase.adminClient
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

    // Get membership if userId provided
    let membership = null;
    if (userId) {
      const { data: member } = await this.supabase.adminClient
        .from('org_memberships')
        .select('role, is_owner, created_at')
        .eq('org_id', orgId)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (member) {
        membership = {
          role: member.role,
          is_owner: member.is_owner,
          joined_at: member.created_at,
        };
      }
    }

    // Get stats
    const { count: memberCount } = await this.supabase.adminClient
      .from('org_memberships')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('status', 'active');

    const { count: attractionCount } = await this.supabase.adminClient
      .from('attractions')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId);

    return {
      ...org,
      membership,
      stats: {
        member_count: memberCount || 0,
        attraction_count: attractionCount || 0,
      },
    };
  }

  /**
   * Update organization
   */
  async update(orgId: OrgId, dto: UpdateOrgDto, userId?: UserId) {
    // Get current values for change tracking
    const { data: current } = await this.supabase.adminClient
      .from('organizations')
      .select('name, email, phone, website, address, timezone')
      .eq('id', orgId)
      .single();

    const { data, error } = await this.supabase.adminClient
      .from('organizations')
      .update({
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        website: dto.website,
        address: dto.address,
        timezone: dto.timezone,
        settings: dto.settings,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orgId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'ORG_UPDATE_FAILED',
        message: error.message,
      });
    }

    // Log audit event for organization update
    if (userId && current) {
      const changes: Record<string, { from: unknown; to: unknown }> = {};
      if (dto.name !== undefined && dto.name !== current.name) {
        changes['name'] = { from: current.name, to: dto.name };
      }
      if (dto.email !== undefined && dto.email !== current.email) {
        changes['email'] = { from: current.email, to: dto.email };
      }
      if (dto.timezone !== undefined && dto.timezone !== current.timezone) {
        changes['timezone'] = { from: current.timezone, to: dto.timezone };
      }

      if (Object.keys(changes).length > 0) {
        await this.audit.log({
          actorId: userId,
          action: 'organization.updated',
          resourceType: 'organization',
          resourceId: orgId,
          orgId,
          changes,
          metadata: { org_name: data.name },
        });
      }
    }

    return data;
  }

  /**
   * Soft delete organization
   */
  async delete(orgId: OrgId) {
    const { error } = await this.supabase.adminClient
      .from('organizations')
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString(),
      })
      .eq('id', orgId);

    if (error) {
      throw new BadRequestException({
        code: 'ORG_DELETE_FAILED',
        message: error.message,
      });
    }

    return {
      message: 'Organization scheduled for deletion',
      deleted_at: new Date().toISOString(),
    };
  }

  /**
   * Check slug availability
   */
  async isSlugAvailable(slug: string, excludeOrgId?: OrgId): Promise<boolean> {
    let query = this.supabase.adminClient.from('organizations').select('id').eq('slug', slug);

    if (excludeOrgId) {
      query = query.neq('id', excludeOrgId);
    }

    const { data } = await query.single();
    return !data;
  }

  /**
   * Get organization by slug (for quick time page)
   * Returns minimal info needed for time clock UI
   */
  async findBySlug(slug: string) {
    const { data: org, error } = await this.supabase.adminClient
      .from('organizations')
      .select('id, name, slug, logo_url, status')
      .eq('slug', slug)
      .single();

    if (error || !org) {
      throw new NotFoundException({
        code: 'ORG_NOT_FOUND',
        message: 'Organization not found',
      });
    }

    if (org.status !== 'active') {
      throw new NotFoundException({
        code: 'ORG_NOT_ACTIVE',
        message: 'Organization is not active',
      });
    }

    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logo_url: org.logo_url,
    };
  }
}
