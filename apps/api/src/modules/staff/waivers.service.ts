import type { OrgId } from '@atrivio/shared';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type { SignWaiverDto } from './dto/waivers.dto.js';

@Injectable()
export class WaiversService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Get staff waivers
   */
  async findAll(orgId: OrgId, staffId: string) {
    await this.verifyStaffAccess(orgId, staffId);

    const { data, error } = await this.supabase.adminClient
      .from('staff_waivers')
      .select(`
        id,
        waiver_type,
        waiver_version,
        signed_at,
        expires_at,
        ip_address
      `)
      .eq('org_member_id', staffId)
      .order('signed_at', { ascending: false });

    if (error) {
      throw new BadRequestException({
        code: 'WAIVERS_LIST_FAILED',
        message: error.message,
      });
    }

    return {
      waivers: data.map((w: any) => ({
        id: w.id,
        type: w.waiver_type,
        version: w.waiver_version,
        signed_at: w.signed_at,
        expires_at: w.expires_at,
      })),
    };
  }

  /**
   * Record signed waiver
   */
  async sign(orgId: OrgId, staffId: string, dto: SignWaiverDto, ipAddress?: string) {
    await this.verifyStaffAccess(orgId, staffId);

    // Calculate expiry (default 1 year from signing)
    const signedAt = new Date();
    const expiresAt = new Date(signedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const { data, error } = await this.supabase.adminClient
      .from('staff_waivers')
      .insert({
        org_member_id: staffId,
        waiver_type: dto.waiver_type,
        waiver_version: dto.waiver_version,
        signature_data: dto.signature_data,
        signed_at: signedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
        ip_address: ipAddress,
      })
      .select('id, waiver_type, signed_at, expires_at')
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'WAIVER_SIGN_FAILED',
        message: error.message,
      });
    }

    return {
      id: data.id,
      waiver_type: data.waiver_type,
      signed_at: data.signed_at,
      expires_at: data.expires_at,
    };
  }

  /**
   * Check if waiver is current
   */
  async checkWaiverStatus(orgId: OrgId, staffId: string, waiverType: string) {
    await this.verifyStaffAccess(orgId, staffId);

    const { data } = await this.supabase.adminClient
      .from('staff_waivers')
      .select('id, waiver_version, signed_at, expires_at')
      .eq('org_member_id', staffId)
      .eq('waiver_type', waiverType)
      .order('signed_at', { ascending: false })
      .limit(1)
      .single();

    if (!data) {
      return {
        type: waiverType,
        status: 'missing',
        signed: false,
      };
    }

    const now = new Date();
    const expiresAt = data.expires_at ? new Date(data.expires_at) : null;

    if (expiresAt && expiresAt < now) {
      return {
        type: waiverType,
        status: 'expired',
        signed: true,
        signed_at: data.signed_at,
        expires_at: data.expires_at,
      };
    }

    return {
      type: waiverType,
      status: 'valid',
      signed: true,
      version: data.waiver_version,
      signed_at: data.signed_at,
      expires_at: data.expires_at,
    };
  }

  private async verifyStaffAccess(orgId: OrgId, staffId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('org_memberships')
      .select('id')
      .eq('id', staffId)
      .eq('org_id', orgId)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'STAFF_NOT_FOUND',
        message: 'Staff member not found',
      });
    }
  }
}
