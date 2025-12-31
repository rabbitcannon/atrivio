import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, Matches, Min } from 'class-validator';

export class CreateZoneDto {
  @ApiProperty({ example: 'Zombie Woods' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'Main trail section with zombie actors' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 30 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  capacity?: number;

  @ApiPropertyOptional({ example: '#228B22' })
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color code (e.g., #228B22)',
  })
  color?: string;
}

export class UpdateZoneDto {
  @ApiPropertyOptional({ example: 'Zombie Forest' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 40 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  capacity?: number;

  @ApiPropertyOptional({ example: '#228B22' })
  @IsString()
  @IsOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'Color must be a valid hex color code (e.g., #228B22)',
  })
  color?: string;
}

export class ReorderZonesDto {
  @ApiProperty({ example: ['zone-id-1', 'zone-id-2', 'zone-id-3'] })
  @IsArray()
  @IsString({ each: true })
  zone_ids!: string[];
}
