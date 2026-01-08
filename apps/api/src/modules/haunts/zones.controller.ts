import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import type { CreateZoneDto, ReorderZonesDto, UpdateZoneDto } from './dto/zones.dto.js';
import { ZonesService } from './zones.service.js';

@ApiTags('Attraction Zones')
@Controller('organizations/:orgId/attractions/:attractionId/zones')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
export class ZonesController {
  constructor(private zonesService: ZonesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Create zone' })
  async create(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: CreateZoneDto
  ) {
    return this.zonesService.create(ctx.orgId, attractionId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List zones' })
  async list(@Tenant() ctx: TenantContext, @Param('attractionId') attractionId: string) {
    return this.zonesService.findAll(ctx.orgId, attractionId);
  }

  @Get(':zoneId')
  @ApiOperation({ summary: 'Get zone details' })
  async findOne(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Param('zoneId') zoneId: string
  ) {
    return this.zonesService.findById(ctx.orgId, attractionId, zoneId);
  }

  @Patch(':zoneId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Update zone' })
  async update(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Param('zoneId') zoneId: string,
    @Body() dto: UpdateZoneDto
  ) {
    return this.zonesService.update(ctx.orgId, attractionId, zoneId, dto);
  }

  @Delete(':zoneId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Delete zone' })
  async delete(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Param('zoneId') zoneId: string
  ) {
    return this.zonesService.delete(ctx.orgId, attractionId, zoneId);
  }

  @Put('reorder')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Reorder zones' })
  async reorder(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: ReorderZonesDto
  ) {
    return this.zonesService.reorder(ctx.orgId, attractionId, dto.zone_ids);
  }
}
