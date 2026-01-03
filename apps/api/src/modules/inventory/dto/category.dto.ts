import {
  IsString,
  IsOptional,
  IsInt,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Parent category ID for nesting' })
  @Matches(UUID_REGEX, { message: 'parentId must be a valid UUID format' })
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Icon identifier' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: 'Hex color code' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be a valid hex color code' })
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Sort order' })
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @Matches(UUID_REGEX, { message: 'parentId must be a valid UUID format' })
  @IsOptional()
  parentId?: string | null;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(50)
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be a valid hex color code' })
  @IsOptional()
  color?: string;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}
