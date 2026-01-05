import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import { FeaturesService } from '../../core/features/features.service.js';
import {
  CreateQueueConfigDto,
  UpdateQueueConfigDto,
  JoinQueueDto,
  ListQueueEntriesQueryDto,
  UpdateEntryStatusDto,
  QueueStatus,
} from './dto/queue.dto.js';

@Injectable()
export class QueueService {
  constructor(
    private supabase: SupabaseService,
    private featuresService: FeaturesService,
  ) {}

  /**
   * Check if virtual_queue feature is enabled for the given org
   */
  private async checkFeatureEnabled(orgId: string): Promise<void> {
    const isEnabled = await this.featuresService.isEnabled('virtual_queue', orgId);
    if (!isEnabled) {
      throw new ForbiddenException({
        code: 'FEATURE_NOT_ENABLED',
        message: 'Virtual queue requires an enterprise plan',
        feature: 'virtual_queue',
        tier: 'enterprise',
      });
    }
  }

  // ============== Queue Config Operations ==============

  async getQueueConfig(orgId: string, attractionId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('queue_configs')
      .select('*')
      .eq('org_id', orgId)
      .eq('attraction_id', attractionId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data ? this.mapQueueConfig(data) : null;
  }

  async createQueueConfig(orgId: string, attractionId: string, dto: CreateQueueConfigDto) {
    // Check if config already exists
    const existing = await this.getQueueConfig(orgId, attractionId);
    if (existing) {
      throw new ConflictException('Queue config already exists for this attraction');
    }

    const { data, error } = await this.supabase.adminClient
      .from('queue_configs')
      .insert({
        org_id: orgId,
        attraction_id: attractionId,
        name: dto.name,
        is_active: dto.isActive ?? true,
        capacity_per_batch: dto.capacityPerBatch ?? 10,
        batch_interval_minutes: dto.batchIntervalMinutes ?? 5,
        max_wait_minutes: dto.maxWaitMinutes ?? 120,
        max_queue_size: dto.maxQueueSize ?? 500,
        allow_rejoin: dto.allowRejoin ?? false,
        require_check_in: dto.requireCheckIn ?? true,
        notification_lead_minutes: dto.notificationLeadMinutes ?? 10,
        expiry_minutes: dto.expiryMinutes ?? 15,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapQueueConfig(data);
  }

  async updateQueueConfig(orgId: string, attractionId: string, dto: UpdateQueueConfigDto) {
    const updateData: Record<string, unknown> = {};

    if (dto.name !== undefined) updateData['name'] = dto.name;
    if (dto.isActive !== undefined) updateData['is_active'] = dto.isActive;
    if (dto.isPaused !== undefined) updateData['is_paused'] = dto.isPaused;
    if (dto.capacityPerBatch !== undefined) updateData['capacity_per_batch'] = dto.capacityPerBatch;
    if (dto.batchIntervalMinutes !== undefined) updateData['batch_interval_minutes'] = dto.batchIntervalMinutes;
    if (dto.maxWaitMinutes !== undefined) updateData['max_wait_minutes'] = dto.maxWaitMinutes;
    if (dto.maxQueueSize !== undefined) updateData['max_queue_size'] = dto.maxQueueSize;
    if (dto.allowRejoin !== undefined) updateData['allow_rejoin'] = dto.allowRejoin;
    if (dto.requireCheckIn !== undefined) updateData['require_check_in'] = dto.requireCheckIn;
    if (dto.notificationLeadMinutes !== undefined) updateData['notification_lead_minutes'] = dto.notificationLeadMinutes;
    if (dto.expiryMinutes !== undefined) updateData['expiry_minutes'] = dto.expiryMinutes;

    const { data, error } = await this.supabase.adminClient
      .from('queue_configs')
      .update(updateData)
      .eq('org_id', orgId)
      .eq('attraction_id', attractionId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Queue config not found');
      }
      throw error;
    }

    return this.mapQueueConfig(data);
  }

  async pauseQueue(orgId: string, attractionId: string) {
    return this.updateQueueConfig(orgId, attractionId, { isPaused: true });
  }

  async resumeQueue(orgId: string, attractionId: string) {
    return this.updateQueueConfig(orgId, attractionId, { isPaused: false });
  }

  // ============== Queue Entry Operations ==============

  async listEntries(orgId: string, attractionId: string, query: ListQueueEntriesQueryDto) {
    // Get queue config
    const config = await this.getQueueConfig(orgId, attractionId);
    if (!config) {
      throw new NotFoundException('Queue not configured for this attraction');
    }

    let queryBuilder = this.supabase.adminClient
      .from('queue_entries')
      .select('*')
      .eq('queue_id', config.id)
      .order('position', { ascending: true });

    if (query.status) {
      queryBuilder = queryBuilder.eq('status', query.status);
    }

    if (query.search) {
      queryBuilder = queryBuilder.or(`guest_name.ilike.%${query.search}%,confirmation_code.ilike.%${query.search}%`);
    }

    if (query.limit) {
      queryBuilder = queryBuilder.limit(query.limit);
    }

    if (query.offset) {
      queryBuilder = queryBuilder.range(query.offset, query.offset + (query.limit || 50) - 1);
    }

    const { data, error } = await queryBuilder;
    if (error) throw error;

    // Get summary
    const summary = await this.getQueueSummary(orgId, attractionId);

    return {
      data: data.map(this.mapQueueEntry),
      summary,
    };
  }

  async getEntry(orgId: string, entryId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('queue_entries')
      .select('*, queue_configs!inner(*)')
      .eq('id', entryId)
      .eq('org_id', orgId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Queue entry not found');
      }
      throw error;
    }

    return this.mapQueueEntry(data);
  }

  async joinQueue(orgId: string, attractionId: string, dto: JoinQueueDto) {
    // Get queue config
    const config = await this.getQueueConfig(orgId, attractionId);
    if (!config) {
      throw new NotFoundException('Queue not configured for this attraction');
    }

    // Check if queue is open
    if (!config.isActive) {
      throw new BadRequestException('Queue is closed');
    }

    if (config.isPaused) {
      throw new BadRequestException('Queue is paused');
    }

    // Check queue size
    const { count } = await this.supabase.adminClient
      .from('queue_entries')
      .select('*', { count: 'exact', head: true })
      .eq('queue_id', config.id)
      .eq('status', 'waiting');

    if (count && count >= config.maxQueueSize) {
      throw new BadRequestException('Queue is full');
    }

    // Check for existing active entry (by phone or email)
    if (dto.guestPhone || dto.guestEmail) {
      const existingQuery = this.supabase.adminClient
        .from('queue_entries')
        .select('id, confirmation_code')
        .eq('queue_id', config.id)
        .in('status', ['waiting', 'notified', 'called']);

      if (dto.guestPhone) {
        existingQuery.eq('guest_phone', dto.guestPhone);
      } else if (dto.guestEmail) {
        existingQuery.eq('guest_email', dto.guestEmail);
      }

      const { data: existing } = await existingQuery.maybeSingle();
      if (existing) {
        throw new ConflictException(`Already in queue with code: ${existing.confirmation_code}`);
      }
    }

    // Insert entry (position and confirmation code auto-generated by triggers)
    const { data, error } = await this.supabase.adminClient
      .from('queue_entries')
      .insert({
        org_id: orgId,
        queue_id: config.id,
        ticket_id: dto.ticketId || null,
        guest_name: dto.guestName || null,
        guest_phone: dto.guestPhone || null,
        guest_email: dto.guestEmail || null,
        party_size: dto.partySize || 1,
        notes: dto.notes || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Calculate wait time
    const waitMinutes = await this.calculateWaitTime(config.id, data.position, config);
    const estimatedTime = new Date(Date.now() + waitMinutes * 60000);

    return {
      confirmationCode: data.confirmation_code,
      position: data.position,
      estimatedWaitMinutes: waitMinutes,
      estimatedTime: estimatedTime.toISOString(),
      partySize: data.party_size,
      status: data.status,
      checkStatusUrl: `https://haunt.app/q/${data.confirmation_code}`,
    };
  }

  async callEntry(orgId: string, entryId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('queue_entries')
      .update({ status: 'called' })
      .eq('id', entryId)
      .eq('org_id', orgId)
      .eq('status', 'waiting')
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Entry not found or not in waiting status');
      }
      throw error;
    }

    // TODO: Send notification via F12 Notifications module

    return {
      ...this.mapQueueEntry(data),
      notificationSent: true,
    };
  }

  async checkInEntry(orgId: string, entryId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('queue_entries')
      .update({ status: 'checked_in' })
      .eq('id', entryId)
      .eq('org_id', orgId)
      .in('status', ['called', 'notified'])
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Entry not found or not ready for check-in');
      }
      throw error;
    }

