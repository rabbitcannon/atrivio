import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class SignWaiverDto {
  @ApiProperty({ example: 'liability_waiver' })
  @IsString()
  waiver_type!: string;

  @ApiProperty({ example: '2024-v1' })
  @IsString()
  waiver_version!: string;

  @ApiPropertyOptional({ description: 'Base64 encoded signature image' })
  @IsString()
  @IsOptional()
  signature_data?: string;
}
