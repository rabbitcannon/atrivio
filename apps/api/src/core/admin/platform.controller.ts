import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AdminService } from './admin.service.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/auth.service.js';

@ApiTags('Platform')
@Controller('platform')
@ApiBearerAuth()
export class PlatformController {
  constructor(private adminService: AdminService) {}

  @Get('announcements')
  @ApiOperation({ summary: 'Get active platform announcements for current user' })
  @ApiResponse({ status: 200, description: 'Active announcements retrieved' })
  async getActiveAnnouncements(@CurrentUser() user: AuthUser) {
    return this.adminService.getActiveAnnouncementsForUser(user.id);
  }

  @Post('announcements/:announcementId/dismiss')
  @ApiOperation({ summary: 'Dismiss an announcement' })
  @ApiResponse({ status: 200, description: 'Announcement dismissed' })
  async dismissAnnouncement(
    @Param('announcementId') announcementId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.adminService.dismissAnnouncement(announcementId, user.id);
  }
}
