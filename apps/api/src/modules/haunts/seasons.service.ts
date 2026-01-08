import type { OrgId } from '@atrivio/shared';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type { CreateSeasonDto, UpdateSeasonDto } from './dto/seasons.dto.js';

@Injectable()
export class SeasonsService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Create a new season
   */
  async create(orgId: OrgId, attractionId: string, dto: CreateSeasonDto) {
    // Verify attraction belongs to org
    await this.verifyAttractionAccess(orgId, attractionId);

    // Validate dates
    if (new Date(dto.end_date) <= new Date(dto.start_date)) {
      throw new BadRequestException({
        code: 'SEASON_INVALID_DATES',
        message: 'End date must be after start date',
      });
    }

    const { data, error } = await this.supabase.adminClient
      .from('seasons')
      .insert({
        attraction_id: attractionId,
        name: dto.name,
        year: dto.year,
        start_date: dto.start_date,
        end_date: dto.end_date,
        status: 'upcoming',
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'SEASON_CREATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * List seasons for an attraction
   */
  async findAll(orgId: OrgId, attractionId: string, filters?: { year?: number; status?: string }) {
    await this.verifyAttractionAccess(orgId, attractionId);

    let query = this.supabase.adminClient
      .from('seasons')
      .select('*')
      .eq('attraction_id', attractionId);

    if (filters?.year) {
      query = query.eq('year', filters.year);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('start_date', {
      ascending: false,
    });

    if (error) {
      throw new BadRequestException({
        code: 'SEASON_LIST_FAILED',
        message: error.message,
      });
    }

    return { data };
  }

  /**
   * Get season by ID
   */
  async findById(orgId: OrgId, attractionId: string, seasonId: string) {
    await this.verifyAttractionAccess(orgId, attractionId);

    const { data, error } = await this.supabase.adminClient
      .from('seasons')
      .select('*')
      .eq('id', seasonId)
      .eq('attraction_id', attractionId)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'SEASON_NOT_FOUND',
        message: 'Season not found',
      });
    }

    return data;
  }

  /**
   * Update season
   */
  async update(orgId: OrgId, attractionId: string, seasonId: string, dto: UpdateSeasonDto) {
    await this.verifyAttractionAccess(orgId, attractionId);

    // Validate dates if both provided
    if (dto.start_date && dto.end_date) {
      if (new Date(dto.end_date) <= new Date(dto.start_date)) {
        throw new BadRequestException({
          code: 'SEASON_INVALID_DATES',
          message: 'End date must be after start date',
        });
      }
    }

    const { data, error } = await this.supabase.adminClient
      .from('seasons')
      .update({
        name: dto.name,
        year: dto.year,
        start_date: dto.start_date,
        end_date: dto.end_date,
        status: dto.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', seasonId)
      .eq('attraction_id', attractionId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'SEASON_UPDATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Delete season
   */
  async delete(orgId: OrgId, attractionId: string, seasonId: string) {
    await this.verifyAttractionAccess(orgId, attractionId);

    const { error } = await this.supabase.adminClient
      .from('seasons')
      .delete()
      .eq('id', seasonId)
      .eq('attraction_id', attractionId);

    if (error) {
      throw new BadRequestException({
        code: 'SEASON_DELETE_FAILED',
        message: error.message,
      });
    }

    return { message: 'Season deleted' };
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
