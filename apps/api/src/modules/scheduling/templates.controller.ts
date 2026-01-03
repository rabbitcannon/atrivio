import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TemplatesService } from './templates.service.js';
import {
  CreateShiftTemplateDto,
  UpdateShiftTemplateDto,
  GenerateFromTemplatesDto,
} from './dto/template.dto.js';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../../core/auth/auth.service.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { FeatureGuard } from '../../core/features/guards/feature.guard.js';
import { Feature } from '../../core/features/decorators/feature.decorator.js';
import type { UserId } from '@haunt/shared';

@ApiTags('Scheduling - Templates')
@Controller('organizations/:orgId')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
@UseGuards(FeatureGuard)
@Feature('scheduling')
export class TemplatesController {
  constructor(private templatesService: TemplatesService) {}

  // ============== Shift Templates ==============

  @Get('attractions/:attractionId/shift-templates')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'List shift templates for an attraction' })
  async listTemplates(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
  ) {
    return this.templatesService.listTemplates(ctx.orgId, attractionId);
  }

  @Get('shift-templates/:templateId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Get a single shift template' })
  async getTemplate(
    @Tenant() ctx: TenantContext,
    @Param('templateId') templateId: string,
  ) {
    return this.templatesService.getTemplate(ctx.orgId, templateId);
  }

  @Post('attractions/:attractionId/shift-templates')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Create a shift template' })
  async createTemplate(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: CreateShiftTemplateDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.templatesService.createTemplate(
      ctx.orgId,
      { ...dto, attractionId },
      user.id as UserId,
    );
  }

  @Patch('shift-templates/:templateId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Update a shift template' })
  async updateTemplate(
    @Tenant() ctx: TenantContext,
    @Param('templateId') templateId: string,
    @Body() dto: UpdateShiftTemplateDto,
  ) {
    return this.templatesService.updateTemplate(ctx.orgId, templateId, dto);
  }

  @Delete('shift-templates/:templateId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Delete a shift template (soft delete)' })
  async deleteTemplate(
    @Tenant() ctx: TenantContext,
    @Param('templateId') templateId: string,
  ) {
    return this.templatesService.deleteTemplate(ctx.orgId, templateId);
  }

  // ============== Schedule Generation ==============

  @Post('attractions/:attractionId/schedules/generate')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Generate schedules from templates' })
  async generateFromTemplates(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: GenerateFromTemplatesDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.templatesService.generateFromTemplates(
      ctx.orgId,
      attractionId,
      dto,
      user.id as UserId,
    );
  }
}
