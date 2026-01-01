import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type { OrgId, UserId } from '@haunt/shared';
import type { AddCertificationDto } from './dto/certifications.dto.js';

@Injectable()
export class CertificationsService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Get staff certifications
   */
  async findAll(orgId: OrgId, staffId: string) {
    await this.verifyStaffAccess(orgId, staffId);

    const { data, error } = await this.supabase.adminClient
      .from('staff_certifications')
      .select(`
        id,
        type,
        certificate_number,
        issued_at,
        expires_at,
        verified,
        verified_by,
        verified_at,
        document_url,
        verifier:verified_by (
          id,
          first_name,
          last_name
        )
      `)
      .eq('org_member_id', staffId)
      .order('expires_at', { ascending: true });

    if (error) {
      throw new BadRequestException({
        code: 'CERTS_LIST_FAILED',
        message: error.message,
      });
    }

    const now = new Date();
    const certifications = data.map((c: any) => {
      const expiresAt = c.expires_at ? new Date(c.expires_at) : null;
      const daysUntilExpiry = expiresAt
        ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        id: c.id,
        type: c.type,
        certificate_number: c.certificate_number,
        issued_at: c.issued_at,
        expires_at: c.expires_at,
        days_until_expiry: daysUntilExpiry,
        verified: c.verified,
        verified_by: c.verifier ? {
          id: c.verifier.id,
          name: `${c.verifier.first_name} ${c.verifier.last_name}`,
        } : null,
        verified_at: c.verified_at,
        document_url: c.document_url,
      };
    });

    // Get required certifications from org settings (simplified)
    const requiredTypes = ['background_check', 'first_aid'];
    const existingTypes = certifications.map((c: any) => c.type);
    const required = requiredTypes
      .filter(type => !existingTypes.includes(type))
      .map(type => ({
        type,
        status: 'missing',
        required_by: 'Before first shift',
      }));

    return { certifications, required };
  }

  /**
   * Add certification
   */
  async add(orgId: OrgId, staffId: string, dto: AddCertificationDto) {
    await this.verifyStaffAccess(orgId, staffId);

    const { data, error } = await this.supabase.adminClient
      .from('staff_certifications')
      .insert({
        org_member_id: staffId,
        type: dto.type,
        certificate_number: dto.certificate_number,
        issued_at: dto.issued_at,
        expires_at: dto.expires_at,
        verified: false,
      })
      .select(`
        id,
        type,
        certificate_number,
        issued_at,
        expires_at,
        verified
      `)
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'CERT_CREATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Verify certification
   */
  async verify(orgId: OrgId, staffId: string, certId: string, verifierId: UserId) {
    await this.verifyStaffAccess(orgId, staffId);

    const { data, error } = await this.supabase.adminClient
      .from('staff_certifications')
      .update({
        verified: true,
        verified_by: verifierId,
        verified_at: new Date().toISOString(),
      })
      .eq('id', certId)
      .eq('org_member_id', staffId)
      .select(`
        id,
        verified,
        verified_at,
        verified_by,
        verifier:verified_by (
          id,
          first_name,
          last_name
        )
      `)
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'CERT_VERIFY_FAILED',
        message: error.message,
      });
    }

    const verifier = data.verifier as unknown as { id: string; first_name: string; last_name: string } | null;
    return {
      id: data.id,
      verified: data.verified,
      verified_by: verifier ? {
        id: verifier.id,
        name: `${verifier.first_name} ${verifier.last_name}`,
      } : null,
      verified_at: data.verified_at,
    };
  }

  /**
   * Delete certification
   */
  async delete(orgId: OrgId, staffId: string, certId: string) {
    await this.verifyStaffAccess(orgId, staffId);

    const { error } = await this.supabase.adminClient
      .from('staff_certifications')
      .delete()
      .eq('id', certId)
      .eq('org_member_id', staffId);

    if (error) {
      throw new BadRequestException({
        code: 'CERT_DELETE_FAILED',
        message: error.message,
      });
    }

    return { message: 'Certification deleted' };
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
