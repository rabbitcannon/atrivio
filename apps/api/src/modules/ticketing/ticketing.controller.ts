import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Feature } from '../../core/features/decorators/feature.decorator.js';
import { FeatureGuard } from '../../core/features/guards/feature.guard.js';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import type {
  CreatePromoCodeDto,
  ListPromoCodesQueryDto,
  UpdatePromoCodeDto,
  ValidatePromoCodeDto,
} from './dto/promo-code.dto.js';
import type {
  CreateTicketTypeDto,
  ListTicketTypesQueryDto,
  UpdateTicketTypeDto,
} from './dto/ticket-type.dto.js';
import type {
  BulkCreateTimeSlotsDto,
  CreateTimeSlotDto,
  ListTimeSlotsQueryDto,
  UpdateTimeSlotDto,
} from './dto/time-slot.dto.js';
import { TicketingService } from './ticketing.service.js';

@ApiTags('Ticketing')
@Controller('organizations/:orgId')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
@UseGuards(FeatureGuard)
@Feature('ticketing')
export class TicketingController {
  constructor(private ticketingService: TicketingService) {}

  // ============== Categories ==============

  @Get('ticket-categories')
  @ApiOperation({ summary: 'List ticket categories' })
  async listCategories(@Tenant() ctx: TenantContext) {
    return this.ticketingService.listCategories(ctx.orgId);
  }

  // ============== Ticket Types ==============

  @Get('ticket-types')
  @ApiOperation({ summary: 'List ticket types' })
  async listTicketTypes(@Tenant() ctx: TenantContext, @Query() query: ListTicketTypesQueryDto) {
    return this.ticketingService.listTicketTypes(ctx.orgId, query);
  }

  @Get('ticket-types/:ticketTypeId')
  @ApiOperation({ summary: 'Get a single ticket type' })
  async getTicketType(@Tenant() ctx: TenantContext, @Param('ticketTypeId') ticketTypeId: string) {
    return this.ticketingService.getTicketType(ctx.orgId, ticketTypeId);
  }

  @Post('ticket-types')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office')
  @ApiOperation({ summary: 'Create a ticket type' })
  async createTicketType(@Tenant() ctx: TenantContext, @Body() dto: CreateTicketTypeDto) {
    return this.ticketingService.createTicketType(ctx.orgId, dto);
  }

  @Patch('ticket-types/:ticketTypeId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office')
  @ApiOperation({ summary: 'Update a ticket type' })
  async updateTicketType(
    @Tenant() ctx: TenantContext,
    @Param('ticketTypeId') ticketTypeId: string,
    @Body() dto: UpdateTicketTypeDto
  ) {
    return this.ticketingService.updateTicketType(ctx.orgId, ticketTypeId, dto);
  }

  @Delete('ticket-types/:ticketTypeId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Delete a ticket type' })
  async deleteTicketType(
    @Tenant() ctx: TenantContext,
    @Param('ticketTypeId') ticketTypeId: string
  ) {
    return this.ticketingService.deleteTicketType(ctx.orgId, ticketTypeId);
  }

  // ============== Time Slots ==============

  @Get('time-slots')
  @ApiOperation({ summary: 'List time slots' })
  async listTimeSlots(@Tenant() ctx: TenantContext, @Query() query: ListTimeSlotsQueryDto) {
    return this.ticketingService.listTimeSlots(ctx.orgId, query);
  }

  @Get('time-slots/:timeSlotId')
  @ApiOperation({ summary: 'Get a single time slot' })
  async getTimeSlot(@Tenant() ctx: TenantContext, @Param('timeSlotId') timeSlotId: string) {
    return this.ticketingService.getTimeSlot(ctx.orgId, timeSlotId);
  }

  @Post('time-slots')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office')
  @ApiOperation({ summary: 'Create a time slot' })
  async createTimeSlot(@Tenant() ctx: TenantContext, @Body() dto: CreateTimeSlotDto) {
    return this.ticketingService.createTimeSlot(ctx.orgId, dto);
  }

  @Post('time-slots/bulk')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Bulk create time slots' })
  async bulkCreateTimeSlots(@Tenant() ctx: TenantContext, @Body() dto: BulkCreateTimeSlotsDto) {
    return this.ticketingService.bulkCreateTimeSlots(ctx.orgId, dto);
  }

  @Patch('time-slots/:timeSlotId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office')
  @ApiOperation({ summary: 'Update a time slot' })
  async updateTimeSlot(
    @Tenant() ctx: TenantContext,
    @Param('timeSlotId') timeSlotId: string,
    @Body() dto: UpdateTimeSlotDto
  ) {
    return this.ticketingService.updateTimeSlot(ctx.orgId, timeSlotId, dto);
  }

  @Delete('time-slots/:timeSlotId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Delete a time slot' })
  async deleteTimeSlot(@Tenant() ctx: TenantContext, @Param('timeSlotId') timeSlotId: string) {
    return this.ticketingService.deleteTimeSlot(ctx.orgId, timeSlotId);
  }

  // ============== Promo Codes ==============

  @Get('promo-codes')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'finance')
  @ApiOperation({ summary: 'List promo codes' })
  async listPromoCodes(@Tenant() ctx: TenantContext, @Query() query: ListPromoCodesQueryDto) {
    return this.ticketingService.listPromoCodes(ctx.orgId, query);
  }

  @Get('promo-codes/:promoCodeId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'finance')
  @ApiOperation({ summary: 'Get a single promo code' })
  async getPromoCode(@Tenant() ctx: TenantContext, @Param('promoCodeId') promoCodeId: string) {
    return this.ticketingService.getPromoCode(ctx.orgId, promoCodeId);
  }

  @Post('promo-codes')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Create a promo code' })
  async createPromoCode(@Tenant() ctx: TenantContext, @Body() dto: CreatePromoCodeDto) {
    return this.ticketingService.createPromoCode(ctx.orgId, ctx.userId, dto);
  }

  @Patch('promo-codes/:promoCodeId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Update a promo code' })
  async updatePromoCode(
    @Tenant() ctx: TenantContext,
    @Param('promoCodeId') promoCodeId: string,
    @Body() dto: UpdatePromoCodeDto
  ) {
    return this.ticketingService.updatePromoCode(ctx.orgId, promoCodeId, dto);
  }

  @Delete('promo-codes/:promoCodeId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Delete a promo code' })
  async deletePromoCode(@Tenant() ctx: TenantContext, @Param('promoCodeId') promoCodeId: string) {
    return this.ticketingService.deletePromoCode(ctx.orgId, promoCodeId);
  }

  @Post('promo-codes/validate')
  @HttpCode(200)
  @ApiOperation({ summary: 'Validate a promo code' })
  async validatePromoCode(@Tenant() ctx: TenantContext, @Body() dto: ValidatePromoCodeDto) {
    return this.ticketingService.validatePromoCode(ctx.orgId, dto);
  }

  // ============== Order Sources ==============

  @Get('order-sources')
  @ApiOperation({ summary: 'List order sources' })
  async listOrderSources(@Tenant() ctx: TenantContext) {
    return this.ticketingService.listOrderSources(ctx.orgId);
  }
}
