import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export type ScheduleStatus =
  | 'draft'
  | 'scheduled'
  | 'published'
  | 'confirmed'
  | 'checked_in'
  | 'completed'
  | 'no_show'
  | 'canceled';

export class CreateScheduleDto {
  @ApiProperty({ description: 'Attraction ID' })
  @IsUUID()
  attractionId!: string;

  @ApiPropertyOptional({ description: 'Staff member ID (null for unassigned shift)' })
  @IsUUID()
  @IsOptional()
  staffId?: string;

  @ApiProperty({ description: 'Schedule role ID' })
  @IsUUID()
  roleId!: string;

  @ApiProperty({ description: 'Shift date (YYYY-MM-DD)' })
  @IsDateString()
  shiftDate!: string;

  @ApiProperty({ description: 'Start time (HH:MM)' })
  @IsString()
  startTime!: string;

  @ApiProperty({ description: 'End time (HH:MM)' })
  @IsString()
  endTime!: string;

  @ApiPropertyOptional({ description: 'Schedule period ID' })
  @IsUUID()
  @IsOptional()
  periodId?: string;

  @ApiPropertyOptional({ description: 'Notes for the shift' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateScheduleDto {
  @ApiPropertyOptional({ description: 'Staff member ID' })
  @IsUUID()
  @IsOptional()
  staffId?: string;

  @ApiPropertyOptional({ description: 'Schedule role ID' })
  @IsUUID()
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional({ description: 'Shift date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  shiftDate?: string;

  @ApiPropertyOptional({ description: 'Start time (HH:MM)' })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ description: 'End time (HH:MM)' })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Status' })
  @IsEnum([
    'draft',
    'scheduled',
    'published',
    'confirmed',
    'checked_in',
    'completed',
    'no_show',
    'canceled',
  ])
  @IsOptional()
  status?: ScheduleStatus;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class BulkCreateScheduleDto {
  @ApiProperty({ type: [CreateScheduleDto] })
  schedules!: CreateScheduleDto[];
}

export class PublishSchedulesDto {
  @ApiProperty({ description: 'Start date for publishing (YYYY-MM-DD)' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ description: 'End date for publishing (YYYY-MM-DD)' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ description: 'Notify staff via email' })
  @IsBoolean()
  @IsOptional()
  notifyStaff?: boolean;
}

export class ListSchedulesQueryDto {
  @ApiPropertyOptional({ description: 'Filter by staff ID' })
  @IsUUID()
  @IsOptional()
  staffId?: string;

  @ApiPropertyOptional({ description: 'Filter by role ID' })
  @IsUUID()
  @IsOptional()
  roleId?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsEnum([
    'draft',
    'scheduled',
    'published',
    'confirmed',
    'checked_in',
    'completed',
    'no_show',
    'canceled',
  ])
  @IsOptional()
  status?: ScheduleStatus;

  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Include unassigned shifts' })
  @IsBoolean()
  @IsOptional()
  includeUnassigned?: boolean;
}
