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
      .from('time_entries')
      .select('id')
      .eq('org_member_id', staffId)
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
      .from('time_entries')
      .insert({
        org_member_id: staffId,
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
      .from('time_entries')
      .select('id, clock_in')
      .eq('org_member_id', staffId)
      .is('clock_out', null)
      .single();

    if (!active) {
      throw new BadRequestException({
        code: 'STAFF_NOT_CLOCKED_IN',
        message: 'No active time entry to clock out',
      });
    }

    const clockOut = new Date();
    const clockIn = new Date(active.clock_in);
    const breakMinutes = dto.break_minutes || 0;
    const totalMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60) - breakMinutes;
    const totalHours = Math.round(totalMinutes / 60 * 100) / 100;

    const { data, error } = await this.supabase.adminClient
      .from('time_entries')
      .update({
        clock_out: clockOut.toISOString(),
        break_minutes: breakMinutes,
        total_hours: totalHours,
        notes: dto.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', active.id)
      .select('id, clock_in, clock_out, break_minutes, total_hours, status')
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'CLOCK_OUT_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Get time entries
   */
  async findAll(orgId: OrgId, staffId: string, filters?: TimeQueryDto) {
    await this.verifyStaffAccess(orgId, staffId);

    let query = this.supabase.adminClient
      .from('time_entries')
      .select(`
        id,
        clock_in,
        clock_out,
        break_minutes,
        total_hours,
        notes,
        status,
        approved_by,
        approved_at,
        attraction_id,
        attractions (
          id,
          name
        ),
        approver:approved_by (
          first_name,
          last_name
        )
      `)
      .eq('org_member_id', staffId)
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

    const entries = data.map((e: any) => ({
      id: e.id,
      date: e.clock_in ? new Date(e.clock_in).toISOString().split('T')[0] : null,
      clock_in: e.clock_in,
      clock_out: e.clock_out,
      break_minutes: e.break_minutes,
      total_hours: e.total_hours,
      attraction: e.attractions ? {
        id: e.attractions.id,
        name: e.attractions.name,
      } : null,
      status: e.status,
      approved_by: e.approver ? `${e.approver.first_name} ${e.approver.last_name}` : null,
      notes: e.notes,
    }));

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
      .from('time_entries')
      .select(`
        id,
        org_member_id,
        org_members!inner (
          org_id
        )
      `)
      .eq('id', entryId)
      .single();

    if (!entry || (entry.org_members as any).org_id !== orgId) {
      throw new NotFoundException({
        code: 'TIME_ENTRY_NOT_FOUND',
        message: 'Time entry not found',
      });
    }

    // Calculate total hours if both clock times provided
    let totalHours: number | undefined;
    if (dto.clock_in && dto.clock_out) {
      const clockIn = new Date(dto.clock_in);
      const clockOut = new Date(dto.clock_out);
      const breakMinutes = dto.break_minutes || 0;
      const totalMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60) - breakMinutes;
      totalHours = Math.round(totalMinutes / 60 * 100) / 100;
    }

    const { data, error } = await this.supabase.adminClient
      .from('time_entries')
      .update({
        clock_in: dto.clock_in,
        clock_out: dto.clock_out,
        break_minutes: dto.break_minutes,
        total_hours: totalHours,
        notes: dto.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', entryId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'TIME_UPDATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Approve time entry
   */
  async approve(orgId: OrgId, entryId: string, approverId: UserId) {
    // Verify entry belongs to org
    const { data: entry } = await this.supabase.adminClient
      .from('time_entries')
      .select(`
        id,
        org_member_id,
        org_members!inner (
          org_id
        )
      `)
      .eq('id', entryId)
      .single();

    if (!entry || (entry.org_members as any).org_id !== orgId) {
      throw new NotFoundException({
        code: 'TIME_ENTRY_NOT_FOUND',
        message: 'Time entry not found',
      });
    }

    const { data, error } = await this.supabase.adminClient
      .from('time_entries')
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
      .from('org_members')
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
