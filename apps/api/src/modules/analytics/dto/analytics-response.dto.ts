import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Dashboard Overview Response
export class DashboardSummaryDto {
  @ApiProperty({ description: 'Total tickets sold' })
  ticketsSold!: number;

  @ApiProperty({ description: 'Total tickets checked in' })
  ticketsCheckedIn!: number;

  @ApiProperty({ description: 'Check-in rate (percentage)' })
  checkInRate!: number;

  @ApiProperty({ description: 'Total orders' })
  totalOrders!: number;

  @ApiProperty({ description: 'Gross revenue in cents' })
  grossRevenue!: number;

  @ApiProperty({ description: 'Net revenue after refunds in cents' })
  netRevenue!: number;

  @ApiProperty({ description: 'Total refunds in cents' })
  totalRefunds!: number;

  @ApiProperty({ description: 'Total discounts applied in cents' })
  totalDiscounts!: number;

  @ApiProperty({ description: 'Average order value in cents' })
  avgOrderValue!: number;

  @ApiProperty({ description: 'Unique customers' })
  uniqueCustomers!: number;
}

export class PeriodComparisonDto {
  @ApiProperty({ description: 'Current period value' })
  current!: number;

  @ApiProperty({ description: 'Previous period value' })
  previous!: number;

  @ApiProperty({ description: 'Change amount' })
  change!: number;

  @ApiProperty({ description: 'Change percentage' })
  changePercent!: number;

  @ApiProperty({ description: 'Trend direction', enum: ['up', 'down', 'flat'] })
  trend!: 'up' | 'down' | 'flat';
}

export class DashboardComparisonDto {
  @ApiPropertyOptional()
  ticketsSold?: PeriodComparisonDto;

  @ApiPropertyOptional()
  grossRevenue?: PeriodComparisonDto;

  @ApiPropertyOptional()
  totalOrders?: PeriodComparisonDto;

  @ApiPropertyOptional()
  checkInRate?: PeriodComparisonDto;
}

export class TimeSeriesDataPointDto {
  @ApiProperty({ description: 'Date or timestamp' })
  date!: string;

  @ApiProperty({ description: 'Value for this point' })
  value!: number;
}

export class DashboardResponseDto {
  @ApiProperty({ type: DashboardSummaryDto })
  summary!: DashboardSummaryDto;

  @ApiPropertyOptional({ type: DashboardComparisonDto })
  comparison?: DashboardComparisonDto;

  @ApiProperty({ type: [TimeSeriesDataPointDto], description: 'Revenue over time' })
  revenueChart!: TimeSeriesDataPointDto[];

  @ApiProperty({ type: [TimeSeriesDataPointDto], description: 'Orders over time' })
  ordersChart!: TimeSeriesDataPointDto[];

  @ApiProperty({ type: [TimeSeriesDataPointDto], description: 'Check-ins over time' })
  checkInsChart!: TimeSeriesDataPointDto[];

  @ApiProperty({ description: 'Date range start' })
  startDate!: string;

  @ApiProperty({ description: 'Date range end' })
  endDate!: string;
}

// Revenue Response
export class RevenueBreakdownItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ description: 'Revenue in cents' })
  revenue!: number;

  @ApiProperty({ description: 'Percentage of total' })
  percentage!: number;

  @ApiProperty({ description: 'Number of orders' })
  orders!: number;
}

export class RevenueResponseDto {
  @ApiProperty({ description: 'Gross revenue in cents' })
  grossRevenue!: number;

  @ApiProperty({ description: 'Net revenue in cents' })
  netRevenue!: number;

  @ApiProperty({ description: 'Total refunds in cents' })
  refunds!: number;

  @ApiProperty({ description: 'Total discounts in cents' })
  discounts!: number;

  @ApiProperty({ type: [RevenueBreakdownItemDto], description: 'Revenue by attraction' })
  byAttraction!: RevenueBreakdownItemDto[];

  @ApiProperty({ type: [RevenueBreakdownItemDto], description: 'Revenue by ticket type' })
  byTicketType!: RevenueBreakdownItemDto[];

  @ApiProperty({ type: [TimeSeriesDataPointDto], description: 'Revenue trend' })
  trend!: TimeSeriesDataPointDto[];

  @ApiProperty()
  startDate!: string;

  @ApiProperty()
  endDate!: string;
}

// Attendance Response
export class AttendanceResponseDto {
  @ApiProperty({ description: 'Total tickets checked in' })
  totalCheckIns!: number;

  @ApiProperty({ description: 'Total tickets sold' })
  totalTicketsSold!: number;

  @ApiProperty({ description: 'Check-in rate (percentage)' })
  checkInRate!: number;

  @ApiProperty({ description: 'Peak attendance count' })
  peakAttendance!: number;

  @ApiProperty({ description: 'Peak attendance date/time' })
  peakAttendanceTime!: string | null;

  @ApiProperty({ type: [TimeSeriesDataPointDto], description: 'Check-ins over time' })
  checkInsTrend!: TimeSeriesDataPointDto[];

  @ApiProperty({ type: [RevenueBreakdownItemDto], description: 'Attendance by attraction' })
  byAttraction!: RevenueBreakdownItemDto[];

  @ApiProperty()
  startDate!: string;

  @ApiProperty()
  endDate!: string;
}

// Ticket Type Performance Response
export class TicketTypePerformanceDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  attractionName!: string;

  @ApiProperty({ description: 'Quantity sold' })
  quantitySold!: number;

  @ApiProperty({ description: 'Revenue in cents' })
  revenue!: number;

  @ApiProperty({ description: 'Number checked in' })
  checkedIn!: number;

  @ApiProperty({ description: 'Check-in rate (percentage)' })
  checkInRate!: number;

  @ApiProperty({ description: 'Average per order' })
  avgPerOrder!: number;

  @ApiProperty({ description: 'Refunded quantity' })
  refunded!: number;
}

export class TicketAnalyticsResponseDto {
  @ApiProperty({ description: 'Total ticket types' })
  totalTicketTypes!: number;

  @ApiProperty({ description: 'Total quantity sold' })
  totalQuantitySold!: number;

  @ApiProperty({ description: 'Total revenue in cents' })
  totalRevenue!: number;

  @ApiProperty({ type: [TicketTypePerformanceDto] })
  ticketTypes!: TicketTypePerformanceDto[];

  @ApiProperty()
  startDate!: string;

  @ApiProperty()
  endDate!: string;
}
