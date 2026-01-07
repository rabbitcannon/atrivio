import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';
import { ItemCondition } from './inventory.dto.js';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CreateCheckoutDto {
  @ApiProperty({ description: 'Item ID to check out' })
  @Matches(UUID_REGEX, { message: 'itemId must be a valid UUID format' })
  itemId!: string;

  @ApiProperty({ description: 'Staff profile ID who is receiving the item' })
  @Matches(UUID_REGEX, { message: 'staffId must be a valid UUID format' })
  staffId!: string;

  @ApiPropertyOptional({ description: 'Quantity to check out (default: 1)' })
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Due date for return (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Condition when checked out', enum: ItemCondition })
  @IsEnum(ItemCondition)
  @IsOptional()
  conditionOut?: ItemCondition;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ReturnCheckoutDto {
  @ApiPropertyOptional({ description: 'Condition when returned', enum: ItemCondition })
  @IsEnum(ItemCondition)
  @IsOptional()
  conditionIn?: ItemCondition;

  @ApiPropertyOptional({ description: 'Notes about the return' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ListCheckoutsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by item ID' })
  @Matches(UUID_REGEX, { message: 'itemId must be a valid UUID format' })
  @IsOptional()
  itemId?: string;

  @ApiPropertyOptional({ description: 'Filter by staff profile ID' })
  @Matches(UUID_REGEX, { message: 'staffId must be a valid UUID format' })
  @IsOptional()
  staffId?: string;

  @ApiPropertyOptional({ description: 'Filter active only (not returned)' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  activeOnly?: boolean;

  @ApiPropertyOptional({ description: 'Filter overdue only' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsOptional()
  overdueOnly?: boolean;

  @ApiPropertyOptional({ description: 'Page number' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}
