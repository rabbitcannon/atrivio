import type { UserId } from '@atrivio/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../../core/auth/auth.service.js';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator.js';
import { Feature } from '../../core/features/decorators/feature.decorator.js';
import { FeatureGuard } from '../../core/features/guards/feature.guard.js';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import { AvailabilityService } from './availability.service.js';
import type {
  CreateAvailabilityDto,
  RequestTimeOffDto,
  SetRecurringAvailabilityDto,
  UpdateAvailabilityDto,
} from './dto/availability.dto.js';

@ApiTags('Scheduling - Availability')
@Controller('organizations/:orgId')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
@UseGuards(FeatureGuard)
@Feature('scheduling')
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  // ============== Staff Availability ==============

  @Get('staff/:staffId/availability')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Get staff availability' })
  async getStaffAvailability(@Tenant() ctx: TenantContext, @Param('staffId') staffId: string) {
    return this.availabilityService.getStaffAvailability(ctx.orgId, staffId);
  }

  @Post('staff/:staffId/availability')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Add a single availability entry' })
  async createAvailability(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Body() dto: CreateAvailabilityDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.availabilityService.createAvailability(ctx.orgId, staffId, dto, user.id as UserId);
  }

  @Put('staff/:staffId/availability')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Set recurring weekly availability (replaces existing)' })
  async setRecurringAvailability(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Body() dto: SetRecurringAvailabilityDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.availabilityService.setRecurringAvailability(
      ctx.orgId,
      staffId,
      dto,
      user.id as UserId
    );
  }

  @Patch('availability/:availabilityId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Update an availability entry' })
  async updateAvailability(
    @Tenant() ctx: TenantContext,
    @Param('availabilityId') availabilityId: string,
    @Body() dto: UpdateAvailabilityDto
  ) {
    return this.availabilityService.updateAvailability(ctx.orgId, availabilityId, dto);
  }

  @Delete('availability/:availabilityId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Delete an availability entry' })
  async deleteAvailability(
    @Tenant() ctx: TenantContext,
    @Param('availabilityId') availabilityId: string
  ) {
    return this.availabilityService.deleteAvailability(ctx.orgId, availabilityId);
  }

  // ============== Time Off Requests ==============

  @Post('staff/:staffId/time-off')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Request time off for a staff member' })
  async requestTimeOff(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Body() dto: RequestTimeOffDto,
    @CurrentUser() user: AuthUser
  ) {
    return this.availabilityService.requestTimeOff(ctx.orgId, staffId, dto, user.id as UserId);
  }

  @Post('time-off/:requestId/approve')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Approve a time off request' })
  async approveTimeOff(
    @Tenant() ctx: TenantContext,
    @Param('requestId') requestId: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.availabilityService.approveTimeOff(ctx.orgId, requestId, user.id as UserId);
  }

  // ============== Availability Check ==============

  @Get('staff/:staffId/availability/check')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Check if staff is available for a specific time' })
  async checkAvailability(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Query('date') date: string,
    @Query('startTime') startTime: string,
    @Query('endTime') endTime: string
  ) {
    return this.availabilityService.checkAvailabilityForDate(
      ctx.orgId,
      staffId,
      date,
      startTime,
      endTime
    );
  }

  // ============== Self-Service ==============

  @Get('my-availability')
  @ApiOperation({ summary: 'Get my availability (staff self-service)' })
  async getMyAvailability(@Tenant() ctx: TenantContext, @CurrentUser() user: AuthUser) {
    // Get user's staff_id first
    const staffId = await this.getStaffIdForUser(ctx.orgId as string, user.id as UserId);
    return this.availabilityService.getStaffAvailability(ctx.orgId, staffId);
  }

  @Put('my-availability')
  @ApiOperation({ summary: 'Set my weekly availability (staff self-service)' })
  async setMyAvailability(
    @Tenant() ctx: TenantContext,
    @Body() dto: SetRecurringAvailabilityDto,
    @CurrentUser() user: AuthUser
  ) {
    const staffId = await this.getStaffIdForUser(ctx.orgId as string, user.id as UserId);
    return this.availabilityService.setRecurringAvailability(
      ctx.orgId,
      staffId,
      dto,
      user.id as UserId
    );
  }

  @Post('my-time-off')
  @ApiOperation({ summary: 'Request time off for myself (staff self-service)' })
  async requestMyTimeOff(
    @Tenant() ctx: TenantContext,
    @Body() dto: RequestTimeOffDto,
    @CurrentUser() user: AuthUser
  ) {
    const staffId = await this.getStaffIdForUser(ctx.orgId as string, user.id as UserId);
    return this.availabilityService.requestTimeOff(ctx.orgId, staffId, dto, user.id as UserId);
  }

  // Helper to resolve user to staff_id
  private async getStaffIdForUser(_orgId: string, userId: UserId): Promise<string> {
    // This will be used across self-service endpoints
    // For now, we'll rely on the service layer to handle this
    // A proper implementation would query the database
    return userId as string; // Placeholder - service layer handles resolution
  }
}
