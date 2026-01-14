import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Feature } from '../../core/features/decorators/feature.decorator.js';
import { FeatureGuard } from '../../core/features/guards/feature.guard.js';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import { AnalyticsService } from './analytics.service.js';
import type { AnalyticsQueryDto, TicketAnalyticsQueryDto } from './dto/analytics-query.dto.js';

@ApiTags('Analytics')
@Controller('organizations/:orgId/analytics')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
@UseGuards(FeatureGuard)
@Feature('analytics_pro')
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  /**
   * Get dashboard overview with summary metrics, charts, and optional period comparison
   */
  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'finance')
  @ApiOperation({
    summary: 'Get analytics dashboard',
    description: 'Returns overview metrics including revenue, orders, tickets sold, and check-in rate with time series data for charts',
  })
  async getDashboard(@Tenant() ctx: TenantContext, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getDashboard(ctx.orgId, query);
  }

  /**
   * Get detailed revenue breakdown by attraction, ticket type, and time
   */
  @Get('revenue')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'finance')
  @ApiOperation({
    summary: 'Get revenue analytics',
    description: 'Returns detailed revenue breakdown including gross/net revenue, refunds, discounts, and breakdowns by attraction and ticket type',
  })
  async getRevenue(@Tenant() ctx: TenantContext, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getRevenue(ctx.orgId, query);
  }

  /**
   * Get attendance and check-in metrics
   */
  @Get('attendance')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({
    summary: 'Get attendance analytics',
    description: 'Returns attendance metrics including check-in counts, rates, peak times, and breakdown by attraction',
  })
  async getAttendance(@Tenant() ctx: TenantContext, @Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getAttendance(ctx.orgId, query);
  }

  /**
   * Get ticket type performance metrics
   */
  @Get('tickets')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({
    summary: 'Get ticket analytics',
    description: 'Returns ticket type performance including sales, revenue, check-in rates per ticket type',
  })
  async getTickets(@Tenant() ctx: TenantContext, @Query() query: TicketAnalyticsQueryDto) {
    return this.analyticsService.getTickets(ctx.orgId, query);
  }
}
