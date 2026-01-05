import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsUUID,
  IsObject,
  MaxLength,
  IsPhoneNumber,
} from 'class-validator';

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';
export type NotificationStatus = 'pending' | 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed' | 'bounced' | 'unsubscribed';
export type NotificationCategory = 'tickets' | 'queue' | 'schedule' | 'announcements' | 'marketing' | 'system';
export type RecipientType = 'user' | 'customer' | 'staff' | 'guest';
export type DevicePlatform = 'ios' | 'android' | 'web';

// =============================================================================
// Send Notification
// =============================================================================

export class SendNotificationDto {
  @ApiProperty({ description: 'Template key to use' })
  @IsString()
  @MaxLength(100)
  templateKey!: string;

  @ApiProperty({ enum: ['email', 'sms', 'push', 'in_app'] })
  @IsEnum(['email', 'sms', 'push', 'in_app'])
  channel!: NotificationChannel;

  @ApiPropertyOptional({ description: 'Recipient user IDs' })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  recipientIds?: string[];

  @ApiPropertyOptional({ description: 'Recipient email addresses' })
  @IsArray()
  @IsEmail({}, { each: true })
  @IsOptional()
  recipientEmails?: string[];

  @ApiPropertyOptional({ description: 'Recipient phone numbers' })
  @IsArray()
  @IsPhoneNumber(undefined, { each: true })
  @IsOptional()
  recipientPhones?: string[];

  @ApiPropertyOptional({ description: 'Template variables' })
  @IsObject()
  @IsOptional()
  variables?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Schedule for later (ISO date)' })
  @IsString()
  @IsOptional()
  scheduleAt?: string;
}

export class SendDirectNotificationDto {
  @ApiProperty({ enum: ['email', 'sms'] })
  @IsEnum(['email', 'sms'])
  channel!: 'email' | 'sms';

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ description: 'Email subject' })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  subject?: string;

  @ApiProperty({ description: 'Message body' })
  @IsString()
  body!: string;

  @ApiPropertyOptional({ enum: ['tickets', 'queue', 'schedule', 'announcements', 'marketing', 'system'] })
  @IsEnum(['tickets', 'queue', 'schedule', 'announcements', 'marketing', 'system'])
  @IsOptional()
  category?: NotificationCategory;
}

// =============================================================================
// Templates
// =============================================================================

export class UpdateTemplateDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(255)
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  body?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// =============================================================================
// Preferences
// =============================================================================

export class UpdatePreferenceDto {
  @ApiProperty({ enum: ['tickets', 'queue', 'schedule', 'announcements', 'marketing', 'system'] })
  @IsEnum(['tickets', 'queue', 'schedule', 'announcements', 'marketing', 'system'])
  category!: NotificationCategory;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  smsEnabled?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  pushEnabled?: boolean;
}

export class UpdatePreferencesDto {
  @ApiProperty({ type: [UpdatePreferenceDto] })
  @IsArray()
  preferences!: UpdatePreferenceDto[];
}

// =============================================================================
// Push Devices
// =============================================================================

export class RegisterDeviceDto {
  @ApiProperty()
  @IsString()
  deviceToken!: string;

  @ApiProperty({ enum: ['ios', 'android', 'web'] })
  @IsEnum(['ios', 'android', 'web'])
  platform!: DevicePlatform;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(200)
  @IsOptional()
  deviceName?: string;
}

// =============================================================================
// Response Types
// =============================================================================

export interface NotificationTemplateResponse {
  id: string;
  key: string;
  name: string;
  description: string | null;
  channel: NotificationChannel;
  subject: string | null;
  body: string;
  variables: string[];
  isSystem: boolean;
  isActive: boolean;
}

export interface NotificationResponse {
  id: string;
  channel: NotificationChannel;
  category: NotificationCategory;
  recipientEmail: string | null;
  recipientPhone: string | null;
  subject: string | null;
  body: string;
  status: NotificationStatus;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  error: string | null;
  createdAt: string;
}

export interface InAppNotificationResponse {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface PreferenceResponse {
  category: NotificationCategory;
  categoryName: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
}

export interface NotificationStatsResponse {
  period: string;
  byChannel: {
    email: { sent: number; delivered: number; openRate: number };
    sms: { sent: number; delivered: number };
    push: { sent: number; delivered: number; clickRate: number };
  };
  byCategory: Record<string, { sent: number; delivered: number }>;
}
