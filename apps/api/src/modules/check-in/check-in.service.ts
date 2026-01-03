import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type { OrgId } from '@haunt/shared';
import type {
  ScanCheckInDto,
  LookupDto,
  RecordWaiverDto,
  WalkUpSaleDto,
  ListCheckInsQueryDto,
  GetStatsQueryDto,
  GetQueueQueryDto,
  CheckInMethod,
  CapacityStatus,
} from './dto/check-in.dto.js';

@Injectable()
export class CheckInService {
  constructor(private supabase: SupabaseService) {}

  // ============== Scan / Check-In ==============

  /**
   * Scan and check in a ticket by barcode
   */
  async scanCheckIn(
    orgId: OrgId,
    attractionId: string,
    userId: string,
    dto: ScanCheckInDto,
  ) {
    // 1. Find ticket by barcode
    const { data: ticket, error: ticketError } = await this.supabase.adminClient
      .from('tickets')
      .select(`
        *,
        ticket_type:ticket_types(id, name),
        time_slot:time_slots(id, start_time, end_time, date),
        order:orders(id, order_number, customer_name, customer_email)
      `)
      .eq('org_id', orgId)
      .eq('barcode', dto.barcode)
      .single();

    if (ticketError || !ticket) {
      return {
        success: false,
        error: 'TICKET_NOT_FOUND',
        message: 'No ticket found with this barcode',
      };
    }

    // 2. Validate ticket belongs to this attraction
    const { data: ticketType } = await this.supabase.adminClient
      .from('ticket_types')
      .select('attraction_id')
      .eq('id', ticket.ticket_type_id)
      .single();

    if (!ticketType || ticketType.attraction_id !== attractionId) {
      return {
        success: false,
        error: 'WRONG_ATTRACTION',
        message: 'This ticket is not valid for this attraction',
      };
    }

    // 3. Check ticket status
    if (ticket.status === 'used') {
      return {
        success: false,
        error: 'TICKET_ALREADY_USED',
        message: `Ticket was checked in at ${new Date(ticket.checked_in_at).toLocaleTimeString()}`,
        checkedInAt: ticket.checked_in_at,
      };
    }

    if (ticket.status === 'voided') {
      return {
        success: false,
        error: 'TICKET_VOIDED',
        message: 'This ticket has been voided',
      };
    }

    if (ticket.status === 'expired') {
      return {
        success: false,
        error: 'TICKET_EXPIRED',
        message: 'This ticket has expired',
      };
    }

    // 4. Check waiver requirement
    // Note: requires_waiver column doesn't exist yet - defaulting to false
    // TODO: Add requires_waiver column to ticket_types table when waiver feature is fully implemented
    const waiverRequired = false;
    let waiverSigned = false;

    if (waiverRequired) {
      const { data: waiver } = await this.supabase.adminClient
        .from('guest_waivers')
        .select('id')
        .eq('ticket_id', ticket.id)
        .single();

      waiverSigned = !!waiver;
    }

    // 5. Create check-in record (trigger will update ticket status)
    const { data: checkIn, error: checkInError } = await this.supabase.adminClient
      .from('check_ins')
      .insert({
        org_id: orgId,
        attraction_id: attractionId,
        ticket_id: ticket.id,
        time_slot_id: ticket.time_slot_id,
        station_id: dto.stationId || null,
        checked_in_by: userId,
        check_in_method: dto.method,
        guest_count: dto.guestCount || 1,
        waiver_signed: waiverSigned,
        notes: dto.notes,
      })
      .select()
      .single();

    if (checkInError) {
      throw new BadRequestException({
        code: 'CHECK_IN_FAILED',
        message: checkInError.message,
      });
    }

    // 6. Get order ticket counts
    const { count: totalTickets } = await this.supabase.adminClient
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', ticket.order_id);

    const { count: checkedInTickets } = await this.supabase.adminClient
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('order_id', ticket.order_id)
      .eq('status', 'used');

    // 7. Format time slot string
    let timeSlotStr: string | null = null;
    if (ticket.time_slot) {
      const startTime = new Date(`2000-01-01T${ticket.time_slot.start_time}`);
      const endTime = new Date(`2000-01-01T${ticket.time_slot.end_time}`);
      timeSlotStr = `${startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }

    return {
      success: true,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticket_number,
        ticketType: ticket.ticket_type?.name || 'Unknown',
        guestName: ticket.guest_name,
        timeSlot: timeSlotStr,
      },
      order: {
        orderNumber: ticket.order?.order_number || 'Unknown',
        ticketCount: totalTickets || 0,
        checkedInCount: (checkedInTickets || 0) + 1, // Include current check-in
      },
      waiverRequired,
      waiverSigned,
      checkInId: checkIn.id,
    };
  }

  // ============== Lookup ==============

  /**
   * Look up tickets by email, phone, order number, etc.
   */
  async lookup(orgId: OrgId, attractionId: string, dto: LookupDto) {
    let ordersQuery = this.supabase.adminClient
      .from('orders')
      .select(`
        id,
        order_number,
        customer_name,
        customer_email,
        tickets(
          id,
          ticket_number,
          guest_name,
          status,
          checked_in_at,
          ticket_type:ticket_types(id, name, attraction_id),
          time_slot:time_slots(id, start_time, date)
        )
      `)
      .eq('org_id', orgId);

    // Filter based on lookup type
    switch (dto.type) {
      case 'email':
        ordersQuery = ordersQuery.ilike('customer_email', `%${dto.query}%`);
        break;
      case 'phone':
        ordersQuery = ordersQuery.ilike('customer_phone', `%${dto.query}%`);
        break;
      case 'order_number':
        ordersQuery = ordersQuery.ilike('order_number', `%${dto.query}%`);
        break;
      case 'name':
        ordersQuery = ordersQuery.ilike('customer_name', `%${dto.query}%`);
        break;
      case 'ticket_number':
        // Special case: search by ticket number
        const { data: ticket } = await this.supabase.adminClient
          .from('tickets')
          .select('order_id')
          .eq('org_id', orgId)
          .ilike('ticket_number', `%${dto.query}%`)
          .single();

        if (ticket) {
          ordersQuery = ordersQuery.eq('id', ticket.order_id);
        } else {
          return { orders: [] };
        }
        break;
    }

    const { data: orders, error } = await ordersQuery.limit(10);

    if (error) {
      throw new BadRequestException({
        code: 'LOOKUP_FAILED',
        message: error.message,
      });
    }

    // Filter tickets to only show those for this attraction
    const filteredOrders = orders
      ?.map((order) => ({
        orderNumber: order.order_number,
        customerName: order.customer_name,
        tickets: order.tickets
          ?.filter((t: any) => t.ticket_type?.attraction_id === attractionId)
          .map((t: any) => ({
            id: t.id,
            ticketNumber: t.ticket_number,
            ticketType: t.ticket_type?.name || 'Unknown',
            timeSlot: t.time_slot
              ? new Date(`2000-01-01T${t.time_slot.start_time}`).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })
              : null,
            status: t.status,
            checkedIn: t.status === 'used',
          })),
      }))
      .filter((order) => order.tickets && order.tickets.length > 0);

    return { orders: filteredOrders || [] };
  }

  // ============== Waiver ==============

  /**
   * Record a waiver signature
   */
  async recordWaiver(orgId: OrgId, attractionId: string, dto: RecordWaiverDto, ipAddress?: string, userAgent?: string) {
    // Get ticket to verify ownership
    const { data: ticket } = await this.supabase.adminClient
      .from('tickets')
      .select('order_id')
      .eq('id', dto.ticketId)
      .eq('org_id', orgId)
      .single();

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const { data: waiver, error } = await this.supabase.adminClient
      .from('guest_waivers')
      .insert({
        org_id: orgId,
        attraction_id: attractionId,
        ticket_id: dto.ticketId,
        order_id: dto.orderId || ticket.order_id,
        guest_name: dto.guestName,
        guest_email: dto.guestEmail,
        guest_phone: dto.guestPhone,
        guest_dob: dto.guestDob,
        is_minor: dto.isMinor || false,
        guardian_name: dto.guardianName,
        guardian_email: dto.guardianEmail,
        guardian_phone: dto.guardianPhone,
        waiver_version: dto.waiverVersion || '1.0',
        signature_data: dto.signatureData,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'WAIVER_RECORD_FAILED',
        message: error.message,
      });
    }

    return { success: true, waiverId: waiver.id };
  }

  // ============== Capacity ==============

  /**
   * Get current capacity for an attraction
   */
  async getCapacity(orgId: OrgId, attractionId: string) {
    // Use the database function
    const { data, error } = await this.supabase.adminClient
      .rpc('get_current_capacity', { p_attraction_id: attractionId });

    if (error) {
      throw new BadRequestException({
        code: 'CAPACITY_FETCH_FAILED',
        message: error.message,
      });
    }

    const result = data?.[0] || {
      current_count: 0,
      capacity: 200,
      percentage: 0,
      estimated_wait_minutes: 0,
      status: 'normal',
    };

    // Get check-ins in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: lastHourCount } = await this.supabase.adminClient
      .from('check_ins')
      .select('*', { count: 'exact', head: true })
      .eq('attraction_id', attractionId)
      .gte('check_in_time', oneHourAgo);

    // Get time slot breakdown for today
    const today = new Date().toISOString().split('T')[0];
    const { data: slots } = await this.supabase.adminClient
      .from('time_slots')
      .select(`
        id,
        start_time,
        capacity,
        tickets:tickets(count)
      `)
      .eq('attraction_id', attractionId)
      .eq('date', today);

    const byTimeSlot = await Promise.all(
      (slots || []).map(async (slot: any) => {
        const startTime = new Date(`2000-01-01T${slot.start_time}`);
        const slotStr = startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        const { count } = await this.supabase.adminClient
          .from('check_ins')
          .select('*', { count: 'exact', head: true })
          .eq('time_slot_id', slot.id)
          .gte('check_in_time', `${today}T00:00:00`);

        return {
          slot: slotStr,
          expected: slot.capacity || 0,
          checkedIn: count || 0,
        };
      }),
    );

    return {
      currentCount: result.current_count,
      capacity: result.capacity,
      percentage: parseFloat(result.percentage),
      status: result.status as CapacityStatus,
      estimatedWaitMinutes: result.estimated_wait_minutes,
      checkedInLastHour: lastHourCount || 0,
      byTimeSlot,
    };
  }

  // ============== Stats ==============

  /**
   * Get check-in stats for a date
   */
  async getStats(orgId: OrgId, attractionId: string, query: GetStatsQueryDto) {
    const date = query.date || new Date().toISOString().split('T')[0];

    // Use database function
    const { data, error } = await this.supabase.adminClient
      .rpc('get_checkin_stats', {
        p_attraction_id: attractionId,
        p_date: date,
      });

    if (error) {
      throw new BadRequestException({
        code: 'STATS_FETCH_FAILED',
        message: error.message,
      });
    }

    const result = data?.[0] || {
      total_checked_in: 0,
      total_expected: 0,
      check_in_rate: 0,
      by_hour: [],
      by_station: [],
      by_method: [],
    };

    return {
      date,
      totalCheckedIn: result.total_checked_in,
      totalExpected: result.total_expected,
      checkInRate: parseFloat(result.check_in_rate),
      byHour: result.by_hour || [],
      byStation: result.by_station || [],
      byMethod: result.by_method || [],
      avgCheckInTimeSeconds: 12, // Placeholder - would need actual timing data
    };
  }

  // ============== Queue ==============

  /**
   * Get check-in queue (pending arrivals)
   */
  async getQueue(orgId: OrgId, attractionId: string, query: GetQueueQueryDto) {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Get tickets for today that haven't checked in yet
    let ticketsQuery = this.supabase.adminClient
      .from('tickets')
      .select(`
        id,
        guest_name,
        status,
        time_slot:time_slots(id, start_time, end_time, date)
      `)
      .eq('org_id', orgId)
      .eq('status', 'valid');

    if (query.timeSlotId) {
      ticketsQuery = ticketsQuery.eq('time_slot_id', query.timeSlotId);
    }

    const { data: tickets, error } = await ticketsQuery;

    if (error) {
      throw new BadRequestException({
        code: 'QUEUE_FETCH_FAILED',
        message: error.message,
      });
    }

    // Filter to tickets for today's slots from this attraction
    const todayTickets = (tickets || []).filter((t: any) => {
      if (!t.time_slot || t.time_slot.date !== today) return false;
      return true;
    });

    // Categorize into pending and late
    const pending: any[] = [];
    const late: any[] = [];

    for (const ticket of todayTickets as any[]) {
      const slotStart = new Date(`${ticket.time_slot.date}T${ticket.time_slot.start_time}`);
      const slotEnd = new Date(`${ticket.time_slot.date}T${ticket.time_slot.end_time}`);
      const slotStr = new Date(`2000-01-01T${ticket.time_slot.start_time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });

      if (now < slotStart) {
        // Pending - slot hasn't started yet
        const minutesUntil = Math.round((slotStart.getTime() - now.getTime()) / 60000);
        pending.push({
          ticketId: ticket.id,
          guestName: ticket.guest_name,
          timeSlot: slotStr,
          status: 'pending',
          minutesUntil,
        });
      } else if (now > slotEnd) {
        // Late - slot has ended
        const minutesLate = Math.round((now.getTime() - slotEnd.getTime()) / 60000);
        late.push({
          ticketId: ticket.id,
          guestName: ticket.guest_name,
          timeSlot: slotStr,
          status: 'late',
          minutesLate,
        });
      } else {
        // Currently in slot window - add to pending
        pending.push({
          ticketId: ticket.id,
          guestName: ticket.guest_name,
          timeSlot: slotStr,
          status: 'pending',
          minutesUntil: 0,
        });
      }
    }

