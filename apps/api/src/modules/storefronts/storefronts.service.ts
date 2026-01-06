import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type {
  UpdateStorefrontSettingsDto,
  CreatePageDto,
  UpdatePageDto,
  AddDomainDto,
  CreateFaqDto,
  UpdateFaqDto,
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  UpdateNavigationDto,
  StorefrontSettingsResponse,
  PageResponse,
  DomainResponse,
  FaqResponse,
  AnnouncementResponse,
  NavigationResponse,
  PublicStorefrontResponse,
  ContentFormat,
  PageType,
  PageStatus,
  DomainType,
  DomainStatus,
  SslStatus,
  VerificationMethod,
  NavLinkType,
  AnnouncementType,
  AnnouncementPosition,
} from './dto/index.js';

// Reserved page slugs that cannot be used
const RESERVED_SLUGS = ['tickets', 'attractions', 'calendar', 'cart', 'checkout', 'api', 'admin'];

@Injectable()
export class StorefrontsService {
  private readonly logger = new Logger(StorefrontsService.name);

  constructor(private supabase: SupabaseService) {}

  // ===========================================================================
  // Settings (per-attraction)
  // ===========================================================================

  async getSettings(attractionId: string): Promise<StorefrontSettingsResponse | null> {
    const { data, error } = await this.supabase.adminClient
      .from('storefront_settings')
      .select('*')
      .eq('attraction_id', attractionId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return this.mapSettings(data);
  }

  async updateSettings(orgId: string, attractionId: string, dto: UpdateStorefrontSettingsDto): Promise<StorefrontSettingsResponse> {
    // First check if settings exist, create if not
    const existing = await this.getSettings(attractionId);

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    // Map flat fields
    if (dto.tagline !== undefined) updateData['tagline'] = dto.tagline;
    if (dto.description !== undefined) updateData['description'] = dto.description;

    // Map hero fields
    if (dto.hero !== undefined) {
      if (dto.hero.imageUrl !== undefined) updateData['hero_image_url'] = dto.hero.imageUrl;
      if (dto.hero.videoUrl !== undefined) updateData['hero_video_url'] = dto.hero.videoUrl;
      if (dto.hero.title !== undefined) updateData['hero_title'] = dto.hero.title;
      if (dto.hero.subtitle !== undefined) updateData['hero_subtitle'] = dto.hero.subtitle;
    }

    // Map theme fields
    if (dto.theme !== undefined) {
      if (dto.theme.preset !== undefined) updateData['theme_preset'] = dto.theme.preset;
      if (dto.theme.primaryColor !== undefined) updateData['primary_color'] = dto.theme.primaryColor;
      if (dto.theme.secondaryColor !== undefined) updateData['secondary_color'] = dto.theme.secondaryColor;
      if (dto.theme.accentColor !== undefined) updateData['accent_color'] = dto.theme.accentColor;
      if (dto.theme.backgroundColor !== undefined) updateData['background_color'] = dto.theme.backgroundColor;
      if (dto.theme.textColor !== undefined) updateData['text_color'] = dto.theme.textColor;
      if (dto.theme.fontHeading !== undefined) updateData['font_heading'] = dto.theme.fontHeading;
      if (dto.theme.fontBody !== undefined) updateData['font_body'] = dto.theme.fontBody;
      if (dto.theme.customCss !== undefined) updateData['custom_css'] = dto.theme.customCss;
    }

    // Map social fields
    if (dto.social !== undefined) {
      if (dto.social.facebook !== undefined) updateData['social_facebook'] = dto.social.facebook;
      if (dto.social.instagram !== undefined) updateData['social_instagram'] = dto.social.instagram;
      if (dto.social.twitter !== undefined) updateData['social_twitter'] = dto.social.twitter;
      if (dto.social.tiktok !== undefined) updateData['social_tiktok'] = dto.social.tiktok;
      if (dto.social.youtube !== undefined) updateData['social_youtube'] = dto.social.youtube;
    }

    // Map SEO fields
    if (dto.seo !== undefined) {
      if (dto.seo.title !== undefined) updateData['seo_title'] = dto.seo.title;
      if (dto.seo.description !== undefined) updateData['seo_description'] = dto.seo.description;
      if (dto.seo.keywords !== undefined) updateData['seo_keywords'] = dto.seo.keywords;
      if (dto.seo.ogImageUrl !== undefined) updateData['og_image_url'] = dto.seo.ogImageUrl;
    }

    // Map analytics fields
    if (dto.analytics !== undefined) {
      if (dto.analytics.googleAnalyticsId !== undefined) updateData['google_analytics_id'] = dto.analytics.googleAnalyticsId;
      if (dto.analytics.facebookPixelId !== undefined) updateData['facebook_pixel_id'] = dto.analytics.facebookPixelId;
      if (dto.analytics.customHeadScripts !== undefined) updateData['custom_head_scripts'] = dto.analytics.customHeadScripts;
    }

    // Map features fields
    if (dto.features !== undefined) {
      if (dto.features.showAttractions !== undefined) updateData['show_attractions'] = dto.features.showAttractions;
      if (dto.features.showCalendar !== undefined) updateData['show_calendar'] = dto.features.showCalendar;
      if (dto.features.showFaq !== undefined) updateData['show_faq'] = dto.features.showFaq;
      if (dto.features.showReviews !== undefined) updateData['show_reviews'] = dto.features.showReviews;
      if (dto.features.featuredAttractionIds !== undefined) updateData['featured_attraction_ids'] = dto.features.featuredAttractionIds;
    }

    // Map contact visibility
    if (dto.showAddress !== undefined) updateData['show_address'] = dto.showAddress;
    if (dto.showPhone !== undefined) updateData['show_phone'] = dto.showPhone;
    if (dto.showEmail !== undefined) updateData['show_email'] = dto.showEmail;

    if (!existing) {
      // Create new settings
      const { data, error } = await this.supabase.adminClient
        .from('storefront_settings')
        .insert({ org_id: orgId, attraction_id: attractionId, ...updateData })
        .select()
        .single();

      if (error) throw error;

      // Auto-create subdomain
      await this.createSubdomain(orgId, attractionId);

      return this.mapSettings(data);
    }

    // Update existing
    const { data, error } = await this.supabase.adminClient
      .from('storefront_settings')
      .update(updateData)
      .eq('attraction_id', attractionId)
      .select()
      .single();

    if (error) throw error;
    return this.mapSettings(data);
  }

  async publish(attractionId: string): Promise<{ isPublished: boolean; publishedAt: string; url: string }> {
    const settings = await this.getSettings(attractionId);
    if (!settings) {
      throw new NotFoundException('Storefront settings not found');
    }

    const publishedAt = new Date().toISOString();

    const { error } = await this.supabase.adminClient
      .from('storefront_settings')
      .update({
        is_published: true,
        published_at: publishedAt,
        updated_at: publishedAt,
      })
      .eq('attraction_id', attractionId);

    if (error) throw error;

    // Get primary domain for URL
    const domain = await this.getPrimaryDomain(attractionId);
    const url = domain ? `https://${domain.domain}` : '';

    return { isPublished: true, publishedAt, url };
  }

  async unpublish(attractionId: string): Promise<{ isPublished: boolean }> {
    const { error } = await this.supabase.adminClient
      .from('storefront_settings')
      .update({
        is_published: false,
        updated_at: new Date().toISOString(),
      })
      .eq('attraction_id', attractionId);

    if (error) throw error;
    return { isPublished: false };
  }

  async getPreviewUrl(attractionId: string): Promise<{ previewUrl: string; expiresAt: string }> {
    const domain = await this.getPrimaryDomain(attractionId);
    if (!domain) {
      throw new NotFoundException('No domain configured');
    }

    // Generate a preview token (in production, store this with expiry)
    const previewToken = Buffer.from(`${attractionId}:${Date.now()}`).toString('base64');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    return {
      previewUrl: `https://${domain.domain}?preview=${previewToken}`,
      expiresAt,
    };
  }

  // ===========================================================================
  // Pages (per-attraction)
  // ===========================================================================

  async getPages(attractionId: string, status?: PageStatus): Promise<PageResponse[]> {
    let query = this.supabase.adminClient
      .from('storefront_pages')
      .select('*')
      .eq('attraction_id', attractionId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((row) => this.mapPage(row));
  }

  async getPage(attractionId: string, pageId: string): Promise<PageResponse | null> {
    const { data, error } = await this.supabase.adminClient
      .from('storefront_pages')
      .select('*')
      .eq('attraction_id', attractionId)
      .eq('id', pageId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapPage(data) : null;
  }

  async createPage(orgId: string, attractionId: string, userId: string, dto: CreatePageDto): Promise<PageResponse> {
    // Check reserved slugs
    if (RESERVED_SLUGS.includes(dto.slug.toLowerCase())) {
      throw new BadRequestException(`Slug "${dto.slug}" is reserved`);
    }

    // Check for duplicate slug
    const { data: existing } = await this.supabase.adminClient
      .from('storefront_pages')
      .select('id')
      .eq('attraction_id', attractionId)
      .eq('slug', dto.slug)
      .single();

    if (existing) {
      throw new ConflictException(`Page with slug "${dto.slug}" already exists`);
    }

    const insertData: Record<string, unknown> = {
      org_id: orgId,
      attraction_id: attractionId,
      slug: dto.slug,
      title: dto.title,
      content: dto.content || '',
      content_format: dto.content_format || 'markdown',
      page_type: dto.page_type || 'custom',
      show_in_nav: dto.show_in_nav ?? false,
      status: 'draft',
      created_by: userId,
    };

    // Map SEO fields if provided
    if (dto.seo) {
      if (dto.seo.title !== undefined) insertData['seo_title'] = dto.seo.title;
      if (dto.seo.description !== undefined) insertData['seo_description'] = dto.seo.description;
      if (dto.seo.ogImageUrl !== undefined) insertData['og_image_url'] = dto.seo.ogImageUrl;
    }

    const { data, error } = await this.supabase.adminClient
      .from('storefront_pages')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return this.mapPage(data);
  }

  async updatePage(attractionId: string, pageId: string, userId: string, dto: UpdatePageDto): Promise<PageResponse> {
    // Check if page exists
    const page = await this.getPage(attractionId, pageId);
    if (!page) {
      throw new NotFoundException('Page not found');
    }

    // Check slug if changing
    if (dto.slug && dto.slug !== page.slug) {
      if (RESERVED_SLUGS.includes(dto.slug.toLowerCase())) {
        throw new BadRequestException(`Slug "${dto.slug}" is reserved`);
      }

      const { data: existing } = await this.supabase.adminClient
        .from('storefront_pages')
        .select('id')
        .eq('attraction_id', attractionId)
        .eq('slug', dto.slug)
        .single();

      if (existing) {
        throw new ConflictException(`Page with slug "${dto.slug}" already exists`);
      }
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
      updated_by: userId,
    };

    if (dto.slug !== undefined) updateData['slug'] = dto.slug;
    if (dto.title !== undefined) updateData['title'] = dto.title;
    if (dto.content !== undefined) updateData['content'] = dto.content;
    if (dto.content_format !== undefined) updateData['content_format'] = dto.content_format;
    if (dto.status !== undefined) updateData['status'] = dto.status;
    if (dto.show_in_nav !== undefined) updateData['show_in_nav'] = dto.show_in_nav;

    // Map SEO fields if provided
    if (dto.seo !== undefined) {
      if (dto.seo.title !== undefined) updateData['seo_title'] = dto.seo.title;
      if (dto.seo.description !== undefined) updateData['seo_description'] = dto.seo.description;
      if (dto.seo.ogImageUrl !== undefined) updateData['og_image_url'] = dto.seo.ogImageUrl;
    }

    const { data, error } = await this.supabase.adminClient
      .from('storefront_pages')
      .update(updateData)
      .eq('attraction_id', attractionId)
      .eq('id', pageId)
      .select()
      .single();

    if (error) throw error;
    return this.mapPage(data);
  }

  async deletePage(attractionId: string, pageId: string): Promise<void> {
    const { error } = await this.supabase.adminClient
      .from('storefront_pages')
      .delete()
      .eq('attraction_id', attractionId)
      .eq('id', pageId);

    if (error) throw error;
  }

  // ===========================================================================
  // Domains (per-attraction)
  // ===========================================================================

  async getDomains(attractionId: string): Promise<DomainResponse[]> {
    const { data, error } = await this.supabase.adminClient
      .from('storefront_domains')
      .select('*')
      .eq('attraction_id', attractionId)
      .order('is_primary', { ascending: false });

    if (error) throw error;
    return (data || []).map((row) => this.mapDomain(row));
  }

  async getPrimaryDomain(attractionId: string): Promise<DomainResponse | null> {
    const { data, error } = await this.supabase.adminClient
      .from('storefront_domains')
      .select('*')
      .eq('attraction_id', attractionId)
      .eq('is_primary', true)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapDomain(data) : null;
  }

  private async createSubdomain(orgId: string, attractionId: string): Promise<void> {
    // Get attraction slug
    const { data: attraction } = await this.supabase.adminClient
      .from('attractions')
      .select('slug')
      .eq('id', attractionId)
      .single();

    if (!attraction) return;

    const subdomain = `${attraction.slug}.hauntplatform.com`;

    // Check if subdomain already exists
    const { data: existing } = await this.supabase.adminClient
      .from('storefront_domains')
      .select('id')
      .eq('attraction_id', attractionId)
      .eq('domain_type', 'subdomain')
      .single();

    if (existing) return;

    await this.supabase.adminClient.from('storefront_domains').insert({
      org_id: orgId,
      attraction_id: attractionId,
      domain: subdomain,
      domain_type: 'subdomain',
      is_primary: true,
      status: 'active',
      ssl_status: 'active',
      verified_at: new Date().toISOString(),
    });
  }

  async addDomain(orgId: string, attractionId: string, dto: AddDomainDto): Promise<DomainResponse> {
    // Validate domain format - allow single-char subdomains and full domains
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(dto.domain)) {
      throw new BadRequestException('Invalid domain format');
    }

    // Check if domain already exists globally
    const { data: existing } = await this.supabase.adminClient
      .from('storefront_domains')
      .select('id, attraction_id')
      .eq('domain', dto.domain.toLowerCase())
      .single();

    if (existing) {
      if (existing.attraction_id === attractionId) {
        throw new ConflictException('Domain already added to this storefront');
      }
      throw new ConflictException('Domain is registered to another attraction');
    }

    // Generate verification token
    const verificationToken = `haunt-verify-${Buffer.from(attractionId).toString('base64').slice(0, 16)}`;

    const { data, error } = await this.supabase.adminClient
      .from('storefront_domains')
      .insert({
        org_id: orgId,
        attraction_id: attractionId,
        domain: dto.domain.toLowerCase(),
        domain_type: 'custom',
        is_primary: false,
        status: 'pending',
        ssl_status: 'pending',
        verification_method: 'dns_txt',
        verification_token: verificationToken,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapDomain(data, true);
  }

  async verifyDomain(attractionId: string, domainId: string): Promise<DomainResponse> {
    const { data: domain, error: fetchError } = await this.supabase.adminClient
      .from('storefront_domains')
      .select('*')
      .eq('attraction_id', attractionId)
      .eq('id', domainId)
      .single();

    if (fetchError || !domain) {
      throw new NotFoundException('Domain not found');
    }

    if (domain.status === 'active') {
      return this.mapDomain(domain);
    }

    // In production, perform actual DNS lookup here
    // For now, simulate verification
    const dnsVerified = await this.checkDnsRecord(
      domain.domain,
      domain.verification_method,
      domain.verification_token,
    );

    if (!dnsVerified) {
      // Update status to failed
      await this.supabase.adminClient
        .from('storefront_domains')
        .update({ status: 'failed' })
        .eq('id', domainId);

      throw new BadRequestException('DNS verification failed - record not found');
    }

    // Update domain as verified
    const { data, error } = await this.supabase.adminClient
      .from('storefront_domains')
      .update({
        status: 'active',
        ssl_status: 'provisioning',
        verified_at: new Date().toISOString(),
      })
      .eq('id', domainId)
      .select()
      .single();

    if (error) throw error;
    return this.mapDomain(data);
  }

  private async checkDnsRecord(
    domain: string,
    method: string,
    token: string,
  ): Promise<boolean> {
    this.logger.log(`Checking DNS for ${domain} with method ${method}, token ${token}`);

    // In development, auto-verify for test domains
    if (process.env['NODE_ENV'] !== 'production') {
      this.logger.log('Development mode: auto-verifying domain');
      return true;
    }

    try {
      if (method === 'dns_txt') {
        // Check for TXT record at _haunt-verify.domain.com
        const { Resolver } = await import('node:dns/promises');
        const resolver = new Resolver();
        resolver.setServers(['8.8.8.8', '1.1.1.1']); // Use public DNS

        const verifyDomain = `_haunt-verify.${domain}`;
        this.logger.log(`Looking up TXT records for ${verifyDomain}`);

        try {
          const records = await resolver.resolveTxt(verifyDomain);
          const flatRecords = records.flat();
          this.logger.log(`Found TXT records: ${JSON.stringify(flatRecords)}`);

          return flatRecords.includes(token);
        } catch (dnsError: unknown) {
          // ENODATA or ENOTFOUND means no TXT record exists
          const error = dnsError as { code?: string };
          if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
            this.logger.log(`No TXT record found for ${verifyDomain}`);
            return false;
          }
          throw dnsError;
        }
      }

      if (method === 'dns_cname') {
        // Check that CNAME points to our domain
        const { Resolver } = await import('node:dns/promises');
        const resolver = new Resolver();
        resolver.setServers(['8.8.8.8', '1.1.1.1']);

        try {
          const records = await resolver.resolveCname(domain);
          this.logger.log(`Found CNAME records: ${JSON.stringify(records)}`);

          // Check if CNAME points to our platform domain
          const expectedCname = 'cname.hauntplatform.com';
          return records.some((r) => r.toLowerCase() === expectedCname);
        } catch (dnsError: unknown) {
          const error = dnsError as { code?: string };
          if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
            this.logger.log(`No CNAME record found for ${domain}`);
            return false;
          }
          throw dnsError;
        }
      }

      this.logger.warn(`Unknown verification method: ${method}`);
      return false;
    } catch (error) {
      this.logger.error(`DNS verification error for ${domain}:`, error);
      return false;
    }
  }

  async setPrimaryDomain(attractionId: string, domainId: string): Promise<void> {
    const { data: domain, error: fetchError } = await this.supabase.adminClient
      .from('storefront_domains')
      .select('*')
      .eq('attraction_id', attractionId)
      .eq('id', domainId)
      .single();

    if (fetchError || !domain) {
      throw new NotFoundException('Domain not found');
    }

    if (domain.status !== 'active') {
      throw new BadRequestException('Cannot set unverified domain as primary');
    }

    // Remove primary from all other domains
    await this.supabase.adminClient
      .from('storefront_domains')
      .update({ is_primary: false })
      .eq('attraction_id', attractionId);

    // Set this one as primary
    await this.supabase.adminClient
      .from('storefront_domains')
      .update({ is_primary: true })
      .eq('id', domainId);
  }

  async deleteDomain(attractionId: string, domainId: string): Promise<void> {
    const { data: domain, error: fetchError } = await this.supabase.adminClient
      .from('storefront_domains')
      .select('*')
      .eq('attraction_id', attractionId)
      .eq('id', domainId)
      .single();

    if (fetchError || !domain) {
      throw new NotFoundException('Domain not found');
    }

    if (domain.domain_type === 'subdomain') {
      throw new BadRequestException('Cannot delete auto-generated subdomain');
    }

    if (domain.is_primary) {
      // Check if there are other domains
      const { data: otherDomains } = await this.supabase.adminClient
        .from('storefront_domains')
        .select('id')
        .eq('attraction_id', attractionId)
        .neq('id', domainId);

      if (otherDomains && otherDomains.length > 0) {
        throw new BadRequestException('Cannot delete primary domain while other domains exist. Set another domain as primary first.');
      }
    }

    const { error } = await this.supabase.adminClient
      .from('storefront_domains')
      .delete()
      .eq('id', domainId);

    if (error) throw error;
  }

  // ===========================================================================
  // FAQs (per-attraction)
  // ===========================================================================

  async getFaqs(attractionId: string, category?: string): Promise<FaqResponse[]> {
    let query = this.supabase.adminClient
      .from('storefront_faqs')
      .select('*')
      .eq('attraction_id', attractionId)
      .order('sort_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((row) => this.mapFaq(row));
  }

  async createFaq(orgId: string, attractionId: string, dto: CreateFaqDto): Promise<FaqResponse> {
    // Get max sort order
    const { data: maxOrder } = await this.supabase.adminClient
      .from('storefront_faqs')
      .select('sort_order')
      .eq('attraction_id', attractionId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const sortOrder = maxOrder ? maxOrder.sort_order + 1 : 0;

    const { data, error } = await this.supabase.adminClient
      .from('storefront_faqs')
      .insert({
        org_id: orgId,
        attraction_id: attractionId,
        question: dto.question,
        answer: dto.answer,
        category: dto.category || 'General',
        sort_order: sortOrder,
        is_published: true,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapFaq(data);
  }

  async updateFaq(attractionId: string, faqId: string, dto: UpdateFaqDto): Promise<FaqResponse> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (dto.question !== undefined) updateData['question'] = dto.question;
    if (dto.answer !== undefined) updateData['answer'] = dto.answer;
    if (dto.category !== undefined) updateData['category'] = dto.category;
    if (dto.is_published !== undefined) updateData['is_published'] = dto.is_published;

    const { data, error } = await this.supabase.adminClient
      .from('storefront_faqs')
      .update(updateData)
      .eq('attraction_id', attractionId)
      .eq('id', faqId)
      .select()
      .single();

    if (error) throw error;
    return this.mapFaq(data);
  }

  async deleteFaq(attractionId: string, faqId: string): Promise<void> {
    const { error } = await this.supabase.adminClient
      .from('storefront_faqs')
      .delete()
      .eq('attraction_id', attractionId)
      .eq('id', faqId);

    if (error) throw error;
  }

  async reorderFaqs(attractionId: string, order: string[]): Promise<void> {
    // Update sort_order for each FAQ
    for (let i = 0; i < order.length; i++) {
      await this.supabase.adminClient
        .from('storefront_faqs')
        .update({ sort_order: i })
        .eq('attraction_id', attractionId)
        .eq('id', order[i]);
    }
  }

  // ===========================================================================
  // Announcements (per-attraction)
  // ===========================================================================

  async getAnnouncements(attractionId: string): Promise<AnnouncementResponse[]> {
    const { data, error } = await this.supabase.adminClient
      .from('storefront_announcements')
      .select('*')
      .eq('attraction_id', attractionId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row) => this.mapAnnouncement(row));
  }

  async createAnnouncement(orgId: string, attractionId: string, userId: string, dto: CreateAnnouncementDto): Promise<AnnouncementResponse> {
    const { data, error } = await this.supabase.adminClient
      .from('storefront_announcements')
      .insert({
        org_id: orgId,
        attraction_id: attractionId,
        title: dto.title,
        content: dto.content,
        type: dto.type || 'info',
        position: dto.position || 'banner',
        link_url: dto.link_url || null,
        link_text: dto.link_text || null,
        starts_at: dto.starts_at || new Date().toISOString(),
        ends_at: dto.ends_at || null,
        is_active: true,
        is_dismissible: dto.is_dismissible ?? true,
        created_by: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return this.mapAnnouncement(data);
  }

  async updateAnnouncement(
    attractionId: string,
    announcementId: string,
    dto: UpdateAnnouncementDto,
  ): Promise<AnnouncementResponse> {
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (dto.title !== undefined) updateData['title'] = dto.title;
    if (dto.content !== undefined) updateData['content'] = dto.content;
    if (dto.type !== undefined) updateData['type'] = dto.type;
    if (dto.position !== undefined) updateData['position'] = dto.position;
    if (dto.link_url !== undefined) updateData['link_url'] = dto.link_url;
    if (dto.link_text !== undefined) updateData['link_text'] = dto.link_text;
    if (dto.starts_at !== undefined) updateData['starts_at'] = dto.starts_at;
    if (dto.ends_at !== undefined) updateData['ends_at'] = dto.ends_at;
    if (dto.is_active !== undefined) updateData['is_active'] = dto.is_active;
    if (dto.is_dismissible !== undefined) updateData['is_dismissible'] = dto.is_dismissible;

    const { data, error } = await this.supabase.adminClient
      .from('storefront_announcements')
      .update(updateData)
      .eq('attraction_id', attractionId)
      .eq('id', announcementId)
      .select()
      .single();

    if (error) throw error;
    return this.mapAnnouncement(data);
  }

  async deleteAnnouncement(attractionId: string, announcementId: string): Promise<void> {
    const { error } = await this.supabase.adminClient
      .from('storefront_announcements')
      .delete()
      .eq('attraction_id', attractionId)
      .eq('id', announcementId);

    if (error) throw error;
  }

  // ===========================================================================
  // Navigation (per-attraction)
  // ===========================================================================

  async getNavigation(attractionId: string): Promise<NavigationResponse> {
    const { data, error } = await this.supabase.adminClient
      .from('storefront_navigation')
      .select('*')
      .eq('attraction_id', attractionId)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    const header = (data || [])
      .filter((row) => row.position === 'header')
      .map((row) => this.mapNavItem(row));

    const footer = (data || [])
      .filter((row) => row.position === 'footer')
      .map((row) => this.mapNavItem(row));

    return { header, footer };
  }

  async updateNavigation(orgId: string, attractionId: string, dto: UpdateNavigationDto): Promise<NavigationResponse> {
    // Delete existing navigation
    await this.supabase.adminClient
      .from('storefront_navigation')
      .delete()
      .eq('attraction_id', attractionId);

    // Insert header items
    for (const [i, item] of dto.header.entries()) {
      await this.supabase.adminClient.from('storefront_navigation').insert({
        org_id: orgId,
        attraction_id: attractionId,
        label: item.label,
        link_type: item.link_type,
        page_id: item.page_id || null,
        external_url: item.external_url || null,
        open_in_new_tab: item.open_in_new_tab ?? false,
        position: 'header',
        sort_order: i,
      });
    }

    // Insert footer items
    for (const [i, item] of dto.footer.entries()) {
      await this.supabase.adminClient.from('storefront_navigation').insert({
        org_id: orgId,
        attraction_id: attractionId,
        label: item.label,
        link_type: item.link_type,
        page_id: item.page_id || null,
        external_url: item.external_url || null,
        open_in_new_tab: item.open_in_new_tab ?? false,
        position: 'footer',
        sort_order: i,
      });
    }

    return this.getNavigation(attractionId);
  }

  // ===========================================================================
  // Public Storefront API (per-attraction)
  // ===========================================================================

  async getPublicStorefront(identifier: string): Promise<PublicStorefrontResponse | null> {
    // Try to resolve by domain first, then by attraction slug
    let attractionId: string | null = null;
    let currentDomain: string = identifier;

    // Check if identifier is a domain
    const { data: domainData } = await this.supabase.adminClient
      .from('storefront_domains')
      .select('attraction_id, domain')
      .eq('domain', identifier.toLowerCase())
      .eq('status', 'active')
      .single();

    if (domainData) {
      attractionId = domainData.attraction_id;
      currentDomain = domainData.domain;
    } else {
      // Try attraction slug
      const { data: attractionData } = await this.supabase.adminClient
        .from('attractions')
        .select('id, slug')
        .eq('slug', identifier.toLowerCase())
        .single();

      if (attractionData) {
        attractionId = attractionData.id;
        currentDomain = `${attractionData.slug}.hauntplatform.com`;
      }
    }

    if (!attractionId) {
      return null;
    }

    // Get settings (must be published)
    const { data: settings } = await this.supabase.adminClient
      .from('storefront_settings')
      .select('*')
      .eq('attraction_id', attractionId)
      .eq('is_published', true)
      .single();

    if (!settings) {
      return null;
    }

    // Get attraction details with org
    const { data: attraction } = await this.supabase.adminClient
      .from('attractions')
      .select('*, organizations(*)')
      .eq('id', attractionId)
      .single();

    if (!attraction || !attraction.organizations) {
      return null;
    }

    const org = attraction.organizations;

    // Get navigation
    const navigation = await this.getNavigation(attractionId);

    // Get active announcements
    const now = new Date().toISOString();
    const { data: announcements } = await this.supabase.adminClient
      .from('storefront_announcements')
      .select('*')
      .eq('attraction_id', attractionId)
      .eq('is_active', true)
      .lte('starts_at', now)
      .or(`ends_at.is.null,ends_at.gt.${now}`);

    // Get primary domain for canonical URL
    const primaryDomain = await this.getPrimaryDomain(attractionId);

    // Build nav URLs
    const buildNavUrl = async (item: { linkType: NavLinkType; pageId: string | null; externalUrl: string | null }) => {
      switch (item.linkType) {
        case 'home':
          return '/';
        case 'tickets':
          return '/tickets';
        case 'attractions':
          return '/attractions';
        case 'external':
          return item.externalUrl || '#';
        case 'page':
          if (item.pageId) {
            const { data: page } = await this.supabase.adminClient
              .from('storefront_pages')
              .select('slug')
              .eq('id', item.pageId)
              .single();
            return page ? `/${page.slug}` : '#';
          }
          return '#';
        default:
          return '#';
      }
    };

    const headerNav = await Promise.all(
      navigation.header.map(async (item) => ({
        label: item.label,
        type: item.linkType,
        url: await buildNavUrl(item),
      })),
    );

    const footerNav = await Promise.all(
      navigation.footer.map(async (item) => ({
        label: item.label,
        type: item.linkType,
        url: await buildNavUrl(item),
      })),
    );

    return {
      org: {
        id: org.id,
        name: org.name,
        slug: org.slug,
        logoUrl: org.logo_url,
        website: org.website,
        address: {
          line1: org.address_line1,
          city: org.city,
          state: org.state,
          postalCode: org.postal_code,
        },
        phone: org.phone,
        email: org.email,
        timezone: org.timezone || 'America/New_York',
      },
      attraction: {
        id: attraction.id,
        name: attraction.name,
        slug: attraction.slug,
        description: attraction.description,
        imageUrl: attraction.image_url,
      },
      storefront: this.mapSettings(settings),
      navigation: {
        header: headerNav,
        footer: footerNav,
      },
      announcements: (announcements || []).map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        type: a.type as AnnouncementType,
        linkUrl: a.link_url,
        linkText: a.link_text,
        isDismissible: a.is_dismissible,
      })),
      domain: {
        current: currentDomain,
        canonical: primaryDomain ? `https://${primaryDomain.domain}` : `https://${currentDomain}`,
      },
    };
  }

  async getPublicPage(identifier: string, slug: string): Promise<PageResponse | null> {
    // Resolve attraction
    const storefront = await this.getPublicStorefront(identifier);
    if (!storefront || !storefront.attraction) {
      return null;
    }

    const { data, error } = await this.supabase.adminClient
      .from('storefront_pages')
      .select('*')
      .eq('attraction_id', storefront.attraction.id)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data ? this.mapPage(data) : null;
  }

  async getPublicFaqs(identifier: string, category?: string): Promise<{ faqs: FaqResponse[]; categories: string[] }> {
    // Resolve attraction
    const storefront = await this.getPublicStorefront(identifier);
    if (!storefront || !storefront.attraction) {
      return { faqs: [], categories: [] };
    }

    let query = this.supabase.adminClient
      .from('storefront_faqs')
      .select('*')
      .eq('attraction_id', storefront.attraction.id)
      .eq('is_published', true)
      .order('sort_order', { ascending: true });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    const faqs = (data || []).map((row) => this.mapFaq(row));

    // Get unique categories
    const categories = [...new Set(faqs.map((f) => f.category).filter(Boolean))] as string[];

    return { faqs, categories };
  }

  // ===========================================================================
  // Mapping Helpers
  // ===========================================================================

  private mapSettings(row: Record<string, unknown>): StorefrontSettingsResponse {
    return {
      id: row['id'] as string,
      tagline: row['tagline'] as string | null,
      description: row['description'] as string | null,
      hero: {
        imageUrl: row['hero_image_url'] as string | null,
        videoUrl: row['hero_video_url'] as string | null,
        title: row['hero_title'] as string | null,
        subtitle: row['hero_subtitle'] as string | null,
      },
      theme: {
        preset: row['theme_preset'] as string | null,
        primaryColor: row['primary_color'] as string | null,
        secondaryColor: row['secondary_color'] as string | null,
        accentColor: row['accent_color'] as string | null,
        backgroundColor: row['background_color'] as string | null,
        textColor: row['text_color'] as string | null,
        fontHeading: row['font_heading'] as string | null,
        fontBody: row['font_body'] as string | null,
        customCss: row['custom_css'] as string | null,
      },
      social: {
        facebook: row['social_facebook'] as string | null,
        instagram: row['social_instagram'] as string | null,
        twitter: row['social_twitter'] as string | null,
        tiktok: row['social_tiktok'] as string | null,
        youtube: row['social_youtube'] as string | null,
      },
      seo: {
        title: row['seo_title'] as string | null,
        description: row['seo_description'] as string | null,
        keywords: row['seo_keywords'] as string[] | null,
        ogImageUrl: row['og_image_url'] as string | null,
      },
      analytics: {
        googleAnalyticsId: row['google_analytics_id'] as string | null,
        facebookPixelId: row['facebook_pixel_id'] as string | null,
        customHeadScripts: row['custom_head_scripts'] as string | null,
      },
      features: {
        showAttractions: row['show_attractions'] as boolean | null,
        showCalendar: row['show_calendar'] as boolean | null,
        showFaq: row['show_faq'] as boolean | null,
        showReviews: row['show_reviews'] as boolean | null,
        featuredAttractionIds: row['featured_attraction_ids'] as string[] | null,
      },
      isPublished: row['is_published'] as boolean,
      publishedAt: row['published_at'] as string | null,
    };
  }

  private mapPage(row: Record<string, unknown>): PageResponse {
    return {
      id: row['id'] as string,
      slug: row['slug'] as string,
      title: row['title'] as string,
      content: row['content'] as string | null,
      contentFormat: row['content_format'] as ContentFormat,
      pageType: row['page_type'] as PageType,
      status: row['status'] as PageStatus,
      showInNav: row['show_in_nav'] as boolean,
      seo: {
        title: row['seo_title'] as string | null,
        description: row['seo_description'] as string | null,
        ogImageUrl: row['og_image_url'] as string | null,
      },
      updatedAt: row['updated_at'] as string,
    };
  }

  private mapDomain(row: Record<string, unknown>, includeVerification = false): DomainResponse {
    const response: DomainResponse = {
      id: row['id'] as string,
      domain: row['domain'] as string,
      domainType: row['domain_type'] as DomainType,
      isPrimary: row['is_primary'] as boolean,
      status: row['status'] as DomainStatus,
      sslStatus: row['ssl_status'] as SslStatus,
      verifiedAt: row['verified_at'] as string | null,
    };

    if (includeVerification && row['verification_token']) {
      const method = row['verification_method'] as VerificationMethod;
      response.verification = {
        method,
        recordName: method === 'dns_txt' ? `_haunt-verify.${row['domain']}` : row['domain'] as string,
        recordValue: row['verification_token'] as string,
        instructions:
          method === 'dns_txt'
            ? `Add a TXT record to your DNS with name "_haunt-verify" and value "${row['verification_token']}"`
            : `Add a CNAME record pointing ${row['domain']} to hauntplatform.com`,
      };
    }

    return response;
  }

  private mapFaq(row: Record<string, unknown>): FaqResponse {
    return {
      id: row['id'] as string,
      question: row['question'] as string,
      answer: row['answer'] as string,
      category: row['category'] as string | null,
      sortOrder: row['sort_order'] as number,
      isPublished: row['is_published'] as boolean,
    };
  }

  private mapAnnouncement(row: Record<string, unknown>): AnnouncementResponse {
    return {
      id: row['id'] as string,
      title: row['title'] as string,
      content: row['content'] as string,
      type: row['type'] as AnnouncementType,
      position: row['position'] as AnnouncementPosition,
      linkUrl: row['link_url'] as string | null,
      linkText: row['link_text'] as string | null,
      startsAt: row['starts_at'] as string | null,
      endsAt: row['ends_at'] as string | null,
      isActive: row['is_active'] as boolean,
      isDismissible: row['is_dismissible'] as boolean,
    };
  }

  private mapNavItem(row: Record<string, unknown>) {
    return {
      id: row['id'] as string,
      label: row['label'] as string,
      linkType: row['link_type'] as NavLinkType,
      pageId: row['page_id'] as string | null,
      externalUrl: row['external_url'] as string | null,
      openInNewTab: row['open_in_new_tab'] as boolean,
      sortOrder: row['sort_order'] as number,
    };
  }
}
