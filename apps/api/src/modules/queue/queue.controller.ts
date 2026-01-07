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
  CreateQueueConfigDto,
  JoinQueueDto,
  ListQueueEntriesQueryDto,
  UpdateEntryStatusDto,
  UpdateQueueConfigDto,
} from './dto/queue.dto.js';
import { QueueService } from './queue.service.js';

@ApiTags('Virtual Queue')
@Controller('organizations/:orgId/attractions/:attractionId/queue')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
@UseGuards(FeatureGuard)
@Feature('virtual_queue')
export class QueueController {
  constructor(private queueService: QueueService) {}

  // ============== Queue Config ==============

  @Get('config')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Get queue configuration' })
  async getConfig(@Tenant() ctx: TenantContext, @Param('attractionId') attractionId: string) {
    return this.queueService.getQueueConfig(ctx.orgId, attractionId);
  }

  @Post('config')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Create queue configuration' })
  async createConfig(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: CreateQueueConfigDto
  ) {
    return this.queueService.createQueueConfig(ctx.orgId, attractionId, dto);
  }

  @Patch('config')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Update queue configuration' })
  async updateConfig(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: UpdateQueueConfigDto
  ) {
    return this.queueService.updateQueueConfig(ctx.orgId, attractionId, dto);
  }

  @Post('pause')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Pause queue (stop accepting new entries)' })
  async pauseQueue(@Tenant() ctx: TenantContext, @Param('attractionId') attractionId: string) {
    return this.queueService.pauseQueue(ctx.orgId, attractionId);
  }

  @Post('resume')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Resume queue' })
  async resumeQueue(@Tenant() ctx: TenantContext, @Param('attractionId') attractionId: string) {
    return this.queueService.resumeQueue(ctx.orgId, attractionId);
  }

  // ============== Queue Entries ==============

  @Get('entries')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'scanner')
  @ApiOperation({ summary: 'List queue entries' })
  async listEntries(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Query() query: ListQueueEntriesQueryDto
  ) {
    return this.queueService.listEntries(ctx.orgId, attractionId, query);
  }

  @Post('entries')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office')
  @ApiOperation({ summary: 'Add guest to queue (staff)' })
  async joinQueue(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Body() dto: JoinQueueDto
  ) {
    return this.queueService.joinQueue(ctx.orgId, attractionId, dto);
  }

  @Get('entries/:entryId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'scanner')
  @ApiOperation({ summary: 'Get queue entry details' })
  async getEntry(@Tenant() ctx: TenantContext, @Param('entryId') entryId: string) {
    return this.queueService.getEntry(ctx.orgId, entryId);
  }

  @Post('entries/:entryId/call')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'scanner')
  @ApiOperation({ summary: 'Call guest to enter' })
  async callEntry(@Tenant() ctx: TenantContext, @Param('entryId') entryId: string) {
    return this.queueService.callEntry(ctx.orgId, entryId);
  }

  @Post('entries/:entryId/check-in')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'scanner')
  @ApiOperation({ summary: 'Mark guest as checked in' })
  async checkInEntry(@Tenant() ctx: TenantContext, @Param('entryId') entryId: string) {
    return this.queueService.checkInEntry(ctx.orgId, entryId);
  }

  @Post('entries/:entryId/no-show')
  @HttpCode(200)
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'scanner')
  @ApiOperation({ summary: 'Mark as no-show' })
  async markNoShow(@Tenant() ctx: TenantContext, @Param('entryId') entryId: string) {
    return this.queueService.markNoShow(ctx.orgId, entryId);
  }

  @Patch('entries/:entryId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Update entry status' })
  async updateEntry(
    @Tenant() ctx: TenantContext,
    @Param('entryId') entryId: string,
    @Body() dto: UpdateEntryStatusDto
  ) {
    return this.queueService.updateEntryStatus(ctx.orgId, entryId, dto);
  }

  @Delete('entries/:entryId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Remove entry from queue' })
  async removeEntry(@Tenant() ctx: TenantContext, @Param('entryId') entryId: string) {
    return this.queueService.removeEntry(ctx.orgId, entryId);
  }

  // ============== Statistics ==============

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'box_office', 'finance')
  @ApiOperation({ summary: 'Get queue statistics' })
  async getStats(
    @Tenant() ctx: TenantContext,
    @Param('attractionId') attractionId: string,
    @Query('date') date?: string
  ) {
    return this.queueService.getQueueStats(ctx.orgId, attractionId, date);
  }
}
