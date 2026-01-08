import type { UserId } from '@atrivio/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator.js';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import type { AddSkillDto } from './dto/skills.dto.js';
import { SkillsService } from './skills.service.js';

@ApiTags('Staff Skills')
@Controller('organizations/:orgId/staff/:staffId/skills')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
export class SkillsController {
  constructor(private skillsService: SkillsService) {}

  @Get()
  @ApiOperation({ summary: 'Get staff skills' })
  async list(@Tenant() ctx: TenantContext, @Param('staffId') staffId: string) {
    return this.skillsService.findAll(ctx.orgId, staffId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Add or update skill' })
  async add(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Body() dto: AddSkillDto,
    @CurrentUser('id') userId: UserId
  ) {
    return this.skillsService.add(ctx.orgId, staffId, dto, userId);
  }

  @Delete(':skillId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Remove skill' })
  async delete(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Param('skillId') skillId: string
  ) {
    return this.skillsService.delete(ctx.orgId, staffId, skillId);
  }
}
