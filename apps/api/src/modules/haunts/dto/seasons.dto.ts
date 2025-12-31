import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsDateString, IsEnum } from 'class-validator';

const SEASON_STATUS = ['upcoming', 'active', 'completed', 'cancelled'] as const;
type SeasonStatus = (typeof SEASON_STATUS)[number];

export class CreateSeasonDto {
  @ApiProperty({ example: 'Halloween 2024' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 2024 })
  @IsNumber()
  year!: number;

  @ApiProperty({ example: '2024-09-15' })
  @IsDateString()
  start_date!: string;

  @ApiProperty({ example: '2024-11-02' })
  @IsDateString()
  end_date!: string;
}

export class UpdateSeasonDto {
  @ApiPropertyOptional({ example: 'Halloween 2024 Extended' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 2024 })
  @IsNumber()
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({ example: '2024-09-15' })
  @IsDateString()
  @IsOptional()
  start_date?: string;

  @ApiPropertyOptional({ example: '2024-11-03' })
  @IsDateString()
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional({ enum: SEASON_STATUS, example: 'active' })
  @IsEnum(SEASON_STATUS)
  @IsOptional()
  status?: SeasonStatus;
}
