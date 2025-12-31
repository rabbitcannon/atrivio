import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type { OrgId, UserId } from '@haunt/shared';
import type { UpdateStaffDto, TerminateStaffDto, StaffQueryDto, UpdateAssignmentsDto } from './dto/staff.dto.js';

@Injectable()
export class StaffService {
  constructor(private supabase: SupabaseService) {}

  /**
   * List staff members with filters
   */
  async findAll(orgId: OrgId, filters?: StaffQueryDto) {
    // Query staff_profiles joined with org_memberships and profiles
    let query = this.supabase.adminClient
      .from('staff_profiles')
      .select(`
        id,
        employee_id,
        status,
        employment_type,
        hire_date,
        hourly_rate,
        shirt_size,
        notes,
        org_memberships!inner (
          user_id,
          role,
          profiles!org_memberships_user_id_fkey (
            id,
            email,
            first_name,
            last_name,
            avatar_url
          )
        )
      `)
      .eq('org_id', orgId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.role) {
      query = query.eq('org_memberships.role', filters.role);
    }

    const { data: members, error } = await query;

    if (error) {
      throw new BadRequestException({
        code: 'STAFF_LIST_FAILED',
        message: error.message,
      });
    }

    if (!members || members.length === 0) {
      return {
        data: [],
        meta: {
          total: 0,
          by_status: {},
          by_role: {},
        },
      };
    }

    // Get attraction assignments using correct table and column names
    const staffIds = members.map((m: any) => m.id);
    const { data: attractions } = await this.supabase.adminClient
      .from('staff_attraction_assignments')
      .select(`
        staff_id,
        attraction_id,
        is_primary,
        zones,
        attractions (
          id,
          name
        )
      `)
      .in('staff_id', staffIds);

    // Get skills with skill_types join
    const { data: skills } = await this.supabase.adminClient
      .from('staff_skills')
      .select(`
        staff_id,
        level,
        skill_types (
          key,
          name
        )
      `)
      .in('staff_id', staffIds);

    // Get certifications with certification_types join
    const { data: certifications } = await this.supabase.adminClient
      .from('staff_certifications')
      .select(`
        staff_id,
        expires_at,
        verified_by,
        certification_types:cert_type_id (
          key,
          name
        )
      `)
      .in('staff_id', staffIds);

    // Build attraction map
    const attractionMap = new Map<string, any[]>();
    attractions?.forEach((a: any) => {
      const list = attractionMap.get(a.staff_id) || [];
      list.push({
        id: a.attraction_id,
        name: a.attractions?.name,
        is_primary: a.is_primary,
      });
      attractionMap.set(a.staff_id, list);
    });

    // Build skills map
    const skillsMap = new Map<string, any[]>();
    skills?.forEach((s: any) => {
      const list = skillsMap.get(s.staff_id) || [];
      list.push({
        skill: s.skill_types?.key || s.skill_types?.name,
        name: s.skill_types?.name,
        level: s.level,
      });
      skillsMap.set(s.staff_id, list);
    });

    // Build certifications map with status
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const certsMap = new Map<string, { valid: string[]; expiring_soon: string[]; expired: string[] }>();

    certifications?.forEach((c: any) => {
      const certs = certsMap.get(c.staff_id) || { valid: [], expiring_soon: [], expired: [] };
      const expiresAt = c.expires_at ? new Date(c.expires_at) : null;
      const certName = c.certification_types?.name || c.certification_types?.key || 'Unknown';

      if (expiresAt && expiresAt < now) {
        certs.expired.push(certName);
      } else if (expiresAt && expiresAt < thirtyDaysFromNow) {
        certs.expiring_soon.push(certName);
      } else if (c.verified_by) {
        certs.valid.push(certName);
      }

      certsMap.set(c.staff_id, certs);
    });

    // Filter by attraction if specified
    let filteredMembers = members;
    if (filters?.attraction_id) {
      filteredMembers = members.filter((m: any) => {
        const memberAttractions = attractionMap.get(m.id) || [];
        return memberAttractions.some((a: any) => a.id === filters.attraction_id);
      });
    }

    // Filter by skill if specified
    if (filters?.skill) {
      filteredMembers = filteredMembers.filter((m: any) => {
        const memberSkills = skillsMap.get(m.id) || [];
        return memberSkills.some((s: any) => s.skill === filters.skill);
      });
    }

    // Filter by expiring certifications
    if (filters?.certification_expiring_days) {
      filteredMembers = filteredMembers.filter((m: any) => {
        const memberCerts = certsMap.get(m.id);
        return memberCerts && memberCerts.expiring_soon.length > 0;
      });
    }

    // Build response with aggregated data - use org_memberships.profiles for user data
    const data = filteredMembers.map((m: any) => {
      const membership = m.org_memberships;
      const profile = membership?.profiles;
      return {
        id: m.id,
        user: {
          id: profile?.id,
          email: profile?.email,
          first_name: profile?.first_name,
          last_name: profile?.last_name,
          avatar_url: profile?.avatar_url,
        },
        employee_id: m.employee_id,
        role: membership?.role,
        status: m.status,
        employment_type: m.employment_type,
        hire_date: m.hire_date,
        attractions: attractionMap.get(m.id) || [],
        skills: skillsMap.get(m.id) || [],
        certifications: certsMap.get(m.id) || { valid: [], expiring_soon: [], expired: [] },
      };
    });

    // Build meta stats
    const statusCounts: Record<string, number> = {};
    const roleCounts: Record<string, number> = {};
    members.forEach((m: any) => {
      statusCounts[m.status] = (statusCounts[m.status] || 0) + 1;
      const role = m.org_memberships?.role;
      if (role) {
        roleCounts[role] = (roleCounts[role] || 0) + 1;
      }
    });

    return {
      data,
      meta: {
        total: members.length,
        by_status: statusCounts,
        by_role: roleCounts,
      },
    };
  }

