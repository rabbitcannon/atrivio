import type { OrgId, UserId } from '@haunt/shared';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type {
  CreateScheduleDto,
  ListSchedulesQueryDto,
  PublishSchedulesDto,
  UpdateScheduleDto,
} from './dto/schedule.dto.js';

@Injectable()
export class SchedulingService {
  constructor(private supabase: SupabaseService) {}

  /**
   * List schedules with filters
   */
  async listSchedules(orgId: OrgId, attractionId: string, query: ListSchedulesQueryDto) {
    let qb = this.supabase.adminClient
      .from('schedules')
      .select(`
        *,
        staff:staff_profiles (
          id,
          org_memberships!staff_profiles_id_fkey (
            user_id,
            profiles:profiles!org_memberships_user_id_fkey (
              first_name,
              last_name,
              email
            )
          )
        ),
        role:schedule_roles(id, name, color),
        attraction:attractions(id, name)
      `)
      .eq('org_id', orgId)
      .eq('attraction_id', attractionId)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (query.staffId) {
      qb = qb.eq('staff_id', query.staffId);
    }
    if (query.roleId) {
      qb = qb.eq('role_id', query.roleId);
    }
    if (query.status) {
      qb = qb.eq('status', query.status);
    }
    if (query.startDate) {
      qb = qb.gte('date', query.startDate);
    }
    if (query.endDate) {
      qb = qb.lte('date', query.endDate);
    }
    if (!query.includeUnassigned) {
      qb = qb.not('staff_id', 'is', null);
    }

    const { data, error } = await qb;

    if (error) {
      throw new BadRequestException({
        code: 'SCHEDULE_LIST_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Get a single schedule by ID
   */
  async getSchedule(orgId: OrgId, scheduleId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('schedules')
      .select(`
        *,
        staff:staff_profiles (
          id,
          org_memberships!staff_profiles_id_fkey (
            user_id,
            profiles:profiles!org_memberships_user_id_fkey (
              first_name,
              last_name,
              email
            )
          )
        ),
        role:schedule_roles(id, name, color),
        attraction:attractions(id, name)
      `)
      .eq('org_id', orgId)
      .eq('id', scheduleId)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'SCHEDULE_NOT_FOUND',
        message: 'Schedule not found',
      });
    }

    return data;
  }

  /**
   * Create a new schedule entry
   */
  async createSchedule(orgId: OrgId, dto: CreateScheduleDto, createdBy: UserId) {
    // Validate attraction belongs to org
    await this.verifyAttraction(orgId, dto.attractionId);

    // Validate role exists
    await this.verifyRole(orgId, dto.roleId);

    // If staff assigned, validate they belong to org
    if (dto.staffId) {
      await this.verifyStaff(orgId, dto.staffId);
    }

    const { data, error } = await this.supabase.adminClient
      .from('schedules')
      .insert({
        org_id: orgId,
        attraction_id: dto.attractionId,
        staff_id: dto.staffId || null,
        role_id: dto.roleId,
        period_id: dto.periodId || null,
        date: dto.shiftDate,
        start_time: dto.startTime,
        end_time: dto.endTime,
        status: dto.staffId ? 'scheduled' : 'draft',
        notes: dto.notes,
        created_by: createdBy,
      })
      .select(`
        *,
        staff:staff_profiles (
          id,
          org_memberships!staff_profiles_id_fkey (
            user_id,
            profiles:profiles!org_memberships_user_id_fkey (
              first_name,
              last_name,
              email
            )
          )
        ),
        role:schedule_roles(id, name, color)
      `)
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'SCHEDULE_CREATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Update a schedule
   */
  async updateSchedule(orgId: OrgId, scheduleId: string, dto: UpdateScheduleDto) {
    // Verify schedule exists
    await this.getSchedule(orgId, scheduleId);

    // Validate references if provided
    if (dto.roleId) {
      await this.verifyRole(orgId, dto.roleId);
    }
    if (dto.staffId) {
      await this.verifyStaff(orgId, dto.staffId);
    }

    const updateData: Record<string, unknown> = {};
    if (dto.staffId !== undefined) updateData['staff_id'] = dto.staffId;
    if (dto.roleId) updateData['role_id'] = dto.roleId;
    if (dto.shiftDate) updateData['date'] = dto.shiftDate;
    if (dto.startTime) updateData['start_time'] = dto.startTime;
    if (dto.endTime) updateData['end_time'] = dto.endTime;
    if (dto.status) updateData['status'] = dto.status;
    if (dto.notes !== undefined) updateData['notes'] = dto.notes;
    updateData['updated_at'] = new Date().toISOString();

    const { data, error } = await this.supabase.adminClient
      .from('schedules')
      .update(updateData)
      .eq('org_id', orgId)
      .eq('id', scheduleId)
      .select(`
        *,
        staff:staff_profiles (
          id,
          org_memberships!staff_profiles_id_fkey (
            user_id,
            profiles:profiles!org_memberships_user_id_fkey (
              first_name,
              last_name,
              email
            )
          )
        ),
        role:schedule_roles(id, name, color)
      `)
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'SCHEDULE_UPDATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Delete a schedule
   */
  async deleteSchedule(orgId: OrgId, scheduleId: string) {
    const schedule = await this.getSchedule(orgId, scheduleId);

    // Only allow deletion of draft/scheduled shifts
    if (!['draft', 'scheduled'].includes(schedule.status)) {
      throw new ForbiddenException({
        code: 'SCHEDULE_DELETE_FORBIDDEN',
        message: 'Can only delete draft or scheduled shifts',
      });
    }

    const { error } = await this.supabase.adminClient
      .from('schedules')
      .delete()
      .eq('org_id', orgId)
      .eq('id', scheduleId);

    if (error) {
      throw new BadRequestException({
        code: 'SCHEDULE_DELETE_FAILED',
        message: error.message,
      });
    }

    return { success: true };
  }

  /**
   * Publish schedules within a date range
   */
  async publishSchedules(orgId: OrgId, attractionId: string, dto: PublishSchedulesDto) {
    const { data, error } = await this.supabase.adminClient
      .from('schedules')
      .update({
        status: 'published',
        updated_at: new Date().toISOString(),
      })
      .eq('org_id', orgId)
      .eq('attraction_id', attractionId)
      .in('status', ['draft', 'scheduled'])
      .gte('date', dto.startDate)
      .lte('date', dto.endDate)
      .not('staff_id', 'is', null)
      .select();

    if (error) {
      throw new BadRequestException({
        code: 'SCHEDULE_PUBLISH_FAILED',
        message: error.message,
      });
    }

    return {
      publishedCount: data?.length || 0,
      schedules: data,
    };
  }

  /**
   * Get schedules for a specific staff member (self-service)
   */
  async getMySchedules(orgId: OrgId, userId: UserId, startDate?: string, endDate?: string) {
    // First get staff_id from user_id via org_memberships
    const { data: membership } = await this.supabase.adminClient
      .from('org_memberships')
      .select('id')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .single();

    // Then check if they have a staff profile
    const staffMember = membership ? { id: membership.id } : null;

    if (!staffMember) {
      throw new NotFoundException({
        code: 'STAFF_NOT_FOUND',
        message: 'Staff member not found',
      });
    }

    let qb = this.supabase.adminClient
      .from('schedules')
      .select(`
        *,
        role:schedule_roles(id, name, color),
        attraction:attractions(id, name)
      `)
      .eq('org_id', orgId)
      .eq('staff_id', staffMember.id)
      .in('status', ['scheduled', 'published', 'confirmed'])
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (startDate) {
      qb = qb.gte('date', startDate);
    }
    if (endDate) {
      qb = qb.lte('date', endDate);
    }

    const { data, error } = await qb;

    if (error) {
      throw new BadRequestException({
        code: 'MY_SCHEDULES_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Get schedule roles for an org
   */
  async listRoles(orgId: OrgId) {
    const { data, error } = await this.supabase.adminClient
      .from('schedule_roles')
      .select('*')
      .or(`org_id.eq.${orgId},org_id.is.null`)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new BadRequestException({
        code: 'ROLES_LIST_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Get unassigned shifts for an attraction
   */
  async getUnassignedShifts(
    orgId: OrgId,
    attractionId: string,
    startDate?: string,
    endDate?: string
  ) {
    let qb = this.supabase.adminClient
      .from('schedules')
      .select(`
        *,
        role:schedule_roles(id, name, color),
        attraction:attractions(id, name)
      `)
      .eq('org_id', orgId)
      .eq('attraction_id', attractionId)
      .is('staff_id', null)
      .in('status', ['draft', 'scheduled'])
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (startDate) {
      qb = qb.gte('date', startDate);
    }
    if (endDate) {
      qb = qb.lte('date', endDate);
    }

    const { data, error } = await qb;

    if (error) {
      throw new BadRequestException({
        code: 'UNASSIGNED_SHIFTS_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  // ============== Conflict Detection ==============

  /**
   * Detect conflicts for schedules within a date range
   */
  async detectConflicts(orgId: OrgId, attractionId: string, startDate: string, endDate: string) {
    // Get all schedules in the date range that have staff assigned
    const { data: schedules, error } = await this.supabase.adminClient
      .from('schedules')
      .select(`
        id, staff_id, date, start_time, end_time, role_id,
        staff:staff_profiles(id, org_memberships(user_id, profiles:profiles!org_memberships_user_id_fkey(first_name, last_name))),
        role:schedule_roles(id, name),
        attraction:attractions(id, name)
      `)
      .eq('org_id', orgId)
      .eq('attraction_id', attractionId)
      .gte('date', startDate)
      .lte('date', endDate)
      .not('staff_id', 'is', null)
      .order('date')
      .order('start_time');

    if (error) {
      throw new BadRequestException({
        code: 'CONFLICT_DETECTION_FAILED',
        message: error.message,
      });
    }

    if (!schedules || schedules.length === 0) {
      return { conflicts: [], summary: { total: 0, byType: {} } };
    }

    // Get all schedules across ALL attractions for the same org to check for double-bookings
    const { data: allOrgSchedules } = await this.supabase.adminClient
      .from('schedules')
      .select('id, staff_id, date, start_time, end_time, attraction_id, attractions(name)')
      .eq('org_id', orgId)
      .gte('date', startDate)
      .lte('date', endDate)
      .not('staff_id', 'is', null);

    // Get staff availability for the date range
    const staffIds = [...new Set(schedules.map((s) => s.staff_id))];
    const { data: availabilityData } = await this.supabase.adminClient
      .from('staff_availability')
      .select('*')
      .in('staff_id', staffIds)
      .in('availability_type', ['unavailable', 'time_off_approved']);

    const conflicts: Array<{
      type: string;
      scheduleId: string;
      staffId: string;
      staffName: string;
      date: string;
      message: string;
      severity: 'warning' | 'error';
      relatedScheduleId?: string;
    }> = [];

    // Check each schedule for conflicts
    for (const schedule of schedules) {
      // Supabase returns nested relations as arrays
      const staff = Array.isArray(schedule.staff) ? schedule.staff[0] : schedule.staff;
      const membership = staff?.org_memberships?.[0];
      const profile = membership?.profiles?.[0];
      const staffName = profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown';

      // 1. Check for double-booking (same staff, overlapping times on same day)
      const overlapping = (allOrgSchedules || []).filter((other) => {
        if (other.id === schedule.id) return false;
        if (other.staff_id !== schedule.staff_id) return false;
        if (other.date !== schedule.date) return false;

        // Check time overlap
        const schedStart = schedule.start_time;
        const schedEnd = schedule.end_time;
        const otherStart = other.start_time;
        const otherEnd = other.end_time;

        return schedStart < otherEnd && schedEnd > otherStart;
      });

      for (const overlap of overlapping) {
        // Avoid duplicate conflicts (only report once per pair)
        if (schedule.id < overlap.id) {
          conflicts.push({
            type: 'double_booked',
            scheduleId: schedule.id,
            staffId: schedule.staff_id!,
            staffName,
            date: schedule.date,
            message: `${staffName} is double-booked at ${Array.isArray(overlap.attractions) ? overlap.attractions[0]?.name : 'another location'}`,
            severity: 'error',
            relatedScheduleId: overlap.id,
          });
        }
      }

      // 2. Check for unavailability conflicts
      const dayOfWeek = new Date(`${schedule.date}T00:00:00`).getDay();
      const unavailable = (availabilityData || []).filter((avail) => {
        if (avail.staff_id !== schedule.staff_id) return false;
        if (avail.day_of_week !== dayOfWeek) return false;

        // Check if availability is in effect for this date
        if (avail.effective_from && schedule.date < avail.effective_from) return false;
        if (avail.effective_to && schedule.date > avail.effective_to) return false;

        // Check time overlap with unavailable period
        return schedule.start_time < avail.end_time && schedule.end_time > avail.start_time;
      });

      for (const unavail of unavailable) {
        conflicts.push({
          type: 'unavailable',
          scheduleId: schedule.id,
          staffId: schedule.staff_id!,
          staffName,
          date: schedule.date,
          message: `${staffName} is marked as ${unavail.availability_type.replace('_', ' ')} during this time`,
          severity: unavail.availability_type === 'time_off_approved' ? 'error' : 'warning',
        });
      }

      // 3. Check for insufficient break (less than 8 hours between shifts)
      const MIN_BREAK_HOURS = 8;
      const sameStaffSchedules = (allOrgSchedules || []).filter(
        (s) => s.staff_id === schedule.staff_id && s.id !== schedule.id
      );

      for (const other of sameStaffSchedules) {
        // Check if shifts are on consecutive days or same day
        const schedDate = new Date(`${schedule.date}T00:00:00`);
        const otherDate = new Date(`${other.date}T00:00:00`);
        const dayDiff = Math.abs(
          (schedDate.getTime() - otherDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff <= 1) {
          // Calculate hours between shifts
          let hoursBetween = 0;

          if (schedule.date === other.date) {
            // Same day - check if there's a gap
            if (schedule.end_time <= other.start_time) {
              hoursBetween = this.getHoursDiff(schedule.end_time, other.start_time);
            } else if (other.end_time <= schedule.start_time) {
              hoursBetween = this.getHoursDiff(other.end_time, schedule.start_time);
            }
          } else if (schedule.date < other.date) {
            // Schedule is day before other
            hoursBetween =
              this.getHoursDiff(schedule.end_time, '24:00:00') +
              this.getHoursDiff('00:00:00', other.start_time);
          } else {
            // Other is day before schedule
            hoursBetween =
              this.getHoursDiff(other.end_time, '24:00:00') +
              this.getHoursDiff('00:00:00', schedule.start_time);
          }

          if (hoursBetween > 0 && hoursBetween < MIN_BREAK_HOURS && schedule.id < other.id) {
            conflicts.push({
              type: 'insufficient_break',
              scheduleId: schedule.id,
              staffId: schedule.staff_id!,
              staffName,
              date: schedule.date,
              message: `${staffName} has only ${hoursBetween.toFixed(1)} hours between shifts (minimum: ${MIN_BREAK_HOURS})`,
              severity: 'warning',
              relatedScheduleId: other.id,
            });
          }
        }
      }
    }

    // Summary by type
    const byType: Record<string, number> = {};
    for (const conflict of conflicts) {
      byType[conflict.type] = (byType[conflict.type] || 0) + 1;
    }

    return {
      conflicts,
      summary: {
        total: conflicts.length,
        byType,
      },
    };
  }

  private getHoursDiff(time1: string, time2: string): number {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    return h2! - h1! + (m2! - m1!) / 60;
  }

  // ============== Private Helpers ==============

  private async verifyAttraction(orgId: OrgId, attractionId: string) {
    const { data } = await this.supabase.adminClient
      .from('attractions')
      .select('id')
      .eq('org_id', orgId)
      .eq('id', attractionId)
      .single();

    if (!data) {
      throw new NotFoundException({
        code: 'ATTRACTION_NOT_FOUND',
        message: 'Attraction not found',
      });
    }
  }

  private async verifyRole(orgId: OrgId, roleId: string) {
    const { data } = await this.supabase.adminClient
      .from('schedule_roles')
      .select('id')
      .or(`org_id.eq.${orgId},org_id.is.null`)
      .eq('id', roleId)
      .single();

    if (!data) {
      throw new NotFoundException({
        code: 'ROLE_NOT_FOUND',
        message: 'Schedule role not found',
      });
    }
  }

  private async verifyStaff(orgId: OrgId, staffId: string) {
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
}
