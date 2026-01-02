import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type { OrgId, UserId } from '@haunt/shared';
import type {
  CreateSwapRequestDto,
  ApproveSwapDto,
  RejectSwapDto,
  ListSwapRequestsQueryDto,
} from './dto/swap.dto.js';

@Injectable()
export class SwapsService {
  constructor(private supabase: SupabaseService) {}

  /**
   * List swap requests with filters
   */
  async listSwapRequests(orgId: OrgId, query: ListSwapRequestsQueryDto) {
    // If requestingUserId is provided, resolve it to staff_id first
    let staffIdFilter = query.requestingStaffId;
    if (query.requestingUserId) {
      const { data: membership } = await this.supabase.adminClient
        .from('org_memberships')
        .select('id')
        .eq('org_id', orgId)
        .eq('user_id', query.requestingUserId)
        .single();
      staffIdFilter = membership?.id;
    }

    let qb = this.supabase.adminClient
      .from('shift_swaps')
      .select(`
        *,
        schedule:schedules!shift_swaps_schedule_id_fkey(
          id, date, start_time, end_time,
          staff:staff_profiles(id, org_memberships(user_id, profiles:profiles!org_memberships_user_id_fkey(first_name, last_name))),
          role:schedule_roles(id, name, color),
          attraction:attractions(id, name)
        ),
        target_schedule:schedules!shift_swaps_target_schedule_id_fkey(
          id, date, start_time, end_time,
          staff:staff_profiles(id, org_memberships(user_id, profiles:profiles!org_memberships_user_id_fkey(first_name, last_name))),
          role:schedule_roles(id, name, color)
        ),
        requesting_staff:staff_profiles!shift_swaps_requested_by_fkey(
          id, org_memberships(user_id, profiles:profiles!org_memberships_user_id_fkey(first_name, last_name, email))
        ),
        target_staff:staff_profiles!shift_swaps_target_staff_id_fkey(
          id, org_memberships(user_id, profiles:profiles!org_memberships_user_id_fkey(first_name, last_name, email))
        )
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (query.status) {
      qb = qb.eq('status', query.status);
    }
    if (query.swapType) {
      qb = qb.eq('swap_type', query.swapType);
    }
    if (staffIdFilter) {
      qb = qb.eq('requested_by', staffIdFilter);
    }

    const { data, error } = await qb;

    if (error) {
      throw new BadRequestException({
        code: 'SWAP_LIST_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Get a single swap request
   */
  async getSwapRequest(orgId: OrgId, swapId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('shift_swaps')
      .select(`
        *,
        schedule:schedules!shift_swaps_schedule_id_fkey(
          id, date, start_time, end_time,
          staff:staff_profiles(id, org_memberships(user_id, profiles:profiles!org_memberships_user_id_fkey(first_name, last_name))),
          role:schedule_roles(id, name, color),
          attraction:attractions(id, name)
        ),
        target_schedule:schedules!shift_swaps_target_schedule_id_fkey(
          id, date, start_time, end_time,
          staff:staff_profiles(id, org_memberships(user_id, profiles:profiles!org_memberships_user_id_fkey(first_name, last_name))),
          role:schedule_roles(id, name, color)
        ),
        requesting_staff:staff_profiles!shift_swaps_requested_by_fkey(
          id, org_memberships(user_id, profiles:profiles!org_memberships_user_id_fkey(first_name, last_name, email))
        ),
        target_staff:staff_profiles!shift_swaps_target_staff_id_fkey(
          id, org_memberships(user_id, profiles:profiles!org_memberships_user_id_fkey(first_name, last_name, email))
        )
      `)
      .eq('org_id', orgId)
      .eq('id', swapId)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'SWAP_NOT_FOUND',
        message: 'Swap request not found',
      });
    }

    return data;
  }

  /**
   * Create a swap request for a schedule
   */
  async createSwapRequest(
    orgId: OrgId,
    scheduleId: string,
    dto: CreateSwapRequestDto,
    requesterId: UserId,
  ) {
    // Get the schedule and verify requester is the assigned staff
    const { data: schedule } = await this.supabase.adminClient
      .from('schedules')
      .select(`
        *,
        staff:staff_profiles(id, org_memberships(user_id))
      `)
      .eq('org_id', orgId)
      .eq('id', scheduleId)
      .single();

    if (!schedule) {
      throw new NotFoundException({
        code: 'SCHEDULE_NOT_FOUND',
        message: 'Schedule not found',
      });
    }

    // Get requester's staff_id via org_memberships
    const { data: membership } = await this.supabase.adminClient
      .from('org_memberships')
      .select('id')
      .eq('org_id', orgId)
      .eq('user_id', requesterId)
      .single();

    const requesterStaff = membership ? { id: membership.id } : null;

    if (!requesterStaff) {
      throw new ForbiddenException({
        code: 'NOT_STAFF_MEMBER',
        message: 'You are not a staff member of this organization',
      });
    }

    // For swap/drop, verify requester is assigned to the schedule
    if (dto.swapType !== 'pickup' && schedule.staff_id !== requesterStaff.id) {
      throw new ForbiddenException({
        code: 'NOT_YOUR_SCHEDULE',
        message: 'You can only request swaps/drops for your own schedules',
      });
    }

    // For pickup, verify the schedule is unassigned or a drop request exists
    if (dto.swapType === 'pickup' && schedule.staff_id !== null) {
      throw new BadRequestException({
        code: 'SCHEDULE_ALREADY_ASSIGNED',
        message: 'This schedule is already assigned to someone',
      });
    }

    // Validate target staff/schedule for swap type
    if (dto.swapType === 'swap') {
      if (!dto.targetStaffId && !dto.targetScheduleId) {
        throw new BadRequestException({
          code: 'SWAP_REQUIRES_TARGET',
          message: 'Swap requests require a target staff or schedule',
        });
      }
    }

    // Create the swap request
    const { data, error } = await this.supabase.adminClient
      .from('shift_swaps')
      .insert({
        org_id: orgId,
        schedule_id: scheduleId,
        swap_type: dto.swapType,
        requested_by: requesterStaff.id,
        target_staff_id: dto.targetStaffId || null,
        target_schedule_id: dto.targetScheduleId || null,
        status: 'pending',
        reason: dto.reason,
        created_by: requesterId,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'SWAP_CREATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Approve a swap request
   */
  async approveSwapRequest(orgId: OrgId, swapId: string, dto: ApproveSwapDto, approvedBy: UserId) {
    const swap = await this.getSwapRequest(orgId, swapId);

    if (swap.status !== 'pending') {
      throw new BadRequestException({
        code: 'SWAP_NOT_PENDING',
        message: 'Can only approve pending swap requests',
      });
    }

    // Execute the swap based on type
    if (swap.swap_type === 'drop') {
      // Remove staff from schedule
      await this.supabase.adminClient
        .from('schedules')
        .update({
          staff_id: null,
          status: 'draft',
          updated_at: new Date().toISOString(),
        })
        .eq('id', swap.schedule_id);
    } else if (swap.swap_type === 'pickup') {
      // Assign staff to schedule
      await this.supabase.adminClient
        .from('schedules')
        .update({
          staff_id: swap.requested_by,
          status: 'scheduled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', swap.schedule_id);
    } else if (swap.swap_type === 'swap') {
      // Exchange staff between two schedules
      if (swap.target_schedule_id) {
        // Get both schedules
        const { data: schedules } = await this.supabase.adminClient
          .from('schedules')
          .select('*')
          .in('id', [swap.schedule_id, swap.target_schedule_id]);

        if (schedules && schedules.length === 2) {
          const schedule1 = schedules.find((s) => s.id === swap.schedule_id);
          const schedule2 = schedules.find((s) => s.id === swap.target_schedule_id);

          // Swap the staff
          await this.supabase.adminClient
            .from('schedules')
            .update({ staff_id: schedule2?.staff_id, updated_at: new Date().toISOString() })
            .eq('id', swap.schedule_id);

          await this.supabase.adminClient
            .from('schedules')
            .update({ staff_id: schedule1?.staff_id, updated_at: new Date().toISOString() })
            .eq('id', swap.target_schedule_id);
        }
      } else if (swap.target_staff_id) {
        // Direct swap with another staff member
        await this.supabase.adminClient
          .from('schedules')
          .update({
            staff_id: swap.target_staff_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', swap.schedule_id);
      }
    }

    // Update swap status
    const { data, error } = await this.supabase.adminClient
      .from('shift_swaps')
      .update({
        status: 'approved',
        approved_by: approvedBy,
        approved_at: new Date().toISOString(),
        admin_notes: dto.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', swapId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'SWAP_APPROVE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Reject a swap request
   */
  async rejectSwapRequest(orgId: OrgId, swapId: string, dto: RejectSwapDto, rejectedBy: UserId) {
    const swap = await this.getSwapRequest(orgId, swapId);

    if (swap.status !== 'pending') {
      throw new BadRequestException({
        code: 'SWAP_NOT_PENDING',
        message: 'Can only reject pending swap requests',
      });
    }

    const { data, error } = await this.supabase.adminClient
      .from('shift_swaps')
      .update({
        status: 'rejected',
        approved_by: rejectedBy,
        approved_at: new Date().toISOString(),
        admin_notes: dto.reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', swapId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'SWAP_REJECT_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Cancel a swap request (by requester)
   */
  async cancelSwapRequest(orgId: OrgId, swapId: string, userId: UserId) {
    const swap = await this.getSwapRequest(orgId, swapId);

    // Get user's staff_id via org_memberships
    const { data: membership } = await this.supabase.adminClient
      .from('org_memberships')
      .select('id')
      .eq('org_id', orgId)
      .eq('user_id', userId)
      .single();

    const staff = membership ? { id: membership.id } : null;

    if (!staff || swap.requested_by !== staff.id) {
      throw new ForbiddenException({
        code: 'NOT_YOUR_REQUEST',
        message: 'You can only cancel your own swap requests',
      });
    }

    if (swap.status !== 'pending') {
      throw new BadRequestException({
        code: 'SWAP_NOT_PENDING',
        message: 'Can only cancel pending swap requests',
      });
    }

    const { data, error } = await this.supabase.adminClient
      .from('shift_swaps')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', swapId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'SWAP_CANCEL_FAILED',
        message: error.message,
      });
    }

    return data;
  }
}
