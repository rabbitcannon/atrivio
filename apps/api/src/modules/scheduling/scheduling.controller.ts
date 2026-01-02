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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SchedulingService } from './scheduling.service.js';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  ListSchedulesQueryDto,
  PublishSchedulesDto,
} from './dto/schedule.dto.js';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../../core/auth/auth.service.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import type { UserId } from '@haunt/shared';

@ApiTags('Scheduling')
@Controller('organizations/:orgId')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
export class SchedulingController {
  constructor(private schedulingService: SchedulingService) {}

  // ============== Schedule CRUD ==============

  @Get('attractions/:attractionId/schedules')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'List schedules for an attraction' })
  async listSchedules(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Query() query: ListSchedulesQueryDto,
  ) {
    return this.schedulingService.listSchedules(
      ctx.orgId,
      attractionId,
      query,
    );
  }

  @Get('schedules/:scheduleId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Get a single schedule' })
  async getSchedule(
    @Tenant() ctx: TenantContext,
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.schedulingService.getSchedule(ctx.orgId, scheduleId);
  }

  @Post('attractions/:attractionId/schedules')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Create a schedule' })
  async createSchedule(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: CreateScheduleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.schedulingService.createSchedule(
      ctx.orgId,
      { ...dto, attractionId },
      user.id as UserId,
    );
  }

  @Patch('schedules/:scheduleId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Update a schedule' })
  async updateSchedule(
    @Tenant() ctx: TenantContext,
    @Param('scheduleId') scheduleId: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.schedulingService.updateSchedule(ctx.orgId, scheduleId, dto);
  }

  @Delete('schedules/:scheduleId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Delete a schedule' })
  async deleteSchedule(
    @Tenant() ctx: TenantContext,
    @Param('scheduleId') scheduleId: string,
  ) {
    return this.schedulingService.deleteSchedule(ctx.orgId, scheduleId);
  }

  // ============== Publishing ==============

  @Post('attractions/:attractionId/schedules/publish')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Publish schedules within a date range' })
  async publishSchedules(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: PublishSchedulesDto,
  ) {
    return this.schedulingService.publishSchedules(
      ctx.orgId,
      attractionId,
      dto,
    );
  }

  // ============== Staff Self-Service ==============

  @Get('my-schedules')
  @ApiOperation({ summary: 'Get my upcoming schedules (staff self-service)' })
  async getMySchedules(
    @Tenant() ctx: TenantContext,
    @CurrentUser() user: AuthUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.schedulingService.getMySchedules(
      ctx.orgId,
      user.id as UserId,
      startDate,
      endDate,
    );
  }

  // ============== Utilities ==============

  @Get('schedule-roles')
  @ApiOperation({ summary: 'Get schedule roles for this org' })
  async listRoles(@Tenant() ctx: TenantContext) {
    return this.schedulingService.listRoles(ctx.orgId);
  }

  @Get('attractions/:attractionId/schedules/unassigned')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Get unassigned shifts for an attraction' })
  async getUnassignedShifts(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.schedulingService.getUnassignedShifts(
      ctx.orgId,
      attractionId,
      startDate,
      endDate,
    );
  }

  @Get('attractions/:attractionId/schedules/conflicts')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Detect scheduling conflicts within a date range' })
  async detectConflicts(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.schedulingService.detectConflicts(
      ctx.orgId,
      attractionId,
      startDate,
      endDate,
    );
  }
}
