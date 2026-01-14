import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by attraction ID' })
  @IsUUID()
  @IsOptional()
  attractionId?: string;

  @ApiPropertyOptional({
    description: 'Time period preset',
    enum: ['today', 'yesterday', 'week', 'month', 'quarter', 'year', 'custom'],
  })
  @IsEnum(['today', 'yesterday', 'week', 'month', 'quarter', 'year', 'custom'])
  @IsOptional()
  period?: 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

  @ApiPropertyOptional({ description: 'Start date (YYYY-MM-DD) - required for custom period' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (YYYY-MM-DD) - required for custom period' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Group data by time interval',
    enum: ['day', 'week', 'month'],
  })
  @IsEnum(['day', 'week', 'month'])
  @IsOptional()
  groupBy?: 'day' | 'week' | 'month';

  @ApiPropertyOptional({ description: 'Include comparison to previous period' })
  @Transform(({ value }) => value === 'true')
  @IsOptional()
  includeComparison?: boolean;
}

export class TicketAnalyticsQueryDto extends AnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by ticket type ID' })
  @IsUUID()
  @IsOptional()
  ticketTypeId?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}

export class StaffAnalyticsQueryDto extends AnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by staff profile ID' })
  @IsUUID()
  @IsOptional()
  staffId?: string;

  @ApiPropertyOptional({ description: 'Filter by role' })
  @IsOptional()
  role?: string;
}

export class PromoAnalyticsQueryDto extends AnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by promo code ID' })
  @IsUUID()
  @IsOptional()
  promoCodeId?: string;
}

export class PaginatedAnalyticsQueryDto extends AnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Page number (1-indexed)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page (max 100)' })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
