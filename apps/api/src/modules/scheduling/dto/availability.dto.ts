import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export type AvailabilityType =
  | 'available'
  | 'unavailable'
  | 'preferred'
  | 'time_off_approved'
  | 'time_off_pending';

export class CreateAvailabilityDto {
  @ApiProperty({ description: 'Day of week (0=Sunday, 6=Saturday)' })
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek!: number;

  @ApiProperty({ description: 'Start time (HH:MM)' })
  @IsString()
  startTime!: string;

  @ApiProperty({ description: 'End time (HH:MM)' })
  @IsString()
  endTime!: string;

  @ApiProperty({
    description: 'Availability type',
    enum: ['available', 'unavailable', 'preferred', 'time_off_approved', 'time_off_pending'],
  })
  @IsEnum(['available', 'unavailable', 'preferred', 'time_off_approved', 'time_off_pending'])
  availabilityType!: AvailabilityType;

  @ApiPropertyOptional({ description: 'Effective from date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  effectiveFrom?: string;

  @ApiPropertyOptional({ description: 'Effective to date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  effectiveTo?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateAvailabilityDto {
  @ApiPropertyOptional({ description: 'Day of week (0=Sunday, 6=Saturday)' })
  @IsInt()
  @Min(0)
  @Max(6)
  @IsOptional()
  dayOfWeek?: number;

  @ApiPropertyOptional({ description: 'Start time (HH:MM)' })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ description: 'End time (HH:MM)' })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Availability type',
    enum: ['available', 'unavailable', 'preferred', 'time_off_approved', 'time_off_pending'],
  })
  @IsEnum(['available', 'unavailable', 'preferred', 'time_off_approved', 'time_off_pending'])
  @IsOptional()
  availabilityType?: AvailabilityType;

  @ApiPropertyOptional({ description: 'Effective from date' })
  @IsDateString()
  @IsOptional()
  effectiveFrom?: string;

  @ApiPropertyOptional({ description: 'Effective to date' })
  @IsDateString()
  @IsOptional()
  effectiveTo?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class SetRecurringAvailabilityDto {
  @ApiProperty({ type: [CreateAvailabilityDto], description: 'Weekly availability slots' })
  availability!: CreateAvailabilityDto[];
}

export class RequestTimeOffDto {
  @ApiProperty({ description: 'Start date (YYYY-MM-DD)' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ description: 'End date (YYYY-MM-DD)' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ description: 'Reason for time off request' })
  @IsString()
  @IsOptional()
  reason?: string;
}
