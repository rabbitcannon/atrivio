import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type { MediaResponse } from './dto/index.js';

interface CreateMediaParams {
  orgId: string;
  uploadedBy: string;
  key: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  url: string;
  width?: number | undefined;
  height?: number | undefined;
  altText?: string | undefined;
}

interface ListMediaParams {
  orgId: string;
  page: number;
  limit: number;
}

@Injectable()
export class MediaRepository {
  constructor(private supabase: SupabaseService) {}

  async create(params: CreateMediaParams): Promise<MediaResponse> {
    const { data, error } = await this.supabase.adminClient
      .from('org_media')
      .insert({
        org_id: params.orgId,
        uploaded_by: params.uploadedBy,
        key: params.key,
        filename: params.filename,
        content_type: params.contentType,
        size_bytes: params.sizeBytes,
        url: params.url,
        width: params.width ?? null,
        height: params.height ?? null,
        alt_text: params.altText ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapRow(data);
  }

  async findById(orgId: string, mediaId: string): Promise<MediaResponse | null> {
    const { data, error } = await this.supabase.adminClient
      .from('org_media')
      .select('*')
      .eq('org_id', orgId)
      .eq('id', mediaId)
      .is('deleted_at', null)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapRow(data) : null;
  }

  async findByKey(key: string): Promise<MediaResponse | null> {
    const { data, error } = await this.supabase.adminClient
      .from('org_media')
      .select('*')
      .eq('key', key)
      .is('deleted_at', null)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapRow(data) : null;
  }

  async list(
    params: ListMediaParams,
  ): Promise<{ items: MediaResponse[]; total: number }> {
    const { orgId, page, limit } = params;
    const offset = (page - 1) * limit;

    // Get total count
    const { count, error: countError } = await this.supabase.adminClient
      .from('org_media')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .is('deleted_at', null);

    if (countError) throw countError;

    // Get paginated items
    const { data, error } = await this.supabase.adminClient
      .from('org_media')
      .select('*')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      items: (data || []).map((row) => this.mapRow(row)),
      total: count || 0,
    };
  }

  async softDelete(orgId: string, mediaId: string): Promise<void> {
    const { error } = await this.supabase.adminClient
      .from('org_media')
      .update({ deleted_at: new Date().toISOString() })
      .eq('org_id', orgId)
      .eq('id', mediaId);

    if (error) throw error;
  }

  async getTotalSize(orgId: string): Promise<number> {
    const { data, error } = await this.supabase.adminClient.rpc(
      'get_org_storage_used',
      { p_org_id: orgId },
    );

    if (error) throw error;
    return data || 0;
  }

  async getStorageLimit(orgId: string): Promise<number> {
    const { data, error } = await this.supabase.adminClient.rpc(
      'get_org_storage_limit',
      { p_org_id: orgId },
    );

    if (error) throw error;
    return data || 0;
  }

  private mapRow(row: Record<string, unknown>): MediaResponse {
    return {
      id: row['id'] as string,
      orgId: row['org_id'] as string,
      key: row['key'] as string,
      filename: row['filename'] as string,
      contentType: row['content_type'] as string,
      sizeBytes: row['size_bytes'] as number,
      url: row['url'] as string,
      width: row['width'] as number | null,
      height: row['height'] as number | null,
      altText: row['alt_text'] as string | null,
      createdAt: row['created_at'] as string,
    };
  }
}
