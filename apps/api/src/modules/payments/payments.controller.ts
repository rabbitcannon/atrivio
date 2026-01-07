import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import type {
  CreateDashboardLinkDto,
  CreateOnboardingLinkDto,
  CreateRefundDto,
  ListPayoutsDto,
  ListTransactionsDto,
} from './dto/payments.dto.js';
import { PaymentsService } from './payments.service.js';

@ApiTags('Payments')
@Controller('organizations/:orgId/payments')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  // ============================================================================
  // STRIPE ACCOUNT MANAGEMENT
  // ============================================================================

  @Get('status')
  @ApiOperation({ summary: 'Get Stripe account status for organization' })
  async getAccountStatus(@Tenant() ctx: TenantContext) {
    return this.paymentsService.getAccountStatus(ctx.orgId);
  }

  @Post('connect')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Create Stripe Connect account and start onboarding' })
  async createAccount(@Tenant() ctx: TenantContext, @Body() dto: CreateOnboardingLinkDto) {
    return this.paymentsService.createAccount(ctx.orgId, dto);
  }

  @Post('onboarding-link')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Generate new onboarding link for incomplete setup' })
  async createOnboardingLink(@Tenant() ctx: TenantContext, @Body() dto: CreateOnboardingLinkDto) {
    return this.paymentsService.createOnboardingLink(ctx.orgId, dto);
  }

  @Post('dashboard-link')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'finance')
  @ApiOperation({ summary: 'Generate Stripe Express dashboard login link' })
  async createDashboardLink(@Tenant() ctx: TenantContext, @Body() dto: CreateDashboardLinkDto) {
    return this.paymentsService.createDashboardLink(ctx.orgId, dto);
  }

  @Post('sync')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Sync Stripe account status from Stripe API (bypasses webhooks)' })
  async syncAccountStatus(@Tenant() ctx: TenantContext) {
    return this.paymentsService.syncAccountStatus(ctx.orgId);
  }

  // ============================================================================
  // TRANSACTIONS
  // ============================================================================

  @Get('transactions')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'finance')
  @ApiOperation({ summary: 'List transactions for organization' })
  @ApiQuery({ name: 'start_date', required: false, type: String })
  @ApiQuery({ name: 'end_date', required: false, type: String })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['charge', 'refund', 'transfer', 'payout', 'fee', 'adjustment'],
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'succeeded', 'failed', 'refunded', 'partially_refunded', 'disputed'],
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async listTransactions(@Tenant() ctx: TenantContext, @Query() query: ListTransactionsDto) {
    return this.paymentsService.listTransactions(ctx.orgId, query);
  }

  @Get('transactions/summary')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'finance')
  @ApiOperation({ summary: 'Get transaction summary/totals' })
  @ApiQuery({ name: 'start_date', required: false, type: String })
  @ApiQuery({ name: 'end_date', required: false, type: String })
  async getTransactionSummary(
    @Tenant() ctx: TenantContext,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string
  ) {
    return this.paymentsService.getTransactionSummary(ctx.orgId, startDate, endDate);
  }

  @Post('transactions/sync')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'finance')
  @ApiOperation({ summary: 'Sync transactions from Stripe API (pulls historical charges)' })
  async syncTransactions(@Tenant() ctx: TenantContext) {
    return this.paymentsService.syncTransactions(ctx.orgId);
  }

  @Get('transactions/:transactionId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'finance')
  @ApiOperation({ summary: 'Get single transaction details' })
  async getTransaction(
    @Tenant() ctx: TenantContext,
    @Param('transactionId') transactionId: string
  ) {
    return this.paymentsService.getTransaction(ctx.orgId, transactionId);
  }

  @Post('refunds')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'finance')
  @ApiOperation({ summary: 'Create a refund for a transaction' })
  async createRefund(@Tenant() ctx: TenantContext, @Body() dto: CreateRefundDto) {
    return this.paymentsService.createRefund(ctx.orgId, dto);
  }

  // ============================================================================
  // PAYOUTS
  // ============================================================================

  @Get('payouts')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'finance')
  @ApiOperation({ summary: 'List payouts for organization' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['pending', 'in_transit', 'paid', 'failed', 'canceled'],
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async listPayouts(@Tenant() ctx: TenantContext, @Query() query: ListPayoutsDto) {
    return this.paymentsService.listPayouts(ctx.orgId, query);
  }
}