  /**
   * Get staff member by ID
   */
  async findById(orgId: OrgId, staffId: string, requesterId?: UserId) {
    // Query staff_profiles with org_memberships and profiles
    const { data: member, error } = await this.supabase.adminClient
      .from('staff_profiles')
      .select(`
        *,
        org_memberships!inner (
          user_id,
          role,
          profiles!org_memberships_user_id_fkey (
            id,
            email,
            first_name,
            last_name,
            phone,
            avatar_url
          )
        )
      `)
      .eq('id', staffId)
      .eq('org_id', orgId)
      .single();

    if (error || !member) {
      throw new NotFoundException({
        code: 'STAFF_NOT_FOUND',
        message: 'Staff member not found',
      });
    }

    const membership = member.org_memberships as any;
    const profile = membership?.profiles;

    // Get attraction assignments with zones (zones is a UUID[] column)
    const { data: attractions } = await this.supabase.adminClient
      .from('staff_attraction_assignments')
      .select(`
        attraction_id,
        is_primary,
        zones,
        attractions (
          id,
          name
        )
      `)
      .eq('staff_id', staffId);

    // Get zone details for all zones in attractions
    const allZoneIds: string[] = [];
    attractions?.forEach((a: any) => {
      if (a.zones && Array.isArray(a.zones)) {
        allZoneIds.push(...a.zones);
      }
    });

    let zonesData: any[] = [];
    if (allZoneIds.length > 0) {
      const { data: zones } = await this.supabase.adminClient
        .from('zones')
        .select('id, name, attraction_id')
        .in('id', allZoneIds);
      zonesData = zones || [];
    }

    // Build attractions with zones
    const attractionsWithZones = attractions?.map((a: any) => ({
      id: a.attraction_id,
      name: a.attractions?.name,
      is_primary: a.is_primary,
      zones: (a.zones || []).map((zoneId: string) => {
        const zone = zonesData.find((z: any) => z.id === zoneId);
        return zone ? { id: zone.id, name: zone.name } : { id: zoneId, name: 'Unknown' };
      }),
    })) || [];

    // Get skills with skill_types and endorsers
    const { data: skills } = await this.supabase.adminClient
      .from('staff_skills')
      .select(`
        id,
        level,
        endorsed_by,
        created_at,
        skill_types (
          key,
          name
        ),
        endorser:endorsed_by (
          id,
          first_name,
          last_name
        )
      `)
      .eq('staff_id', staffId);

    // Get certifications with certification_types
    const { data: certifications } = await this.supabase.adminClient
      .from('staff_certifications')
      .select(`
        id,
        certificate_number,
        issued_at,
        expires_at,
        verified_by,
        verified_at,
        certification_types:cert_type_id (
          key,
          name
        ),
        verifier:verified_by (
          id,
          first_name,
          last_name
        )
      `)
      .eq('staff_id', staffId);

    // Get documents with document_types
    const { data: documents } = await this.supabase.adminClient
      .from('staff_documents')
      .select(`
        id,
        name,
        file_url,
        file_size,
        uploaded_by,
        created_at,
        document_types:document_type_id (
          key,
          name
        ),
        uploader:uploaded_by (
          first_name,
          last_name
        )
      `)
      .eq('staff_id', staffId);

    // Get waivers
    const { data: waivers } = await this.supabase.adminClient
      .from('staff_waivers')
      .select('waiver_type, signed_at, waiver_version')
      .eq('staff_id', staffId);

    // Get time summary from staff_time_entries
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data: timeEntries } = await this.supabase.adminClient
      .from('staff_time_entries')
      .select('clock_in, clock_out, break_minutes')
      .eq('staff_id', staffId)
      .gte('clock_in', startOfMonth.toISOString());

