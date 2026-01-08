import type { UserId } from '@atrivio/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../../core/auth/auth.service.js';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator.js';
import { Public } from '../../core/auth/decorators/public.decorator.js';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import type { CreateOrgDto, UpdateOrgDto } from './dto/organizations.dto.js';
import { OrganizationsService } from './organizations.service.js';

@ApiTags('Organizations')
@Controller('organizations')
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private orgsService: OrganizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  async create(@CurrentUser() user: AuthUser, @Body() dto: CreateOrgDto) {
    return this.orgsService.create(user.id as UserId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List organizations for current user' })
  async list(@CurrentUser() user: AuthUser) {
    return this.orgsService.findByUser(user.id as UserId);
  }

  @Get('by-slug/:slug')
  @Public()
  @ApiOperation({ summary: 'Get organization by slug (for time clock)' })
  async findBySlug(@Param('slug') slug: string) {
    return this.orgsService.findBySlug(slug);
  }

  @Get(':orgId')
  @UseInterceptors(TenantInterceptor)
  @ApiOperation({ summary: 'Get organization details' })
  async findOne(@Tenant() ctx: TenantContext) {
    return this.orgsService.findById(ctx.orgId, ctx.userId);
  }

  @Patch(':orgId')
  @UseInterceptors(TenantInterceptor)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Update organization' })
  async update(@Tenant() ctx: TenantContext, @Body() dto: UpdateOrgDto) {
    return this.orgsService.update(ctx.orgId, dto);
  }

  @Delete(':orgId')
  @UseInterceptors(TenantInterceptor)
  @UseGuards(RolesGuard)
  @Roles('owner')
  @ApiOperation({ summary: 'Delete organization (soft delete)' })
  async delete(@Tenant() ctx: TenantContext) {
    return this.orgsService.delete(ctx.orgId);
  }

  @Post(':orgId/switch')
  @UseInterceptors(TenantInterceptor)
  @ApiOperation({ summary: 'Switch to organization context' })
  async switchOrg(@Tenant() ctx: TenantContext) {
    return {
      message: 'Switched to organization',
      organization: {
        id: ctx.orgId,
        name: ctx.orgName,
        slug: ctx.orgSlug,
      },
      role: ctx.role,
      permissions: ctx.permissions,
    };
  }
}
