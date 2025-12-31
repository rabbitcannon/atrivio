import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsDateString,
  Min,
} from 'class-validator';

export class ClockInDto {
  @ApiProperty({ example: 'attraction-uuid' })
  @IsString()
  attraction_id!: string;
}

export class ClockOutDto {
  @ApiPropertyOptional({ example: 30, description: 'Break time in minutes' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  break_minutes?: number;

  @ApiPropertyOptional({ example: 'Extended shift for Halloween' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateTimeEntryDto {
  @ApiPropertyOptional({ example: '2024-10-25T17:00:00Z' })
  @IsDateString()
  @IsOptional()
  clock_in?: string;

  @ApiPropertyOptional({ example: '2024-10-26T01:30:00Z' })
  @IsDateString()
  @IsOptional()
  clock_out?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  break_minutes?: number;

  @ApiPropertyOptional({ example: 'Corrected start time' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class BulkApproveDto {
  @ApiProperty({ example: ['entry-uuid-1', 'entry-uuid-2'] })
  @IsArray()
  @IsString({ each: true })
  entry_ids!: string[];
}

export class TimeQueryDto {
  @ApiPropertyOptional({ example: '2024-10-01' })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({ example: '2024-10-31' })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  status?: string;
}
