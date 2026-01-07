import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import type { AuthUser } from '../auth/auth.service.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { AdminService } from './admin.service.js';
import type {
  CreateAnnouncementDto,
  CreateFeatureFlagDto,
  CreateRateLimitDto,
  DeleteOrganizationDto,
  DeleteUserDto,
  ExportAuditLogsDto,
  HealthHistoryDto,
  ListAuditLogsDto,
  ListOrganizationsDto,
  ListUsersDto,
  MaintenanceModeDto,
  RevenueByOrgDto,
  RevenueTrendDto,
  SetOrgPlatformFeeDto,
  SuspendOrganizationDto,
  ToggleOrgFeatureDto,
  UpdateAnnouncementDto,
  UpdateFeatureFlagDto,
  UpdateOrganizationDto,
  UpdateRateLimitDto,
  UpdateSettingDto,
  UpdateUserDto,
} from './dto/admin.dto.js';
import { SuperAdminGuard } from './guards/super-admin.guard.js';

@ApiTags('Admin')
@Controller('admin')
@ApiBearerAuth()
@UseGuards(SuperAdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ============================================================================
  // DASHBOARD
  // ============================================================================

  @Get('dashboard')
  @ApiOperation({ summary: 'Get platform dashboard stats' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved' })
  async getDashboard() {
    return this.adminService.getDashboardStats();
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  @ApiResponse({ status: 200, description: 'Users list retrieved' })
  async listUsers(@Query() dto: ListUsersDto) {
    return this.adminService.listUsers(dto);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Get user details' })
  @ApiResponse({ status: 200, description: 'User details retrieved' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUser(@Param('userId') userId: string) {
    return this.adminService.getUser(userId);
  }

  @Patch('users/:userId')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated' })
  @ApiResponse({ status: 403, description: 'Cannot modify own admin status' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() admin: AuthUser
  ) {
    return this.adminService.updateUser(userId, dto, admin.id);
  }

  @Delete('users/:userId')
  @ApiOperation({ summary: 'Delete user (soft delete)' })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @ApiResponse({ status: 400, description: 'Confirmation required' })
  @ApiResponse({ status: 403, description: 'Cannot delete own account' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(
    @Param('userId') userId: string,
    @Body() dto: DeleteUserDto,
    @CurrentUser() admin: AuthUser
  ) {
    return this.adminService.deleteUser(userId, dto, admin.id);
  }

  @Post('users/:userId/impersonate')
  @ApiOperation({ summary: 'Generate impersonation token' })
  @ApiResponse({ status: 200, description: 'Impersonation token generated' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async impersonateUser(@Param('userId') userId: string, @CurrentUser() admin: AuthUser) {
    return this.adminService.impersonateUser(userId, admin.id);
  }

  // ============================================================================
  // ORGANIZATION MANAGEMENT
  // ============================================================================

  @Get('organizations')
  @ApiOperation({ summary: 'List all organizations' })
  @ApiResponse({ status: 200, description: 'Organizations list retrieved' })
  async listOrganizations(@Query() dto: ListOrganizationsDto) {
    return this.adminService.listOrganizations(dto);
  }

  @Get('organizations/:orgId')
  @ApiOperation({ summary: 'Get organization details' })
  @ApiResponse({ status: 200, description: 'Organization details retrieved' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getOrganization(@Param('orgId') orgId: string) {
    return this.adminService.getOrganization(orgId);
  }

  @Patch('organizations/:orgId')
  @ApiOperation({ summary: 'Update organization' })
  @ApiResponse({ status: 200, description: 'Organization updated' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async updateOrganization(
    @Param('orgId') orgId: string,
    @Body() dto: UpdateOrganizationDto,
    @CurrentUser() admin: AuthUser
  ) {
    return this.adminService.updateOrganization(orgId, dto, admin.id);
  }

  @Post('organizations/:orgId/suspend')
  @ApiOperation({ summary: 'Suspend organization' })
  @ApiResponse({ status: 200, description: 'Organization suspended' })
  @ApiResponse({ status: 400, description: 'Organization already suspended' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async suspendOrganization(
    @Param('orgId') orgId: string,
    @Body() dto: SuspendOrganizationDto,
    @CurrentUser() admin: AuthUser
  ) {
    return this.adminService.suspendOrganization(orgId, dto, admin.id);
  }

  @Post('organizations/:orgId/reactivate')
  @ApiOperation({ summary: 'Reactivate suspended organization' })
  @ApiResponse({ status: 200, description: 'Organization reactivated' })
  @ApiResponse({ status: 400, description: 'Organization not suspended' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async reactivateOrganization(@Param('orgId') orgId: string, @CurrentUser() admin: AuthUser) {
    return this.adminService.reactivateOrganization(orgId, admin.id);
  }

  @Delete('organizations/:orgId')
  @ApiOperation({ summary: 'Delete organization' })
  @ApiResponse({ status: 200, description: 'Organization deleted' })
  @ApiResponse({ status: 400, description: 'Slug confirmation required' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async deleteOrganization(
    @Param('orgId') orgId: string,
    @Body() dto: DeleteOrganizationDto,
    @CurrentUser() admin: AuthUser
  ) {
    return this.adminService.deleteOrganization(orgId, dto, admin.id);
  }

  @Patch('organizations/:orgId/platform-fee')
  @ApiOperation({ summary: 'Set custom platform fee for organization' })
  @ApiResponse({ status: 200, description: 'Platform fee updated' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async setOrgPlatformFee(
    @Param('orgId') orgId: string,
    @Body() dto: SetOrgPlatformFeeDto,
    @CurrentUser() admin: AuthUser
  ) {
    return this.adminService.setOrgPlatformFee(orgId, dto, admin.id);
  }

  @Get('organizations/:orgId/platform-fee')
  @ApiOperation({ summary: 'Get platform fee for organization' })
  @ApiResponse({ status: 200, description: 'Platform fee retrieved' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getOrgPlatformFee(@Param('orgId') orgId: string) {
    return this.adminService.getOrgPlatformFee(orgId);
  }

  @Get('organizations/:orgId/features')
  @ApiOperation({ summary: 'Get all features for organization with their enabled status' })
  @ApiResponse({ status: 200, description: 'Features retrieved' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async getOrgFeatures(@Param('orgId') orgId: string) {
    return this.adminService.getOrgFeatures(orgId);
  }

  @Post('organizations/:orgId/features')
  @ApiOperation({ summary: 'Enable or disable a feature for organization' })
  @ApiResponse({ status: 200, description: 'Feature toggled' })
  @ApiResponse({ status: 404, description: 'Organization or feature not found' })
  async toggleOrgFeature(
    @Param('orgId') orgId: string,
    @Body() dto: ToggleOrgFeatureDto,
    @CurrentUser() admin: AuthUser
  ) {
    return this.adminService.toggleOrgFeature(orgId, dto.flag_key, dto.enabled, admin.id);
  }

  // ============================================================================
  // FEATURE FLAGS
  // ============================================================================

  @Get('feature-flags')
  @ApiOperation({ summary: 'List all feature flags' })
  @ApiResponse({ status: 200, description: 'Feature flags list retrieved' })
  async listFeatureFlags() {
    return this.adminService.listFeatureFlags();
  }

  @Get('feature-flags/:flagId')
  @ApiOperation({ summary: 'Get feature flag details' })
  @ApiResponse({ status: 200, description: 'Feature flag details retrieved' })
  @ApiResponse({ status: 404, description: 'Feature flag not found' })
  async getFeatureFlag(@Param('flagId') flagId: string) {
    return this.adminService.getFeatureFlag(flagId);
  }

  @Post('feature-flags')
  @ApiOperation({ summary: 'Create feature flag' })
  @ApiResponse({ status: 201, description: 'Feature flag created' })
  @ApiResponse({ status: 400, description: 'Flag key already exists' })
  async createFeatureFlag(@Body() dto: CreateFeatureFlagDto, @CurrentUser() admin: AuthUser) {
    return this.adminService.createFeatureFlag(dto, admin.id);
  }

  @Patch('feature-flags/:flagId')
  @ApiOperation({ summary: 'Update feature flag' })
  @ApiResponse({ status: 200, description: 'Feature flag updated' })
  @ApiResponse({ status: 404, description: 'Feature flag not found' })
  async updateFeatureFlag(
    @Param('flagId') flagId: string,
    @Body() dto: UpdateFeatureFlagDto,
    @CurrentUser() admin: AuthUser
  ) {
    return this.adminService.updateFeatureFlag(flagId, dto, admin.id);
  }

  @Delete('feature-flags/:flagId')
  @ApiOperation({ summary: 'Delete feature flag' })
  @ApiResponse({ status: 200, description: 'Feature flag deleted' })
  @ApiResponse({ status: 404, description: 'Feature flag not found' })
  async deleteFeatureFlag(@Param('flagId') flagId: string, @CurrentUser() admin: AuthUser) {
    return this.adminService.deleteFeatureFlag(flagId, admin.id);
  }

  // ============================================================================
  // PLATFORM SETTINGS
  // ============================================================================

  @Get('settings')
  @ApiOperation({ summary: 'Get all platform settings' })
  @ApiResponse({ status: 200, description: 'Settings retrieved' })
  async getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings/:key')
  @ApiOperation({ summary: 'Update platform setting' })
  @ApiResponse({ status: 200, description: 'Setting updated' })
  @ApiResponse({ status: 404, description: 'Setting not found' })
  async updateSetting(
    @Param('key') key: string,
    @Body() dto: UpdateSettingDto,
    @CurrentUser() admin: AuthUser
  ) {
    return this.adminService.updateSetting(key, dto, admin.id);
  }

  @Post('settings/maintenance')
  @ApiOperation({ summary: 'Toggle maintenance mode' })
  @ApiResponse({ status: 200, description: 'Maintenance mode updated' })
  async setMaintenanceMode(@Body() dto: MaintenanceModeDto, @CurrentUser() admin: AuthUser) {
    return this.adminService.setMaintenanceMode(dto, admin.id);
  }

  // ============================================================================
  // ANNOUNCEMENTS
  // ============================================================================

  @Get('announcements')
  @ApiOperation({ summary: 'List announcements' })
  @ApiResponse({ status: 200, description: 'Announcements list retrieved' })
  async listAnnouncements() {
    return this.adminService.listAnnouncements();
  }

  @Post('announcements')
  @ApiOperation({ summary: 'Create announcement' })
  @ApiResponse({ status: 201, description: 'Announcement created' })
  async createAnnouncement(@Body() dto: CreateAnnouncementDto, @CurrentUser() admin: AuthUser) {
    return this.adminService.createAnnouncement(dto, admin.id);
  }

  @Patch('announcements/:announcementId')
  @ApiOperation({ summary: 'Update announcement' })
  @ApiResponse({ status: 200, description: 'Announcement updated' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async updateAnnouncement(
    @Param('announcementId') announcementId: string,
    @Body() dto: UpdateAnnouncementDto,
    @CurrentUser() admin: AuthUser
  ) {
    return this.adminService.updateAnnouncement(announcementId, dto, admin.id);
  }

  @Delete('announcements/:announcementId')
  @ApiOperation({ summary: 'Delete announcement' })
  @ApiResponse({ status: 200, description: 'Announcement deleted' })
  @ApiResponse({ status: 404, description: 'Announcement not found' })
  async deleteAnnouncement(
    @Param('announcementId') announcementId: string,
    @CurrentUser() admin: AuthUser
  ) {
    return this.adminService.deleteAnnouncement(announcementId, admin.id);
  }

  // ============================================================================
  // AUDIT LOGS
  // ============================================================================

  @Get('audit-logs')
  @ApiOperation({ summary: 'Search audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  async listAuditLogs(@Query() dto: ListAuditLogsDto) {
    return this.adminService.listAuditLogs(dto);
  }

  @Get('audit-logs/export')
  @ApiOperation({ summary: 'Export audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs exported' })
  async exportAuditLogs(@Query() dto: ExportAuditLogsDto, @Res() reply: FastifyReply) {
    const result = await this.adminService.exportAuditLogs(dto);

    reply.header('Content-Type', result.contentType);
    reply.header('Content-Disposition', `attachment; filename="${result.filename}"`);
    return reply.send(result.content);
  }

  // ============================================================================
  // SYSTEM HEALTH
  // ============================================================================

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200, description: 'Health status retrieved' })
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }

  @Get('health/history')
  @ApiOperation({ summary: 'Get health history' })
  @ApiResponse({ status: 200, description: 'Health history retrieved' })
  async getHealthHistory(@Query() dto: HealthHistoryDto) {
    return this.adminService.getHealthHistory(dto);
  }

  // ============================================================================
  // RATE LIMITS
  // ============================================================================

  @Get('rate-limits')
  @ApiOperation({ summary: 'Get rate limit rules' })
  @ApiResponse({ status: 200, description: 'Rate limit rules retrieved' })
  async listRateLimits() {
    return this.adminService.listRateLimits();
  }

  @Post('rate-limits')
  @ApiOperation({ summary: 'Create rate limit rule' })
  @ApiResponse({ status: 201, description: 'Rate limit rule created' })
  async createRateLimit(@Body() dto: CreateRateLimitDto, @CurrentUser() admin: AuthUser) {
    return this.adminService.createRateLimit(dto, admin.id);
  }

  @Patch('rate-limits/:ruleId')
  @ApiOperation({ summary: 'Update rate limit rule' })
  @ApiResponse({ status: 200, description: 'Rate limit rule updated' })
  @ApiResponse({ status: 404, description: 'Rate limit rule not found' })
  async updateRateLimit(
    @Param('ruleId') ruleId: string,
    @Body() dto: UpdateRateLimitDto,
    @CurrentUser() admin: AuthUser
  ) {
    return this.adminService.updateRateLimit(ruleId, dto, admin.id);
  }

  @Delete('rate-limits/:ruleId')
  @ApiOperation({ summary: 'Delete rate limit rule' })
  @ApiResponse({ status: 200, description: 'Rate limit rule deleted' })
  @ApiResponse({ status: 404, description: 'Rate limit rule not found' })
  async deleteRateLimit(@Param('ruleId') ruleId: string, @CurrentUser() admin: AuthUser) {
    return this.adminService.deleteRateLimit(ruleId, admin.id);
  }

  // ============================================================================
  // PLATFORM REVENUE
  // ============================================================================

  @Get('revenue')
  @ApiOperation({ summary: 'Get platform revenue summary' })
  @ApiResponse({ status: 200, description: 'Revenue summary retrieved' })
  async getRevenueSummary() {
    return this.adminService.getRevenueSummary();
  }

  @Get('revenue/by-org')
  @ApiOperation({ summary: 'Get revenue breakdown by organization' })
  @ApiResponse({ status: 200, description: 'Revenue by organization retrieved' })
  async getRevenueByOrg(@Query() dto: RevenueByOrgDto) {
    return this.adminService.getRevenueByOrg(dto);
  }

  @Get('revenue/trend')
  @ApiOperation({ summary: 'Get revenue trend over time' })
  @ApiResponse({ status: 200, description: 'Revenue trend retrieved' })
  async getRevenueTrend(@Query() dto: RevenueTrendDto) {
    return this.adminService.getRevenueTrend(dto.days || 30);
  }

  @Post('revenue/sync')
  @ApiOperation({ summary: 'Sync transactions from Stripe for all connected accounts' })
  @ApiResponse({ status: 200, description: 'Transactions synced' })
  async syncAllTransactions() {
    return this.adminService.syncAllTransactions();
  }
}
