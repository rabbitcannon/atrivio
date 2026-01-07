import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth.service.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { AdminService } from './admin.service.js';

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
    @CurrentUser() user: AuthUser
  ) {
    return this.adminService.dismissAnnouncement(announcementId, user.id);
  }
}
