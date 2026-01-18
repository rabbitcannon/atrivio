import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../../core/auth/auth.service.js';
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator.js';
import { Feature } from '../../core/features/decorators/feature.decorator.js';
import { FeatureGuard } from '../../core/features/guards/feature.guard.js';
import { Roles } from '../../core/rbac/decorators/roles.decorator.js';
import { RolesGuard } from '../../core/rbac/guards/roles.guard.js';
import { Tenant } from '../../core/tenancy/decorators/tenant.decorator.js';
import { TenantInterceptor } from '../../core/tenancy/interceptors/tenant.interceptor.js';
import type { TenantContext } from '../../core/tenancy/tenancy.service.js';
import type {
  NotificationChannel,
  RegisterDeviceDto,
  SendDirectNotificationDto,
  SendNotificationDto,
  UpdatePreferencesDto,
  UpdateTemplateDto,
} from './dto/index.js';
import { NotificationsService } from './notifications.service.js';

// =============================================================================
// Org-Scoped Notifications Controller
// =============================================================================

@ApiTags('Notifications')
@Controller('organizations/:orgId/notifications')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
@UseGuards(FeatureGuard)
@Feature('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  // ============== Send Notifications ==============

  @Post('send')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Send notification using template' })
  async sendFromTemplate(@Tenant() ctx: TenantContext, @Body() dto: SendNotificationDto) {
    return this.notificationsService.sendFromTemplate(ctx.orgId, dto);
  }

  @Post('send-direct')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager', 'hr')
  @ApiOperation({ summary: 'Send direct email or SMS without template' })
  async sendDirect(@Tenant() ctx: TenantContext, @Body() dto: SendDirectNotificationDto) {
    return this.notificationsService.sendDirect(ctx.orgId, dto);
  }

  // ============== Templates ==============

  @Get('templates')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'List notification templates' })
  @ApiQuery({ name: 'channel', required: false, enum: ['email', 'sms', 'push', 'in_app'] })
  async listTemplates(
    @Tenant() ctx: TenantContext,
    @Query('channel') channel?: NotificationChannel
  ) {
    return this.notificationsService.getTemplates(ctx.orgId, channel);
  }

  @Get('templates/:templateKey/:channel')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Get a specific template' })
  async getTemplate(
    @Tenant() ctx: TenantContext,
    @Param('templateKey') templateKey: string,
    @Param('channel') channel: NotificationChannel
  ) {
    const template = await this.notificationsService.getTemplate(ctx.orgId, templateKey, channel);
    if (!template) {
      throw new NotFoundException(`Template not found: ${templateKey}`);
    }
    return template;
  }

  @Patch('templates/:templateId')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin')
  @ApiOperation({ summary: 'Update a template (org-specific)' })
  async updateTemplate(
    @Tenant() ctx: TenantContext,
    @Param('templateId') templateId: string,
    @Body() dto: UpdateTemplateDto
  ) {
    await this.notificationsService.updateTemplate(ctx.orgId, templateId, dto);
    return { success: true };
  }

  // ============== History ==============

  @Get('history')
  @UseGuards(RolesGuard)
  @Roles('owner', 'admin', 'manager')
  @ApiOperation({ summary: 'Get notification history' })
  @ApiQuery({ name: 'channel', required: false, enum: ['email', 'sms', 'push', 'in_app'] })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async getHistory(
    @Tenant() ctx: TenantContext,
    @Query('channel') channel?: NotificationChannel,
    @Query('status') status?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const options: {
      channel?: NotificationChannel;
      status?: string;
      limit?: number;
      offset?: number;
    } = {};
    if (channel) options.channel = channel;
    if (status) options.status = status;
    if (limit) options.limit = Number(limit);
    if (offset) options.offset = Number(offset);

    return this.notificationsService.getNotificationHistory(ctx.orgId, options);
  }
}

// =============================================================================
// User Notifications Controller (In-App + Preferences)
// =============================================================================

@ApiTags('User Notifications')
@Controller('notifications')
@ApiBearerAuth()
export class UserNotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  // ============== In-App Notifications ==============

  @Get('inbox')
  @ApiOperation({ summary: 'Get in-app notifications' })
  @ApiQuery({ name: 'read', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getInbox(
    @CurrentUser() user: AuthUser,
    @Query('read') read?: string,
    @Query('limit') limit?: string
  ) {
    const options: { read?: boolean; limit?: number } = {};
    if (read !== undefined) options.read = read === 'true';
    if (limit) options.limit = Number(limit);

    return this.notificationsService.getInAppNotifications(user.id, options);
  }

  @Post(':notificationId/read')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@CurrentUser() user: AuthUser, @Param('notificationId') notificationId: string) {
    await this.notificationsService.markAsRead(user.id, notificationId);
    return { success: true };
  }

  @Post('read-all')
  @HttpCode(200)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: AuthUser) {
    await this.notificationsService.markAllAsRead(user.id);
    return { success: true };
  }

  // ============== Preferences ==============

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiQuery({ name: 'orgId', required: false })
  async getPreferences(@CurrentUser() user: AuthUser, @Query('orgId') orgId?: string) {
    return this.notificationsService.getPreferences(user.id, orgId);
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiQuery({ name: 'orgId', required: false })
  async updatePreferences(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdatePreferencesDto,
    @Query('orgId') orgId?: string
  ) {
    await this.notificationsService.updatePreferences(user.id, orgId ?? null, dto);
    return { success: true };
  }

  // ============== Push Devices ==============

  @Post('devices')
  @ApiOperation({ summary: 'Register push notification device' })
  async registerDevice(@CurrentUser() user: AuthUser, @Body() dto: RegisterDeviceDto) {
    await this.notificationsService.registerDevice(user.id, dto);
    return { success: true };
  }

  @Delete('devices/:deviceToken')
  @ApiOperation({ summary: 'Unregister push notification device' })
  async unregisterDevice(@CurrentUser() user: AuthUser, @Param('deviceToken') deviceToken: string) {
    await this.notificationsService.unregisterDevice(user.id, deviceToken);
    return { success: true };
  }
}
