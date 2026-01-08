import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FIXED_PRICE = 'fixed_price',
}

export class CreatePromoCodeDto {
  @ApiProperty({ description: 'Promo code (uppercase, alphanumeric)' })
  @IsString()
  @MaxLength(50)
  @Transform(({ value }) => value?.toUpperCase())
  code!: string;

  @ApiPropertyOptional({ description: 'Promo code name' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Discount type', enum: DiscountType })
  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @ApiProperty({ description: 'Discount value (percentage 0-100 or fixed amount in cents)' })
  @IsInt()
  @Min(0)
  discountValue!: number;

  @ApiPropertyOptional({ description: 'Minimum order amount in cents' })
  @IsInt()
  @Min(0)
  @IsOptional()
  minOrderAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum discount in cents (for percentage discounts)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  maxDiscount?: number;

  @ApiPropertyOptional({ description: 'Maximum total uses (null = unlimited)' })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxUses?: number;

  @ApiPropertyOptional({ description: 'Maximum uses per customer' })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxUsesPerCustomer?: number;

  @ApiPropertyOptional({ description: 'Valid from date' })
  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @ApiPropertyOptional({ description: 'Valid until date' })
  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @ApiPropertyOptional({ description: 'Restrict to specific ticket type IDs', type: [String] })
  @IsUUID('4', { each: true })
  @IsOptional()
  applicableTicketTypes?: string[];

  @ApiPropertyOptional({ description: 'Restrict to specific attraction IDs', type: [String] })
  @IsUUID('4', { each: true })
  @IsOptional()
  applicableAttractions?: string[];
}

export class UpdatePromoCodeDto {
  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Discount type', enum: DiscountType })
  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @ApiPropertyOptional({ description: 'Discount value' })
  @IsInt()
  @Min(0)
  @IsOptional()
  discountValue?: number;

  @ApiPropertyOptional({ description: 'Minimum order amount in cents' })
  @IsInt()
  @Min(0)
  @IsOptional()
  minOrderAmount?: number;

  @ApiPropertyOptional({ description: 'Maximum discount in cents' })
  @IsInt()
  @Min(0)
  @IsOptional()
  maxDiscount?: number;

  @ApiPropertyOptional({ description: 'Maximum total uses' })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxUses?: number;

  @ApiPropertyOptional({ description: 'Maximum uses per customer' })
  @IsInt()
  @Min(1)
  @IsOptional()
  maxUsesPerCustomer?: number;

  @ApiPropertyOptional({ description: 'Valid from date' })
  @IsDateString()
  @IsOptional()
  validFrom?: string;

  @ApiPropertyOptional({ description: 'Valid until date' })
  @IsDateString()
  @IsOptional()
  validUntil?: string;

  @ApiPropertyOptional({ description: 'Restrict to specific ticket type IDs', type: [String] })
  @IsUUID('4', { each: true })
  @IsOptional()
  applicableTicketTypes?: string[];

  @ApiPropertyOptional({ description: 'Restrict to specific attraction IDs', type: [String] })
  @IsUUID('4', { each: true })
  @IsOptional()
  applicableAttractions?: string[];

  @ApiPropertyOptional({ description: 'Is active' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class ListPromoCodesQueryDto {
  @ApiPropertyOptional({ description: 'Include inactive codes' })
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  includeInactive?: boolean;

  @ApiPropertyOptional({ description: 'Only show currently valid codes' })
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  @IsOptional()
  currentlyValid?: boolean;
}

export class ValidatePromoCodeDto {
  @ApiProperty({ description: 'Promo code to validate' })
  @IsString()
  code!: string;

  @ApiPropertyOptional({ description: 'Order subtotal in cents (for minimum check)' })
  @IsInt()
  @Min(0)
  @IsOptional()
  orderSubtotal?: number;

  @ApiPropertyOptional({ description: 'Ticket type ID (for applicability check)' })
  @IsUUID()
  @IsOptional()
  ticketTypeId?: string;

  @ApiPropertyOptional({ description: 'Attraction ID (for applicability check)' })
  @IsUUID()
  @IsOptional()
  attractionId?: string;

  @ApiPropertyOptional({ description: 'Customer email (for per-customer limit check)' })
  @IsString()
  @IsOptional()
  customerEmail?: string;
}
