import type { OrgId, UserId } from '@atrivio/shared';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';

@Injectable()
export class DocumentsService {
  constructor(private supabase: SupabaseService) {}

  /**
   * List staff documents
   */
  async findAll(orgId: OrgId, staffId: string) {
    await this.verifyStaffAccess(orgId, staffId);

    const { data, error } = await this.supabase.adminClient
      .from('staff_documents')
      .select(`
        id,
        type,
        name,
        file_url,
        file_size,
        uploaded_by,
        created_at,
        uploader:uploaded_by (
          first_name,
          last_name
        )
      `)
      .eq('org_member_id', staffId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException({
        code: 'DOCS_LIST_FAILED',
        message: error.message,
      });
    }

    return {
      documents: data.map((d: any) => ({
        id: d.id,
        type: d.type,
        name: d.name,
        file_url: d.file_url,
        file_size: d.file_size,
        uploaded_by: d.uploader ? `${d.uploader.first_name} ${d.uploader.last_name}` : null,
        created_at: d.created_at,
      })),
    };
  }

  /**
   * Upload document
   * Note: Actual file upload handled by Supabase Storage via signed URL
   */
  async create(
    orgId: OrgId,
    staffId: string,
    type: string,
    name: string,
    fileUrl: string,
    fileSize: number,
    uploaderId: UserId,
    expiresAt?: string
  ) {
    await this.verifyStaffAccess(orgId, staffId);

    const { data, error } = await this.supabase.adminClient
      .from('staff_documents')
      .insert({
        org_member_id: staffId,
        type,
        name,
        file_url: fileUrl,
        file_size: fileSize,
        uploaded_by: uploaderId,
        expires_at: expiresAt,
      })
      .select(`
        id,
        type,
        name,
        file_url,
        created_at,
        uploader:uploaded_by (
          first_name,
          last_name
        )
      `)
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'DOC_CREATE_FAILED',
        message: error.message,
      });
    }

    const uploader = data.uploader as unknown as { first_name: string; last_name: string } | null;
    return {
      id: data.id,
      type: data.type,
      name: data.name,
      file_url: data.file_url,
      uploaded_by: uploader ? `${uploader.first_name} ${uploader.last_name}` : null,
      created_at: data.created_at,
    };
  }

  /**
   * Delete document
   */
  async delete(orgId: OrgId, staffId: string, docId: string) {
    await this.verifyStaffAccess(orgId, staffId);

    // Get file URL for storage cleanup
    const { data: doc } = await this.supabase.adminClient
      .from('staff_documents')
      .select('file_url')
      .eq('id', docId)
      .eq('org_member_id', staffId)
      .single();

    if (!doc) {
      throw new NotFoundException({
        code: 'DOC_NOT_FOUND',
        message: 'Document not found',
      });
    }

    // Delete from database
    const { error } = await this.supabase.adminClient
      .from('staff_documents')
      .delete()
      .eq('id', docId)
      .eq('org_member_id', staffId);

    if (error) {
      throw new BadRequestException({
        code: 'DOC_DELETE_FAILED',
        message: error.message,
      });
    }

    // Note: File cleanup from storage should be handled separately
    // via a background job or storage lifecycle policy

    return { message: 'Document deleted' };
  }

  /**
   * Get signed upload URL
   */
  async getUploadUrl(orgId: OrgId, staffId: string, fileName: string, _contentType: string) {
    await this.verifyStaffAccess(orgId, staffId);

    const filePath = `${orgId}/${staffId}/documents/${Date.now()}-${fileName}`;

    const { data, error } = await this.supabase.adminClient.storage
      .from('staff-documents')
      .createSignedUploadUrl(filePath);

    if (error) {
      throw new BadRequestException({
        code: 'UPLOAD_URL_FAILED',
        message: error.message,
      });
    }

    return {
      upload_url: data.signedUrl,
      file_path: filePath,
      expires_in: 3600,
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
