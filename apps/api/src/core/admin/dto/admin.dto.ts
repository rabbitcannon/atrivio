import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

// ============================================================================
// PAGINATION
// ============================================================================

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export class ListUsersDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by email or name' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by super admin status' })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  is_super_admin?: boolean;

  @ApiPropertyOptional({ description: 'Filter users created after this date' })
  @IsDateString()
  @IsOptional()
  created_after?: string;

  @ApiPropertyOptional({ description: 'Filter users created before this date' })
  @IsDateString()
  @IsOptional()
  created_before?: string;

  @ApiPropertyOptional({ description: 'Filter by org membership' })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  has_orgs?: boolean;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Grant or revoke super admin status' })
  @IsBoolean()
  @IsOptional()
  is_super_admin?: boolean;

  @ApiPropertyOptional({ description: 'Mark email as verified' })
  @IsBoolean()
  @IsOptional()
  email_verified?: boolean;
}

export class DeleteUserDto {
  @ApiProperty({ description: 'Confirm deletion' })
  @IsBoolean()
  confirm!: boolean;

  @ApiPropertyOptional({ description: 'Reason for deletion' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  reason?: string;
}

// ============================================================================
// ORGANIZATION MANAGEMENT
// ============================================================================

export class ListOrganizationsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Search by name or slug' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ enum: ['active', 'suspended', 'deleted'] })
  @IsString()
  @IsOptional()
  status?: 'active' | 'suspended' | 'deleted';

  @ApiPropertyOptional({ description: 'Has Stripe connected' })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  stripe_connected?: boolean;

  @ApiPropertyOptional({ description: 'Filter orgs created after this date' })
  @IsDateString()
  @IsOptional()
  created_after?: string;

  @ApiPropertyOptional({ description: 'Filter orgs created before this date' })
  @IsDateString()
  @IsOptional()
  created_before?: string;
}

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ enum: ['active', 'suspended'] })
  @IsString()
  @IsOptional()
  status?: 'active' | 'suspended';

  @ApiPropertyOptional({ description: 'Admin notes' })
  @IsString()
  @MaxLength(1000)
  @IsOptional()
  notes?: string;
}

export class SuspendOrganizationDto {
  @ApiProperty({ description: 'Reason for suspension' })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  reason!: string;

  @ApiPropertyOptional({ description: 'Notify the owner via email', default: true })
  @IsBoolean()
  @IsOptional()
  notify_owner?: boolean = true;
}

export class DeleteOrganizationDto {
  @ApiProperty({ description: 'Confirm by entering org slug' })
  @IsString()
  confirm_slug!: string;

