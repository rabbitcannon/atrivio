import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../core/auth/decorators/public.decorator.js';
import { CacheControl, CacheControlInterceptor } from '../../core/cache/index.js';
import { Feature } from '../../core/features/decorators/feature.decorator.js';
import { FeatureGuard } from '../../core/features/guards/feature.guard.js';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import type {
  AddDomainDto,
  CreateAnnouncementDto,
  CreateFaqDto,
  CreatePageDto,
  PageStatus,
  ReorderFaqsDto,
  UpdateAnnouncementDto,
  UpdateFaqDto,
  UpdateNavigationDto,
  UpdatePageDto,
  UpdateStorefrontSettingsDto,
} from './dto/index.js';
import { StorefrontsService } from './storefronts.service.js';

// =============================================================================
// Admin Storefront Controller (Attraction-Scoped)
// =============================================================================

@ApiTags('Storefronts (Admin)')
@Controller('organizations/:orgId/attractions/:attractionId/storefront')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
@UseGuards(FeatureGuard)
@Feature('storefronts')
export class StorefrontsController {
  constructor(private storefrontsService: StorefrontsService) {}

  // ===================== Settings =====================

  @Get()
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Get storefront settings' })
  async getSettings(@Param('attractionId') attractionId: string) {
    const settings = await this.storefrontsService.getSettings(attractionId);
    return { settings };
  }

  @Patch()
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Update storefront settings' })
  async updateSettings(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: UpdateStorefrontSettingsDto
  ) {
    const settings = await this.storefrontsService.updateSettings(ctx.orgId, attractionId, dto);
    return { settings };
  }

  @Post('publish')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @HttpCode(200)
  @ApiOperation({ summary: 'Publish storefront' })
  async publish(@Param('attractionId') attractionId: string) {
    return this.storefrontsService.publish(attractionId);
  }

  @Post('unpublish')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @HttpCode(200)
  @ApiOperation({ summary: 'Unpublish storefront' })
  async unpublish(@Param('attractionId') attractionId: string) {
    return this.storefrontsService.unpublish(attractionId);
  }

  @Get('preview')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Get preview URL' })
  async getPreview(@Param('attractionId') attractionId: string) {
    return this.storefrontsService.getPreviewUrl(attractionId);
  }

  // ===================== Pages =====================

