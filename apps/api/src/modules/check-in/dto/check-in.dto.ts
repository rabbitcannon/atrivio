import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsEmail,
  IsBoolean,
  IsInt,
  IsArray,
  IsDateString,
  Min,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

// UUID regex that accepts any valid format
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export enum CheckInMethod {
  BARCODE_SCAN = 'barcode_scan',
  QR_SCAN = 'qr_scan',
  MANUAL_LOOKUP = 'manual_lookup',
  ORDER_NUMBER = 'order_number',
  WALK_UP = 'walk_up',
}

export enum LookupType {
  EMAIL = 'email',
  PHONE = 'phone',
  ORDER_NUMBER = 'order_number',
  TICKET_NUMBER = 'ticket_number',
  NAME = 'name',
}

export enum QueueStatus {
  PENDING = 'pending',
  LATE = 'late',
  NO_SHOW = 'no_show',
}

export enum CapacityStatus {
  NORMAL = 'normal',
  BUSY = 'busy',
  CRITICAL = 'critical',
  FULL = 'full',
}

// ============== Scan Check-In ==============

export class ScanCheckInDto {
  @ApiProperty({ description: 'Ticket barcode or QR code' })
  @IsString()
  barcode!: string;

  @ApiPropertyOptional({ description: 'Check-in station ID' })
  @Matches(UUID_REGEX, { message: 'stationId must be a valid UUID format' })
  @IsOptional()
  stationId?: string;

  @ApiProperty({ description: 'Check-in method', enum: CheckInMethod })
  @IsEnum(CheckInMethod)
  method!: CheckInMethod;

  @ApiPropertyOptional({ description: 'Guest count for group tickets' })
  @IsInt()
  @Min(1)
  @IsOptional()
  guestCount?: number;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class CheckInResponseDto {
  success!: boolean;
  ticket?: {
    id: string;
    ticketNumber: string;
    ticketType: string;
    guestName: string | null;
    timeSlot: string | null;
  };
  order?: {
    orderNumber: string;
    ticketCount: number;
    checkedInCount: number;
  };
  waiverRequired!: boolean;
  waiverSigned!: boolean;
  checkInId?: string;
}

export class CheckInErrorResponseDto {
  success!: boolean;
  error!: string;
  message!: string;
  checkedInAt?: string;
}

// ============== Manual Lookup ==============

export class LookupDto {
  @ApiProperty({ description: 'Search query (email, phone, order number, etc.)' })
  @IsString()
  query!: string;

  @ApiProperty({ description: 'Type of lookup', enum: LookupType })
  @IsEnum(LookupType)
  type!: LookupType;
}

export class LookupTicketDto {
  id!: string;
  ticketNumber!: string;
  ticketType!: string;
  timeSlot!: string | null;
  status!: string;
  checkedIn!: boolean;
}

export class LookupOrderDto {
  orderNumber!: string;
  customerName!: string | null;
  tickets!: LookupTicketDto[];
}

export class LookupResponseDto {
  orders!: LookupOrderDto[];
}

// ============== Waiver ==============

export class RecordWaiverDto {
  @ApiProperty({ description: 'Ticket ID' })
  @Matches(UUID_REGEX, { message: 'ticketId must be a valid UUID format' })
  ticketId!: string;

  @ApiPropertyOptional({ description: 'Order ID (alternative to ticket ID)' })
  @Matches(UUID_REGEX, { message: 'orderId must be a valid UUID format' })
  @IsOptional()
  orderId?: string;

  @ApiProperty({ description: 'Guest name' })
  @IsString()
  guestName!: string;

  @ApiPropertyOptional({ description: 'Guest email' })
  @IsEmail()
  @IsOptional()
  guestEmail?: string;

  @ApiPropertyOptional({ description: 'Guest phone' })
  @IsString()
  @IsOptional()
  guestPhone?: string;

  @ApiPropertyOptional({ description: 'Guest date of birth (YYYY-MM-DD)' })
  @IsDateString()
  @IsOptional()
  guestDob?: string;