    // Apply status filter
    if (query.status === 'pending') {
      return { pending, late: [] };
    } else if (query.status === 'late') {
      return { pending: [], late };
    }

    return { pending, late };
  }

  // ============== Walk-Up Sales ==============

  /**
   * Create walk-up ticket(s) and check in immediately
   */
  async walkUpSale(
    orgId: OrgId,
    attractionId: string,
    userId: string,
    dto: WalkUpSaleDto,
  ) {
    // 1. Verify ticket type exists and is available
    const { data: ticketType, error: typeError } = await this.supabase.adminClient
      .from('ticket_types')
      .select('*, attraction:attractions(id, name)')
      .eq('id', dto.ticketTypeId)
      .eq('org_id', orgId)
      .eq('is_active', true)
      .single();

    if (typeError || !ticketType) {
      throw new NotFoundException('Ticket type not found or inactive');
    }

    if (ticketType.attraction_id !== attractionId) {
      throw new BadRequestException({
        code: 'WRONG_ATTRACTION',
        message: 'Ticket type does not belong to this attraction',
      });
    }

    // 2. Create walk-up order
    const orderNumber = await this.generateOrderNumber(orgId, attractionId);
    const { data: order, error: orderError } = await this.supabase.adminClient
      .from('orders')
      .insert({
        org_id: orgId,
        attraction_id: attractionId,
        order_number: orderNumber,
        status: 'completed',
        customer_email: 'walk-up@haunt.dev', // Walk-up orders don't require email
        customer_name: dto.guestNames?.[0] || 'Walk-up Guest',
        subtotal: ticketType.price * dto.quantity,
        discount_amount: 0,
        total: ticketType.price * dto.quantity,
        completed_at: new Date().toISOString(),
        notes: dto.notes,
        metadata: { payment_method: dto.paymentMethod },
      })
      .select()
      .single();

    if (orderError) {
      throw new BadRequestException({
        code: 'ORDER_CREATE_FAILED',
        message: orderError.message,
      });
    }

    // 3. Create order item (required for tickets)
    const { data: orderItem, error: itemError } = await this.supabase.adminClient
      .from('order_items')
      .insert({
        order_id: order.id,
        ticket_type_id: dto.ticketTypeId,
        quantity: dto.quantity,
        unit_price: ticketType.price,
        total_price: ticketType.price * dto.quantity,
      })
      .select()
      .single();

    if (itemError) {
      throw new BadRequestException({
        code: 'ORDER_ITEM_CREATE_FAILED',
        message: itemError.message,
      });
    }

    // 4. Create tickets
    const tickets: any[] = [];
    for (let i = 0; i < dto.quantity; i++) {
      const ticketNumber = await this.generateTicketNumber(orgId, attractionId);
      const barcode = this.generateBarcode();

      const { data: ticket, error: ticketError } = await this.supabase.adminClient
        .from('tickets')
        .insert({
          org_id: orgId,
          order_id: order.id,
          order_item_id: orderItem.id,
          ticket_type_id: dto.ticketTypeId,
          ticket_number: ticketNumber,
          barcode,
          guest_name: dto.guestNames?.[i] || `Walk-up Guest ${i + 1}`,
          status: 'used', // Already used for walk-up
          checked_in_at: new Date().toISOString(),
          checked_in_by: userId,
        })
        .select()
        .single();

      if (ticketError) {
        throw new BadRequestException({
          code: 'TICKET_CREATE_FAILED',
          message: ticketError.message,
        });
      }

      tickets.push(ticket);

      // 5. Create check-in record
      await this.supabase.adminClient.from('check_ins').insert({
        org_id: orgId,
        attraction_id: attractionId,
        ticket_id: ticket.id,
        checked_in_by: userId,
        check_in_method: 'walk_up',
        guest_count: 1,
        waiver_signed: dto.waiverSigned || false,
        notes: dto.notes,
      });
    }

    return {
      success: true,
      order: {
        id: order.id,
        orderNumber: order.order_number,
        total: order.total,
      },
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticket_number,
        guestName: t.guest_name,
      })),
    };
  }

  // ============== List Check-Ins ==============

  /**
   * List check-ins with filters
   */
  async listCheckIns(orgId: OrgId, attractionId: string, query: ListCheckInsQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const offset = (page - 1) * limit;

    let qb = this.supabase.adminClient
      .from('check_ins')
      .select(`
        *,
        ticket:tickets(id, ticket_number, guest_name),
        station:check_in_stations(id, name),
        checked_in_by_user:profiles!check_ins_checked_in_by_fkey(id, first_name, last_name)
      `, { count: 'exact' })
      .eq('org_id', orgId)
      .eq('attraction_id', attractionId)
      .order('check_in_time', { ascending: false });

    if (query.from) {
      qb = qb.gte('check_in_time', query.from);
    }
    if (query.to) {
      qb = qb.lte('check_in_time', query.to);
    }
    if (query.stationId) {
      qb = qb.eq('station_id', query.stationId);
    }
    if (query.method) {
      qb = qb.eq('check_in_method', query.method);
    }

    qb = qb.range(offset, offset + limit - 1);

    const { data, count, error } = await qb;

    if (error) {
      throw new BadRequestException({
        code: 'LIST_CHECKINS_FAILED',
        message: error.message,
      });
    }

    return {
      checkIns: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  // ============== Helpers ==============

  private async generateOrderNumber(orgId: OrgId, attractionId: string): Promise<string> {
    // Get attraction prefix
    const { data: attraction } = await this.supabase.adminClient
      .from('attractions')
      .select('name')
      .eq('id', attractionId)
      .single();

    const prefix = attraction?.name
      ?.split(' ')
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 3) || 'WLK';

    // Get next sequence number
    const { count } = await this.supabase.adminClient
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId);

    const seq = ((count || 0) + 1).toString().padStart(8, '0');
    return `${prefix}-${seq}`;
  }

  private async generateTicketNumber(orgId: OrgId, attractionId: string): Promise<string> {
    const { data: attraction } = await this.supabase.adminClient
      .from('attractions')
      .select('name')
      .eq('id', attractionId)
      .single();

    const prefix = attraction?.name
      ?.split(' ')
      .map((w: string) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 3) || 'TKT';

    const seq = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `${prefix}-T-${seq}`;
  }

  private generateBarcode(): string {
    // Generate a unique barcode
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let barcode = '';
    for (let i = 0; i < 12; i++) {
      barcode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return barcode;
  }
}
