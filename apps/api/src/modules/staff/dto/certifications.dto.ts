import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class AddCertificationDto {
  @ApiProperty({ example: 'cpr' })
  @IsString()
  type!: string;

  @ApiPropertyOptional({ example: 'CPR-2024-67890' })
  @IsString()
  @IsOptional()
  certificate_number?: string;

  @ApiProperty({ example: '2024-09-01' })
  @IsDateString()
  issued_at!: string;

  @ApiPropertyOptional({ example: '2026-09-01' })
  @IsDateString()
  @IsOptional()
  expires_at?: string;
}
