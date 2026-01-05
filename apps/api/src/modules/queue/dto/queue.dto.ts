import {
  IsString,
  IsOptional,
  IsEnum,
  IsEmail,
  IsBoolean,
  IsInt,
  IsUUID,
  Min,
  Max,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

// UUID regex that accepts any valid format
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export enum QueueStatus {
  WAITING = 'waiting',
  NOTIFIED = 'notified',
  CALLED = 'called',
  CHECKED_IN = 'checked_in',
  EXPIRED = 'expired',
  LEFT = 'left',
  NO_SHOW = 'no_show',
}

export enum NotificationType {
  JOINED = 'joined',
  REMINDER = 'reminder',
  ALMOST_READY = 'almost_ready',
  READY = 'ready',
  FINAL_CALL = 'final_call',
  EXPIRED = 'expired',
}

// ============== Queue Config DTOs ==============

export class CreateQueueConfigDto {
  @ApiProperty({ description: 'Queue name' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Is queue active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Capacity per batch' })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  capacityPerBatch?: number;

  @ApiPropertyOptional({ description: 'Minutes between batches' })
  @IsInt()
  @Min(1)
  @Max(60)
  @IsOptional()
  batchIntervalMinutes?: number;

  @ApiPropertyOptional({ description: 'Max wait time in minutes' })
  @IsInt()
  @Min(15)
  @Max(480)
  @IsOptional()
  maxWaitMinutes?: number;

  @ApiPropertyOptional({ description: 'Max queue size' })
  @IsInt()
  @Min(10)
  @Max(5000)
  @IsOptional()
  maxQueueSize?: number;

  @ApiPropertyOptional({ description: 'Allow guests to rejoin after expiry' })
  @IsBoolean()
  @IsOptional()
  allowRejoin?: boolean;

  @ApiPropertyOptional({ description: 'Require check-in at entrance' })
  @IsBoolean()
  @IsOptional()
  requireCheckIn?: boolean;

  @ApiPropertyOptional({ description: 'Minutes before ready to send notification' })
  @IsInt()
  @Min(1)
  @Max(60)
  @IsOptional()
  notificationLeadMinutes?: number;

  @ApiPropertyOptional({ description: 'Minutes until entry expires after being called' })
  @IsInt()
  @Min(5)
  @Max(60)
  @IsOptional()
  expiryMinutes?: number;
}

export class UpdateQueueConfigDto {
  @ApiPropertyOptional({ description: 'Queue name' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Is queue active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Is queue paused' })
  @IsBoolean()
  @IsOptional()
  isPaused?: boolean;

  @ApiPropertyOptional({ description: 'Capacity per batch' })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  capacityPerBatch?: number;

  @ApiPropertyOptional({ description: 'Minutes between batches' })
  @IsInt()
  @Min(1)
  @Max(60)
  @IsOptional()
  batchIntervalMinutes?: number;

  @ApiPropertyOptional({ description: 'Max wait time in minutes' })
  @IsInt()
  @Min(15)
  @Max(480)
  @IsOptional()
  maxWaitMinutes?: number;

  @ApiPropertyOptional({ description: 'Max queue size' })
  @IsInt()
  @Min(10)
  @Max(5000)
  @IsOptional()
  maxQueueSize?: number;

  @ApiPropertyOptional({ description: 'Allow guests to rejoin after expiry' })
  @IsBoolean()
  @IsOptional()
  allowRejoin?: boolean;

  @ApiPropertyOptional({ description: 'Require check-in at entrance' })
  @IsBoolean()
  @IsOptional()
  requireCheckIn?: boolean;

  @ApiPropertyOptional({ description: 'Minutes before ready to send notification' })
  @IsInt()
  @Min(1)
  @Max(60)
  @IsOptional()
  notificationLeadMinutes?: number;

  @ApiPropertyOptional({ description: 'Minutes until entry expires after being called' })
  @IsInt()
  @Min(5)
  @Max(60)
  @IsOptional()
  expiryMinutes?: number;
}

// ============== Queue Entry DTOs ==============

export class JoinQueueDto {
  @ApiPropertyOptional({ description: 'Guest name' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  guestName?: string;

  @ApiPropertyOptional({ description: 'Guest phone for SMS notifications' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  guestPhone?: string;

  @ApiPropertyOptional({ description: 'Guest email' })
  @IsEmail()
  @IsOptional()
  guestEmail?: string;

  @ApiPropertyOptional({ description: 'Number of people in party' })
  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  partySize?: number;

  @ApiPropertyOptional({ description: 'Associated ticket ID' })
  @Matches(UUID_REGEX, { message: 'ticketId must be a valid UUID format' })
  @IsOptional()
  ticketId?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  notes?: string;
}

export class ListQueueEntriesQueryDto {
  @ApiPropertyOptional({ description: 'Filter by status', enum: QueueStatus })
  @IsEnum(QueueStatus)
  @IsOptional()
  status?: QueueStatus;

  @ApiPropertyOptional({ description: 'Search by name or confirmation code' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Limit results' })
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ description: 'Offset for pagination' })
  @IsInt()
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  @IsOptional()
  offset?: number;
}

export class UpdateEntryStatusDto {
  @ApiPropertyOptional({ description: 'New status', enum: QueueStatus })
  @IsEnum(QueueStatus)
  @IsOptional()
  status?: QueueStatus;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  notes?: string;
}

// ============== Public Queue DTOs ==============

export class PublicJoinQueueDto {
  @ApiProperty({ description: 'Guest name' })
  @IsString()
  @MaxLength(200)
  guestName!: string;

  @ApiPropertyOptional({ description: 'Guest phone for SMS notifications' })
  @IsString()
  @MaxLength(20)
  @IsOptional()
  guestPhone?: string;

  @ApiPropertyOptional({ description: 'Guest email' })
  @IsEmail()
  @IsOptional()
  guestEmail?: string;

  @ApiPropertyOptional({ description: 'Number of people in party (default: 1)' })
  @IsInt()
  @Min(1)
  @Max(20)
  @IsOptional()
  partySize?: number;

  @ApiPropertyOptional({ description: 'Associated ticket ID' })
  @Matches(UUID_REGEX, { message: 'ticketId must be a valid UUID format' })
  @IsOptional()
  ticketId?: string;
}

// ============== Response DTOs ==============

export class QueueConfigResponseDto {
  id!: string;
  attractionId!: string;
  name!: string;
  isActive!: boolean;
  isPaused!: boolean;
  capacityPerBatch!: number;
  batchIntervalMinutes!: number;
  maxWaitMinutes!: number;
  maxQueueSize!: number;
  allowRejoin!: boolean;
  requireCheckIn!: boolean;
  notificationLeadMinutes!: number;
  expiryMinutes!: number;
  createdAt!: string;
  updatedAt!: string;
}

export class QueueEntryResponseDto {
  id!: string;
  confirmationCode!: string;
  guestName!: string | null;
  guestPhone!: string | null;
  guestEmail!: string | null;
  partySize!: number;
  position!: number;
  status!: QueueStatus;
  joinedAt!: string;
  estimatedTime!: string | null;
  notifiedAt!: string | null;
  calledAt!: string | null;
  checkedInAt!: string | null;
  expiredAt!: string | null;
  leftAt!: string | null;
  notes!: string | null;
}

export class JoinQueueResponseDto {
  confirmationCode!: string;
  position!: number;
  estimatedWaitMinutes!: number;
  estimatedTime!: string;
  partySize!: number;
  status!: string;
  checkStatusUrl!: string;
}

export class QueueStatusResponseDto {
  isOpen!: boolean;
  isPaused!: boolean;
  currentWaitMinutes!: number;
  peopleInQueue!: number;
  queueSize!: number;
  status!: 'accepting' | 'paused' | 'full' | 'closed';
  message!: string;
}

export class QueuePositionResponseDto {
  confirmationCode!: string;
  position!: number;
  status!: string;
  partySize!: number;
  peopleAhead!: number;
  estimatedWaitMinutes!: number;
  estimatedTime!: string;
  joinedAt!: string;
  queueName!: string;
  attractionName!: string;
}

export class QueueStatsResponseDto {
  today!: {
    totalJoined: number;
    totalServed: number;
    totalExpired: number;
    totalLeft: number;
    totalNoShow: number;
    avgWaitMinutes: number | null;
    maxWaitMinutes: number | null;
    currentInQueue: number;
  };
  byHour!: Array<{
    hour: string;
    joined: number;
    served: number;
    expired: number;
    avgWait: number | null;
    maxSize: number;
  }>;
}

export class QueueSummaryDto {
  totalWaiting!: number;
  totalServedToday!: number;
  avgWaitMinutes!: number;
  nextBatchTime!: string;
}
