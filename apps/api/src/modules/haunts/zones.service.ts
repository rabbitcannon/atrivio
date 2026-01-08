import type { OrgId } from '@atrivio/shared';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type { CreateZoneDto, UpdateZoneDto } from './dto/zones.dto.js';

@Injectable()
export class ZonesService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Create a new zone
   */
  async create(orgId: OrgId, attractionId: string, dto: CreateZoneDto) {
    await this.verifyAttractionAccess(orgId, attractionId);

    // Check for duplicate name
    const { data: existing } = await this.supabase.adminClient
      .from('zones')
      .select('id')
      .eq('attraction_id', attractionId)
      .eq('name', dto.name)
      .single();

    if (existing) {
      throw new ConflictException({
        code: 'ZONE_NAME_TAKEN',
        message: 'Zone name already exists for this attraction',
      });
    }

    // Get max sort order
    const { data: maxSort } = await this.supabase.adminClient
      .from('zones')
      .select('sort_order')
      .eq('attraction_id', attractionId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const sortOrder = (maxSort?.sort_order ?? -1) + 1;

    const { data, error } = await this.supabase.adminClient
      .from('zones')
      .insert({
        attraction_id: attractionId,
        name: dto.name,
        description: dto.description,
        capacity: dto.capacity,
        color: dto.color,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'ZONE_CREATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * List zones for an attraction
   */
  async findAll(orgId: OrgId, attractionId: string) {
    await this.verifyAttractionAccess(orgId, attractionId);

    const { data, error } = await this.supabase.adminClient
      .from('zones')
      .select(
        `
        id,
        name,
        description,
        capacity,
        color,
        sort_order
      `
      )
      .eq('attraction_id', attractionId)
      .order('sort_order');

    if (error) {
      throw new BadRequestException({
        code: 'ZONE_LIST_FAILED',
        message: error.message,
      });
    }

    // Get staff counts per zone
    const zoneIds = data.map((z: any) => z.id);
    const { data: staffZones } = await this.supabase.adminClient
      .from('staff_zones')
      .select('zone_id')
      .in('zone_id', zoneIds);

    const staffCounts = new Map<string, number>();
    staffZones?.forEach((sz: any) => {
      staffCounts.set(sz.zone_id, (staffCounts.get(sz.zone_id) || 0) + 1);
    });

    return {
      data: data.map((z: any) => ({
        ...z,
        staff_count: staffCounts.get(z.id) || 0,
      })),
    };
  }

  /**
   * Get zone by ID
   */
  async findById(orgId: OrgId, attractionId: string, zoneId: string) {
    await this.verifyAttractionAccess(orgId, attractionId);

    const { data, error } = await this.supabase.adminClient
      .from('zones')
      .select('*')
      .eq('id', zoneId)
      .eq('attraction_id', attractionId)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'ZONE_NOT_FOUND',
        message: 'Zone not found',
      });
    }

    return data;
  }

  /**
   * Update zone
   */
  async update(orgId: OrgId, attractionId: string, zoneId: string, dto: UpdateZoneDto) {
    await this.verifyAttractionAccess(orgId, attractionId);

    // Check for duplicate name if changing
    if (dto.name) {
      const { data: existing } = await this.supabase.adminClient
        .from('zones')
        .select('id')
        .eq('attraction_id', attractionId)
        .eq('name', dto.name)
        .neq('id', zoneId)
        .single();

      if (existing) {
        throw new ConflictException({
          code: 'ZONE_NAME_TAKEN',
          message: 'Zone name already exists for this attraction',
        });
      }
    }

    const { data, error } = await this.supabase.adminClient
      .from('zones')
      .update({
        name: dto.name,
        description: dto.description,
        capacity: dto.capacity,
        color: dto.color,
        updated_at: new Date().toISOString(),
      })
      .eq('id', zoneId)
      .eq('attraction_id', attractionId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'ZONE_UPDATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Delete zone
   */
  async delete(orgId: OrgId, attractionId: string, zoneId: string) {
    await this.verifyAttractionAccess(orgId, attractionId);

    const { error } = await this.supabase.adminClient
      .from('zones')
      .delete()
      .eq('id', zoneId)
      .eq('attraction_id', attractionId);

    if (error) {
      throw new BadRequestException({
        code: 'ZONE_DELETE_FAILED',
        message: error.message,
      });
    }

    return { message: 'Zone deleted' };
  }

  /**
   * Reorder zones
   */
  async reorder(orgId: OrgId, attractionId: string, zoneIds: string[]) {
    await this.verifyAttractionAccess(orgId, attractionId);

    // Update sort_order for each zone
    for (let i = 0; i < zoneIds.length; i++) {
      await this.supabase.adminClient
        .from('zones')
        .update({ sort_order: i })
        .eq('id', zoneIds[i])
        .eq('attraction_id', attractionId);
    }

    return { message: 'Zones reordered' };
  }

  /**
   * Verify attraction belongs to org
   */
  private async verifyAttractionAccess(orgId: OrgId, attractionId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('attractions')
      .select('id')
      .eq('id', attractionId)
      .eq('org_id', orgId)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'ATTRACTION_NOT_FOUND',
        message: 'Attraction not found',
      });
    }
  }
}
