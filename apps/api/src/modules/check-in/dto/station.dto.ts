import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// UUID regex that accepts any valid format
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CreateStationDto {
  @ApiProperty({ description: 'Station name' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Physical location description' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Device identifier' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  deviceId?: string;

  @ApiPropertyOptional({ description: 'Is station active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Additional settings (JSON)' })
  @IsOptional()
  settings?: Record<string, unknown>;
}

export class UpdateStationDto {
  @ApiPropertyOptional({ description: 'Station name' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Physical location description' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Device identifier' })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  deviceId?: string;

  @ApiPropertyOptional({ description: 'Is station active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Additional settings (JSON)' })
  @IsOptional()
  settings?: Record<string, unknown>;
}

export class StationResponseDto {
  id!: string;
  name!: string;
  location!: string | null;
  deviceId!: string | null;
  isActive!: boolean;
  lastActivity!: string | null;
  todayCount!: number;
  settings!: Record<string, unknown>;
  createdAt!: string;
  updatedAt!: string;
}

export class ListStationsResponseDto {
  stations!: StationResponseDto[];
}
