import type { OrgId } from '@haunt/shared';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type {
  CreatePromoCodeDto,
  ListPromoCodesQueryDto,
  UpdatePromoCodeDto,
  ValidatePromoCodeDto,
} from './dto/promo-code.dto.js';
import type {
  CreateTicketTypeDto,
  ListTicketTypesQueryDto,
  UpdateTicketTypeDto,
} from './dto/ticket-type.dto.js';
import type {
  BulkCreateTimeSlotsDto,
  CreateTimeSlotDto,
  ListTimeSlotsQueryDto,
  UpdateTimeSlotDto,
} from './dto/time-slot.dto.js';

@Injectable()
export class TicketingService {
  constructor(private supabase: SupabaseService) {}

  // ============== Ticket Categories ==============

  /**
   * List ticket categories (system defaults + org overrides)
   */
  async listCategories(orgId: OrgId) {
    const { data, error } = await this.supabase.adminClient
      .from('ticket_categories')
      .select('*')
      .or(`org_id.eq.${orgId},org_id.is.null`)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new BadRequestException({
        code: 'CATEGORIES_LIST_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  // ============== Ticket Types ==============

  /**
   * List ticket types with filters
   */
  async listTicketTypes(orgId: OrgId, query: ListTicketTypesQueryDto) {
    let qb = this.supabase.adminClient
      .from('ticket_types')
      .select(`
        *,
        category:ticket_categories(id, name, key, icon),
        attraction:attractions(id, name),
        season:seasons(id, name)
      `)
      .eq('org_id', orgId)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (query.attractionId) {
      qb = qb.eq('attraction_id', query.attractionId);
    }
    if (query.seasonId) {
      qb = qb.eq('season_id', query.seasonId);
    }
    if (query.categoryId) {
      qb = qb.eq('category_id', query.categoryId);
    }
    if (!query.includeInactive) {
      qb = qb.eq('is_active', true);
    }

    const { data, error } = await qb;

    if (error) {
      throw new BadRequestException({
        code: 'TICKET_TYPES_LIST_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Get a single ticket type by ID
   */
  async getTicketType(orgId: OrgId, ticketTypeId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('ticket_types')
      .select(`
        *,
        category:ticket_categories(id, name, key, icon),
        attraction:attractions(id, name),
        season:seasons(id, name)
      `)
      .eq('org_id', orgId)
      .eq('id', ticketTypeId)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'TICKET_TYPE_NOT_FOUND',
        message: 'Ticket type not found',
      });
    }

    return data;
  }

  /**
   * Create a new ticket type
   */
  async createTicketType(orgId: OrgId, dto: CreateTicketTypeDto) {
    // Verify attraction belongs to org
    await this.verifyAttraction(orgId, dto.attractionId);

    // Verify category if provided
    if (dto.categoryId) {
      await this.verifyCategory(orgId, dto.categoryId);
    }

    // Verify season if provided
    if (dto.seasonId) {
      await this.verifySeason(orgId, dto.seasonId);
    }

    const { data, error } = await this.supabase.adminClient
      .from('ticket_types')
      .insert({
        org_id: orgId,
        attraction_id: dto.attractionId,
        season_id: dto.seasonId || null,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        compare_price: dto.comparePrice,
        category_id: dto.categoryId,
        max_per_order: dto.maxPerOrder,
        min_per_order: dto.minPerOrder,
        capacity: dto.capacity,
        includes: dto.includes,
        restrictions: dto.restrictions,
        sort_order: dto.sortOrder ?? 0,
        available_from: dto.availableFrom,
        available_until: dto.availableUntil,
      })
      .select(`
        *,
        category:ticket_categories(id, name, key, icon),
        attraction:attractions(id, name)
      `)
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'TICKET_TYPE_CREATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Update a ticket type
   */
  async updateTicketType(orgId: OrgId, ticketTypeId: string, dto: UpdateTicketTypeDto) {
    await this.getTicketType(orgId, ticketTypeId);

    if (dto.categoryId) {
      await this.verifyCategory(orgId, dto.categoryId);
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData['name'] = dto.name;
    if (dto.description !== undefined) updateData['description'] = dto.description;
    if (dto.price !== undefined) updateData['price'] = dto.price;
    if (dto.comparePrice !== undefined) updateData['compare_price'] = dto.comparePrice;
    if (dto.categoryId !== undefined) updateData['category_id'] = dto.categoryId;
    if (dto.maxPerOrder !== undefined) updateData['max_per_order'] = dto.maxPerOrder;
    if (dto.minPerOrder !== undefined) updateData['min_per_order'] = dto.minPerOrder;
    if (dto.capacity !== undefined) updateData['capacity'] = dto.capacity;
    if (dto.includes !== undefined) updateData['includes'] = dto.includes;
    if (dto.restrictions !== undefined) updateData['restrictions'] = dto.restrictions;
    if (dto.sortOrder !== undefined) updateData['sort_order'] = dto.sortOrder;
    if (dto.isActive !== undefined) updateData['is_active'] = dto.isActive;
    if (dto.availableFrom !== undefined) updateData['available_from'] = dto.availableFrom;
    if (dto.availableUntil !== undefined) updateData['available_until'] = dto.availableUntil;
    updateData['updated_at'] = new Date().toISOString();

    const { data, error } = await this.supabase.adminClient
      .from('ticket_types')
      .update(updateData)
      .eq('org_id', orgId)
      .eq('id', ticketTypeId)
      .select(`
        *,
        category:ticket_categories(id, name, key, icon),
        attraction:attractions(id, name)
      `)
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'TICKET_TYPE_UPDATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Delete a ticket type
   */
  async deleteTicketType(orgId: OrgId, ticketTypeId: string) {
    await this.getTicketType(orgId, ticketTypeId);

    // Check if there are any order items using this ticket type
    const { data: orderItems } = await this.supabase.adminClient
      .from('order_items')
      .select('id')
      .eq('ticket_type_id', ticketTypeId)
      .limit(1);

    if (orderItems && orderItems.length > 0) {
      throw new ConflictException({
        code: 'TICKET_TYPE_IN_USE',
        message: 'Cannot delete ticket type that has been purchased. Deactivate instead.',
      });
    }

    const { error } = await this.supabase.adminClient
      .from('ticket_types')
      .delete()
      .eq('org_id', orgId)
      .eq('id', ticketTypeId);

    if (error) {
      throw new BadRequestException({
        code: 'TICKET_TYPE_DELETE_FAILED',
        message: error.message,
      });
    }

    return { success: true };
  }

  // ============== Time Slots ==============

  /**
   * List time slots with filters
   */
  async listTimeSlots(orgId: OrgId, query: ListTimeSlotsQueryDto) {
    let qb = this.supabase.adminClient
      .from('time_slots')
      .select(`
        *,
        attraction:attractions(id, name)
      `)
      .eq('org_id', orgId)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (query.attractionId) {
      qb = qb.eq('attraction_id', query.attractionId);
    }
    if (query.date) {
      qb = qb.eq('date', query.date);
    }
    if (query.fromDate) {
      qb = qb.gte('date', query.fromDate);
    }
    if (query.toDate) {
      qb = qb.lte('date', query.toDate);
    }
    if (!query.includeInactive) {
      qb = qb.neq('status', 'sold_out');
    }
    if (query.availableOnly) {
      qb = qb.or('capacity.is.null,sold_count.lt.capacity');
    }

    const { data, error } = await qb;

    if (error) {
      throw new BadRequestException({
        code: 'TIME_SLOTS_LIST_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Get a single time slot by ID
   */
  async getTimeSlot(orgId: OrgId, timeSlotId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('time_slots')
      .select(`
        *,
        attraction:attractions(id, name)
      `)
      .eq('org_id', orgId)
      .eq('id', timeSlotId)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'TIME_SLOT_NOT_FOUND',
        message: 'Time slot not found',
      });
    }

    return data;
  }

  /**
   * Create a new time slot
   */
  async createTimeSlot(orgId: OrgId, dto: CreateTimeSlotDto) {
    await this.verifyAttraction(orgId, dto.attractionId);

    const { data, error } = await this.supabase.adminClient
      .from('time_slots')
      .insert({
        org_id: orgId,
        attraction_id: dto.attractionId,
        date: dto.date,
        start_time: dto.startTime,
        end_time: dto.endTime,
        capacity: dto.capacity,
        price_modifier: dto.priceModifier ?? 0,
        notes: dto.label,
      })
      .select(`
        *,
        attraction:attractions(id, name)
      `)
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'TIME_SLOT_CREATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Bulk create time slots
   */
  async bulkCreateTimeSlots(orgId: OrgId, dto: BulkCreateTimeSlotsDto) {
    await this.verifyAttraction(orgId, dto.attractionId);

    const slots: Array<Record<string, unknown>> = [];
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    // Parse start and end times
    const [startHour, startMin] = dto.startTime.split(':').map(Number);
    const [endHour, endMin] = dto.endTime.split(':').map(Number);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();

      // Skip if not in allowed days
      if (dto.daysOfWeek && !dto.daysOfWeek.includes(dayOfWeek)) {
        continue;
      }

      const dateStr = d.toISOString().split('T')[0];

      // Generate slots for this day
      let currentHour = startHour!;
      let currentMin = startMin!;

      while (currentHour < endHour! || (currentHour === endHour && currentMin < endMin!)) {
        const slotStart = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}:00`;

        // Calculate slot end
        let slotEndMin = currentMin + dto.intervalMinutes;
        let slotEndHour = currentHour;
        while (slotEndMin >= 60) {
          slotEndMin -= 60;
          slotEndHour += 1;
        }

        // Don't create slots that extend past end time
        if (slotEndHour > endHour! || (slotEndHour === endHour && slotEndMin > endMin!)) {
          break;
        }

        const slotEnd = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}:00`;

        slots.push({
          org_id: orgId,
          attraction_id: dto.attractionId,
          date: dateStr,
          start_time: slotStart,
          end_time: slotEnd,
          capacity: dto.capacity,
        });

        // Move to next slot
        currentMin = slotEndMin;
        currentHour = slotEndHour;
      }
    }

    if (slots.length === 0) {
      throw new BadRequestException({
        code: 'NO_SLOTS_GENERATED',
        message: 'No time slots could be generated with the given parameters',
      });
    }

    const { data, error } = await this.supabase.adminClient
      .from('time_slots')
      .insert(slots)
      .select('id, date, start_time, end_time');

    if (error) {
      throw new BadRequestException({
        code: 'BULK_TIME_SLOT_CREATE_FAILED',
        message: error.message,
      });
    }

    return {
      created: data?.length || 0,
      slots: data,
    };
  }

  /**
   * Update a time slot
   */
  async updateTimeSlot(orgId: OrgId, timeSlotId: string, dto: UpdateTimeSlotDto) {
    await this.getTimeSlot(orgId, timeSlotId);

    const updateData: Record<string, unknown> = {};
    if (dto.startTime !== undefined) updateData['start_time'] = dto.startTime;
    if (dto.endTime !== undefined) updateData['end_time'] = dto.endTime;
    if (dto.capacity !== undefined) updateData['capacity'] = dto.capacity;
    if (dto.priceModifier !== undefined) updateData['price_modifier'] = dto.priceModifier;
    if (dto.label !== undefined) updateData['notes'] = dto.label;
    if (dto.isActive !== undefined) {
      updateData['status'] = dto.isActive ? 'available' : 'disabled';
    }
    updateData['updated_at'] = new Date().toISOString();

    const { data, error } = await this.supabase.adminClient
      .from('time_slots')
      .update(updateData)
      .eq('org_id', orgId)
      .eq('id', timeSlotId)
      .select(`
        *,
        attraction:attractions(id, name)
      `)
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'TIME_SLOT_UPDATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Delete a time slot
   */
  async deleteTimeSlot(orgId: OrgId, timeSlotId: string) {
    const slot = await this.getTimeSlot(orgId, timeSlotId);

    // Check if there are bookings
    if (slot.booked_count > 0) {
      throw new ConflictException({
        code: 'TIME_SLOT_HAS_BOOKINGS',
        message: 'Cannot delete time slot with existing bookings',
      });
    }

    const { error } = await this.supabase.adminClient
      .from('time_slots')
      .delete()
      .eq('org_id', orgId)
      .eq('id', timeSlotId);

    if (error) {
      throw new BadRequestException({
        code: 'TIME_SLOT_DELETE_FAILED',
        message: error.message,
      });
    }

    return { success: true };
  }

  // ============== Promo Codes ==============

  /**
   * List promo codes
   */
  async listPromoCodes(orgId: OrgId, query: ListPromoCodesQueryDto) {
    let qb = this.supabase.adminClient
      .from('promo_codes')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (!query.includeInactive) {
      qb = qb.eq('is_active', true);
    }
    if (query.currentlyValid) {
      const now = new Date().toISOString();
      qb = qb
        .or(`valid_from.is.null,valid_from.lte.${now}`)
        .or(`valid_until.is.null,valid_until.gte.${now}`);
    }

    const { data, error } = await qb;

    if (error) {
      throw new BadRequestException({
        code: 'PROMO_CODES_LIST_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Get a single promo code by ID
   */
  async getPromoCode(orgId: OrgId, promoCodeId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('promo_codes')
      .select('*')
      .eq('org_id', orgId)
      .eq('id', promoCodeId)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'PROMO_CODE_NOT_FOUND',
        message: 'Promo code not found',
      });
    }

    return data;
  }

  /**
   * Create a new promo code
   */
  async createPromoCode(orgId: OrgId, userId: string, dto: CreatePromoCodeDto) {
    // Check for duplicate code
    const { data: existing } = await this.supabase.adminClient
      .from('promo_codes')
      .select('id')
      .eq('org_id', orgId)
      .eq('code', dto.code.toUpperCase())
      .single();

    if (existing) {
      throw new ConflictException({
        code: 'PROMO_CODE_EXISTS',
        message: 'A promo code with this code already exists',
      });
    }

    const { data, error } = await this.supabase.adminClient
      .from('promo_codes')
      .insert({
        org_id: orgId,
        code: dto.code.toUpperCase(),
        name: dto.name,
        description: dto.description,
        discount_type: dto.discountType,
        discount_value: dto.discountValue,
        min_order_amount: dto.minOrderAmount,
        max_discount: dto.maxDiscount,
        usage_limit: dto.maxUses,
        per_customer_limit: dto.maxUsesPerCustomer ?? 1,
        valid_from: dto.validFrom,
        valid_until: dto.validUntil,
        applies_to: dto.applicableTicketTypes,
        attraction_id: dto.applicableAttractions?.[0],
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'PROMO_CODE_CREATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Update a promo code
   */
  async updatePromoCode(orgId: OrgId, promoCodeId: string, dto: UpdatePromoCodeDto) {
    await this.getPromoCode(orgId, promoCodeId);

    const updateData: Record<string, unknown> = {};
    if (dto.description !== undefined) updateData['description'] = dto.description;
    if (dto.discountType !== undefined) updateData['discount_type'] = dto.discountType;
    if (dto.discountValue !== undefined) updateData['discount_value'] = dto.discountValue;
    if (dto.minOrderAmount !== undefined) updateData['min_order_amount'] = dto.minOrderAmount;
    if (dto.maxDiscount !== undefined) updateData['max_discount'] = dto.maxDiscount;
    if (dto.maxUses !== undefined) updateData['usage_limit'] = dto.maxUses;
    if (dto.maxUsesPerCustomer !== undefined)
      updateData['per_customer_limit'] = dto.maxUsesPerCustomer;
    if (dto.validFrom !== undefined) updateData['valid_from'] = dto.validFrom;
    if (dto.validUntil !== undefined) updateData['valid_until'] = dto.validUntil;
    if (dto.applicableTicketTypes !== undefined)
      updateData['applies_to'] = dto.applicableTicketTypes;
    if (dto.applicableAttractions !== undefined)
      updateData['attraction_id'] = dto.applicableAttractions?.[0];
    if (dto.isActive !== undefined) updateData['is_active'] = dto.isActive;
    updateData['updated_at'] = new Date().toISOString();

    const { data, error } = await this.supabase.adminClient
      .from('promo_codes')
      .update(updateData)
      .eq('org_id', orgId)
      .eq('id', promoCodeId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'PROMO_CODE_UPDATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Delete a promo code
   */
  async deletePromoCode(orgId: OrgId, promoCodeId: string) {
    await this.getPromoCode(orgId, promoCodeId);

    // Check if it's been used
    const { data: orders } = await this.supabase.adminClient
      .from('orders')
      .select('id')
      .eq('promo_code_id', promoCodeId)
      .limit(1);

    if (orders && orders.length > 0) {
      throw new ConflictException({
        code: 'PROMO_CODE_IN_USE',
        message: 'Cannot delete promo code that has been used. Deactivate instead.',
      });
    }

    const { error } = await this.supabase.adminClient
      .from('promo_codes')
      .delete()
      .eq('org_id', orgId)
      .eq('id', promoCodeId);

    if (error) {
      throw new BadRequestException({
        code: 'PROMO_CODE_DELETE_FAILED',
        message: error.message,
      });
    }

    return { success: true };
  }

  /**
   * Validate a promo code
   */
  async validatePromoCode(orgId: OrgId, dto: ValidatePromoCodeDto) {
    const { data: promo, error } = await this.supabase.adminClient
      .from('promo_codes')
      .select('*')
      .eq('org_id', orgId)
      .eq('code', dto.code.toUpperCase())
      .eq('is_active', true)
      .single();

    if (error || !promo) {
      return {
        valid: false,
        error: 'INVALID_CODE',
        message: 'Promo code not found or inactive',
      };
    }

    const now = new Date();

    // Check validity period
    if (promo.valid_from && new Date(promo.valid_from) > now) {
      return {
        valid: false,
        error: 'NOT_YET_VALID',
        message: 'Promo code is not yet valid',
      };
    }

    if (promo.valid_until && new Date(promo.valid_until) < now) {
      return {
        valid: false,
        error: 'EXPIRED',
        message: 'Promo code has expired',
      };
    }

    // Check max uses
    if (promo.max_uses && promo.times_used >= promo.max_uses) {
      return {
        valid: false,
        error: 'MAX_USES_REACHED',
        message: 'Promo code has reached maximum uses',
      };
    }

    // Check minimum order amount
    if (promo.min_order_amount && dto.orderSubtotal && dto.orderSubtotal < promo.min_order_amount) {
      return {
        valid: false,
        error: 'MIN_ORDER_NOT_MET',
        message: `Minimum order amount is ${promo.min_order_amount / 100} currency units`,
      };
    }

    // Check applicable ticket types
    if (promo.applicable_ticket_types && dto.ticketTypeId) {
      if (!promo.applicable_ticket_types.includes(dto.ticketTypeId)) {
        return {
          valid: false,
          error: 'NOT_APPLICABLE_TICKET',
          message: 'Promo code is not valid for this ticket type',
        };
      }
    }

    // Check applicable attractions
    if (promo.applicable_attractions && dto.attractionId) {
      if (!promo.applicable_attractions.includes(dto.attractionId)) {
        return {
          valid: false,
          error: 'NOT_APPLICABLE_ATTRACTION',
          message: 'Promo code is not valid for this attraction',
        };
      }
    }

    // Check per-customer limit
    if (promo.max_uses_per_customer && dto.customerEmail) {
      const { count } = await this.supabase.adminClient
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('promo_code_id', promo.id)
        .eq('customer_email', dto.customerEmail);

      if (count && count >= promo.max_uses_per_customer) {
        return {
          valid: false,
          error: 'CUSTOMER_LIMIT_REACHED',
          message: 'You have already used this promo code the maximum number of times',
        };
      }
    }

    return {
      valid: true,
      promo: {
        id: promo.id,
        code: promo.code,
        discountType: promo.discount_type,
        discountValue: promo.discount_value,
        maxDiscount: promo.max_discount,
      },
    };
  }

  // ============== Order Sources ==============

  /**
   * List order sources (system defaults + org overrides)
   */
  async listOrderSources(orgId: OrgId) {
    const { data, error } = await this.supabase.adminClient
      .from('order_sources')
      .select('*')
      .or(`org_id.eq.${orgId},org_id.is.null`)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw new BadRequestException({
        code: 'SOURCES_LIST_FAILED',
        message: error.message,
      });
    }

    return data;
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

  private async verifyCategory(orgId: OrgId, categoryId: string) {
    const { data } = await this.supabase.adminClient
      .from('ticket_categories')
      .select('id')
      .or(`org_id.eq.${orgId},org_id.is.null`)
      .eq('id', categoryId)
      .single();

    if (!data) {
      throw new NotFoundException({
        code: 'CATEGORY_NOT_FOUND',
        message: 'Ticket category not found',
      });
    }
  }

  private async verifySeason(orgId: OrgId, seasonId: string) {
    const { data } = await this.supabase.adminClient
      .from('seasons')
      .select('id')
      .eq('org_id', orgId)
      .eq('id', seasonId)
      .single();

    if (!data) {
      throw new NotFoundException({
        code: 'SEASON_NOT_FOUND',
        message: 'Season not found',
      });
    }
  }
}
