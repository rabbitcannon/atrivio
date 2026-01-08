import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../core/auth/decorators/public.decorator.js';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import { AttractionsService } from './attractions.service.js';
import type { CreateAttractionDto, UpdateAttractionDto } from './dto/attractions.dto.js';

@ApiTags('Attractions')
@Controller()
@ApiBearerAuth()
export class AttractionsController {
  constructor(private attractionsService: AttractionsService) {}

  // Organization-scoped endpoints

  @Post('organizations/:orgId/attractions')
  @UseInterceptors(TenantInterceptor)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Create attraction' })
  async create(@Tenant() ctx: TenantContext, @Body() dto: CreateAttractionDto) {
    return this.attractionsService.create(ctx.orgId, dto);
  }

  @Get('organizations/:orgId/attractions')
  @UseInterceptors(TenantInterceptor)
  @ApiOperation({ summary: 'List attractions' })
  async list(
    @Tenant() ctx: TenantContext,
    @Query('status') status?: string,
    @Query('type') type?: string
  ) {
    return this.attractionsService.findAll(ctx.orgId, {
      ...(status !== undefined && { status }),
      ...(type !== undefined && { type }),
    });
  }

  @Get('organizations/:orgId/attractions/:attractionId')
  @UseInterceptors(TenantInterceptor)
  @ApiOperation({ summary: 'Get attraction details' })
  async findOne(@Tenant() ctx: TenantContext, @Param('attractionId') attractionId: string) {
    return this.attractionsService.findById(ctx.orgId, attractionId);
  }

  @Patch('organizations/:orgId/attractions/:attractionId')
  @UseInterceptors(TenantInterceptor)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Update attraction' })
  async update(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: UpdateAttractionDto
  ) {
    return this.attractionsService.update(ctx.orgId, attractionId, dto);
  }

  @Delete('organizations/:orgId/attractions/:attractionId')
  @UseInterceptors(TenantInterceptor)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Archive attraction' })
  async archive(@Tenant() ctx: TenantContext, @Param('attractionId') attractionId: string) {
    return this.attractionsService.archive(ctx.orgId, attractionId);
  }

  @Post('organizations/:orgId/attractions/:attractionId/publish')
  @UseInterceptors(TenantInterceptor)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Publish attraction' })
  async publish(@Tenant() ctx: TenantContext, @Param('attractionId') attractionId: string) {
    return this.attractionsService.publish(ctx.orgId, attractionId);
  }

  @Post('organizations/:orgId/attractions/:attractionId/activate')
  @UseInterceptors(TenantInterceptor)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Activate attraction (enable ticket sales)' })
  async activate(@Tenant() ctx: TenantContext, @Param('attractionId') attractionId: string) {
    return this.attractionsService.activate(ctx.orgId, attractionId);
  }

  // Public endpoints

  @Public()
  @Get('attractions')
  @ApiOperation({ summary: 'Search public attractions' })
  async searchPublic(
    @Query('type') type?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
    @Query('radius') radius?: number
  ) {
    return this.attractionsService.searchPublic({
      ...(type !== undefined && { type }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(lat !== undefined && { lat }),
      ...(lng !== undefined && { lng }),
      ...(radius !== undefined && { radius }),
    });
  }

  @Public()
  @Get('attractions/:slug')
  @ApiOperation({ summary: 'Get public attraction by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.attractionsService.findBySlug(slug);
  }
}
