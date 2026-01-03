import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type { OrgId } from '@haunt/shared';
import type { CreateStationDto, UpdateStationDto } from './dto/station.dto.js';

@Injectable()
export class StationsService {
  constructor(private supabase: SupabaseService) {}

  /**
   * List all check-in stations for an attraction
   */
  async listStations(orgId: OrgId, attractionId: string) {
    const today = new Date().toISOString().split('T')[0];

    const { data: stations, error } = await this.supabase.adminClient
      .from('check_in_stations')
      .select('*')
      .eq('org_id', orgId)
      .eq('attraction_id', attractionId)
      .order('name', { ascending: true });

    if (error) {
      throw new BadRequestException({
        code: 'LIST_STATIONS_FAILED',
        message: error.message,
      });
    }

    // Get today's count for each station
    const stationsWithCounts = await Promise.all(
      (stations || []).map(async (station) => {
        const { count } = await this.supabase.adminClient
          .from('check_ins')
          .select('*', { count: 'exact', head: true })
          .eq('station_id', station.id)
          .gte('check_in_time', `${today}T00:00:00`)
          .lte('check_in_time', `${today}T23:59:59`);

        return {
          id: station.id,
          name: station.name,
          location: station.location,
          deviceId: station.device_id,
          isActive: station.is_active,
          lastActivity: station.last_activity,
          todayCount: count || 0,
          settings: station.settings || {},
          createdAt: station.created_at,
          updatedAt: station.updated_at,
        };
      }),
    );

    return { stations: stationsWithCounts };
  }

  /**
   * Get a single station by ID
   */
  async getStation(orgId: OrgId, attractionId: string, stationId: string) {
    const today = new Date().toISOString().split('T')[0];

    const { data: station, error } = await this.supabase.adminClient
      .from('check_in_stations')
      .select('*')
      .eq('id', stationId)
      .eq('org_id', orgId)
      .eq('attraction_id', attractionId)
      .single();

    if (error || !station) {
      throw new NotFoundException('Station not found');
    }

    const { count } = await this.supabase.adminClient
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('station_id', station.id)
      .gte('check_in_time', `${today}T00:00:00`)
      .lte('check_in_time', `${today}T23:59:59`);

    return {
      id: station.id,
      name: station.name,
      location: station.location,
      deviceId: station.device_id,
      isActive: station.is_active,
      lastActivity: station.last_activity,
      todayCount: count || 0,
      settings: station.settings || {},
      createdAt: station.created_at,
      updatedAt: station.updated_at,
    };
  }

  /**
   * Create a new check-in station
   */
  async createStation(orgId: OrgId, attractionId: string, dto: CreateStationDto) {
    const { data: station, error } = await this.supabase.adminClient
      .from('check_in_stations')
      .insert({
        org_id: orgId,
        attraction_id: attractionId,
        name: dto.name,
        location: dto.location,
        device_id: dto.deviceId,
        is_active: dto.isActive ?? true,
        settings: dto.settings || {},
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'CREATE_STATION_FAILED',
        message: error.message,
      });
    }

    return {
      id: station.id,
      name: station.name,
      location: station.location,
      deviceId: station.device_id,
      isActive: station.is_active,
      lastActivity: station.last_activity,
      todayCount: 0,
      settings: station.settings || {},
      createdAt: station.created_at,
      updatedAt: station.updated_at,
    };
  }

  /**
   * Update a check-in station
   */
  async updateStation(
    orgId: OrgId,
    attractionId: string,
    stationId: string,
    dto: UpdateStationDto,
  ) {
    // Verify station exists
    const { data: existing } = await this.supabase.adminClient
      .from('check_in_stations')
      .select('id')
      .eq('id', stationId)
      .eq('org_id', orgId)
      .eq('attraction_id', attractionId)
      .single();

    if (!existing) {
      throw new NotFoundException('Station not found');
    }

    const updates: Record<string, unknown> = {};
    if (dto.name !== undefined) updates['name'] = dto.name;
    if (dto.location !== undefined) updates['location'] = dto.location;
    if (dto.deviceId !== undefined) updates['device_id'] = dto.deviceId;
    if (dto.isActive !== undefined) updates['is_active'] = dto.isActive;
    if (dto.settings !== undefined) updates['settings'] = dto.settings;

    const { data: station, error } = await this.supabase.adminClient
      .from('check_in_stations')
      .update(updates)
      .eq('id', stationId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'UPDATE_STATION_FAILED',
        message: error.message,
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const { count } = await this.supabase.adminClient
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('station_id', station.id)
      .gte('check_in_time', `${today}T00:00:00`)
      .lte('check_in_time', `${today}T23:59:59`);

    return {
      id: station.id,
      name: station.name,
      location: station.location,
      deviceId: station.device_id,
      isActive: station.is_active,
      lastActivity: station.last_activity,
      todayCount: count || 0,
      settings: station.settings || {},
      createdAt: station.created_at,
      updatedAt: station.updated_at,
    };
  }

  /**
   * Delete a check-in station
   */
  async deleteStation(orgId: OrgId, attractionId: string, stationId: string) {
    // Verify station exists
    const { data: existing } = await this.supabase.adminClient
      .from('check_in_stations')
      .select('id')
      .eq('id', stationId)
      .eq('org_id', orgId)
      .eq('attraction_id', attractionId)
      .single();

    if (!existing) {
      throw new NotFoundException('Station not found');
    }

    const { error } = await this.supabase.adminClient
      .from('check_in_stations')
      .delete()
      .eq('id', stationId);

    if (error) {
      throw new BadRequestException({
        code: 'DELETE_STATION_FAILED',
        message: error.message,
      });
    }

    return { success: true };
  }
}
