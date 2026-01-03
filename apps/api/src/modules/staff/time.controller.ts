import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TimeService } from './time.service.js';
import { ClockInDto, ClockOutDto, UpdateTimeEntryDto, BulkApproveDto, TimeQueryDto } from './dto/time.dto.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator.js';
import { FeatureGuard } from '../../core/features/guards/feature.guard.js';
import { Feature } from '../../core/features/decorators/feature.decorator.js';
import type { UserId } from '@haunt/shared';

@ApiTags('Staff Time Entries')
@ApiBearerAuth()
@Controller()
@UseInterceptors(TenantInterceptor)
@UseGuards(FeatureGuard)
@Feature('time_tracking')
export class TimeController {
  constructor(private timeService: TimeService) {}

  // ============================================================================
  // SELF-SERVICE ENDPOINTS (Quick Time Clock)
  // ============================================================================

  @Get('organizations/:orgId/time/my-status')
  @ApiOperation({ summary: 'Get current user time clock status' })
  async getMyStatus(
    @Tenant() ctx: TenantContext,
    @CurrentUser('id') userId: UserId,
  ) {
    return this.timeService.getMyStatus(ctx.orgId, userId);
  }

  @Post('organizations/:orgId/time/clock-in')
  @ApiOperation({ summary: 'Clock in (self-service)' })
  async selfClockIn(
    @Tenant() ctx: TenantContext,
    @CurrentUser('id') userId: UserId,
    @Body() dto: ClockInDto,
  ) {
    return this.timeService.selfClockIn(ctx.orgId, userId, dto);
  }

  @Post('organizations/:orgId/time/clock-out')
  @ApiOperation({ summary: 'Clock out (self-service)' })
  async selfClockOut(
    @Tenant() ctx: TenantContext,
    @CurrentUser('id') userId: UserId,
    @Body() dto: ClockOutDto,
  ) {
    return this.timeService.selfClockOut(ctx.orgId, userId, dto);
  }

  @Get('organizations/:orgId/time/active')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Get currently clocked-in staff (manager view)' })
  async getActiveClockedIn(@Tenant() ctx: TenantContext) {
    return this.timeService.getActiveClockedIn(ctx.orgId);
  }

  // ============================================================================
  // STAFF-SPECIFIC ENDPOINTS (Admin/Manager operations)
  // ============================================================================

  @Post('organizations/:orgId/staff/:staffId/time/clock-in')
  @ApiOperation({ summary: 'Clock in (admin)' })
  async clockIn(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Body() dto: ClockInDto,
  ) {
    return this.timeService.clockIn(ctx.orgId, staffId, dto);
  }

  @Post('organizations/:orgId/staff/:staffId/time/clock-out')
  @ApiOperation({ summary: 'Clock out' })
  async clockOut(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Body() dto: ClockOutDto,
  ) {
    return this.timeService.clockOut(ctx.orgId, staffId, dto);
  }

  @Get('organizations/:orgId/staff/:staffId/time')
  @ApiOperation({ summary: 'Get time entries' })
  async list(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Query() query: TimeQueryDto,
  ) {
    return this.timeService.findAll(ctx.orgId, staffId, query);
  }

  @Patch('organizations/:orgId/time-entries/:entryId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Update time entry' })
  async update(
    @Tenant() ctx: TenantContext,
    @Param('entryId') entryId: string,
    @Body() dto: UpdateTimeEntryDto,
  ) {
    return this.timeService.update(ctx.orgId, entryId, dto);
  }

  @Post('organizations/:orgId/time-entries/:entryId/approve')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Approve time entry' })
  async approve(
    @Tenant() ctx: TenantContext,
    @Param('entryId') entryId: string,
    @CurrentUser('id') userId: UserId,
  ) {
    return this.timeService.approve(ctx.orgId, entryId, userId);
  }

  @Post('organizations/:orgId/time-entries/bulk-approve')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Bulk approve time entries' })
  async bulkApprove(
    @Tenant() ctx: TenantContext,
    @Body() dto: BulkApproveDto,
    @CurrentUser('id') userId: UserId,
  ) {
    return this.timeService.bulkApprove(ctx.orgId, dto.entry_ids, userId);
  }
}
