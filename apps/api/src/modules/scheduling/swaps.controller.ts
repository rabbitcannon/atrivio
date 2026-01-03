import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SwapsService } from './swaps.service.js';
import {
  CreateSwapRequestDto,
  ApproveSwapDto,
  RejectSwapDto,
  ListSwapRequestsQueryDto,
} from './dto/swap.dto.js';
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

@ApiTags('Scheduling - Shift Swaps')
@Controller('organizations/:orgId')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
@UseGuards(FeatureGuard)
@Feature('scheduling')
export class SwapsController {
  constructor(private swapsService: SwapsService) {}

  // ============== Swap Requests Management ==============

  @Get('swap-requests')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'List swap requests' })
  async listSwapRequests(
    @Tenant() ctx: TenantContext,
    @Query() query: ListSwapRequestsQueryDto,
  ) {
    return this.swapsService.listSwapRequests(ctx.orgId, query);
  }

  @Get('swap-requests/:swapId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Get a single swap request' })
  async getSwapRequest(
    @Tenant() ctx: TenantContext,
    @Param('swapId') swapId: string,
  ) {
    return this.swapsService.getSwapRequest(ctx.orgId, swapId);
  }

  @Post('swap-requests/:swapId/approve')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Approve a swap request' })
  async approveSwapRequest(
    @Tenant() ctx: TenantContext,
    @Param('swapId') swapId: string,
    @Body() dto: ApproveSwapDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.swapsService.approveSwapRequest(
      ctx.orgId,
      swapId,
      dto,
      user.id as UserId,
    );
  }

  @Post('swap-requests/:swapId/reject')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Reject a swap request' })
  async rejectSwapRequest(
    @Tenant() ctx: TenantContext,
    @Param('swapId') swapId: string,
    @Body() dto: RejectSwapDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.swapsService.rejectSwapRequest(
      ctx.orgId,
      swapId,
      dto,
      user.id as UserId,
    );
  }

  // ============== Staff Self-Service ==============

  @Post('schedules/:scheduleId/swap-request')
  @ApiOperation({ summary: 'Request a swap/drop/pickup for a schedule (staff self-service)' })
  async createSwapRequest(
    @Tenant() ctx: TenantContext,
    @Param('scheduleId') scheduleId: string,
    @Body() dto: CreateSwapRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.swapsService.createSwapRequest(
      ctx.orgId,
      scheduleId,
      dto,
      user.id as UserId,
    );
  }

  @Post('swap-requests/:swapId/cancel')
  @ApiOperation({ summary: 'Cancel my swap request (staff self-service)' })
  async cancelSwapRequest(
    @Tenant() ctx: TenantContext,
    @Param('swapId') swapId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.swapsService.cancelSwapRequest(ctx.orgId, swapId, user.id as UserId);
  }

  @Get('my-swap-requests')
  @ApiOperation({ summary: 'Get my swap requests (staff self-service)' })
  async getMySwapRequests(
    @Tenant() ctx: TenantContext,
    @CurrentUser() user: AuthUser,
    @Query('status') status?: string,
  ) {
    const query: ListSwapRequestsQueryDto = {
      requestingUserId: user.id, // Service will resolve to staff_id
    };
    if (status) {
      query.status = status as 'pending' | 'approved' | 'rejected' | 'canceled' | 'expired';
    }
    return this.swapsService.listSwapRequests(ctx.orgId, query);
  }
}
