import {
  IsUUID,
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsArray,
  IsDateString,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

// UUID regex that accepts any valid format (doesn't check version bits)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CreateTicketTypeDto {
  @ApiProperty({ description: 'Attraction ID' })
  @Matches(UUID_REGEX, { message: 'attractionId must be a valid UUID format' })
  attractionId!: string;

  @ApiPropertyOptional({ description: 'Season ID' })
  @IsUUID()
  @IsOptional()
  seasonId?: string;

  @ApiProperty({ description: 'Ticket type name' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Price in cents' })
  @IsInt()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ description: 'Compare price (strike-through) in cents' })
  @IsInt()
  @Min(0)
  @IsOptional()
  comparePrice?: number;

  @ApiPropertyOptional({ description: 'Ticket category ID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Maximum per order' })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  maxPerOrder?: number;

  @ApiPropertyOptional({ description: 'Minimum per order' })
  @IsInt()
  @Min(1)
  @IsOptional()
  minPerOrder?: number;

  @ApiPropertyOptional({ description: 'Total capacity (null = unlimited)' })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({ description: 'What is included', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  includes?: string[];

  @ApiPropertyOptional({ description: 'Restrictions (JSON object)' })
  @IsOptional()
  restrictions?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Available from date' })
  @IsDateString()
  @IsOptional()
  availableFrom?: string;

  @ApiPropertyOptional({ description: 'Available until date' })
  @IsDateString()
  @IsOptional()
  availableUntil?: string;
}

export class UpdateTicketTypeDto {
  @ApiPropertyOptional({ description: 'Ticket type name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Price in cents' })
  @IsInt()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({ description: 'Compare price in cents' })
  @IsInt()
  @Min(0)
  @IsOptional()
  comparePrice?: number;

  @ApiPropertyOptional({ description: 'Ticket category ID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Maximum per order' })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  maxPerOrder?: number;

  @ApiPropertyOptional({ description: 'Minimum per order' })
  @IsInt()
  @Min(1)
  @IsOptional()
  minPerOrder?: number;

  @ApiPropertyOptional({ description: 'Total capacity' })
  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({ description: 'What is included', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  includes?: string[];

  @ApiPropertyOptional({ description: 'Restrictions' })
  @IsOptional()
  restrictions?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Display order' })
  @IsInt()
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Available from date' })
  @IsDateString()
  @IsOptional()
  availableFrom?: string;

  @ApiPropertyOptional({ description: 'Available until date' })
  @IsDateString()
  @IsOptional()
  availableUntil?: string;
}

export class ListTicketTypesQueryDto {
  @ApiPropertyOptional({ description: 'Filter by attraction ID' })
  @Matches(UUID_REGEX, { message: 'attractionId must be a valid UUID format' })
  @IsOptional()
  attractionId?: string;

  @ApiPropertyOptional({ description: 'Filter by season ID' })
  @IsUUID()
  @IsOptional()
  seasonId?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Include inactive ticket types' })
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  includeInactive?: boolean;
}
