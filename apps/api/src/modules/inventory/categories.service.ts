import type { OrgId } from '@atrivio/shared';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(private supabase: SupabaseService) {}

  async listCategories(orgId: OrgId) {
    const { data, error } = await this.supabase.adminClient
      .from('inventory_categories')
      .select('*')
      .eq('org_id', orgId)
      .order('sort_order')
      .order('name');

    if (error) {
      throw new BadRequestException({
        code: 'LIST_CATEGORIES_FAILED',
        message: error.message,
      });
    }

    // Build hierarchical structure
    const categories = data || [];
    const categoryMap = new Map<string, any>();
    const roots: any[] = [];

    // First pass: create map
    for (const cat of categories) {
      categoryMap.set(cat.id, { ...cat, children: [] });
    }

    // Second pass: build tree
    for (const cat of categories) {
      const node = categoryMap.get(cat.id);
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        categoryMap.get(cat.parent_id).children.push(node);
      } else {
        roots.push(node);
      }
    }

    return { categories: roots, flat: categories };
  }

  async getCategory(orgId: OrgId, categoryId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('inventory_categories')
      .select(`
        *,
        parent:inventory_categories!parent_id(id, name),
        items:inventory_items(count)
      `)
      .eq('id', categoryId)
      .eq('org_id', orgId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Category not found');
    }

    return data;
  }

  async createCategory(orgId: OrgId, dto: CreateCategoryDto) {
    // Validate parent exists if provided
    if (dto.parentId) {
      const { data: parent } = await this.supabase.adminClient
        .from('inventory_categories')
        .select('id')
        .eq('id', dto.parentId)
        .eq('org_id', orgId)
        .single();

      if (!parent) {
        throw new BadRequestException({
          code: 'PARENT_NOT_FOUND',
          message: 'Parent category not found',
        });
      }
    }

    const { data, error } = await this.supabase.adminClient
      .from('inventory_categories')
      .insert({
        org_id: orgId,
        name: dto.name,
        description: dto.description,
        parent_id: dto.parentId || null,
        icon: dto.icon,
        color: dto.color,
        sort_order: dto.sortOrder ?? 0,
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'CREATE_CATEGORY_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  async updateCategory(orgId: OrgId, categoryId: string, dto: UpdateCategoryDto) {
    // Prevent setting self as parent
    if (dto.parentId === categoryId) {
      throw new BadRequestException({
        code: 'INVALID_PARENT',
        message: 'Category cannot be its own parent',
      });
    }

    // Validate parent exists if provided
    if (dto.parentId) {
      const { data: parent } = await this.supabase.adminClient
        .from('inventory_categories')
        .select('id, parent_id')
        .eq('id', dto.parentId)
        .eq('org_id', orgId)
        .single();

      if (!parent) {
        throw new BadRequestException({
          code: 'PARENT_NOT_FOUND',
          message: 'Parent category not found',
        });
      }

      // Check for circular reference
      let currentParent: { id: string; parent_id: string | null } | null = parent;
      while (currentParent?.parent_id) {
        if (currentParent.parent_id === categoryId) {
          throw new BadRequestException({
            code: 'CIRCULAR_REFERENCE',
            message: 'Cannot create circular category hierarchy',
          });
        }
        const { data: nextParent } = await this.supabase.adminClient
          .from('inventory_categories')
          .select('id, parent_id')
          .eq('id', currentParent.parent_id)
          .single();
        currentParent = nextParent as { id: string; parent_id: string | null } | null;
      }
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name !== undefined) updateData['name'] = dto.name;
    if (dto.description !== undefined) updateData['description'] = dto.description;
    if (dto.parentId !== undefined) updateData['parent_id'] = dto.parentId;
    if (dto.icon !== undefined) updateData['icon'] = dto.icon;
    if (dto.color !== undefined) updateData['color'] = dto.color;
    if (dto.sortOrder !== undefined) updateData['sort_order'] = dto.sortOrder;

    const { data, error } = await this.supabase.adminClient
      .from('inventory_categories')
      .update(updateData)
      .eq('id', categoryId)
      .eq('org_id', orgId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'UPDATE_CATEGORY_FAILED',
        message: error.message,
      });
    }

    if (!data) {
      throw new NotFoundException('Category not found');
    }

    return data;
  }

  async deleteCategory(orgId: OrgId, categoryId: string) {
    // Check for items in this category
    const { count: itemCount } = await this.supabase.adminClient
      .from('inventory_items')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId);

    if (itemCount && itemCount > 0) {
      throw new BadRequestException({
        code: 'CATEGORY_HAS_ITEMS',
        message: `Cannot delete category with ${itemCount} items assigned`,
      });
    }

    // Check for sub-categories
    const { count: childCount } = await this.supabase.adminClient
      .from('inventory_categories')
      .select('*', { count: 'exact', head: true })
      .eq('parent_id', categoryId);

    if (childCount && childCount > 0) {
      throw new BadRequestException({
        code: 'CATEGORY_HAS_CHILDREN',
        message: 'Cannot delete category with sub-categories',
      });
    }

    const { error } = await this.supabase.adminClient
      .from('inventory_categories')
      .delete()
      .eq('id', categoryId)
      .eq('org_id', orgId);

    if (error) {
      throw new BadRequestException({
        code: 'DELETE_CATEGORY_FAILED',
        message: error.message,
      });
    }

    return { success: true };
  }
}
