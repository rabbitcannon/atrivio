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
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import {
  CreateOrderDto,
  UpdateOrderDto,
  ListOrdersQueryDto,
  UpdateTicketStatusDto,
  RefundOrderDto,
  CartSessionDto,
  CheckoutDto,
  ValidateTicketDto,
} from './dto/order.dto.js';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../../core/auth/auth.service.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import type { UserId } from '@haunt/shared';

@ApiTags('Orders')
@Controller('organizations/:orgId')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  // ============== Orders ==============

  @Get('orders')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'finance')
  @ApiOperation({ summary: 'List orders' })
  async listOrders(
    @Tenant() ctx: TenantContext,
    @Query() query: ListOrdersQueryDto,
  ) {
    return this.ordersService.listOrders(ctx.orgId, query);
  }

  @Get('orders/:orderId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'finance')
  @ApiOperation({ summary: 'Get a single order' })
  async getOrder(
    @Tenant() ctx: TenantContext,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.getOrder(ctx.orgId, orderId);
  }

  @Get('orders/number/:orderNumber')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'finance')
  @ApiOperation({ summary: 'Get order by order number' })
  async getOrderByNumber(
    @Tenant() ctx: TenantContext,
    @Param('orderNumber') orderNumber: string,
  ) {
    return this.ordersService.getOrderByNumber(ctx.orgId, orderNumber);
  }

  @Post('orders')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office')
  @ApiOperation({ summary: 'Create an order (box office)' })
  async createOrder(
    @Tenant() ctx: TenantContext,
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.createOrder(ctx.orgId, dto, user.id as UserId);
  }

  @Patch('orders/:orderId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office')
  @ApiOperation({ summary: 'Update an order' })
  async updateOrder(
    @Tenant() ctx: TenantContext,
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.ordersService.updateOrder(ctx.orgId, orderId, dto);
  }

  @Post('orders/:orderId/complete')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office')
  @ApiOperation({ summary: 'Complete an order and generate tickets' })
  async completeOrder(
    @Tenant() ctx: TenantContext,
    @Param('orderId') orderId: string,
  ) {
    return this.ordersService.completeOrder(ctx.orgId, orderId);
  }

  @Post('orders/:orderId/cancel')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office')
  @ApiOperation({ summary: 'Cancel an order' })
  async cancelOrder(
    @Tenant() ctx: TenantContext,
    @Param('orderId') orderId: string,
    @Body('reason') reason?: string,
  ) {
    return this.ordersService.cancelOrder(ctx.orgId, orderId, reason);
  }

  @Post('orders/:orderId/refund')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'finance')
  @ApiOperation({ summary: 'Refund an order' })
  async refundOrder(
    @Tenant() ctx: TenantContext,
    @Param('orderId') orderId: string,
    @Body() dto: RefundOrderDto,
  ) {
    return this.ordersService.refundOrder(ctx.orgId, orderId, dto);
  }

  // ============== Tickets ==============

  @Get('tickets/:ticketId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'scanner')
  @ApiOperation({ summary: 'Get a ticket by ID' })
  async getTicket(
    @Tenant() ctx: TenantContext,
    @Param('ticketId') ticketId: string,
  ) {
    return this.ordersService.getTicket(ctx.orgId, ticketId);
  }

  @Get('tickets/barcode/:barcode')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'scanner')
  @ApiOperation({ summary: 'Get a ticket by barcode' })
  async getTicketByBarcode(
    @Tenant() ctx: TenantContext,
    @Param('barcode') barcode: string,
  ) {
    return this.ordersService.getTicketByBarcode(ctx.orgId, barcode);
  }

  @Patch('tickets/:ticketId/status')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office')
  @ApiOperation({ summary: 'Update ticket status' })
  async updateTicketStatus(
    @Tenant() ctx: TenantContext,
    @Param('ticketId') ticketId: string,
    @Body() dto: UpdateTicketStatusDto,
  ) {
    return this.ordersService.updateTicketStatus(ctx.orgId, ticketId, dto);
  }

  @Post('tickets/validate')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'scanner')
  @ApiOperation({ summary: 'Validate a ticket (check if valid without marking as used)' })
  async validateTicket(
    @Tenant() ctx: TenantContext,
    @Body() dto: ValidateTicketDto,
  ) {
    return this.ordersService.validateTicket(ctx.orgId, dto.barcode);
  }

  @Post('tickets/scan')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'scanner')
  @ApiOperation({ summary: 'Scan a ticket (validate and mark as used)' })
  async scanTicket(
    @Tenant() ctx: TenantContext,
    @Body() dto: ValidateTicketDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.ordersService.scanTicket(ctx.orgId, dto.barcode, user.id as UserId);
  }

  // ============== Cart Sessions ==============

  @Post('cart')
  @ApiOperation({ summary: 'Create or update a cart session' })
  async upsertCart(
    @Tenant() ctx: TenantContext,
    @Body() dto: CartSessionDto,
    @Query('sessionId') sessionId?: string,
  ) {
    return this.ordersService.upsertCartSession(ctx.orgId, sessionId || null, dto);
  }

  @Get('cart/:sessionId')
  @ApiOperation({ summary: 'Get a cart session' })
  async getCart(
    @Tenant() ctx: TenantContext,
    @Param('sessionId') sessionId: string,
  ) {
    return this.ordersService.getCartSession(ctx.orgId, sessionId);
  }

  @Post('cart/checkout')
  @ApiOperation({ summary: 'Checkout a cart session' })
  async checkout(
    @Tenant() ctx: TenantContext,
    @Body() dto: CheckoutDto,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.ordersService.checkout(ctx.orgId, dto, user?.id as UserId | undefined);
  }
}
