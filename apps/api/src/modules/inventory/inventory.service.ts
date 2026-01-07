import type { OrgId } from '@haunt/shared';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type {
  AdjustQuantityDto,
  CreateInventoryItemDto,
  CreateInventoryTypeDto,
  ListInventoryItemsQueryDto,
  ListTransactionsQueryDto,
  UpdateInventoryItemDto,
  UpdateInventoryTypeDto,
} from './dto/inventory.dto.js';

@Injectable()
export class InventoryService {
  constructor(private supabase: SupabaseService) {}

  // ============== Inventory Types ==============

  async listTypes(orgId: OrgId) {
    const { data, error } = await this.supabase.adminClient
      .from('inventory_types')
      .select('*')
      .or(`org_id.is.null,org_id.eq.${orgId}`)
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      throw new BadRequestException({
        code: 'LIST_TYPES_FAILED',
        message: error.message,
      });
    }

    return { types: data || [] };
  }

  async createType(orgId: OrgId, dto: CreateInventoryTypeDto) {
    const { data, error } = await this.supabase.adminClient
      .from('inventory_types')
      .insert({
        org_id: orgId,
        key: dto.key,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        icon: dto.icon,
        color: dto.color,
        is_consumable: dto.isConsumable ?? false,
        requires_checkout: dto.requiresCheckout ?? false,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'CREATE_TYPE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  async updateType(orgId: OrgId, typeId: string, dto: UpdateInventoryTypeDto) {
    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData['name'] = dto.name;
    if (dto.description !== undefined) updateData['description'] = dto.description;
    if (dto.category !== undefined) updateData['category'] = dto.category;
    if (dto.icon !== undefined) updateData['icon'] = dto.icon;
    if (dto.color !== undefined) updateData['color'] = dto.color;
    if (dto.isConsumable !== undefined) updateData['is_consumable'] = dto.isConsumable;
    if (dto.requiresCheckout !== undefined) updateData['requires_checkout'] = dto.requiresCheckout;
    if (dto.isActive !== undefined) updateData['is_active'] = dto.isActive;
    if (dto.sortOrder !== undefined) updateData['sort_order'] = dto.sortOrder;

    const { data, error } = await this.supabase.adminClient
      .from('inventory_types')
      .update(updateData)
      .eq('id', typeId)
      .eq('org_id', orgId) // Only allow updating org-specific types
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'UPDATE_TYPE_FAILED',
        message: error.message,
      });
    }

    if (!data) {
      throw new NotFoundException('Inventory type not found or is a system default');
    }

    return data;
  }

  async deleteType(orgId: OrgId, typeId: string) {
    // Check if type has items
    const { count } = await this.supabase.adminClient
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .eq('type_id', typeId);

    if (count && count > 0) {
      throw new BadRequestException({
        code: 'TYPE_HAS_ITEMS',
        message: 'Cannot delete type that has items assigned',
      });
    }

    const { error } = await this.supabase.adminClient
      .from('inventory_types')
      .delete()
      .eq('id', typeId)
      .eq('org_id', orgId); // Only allow deleting org-specific types

    if (error) {
      throw new BadRequestException({
        code: 'DELETE_TYPE_FAILED',
        message: error.message,
      });
    }

    return { success: true };
  }

  // ============== Inventory Items ==============

  async listItems(orgId: OrgId, query: ListInventoryItemsQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const offset = (page - 1) * limit;

    let qb = this.supabase.adminClient
      .from('inventory_items')
      .select(
        `
        *,
        type:inventory_types(id, key, name, icon, color, is_consumable, requires_checkout),
        category:inventory_categories(id, name, parent_id),
        attraction:attractions(id, name)
      `,
        { count: 'exact' }
      )
      .eq('org_id', orgId)
      .order('name');

    if (!query.includeInactive) {
      qb = qb.eq('is_active', true);
    }

    if (query.typeId) {
      qb = qb.eq('type_id', query.typeId);
    }
    if (query.categoryId) {
      qb = qb.eq('category_id', query.categoryId);
    }
    if (query.attractionId) {
      qb = qb.eq('attraction_id', query.attractionId);
    }
    if (query.condition) {
      qb = qb.eq('condition', query.condition);
    }
    if (query.lowStock) {
      qb = qb.filter('quantity', 'lte', 'min_quantity');
    }
    if (query.search) {
      qb = qb.or(`name.ilike.%${query.search}%,sku.ilike.%${query.search}%`);
    }

    qb = qb.range(offset, offset + limit - 1);

    const { data, count, error } = await qb;

    if (error) {
      throw new BadRequestException({
        code: 'LIST_ITEMS_FAILED',
        message: error.message,
      });
    }

    return {
      items: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async getItem(orgId: OrgId, itemId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('inventory_items')
      .select(`
        *,
        type:inventory_types(id, key, name, icon, color, is_consumable, requires_checkout),
        category:inventory_categories(id, name, parent_id),
        attraction:attractions(id, name)
      `)
      .eq('id', itemId)
      .eq('org_id', orgId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Inventory item not found');
    }

    return data;
  }

  async createItem(orgId: OrgId, dto: CreateInventoryItemDto) {
    const { data, error } = await this.supabase.adminClient
      .from('inventory_items')
      .insert({
        org_id: orgId,
        attraction_id: dto.attractionId || null,
        category_id: dto.categoryId || null,
        type_id: dto.typeId,
        sku: dto.sku || null,
        name: dto.name,
        description: dto.description,
        quantity: dto.quantity ?? 0,
        min_quantity: dto.minQuantity ?? 0,
        max_quantity: dto.maxQuantity || null,
        unit: dto.unit ?? 'each',
        unit_cost: dto.unitCost || null,
        location: dto.location,
        condition: dto.condition ?? 'good',
        image_url: dto.imageUrl,
        notes: dto.notes,
      })
      .select(`
        *,
        type:inventory_types(id, key, name, icon, color)
      `)
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'CREATE_ITEM_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  async updateItem(orgId: OrgId, itemId: string, dto: UpdateInventoryItemDto) {
    const updateData: Record<string, unknown> = {};
    if (dto.attractionId !== undefined) updateData['attraction_id'] = dto.attractionId || null;
    if (dto.categoryId !== undefined) updateData['category_id'] = dto.categoryId || null;
    if (dto.typeId !== undefined) updateData['type_id'] = dto.typeId;
    if (dto.sku !== undefined) updateData['sku'] = dto.sku || null;
    if (dto.name !== undefined) updateData['name'] = dto.name;
    if (dto.description !== undefined) updateData['description'] = dto.description;
    if (dto.quantity !== undefined) updateData['quantity'] = dto.quantity;
    if (dto.minQuantity !== undefined) updateData['min_quantity'] = dto.minQuantity;
    if (dto.maxQuantity !== undefined) updateData['max_quantity'] = dto.maxQuantity || null;
    if (dto.unit !== undefined) updateData['unit'] = dto.unit;
    if (dto.unitCost !== undefined) updateData['unit_cost'] = dto.unitCost || null;
    if (dto.location !== undefined) updateData['location'] = dto.location;
    if (dto.condition !== undefined) updateData['condition'] = dto.condition;
    if (dto.imageUrl !== undefined) updateData['image_url'] = dto.imageUrl;
    if (dto.notes !== undefined) updateData['notes'] = dto.notes;
    if (dto.isActive !== undefined) updateData['is_active'] = dto.isActive;

    const { data, error } = await this.supabase.adminClient
      .from('inventory_items')
      .update(updateData)
      .eq('id', itemId)
      .eq('org_id', orgId)
      .select(`
        *,
        type:inventory_types(id, key, name, icon, color)
      `)
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'UPDATE_ITEM_FAILED',
        message: error.message,
      });
    }

    if (!data) {
      throw new NotFoundException('Inventory item not found');
    }

    return data;
  }

  async deleteItem(orgId: OrgId, itemId: string) {
    // Check for active checkouts
    const { count } = await this.supabase.adminClient
      .from('inventory_checkouts')
      .select('*', { count: 'exact', head: true })
      .eq('item_id', itemId)
      .is('returned_at', null);

    if (count && count > 0) {
      throw new BadRequestException({
        code: 'ITEM_HAS_ACTIVE_CHECKOUTS',
        message: 'Cannot delete item with active checkouts',
      });
    }

    const { error } = await this.supabase.adminClient
      .from('inventory_items')
      .delete()
      .eq('id', itemId)
      .eq('org_id', orgId);

    if (error) {
      throw new BadRequestException({
        code: 'DELETE_ITEM_FAILED',
        message: error.message,
      });
    }

    return { success: true };
  }

  async adjustQuantity(orgId: OrgId, itemId: string, userId: string, dto: AdjustQuantityDto) {
    // Get current item
    const { data: item, error: itemError } = await this.supabase.adminClient
      .from('inventory_items')
      .select('id, quantity')
      .eq('id', itemId)
      .eq('org_id', orgId)
      .single();

    if (itemError || !item) {
      throw new NotFoundException('Inventory item not found');
    }

    const previousQty = item.quantity;
    const newQty = previousQty + dto.quantity;

    if (newQty < 0) {
      throw new BadRequestException({
        code: 'INSUFFICIENT_QUANTITY',
        message: 'Adjustment would result in negative quantity',
      });
    }

    // Update quantity
    const { error: updateError } = await this.supabase.adminClient
      .from('inventory_items')
      .update({ quantity: newQty })
      .eq('id', itemId);

    if (updateError) {
      throw new BadRequestException({
        code: 'ADJUST_QUANTITY_FAILED',
        message: updateError.message,
      });
    }

    // Create transaction record
    const { data: transaction, error: txError } = await this.supabase.adminClient
      .from('inventory_transactions')
      .insert({
        org_id: orgId,
        item_id: itemId,
        type: dto.type,
        quantity: dto.quantity,
        previous_qty: previousQty,
        new_qty: newQty,
        reason: dto.reason,
        reference_type: 'manual',
        performed_by: userId,
      })
      .select()
      .single();

    if (txError) {
      throw new BadRequestException({
        code: 'CREATE_TRANSACTION_FAILED',
        message: txError.message,
      });
    }

    return {
      previousQuantity: previousQty,
      newQuantity: newQty,
      transaction,
    };
  }

  // ============== Transactions ==============

  async listTransactions(orgId: OrgId, query: ListTransactionsQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 50;
    const offset = (page - 1) * limit;

    let qb = this.supabase.adminClient
      .from('inventory_transactions')
      .select(
        `
        *,
        item:inventory_items(id, name, sku),
        performed_by_user:profiles!inventory_transactions_performed_by_fkey(id, first_name, last_name)
      `,
        { count: 'exact' }
      )
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (query.itemId) {
      qb = qb.eq('item_id', query.itemId);
    }
    if (query.type) {
      qb = qb.eq('type', query.type);
    }
    if (query.from) {
      qb = qb.gte('created_at', query.from);
    }
    if (query.to) {
      qb = qb.lte('created_at', query.to);
    }

    qb = qb.range(offset, offset + limit - 1);

    const { data, count, error } = await qb;

    if (error) {
      throw new BadRequestException({
        code: 'LIST_TRANSACTIONS_FAILED',
        message: error.message,
      });
    }

    return {
      transactions: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  // ============== Summary & Alerts ==============

  async getSummary(orgId: OrgId) {
    const { data, error } = await this.supabase.adminClient.rpc('get_inventory_summary', {
      p_org_id: orgId,
    });

    if (error) {
      throw new BadRequestException({
        code: 'GET_SUMMARY_FAILED',
        message: error.message,
      });
    }

    const result = data?.[0] || {
      total_items: 0,
      total_quantity: 0,
      total_value: 0,
      low_stock_count: 0,
      checked_out_count: 0,
      by_type: [],
    };

    return {
      totalItems: result.total_items,
      totalQuantity: result.total_quantity,
      totalValue: result.total_value,
      lowStockCount: result.low_stock_count,
      checkedOutCount: result.checked_out_count,
      byType: result.by_type || [],
    };
  }

  async getLowStockItems(orgId: OrgId) {
    const { data, error } = await this.supabase.adminClient.rpc('get_low_stock_items', {
      p_org_id: orgId,
    });

    if (error) {
      throw new BadRequestException({
        code: 'GET_LOW_STOCK_FAILED',
        message: error.message,
      });
    }

    return { items: data || [] };
  }
}
