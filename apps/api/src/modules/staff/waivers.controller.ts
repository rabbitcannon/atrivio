import { Body, Controller, Get, Param, Post, Query, Req, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import type { SignWaiverDto } from './dto/waivers.dto.js';
import { WaiversService } from './waivers.service.js';

@ApiTags('Staff Waivers')
@Controller('organizations/:orgId/staff/:staffId/waivers')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
export class WaiversController {
  constructor(private waiversService: WaiversService) {}

  @Get()
  @ApiOperation({ summary: 'Get staff waivers' })
  async list(@Tenant() ctx: TenantContext, @Param('staffId') staffId: string) {
    return this.waiversService.findAll(ctx.orgId, staffId);
  }

  @Post()
  @ApiOperation({ summary: 'Record signed waiver' })
  async sign(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Body() dto: SignWaiverDto,
    @Req() req: FastifyRequest
  ) {
    const ipAddress = req.ip;
    return this.waiversService.sign(ctx.orgId, staffId, dto, ipAddress);
  }

  @Get('status')
  @ApiOperation({ summary: 'Check waiver status' })
  @ApiQuery({ name: 'type', required: true, description: 'Waiver type to check' })
  async checkStatus(
    @Tenant() ctx: TenantContext,
    @Param('staffId') staffId: string,
    @Query('type') waiverType: string
  ) {
    return this.waiversService.checkWaiverStatus(ctx.orgId, staffId, waiverType);
  }
}
