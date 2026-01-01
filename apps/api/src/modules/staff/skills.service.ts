import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type { OrgId, UserId } from '@haunt/shared';
import type { AddSkillDto } from './dto/skills.dto.js';

@Injectable()
export class SkillsService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Get staff skills
   */
  async findAll(orgId: OrgId, staffId: string) {
    await this.verifyStaffAccess(orgId, staffId);

    const { data, error } = await this.supabase.adminClient
      .from('staff_skills')
      .select(`
        id,
        skill,
        level,
        notes,
        endorsed_by,
        created_at,
        endorser:endorsed_by (
          id,
          first_name,
          last_name
        )
      `)
      .eq('org_member_id', staffId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new BadRequestException({
        code: 'SKILLS_LIST_FAILED',
        message: error.message,
      });
    }

    return {
      skills: data.map((s: any) => ({
        id: s.id,
        skill: s.skill,
        level: s.level,
        notes: s.notes,
        endorsed_by: s.endorser ? {
          id: s.endorser.id,
          name: `${s.endorser.first_name} ${s.endorser.last_name}`,
        } : null,
        created_at: s.created_at,
      })),
    };
  }

  /**
   * Add or update skill
   */
  async add(orgId: OrgId, staffId: string, dto: AddSkillDto, endorserId: UserId) {
    await this.verifyStaffAccess(orgId, staffId);

    // Check if skill already exists
    const { data: existing } = await this.supabase.adminClient
      .from('staff_skills')
      .select('id')
      .eq('org_member_id', staffId)
      .eq('skill', dto.skill)
      .single();

    if (existing) {
      // Update existing skill
      const { data, error } = await this.supabase.adminClient
        .from('staff_skills')
        .update({
          level: dto.level,
          notes: dto.notes,
          endorsed_by: endorserId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select(`
          id,
          skill,
          level,
          endorsed_by,
          endorser:endorsed_by (
            id,
            first_name,
            last_name
          )
        `)
        .single();

      if (error) {
        throw new BadRequestException({
          code: 'SKILL_UPDATE_FAILED',
          message: error.message,
        });
      }

      const endorser = data.endorser as unknown as { id: string; first_name: string; last_name: string } | null;
      return {
        id: data.id,
        skill: data.skill,
        level: data.level,
        endorsed_by: endorser ? {
          id: endorser.id,
          name: `${endorser.first_name} ${endorser.last_name}`,
        } : null,
      };
    }

    // Create new skill
    const { data, error } = await this.supabase.adminClient
      .from('staff_skills')
      .insert({
        org_member_id: staffId,
        skill: dto.skill,
        level: dto.level,
        notes: dto.notes,
        endorsed_by: endorserId,
      })
      .select(`
        id,
        skill,
        level,
        endorsed_by,
        endorser:endorsed_by (
          id,
          first_name,
          last_name
        )
      `)
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'SKILL_CREATE_FAILED',
        message: error.message,
      });
    }

    const endorser = data.endorser as unknown as { id: string; first_name: string; last_name: string } | null;
    return {
      id: data.id,
      skill: data.skill,
      level: data.level,
      endorsed_by: endorser ? {
        id: endorser.id,
        name: `${endorser.first_name} ${endorser.last_name}`,
      } : null,
    };
  }

  /**
   * Delete skill
   */
  async delete(orgId: OrgId, staffId: string, skillId: string) {
    await this.verifyStaffAccess(orgId, staffId);

    const { error } = await this.supabase.adminClient
      .from('staff_skills')
      .delete()
      .eq('id', skillId)
      .eq('org_member_id', staffId);

    if (error) {
      throw new BadRequestException({
        code: 'SKILL_DELETE_FAILED',
        message: error.message,
      });
    }

    return { message: 'Skill removed' };
  }

  private async verifyStaffAccess(orgId: OrgId, staffId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('org_memberships')
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
