import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';

// UUID regex that accepts any valid format
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class CheckoutItemDto {
  @ApiProperty({ description: 'Ticket type ID' })
  @Matches(UUID_REGEX, { message: 'ticketTypeId must be a valid UUID format' })
  ticketTypeId!: string;

  @ApiPropertyOptional({ description: 'Time slot ID for timed tickets' })
  @Matches(UUID_REGEX, { message: 'timeSlotId must be a valid UUID format' })
  @IsOptional()
  timeSlotId?: string;

  @ApiProperty({ description: 'Quantity', minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateCheckoutSessionDto {
  @ApiProperty({ description: 'Customer email address' })
  @IsEmail()
  customerEmail!: string;

  @ApiPropertyOptional({ description: 'Customer full name' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Customer phone number' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiProperty({ description: 'Items to purchase', type: [CheckoutItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items!: CheckoutItemDto[];

  @ApiPropertyOptional({ description: 'Promo code to apply' })
  @IsString()
  @IsOptional()
  promoCode?: string;

  @ApiPropertyOptional({ description: 'Source ID for tracking (e.g., campaign, referral)' })
  @Matches(UUID_REGEX, { message: 'sourceId must be a valid UUID format' })
  @IsOptional()
  sourceId?: string;

  @ApiProperty({ description: 'URL to redirect to after successful payment' })
  @IsString()
  successUrl!: string;

  @ApiProperty({ description: 'URL to redirect to if checkout is canceled' })
  @IsString()
  cancelUrl!: string;
}

export class ConfirmPaymentDto {
  @ApiProperty({ description: 'Stripe PaymentIntent ID' })
  @IsString()
  paymentIntentId!: string;

  @ApiPropertyOptional({ description: 'Whether the customer accepted the waiver' })
  @IsBoolean()
  @IsOptional()
  waiverAccepted?: boolean;

  @ApiPropertyOptional({ description: 'Customer name (for waiver)' })
  @IsString()
  @IsOptional()
  customerName?: string;
}

export class CancelCheckoutDto {
  @ApiProperty({ description: 'Stripe PaymentIntent ID to cancel' })
  @IsString()
  paymentIntentId!: string;
}
