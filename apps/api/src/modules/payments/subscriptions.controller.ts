import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import { SubscriptionsService } from './subscriptions.service.js';

interface CreateCheckoutDto {
  tier: 'pro' | 'enterprise';
  successUrl: string;
  cancelUrl: string;
}

interface CreateBillingPortalDto {
  returnUrl: string;
}

@ApiTags('Subscriptions')
@Controller('organizations/:orgId/subscription')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get subscription info for organization' })
  async getSubscription(@Tenant() ctx: TenantContext) {
    return this.subscriptionsService.getSubscription(ctx.orgId);
  }

  @Get('limits')
  @ApiOperation({ summary: 'Get current tier limits and usage for organization' })
  async getTierLimitsAndUsage(@Tenant() ctx: TenantContext) {
    return this.subscriptionsService.getSubscriptionWithUsage(ctx.orgId);
  }

  @Post('checkout')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Create Stripe checkout session for subscription upgrade' })
  async createCheckoutSession(@Tenant() ctx: TenantContext, @Body() dto: CreateCheckoutDto) {
    return this.subscriptionsService.createCheckoutSession(
      ctx.orgId,
      dto.tier,
      dto.successUrl,
      dto.cancelUrl
    );
  }

  @Post('billing-portal')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'finance')
  @ApiOperation({ summary: 'Create Stripe billing portal session for subscription management' })
  async createBillingPortalSession(
    @Tenant() ctx: TenantContext,
    @Body() dto: CreateBillingPortalDto
  ) {
    return this.subscriptionsService.createBillingPortalSession(ctx.orgId, dto.returnUrl);
  }
}
