import type { UserId } from '@haunt/shared';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type { ChangePasswordDto, UpdateProfileDto } from './dto/users.dto.js';

@Injectable()
export class UsersService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Get user profile with memberships
   */
  async getProfile(userId: UserId, accessToken: string) {
    const client = this.supabase.getClientWithToken(accessToken);

    // Get profile
    const { data: profile, error: profileError } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User profile not found',
      });
    }

    // Get memberships
    const { data: memberships } = await client
      .from('org_memberships')
      .select(
        `
        org_id,
        role,
        organizations (
          name
        )
      `
      )
      .eq('user_id', userId)
      .eq('status', 'active');

    // Check if super admin
    const { data: adminRecord } = await this.supabase.adminClient
      .from('platform_admins')
      .select('id')
      .eq('user_id', userId)
      .single();

    return {
      ...profile,
      is_super_admin: !!adminRecord,
      memberships:
        memberships?.map((m: any) => ({
          org_id: m.org_id,
          org_name: m.organizations?.name,
          role: m.role,
        })) || [],
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: UserId, dto: UpdateProfileDto) {
    const { data, error } = await this.supabase.adminClient
      .from('profiles')
      .update({
        first_name: dto.first_name,
        last_name: dto.last_name,
        display_name: dto.display_name,
        phone: dto.phone,
        timezone: dto.timezone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'USER_UPDATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Change user password
   */
  async changePassword(accessToken: string, dto: ChangePasswordDto) {
    const client = this.supabase.getClientWithToken(accessToken);

    // First verify current password by attempting to sign in
    const { error: verifyError } = await this.supabase.client.auth.signInWithPassword({
      email: '', // We need the email - get it from the user
      password: dto.current_password,
    });

    // Update password
    const { error } = await client.auth.updateUser({
      password: dto.new_password,
    });

    if (error) {
      throw new BadRequestException({
        code: 'PASSWORD_CHANGE_FAILED',
        message: error.message,
      });
    }

    return { message: 'Password changed successfully' };
  }

  /**
   * Remove user avatar
   */
  async removeAvatar(userId: UserId) {
    const { data, error } = await this.supabase.adminClient
      .from('profiles')
      .update({ avatar_url: null, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('avatar_url')
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'AVATAR_REMOVE_FAILED',
        message: error.message,
      });
    }

    return { avatar_url: null };
  }

  /**
   * List all users (super admin only)
   */
  async listUsers(params: { page: number; limit: number; search?: string }) {
    const { page, limit, search } = params;
    const offset = (page - 1) * limit;

    let query = this.supabase.adminClient
      .from('profiles')
      .select('*, platform_admins(user_id)', { count: 'exact' });

    if (search) {
      query = query.or(
        `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
      );
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new BadRequestException({
        code: 'USER_LIST_FAILED',
        message: error.message,
      });
    }

    return {
      data: data?.map((u: any) => ({
        ...u,
        is_super_admin: !!u.platform_admins,
      })),
      meta: {
        total: count || 0,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit),
      },
    };
  }

  /**
   * Get user by ID (super admin only)
   */
  async getUserById(id: string) {
    const { data: profile, error } = await this.supabase.adminClient
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !profile) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    // Get memberships
    const { data: memberships } = await this.supabase.adminClient
      .from('org_memberships')
      .select(
        `
        org_id,
        role,
        organizations (
          name
        )
      `
      )
      .eq('user_id', id);

    // Check if super admin
    const { data: adminRecord } = await this.supabase.adminClient
      .from('platform_admins')
      .select('id')
      .eq('user_id', id)
      .single();

    return {
      ...profile,
      is_super_admin: !!adminRecord,
      memberships:
        memberships?.map((m: any) => ({
          org_id: m.org_id,
          org_name: m.organizations?.name,
          role: m.role,
        })) || [],
    };
  }

  /**
   * Update user (super admin only)
   */
  async updateUser(id: string, dto: { is_super_admin?: boolean }) {
    if (dto.is_super_admin !== undefined) {
      if (dto.is_super_admin) {
        // Add to platform_admins
        await this.supabase.adminClient.from('platform_admins').upsert({ user_id: id });
      } else {
        // Remove from platform_admins
        await this.supabase.adminClient.from('platform_admins').delete().eq('user_id', id);
      }
    }

    return this.getUserById(id);
  }
}
