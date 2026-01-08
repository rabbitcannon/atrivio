import type { OrgId } from '@atrivio/shared';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type {
  CreateCheckoutDto,
  ListCheckoutsQueryDto,
  ReturnCheckoutDto,
} from './dto/checkout.dto.js';

@Injectable()
export class CheckoutsService {
  constructor(private supabase: SupabaseService) {}

  async listCheckouts(orgId: OrgId, query: ListCheckoutsQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const offset = (page - 1) * limit;

    let qb = this.supabase.adminClient
      .from('inventory_checkouts')
      .select(
        `
        *,
        item:inventory_items(id, name, sku),
        staff:staff_profiles(id),
        checked_out_by_user:profiles!inventory_checkouts_checked_out_by_fkey(id, first_name, last_name),
        returned_by_user:profiles!inventory_checkouts_returned_by_fkey(id, first_name, last_name)
      `,
        { count: 'exact' }
      )
      .eq('org_id', orgId)
      .order('checked_out_at', { ascending: false });

    if (query.itemId) {
      qb = qb.eq('item_id', query.itemId);
    }
    if (query.staffId) {
      qb = qb.eq('staff_id', query.staffId);
    }
    if (query.activeOnly) {
      qb = qb.is('returned_at', null);
    }
    if (query.overdueOnly) {
      qb = qb.is('returned_at', null).lt('due_date', new Date().toISOString().split('T')[0]);
    }

    qb = qb.range(offset, offset + limit - 1);

    const { data, count, error } = await qb;

    if (error) {
      throw new BadRequestException({
        code: 'LIST_CHECKOUTS_FAILED',
        message: error.message,
      });
    }

    return {
      checkouts: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async getCheckout(orgId: OrgId, checkoutId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('inventory_checkouts')
      .select(`
        *,
        item:inventory_items(id, name, sku),
        staff:staff_profiles(id),
        checked_out_by_user:profiles!inventory_checkouts_checked_out_by_fkey(id, first_name, last_name),
        returned_by_user:profiles!inventory_checkouts_returned_by_fkey(id, first_name, last_name)
      `)
      .eq('id', checkoutId)
      .eq('org_id', orgId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Checkout not found');
    }

    return data;
  }

  async createCheckout(orgId: OrgId, userId: string, dto: CreateCheckoutDto) {
    // Verify item exists and has sufficient quantity
    const { data: item, error: itemError } = await this.supabase.adminClient
      .from('inventory_items')
      .select('id, name, quantity, type:inventory_types(requires_checkout)')
      .eq('id', dto.itemId)
      .eq('org_id', orgId)
      .eq('is_active', true)
      .single();

    if (itemError || !item) {
      throw new NotFoundException('Inventory item not found');
    }

    const quantityToCheckout = dto.quantity || 1;
    if (item.quantity < quantityToCheckout) {
      throw new BadRequestException({
        code: 'INSUFFICIENT_QUANTITY',
        message: `Only ${item.quantity} available for checkout`,
      });
    }

    // Verify staff profile exists
    const { data: staff, error: staffError } = await this.supabase.adminClient
      .from('staff_profiles')
      .select('id')
      .eq('id', dto.staffId)
      .eq('org_id', orgId)
      .single();

    if (staffError || !staff) {
      throw new NotFoundException('Staff profile not found');
    }

    // Create checkout (trigger will handle quantity adjustment)
    const { data: checkout, error } = await this.supabase.adminClient
      .from('inventory_checkouts')
      .insert({
        org_id: orgId,
        item_id: dto.itemId,
        staff_id: dto.staffId,
        quantity: quantityToCheckout,
        checked_out_by: userId,
        due_date: dto.dueDate || null,
        condition_out: dto.conditionOut || null,
        notes: dto.notes,
      })
      .select(`
        *,
        item:inventory_items(id, name, sku),
        staff:staff_profiles(id)
      `)
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'CREATE_CHECKOUT_FAILED',
        message: error.message,
      });
    }

    return checkout;
  }

  async returnCheckout(orgId: OrgId, checkoutId: string, userId: string, dto: ReturnCheckoutDto) {
    // Get checkout
    const { data: checkout, error: checkoutError } = await this.supabase.adminClient
      .from('inventory_checkouts')
      .select('*')
      .eq('id', checkoutId)
      .eq('org_id', orgId)
      .single();

    if (checkoutError || !checkout) {
      throw new NotFoundException('Checkout not found');
    }

    if (checkout.returned_at) {
      throw new BadRequestException({
        code: 'ALREADY_RETURNED',
        message: 'This checkout has already been returned',
      });
    }

    // Update checkout with return info (trigger will handle quantity adjustment)
    const { data: updated, error } = await this.supabase.adminClient
      .from('inventory_checkouts')
      .update({
        returned_at: new Date().toISOString(),
        returned_by: userId,
        condition_in: dto.conditionIn || checkout.condition_out,
        notes: dto.notes ? `${checkout.notes || ''}\nReturn: ${dto.notes}`.trim() : checkout.notes,
      })
      .eq('id', checkoutId)
      .select(`
        *,
        item:inventory_items(id, name, sku, quantity),
        staff:staff_profiles(id)
      `)
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'RETURN_CHECKOUT_FAILED',
        message: error.message,
      });
    }

    return updated;
  }

  async getActiveCheckoutsForStaff(orgId: OrgId, staffId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('inventory_checkouts')
      .select(`
        *,
        item:inventory_items(id, name, sku, type:inventory_types(id, name, icon, color))
      `)
      .eq('org_id', orgId)
      .eq('staff_id', staffId)
      .is('returned_at', null)
      .order('checked_out_at', { ascending: false });

    if (error) {
      throw new BadRequestException({
        code: 'GET_STAFF_CHECKOUTS_FAILED',
        message: error.message,
      });
    }

    return { checkouts: data || [] };
  }

  async getOverdueCheckouts(orgId: OrgId) {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await this.supabase.adminClient
      .from('inventory_checkouts')
      .select(`
        *,
        item:inventory_items(id, name, sku),
        staff:staff_profiles(id)
      `)
      .eq('org_id', orgId)
      .is('returned_at', null)
      .lt('due_date', today)
      .order('due_date');

    if (error) {
      throw new BadRequestException({
        code: 'GET_OVERDUE_FAILED',
        message: error.message,
      });
    }

    return { checkouts: data || [] };
  }
}
