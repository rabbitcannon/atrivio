import { randomBytes } from 'node:crypto';
import type { OrgId, UserId } from '@atrivio/shared';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import { PaymentsService } from '../payments/payments.service.js';
import type {
  CartSessionDto,
  CheckoutDto,
  CreateOrderDto,
  ListOrdersQueryDto,
  RefundOrderDto,
  UpdateOrderDto,
  UpdateTicketStatusDto,
} from './dto/order.dto.js';
import { TicketingService } from './ticketing.service.js';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private supabase: SupabaseService,
    private ticketingService: TicketingService,
    private paymentsService: PaymentsService
  ) {}

  // ============== Orders ==============

  /**
   * List orders with filters
   */
  async listOrders(orgId: OrgId, query: ListOrdersQueryDto) {
    let qb = this.supabase.adminClient
      .from('orders')
      .select(`
        *,
        attraction:attractions(id, name),
        source:order_sources(id, name),
        promo:promo_codes(id, code, discount_type, discount_value),
        items:order_items(
          id,
          quantity,
          unit_price,
          total_price,
          ticket_type:ticket_types(id, name),
          time_slot:time_slots(id, date, start_time, end_time)
        )
      `)
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (query.attractionId) {
      qb = qb.eq('attraction_id', query.attractionId);
    }
    if (query.status) {
      qb = qb.eq('status', query.status);
    }
    if (query.customerEmail) {
      qb = qb.ilike('customer_email', `%${query.customerEmail}%`);
    }
    if (query.fromDate) {
      qb = qb.gte('created_at', `${query.fromDate}T00:00:00`);
    }
    if (query.toDate) {
      qb = qb.lte('created_at', `${query.toDate}T23:59:59`);
    }

    // Pagination
    const page = query.page || 1;
    const limit = Math.min(query.limit || 20, 100);
    const offset = (page - 1) * limit;

    qb = qb.range(offset, offset + limit - 1);

    const { data, error, count } = await qb;

    if (error) {
      throw new BadRequestException({
        code: 'ORDERS_LIST_FAILED',
        message: error.message,
      });
    }

    return {
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
    };
  }

  /**
   * Get a single order by ID
   */
  async getOrder(orgId: OrgId, orderId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('orders')
      .select(`
        *,
        attraction:attractions(id, name),
        source:order_sources(id, name),
        promo:promo_codes(id, code, discount_type, discount_value),
        items:order_items(
          id,
          quantity,
          unit_price,
          total_price,
          ticket_type:ticket_types(id, name, category:ticket_categories(name)),
          time_slot:time_slots(id, date, start_time, end_time)
        ),
        tickets:tickets(
          id,
          ticket_number,
          barcode,
          status,
          guest_name,
          checked_in_at,
          checked_in_by,
          ticket_type:ticket_types(id, name)
        )
      `)
      .eq('org_id', orgId)
      .eq('id', orderId)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
      });
    }

    return data;
  }

  /**
   * Get order by order number
   */
  async getOrderByNumber(orgId: OrgId, orderNumber: string) {
    const { data, error } = await this.supabase.adminClient
      .from('orders')
      .select(`
        *,
        attraction:attractions(id, name),
        items:order_items(
          id,
          quantity,
          unit_price,
          total_price,
          ticket_type:ticket_types(id, name)
        ),
        tickets:tickets(
          id,
          barcode,
          status,
          valid_from,
          valid_until
        )
      `)
      .eq('org_id', orgId)
      .eq('order_number', orderNumber)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'ORDER_NOT_FOUND',
        message: 'Order not found',
      });
    }

    return data;
  }

  /**
   * Create a new order (direct creation, typically for box office)
   */
  async createOrder(orgId: OrgId, dto: CreateOrderDto, _createdBy?: UserId) {
    // Verify attraction
    await this.verifyAttraction(orgId, dto.attractionId);

    // Validate promo code if provided
    let promoCodeId: string | null = null;
    let promoDiscount = 0;

    if (dto.promoCode) {
      const validation = await this.ticketingService.validatePromoCode(orgId, {
        code: dto.promoCode,
        customerEmail: dto.customerEmail,
        attractionId: dto.attractionId,
      });

      if (!validation.valid) {
        throw new BadRequestException({
          code: 'INVALID_PROMO_CODE',
          message: validation.message,
        });
      }

      promoCodeId = validation.promo?.id;
    }

    // Calculate totals and validate items
    let subtotal = 0;
    const orderItems: Array<{
      ticketTypeId: string;
      timeSlotId: string | undefined;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> = [];

    for (const item of dto.items) {
      const ticketType = await this.ticketingService.getTicketType(orgId, item.ticketTypeId);

      // Validate time slot if provided
      let slotPriceModifier = 0;
      if (item.timeSlotId) {
        const timeSlot = await this.ticketingService.getTimeSlot(orgId, item.timeSlotId);

        // Check capacity
        if (timeSlot.capacity && timeSlot.booked_count + item.quantity > timeSlot.capacity) {
          throw new ConflictException({
            code: 'TIME_SLOT_FULL',
            message: `Time slot ${timeSlot.start_time} is full`,
          });
        }

        slotPriceModifier = timeSlot.price_modifier || 0;
      }

      // Validate quantity limits
      if (ticketType.min_per_order && item.quantity < ticketType.min_per_order) {
        throw new BadRequestException({
          code: 'MIN_QUANTITY_NOT_MET',
          message: `Minimum ${ticketType.min_per_order} required for ${ticketType.name}`,
        });
      }

      if (ticketType.max_per_order && item.quantity > ticketType.max_per_order) {
        throw new BadRequestException({
          code: 'MAX_QUANTITY_EXCEEDED',
          message: `Maximum ${ticketType.max_per_order} allowed for ${ticketType.name}`,
        });
      }

      const unitPrice = ticketType.price + slotPriceModifier;
      const totalPrice = unitPrice * item.quantity;

      orderItems.push({
        ticketTypeId: item.ticketTypeId,
        timeSlotId: item.timeSlotId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });

      subtotal += totalPrice;
    }

    // Calculate discount
    if (promoCodeId) {
      const { data: promo } = await this.supabase.adminClient
        .from('promo_codes')
        .select('*')
        .eq('id', promoCodeId)
        .single();

      if (promo) {
        if (promo.discount_type === 'percentage') {
          promoDiscount = Math.round(subtotal * (promo.discount_value / 100));
          if (promo.max_discount && promoDiscount > promo.max_discount) {
            promoDiscount = promo.max_discount;
          }
        } else {
          promoDiscount = promo.discount_value;
        }
      }
    }

    const total = subtotal - promoDiscount;

    // Generate order number
    const orderNumber = await this.generateOrderNumber(orgId);

    // Create order
    const { data: order, error: orderError } = await this.supabase.adminClient
      .from('orders')
      .insert({
        org_id: orgId,
        attraction_id: dto.attractionId,
        source_id: dto.sourceId,
        order_number: orderNumber,
        customer_email: dto.customerEmail,
        customer_name: dto.customerName,
        customer_phone: dto.customerPhone,
        promo_code_id: promoCodeId,
        subtotal,
        discount_amount: promoDiscount,
        total,
        status: 'pending',
        notes: dto.notes,
      })
      .select()
      .single();

    if (orderError) {
      throw new BadRequestException({
        code: 'ORDER_CREATE_FAILED',
        message: orderError.message,
      });
    }

    // Create order items
    const itemsToInsert = orderItems.map((item) => ({
      order_id: order.id,
      ticket_type_id: item.ticketTypeId,
      time_slot_id: item.timeSlotId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.totalPrice,
    }));

    const { error: itemsError } = await this.supabase.adminClient
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) {
      // Rollback order
      await this.supabase.adminClient.from('orders').delete().eq('id', order.id);
      throw new BadRequestException({
        code: 'ORDER_ITEMS_CREATE_FAILED',
        message: itemsError.message,
      });
    }

    // Update time slot booked counts
    for (const item of orderItems) {
      if (item.timeSlotId) {
        await this.supabase.adminClient.rpc('increment_time_slot_count', {
          slot_id: item.timeSlotId,
          increment_by: item.quantity,
        });
      }
    }

    // Increment promo code usage
    if (promoCodeId) {
      await this.supabase.adminClient.rpc('increment_promo_code_usage', {
        promo_id: promoCodeId,
      });
    }

    return this.getOrder(orgId, order.id);
  }

  /**
   * Complete an order (mark as completed and generate tickets)
   */
  async completeOrder(orgId: OrgId, orderId: string) {
    const order = await this.getOrder(orgId, orderId);

    if (order.status !== 'pending' && order.status !== 'processing') {
      throw new BadRequestException({
        code: 'INVALID_ORDER_STATUS',
        message: 'Order cannot be completed in its current status',
      });
    }

    // Generate tickets for each order item
    const tickets: Array<Record<string, unknown>> = [];

    for (const item of order.items) {
      const ticketType = Array.isArray(item.ticket_type) ? item.ticket_type[0] : item.ticket_type;
      const timeSlot = Array.isArray(item.time_slot) ? item.time_slot[0] : item.time_slot;

      for (let i = 0; i < item.quantity; i++) {
        const barcode = this.generateBarcode();
        const ticketNumber = this.generateTicketNumber();

        tickets.push({
          org_id: orgId,
          order_id: orderId,
          order_item_id: item.id,
          ticket_type_id: ticketType?.id,
          time_slot_id: timeSlot?.id,
          ticket_number: ticketNumber,
          barcode,
          status: 'valid',
        });
      }
    }

    // Insert tickets
    const { error: ticketsError } = await this.supabase.adminClient.from('tickets').insert(tickets);

    if (ticketsError) {
      throw new BadRequestException({
        code: 'TICKETS_CREATE_FAILED',
        message: ticketsError.message,
      });
    }

    // Update order status
    const { data, error } = await this.supabase.adminClient
      .from('orders')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'ORDER_COMPLETE_FAILED',
        message: error.message,
      });
    }

    return this.getOrder(orgId, orderId);
  }

  /**
   * Update an order
   */
  async updateOrder(orgId: OrgId, orderId: string, dto: UpdateOrderDto) {
    await this.getOrder(orgId, orderId);

    const updateData: Record<string, unknown> = {};
    if (dto.status !== undefined) updateData['status'] = dto.status;
    if (dto.customerName !== undefined) updateData['customer_name'] = dto.customerName;
    if (dto.customerPhone !== undefined) updateData['customer_phone'] = dto.customerPhone;
    if (dto.notes !== undefined) updateData['notes'] = dto.notes;
    updateData['updated_at'] = new Date().toISOString();

    const { data, error } = await this.supabase.adminClient
      .from('orders')
      .update(updateData)
      .eq('org_id', orgId)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'ORDER_UPDATE_FAILED',
        message: error.message,
      });
    }

    return this.getOrder(orgId, orderId);
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orgId: OrgId, orderId: string, reason?: string) {
    const order = await this.getOrder(orgId, orderId);

    if (order.status === 'canceled' || order.status === 'refunded') {
      throw new BadRequestException({
        code: 'ORDER_ALREADY_CANCELED',
        message: 'Order is already canceled or refunded',
      });
    }

    // Void all tickets
    await this.supabase.adminClient
      .from('tickets')
      .update({ status: 'voided', updated_at: new Date().toISOString() })
      .eq('order_id', orderId);

    // Decrement time slot counts
    for (const item of order.items) {
      const timeSlot = Array.isArray(item.time_slot) ? item.time_slot[0] : item.time_slot;
      if (timeSlot?.id) {
        await this.supabase.adminClient.rpc('decrement_time_slot_count', {
          slot_id: timeSlot.id,
          decrement_by: item.quantity,
        });
      }
    }

    // Update order
    const { data, error } = await this.supabase.adminClient
      .from('orders')
      .update({
        status: 'canceled',
        notes: reason ? `${order.notes || ''}\nCanceled: ${reason}`.trim() : order.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'ORDER_CANCEL_FAILED',
        message: error.message,
      });
    }

    return this.getOrder(orgId, orderId);
  }

  /**
   * Refund an order
   */
  async refundOrder(orgId: OrgId, orderId: string, dto: RefundOrderDto) {
    const order = await this.getOrder(orgId, orderId);

    if (order.status !== 'completed') {
      throw new BadRequestException({
        code: 'INVALID_ORDER_STATUS',
        message: 'Only completed orders can be refunded',
      });
    }

    const refundAmount = dto.amount || order.total;

    // If order was paid via Stripe, process refund through Stripe
    if (order.stripe_payment_intent_id) {
      // Find the corresponding transaction
      const { data: transaction } = await this.supabase.adminClient
        .from('stripe_transactions')
        .select('id')
        .eq('stripe_payment_intent_id', order.stripe_payment_intent_id)
        .eq('type', 'charge')
        .eq('status', 'succeeded')
        .single();

      if (transaction) {
        try {
          await this.paymentsService.createRefund(orgId, {
            transaction_id: transaction.id,
            amount: refundAmount,
            reason: dto.reason || 'Order refunded',
          });
          this.logger.log(`Processed Stripe refund for order ${orderId}, amount: ${refundAmount}`);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          this.logger.error(`Failed to process Stripe refund for order ${orderId}: ${message}`);
          throw new BadRequestException({
            code: 'STRIPE_REFUND_FAILED',
            message: `Failed to process Stripe refund: ${message}`,
          });
        }
      } else {
        this.logger.warn(
          `No Stripe transaction found for order ${orderId}, proceeding with status update only`
        );
      }
    }

    // Void all tickets
    await this.supabase.adminClient
      .from('tickets')
      .update({ status: 'voided', updated_at: new Date().toISOString() })
      .eq('order_id', orderId);

    // Update order
    const { data, error } = await this.supabase.adminClient
      .from('orders')
      .update({
        status: 'refunded',
        refund_amount: refundAmount,
        refunded_at: new Date().toISOString(),
        notes: dto.reason ? `${order.notes || ''}\nRefunded: ${dto.reason}`.trim() : order.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'ORDER_REFUND_FAILED',
        message: error.message,
      });
    }

    return this.getOrder(orgId, orderId);
  }

  // ============== Tickets ==============

  /**
   * Get a ticket by ID
   */
  async getTicket(orgId: OrgId, ticketId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('tickets')
      .select(`
        *,
        order:orders(id, order_number, customer_email, customer_name),
        ticket_type:ticket_types(id, name, category:ticket_categories(name)),
        time_slot:time_slots(id, date, start_time, end_time)
      `)
      .eq('org_id', orgId)
      .eq('id', ticketId)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'TICKET_NOT_FOUND',
        message: 'Ticket not found',
      });
    }

    return data;
  }

  /**
   * Get a ticket by barcode
   */
  async getTicketByBarcode(orgId: OrgId, barcode: string) {
    const { data, error } = await this.supabase.adminClient
      .from('tickets')
      .select(`
        *,
        order:orders(id, order_number, customer_email, customer_name),
        ticket_type:ticket_types(id, name, category:ticket_categories(name)),
        time_slot:time_slots(id, date, start_time, end_time)
      `)
      .eq('org_id', orgId)
      .eq('barcode', barcode)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'TICKET_NOT_FOUND',
        message: 'Ticket not found',
      });
    }

    return data;
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(orgId: OrgId, ticketId: string, dto: UpdateTicketStatusDto) {
    const ticket = await this.getTicket(orgId, ticketId);

    // Validate status transition
    const validTransitions: Record<string, string[]> = {
      valid: ['used', 'voided', 'expired', 'transferred'],
      used: ['voided'], // Can void a used ticket for refunds
      voided: [],
      expired: [],
      transferred: ['valid', 'voided'], // Can revert or void transferred tickets
    };

    if (!validTransitions[ticket.status]?.includes(dto.status)) {
      throw new BadRequestException({
        code: 'INVALID_STATUS_TRANSITION',
        message: `Cannot change ticket status from ${ticket.status} to ${dto.status}`,
      });
    }

    const updateData: Record<string, unknown> = {
      status: dto.status,
      updated_at: new Date().toISOString(),
    };

    if (dto.status === 'used') {
      updateData['checked_in_at'] = new Date().toISOString();
    }

    const { data, error } = await this.supabase.adminClient
      .from('tickets')
      .update(updateData)
      .eq('org_id', orgId)
      .eq('id', ticketId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'TICKET_UPDATE_FAILED',
        message: error.message,
      });
    }

    return this.getTicket(orgId, ticketId);
  }

  /**
   * Validate and scan a ticket
   */
  async validateTicket(orgId: OrgId, barcode: string) {
    const ticket = await this.getTicketByBarcode(orgId, barcode);

    const now = new Date();
    const result: {
      valid: boolean;
      ticket: typeof ticket;
      error?: string;
      message?: string;
    } = {
      valid: false,
      ticket,
    };

    // Check status
    if (ticket.status !== 'valid') {
      result.error = 'INVALID_STATUS';
      result.message = `Ticket is ${ticket.status}`;
      return result;
    }

    // Check time slot validity if applicable
    const timeSlot = Array.isArray(ticket.time_slot) ? ticket.time_slot[0] : ticket.time_slot;
    if (timeSlot?.date) {
      const slotStart = new Date(`${timeSlot.date}T${timeSlot.start_time}`);
      const slotEnd = new Date(`${timeSlot.date}T${timeSlot.end_time}`);

      if (now < slotStart) {
        result.error = 'NOT_YET_VALID';
        result.message = 'Ticket is not yet valid for this time slot';
        return result;
      }

      // Allow entry up to 2 hours after slot end (grace period)
      const graceEnd = new Date(slotEnd.getTime() + 2 * 60 * 60 * 1000);
      if (now > graceEnd) {
        result.error = 'EXPIRED';
        result.message = 'Time slot has passed';
        return result;
      }
    }

    result.valid = true;
    return result;
  }

  /**
   * Scan a ticket (validate and mark as used)
   */
  async scanTicket(orgId: OrgId, barcode: string, scannedBy?: UserId) {
    const validation = await this.validateTicket(orgId, barcode);

    if (!validation.valid) {
      return validation;
    }

    // Mark as checked in
    const { error } = await this.supabase.adminClient
      .from('tickets')
      .update({
        status: 'used',
        checked_in_at: new Date().toISOString(),
        checked_in_by: scannedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validation.ticket.id);

    if (error) {
      throw new BadRequestException({
        code: 'TICKET_SCAN_FAILED',
        message: error.message,
      });
    }

    return {
      valid: true,
      ticket: { ...validation.ticket, status: 'used', checked_in_at: new Date().toISOString() },
      message: 'Ticket scanned successfully',
    };
  }

  // ============== Cart Sessions ==============

  /**
   * Create or update a cart session
   */
  async upsertCartSession(orgId: OrgId, sessionId: string | null, dto: CartSessionDto) {
    // Validate attraction
    await this.verifyAttraction(orgId, dto.attractionId);

    // Calculate cart totals
    let subtotal = 0;
    const cartItems: Array<{
      ticketTypeId: string;
      timeSlotId: string | undefined;
      quantity: number;
      unitPrice: number;
    }> = [];

    for (const item of dto.items) {
      const ticketType = await this.ticketingService.getTicketType(orgId, item.ticketTypeId);

      let slotPriceModifier = 0;
      if (item.timeSlotId) {
        const timeSlot = await this.ticketingService.getTimeSlot(orgId, item.timeSlotId);
        slotPriceModifier = timeSlot.price_modifier || 0;
      }

      const unitPrice = ticketType.price + slotPriceModifier;
      cartItems.push({
        ticketTypeId: item.ticketTypeId,
        timeSlotId: item.timeSlotId,
        quantity: item.quantity,
        unitPrice,
      });
      subtotal += unitPrice * item.quantity;
    }

    // Calculate discount if promo code provided
    let discount = 0;
    let promoCodeId: string | null = null;

    if (dto.promoCode) {
      const validation = await this.ticketingService.validatePromoCode(orgId, {
        code: dto.promoCode,
        orderSubtotal: subtotal,
        attractionId: dto.attractionId,
      });

      if (validation.valid && validation.promo) {
        promoCodeId = validation.promo.id;
        if (validation.promo.discountType === 'percentage') {
          discount = Math.round(subtotal * (validation.promo.discountValue / 100));
          if (validation.promo.maxDiscount && discount > validation.promo.maxDiscount) {
            discount = validation.promo.maxDiscount;
          }
        } else {
          discount = validation.promo.discountValue;
        }
      }
    }

    const total = subtotal - discount;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes

    if (sessionId) {
      // Update existing session
      const { data, error } = await this.supabase.adminClient
        .from('cart_sessions')
        .update({
          attraction_id: dto.attractionId,
          items: cartItems,
          promo_code_id: promoCodeId,
          subtotal,
          discount,
          total,
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('org_id', orgId)
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        throw new BadRequestException({
          code: 'CART_UPDATE_FAILED',
          message: error.message,
        });
      }

      return data;
    } else {
      // Create new session with a unique session token
      const sessionToken = this.generateSessionToken();

      const { data, error } = await this.supabase.adminClient
        .from('cart_sessions')
        .insert({
          org_id: orgId,
          attraction_id: dto.attractionId,
          session_token: sessionToken,
          items: cartItems,
          promo_code_id: promoCodeId,
          subtotal,
          discount,
          total,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) {
        throw new BadRequestException({
          code: 'CART_CREATE_FAILED',
          message: error.message,
        });
      }

      return data;
    }
  }

  /**
   * Get a cart session
   */
  async getCartSession(orgId: OrgId, sessionId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('cart_sessions')
      .select('*')
      .eq('org_id', orgId)
      .eq('id', sessionId)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'CART_NOT_FOUND',
        message: 'Cart session not found',
      });
    }

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      throw new BadRequestException({
        code: 'CART_EXPIRED',
        message: 'Cart session has expired',
      });
    }

    return data;
  }

  /**
   * Checkout a cart session (create order)
   */
  async checkout(orgId: OrgId, dto: CheckoutDto, createdBy?: UserId) {
    const cart = await this.getCartSession(orgId, dto.cartSessionId);

    // Convert cart items to order items
    const cartItems = Array.isArray(cart.items) ? cart.items : [];

    const orderDto: CreateOrderDto = {
      attractionId: cart.attraction_id,
      customerEmail: dto.customerEmail,
      items: cartItems.map(
        (item: { ticketTypeId: string; timeSlotId?: string; quantity: number }) => ({
          ticketTypeId: item.ticketTypeId,
          timeSlotId: item.timeSlotId,
          quantity: item.quantity,
        })
      ),
    };

    // Add optional fields only if they have values
    if (dto.customerName) orderDto.customerName = dto.customerName;
    if (dto.customerPhone) orderDto.customerPhone = dto.customerPhone;
    // If there's a promo code, we'd need to look it up by promo_code_id - for now skip

    const order = await this.createOrder(orgId, orderDto, createdBy);

    // Handle waiver if required
    if (dto.waiverAccepted) {
      // Fetch waiver text from attraction settings
      const { data: attraction } = await this.supabase.adminClient
        .from('attractions')
        .select('waiver_text')
        .eq('id', cart.attraction_id)
        .single();

      const waiverText =
        attraction?.waiver_text ||
        'By purchasing these tickets, I acknowledge and agree to the standard liability waiver and release of claims. ' +
          'I understand that participation involves inherent risks and I voluntarily assume all risks associated with my visit.';

      await this.supabase.adminClient.from('ticket_waivers').insert({
        org_id: orgId,
        order_id: order.id,
        customer_email: dto.customerEmail,
        customer_name: dto.customerName,
        waiver_text: waiverText,
        accepted_at: new Date().toISOString(),
        ip_address: null, // Would need to pass from request
      });
    }

    // Delete cart session
    await this.supabase.adminClient.from('cart_sessions').delete().eq('id', dto.cartSessionId);

    return order;
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

  private async generateOrderNumber(orgId: OrgId): Promise<string> {
    // Format: ORG-YYYYMMDD-XXXX
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0]?.replace(/-/g, '');

    // Get count for today
    const { count } = await this.supabase.adminClient
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .gte('created_at', `${date.toISOString().split('T')[0]}T00:00:00`);

    const sequence = String((count || 0) + 1).padStart(4, '0');

    // Get org prefix (first 3 chars of org ID)
    const prefix = orgId.substring(0, 3).toUpperCase();

    return `${prefix}-${dateStr}-${sequence}`;
  }

  private generateBarcode(): string {
    // Generate a unique 12-character alphanumeric barcode
    // Use hex encoding which is more predictable than base64
    const bytes = randomBytes(6); // 6 bytes = 12 hex chars
    return bytes.toString('hex').toUpperCase();
  }

  private generateTicketNumber(): string {
    // Generate a unique 16-character ticket number: TKT-XXXXXXXX-XXXX
    const bytes = randomBytes(8);
    const hex = bytes.toString('hex').toUpperCase();
    return `TKT-${hex.substring(0, 8)}-${hex.substring(8, 12)}`;
  }

  private generateSessionToken(): string {
    // Generate a unique session token for cart
    const bytes = randomBytes(32);
    return bytes.toString('base64').replace(/[+/=]/g, '').substring(0, 40);
  }
}
