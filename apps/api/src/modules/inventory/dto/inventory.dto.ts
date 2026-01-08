import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

// UUID regex that accepts any valid format
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ============== Enums ==============

export enum ItemCondition {
  NEW = 'new',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DAMAGED = 'damaged',
  RETIRED = 'retired',
}

export enum TransactionType {
  PURCHASE = 'purchase',
  ADJUSTMENT = 'adjustment',
  CHECKOUT = 'checkout',
  RETURN = 'return',
  TRANSFER = 'transfer',
  DAMAGED = 'damaged',
  LOST = 'lost',
  DISPOSED = 'disposed',
}

// ============== Inventory Types ==============

export class CreateInventoryTypeDto {
  @ApiProperty({ description: 'Unique key for the type' })
  @IsString()
  @MaxLength(50)
  key!: string;

  @ApiProperty({ description: 'Display name' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Category (production, technical, operations)' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Icon identifier' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: 'Hex color code' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be a valid hex color code' })
  @IsOptional()
  color?: string;

  @ApiPropertyOptional({ description: 'Is this type consumable' })
  @IsBoolean()
  @IsOptional()
  isConsumable?: boolean;

  @ApiPropertyOptional({ description: 'Does this type require checkout' })
  @IsBoolean()
  @IsOptional()
  requiresCheckout?: boolean;
}

export class UpdateInventoryTypeDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(50)
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(50)
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'color must be a valid hex color code' })
  @IsOptional()
  color?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isConsumable?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  requiresCheckout?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

// ============== Inventory Items ==============

export class CreateInventoryItemDto {
  @ApiPropertyOptional({ description: 'Attraction ID if item belongs to specific attraction' })
  @Matches(UUID_REGEX, { message: 'attractionId must be a valid UUID format' })
  @IsOptional()
  attractionId?: string;

  @ApiPropertyOptional({ description: 'Category ID' })
  @Matches(UUID_REGEX, { message: 'categoryId must be a valid UUID format' })
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ description: 'Inventory type ID' })
  @Matches(UUID_REGEX, { message: 'typeId must be a valid UUID format' })
  typeId!: string;

  @ApiPropertyOptional({ description: 'SKU (stock keeping unit)' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  sku?: string;

  @ApiProperty({ description: 'Item name' })
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ description: 'Description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Quantity in stock' })
  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({ description: 'Minimum quantity alert threshold' })
  @IsInt()
  @Min(0)
  @IsOptional()
  minQuantity?: number;

  @ApiPropertyOptional({ description: 'Maximum quantity' })
  @IsInt()
  @Min(0)
  @IsOptional()
  maxQuantity?: number;

  @ApiPropertyOptional({ description: 'Unit of measurement' })
  @IsString()
  @MaxLength(50)
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({ description: 'Unit cost in cents' })
  @IsInt()
  @Min(0)
  @IsOptional()
  unitCost?: number;

  @ApiPropertyOptional({ description: 'Storage location' })
  @IsString()
  @MaxLength(200)
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({ description: 'Item condition', enum: ItemCondition })
  @IsEnum(ItemCondition)
  @IsOptional()
  condition?: ItemCondition;

  @ApiPropertyOptional({ description: 'Image URL' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateInventoryItemDto {
  @ApiPropertyOptional()
  @Matches(UUID_REGEX, { message: 'attractionId must be a valid UUID format' })
  @IsOptional()
  attractionId?: string;

  @ApiPropertyOptional()
  @Matches(UUID_REGEX, { message: 'categoryId must be a valid UUID format' })
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional()
  @Matches(UUID_REGEX, { message: 'typeId must be a valid UUID format' })
  @IsOptional()
  typeId?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(50)
  @IsOptional()
  sku?: string;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(200)
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  minQuantity?: number;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  maxQuantity?: number;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(50)
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional()
  @IsInt()
  @Min(0)
  @IsOptional()
  unitCost?: number;

  @ApiPropertyOptional()
  @IsString()
  @MaxLength(200)
  @IsOptional()
  location?: string;

  @ApiPropertyOptional()
  @IsEnum(ItemCondition)
  @IsOptional()
  condition?: ItemCondition;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

// ============== Quantity Adjustment ==============

export class AdjustQuantityDto {
  @ApiProperty({ description: 'Quantity to adjust (positive or negative)' })
  @IsInt()
  quantity!: number;

  @ApiProperty({ description: 'Transaction type', enum: TransactionType })
  @IsEnum(TransactionType)
  type!: TransactionType;

  @ApiPropertyOptional({ description: 'Reason for adjustment' })
  @IsString()
  @IsOptional()
  reason?: string;
}

// ============== List/Query DTOs ==============

export class ListInventoryItemsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by type ID' })
  @Matches(UUID_REGEX, { message: 'typeId must be a valid UUID format' })
  @IsOptional()
  typeId?: string;

  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @Matches(UUID_REGEX, { message: 'categoryId must be a valid UUID format' })
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by attraction ID' })
  @Matches(UUID_REGEX, { message: 'attractionId must be a valid UUID format' })
  @IsOptional()
  attractionId?: string;

  @ApiPropertyOptional({ description: 'Filter by condition', enum: ItemCondition })
  @IsEnum(ItemCondition)
  @IsOptional()
  condition?: ItemCondition;

  @ApiPropertyOptional({ description: 'Filter by low stock (quantity <= minQuantity)' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  lowStock?: boolean;

  @ApiPropertyOptional({ description: 'Search by name or SKU' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Include inactive items' })
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  includeInactive?: boolean;

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
  @Max(100)
  @IsOptional()
  limit?: number;
}

export class ListTransactionsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by item ID' })
  @Matches(UUID_REGEX, { message: 'itemId must be a valid UUID format' })
  @IsOptional()
  itemId?: string;

  @ApiPropertyOptional({ description: 'Filter by transaction type', enum: TransactionType })
  @IsEnum(TransactionType)
  @IsOptional()
  type?: TransactionType;

  @ApiPropertyOptional({ description: 'Filter from date' })
  @IsString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ description: 'Filter to date' })
  @IsString()
  @IsOptional()
  to?: string;

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
  @Max(100)
  @IsOptional()
  limit?: number;
}