    // Calculate total wait time
    const joinedAt = new Date(data.joined_at);
    const checkedInAt = new Date(data.checked_in_at);
    const totalWaitMinutes = Math.round((checkedInAt.getTime() - joinedAt.getTime()) / 60000);

    return {
      ...this.mapQueueEntry(data),
      totalWaitMinutes,
    };
  }

  async markNoShow(orgId: string, entryId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('queue_entries')
      .update({ status: 'no_show' })
      .eq('id', entryId)
      .eq('org_id', orgId)
      .eq('status', 'called')
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Entry not found or not in called status');
      }
      throw error;
    }

    return this.mapQueueEntry(data);
  }

  async updateEntryStatus(orgId: string, entryId: string, dto: UpdateEntryStatusDto) {
    const updateData: Record<string, unknown> = {};

    if (dto.status !== undefined) {
      updateData['status'] = dto.status;
    }
    if (dto.notes !== undefined) {
      updateData['notes'] = dto.notes;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException('No fields to update');
    }

    const { data, error } = await this.supabase.adminClient
      .from('queue_entries')
      .update(updateData)
      .eq('id', entryId)
      .eq('org_id', orgId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Entry not found');
      }
      throw error;
    }

    return this.mapQueueEntry(data);
  }

  async removeEntry(orgId: string, entryId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('queue_entries')
      .update({ status: 'left' })
      .eq('id', entryId)
      .eq('org_id', orgId)
      .in('status', ['waiting', 'notified'])
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Entry not found or cannot be removed');
      }
      throw error;
    }

    // Recalculate positions
    await this.supabase.adminClient.rpc('recalculate_queue_positions', { p_queue_id: data.queue_id });

    return { message: 'Entry removed from queue', confirmationCode: data.confirmation_code };
  }

  // ============== Public Endpoints ==============

  async getPublicQueueInfo(attractionSlug: string) {
    // Get attraction by slug
    const { data: attraction, error: attrError } = await this.supabase.adminClient
      .from('attractions')
      .select('id, name, org_id')
      .eq('slug', attractionSlug)
      .single();

    if (attrError || !attraction) {
      throw new NotFoundException('Attraction not found');
    }

    // Check if virtual_queue feature is enabled for this org
    await this.checkFeatureEnabled(attraction.org_id);

    // Get queue config
    const { data: config } = await this.supabase.adminClient
      .from('queue_configs')
      .select('*')
      .eq('attraction_id', attraction.id)
      .single();

    if (!config || !config.is_active) {
      return {
        isOpen: false,
        isPaused: false,
        currentWaitMinutes: 0,
        peopleInQueue: 0,
        queueSize: 0,
        status: 'closed' as const,
        message: 'Virtual queue is not available at this time.',
      };
    }

    // Get queue status
    const { count } = await this.supabase.adminClient
      .from('queue_entries')
      .select('*', { count: 'exact', head: true })
      .eq('queue_id', config.id)
      .eq('status', 'waiting');

    const queueSize = count || 0;
    const waitMinutes = Math.ceil(queueSize / config.capacity_per_batch) * config.batch_interval_minutes;

    let status: 'accepting' | 'paused' | 'full' | 'closed' = 'accepting';
    let message = `Queue is open! Current wait ~${waitMinutes} minutes.`;

    if (config.is_paused) {
      status = 'paused';
      message = 'Queue is temporarily paused. Please check back soon.';
    } else if (queueSize >= config.max_queue_size) {
      status = 'full';
      message = 'Queue is currently full. Please check back later.';
    }

    return {
      isOpen: config.is_active,
      isPaused: config.is_paused,
      currentWaitMinutes: waitMinutes,
      peopleInQueue: queueSize,
      queueSize: config.max_queue_size,
      status,
      message,
    };
  }

  async getPublicPositionInfo(confirmationCode: string) {
    const { data, error } = await this.supabase.adminClient.rpc('get_queue_position_info', {
      p_confirmation_code: confirmationCode.toUpperCase(),
    });

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new NotFoundException('Queue entry not found');
    }

    const entry = data[0];
    return {
      confirmationCode: entry.conf_code,
      position: entry.queue_position,
      status: entry.entry_status,
      partySize: entry.guests_in_party,
      peopleAhead: entry.people_ahead,
      estimatedWaitMinutes: entry.estimated_wait_minutes,
      estimatedTime: entry.estimated_time,
      joinedAt: entry.time_joined,
      queueName: entry.queue_name,
      attractionName: entry.attraction_name,
    };
  }

  async publicLeaveQueue(confirmationCode: string) {
    const { data, error } = await this.supabase.adminClient
      .from('queue_entries')
      .update({ status: 'left' })
      .eq('confirmation_code', confirmationCode.toUpperCase())
      .in('status', ['waiting', 'notified'])
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException('Queue entry not found or cannot be removed');
      }
      throw error;
    }

    // Recalculate positions
    await this.supabase.adminClient.rpc('recalculate_queue_positions', { p_queue_id: data.queue_id });

    return { message: 'You have left the queue', confirmationCode: data.confirmation_code };
  }

  async publicJoinQueue(attractionSlug: string, dto: { guestName: string; guestPhone?: string; guestEmail?: string; partySize?: number; ticketId?: string }) {
    // Get attraction by slug
    const { data: attraction, error: attrError } = await this.supabase.adminClient
      .from('attractions')
      .select('id, name, org_id')
      .eq('slug', attractionSlug)
      .single();

    if (attrError || !attraction) {
      throw new NotFoundException('Attraction not found');
    }

    // Check if virtual_queue feature is enabled for this org
    await this.checkFeatureEnabled(attraction.org_id);

    // Use the existing joinQueue method with conditional spread for optional fields
    return this.joinQueue(attraction.org_id, attraction.id, {
      guestName: dto.guestName,
      ...(dto.guestPhone ? { guestPhone: dto.guestPhone } : {}),
      ...(dto.guestEmail ? { guestEmail: dto.guestEmail } : {}),
      ...(dto.partySize ? { partySize: dto.partySize } : {}),
      ...(dto.ticketId ? { ticketId: dto.ticketId } : {}),
    });
  }

  // ============== Statistics ==============

  async getQueueStats(orgId: string, attractionId: string, date?: string) {
    const config = await this.getQueueConfig(orgId, attractionId);
    if (!config) {
      throw new NotFoundException('Queue not configured for this attraction');
    }

    const targetDate = date || new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase.adminClient.rpc('get_queue_daily_stats', {
      p_queue_id: config.id,
      p_date: targetDate,
    });

    if (error) throw error;
    if (!data || data.length === 0) {
      return {
        today: {
          totalJoined: 0,
          totalServed: 0,
          totalExpired: 0,
          totalLeft: 0,
          totalNoShow: 0,
          avgWaitMinutes: null,
          maxWaitMinutes: null,
          currentInQueue: 0,
        },
        byHour: [],
      };
    }

    const stats = data[0];
    return {
      today: {
        totalJoined: stats.total_joined,
        totalServed: stats.total_served,
        totalExpired: stats.total_expired,
        totalLeft: stats.total_left,
        totalNoShow: stats.total_no_show,
        avgWaitMinutes: stats.avg_wait_minutes,
        maxWaitMinutes: stats.max_wait_minutes,
        currentInQueue: stats.peak_queue_size,
      },
      byHour: stats.by_hour || [],
    };
  }

  // ============== Helper Methods ==============

  private async getQueueSummary(orgId: string, attractionId: string) {
    const config = await this.getQueueConfig(orgId, attractionId);
    if (!config) {
      return { totalWaiting: 0, totalServedToday: 0, avgWaitMinutes: 0 };
    }

    // Count waiting
    const { count: waiting } = await this.supabase.adminClient
      .from('queue_entries')
      .select('*', { count: 'exact', head: true })
      .eq('queue_id', config.id)
      .eq('status', 'waiting');

    // Count served today
    const today = new Date().toISOString().split('T')[0];
    const { count: served } = await this.supabase.adminClient
      .from('queue_entries')
      .select('*', { count: 'exact', head: true })
      .eq('queue_id', config.id)
      .eq('status', 'checked_in')
      .gte('checked_in_at', `${today}T00:00:00`);

    // Calculate current avg wait
    const avgWait = Math.ceil((waiting || 0) / config.capacityPerBatch) * config.batchIntervalMinutes;

    return {
      totalWaiting: waiting || 0,
      totalServedToday: served || 0,
      avgWaitMinutes: avgWait,
    };
  }

  private async calculateWaitTime(
    queueId: string,
    position: number,
    config: { capacityPerBatch: number; batchIntervalMinutes: number },
  ) {
    // Get people ahead
    const { data } = await this.supabase.adminClient
      .from('queue_entries')
      .select('party_size')
      .eq('queue_id', queueId)
      .eq('status', 'waiting')
      .lt('position', position);

    const peopleAhead = data?.reduce((sum: number, e: { party_size?: number }) => sum + (e.party_size || 1), 0) || 0;
    return Math.ceil(peopleAhead / config.capacityPerBatch) * config.batchIntervalMinutes;
  }

  private mapQueueConfig(data: Record<string, unknown>) {
    return {
      id: data['id'] as string,
      attractionId: data['attraction_id'] as string,
      name: data['name'] as string,
      isActive: data['is_active'] as boolean,
      isPaused: data['is_paused'] as boolean,
      capacityPerBatch: data['capacity_per_batch'] as number,
      batchIntervalMinutes: data['batch_interval_minutes'] as number,
      maxWaitMinutes: data['max_wait_minutes'] as number,
      maxQueueSize: data['max_queue_size'] as number,
      allowRejoin: data['allow_rejoin'] as boolean,
      requireCheckIn: data['require_check_in'] as boolean,
      notificationLeadMinutes: data['notification_lead_minutes'] as number,
      expiryMinutes: data['expiry_minutes'] as number,
      createdAt: data['created_at'] as string,
      updatedAt: data['updated_at'] as string,
    };
  }

  private mapQueueEntry(data: Record<string, unknown>) {
    return {
      id: data['id'] as string,
      confirmationCode: data['confirmation_code'] as string,
      guestName: data['guest_name'] as string | null,
      guestPhone: data['guest_phone'] as string | null,
      guestEmail: data['guest_email'] as string | null,
      partySize: data['party_size'] as number,
      position: data['position'] as number,
      status: data['status'] as QueueStatus,
      joinedAt: data['joined_at'] as string,
      estimatedTime: data['estimated_time'] as string | null,
      notifiedAt: data['notified_at'] as string | null,
      calledAt: data['called_at'] as string | null,
      checkedInAt: data['checked_in_at'] as string | null,
      expiredAt: data['expired_at'] as string | null,
      leftAt: data['left_at'] as string | null,
      notes: data['notes'] as string | null,
    };
  }
}