  @Get('pages')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'List pages' })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'published', 'archived'] })
  async listPages(
    @Param('attractionId') attractionId: string,
    @Query('status') status?: PageStatus
  ) {
    const pages = await this.storefrontsService.getPages(attractionId, status);
    return { pages };
  }

  @Get('pages/:pageId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Get a page' })
  async getPage(@Param('attractionId') attractionId: string, @Param('pageId') pageId: string) {
    const page = await this.storefrontsService.getPage(attractionId, pageId);
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    return { page };
  }

  @Post('pages')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Create a page' })
  async createPage(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: CreatePageDto
  ) {
    const page = await this.storefrontsService.createPage(ctx.orgId, attractionId, ctx.userId, dto);
    return { page };
  }

  @Patch('pages/:pageId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Update a page' })
  async updatePage(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Param('pageId') pageId: string,
    @Body() dto: UpdatePageDto
  ) {
    const page = await this.storefrontsService.updatePage(attractionId, pageId, ctx.userId, dto);
    return { page };
  }

  @Delete('pages/:pageId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a page' })
  async deletePage(@Param('attractionId') attractionId: string, @Param('pageId') pageId: string) {
    await this.storefrontsService.deletePage(attractionId, pageId);
  }

  // ===================== Domains =====================

  @Get('domains')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'List domains' })
  async listDomains(@Param('attractionId') attractionId: string) {
    const domains = await this.storefrontsService.getDomains(attractionId);
    return { domains };
  }

  @Get('domains/limits')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Get domain limits for organization' })
  async getDomainLimits(@Tenant() ctx: TenantContext) {
    const limits = await this.storefrontsService.getDomainLimits(ctx.orgId);
    return { limits };
  }

  @Post('domains')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Add custom domain' })
  async addDomain(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: AddDomainDto
  ) {
    const domain = await this.storefrontsService.addDomain(ctx.orgId, attractionId, dto);
    return { domain };
  }

  @Post('domains/:domainId/verify')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verify domain' })
  async verifyDomain(
    @Param('attractionId') attractionId: string,
    @Param('domainId') domainId: string
  ) {
    const domain = await this.storefrontsService.verifyDomain(attractionId, domainId);
    return { domain };
  }

  @Post('domains/:domainId/set-primary')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @HttpCode(200)
  @ApiOperation({ summary: 'Set primary domain' })
  async setPrimaryDomain(
    @Param('attractionId') attractionId: string,
    @Param('domainId') domainId: string
  ) {
    await this.storefrontsService.setPrimaryDomain(attractionId, domainId);
    return { success: true };
  }

  @Delete('domains/:domainId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete domain' })
  async deleteDomain(
    @Param('attractionId') attractionId: string,
    @Param('domainId') domainId: string
  ) {
    await this.storefrontsService.deleteDomain(attractionId, domainId);
  }

  // ===================== FAQs =====================

  @Get('faqs')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'List FAQs' })
  @ApiQuery({ name: 'category', required: false })
  async listFaqs(
    @Param('attractionId') attractionId: string,
    @Query('category') category?: string
  ) {
    const faqs = await this.storefrontsService.getFaqs(attractionId, category);
    return { faqs };
  }

  @Post('faqs')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Create FAQ' })
  async createFaq(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: CreateFaqDto
  ) {
    const faq = await this.storefrontsService.createFaq(ctx.orgId, attractionId, dto);
    return { faq };
  }

  @Patch('faqs/:faqId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Update FAQ' })
  async updateFaq(
    @Param('attractionId') attractionId: string,
    @Param('faqId') faqId: string,
    @Body() dto: UpdateFaqDto
  ) {
    const faq = await this.storefrontsService.updateFaq(attractionId, faqId, dto);
    return { faq };
  }

  @Delete('faqs/:faqId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete FAQ' })
  async deleteFaq(@Param('attractionId') attractionId: string, @Param('faqId') faqId: string) {
    await this.storefrontsService.deleteFaq(attractionId, faqId);
  }

  @Post('faqs/reorder')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reorder FAQs' })
  async reorderFaqs(@Param('attractionId') attractionId: string, @Body() dto: ReorderFaqsDto) {
    await this.storefrontsService.reorderFaqs(attractionId, dto.order);
    return { success: true };
  }

  // ===================== Announcements =====================

  @Get('announcements')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'List announcements' })
  async listAnnouncements(@Param('attractionId') attractionId: string) {
    const announcements = await this.storefrontsService.getAnnouncements(attractionId);
    return { announcements };
  }

  @Post('announcements')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Create announcement' })
  async createAnnouncement(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: CreateAnnouncementDto
  ) {
    const announcement = await this.storefrontsService.createAnnouncement(
      ctx.orgId,
      attractionId,
      ctx.userId,
      dto
    );
    return { announcement };
  }

  @Patch('announcements/:announcementId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Update announcement' })
  async updateAnnouncement(
    @Param('attractionId') attractionId: string,
    @Param('announcementId') announcementId: string,
    @Body() dto: UpdateAnnouncementDto
  ) {
    const announcement = await this.storefrontsService.updateAnnouncement(
      attractionId,
      announcementId,
      dto
    );
    return { announcement };
  }

  @Delete('announcements/:announcementId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete announcement' })
  async deleteAnnouncement(
    @Param('attractionId') attractionId: string,
    @Param('announcementId') announcementId: string
  ) {
    await this.storefrontsService.deleteAnnouncement(attractionId, announcementId);
  }

  // ===================== Navigation =====================

  @Get('navigation')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Get navigation' })
  async getNavigation(@Param('attractionId') attractionId: string) {
    const navigation = await this.storefrontsService.getNavigation(attractionId);
    return { navigation };
  }

  @Put('navigation')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Update navigation' })
  async updateNavigation(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: UpdateNavigationDto
  ) {
    const navigation = await this.storefrontsService.updateNavigation(ctx.orgId, attractionId, dto);
    return { navigation };
  }
}

// =============================================================================
// Public Storefront Controller (No Auth Required)
// =============================================================================

@ApiTags('Storefronts (Public)')
@Controller('storefronts')
@UseInterceptors(CacheControlInterceptor)
export class PublicStorefrontsController {
  constructor(private storefrontsService: StorefrontsService) {}

  @Get(':identifier')
  @Public()
  @CacheControl({ type: 'public', maxAge: 60, staleWhileRevalidate: 30 })
  @ApiOperation({ summary: 'Get public storefront' })
  async getStorefront(@Param('identifier') identifier: string) {
    const storefront = await this.storefrontsService.getPublicStorefront(identifier);
    if (!storefront) {
      throw new NotFoundException('Storefront not found or not published');
    }
    return storefront;
  }

  @Get(':identifier/pages/:slug')
  @Public()
  @CacheControl({ type: 'public', maxAge: 300, staleWhileRevalidate: 60 })
  @ApiOperation({ summary: 'Get public page' })
  async getPage(@Param('identifier') identifier: string, @Param('slug') slug: string) {
    const page = await this.storefrontsService.getPublicPage(identifier, slug);
    if (!page) {
      throw new NotFoundException('Page not found');
    }
    return { page };
  }

  @Get(':identifier/faqs')
  @Public()
  @CacheControl({ type: 'public', maxAge: 300, staleWhileRevalidate: 60 })
  @ApiOperation({ summary: 'Get public FAQs' })
  @ApiQuery({ name: 'category', required: false })
  async getFaqs(@Param('identifier') identifier: string, @Query('category') category?: string) {
    return this.storefrontsService.getPublicFaqs(identifier, category);
  }

  @Get(':identifier/tickets')
  @Public()
  @CacheControl({ type: 'public', maxAge: 60, staleWhileRevalidate: 30 })
  @ApiOperation({ summary: 'Get public ticket types' })
  async getTicketTypes(@Param('identifier') identifier: string) {
    return this.storefrontsService.getPublicTicketTypes(identifier);
  }
}
