import type { OrgId, UserId } from '@haunt/shared';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type {
  CreateAvailabilityDto,
  RequestTimeOffDto,
  SetRecurringAvailabilityDto,
  UpdateAvailabilityDto,
} from './dto/availability.dto.js';

@Injectable()
export class AvailabilityService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Get staff availability
   */
  async getStaffAvailability(orgId: OrgId, staffId: string) {
    await this.verifyStaffAccess(orgId, staffId);

    const { data, error } = await this.supabase.adminClient
      .from('staff_availability')
      .select('*')
      .eq('org_id', orgId)
      .eq('staff_id', staffId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      throw new BadRequestException({
        code: 'AVAILABILITY_FETCH_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Create a single availability entry
   */
  async createAvailability(
    orgId: OrgId,
    staffId: string,
    dto: CreateAvailabilityDto,
    createdBy: UserId
  ) {
    await this.verifyStaffAccess(orgId, staffId);

    const { data, error } = await this.supabase.adminClient
      .from('staff_availability')
      .insert({
        org_id: orgId,
        staff_id: staffId,
        day_of_week: dto.dayOfWeek,
        start_time: dto.startTime,
        end_time: dto.endTime,
        availability_type: dto.availabilityType,
        effective_from: dto.effectiveFrom || null,
        effective_to: dto.effectiveTo || null,
        notes: dto.notes,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'AVAILABILITY_CREATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Update an availability entry
   */
  async updateAvailability(orgId: OrgId, availabilityId: string, dto: UpdateAvailabilityDto) {
    // Verify existence
    const { data: existing } = await this.supabase.adminClient
      .from('staff_availability')
      .select('*')
      .eq('org_id', orgId)
      .eq('id', availabilityId)
      .single();

    if (!existing) {
      throw new NotFoundException({
        code: 'AVAILABILITY_NOT_FOUND',
        message: 'Availability record not found',
      });
    }

    const updateData: Record<string, unknown> = {};
    if (dto.dayOfWeek !== undefined) updateData['day_of_week'] = dto.dayOfWeek;
    if (dto.startTime) updateData['start_time'] = dto.startTime;
    if (dto.endTime) updateData['end_time'] = dto.endTime;
    if (dto.availabilityType) updateData['availability_type'] = dto.availabilityType;
    if (dto.effectiveFrom !== undefined) updateData['effective_from'] = dto.effectiveFrom;
    if (dto.effectiveTo !== undefined) updateData['effective_to'] = dto.effectiveTo;
    if (dto.notes !== undefined) updateData['notes'] = dto.notes;
    updateData['updated_at'] = new Date().toISOString();

    const { data, error } = await this.supabase.adminClient
      .from('staff_availability')
      .update(updateData)
      .eq('org_id', orgId)
      .eq('id', availabilityId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'AVAILABILITY_UPDATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Delete an availability entry
   */
  async deleteAvailability(orgId: OrgId, availabilityId: string) {
    const { error } = await this.supabase.adminClient
      .from('staff_availability')
      .delete()
      .eq('org_id', orgId)
      .eq('id', availabilityId);

    if (error) {
      throw new BadRequestException({
        code: 'AVAILABILITY_DELETE_FAILED',
        message: error.message,
      });
    }

    return { success: true };
  }

  /**
   * Set recurring weekly availability (replaces existing)
   */
  async setRecurringAvailability(
    orgId: OrgId,
    staffId: string,
    dto: SetRecurringAvailabilityDto,
    createdBy: UserId
  ) {
    await this.verifyStaffAccess(orgId, staffId);

    // Delete existing recurring availability (no effective dates)
    await this.supabase.adminClient
      .from('staff_availability')
      .delete()
      .eq('org_id', orgId)
      .eq('staff_id', staffId)
      .is('effective_from', null)
      .is('effective_to', null);

    // Insert new availability
    if (dto.availability.length > 0) {
      const records = dto.availability.map((a) => ({
        org_id: orgId,
        staff_id: staffId,
        day_of_week: a.dayOfWeek,
        start_time: a.startTime,
        end_time: a.endTime,
        availability_type: a.availabilityType,
        effective_from: a.effectiveFrom || null,
        effective_to: a.effectiveTo || null,
        notes: a.notes,
        created_by: createdBy,
      }));

      const { error } = await this.supabase.adminClient.from('staff_availability').insert(records);

      if (error) {
        throw new BadRequestException({
          code: 'AVAILABILITY_SET_FAILED',
          message: error.message,
        });
      }
    }

    return this.getStaffAvailability(orgId, staffId);
  }

  /**
   * Request time off
   */
  async requestTimeOff(orgId: OrgId, staffId: string, dto: RequestTimeOffDto, requestedBy: UserId) {
    await this.verifyStaffAccess(orgId, staffId);

    // Create unavailable entries for the date range
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const records: Array<{
      org_id: string;
      staff_id: string;
      day_of_week: number;
      start_time: string;
      end_time: string;
      availability_type: string;
      effective_from: string;
      effective_to: string;
      notes: string | null;
      created_by: string;
    }> = [];

    // Create a single entry covering the date range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      records.push({
        org_id: orgId,
        staff_id: staffId,
        day_of_week: d.getDay(),
        start_time: '00:00',
        end_time: '23:59',
        availability_type: 'time_off_pending',
        effective_from: dto.startDate,
        effective_to: dto.endDate,
        notes: dto.reason || null,
        created_by: requestedBy,
      });
    }

    const { data, error } = await this.supabase.adminClient
      .from('staff_availability')
      .insert(records)
      .select();

    if (error) {
      throw new BadRequestException({
        code: 'TIME_OFF_REQUEST_FAILED',
        message: error.message,
      });
    }

    return {
      message: 'Time off request submitted',
      startDate: dto.startDate,
      endDate: dto.endDate,
      status: 'pending',
      records: data,
    };
  }

  /**
   * Approve time off request
   */
  async approveTimeOff(orgId: OrgId, requestId: string, approvedBy: UserId) {
    const { data: request } = await this.supabase.adminClient
      .from('staff_availability')
      .select('*')
      .eq('org_id', orgId)
      .eq('id', requestId)
      .eq('availability_type', 'time_off_pending')
      .single();

    if (!request) {
      throw new NotFoundException({
        code: 'TIME_OFF_NOT_FOUND',
        message: 'Time off request not found or already processed',
      });
    }

    // Update all related records (same staff, same effective dates)
    const { data, error } = await this.supabase.adminClient
      .from('staff_availability')
      .update({
        availability_type: 'time_off_approved',
        updated_at: new Date().toISOString(),
      })
      .eq('org_id', orgId)
      .eq('staff_id', request.staff_id)
      .eq('effective_from', request.effective_from)
      .eq('effective_to', request.effective_to)
      .eq('availability_type', 'time_off_pending')
      .select();

    if (error) {
      throw new BadRequestException({
        code: 'TIME_OFF_APPROVE_FAILED',
        message: error.message,
      });
    }

    return {
      message: 'Time off approved',
      approvedBy,
      records: data,
    };
  }

  /**
   * Get availability for a specific date (checks if staff is available)
   */
  async checkAvailabilityForDate(
    orgId: OrgId,
    staffId: string,
    date: string,
    startTime: string,
    endTime: string
  ) {
    const dayOfWeek = new Date(date).getDay();

    // Get all availability records for this staff member
    const { data: availability } = await this.supabase.adminClient
      .from('staff_availability')
      .select('*')
      .eq('org_id', orgId)
      .eq('staff_id', staffId)
      .eq('day_of_week', dayOfWeek)
      .or(`effective_from.is.null,effective_from.lte.${date}`)
      .or(`effective_to.is.null,effective_to.gte.${date}`);

    if (!availability || availability.length === 0) {
      return { available: true, reason: 'No availability restrictions' };
    }

    // Check for unavailable/time-off that covers the requested time
    const blockers = availability.filter(
      (a) =>
        ['unavailable', 'time_off_approved', 'time_off_pending'].includes(a.availability_type) &&
        this.timeOverlaps(a.start_time, a.end_time, startTime, endTime)
    );

    if (blockers.length > 0) {
      return {
        available: false,
        reason:
          blockers[0].availability_type === 'time_off_approved'
            ? 'Staff has approved time off'
            : blockers[0].availability_type === 'time_off_pending'
              ? 'Staff has pending time off request'
              : 'Staff marked as unavailable',
        blockers,
      };
    }

    // Check for explicit availability
    const available = availability.filter(
      (a) =>
        ['available', 'preferred'].includes(a.availability_type) &&
        this.timeOverlaps(a.start_time, a.end_time, startTime, endTime)
    );

    if (available.length > 0) {
      return {
        available: true,
        reason: available.some((a) => a.availability_type === 'preferred')
          ? 'Staff prefers this time'
          : 'Staff is available',
        matches: available,
      };
    }

    return { available: true, reason: 'No conflicts found' };
  }

  // ============== Private Helpers ==============

  private async verifyStaffAccess(orgId: OrgId, staffId: string) {
    const { data } = await this.supabase.adminClient
      .from('staff_profiles')
      .select('id')
      .eq('org_id', orgId)
      .eq('id', staffId)
      .single();

    if (!data) {
      throw new NotFoundException({
        code: 'STAFF_NOT_FOUND',
        message: 'Staff member not found',
      });
    }
  }

  private timeOverlaps(start1: string, end1: string, start2: string, end2: string): boolean {
    // Simple time overlap check (assumes same day)
    return start1 < end2 && start2 < end1;
  }
}
