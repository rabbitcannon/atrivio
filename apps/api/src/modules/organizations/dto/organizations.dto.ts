import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class AddressDto {
  @ApiProperty({ example: '123 Spooky Lane' })
  @IsString()
  line1!: string;

  @ApiPropertyOptional({ example: 'Suite 666' })
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

export class CreateOrgDto {
  @ApiProperty({ example: 'Scary Attractions LLC' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'scary-attractions' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug!: string;

  @ApiPropertyOptional({ example: 'contact@scaryattractions.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://scaryattractions.com' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @IsString()
  @IsOptional()
  timezone?: string;
}

export class UpdateOrgDto {
  @ApiPropertyOptional({ example: 'Super Scary Attractions LLC' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'new@scaryattractions.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'https://scaryattractions.com' })
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  @IsOptional()
  address?: AddressDto;

  @ApiPropertyOptional({ example: 'America/New_York' })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  settings?: Record<string, unknown>;
}
