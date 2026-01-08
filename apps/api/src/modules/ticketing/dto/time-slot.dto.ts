import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';

// UUID regex that accepts any valid format (doesn't check version bits)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CreateTimeSlotDto {
  @ApiProperty({ description: 'Attraction ID' })
  @Matches(UUID_REGEX, { message: 'attractionId must be a valid UUID format' })
  attractionId!: string;

  @ApiPropertyOptional({ description: 'Season ID' })
  @IsUUID()
  @IsOptional()
  seasonId?: string;

  @ApiProperty({ description: 'Date for this time slot (YYYY-MM-DD)' })
  @IsDateString()
  date!: string;

  @ApiProperty({ description: 'Start time (HH:MM:SS)' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'startTime must be in HH:MM:SS format',
  })
  startTime!: string;

  @ApiProperty({ description: 'End time (HH:MM:SS)' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'endTime must be in HH:MM:SS format',
  })
  endTime!: string;

  @ApiPropertyOptional({ description: 'Capacity for this slot (null = unlimited)' })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({ description: 'Price modifier in cents (added to base price)' })
  @IsInt()
  @IsOptional()
  priceModifier?: number;

  @ApiPropertyOptional({ description: 'Label for display (e.g., "Peak Hours")' })
  @IsString()
  @IsOptional()
  label?: string;
}

export class UpdateTimeSlotDto {
  @ApiPropertyOptional({ description: 'Start time (HH:MM:SS)' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'startTime must be in HH:MM:SS format',
  })
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ description: 'End time (HH:MM:SS)' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'endTime must be in HH:MM:SS format',
  })
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Capacity for this slot' })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({ description: 'Price modifier in cents' })
  @IsInt()
  @IsOptional()
  priceModifier?: number;

  @ApiPropertyOptional({ description: 'Label for display' })
  @IsString()
  @IsOptional()
  label?: string;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ListTimeSlotsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by attraction ID' })
  @Matches(UUID_REGEX, { message: 'attractionId must be a valid UUID format' })
  @IsOptional()
  attractionId?: string;

  @ApiPropertyOptional({ description: 'Filter by season ID' })
  @IsUUID()
  @IsOptional()
  seasonId?: string;

  @ApiPropertyOptional({ description: 'Filter by date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ description: 'Filter from date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Filter to date (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Include inactive slots' })
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  includeInactive?: boolean;

  @ApiPropertyOptional({ description: 'Only show available slots (with capacity)' })
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  availableOnly?: boolean;
}

export class BulkCreateTimeSlotsDto {
  @ApiProperty({ description: 'Attraction ID' })
  @Matches(UUID_REGEX, { message: 'attractionId must be a valid UUID format' })
  attractionId!: string;

  @ApiPropertyOptional({ description: 'Season ID' })
  @IsUUID()
  @IsOptional()
  seasonId?: string;

  @ApiProperty({ description: 'Start date (YYYY-MM-DD)' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ description: 'End date (YYYY-MM-DD)' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ description: 'Start time (HH:MM:SS)' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
  startTime!: string;

  @ApiProperty({ description: 'End time (HH:MM:SS)' })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
  endTime!: string;

  @ApiProperty({ description: 'Interval in minutes between slots' })
  @IsInt()
  @Min(15)
  @Max(480)
  intervalMinutes!: number;

  @ApiPropertyOptional({ description: 'Capacity per slot' })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({ description: 'Days of week (0=Sun, 6=Sat)', type: [Number] })
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  @IsOptional()
  daysOfWeek?: number[];
}