    let currentWeekHours = 0;
    let currentMonthHours = 0;
    timeEntries?.forEach((e: any) => {
      if (e.clock_in && e.clock_out) {
        const clockIn = new Date(e.clock_in);
        const clockOut = new Date(e.clock_out);
        const breakMinutes = e.break_minutes || 0;
        const hours = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60) - breakMinutes / 60;
        currentMonthHours += Math.max(0, hours);
        if (clockIn >= startOfWeek) {
          currentWeekHours += Math.max(0, hours);
        }
      }
    });

    // Get season total (would need season dates, simplified here)
    const seasonTotalHours = currentMonthHours * 3; // Placeholder

    return {
      id: member.id,
      user: {
        id: profile?.id,
        email: profile?.email,
        first_name: profile?.first_name,
        last_name: profile?.last_name,
        phone: profile?.phone,
        avatar_url: profile?.avatar_url,
      },
      employee_id: member.employee_id,
      role: membership?.role,
      status: member.status,
      employment_type: member.employment_type,
      hire_date: member.hire_date,
      date_of_birth: member.date_of_birth,
      shirt_size: member.shirt_size,
      hourly_rate: member.hourly_rate,
      emergency_contact: {
        name: member.emergency_contact_name,
        phone: member.emergency_contact_phone,
        relation: member.emergency_contact_relation,
      },
      attractions: attractionsWithZones,
      skills: skills?.map((s: any) => ({
        id: s.id,
        skill: s.skill_types?.key || s.skill_types?.name,
        name: s.skill_types?.name,
        level: s.level,
        endorsed_by: s.endorser ? {
          id: s.endorser.id,
          name: `${s.endorser.first_name} ${s.endorser.last_name}`,
        } : null,
        created_at: s.created_at,
      })) || [],
      certifications: certifications?.map((c: any) => ({
        id: c.id,
        type: c.certification_types?.key || c.certification_types?.name,
        name: c.certification_types?.name,
        certificate_number: c.certificate_number,
        issued_at: c.issued_at,
        expires_at: c.expires_at,
        verified: !!c.verified_by,
        verified_by: c.verifier ? {
          id: c.verifier.id,
          name: `${c.verifier.first_name} ${c.verifier.last_name}`,
        } : null,
        verified_at: c.verified_at,
      })) || [],
      documents: documents?.map((d: any) => ({
        id: d.id,
        type: d.document_types?.key || d.document_types?.name,
        name: d.name,
        file_url: d.file_url,
        file_size: d.file_size,
        uploaded_by: d.uploader ? `${d.uploader.first_name} ${d.uploader.last_name}` : null,
        created_at: d.created_at,
      })) || [],
      waivers: waivers?.map((w: any) => ({
        type: w.waiver_type,
        signed_at: w.signed_at,
        version: w.waiver_version,
      })) || [],
      time_summary: {
        current_week_hours: Math.round(currentWeekHours * 100) / 100,
        current_month_hours: Math.round(currentMonthHours * 100) / 100,
        season_total_hours: Math.round(seasonTotalHours * 100) / 100,
      },
      notes: member.notes,
      created_at: member.created_at,
    };
  }

  /**
   * Update staff member
   */
  async update(orgId: OrgId, staffId: string, dto: UpdateStaffDto) {
    // Verify staff exists
    await this.verifyStaffAccess(orgId, staffId);

    // Build update object with only provided fields
    const updateData: Record<string, any> = {};
    if (dto.employee_id !== undefined) updateData['employee_id'] = dto.employee_id;
    if (dto.status !== undefined) updateData['status'] = dto.status;
    if (dto.employment_type !== undefined) updateData['employment_type'] = dto.employment_type;
    if (dto.hourly_rate !== undefined) updateData['hourly_rate'] = dto.hourly_rate;
    if (dto.shirt_size !== undefined) updateData['shirt_size'] = dto.shirt_size;
    if (dto.notes !== undefined) updateData['notes'] = dto.notes;

    // Handle emergency contact fields (stored as separate columns)
    if (dto.emergency_contact) {
      if (dto.emergency_contact.name !== undefined) updateData['emergency_contact_name'] = dto.emergency_contact.name;
      if (dto.emergency_contact.phone !== undefined) updateData['emergency_contact_phone'] = dto.emergency_contact.phone;
      if (dto.emergency_contact.relation !== undefined) updateData['emergency_contact_relation'] = dto.emergency_contact.relation;
    }

    const { data, error } = await this.supabase.adminClient
      .from('staff_profiles')
      .update(updateData)
      .eq('id', staffId)
      .eq('org_id', orgId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'STAFF_UPDATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Terminate staff member
   */
  async terminate(orgId: OrgId, staffId: string, dto: TerminateStaffDto) {
    await this.verifyStaffAccess(orgId, staffId);

    // Build notes with termination reason if provided
    const notes = dto.reason
      ? `Termination reason: ${dto.reason}${dto.notes ? `\n${dto.notes}` : ''}`
      : dto.notes;

    const { data, error } = await this.supabase.adminClient
      .from('staff_profiles')
      .update({
        status: 'terminated',
        termination_date: dto.termination_date,
        notes: notes || undefined,
      })
      .eq('id', staffId)
      .eq('org_id', orgId)
      .select('id, status, termination_date')
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'STAFF_TERMINATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Update attraction assignments
   * Note: zones are stored as UUID[] array in staff_attraction_assignments
   */
  async updateAssignments(orgId: OrgId, staffId: string, dto: UpdateAssignmentsDto) {
    await this.verifyStaffAccess(orgId, staffId);

    // Validate exactly one primary
    const primaries = dto.assignments.filter(a => a.is_primary);
    if (primaries.length !== 1 && dto.assignments.length > 0) {
      throw new BadRequestException({
        code: 'INVALID_ASSIGNMENTS',
        message: 'Exactly one attraction must be marked as primary',
      });
    }

    // Delete existing assignments
    await this.supabase.adminClient
      .from('staff_attraction_assignments')
      .delete()
      .eq('staff_id', staffId);

    // Insert new assignments with zones as UUID array
    if (dto.assignments.length > 0) {
      const attractionInserts = dto.assignments.map(a => ({
        staff_id: staffId,
        attraction_id: a.attraction_id,
        is_primary: a.is_primary,
        zones: a.zones || [], // UUID[] array
      }));

      const { error } = await this.supabase.adminClient
        .from('staff_attraction_assignments')
        .insert(attractionInserts);

      if (error) {
        throw new BadRequestException({
          code: 'ASSIGNMENT_UPDATE_FAILED',
          message: error.message,
        });
      }
    }

    // Return updated assignments with zone details
    const { data: attractions } = await this.supabase.adminClient
      .from('staff_attraction_assignments')
      .select(`
        attraction_id,
        is_primary,
        zones,
        attractions (
          id,
          name
        )
      `)
      .eq('staff_id', staffId);

    // Get zone details for all zones
    const allZoneIds: string[] = [];
    attractions?.forEach((a: any) => {
      if (a.zones && Array.isArray(a.zones)) {
        allZoneIds.push(...a.zones);
      }
    });

    let zonesData: any[] = [];
    if (allZoneIds.length > 0) {
      const { data: zones } = await this.supabase.adminClient
        .from('zones')
        .select('id, name, attraction_id')
        .in('id', allZoneIds);
      zonesData = zones || [];
    }

    return {
      assignments: attractions?.map((a: any) => ({
        attraction_id: a.attraction_id,
        attraction_name: a.attractions?.name,
        is_primary: a.is_primary,
        zones: (a.zones || []).map((zoneId: string) => {
          const zone = zonesData.find((z: any) => z.id === zoneId);
          return zone ? { id: zone.id, name: zone.name } : { id: zoneId, name: 'Unknown' };
        }),
      })) || [],
    };
  }

  /**
   * Verify staff member exists and belongs to org
   */
  private async verifyStaffAccess(orgId: OrgId, staffId: string) {
    const { data, error } = await this.supabase.adminClient
      .from('staff_profiles')
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

  /**
   * Check if user is viewing their own profile
   * staff_profiles.id = org_memberships.id, so we join to get user_id
   */
  async isSelf(staffId: string, userId: UserId): Promise<boolean> {
    const { data } = await this.supabase.adminClient
      .from('org_memberships')
      .select('user_id')
      .eq('id', staffId)
      .single();

    return data?.user_id === userId;
  }
}
