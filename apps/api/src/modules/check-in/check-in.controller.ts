import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UseGuards,
  HttpCode,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CheckInService } from './check-in.service.js';
import { StationsService } from './stations.service.js';
import {
  ScanCheckInDto,
  LookupDto,
  RecordWaiverDto,
  WalkUpSaleDto,
  ListCheckInsQueryDto,
  GetStatsQueryDto,
  GetQueueQueryDto,
} from './dto/check-in.dto.js';
import { CreateStationDto, UpdateStationDto } from './dto/station.dto.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { FeatureGuard } from '../../core/features/guards/feature.guard.js';
import { Feature } from '../../core/features/decorators/feature.decorator.js';
import type { FastifyRequest } from 'fastify';

@ApiTags('Check-In')
@Controller('organizations/:orgId/attractions/:attractionId/check-in')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
@UseGuards(FeatureGuard)
@Feature('checkin')
export class CheckInController {
  constructor(
    private checkInService: CheckInService,
    private stationsService: StationsService,
  ) {}

  // ============== Check-In Operations ==============

  @Post('scan')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'scanner')
  @ApiOperation({ summary: 'Scan and check in a ticket' })
  async scanCheckIn(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: ScanCheckInDto,
  ) {
    return this.checkInService.scanCheckIn(ctx.orgId, attractionId, ctx.userId, dto);
  }

  @Post('lookup')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'scanner')
  @ApiOperation({ summary: 'Look up tickets by email, phone, order number, etc.' })
  async lookup(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: LookupDto,
  ) {
    return this.checkInService.lookup(ctx.orgId, attractionId, dto);
  }

  @Post('waiver')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'scanner')
  @ApiOperation({ summary: 'Record waiver signature' })
  async recordWaiver(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: RecordWaiverDto,
    @Req() req: FastifyRequest,
  ) {
    const ipAddress = req.ip || req.headers['x-forwarded-for']?.toString();
    const userAgent = req.headers['user-agent'];
    return this.checkInService.recordWaiver(ctx.orgId, attractionId, dto, ipAddress, userAgent);
  }

  @Get('capacity')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'scanner')
  @ApiOperation({ summary: 'Get current capacity' })
  async getCapacity(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
  ) {
    return this.checkInService.getCapacity(ctx.orgId, attractionId);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'finance')
  @ApiOperation({ summary: 'Get check-in stats' })
  async getStats(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Query() query: GetStatsQueryDto,
  ) {
    return this.checkInService.getStats(ctx.orgId, attractionId, query);
  }

  @Get('queue')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'scanner')
  @ApiOperation({ summary: 'Get check-in queue (pending arrivals)' })
  async getQueue(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Query() query: GetQueueQueryDto,
  ) {
    return this.checkInService.getQueue(ctx.orgId, attractionId, query);
  }

  @Post('walk-up')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office')
  @ApiOperation({ summary: 'Create walk-up ticket and check in immediately' })
  async walkUpSale(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: WalkUpSaleDto,
  ) {
    return this.checkInService.walkUpSale(ctx.orgId, attractionId, ctx.userId, dto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'finance')
  @ApiOperation({ summary: 'List check-ins' })
  async listCheckIns(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Query() query: ListCheckInsQueryDto,
  ) {
    return this.checkInService.listCheckIns(ctx.orgId, attractionId, query);
  }

  // ============== Station Management ==============

  @Get('stations')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'scanner')
  @ApiOperation({ summary: 'List check-in stations' })
  async listStations(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
  ) {
    return this.stationsService.listStations(ctx.orgId, attractionId);
  }

  @Get('stations/:stationId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'scanner')
  @ApiOperation({ summary: 'Get a single station' })
  async getStation(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Param('stationId') stationId: string,
  ) {
    return this.stationsService.getStation(ctx.orgId, attractionId, stationId);
  }

  @Post('stations')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Create a check-in station' })
  async createStation(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: CreateStationDto,
  ) {
    return this.stationsService.createStation(ctx.orgId, attractionId, dto);
  }

  @Patch('stations/:stationId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Update a check-in station' })
  async updateStation(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Param('stationId') stationId: string,
    @Body() dto: UpdateStationDto,
  ) {
    return this.stationsService.updateStation(ctx.orgId, attractionId, stationId, dto);
  }

  @Delete('stations/:stationId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Delete a check-in station' })
  async deleteStation(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Param('stationId') stationId: string,
  ) {
    return this.stationsService.deleteStation(ctx.orgId, attractionId, stationId);
  }
}
