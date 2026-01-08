import type { OrgId } from '@atrivio/shared';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import { StorefrontsService } from '../storefronts/storefronts.service.js';
import type { CreateAttractionDto, UpdateAttractionDto } from './dto/attractions.dto.js';

export type AttractionId = string;

@Injectable()
export class AttractionsService {
  private readonly logger = new Logger(AttractionsService.name);

  constructor(
    private supabase: SupabaseService,
    private storefrontsService: StorefrontsService
  ) {}

  /**
   * Create a new attraction
   */
  async create(orgId: OrgId, dto: CreateAttractionDto) {
    // Check if slug is taken within org
    const { data: existing } = await this.supabase.adminClient
      .from('attractions')
      .select('id')
      .eq('org_id', orgId)
      .eq('slug', dto.slug)
      .single();

    if (existing) {
      throw new ConflictException({
        code: 'ATTRACTION_SLUG_TAKEN',
        message: 'This attraction slug is already used in this organization',
      });
    }

    const { data, error } = await this.supabase.adminClient
      .from('attractions')
      .insert({
        org_id: orgId,
        name: dto.name,
        slug: dto.slug,
        type_id: dto.type_id,
        description: dto.description,
        address_line1: dto.address?.line1,
        address_line2: dto.address?.line2,
        city: dto.address?.city,
        state: dto.address?.state,
        postal_code: dto.address?.postal_code,
        country: dto.address?.country || 'US',
        capacity: dto.capacity,
        min_age: dto.min_age,
        intensity_level: dto.intensity_level,
        duration_minutes: dto.duration_minutes,
        status: 'draft',
        settings: {},
      })
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'ATTRACTION_CREATE_FAILED',
        message: error.message,
      });
    }

    // Auto-create subdomain for the new attraction
    try {
      await this.storefrontsService.createSubdomain(orgId, data.id);
      this.logger.log(`Created subdomain for attraction ${data.id}: ${data.slug}`);
    } catch (subdomainError) {
      // Log but don't fail attraction creation if subdomain creation fails
      this.logger.warn(`Failed to create subdomain for attraction ${data.id}:`, subdomainError);
    }

    return data;
  }

  /**
   * List attractions for an organization
   */
  async findAll(orgId: OrgId, filters?: { status?: string; type?: string }) {
    let query = this.supabase.adminClient
      .from('attractions')
      .select(
        `
        id,
        name,
        slug,
        type_id,
        logo_url,
        cover_image_url,
        status,
        intensity_level,
        capacity,
        city,
        state,
        created_at,
        attraction_types:type_id (
          key,
          name,
          icon
        ),
        zones (
          id
        )
      `
      )
      .eq('org_id', orgId);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.type) {
      query = query.eq('attraction_types.key', filters.type);
    }

    const { data, error } = await query.order('name');

    if (error) {
      throw new BadRequestException({
        code: 'ATTRACTION_LIST_FAILED',
        message: error.message,
      });
    }

    // Get current season for each attraction
    const attractionIds = data.map((a: any) => a.id);
    const { data: seasons } = await this.supabase.adminClient
      .from('seasons')
      .select('id, attraction_id, name, start_date, end_date, status')
      .in('attraction_id', attractionIds)
      .eq('status', 'active');

    const seasonMap = new Map(seasons?.map((s: any) => [s.attraction_id, s]) || []);

    return {
      data: data.map((a: any) => ({
        id: a.id,
        name: a.name,
        slug: a.slug,
        type: a.attraction_types?.key || null,
        type_name: a.attraction_types?.name || null,
        type_icon: a.attraction_types?.icon || null,
        logo_url: a.logo_url,
        cover_image_url: a.cover_image_url,
        status: a.status,
        intensity_level: a.intensity_level,
        capacity: a.capacity || 0,
        zones_count: a.zones?.length || 0,
        city: a.city,
        state: a.state,
        created_at: a.created_at,
        current_season: seasonMap.get(a.id) || null,
      })),
    };
  }

  /**
   * Get attraction by ID
   */
  async findById(orgId: OrgId, attractionId: AttractionId) {
    const { data, error } = await this.supabase.adminClient
      .from('attractions')
      .select(
        `
        *,
        attraction_types:type_id (
          key,
          name,
          icon
        ),
        zones (
          id,
          name,
          description,
          capacity,
          color,
          sort_order
        )
      `
      )
      .eq('id', attractionId)
      .eq('org_id', orgId)
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'ATTRACTION_NOT_FOUND',
        message: 'Attraction not found',
      });
    }

    // Get current season
    const { data: currentSeason } = await this.supabase.adminClient
      .from('seasons')
      .select('id, name, status, start_date, end_date')
      .eq('attraction_id', attractionId)
      .eq('status', 'active')
      .single();

    // Get amenities
    const { data: amenities } = await this.supabase.adminClient
      .from('attraction_amenities')
      .select(
        `
        amenity_types (
          key
        )
      `
      )
      .eq('attraction_id', attractionId);

    // Cast to handle Supabase FK join typing
    const attractionType = data.attraction_types as unknown as {
      key: string;
      name: string;
      icon: string;
    } | null;

    return {
      ...data,
      type: attractionType?.key || null,
      type_name: attractionType?.name || null,
      type_icon: attractionType?.icon || null,
      zones_count: data.zones?.length || 0,
      amenities: amenities?.map((a: any) => a.amenity_types.key) || [],
      current_season: currentSeason,
    };
  }

  /**
   * Update attraction
   */
  async update(orgId: OrgId, attractionId: AttractionId, dto: UpdateAttractionDto) {
    const { data, error } = await this.supabase.adminClient
      .from('attractions')
      .update({
        name: dto.name,
        description: dto.description,
        website: dto.website,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        coordinates: dto.coordinates,
        timezone: dto.timezone,
        capacity: dto.capacity,
        min_age: dto.min_age,
        intensity_level: dto.intensity_level,
        duration_minutes: dto.duration_minutes,
        settings: dto.settings,
        seo_metadata: dto.seo_metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', attractionId)
      .eq('org_id', orgId)
      .select()
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'ATTRACTION_UPDATE_FAILED',
        message: error.message,
      });
    }

    return data;
  }

  /**
   * Archive attraction
   */
  async archive(orgId: OrgId, attractionId: AttractionId) {
    const { error } = await this.supabase.adminClient
      .from('attractions')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .eq('id', attractionId)
      .eq('org_id', orgId);

    if (error) {
      throw new BadRequestException({
        code: 'ATTRACTION_ARCHIVE_FAILED',
        message: error.message,
      });
    }

    return {
      message: 'Attraction archived',
      id: attractionId,
      status: 'archived',
    };
  }

  /**
   * Publish attraction
   */
  async publish(orgId: OrgId, attractionId: AttractionId) {
    // Check requirements
    const attraction = await this.findById(orgId, attractionId);

    if (!attraction.name || !attraction.type_id || !attraction.city) {
      throw new BadRequestException({
        code: 'ATTRACTION_MISSING_REQUIREMENTS',
        message: 'Missing required fields for publishing (name, type, city)',
      });
    }

    const { data, error } = await this.supabase.adminClient
      .from('attractions')
      .update({
        status: 'published',
        updated_at: new Date().toISOString(),
      })
      .eq('id', attractionId)
      .eq('org_id', orgId)
      .select('id, status')
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'ATTRACTION_PUBLISH_FAILED',
        message: error.message,
      });
    }

    return {
      ...data,
      message: 'Attraction is now visible to the public',
    };
  }

  /**
   * Activate attraction (enable ticket sales)
   */
  async activate(orgId: OrgId, attractionId: AttractionId) {
    // TODO: Check Stripe connection and ticket types
    const { data, error } = await this.supabase.adminClient
      .from('attractions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', attractionId)
      .eq('org_id', orgId)
      .select('id, status')
      .single();

    if (error) {
      throw new BadRequestException({
        code: 'ATTRACTION_ACTIVATE_FAILED',
        message: error.message,
      });
    }

    return {
      ...data,
      message: 'Ticket sales are now enabled',
    };
  }

  /**
   * Get public attraction by slug
   */
  async findBySlug(slug: string) {
    const { data, error } = await this.supabase.adminClient
      .from('attractions')
      .select(
        `
        id,
        name,
        slug,
        type_id,
        description,
        logo_url,
        cover_image_url,
        city,
        state,
        intensity_level,
        duration_minutes,
        min_age,
        attraction_types:type_id (
          key,
          name,
          icon
        ),
        organizations:org_id (
          name,
          logo_url
        )
      `
      )
      .eq('slug', slug)
      .in('status', ['published', 'active'])
      .single();

    if (error || !data) {
      throw new NotFoundException({
        code: 'ATTRACTION_NOT_FOUND',
        message: 'Attraction not found',
      });
    }

    // Get amenities
    const { data: amenities } = await this.supabase.adminClient
      .from('attraction_amenities')
      .select(
        `
        amenity_types (
          key
        )
      `
      )
      .eq('attraction_id', data.id);

    // Cast to handle Supabase FK join typing (single record, not array)
    const attractionType = data.attraction_types as unknown as {
      key: string;
      name: string;
      icon: string;
    } | null;

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      type: attractionType?.key || null,
      type_name: attractionType?.name || null,
      description: data.description,
      logo_url: data.logo_url,
      cover_image_url: data.cover_image_url,
      city: data.city,
      state: data.state,
      intensity_level: data.intensity_level,
      duration_minutes: data.duration_minutes,
      min_age: data.min_age,
      amenities: amenities?.map((a: any) => a.amenity_types.key) || [],
      organization: data.organizations,
    };
  }

  /**
   * Search public attractions
   */
  async searchPublic(filters?: {
    type?: string;
    city?: string;
    state?: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }) {
    let query = this.supabase.adminClient
      .from('attractions')
      .select(
        `
        id,
        name,
        slug,
        type_id,
        logo_url,
        city,
        state,
        intensity_level,
        attraction_types:type_id (
          key,
          name,
          icon
        )
      `
      )
      .in('status', ['published', 'active']);

    if (filters?.type) {
      query = query.eq('attraction_types.key', filters.type);
    }

    const { data, error } = await query.order('name').limit(100);

    if (error) {
      throw new BadRequestException({
        code: 'ATTRACTION_SEARCH_FAILED',
        message: error.message,
      });
    }

    let results = data.map((a: any) => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      type: a.attraction_types?.key || null,
      type_name: a.attraction_types?.name || null,
      logo_url: a.logo_url,
      city: a.city,
      state: a.state,
      intensity_level: a.intensity_level,
    }));

    // Filter by city/state if provided
    if (filters?.city) {
      results = results.filter((a: any) =>
        a.city?.toLowerCase().includes(filters.city?.toLowerCase())
      );
    }

    if (filters?.state) {
      results = results.filter((a: any) => a.state?.toLowerCase() === filters.state?.toLowerCase());
    }

    return {
      data: results,
      meta: {
        total: results.length,
      },
    };
  }
}
