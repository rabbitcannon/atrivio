import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type { OrgId, UserId } from '@haunt/shared';
import type { ClockInDto, ClockOutDto, UpdateTimeEntryDto, TimeQueryDto } from './dto/time.dto.js';

@Injectable()
export class TimeService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Clock in
   */
  async clockIn(orgId: OrgId, staffId: string, dto: ClockInDto) {
    await this.verifyStaffAccess(orgId, staffId);

    // Check for existing active time entry
    const { data: active } = await this.supabase.adminClient
      .from('staff_time_entries')
      .select('id')
      .eq('staff_id', staffId)
      .is('clock_out', null)
      .single();

    if (active) {
      throw new BadRequestException({
        code: 'STAFF_ALREADY_CLOCKED_IN',
        message: 'Already clocked in',
      });
    }

    // Verify attraction belongs to org
    const { data: attraction } = await this.supabase.adminClient
      .from('attractions')
      .select('id, name')
      .eq('id', dto.attraction_id)
      .eq('org_id', orgId)
      .single();

    if (!attraction) {
      throw new NotFoundException({
        code: 'ATTRACTION_NOT_FOUND',
        message: 'Attraction not found',
      });
    }

    const { data, error } = await this.supabase.adminClient
      .from('staff_time_entries')
      .insert({
        staff_id: staffId,
        org_id: orgId,
        attraction_id: dto.attraction_id,
        clock_in: new Date().toISOString(),
        status: 'pending',
      })
      .select('id, clock_in, status')
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'CLOCK_IN_FAILED',
        message: error.message,
      });
    }

    return {
      id: data.id,
      clock_in: data.clock_in,
      attraction: {
        id: attraction.id,
        name: attraction.name,
      },
      status: data.status,
    };
  }

  /**
   * Clock out
   */
  async clockOut(orgId: OrgId, staffId: string, dto: ClockOutDto) {
    await this.verifyStaffAccess(orgId, staffId);

    // Find active time entry
    const { data: active } = await this.supabase.adminClient
      .from('staff_time_entries')
      .select('id, clock_in')
      .eq('staff_id', staffId)
      .is('clock_out', null)
      .single();

    if (!active) {
      throw new BadRequestException({
        code: 'STAFF_NOT_CLOCKED_IN',
        message: 'No active time entry to clock out',
      });
    }

    const clockOutTime = new Date();
    const breakMinutes = dto.break_minutes || 0;

    const { data, error } = await this.supabase.adminClient
      .from('staff_time_entries')
      .update({
        clock_out: clockOutTime.toISOString(),
        break_minutes: breakMinutes,
        notes: dto.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', active.id)
      .select('id, clock_in, clock_out, break_minutes, status')
      .single();

    // Calculate total hours
    const clockInTime = new Date(active.clock_in);
    const totalMinutes = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60) - breakMinutes;
    const totalHours = Math.round(totalMinutes / 60 * 100) / 100;

    if (error) {
      throw new BadRequestException({
        code: 'CLOCK_OUT_FAILED',
        message: error.message,
      });
    }

    return {
      ...data,
      total_hours: totalHours,
    };
  }

  /**
   * Get time entries
   */
  async findAll(orgId: OrgId, staffId: string, filters?: TimeQueryDto) {
    await this.verifyStaffAccess(orgId, staffId);

    let query = this.supabase.adminClient
      .from('staff_time_entries')
      .select(`
        id,
        clock_in,
        clock_out,
        break_minutes,
        notes,
        status,
        approved_by,
        approved_at,
        attraction_id,
        attractions (
          id,
          name
        ),
        approver:profiles!staff_time_entries_approved_by_fkey (
          first_name,
          last_name
        )
      `)
      .eq('staff_id', staffId)
      .order('clock_in', { ascending: false });

    if (filters?.start_date) {
      query = query.gte('clock_in', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('clock_in', `${filters.end_date}T23:59:59Z`);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException({
        code: 'TIME_LIST_FAILED',
        message: error.message,
      });
    }

    const entries = data.map((e: any) => {
      // Calculate total hours if both clock_in and clock_out exist
      let totalHours: number | null = null;
      if (e.clock_in && e.clock_out) {
        const clockIn = new Date(e.clock_in);
        const clockOut = new Date(e.clock_out);
        const breakMins = e.break_minutes || 0;
        const totalMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60) - breakMins;
        totalHours = Math.round(totalMinutes / 60 * 100) / 100;
      }

      return {
        id: e.id,
        date: e.clock_in ? new Date(e.clock_in).toISOString().split('T')[0] : null,
        clock_in: e.clock_in,
        clock_out: e.clock_out,
        break_minutes: e.break_minutes,
        total_hours: totalHours,
        attraction: e.attractions ? {
          id: e.attractions.id,
          name: e.attractions.name,
        } : null,
        status: e.status,
        approved_by: e.approver ? `${e.approver.first_name} ${e.approver.last_name}` : null,
        notes: e.notes,
      };
    });

    // Calculate summary
    const totalHours = entries.reduce((sum: number, e: any) => sum + (e.total_hours || 0), 0);
    const pendingApproval = entries.filter((e: any) => e.status === 'pending').length;

    return {
      entries,
      summary: {
        total_hours: Math.round(totalHours * 100) / 100,
        total_entries: entries.length,
        pending_approval: pendingApproval,
      },
    };
  }

  /**
   * Update time entry (manager correction)
   */
  async update(orgId: OrgId, entryId: string, dto: UpdateTimeEntryDto) {
    // Get entry and verify org
    const { data: entry } = await this.supabase.adminClient
      .from('staff_time_entries')
      .select('id, org_id, clock_in, clock_out, break_minutes')
      .eq('id', entryId)
      .single();

    if (!entry || entry.org_id !== orgId) {
      throw new NotFoundException({
        code: 'TIME_ENTRY_NOT_FOUND',
        message: 'Time entry not found',
      });
    }

    const { data, error } = await this.supabase.adminClient
      .from('staff_time_entries')
      .update({
        clock_in: dto.clock_in,
        clock_out: dto.clock_out,
        break_minutes: dto.break_minutes,
        notes: dto.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .select('id, clock_in, clock_out, break_minutes, notes, status')
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'TIME_UPDATE_FAILED',
        message: error.message,
      });
    }

    // Calculate total hours for response
    let totalHours: number | null = null;
    const clockIn = dto.clock_in || entry.clock_in;
    const clockOut = dto.clock_out || entry.clock_out;
    if (clockIn && clockOut) {
      const clockInTime = new Date(clockIn);
      const clockOutTime = new Date(clockOut);
      const breakMinutes = dto.break_minutes ?? entry.break_minutes ?? 0;
      const totalMinutes = (clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60) - breakMinutes;
      totalHours = Math.round(totalMinutes / 60 * 100) / 100;
    }

    return {
      ...data,
      total_hours: totalHours,
    };
  }

  /**
   * Approve time entry
   */
  async approve(orgId: OrgId, entryId: string, approverId: UserId) {
    // Verify entry belongs to org
    const { data: entry } = await this.supabase.adminClient
      .from('staff_time_entries')
      .select('id, org_id')
      .eq('id', entryId)
      .single();

    if (!entry || entry.org_id !== orgId) {
      throw new NotFoundException({
        code: 'TIME_ENTRY_NOT_FOUND',
        message: 'Time entry not found',
      });
    }

    const { data, error } = await this.supabase.adminClient
      .from('staff_time_entries')
      .update({
        status: 'approved',
        approved_by: approverId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .select(`
        id,
        status,
        approved_at,
        approver:approved_by (
          id,
          first_name,
          last_name
        )
      `)
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'TIME_APPROVE_FAILED',
        message: error.message,
      });
    }

    const approver = data.approver as unknown as { id: string; first_name: string; last_name: string } | null;
    return {
      id: data.id,
      status: data.status,
      approved_by: approver ? {
        id: approver.id,
        name: `${approver.first_name} ${approver.last_name}`,
      } : null,
      approved_at: data.approved_at,
    };
  }

  /**
   * Bulk approve time entries
   */
  async bulkApprove(orgId: OrgId, entryIds: string[], approverId: UserId) {
    let approved = 0;
    let failed = 0;

    for (const entryId of entryIds) {
      try {
        await this.approve(orgId, entryId, approverId);
        approved++;
      } catch {
        failed++;
      }
    }

    return { approved, failed };
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

  // ============================================================================
  // SELF-SERVICE ENDPOINTS (Quick Time Clock)
  // ============================================================================

  /**
   * Get current user's time clock status
   */
  async getMyStatus(orgId: OrgId, userId: UserId) {
    // Get user's membership/staff ID in this org
    const { data: membership, error: memberError } = await this.supabase.adminClient
      .from('org_memberships')
      .select('id, role')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (memberError || !membership) {
      throw new NotFoundException({
        code: 'STAFF_NOT_FOUND',
        message: 'You are not a member of this organization',
      });
    }

    const staffId = membership.id;

    // Check for active time entry
    const { data: activeEntry } = await this.supabase.adminClient
      .from('staff_time_entries')
      .select(`
        id,
        clock_in,
        attraction_id,
        attractions (
          id,
          name
        )
      `)
      .eq('staff_id', staffId)
      .is('clock_out', null)
      .single();

    // Get user's attraction assignments
    const { data: assignments } = await this.supabase.adminClient
      .from('staff_attraction_assignments')
      .select(`
        attraction_id,
        is_primary,
        attractions (
          id,
          name
        )
      `)
      .eq('staff_id', staffId);

    // If no assignments, get all attractions in org
    let attractions: { id: string; name: string; is_primary: boolean }[] = [];
    if (assignments && assignments.length > 0) {
      attractions = assignments.map((a: any) => ({
        id: a.attractions.id,
        name: a.attractions.name,
        is_primary: a.is_primary,
      }));
    } else {
      const { data: orgAttractions } = await this.supabase.adminClient
        .from('attractions')
        .select('id, name')
        .eq('org_id', orgId)
        .eq('status', 'active');

      attractions = (orgAttractions || []).map((a: any) => ({
        id: a.id,
        name: a.name,
        is_primary: false,
      }));
    }

    // Calculate duration if clocked in
    let durationMinutes = 0;
    if (activeEntry) {
      const clockIn = new Date(activeEntry.clock_in);
      const now = new Date();
      durationMinutes = Math.floor((now.getTime() - clockIn.getTime()) / (1000 * 60));
    }

    return {
      is_clocked_in: !!activeEntry,
      current_entry: activeEntry ? {
        id: activeEntry.id,
        clock_in: activeEntry.clock_in,
        attraction: activeEntry.attractions ? {
          id: (activeEntry.attractions as any).id,
          name: (activeEntry.attractions as any).name,
        } : null,
        duration_minutes: durationMinutes,
      } : null,
      staff_id: staffId,
      attractions,
    };
  }

  /**
   * Self-service clock in (derives staffId from userId)
   */
  async selfClockIn(orgId: OrgId, userId: UserId, dto: ClockInDto) {
    // Get user's staff ID in this org
    const { data: membership } = await this.supabase.adminClient
      .from('org_memberships')
      .select('id')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!membership) {
      throw new NotFoundException({
        code: 'STAFF_NOT_FOUND',
        message: 'You are not a member of this organization',
      });
    }

    return this.clockIn(orgId, membership.id, dto);
  }

  /**
   * Self-service clock out (derives staffId from userId)
   */
  async selfClockOut(orgId: OrgId, userId: UserId, dto: ClockOutDto) {
    // Get user's staff ID in this org
    const { data: membership } = await this.supabase.adminClient
      .from('org_memberships')
      .select('id')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (!membership) {
      throw new NotFoundException({
        code: 'STAFF_NOT_FOUND',
        message: 'You are not a member of this organization',
      });
    }

    return this.clockOut(orgId, membership.id, dto);
  }

  /**
   * Get list of currently clocked-in staff (manager view)
   */
  async getActiveClockedIn(orgId: OrgId) {
    const { data, error } = await this.supabase.adminClient
      .from('staff_time_entries')
      .select(`
        id,
        staff_id,
        clock_in,
        attraction_id,
        attractions (
          id,
          name
        ),
        staff:staff_profiles!staff_id (
          membership:org_memberships!staff_profiles_id_fkey (
            user_id,
            profiles:user_id (
              first_name,
              last_name,
              avatar_url
            )
          )
        )
      `)
      .eq('org_id', orgId)
      .is('clock_out', null)
      .order('clock_in', { ascending: true });

    if (error) {
      throw new BadRequestException({
        code: 'ACTIVE_STAFF_FETCH_FAILED',
        message: error.message,
      });
    }

    const now = new Date();
    const activeStaff = (data || []).map((entry: any) => {
      const clockIn = new Date(entry.clock_in);
      const durationMinutes = Math.floor((now.getTime() - clockIn.getTime()) / (1000 * 60));
      const profile = entry.staff?.membership?.profiles;

      return {
        entry_id: entry.id,
        staff_id: entry.staff_id,
        user: profile ? {
          first_name: profile.first_name,
          last_name: profile.last_name,
          avatar_url: profile.avatar_url,
        } : null,
        clock_in: entry.clock_in,
        attraction: entry.attractions ? {
          id: entry.attractions.id,
          name: entry.attractions.name,
        } : null,
        duration_minutes: durationMinutes,
      };
    });

    return {
      data: activeStaff,
      count: activeStaff.length,
    };
  }
}