  @ApiPropertyOptional({ description: 'Reason for deletion' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  reason?: string;
}

export class SetOrgPlatformFeeDto {
  @ApiPropertyOptional({
    description: 'Custom platform fee percentage (0-100). Null to use global default.',
    example: 2.5,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  platform_fee_percent?: number | null;
}

export class ToggleOrgFeatureDto {
  @ApiProperty({ description: 'Feature flag key', example: 'scheduling' })
  @IsString()
  @MinLength(1)
  flag_key!: string;

  @ApiProperty({ description: 'Enable or disable the feature for this org' })
  @IsBoolean()
  enabled!: boolean;
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export class CreateFeatureFlagDto {
  @ApiProperty({ example: 'virtual_queue_v2' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  key!: string;

  @ApiProperty({ example: 'Virtual Queue V2' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ example: 'New virtual queue system with SMS notifications' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean = false;
}

export class UpdateFeatureFlagDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Type(() => Number)
  rollout_percentage?: number;

  @ApiPropertyOptional({ type: [String], description: 'Organization IDs to enable for' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  org_ids?: string[];

  @ApiPropertyOptional({ type: [String], description: 'User IDs to enable for' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  user_ids?: string[];

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}

// ============================================================================
// PLATFORM SETTINGS
// ============================================================================

export class UpdateSettingDto {
  @ApiProperty({ description: 'Setting value (JSON)' })
  value!: unknown;
}

export class MaintenanceModeDto {
  @ApiProperty()
  @IsBoolean()
  enabled!: boolean;

  @ApiPropertyOptional({ example: 'Scheduled maintenance until 3:00 AM EST' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  message?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  allow_admins?: boolean = true;
}

// ============================================================================
// ANNOUNCEMENTS
// ============================================================================

export class CreateAnnouncementDto {
  @ApiProperty({ example: 'New Feature: Virtual Queue' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title!: string;

  @ApiProperty({ example: 'We are excited to announce...' })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  content!: string;

  @ApiPropertyOptional({ enum: ['info', 'warning', 'critical', 'maintenance', 'feature'] })
  @IsEnum(['info', 'warning', 'critical', 'maintenance', 'feature'])
  @IsOptional()
  type?: 'info' | 'warning' | 'critical' | 'maintenance' | 'feature' = 'info';

  @ApiPropertyOptional({
    type: [String],
    description: 'Target roles (empty = all roles)',
    example: ['owner', 'admin'],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  target_roles?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Target org IDs (empty = all orgs)' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  target_org_ids?: string[];

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  starts_at?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  expires_at?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  is_dismissible?: boolean = true;
}

export class UpdateAnnouncementDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  @IsOptional()
  content?: string;

  @ApiPropertyOptional({ enum: ['info', 'warning', 'critical', 'maintenance', 'feature'] })
  @IsEnum(['info', 'warning', 'critical', 'maintenance', 'feature'])
  @IsOptional()
  type?: 'info' | 'warning' | 'critical' | 'maintenance' | 'feature';

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  expires_at?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

// ============================================================================
// AUDIT LOGS
// ============================================================================

export class ListAuditLogsDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  actor_id?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  org_id?: string;

  @ApiPropertyOptional({ example: 'user.update' })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiPropertyOptional({ example: 'user' })
  @IsString()
  @IsOptional()
  resource_type?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  end_date?: string;
}

export class ExportAuditLogsDto extends ListAuditLogsDto {
  @ApiPropertyOptional({ enum: ['csv', 'json'], default: 'json' })
  @IsEnum(['csv', 'json'])
  @IsOptional()
  format?: 'csv' | 'json' = 'json';
}

// ============================================================================
// HEALTH
// ============================================================================

export class HealthHistoryDto {
  @ApiPropertyOptional({ example: 'api' })
  @IsString()
  @IsOptional()
  service?: string;

  @ApiPropertyOptional({ default: 24 })
  @IsInt()
  @Min(1)
  @Max(168) // 1 week max
  @IsOptional()
  @Type(() => Number)
  hours?: number = 24;
}

// ============================================================================
// RATE LIMITS
// ============================================================================

export class CreateRateLimitDto {
  @ApiProperty({ example: 'Ticket Purchase Limit' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: '/api/v1/*/tickets/purchase' })
  @IsString()
  @MaxLength(255)
  endpoint_pattern!: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  @Max(10000)
  requests_per_minute!: number;

  @ApiPropertyOptional({ example: 100 })
  @IsInt()
  @Min(1)
  @Max(100000)
  @IsOptional()
  requests_per_hour?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  burst_limit?: number;

  @ApiPropertyOptional({ enum: ['all', 'authenticated', 'anonymous', 'specific_orgs'] })
  @IsEnum(['all', 'authenticated', 'anonymous', 'specific_orgs'])
  @IsOptional()
  applies_to?: 'all' | 'authenticated' | 'anonymous' | 'specific_orgs' = 'all';

  @ApiPropertyOptional({ type: [String], description: 'Org IDs for specific_orgs scope' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  org_ids?: string[];
}

export class UpdateRateLimitDto {
  @ApiPropertyOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  @IsOptional()
  requests_per_minute?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(100000)
  @IsOptional()
  requests_per_hour?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  @IsOptional()
  burst_limit?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

// ============================================================================
// PLATFORM REVENUE
// ============================================================================

export class RevenueByOrgDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Start date for revenue period (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({ description: 'End date for revenue period (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  end_date?: string;
}

export class RevenueTrendDto {
  @ApiPropertyOptional({ description: 'Number of days to include in trend', default: 30 })
  @IsInt()
  @Min(7)
  @Max(365)
  @IsOptional()
  @Type(() => Number)
  days?: number = 30;
}

// ============================================================================
// SUBSCRIPTION TIERS
// ============================================================================

export class UpdateSubscriptionTierDto {
  @ApiPropertyOptional({ description: 'Display name for the tier' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Tier description' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Monthly price in cents (e.g., 14900 = $149.00)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  monthly_price_cents?: number;

  @ApiPropertyOptional({ description: 'Transaction fee percentage (e.g., 2.9 = 2.9%)' })
  @Min(0)
  @Max(10)
  @IsOptional()
  @Type(() => Number)
  transaction_fee_percentage?: number;

  @ApiPropertyOptional({ description: 'Fixed transaction fee in cents (e.g., 30 = $0.30)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  transaction_fee_fixed_cents?: number;

  @ApiPropertyOptional({ description: 'Max custom domains (-1 = unlimited)' })
  @IsInt()
  @Min(-1)
  @IsOptional()
  custom_domains_limit?: number;

  @ApiPropertyOptional({ description: 'Max attractions (-1 = unlimited)' })
  @IsInt()
  @Min(-1)
  @IsOptional()
  attractions_limit?: number;

  @ApiPropertyOptional({ description: 'Max staff members (-1 = unlimited)' })
  @IsInt()
  @Min(-1)
  @IsOptional()
  staff_members_limit?: number;

  @ApiPropertyOptional({ description: 'Features enabled for this tier', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  @ApiPropertyOptional({ description: 'Whether this tier is active' })
  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({ description: 'Display order (lower = first)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  display_order?: number;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
