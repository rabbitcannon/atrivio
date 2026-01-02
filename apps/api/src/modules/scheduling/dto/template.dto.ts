import { IsUUID, IsOptional, IsString, IsInt, Min, Max, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateShiftTemplateDto {
  @ApiProperty({ description: 'Attraction ID' })
  @IsUUID()
  attractionId!: string;

  @ApiProperty({ description: 'Template name' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'Schedule role ID' })
  @IsUUID()
  roleId!: string;

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

  @ApiPropertyOptional({ description: 'Number of staff needed for this role' })
  @IsInt()
  @Min(1)
  @IsOptional()
  staffCount?: number;

  @ApiPropertyOptional({ description: 'Template is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateShiftTemplateDto {
  @ApiPropertyOptional({ description: 'Template name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Schedule role ID' })
  @IsUUID()
  @IsOptional()
  roleId?: string;

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

  @ApiPropertyOptional({ description: 'Number of staff needed' })
  @IsInt()
  @Min(1)
  @IsOptional()
  staffCount?: number;

  @ApiPropertyOptional({ description: 'Template is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class GenerateFromTemplatesDto {
  @ApiProperty({ description: 'Start date for generation (YYYY-MM-DD)' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ description: 'End date for generation (YYYY-MM-DD)' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ description: 'Only use specific template IDs' })
  @IsUUID('all', { each: true })
  @IsOptional()
  templateIds?: string[];

  @ApiPropertyOptional({ description: 'Leave shifts unassigned (draft mode)' })
  @IsBoolean()
  @IsOptional()
  asDraft?: boolean;
}
