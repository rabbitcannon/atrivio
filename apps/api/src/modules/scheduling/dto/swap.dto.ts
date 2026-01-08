import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export type SwapType = 'swap' | 'drop' | 'pickup';
export type SwapStatus = 'pending' | 'approved' | 'rejected' | 'canceled' | 'expired';

export class CreateSwapRequestDto {
  @ApiProperty({
    description: 'Type of swap request',
    enum: ['swap', 'drop', 'pickup'],
  })
  @IsEnum(['swap', 'drop', 'pickup'])
  swapType!: SwapType;

  @ApiPropertyOptional({ description: 'Target staff ID (for swap type)' })
  @IsUUID()
  @IsOptional()
  targetStaffId?: string;

  @ApiPropertyOptional({ description: 'Target schedule ID to swap with' })
  @IsUUID()
  @IsOptional()
  targetScheduleId?: string;

  @ApiPropertyOptional({ description: 'Reason for the request' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class ApproveSwapDto {
  @ApiPropertyOptional({ description: 'Approval notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class RejectSwapDto {
  @ApiProperty({ description: 'Rejection reason' })
  @IsString()
  reason!: string;
}

export class ListSwapRequestsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsEnum(['pending', 'approved', 'rejected', 'canceled', 'expired'])
  @IsOptional()
  status?: SwapStatus;

  @ApiPropertyOptional({ description: 'Filter by swap type' })
  @IsEnum(['swap', 'drop', 'pickup'])
  @IsOptional()
  swapType?: SwapType;

  @ApiPropertyOptional({ description: 'Filter by requesting staff ID' })
  @IsUUID()
  @IsOptional()
  requestingStaffId?: string;

  @ApiPropertyOptional({ description: 'Filter by requesting user ID (resolves to staff ID)' })
  @IsUUID()
  @IsOptional()
  requestingUserId?: string;
}
