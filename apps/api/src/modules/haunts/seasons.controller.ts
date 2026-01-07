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
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import type { CreateSeasonDto, UpdateSeasonDto } from './dto/seasons.dto.js';
import { SeasonsService } from './seasons.service.js';

@ApiTags('Attraction Seasons')
@Controller('organizations/:orgId/attractions/:attractionId/seasons')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
export class SeasonsController {
  constructor(private seasonsService: SeasonsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Create season' })
  async create(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: CreateSeasonDto
  ) {
    return this.seasonsService.create(ctx.orgId, attractionId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List seasons' })
  async list(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Query('year') year?: number,
    @Query('status') status?: string
  ) {
    return this.seasonsService.findAll(ctx.orgId, attractionId, {
      ...(year !== undefined && { year }),
      ...(status !== undefined && { status }),
    });
  }

  @Get(':seasonId')
  @ApiOperation({ summary: 'Get season details' })
  async findOne(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Param('seasonId') seasonId: string
  ) {
    return this.seasonsService.findById(ctx.orgId, attractionId, seasonId);
  }

  @Patch(':seasonId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Update season' })
  async update(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Param('seasonId') seasonId: string,
    @Body() dto: UpdateSeasonDto
  ) {
    return this.seasonsService.update(ctx.orgId, attractionId, seasonId, dto);
  }

  @Delete(':seasonId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Delete season' })
  async delete(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Param('seasonId') seasonId: string
  ) {
    return this.seasonsService.delete(ctx.orgId, attractionId, seasonId);
  }
}
