import {
  IsUUID,
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsArray,
  ValidateNested,
  Min,
  ArrayMinSize,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

// UUID regex that accepts any valid format (doesn't check version bits)
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

export enum TicketStatus {
  VALID = 'valid',
  USED = 'used',
  VOIDED = 'voided',
  EXPIRED = 'expired',
  TRANSFERRED = 'transferred',
}

export class OrderItemDto {
  @ApiProperty({ description: 'Ticket type ID' })
  @Matches(UUID_REGEX, { message: 'ticketTypeId must be a valid UUID format' })
  ticketTypeId!: string;

  @ApiPropertyOptional({ description: 'Time slot ID' })
  @Matches(UUID_REGEX, { message: 'timeSlotId must be a valid UUID format' })
  @IsOptional()
  timeSlotId?: string;

  @ApiProperty({ description: 'Quantity' })
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Attraction ID' })
  @Matches(UUID_REGEX, { message: 'attractionId must be a valid UUID format' })
  attractionId!: string;

  @ApiPropertyOptional({ description: 'Order source ID' })
  @Matches(UUID_REGEX, { message: 'sourceId must be a valid UUID format' })
  @IsOptional()
  sourceId?: string;

  @ApiProperty({ description: 'Customer email' })
  @IsEmail()
  customerEmail!: string;

  @ApiPropertyOptional({ description: 'Customer name' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Customer phone' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiProperty({ description: 'Order items', type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ApiPropertyOptional({ description: 'Promo code' })
  @IsString()
  @IsOptional()
  promoCode?: string;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateOrderDto {
  @ApiPropertyOptional({ description: 'Order status', enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Customer name' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Customer phone' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ListOrdersQueryDto {
  @ApiPropertyOptional({ description: 'Filter by attraction ID' })
  @Matches(UUID_REGEX, { message: 'attractionId must be a valid UUID format' })
  @IsOptional()
  attractionId?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: OrderStatus })
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Filter by customer email' })
  @IsEmail()
  @IsOptional()
  customerEmail?: string;

  @ApiPropertyOptional({ description: 'Filter from date (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Filter to date (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  toDate?: string;

  @ApiPropertyOptional({ description: 'Page number' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  @Transform(({ value }) => parseInt(value, 10))
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number;
}

export class UpdateTicketStatusDto {
  @ApiProperty({ description: 'Ticket status', enum: TicketStatus })
  @IsEnum(TicketStatus)
  status!: TicketStatus;

  @ApiPropertyOptional({ description: 'Reason for status change' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class ValidateTicketDto {
  @ApiProperty({ description: 'Ticket barcode' })
  @IsString()
  barcode!: string;
}

export class RefundOrderDto {
  @ApiPropertyOptional({ description: 'Reason for refund' })
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiPropertyOptional({ description: 'Partial refund amount in cents (null = full refund)' })
  @IsInt()
  @Min(1)
  @IsOptional()
  amount?: number;

  @ApiPropertyOptional({ description: 'Specific item IDs to refund', type: [String] })
  @IsUUID('4', { each: true })
  @IsOptional()
  itemIds?: string[];
}

export class CartSessionDto {
  @ApiProperty({ description: 'Attraction ID' })
  @Matches(UUID_REGEX, { message: 'attractionId must be a valid UUID format' })
  attractionId!: string;

  @ApiProperty({ description: 'Cart items', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ApiPropertyOptional({ description: 'Promo code' })
  @IsString()
  @IsOptional()
  promoCode?: string;
}

export class CheckoutDto {
  @ApiProperty({ description: 'Cart session ID' })
  @Matches(UUID_REGEX, { message: 'cartSessionId must be a valid UUID format' })
  cartSessionId!: string;

  @ApiProperty({ description: 'Customer email' })
  @IsEmail()
  customerEmail!: string;

  @ApiPropertyOptional({ description: 'Customer name' })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Customer phone' })
  @IsString()
  @IsOptional()
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'Waiver accepted' })
  @IsBoolean()
  @IsOptional()
  waiverAccepted?: boolean;
}
