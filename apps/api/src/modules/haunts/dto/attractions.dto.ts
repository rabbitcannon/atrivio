import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class AddressDto {
  @ApiProperty({ example: '456 Creepy Road' })
  @IsString()
  line1!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  line2?: string;

  @ApiProperty({ example: 'Salem' })
  @IsString()
  city!: string;

  @ApiProperty({ example: 'MA' })
  @IsString()
  state!: string;

  @ApiProperty({ example: '01970' })
  @IsString()
  postal_code!: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  country!: string;
}

export class CoordinatesDto {
  @ApiProperty({ example: 42.5195 })
  @IsNumber()
  latitude!: number;

  @ApiProperty({ example: -70.8967 })
  @IsNumber()
  longitude!: number;
}

export class CreateAttractionDto {
  @ApiProperty({ example: 'Terror Trail' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'terror-trail' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug!: string;

  @ApiProperty({
    example: 'c0000000-0000-0000-0000-000000000001',
    description: 'UUID of the attraction type from attraction_types table',
  })
  @IsString()
  type_id!: string;

  @ApiPropertyOptional({ example: 'A terrifying journey through the dark woods...' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @ApiPropertyOptional({ example: 200 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  capacity?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  min_age?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  intensity_level?: number;

  @ApiPropertyOptional({ example: 45 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  duration_minutes?: number;
}

export class UpdateAttractionDto {
  @ApiPropertyOptional({ example: 'Terror Trail - Extended Edition' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://terrortrail.com' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional({ example: 'info@terrortrail.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  @IsOptional()
  coordinates?: CoordinatesDto;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional({ example: 250 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  capacity?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  min_age?: number;

  @ApiPropertyOptional({ example: 4 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(5)
  intensity_level?: number;

  @ApiPropertyOptional({ example: 45 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  duration_minutes?: number;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  settings?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  seo_metadata?: Record<string, unknown>;
}
