import type { OrgId, UserId } from '@haunt/shared';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type {
  CreateShiftTemplateDto,
  GenerateFromTemplatesDto,
  UpdateShiftTemplateDto,
} from './dto/template.dto.js';

@Injectable()
export class TemplatesService {
  constructor(private supabase: SupabaseService) {}

  /**
   * List shift templates for an attraction
   */
  async listTemplates(orgId: OrgId, attractionId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('shift_templates')
      .select(`
        *,
        role:schedule_roles(id, name, color),
        attraction:attractions(id, name)
      `)
      .eq('org_id', orgId)
      .eq('attraction_id', attractionId)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      throw new BadRequestException({
        code: 'TEMPLATES_LIST_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Get a single template
   */
  async getTemplate(orgId: OrgId, templateId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('shift_templates')
      .select(`
        *,
        role:schedule_roles(id, name, color),
        attraction:attractions(id, name)
      `)
      .eq('org_id', orgId)
      .eq('id', templateId)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'TEMPLATE_NOT_FOUND',
        message: 'Shift template not found',
      });
    }

    return data;
  }

  /**
   * Create a shift template
   */
  async createTemplate(orgId: OrgId, dto: CreateShiftTemplateDto, createdBy: UserId) {
    // Verify attraction
    await this.verifyAttraction(orgId, dto.attractionId);

    // Verify role
    await this.verifyRole(orgId, dto.roleId);

    const { data, error } = await this.supabase.adminClient
      .from('shift_templates')
      .insert({
        org_id: orgId,
        attraction_id: dto.attractionId,
        name: dto.name,
        role_id: dto.roleId,
        day_of_week: dto.dayOfWeek,
        start_time: dto.startTime,
        end_time: dto.endTime,
        staff_count: dto.staffCount || 1,
        is_active: dto.isActive ?? true,
        notes: dto.notes,
        created_by: createdBy,
      })
      .select(`
        *,
        role:schedule_roles(id, name, color)
      `)
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'TEMPLATE_CREATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Update a shift template
   */
  async updateTemplate(orgId: OrgId, templateId: string, dto: UpdateShiftTemplateDto) {
    await this.getTemplate(orgId, templateId);

    if (dto.roleId) {
      await this.verifyRole(orgId, dto.roleId);
    }

    const updateData: Record<string, unknown> = {};
    if (dto.name) updateData['name'] = dto.name;
    if (dto.roleId) updateData['role_id'] = dto.roleId;
    if (dto.dayOfWeek !== undefined) updateData['day_of_week'] = dto.dayOfWeek;
    if (dto.startTime) updateData['start_time'] = dto.startTime;
    if (dto.endTime) updateData['end_time'] = dto.endTime;
    if (dto.staffCount !== undefined) updateData['staff_count'] = dto.staffCount;
    if (dto.isActive !== undefined) updateData['is_active'] = dto.isActive;
    if (dto.notes !== undefined) updateData['notes'] = dto.notes;
    updateData['updated_at'] = new Date().toISOString();

    const { data, error } = await this.supabase.adminClient
      .from('shift_templates')
      .update(updateData)
      .eq('org_id', orgId)
      .eq('id', templateId)
      .select(`
        *,
        role:schedule_roles(id, name, color)
      `)
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'TEMPLATE_UPDATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Delete a shift template (soft delete by setting inactive)
   */
  async deleteTemplate(orgId: OrgId, templateId: string) {
    const { error } = await this.supabase.adminClient
      .from('shift_templates')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('org_id', orgId)
      .eq('id', templateId);

    if (error) {
      throw new BadRequestException({
        code: 'TEMPLATE_DELETE_FAILED',
        message: error.message,
      });
    }

    return { success: true };
  }

  /**
   * Generate schedules from templates
   */
  async generateFromTemplates(
    orgId: OrgId,
    attractionId: string,
    dto: GenerateFromTemplatesDto,
    createdBy: UserId
  ) {
    // Get templates to use
    let templatesQuery = this.supabase.adminClient
      .from('shift_templates')
      .select('*')
      .eq('org_id', orgId)
      .eq('attraction_id', attractionId)
      .eq('is_active', true);

    if (dto.templateIds && dto.templateIds.length > 0) {
      templatesQuery = templatesQuery.in('id', dto.templateIds);
    }

    const { data: templates, error: templatesError } = await templatesQuery;

    if (templatesError || !templates || templates.length === 0) {
      throw new BadRequestException({
        code: 'NO_TEMPLATES_FOUND',
        message: 'No active templates found for this attraction',
      });
    }

    // Generate schedules for the date range
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const schedulesToCreate: Array<{
      org_id: string;
      attraction_id: string;
      staff_id: null;
      role_id: string;
      date: string;
      start_time: string;
      end_time: string;
      status: string;
      notes: string;
      created_by: string;
    }> = [];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const dateStr = d.toISOString().split('T')[0] as string;

      // Find templates for this day
      const dayTemplates = templates.filter((t) => t['day_of_week'] === dayOfWeek);

      for (const template of dayTemplates) {
        // Create staff_count entries for each template
        const staffCount = (template['staff_count'] as number) || 1;
        for (let i = 0; i < staffCount; i++) {
          schedulesToCreate.push({
            org_id: orgId,
            attraction_id: attractionId,
            staff_id: null, // Unassigned
            role_id: template['role_id'] as string,
            date: dateStr,
            start_time: template['start_time'] as string,
            end_time: template['end_time'] as string,
            status: dto.asDraft ? 'draft' : 'scheduled',
            notes: `Generated from template: ${template['name'] as string}`,
            created_by: createdBy,
          });
        }
      }
    }

    if (schedulesToCreate.length === 0) {
      return {
        message: 'No schedules generated (no templates match the date range)',
        createdCount: 0,
        schedules: [],
      };
    }

    const { data: createdSchedules, error: createError } = await this.supabase.adminClient
      .from('schedules')
      .insert(schedulesToCreate)
      .select(`
        *,
        role:schedule_roles(id, name, color)
      `);

    if (createError) {
      throw new BadRequestException({
        code: 'SCHEDULE_GENERATION_FAILED',
        message: createError.message,
      });
    }

    return {
      message: `Generated ${createdSchedules?.length || 0} schedules`,
      createdCount: createdSchedules?.length || 0,
      schedules: createdSchedules,
    };
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

  private async verifyRole(orgId: OrgId, roleId: string) {
    const { data } = await this.supabase.adminClient
      .from('schedule_roles')
      .select('id')
      .or(`org_id.eq.${orgId},org_id.is.null`)
      .eq('id', roleId)
      .single();

    if (!data) {
      throw new NotFoundException({
        code: 'ROLE_NOT_FOUND',
        message: 'Schedule role not found',
      });
    }
  }
}