  @ApiPropertyOptional({ description: 'Is guest a minor' })
  @IsBoolean()
  @IsOptional()
  isMinor?: boolean;

  @ApiPropertyOptional({ description: 'Guardian name (required if minor)' })
  @IsString()
  @IsOptional()
  guardianName?: string;

  @ApiPropertyOptional({ description: 'Guardian email' })
  @IsEmail()
  @IsOptional()
  guardianEmail?: string;

  @ApiPropertyOptional({ description: 'Guardian phone' })
  @IsString()
  @IsOptional()
  guardianPhone?: string;

  @ApiPropertyOptional({ description: 'Signature data (base64)' })
  @IsString()
  @IsOptional()
  signatureData?: string;

  @ApiPropertyOptional({ description: 'Waiver version' })
  @IsString()
  @IsOptional()
  waiverVersion?: string;
}

// ============== Capacity ==============

export class CapacityResponseDto {
  currentCount!: number;
  capacity!: number;
  percentage!: number;
  status!: CapacityStatus;
  estimatedWaitMinutes!: number;
  checkedInLastHour!: number;
  byTimeSlot!: {
    slot: string;
    expected: number;
    checkedIn: number;
  }[];
}

// ============== Stats ==============

export class GetStatsQueryDto {
  @ApiPropertyOptional({ description: 'Date for stats (YYYY-MM-DD), defaults to today' })
  @IsString()
  @IsOptional()
  date?: string;
}

export class StatsResponseDto {
  date!: string;
  totalCheckedIn!: number;
  totalExpected!: number;
  checkInRate!: number;
  byHour!: { hour: string; count: number }[];
  byStation!: { station: string; count: number }[];
  byMethod!: { method: string; count: number }[];
  avgCheckInTimeSeconds!: number;
}

// ============== Queue ==============

export class GetQueueQueryDto {
  @ApiPropertyOptional({ description: 'Filter by time slot ID' })
  @Matches(UUID_REGEX, { message: 'timeSlotId must be a valid UUID format' })
  @IsOptional()
  timeSlotId?: string;

  @ApiPropertyOptional({ description: 'Filter by status', enum: QueueStatus })
  @IsEnum(QueueStatus)
  @IsOptional()
  status?: QueueStatus;
}

export class QueueItemDto {
  ticketId!: string;
  guestName!: string | null;
  timeSlot!: string;
  status!: QueueStatus;
  minutesUntil?: number;
  minutesLate?: number;
}

export class QueueResponseDto {
  pending!: QueueItemDto[];
  late!: QueueItemDto[];
}

// ============== Walk-Up Sales ==============

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  COMP = 'comp',
}

export class WalkUpSaleDto {
  @ApiProperty({ description: 'Ticket type ID' })
  @Matches(UUID_REGEX, { message: 'ticketTypeId must be a valid UUID format' })
  ticketTypeId!: string;

  @ApiProperty({ description: 'Quantity of tickets' })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ description: 'Guest names', type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  guestNames?: string[];

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiPropertyOptional({ description: 'Waiver already signed' })
  @IsBoolean()
  @IsOptional()
  waiverSigned?: boolean;

  @ApiPropertyOptional({ description: 'Notes' })
  @IsString()
  @IsOptional()
  notes?: string;
}

// ============== List Check-Ins ==============

export class ListCheckInsQueryDto {
  @ApiPropertyOptional({ description: 'Filter from date/time' })
  @IsString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({ description: 'Filter to date/time' })
  @IsString()
  @IsOptional()
  to?: string;

  @ApiPropertyOptional({ description: 'Filter by station ID' })
  @Matches(UUID_REGEX, { message: 'stationId must be a valid UUID format' })
  @IsOptional()
  stationId?: string;

  @ApiPropertyOptional({ description: 'Filter by check-in method', enum: CheckInMethod })
  @IsEnum(CheckInMethod)
  @IsOptional()
  method?: CheckInMethod;

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
