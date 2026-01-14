import type { OrgId } from '@atrivio/shared';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { SupabaseService } from '../../shared/database/supabase.service.js';
import type {
  AnalyticsQueryDto,
  PromoAnalyticsQueryDto,
  StaffAnalyticsQueryDto,
  TicketAnalyticsQueryDto,
} from './dto/analytics-query.dto.js';
import type {
  AttendanceResponseDto,
  DashboardComparisonDto,
  DashboardResponseDto,
  DashboardSummaryDto,
  PeriodComparisonDto,
  RevenueBreakdownItemDto,
  RevenueResponseDto,
  TicketAnalyticsResponseDto,
  TicketTypePerformanceDto,
  TimeSeriesDataPointDto,
} from './dto/analytics-response.dto.js';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private supabase: SupabaseService) {}

  /**
   * Get dashboard overview metrics
   */
  async getDashboard(orgId: OrgId, query: AnalyticsQueryDto): Promise<DashboardResponseDto> {
    try {
      const { startDate, endDate } = this.resolveDateRange(query);
      const { attractionId } = query;

    // Fetch orders for the period
    let ordersQuery = this.supabase.adminClient
      .from('orders')
      .select('id, total, subtotal, discount_amount, refund_amount, status, customer_email, created_at, attraction_id')
      .eq('org_id', orgId)
      .in('status', ['completed', 'refunded'])
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`);

    if (attractionId) {
      ordersQuery = ordersQuery.eq('attraction_id', attractionId);
    }

    const { data: orders, error: ordersError } = await ordersQuery;

    if (ordersError) {
      this.logger.error(`Failed to fetch orders: ${ordersError.message}`);
      throw new InternalServerErrorException(`Failed to fetch analytics data: ${ordersError.message}`);
    }

    // Fetch check-ins for the period
    let checkInsQuery = this.supabase.adminClient
      .from('check_ins')
      .select('id, check_in_time, attraction_id')
      .eq('org_id', orgId)
      .gte('check_in_time', `${startDate}T00:00:00`)
      .lte('check_in_time', `${endDate}T23:59:59`);

    if (attractionId) {
      checkInsQuery = checkInsQuery.eq('attraction_id', attractionId);
    }

    const { data: checkIns, error: checkInsError } = await checkInsQuery;

    if (checkInsError) {
      this.logger.error(`Failed to fetch check-ins: ${checkInsError.message}`);
    }

    // Fetch tickets sold - need to join with ticket_types to filter by attraction
    let ticketsQuery = this.supabase.adminClient
      .from('tickets')
      .select('id, ticket_type:ticket_types!inner(attraction_id)', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`);

    if (attractionId) {
      ticketsQuery = ticketsQuery.eq('ticket_type.attraction_id', attractionId);
    }

    const { count: ticketsSold } = await ticketsQuery;

    // Calculate summary metrics
    const completedOrders = orders?.filter((o) => o.status === 'completed') || [];
    const refundedOrders = orders?.filter((o) => o.status === 'refunded') || [];

    const grossRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    // Use refund_amount if available, fallback to total for legacy refunds
    const totalRefunds = refundedOrders.reduce((sum, o) => sum + (o.refund_amount || o.total || 0), 0);
    const totalDiscounts = (orders || []).reduce((sum, o) => sum + (o.discount_amount || 0), 0);
    const netRevenue = grossRevenue - totalRefunds;

    const uniqueEmails = new Set((orders || []).map((o) => o.customer_email?.toLowerCase()).filter(Boolean));
    const ticketsCheckedIn = checkIns?.length || 0;
    const totalTickets = ticketsSold || 0;
    const checkInRate = totalTickets > 0 ? Math.round((ticketsCheckedIn / totalTickets) * 100) : 0;

    const summary: DashboardSummaryDto = {
      ticketsSold: totalTickets,
      ticketsCheckedIn,
      checkInRate,
      totalOrders: completedOrders.length,
      grossRevenue,
      netRevenue,
      totalRefunds,
      totalDiscounts,
      avgOrderValue: completedOrders.length > 0 ? Math.round(grossRevenue / completedOrders.length) : 0,
      uniqueCustomers: uniqueEmails.size,
    };

    // Build time series charts
    const revenueChart = this.buildTimeSeriesFromOrders(completedOrders, startDate, endDate, 'total');
    const ordersChart = this.buildTimeSeriesCount(completedOrders, startDate, endDate);
    const checkInsChart = this.buildTimeSeriesFromCheckIns(checkIns || [], startDate, endDate);

    // Calculate comparison if requested
    const comparison = query.includeComparison
      ? await this.calculateComparison(orgId, startDate, endDate, summary, attractionId)
      : undefined;

    const response: DashboardResponseDto = {
      summary,
      revenueChart,
      ordersChart,
      checkInsChart,
      startDate,
      endDate,
    };

    if (comparison) {
      response.comparison = comparison;
    }

    return response;
    } catch (error) {
      this.logger.error(`Dashboard analytics error: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to load dashboard analytics');
    }
  }

  /**
   * Get revenue breakdown
   */
  async getRevenue(orgId: OrgId, query: AnalyticsQueryDto): Promise<RevenueResponseDto> {
    try {
      const { startDate, endDate } = this.resolveDateRange(query);
      const { attractionId } = query;
      this.logger.debug(`Revenue query: orgId=${orgId}, startDate=${startDate}, endDate=${endDate}, attractionId=${attractionId || 'all'}`);

    // Fetch orders with attraction info
    let ordersQuery = this.supabase.adminClient
      .from('orders')
      .select(`
        id, total, subtotal, discount_amount, refund_amount, status, created_at, attraction_id,
        items:order_items(
          quantity,
          total_price,
          ticket_type_id
        )
      `)
      .eq('org_id', orgId)
      .in('status', ['completed', 'refunded'])
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`);

    if (attractionId) {
      ordersQuery = ordersQuery.eq('attraction_id', attractionId);
    }

    const { data: orders, error } = await ordersQuery;

    if (error) {
      this.logger.error(`Failed to fetch revenue data: ${error.message}`);
      throw new InternalServerErrorException(`Failed to fetch revenue data: ${error.message}`);
    }

    this.logger.debug(`Fetched ${orders?.length || 0} orders`);

    // Fetch attractions for mapping
    const attractionIds = [...new Set((orders || []).map(o => o.attraction_id).filter(Boolean))];
    const { data: attractions } = attractionIds.length > 0
      ? await this.supabase.adminClient
          .from('attractions')
          .select('id, name')
          .in('id', attractionIds)
      : { data: [] };

    const attractionNameMap = new Map((attractions || []).map(a => [a.id, a.name]));

    // Fetch ticket types for mapping
    const ticketTypeIds = [...new Set(
      (orders || []).flatMap(o =>
        (Array.isArray(o.items) ? o.items : []).map((i: { ticket_type_id?: string }) => i.ticket_type_id)
      ).filter(Boolean)
    )];
    const { data: ticketTypes } = ticketTypeIds.length > 0
      ? await this.supabase.adminClient
          .from('ticket_types')
          .select('id, name')
          .in('id', ticketTypeIds)
      : { data: [] };

    const ticketTypeNameMap = new Map((ticketTypes || []).map(t => [t.id, t.name]));

    const completedOrders = orders?.filter((o) => o.status === 'completed') || [];
    const refundedOrders = orders?.filter((o) => o.status === 'refunded') || [];

    const grossRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    // Use refund_amount if available, fallback to total for legacy refunds
    const refunds = refundedOrders.reduce((sum, o) => sum + (o.refund_amount || o.total || 0), 0);
    const discounts = (orders || []).reduce((sum, o) => sum + (o.discount_amount || 0), 0);

    // Group by attraction
    const attractionRevenueMap = new Map<string, { name: string; revenue: number; orders: number }>();
    for (const order of completedOrders) {
      const attractionId = order.attraction_id;
      if (attractionId) {
        const attractionName = attractionNameMap.get(attractionId) || 'Unknown';
        const existing = attractionRevenueMap.get(attractionId) || { name: attractionName, revenue: 0, orders: 0 };
        existing.revenue += order.total || 0;
        existing.orders += 1;
        attractionRevenueMap.set(attractionId, existing);
      }
    }

    const byAttraction: RevenueBreakdownItemDto[] = Array.from(attractionRevenueMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      revenue: data.revenue,
      percentage: grossRevenue > 0 ? Math.round((data.revenue / grossRevenue) * 100) : 0,
      orders: data.orders,
    }));

    // Group by ticket type
    const ticketTypeRevenueMap = new Map<string, { name: string; revenue: number; orders: number }>();
    for (const order of completedOrders) {
      const items = Array.isArray(order.items) ? order.items : [];
      for (const item of items as Array<{ ticket_type_id?: string; total_price?: number }>) {
        const ticketTypeId = item.ticket_type_id;
        if (ticketTypeId) {
          const ticketTypeName = ticketTypeNameMap.get(ticketTypeId) || 'Unknown';
          const existing = ticketTypeRevenueMap.get(ticketTypeId) || { name: ticketTypeName, revenue: 0, orders: 0 };
          existing.revenue += item.total_price || 0;
          existing.orders += 1;
          ticketTypeRevenueMap.set(ticketTypeId, existing);
        }
      }
    }

    const byTicketType: RevenueBreakdownItemDto[] = Array.from(ticketTypeRevenueMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      revenue: data.revenue,
      percentage: grossRevenue > 0 ? Math.round((data.revenue / grossRevenue) * 100) : 0,
      orders: data.orders,
    }));

    // Build trend
    const trend = this.buildTimeSeriesFromOrders(completedOrders, startDate, endDate, 'total');

    return {
      grossRevenue,
      netRevenue: grossRevenue - refunds,
      refunds,
      discounts,
      byAttraction: byAttraction.sort((a, b) => b.revenue - a.revenue),
      byTicketType: byTicketType.sort((a, b) => b.revenue - a.revenue),
      trend,
      startDate,
      endDate,
    };
    } catch (error) {
      this.logger.error(`Revenue analytics error: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to load revenue analytics');
    }
  }

  /**
   * Get attendance metrics
   */
  async getAttendance(orgId: OrgId, query: AnalyticsQueryDto): Promise<AttendanceResponseDto> {
    try {
      const { startDate, endDate } = this.resolveDateRange(query);
      const { attractionId } = query;

    // Fetch check-ins with attraction info
    let checkInsQuery = this.supabase.adminClient
      .from('check_ins')
      .select(`
        id, check_in_time, attraction_id,
        ticket:tickets(
          id,
          ticket_type:ticket_types(
            id,
            attraction:attractions(id, name)
          )
        )
      `)
      .eq('org_id', orgId)
      .gte('check_in_time', `${startDate}T00:00:00`)
      .lte('check_in_time', `${endDate}T23:59:59`);

    if (attractionId) {
      checkInsQuery = checkInsQuery.eq('attraction_id', attractionId);
    }

    const { data: checkIns, error: checkInsError } = await checkInsQuery;

    if (checkInsError) {
      this.logger.error(`Failed to fetch attendance data: ${checkInsError.message}`);
      throw new InternalServerErrorException(`Failed to fetch attendance data: ${checkInsError.message}`);
    }

    // Get tickets sold count - filter by attraction if specified
    let ticketsQuery = this.supabase.adminClient
      .from('tickets')
      .select('id, ticket_type:ticket_types!inner(attraction_id)', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`);

    if (attractionId) {
      ticketsQuery = ticketsQuery.eq('ticket_type.attraction_id', attractionId);
    }

    const { count: ticketsSold } = await ticketsQuery;

    const totalCheckIns = checkIns?.length || 0;
    const totalTicketsSold = ticketsSold || 0;
    const checkInRate = totalTicketsSold > 0 ? Math.round((totalCheckIns / totalTicketsSold) * 100) : 0;

    // Find peak attendance (by hour)
    const hourCounts = new Map<string, number>();
    for (const checkIn of checkIns || []) {
      if (checkIn.check_in_time) {
        const hourKey = checkIn.check_in_time.substring(0, 13); // YYYY-MM-DDTHH
        hourCounts.set(hourKey, (hourCounts.get(hourKey) || 0) + 1);
      }
    }

    let peakAttendance = 0;
    let peakAttendanceTime: string | null = null;
    for (const [hour, count] of hourCounts) {
      if (count > peakAttendance) {
        peakAttendance = count;
        // Convert truncated hour key to valid ISO timestamp
        peakAttendanceTime = `${hour}:00:00`;
      }
    }

    // Group by attraction
    const attractionMap = new Map<string, { name: string; count: number }>();
    for (const checkIn of checkIns || []) {
      const ticket = Array.isArray(checkIn.ticket) ? checkIn.ticket[0] : checkIn.ticket;
      const ticketType = ticket ? (Array.isArray(ticket.ticket_type) ? ticket.ticket_type[0] : ticket.ticket_type) : null;
      const attraction = ticketType ? (Array.isArray(ticketType.attraction) ? ticketType.attraction[0] : ticketType.attraction) : null;

      if (attraction?.id) {
        const existing = attractionMap.get(attraction.id) || { name: attraction.name, count: 0 };
        existing.count += 1;
        attractionMap.set(attraction.id, existing);
      }
    }

    const byAttraction: RevenueBreakdownItemDto[] = Array.from(attractionMap.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      revenue: data.count, // Using revenue field for count
      percentage: totalCheckIns > 0 ? Math.round((data.count / totalCheckIns) * 100) : 0,
      orders: data.count,
    }));

    // Build trend
    const checkInsTrend = this.buildTimeSeriesFromCheckIns(checkIns || [], startDate, endDate);

    return {
      totalCheckIns,
      totalTicketsSold,
      checkInRate,
      peakAttendance,
      peakAttendanceTime,
      checkInsTrend,
      byAttraction: byAttraction.sort((a, b) => b.orders - a.orders),
      startDate,
      endDate,
    };
    } catch (error) {
      this.logger.error(`Attendance analytics error: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to load attendance analytics');
    }
  }

  /**
   * Get ticket type performance
   */
  async getTickets(orgId: OrgId, query: TicketAnalyticsQueryDto): Promise<TicketAnalyticsResponseDto> {
    try {
      const { startDate, endDate } = this.resolveDateRange(query);
      const { attractionId } = query;

    // Fetch order items with ticket type info
    let orderItemsQuery = this.supabase.adminClient
      .from('order_items')
      .select(`
        id, quantity, total_price,
        order:orders!inner(id, org_id, status, created_at, attraction_id),
        ticket_type:ticket_types!inner(
          id, name, attraction_id,
          attraction:attractions(id, name)
        )
      `)
      .eq('order.org_id', orgId)
      .eq('order.status', 'completed')
      .gte('order.created_at', `${startDate}T00:00:00`)
      .lte('order.created_at', `${endDate}T23:59:59`);

    if (attractionId) {
      orderItemsQuery = orderItemsQuery.eq('ticket_type.attraction_id', attractionId);
    }

    const { data: orderItems, error } = await orderItemsQuery;

    if (error) {
      this.logger.error(`Failed to fetch ticket data: ${error.message}`);
      throw new InternalServerErrorException(`Failed to fetch ticket data: ${error.message}`);
    }

    // Get check-in counts per ticket type
    let ticketsQuery = this.supabase.adminClient
      .from('tickets')
      .select('id, ticket_type_id, status, ticket_type:ticket_types!inner(attraction_id)')
      .eq('org_id', orgId)
      .gte('created_at', `${startDate}T00:00:00`)
      .lte('created_at', `${endDate}T23:59:59`);

    if (attractionId) {
      ticketsQuery = ticketsQuery.eq('ticket_type.attraction_id', attractionId);
    }

    const { data: tickets } = await ticketsQuery;

    const checkedInByType = new Map<string, number>();
    for (const ticket of tickets || []) {
      if (ticket.status === 'used' && ticket.ticket_type_id) {
        checkedInByType.set(ticket.ticket_type_id, (checkedInByType.get(ticket.ticket_type_id) || 0) + 1);
      }
    }

    // Aggregate by ticket type
    const ticketTypeMap = new Map<string, {
      name: string;
      attractionName: string;
      quantity: number;
      revenue: number;
      orderCount: number;
    }>();

    for (const item of orderItems || []) {
      const ticketType = Array.isArray(item.ticket_type) ? item.ticket_type[0] : item.ticket_type;
      if (!ticketType?.id) continue;

      const attraction = Array.isArray(ticketType.attraction) ? ticketType.attraction[0] : ticketType.attraction;
      const existing = ticketTypeMap.get(ticketType.id) || {
        name: ticketType.name,
        attractionName: attraction?.name || 'Unknown',
        quantity: 0,
        revenue: 0,
        orderCount: 0,
      };

      existing.quantity += item.quantity || 0;
      existing.revenue += item.total_price || 0;
      existing.orderCount += 1;
      ticketTypeMap.set(ticketType.id, existing);
    }

    const ticketTypes: TicketTypePerformanceDto[] = Array.from(ticketTypeMap.entries()).map(([id, data]) => {
      const checkedIn = checkedInByType.get(id) || 0;
      return {
        id,
        name: data.name,
        attractionName: data.attractionName,
        quantitySold: data.quantity,
        revenue: data.revenue,
        checkedIn,
        checkInRate: data.quantity > 0 ? Math.round((checkedIn / data.quantity) * 100) : 0,
        avgPerOrder: data.orderCount > 0 ? Math.round(data.quantity / data.orderCount * 10) / 10 : 0,
        refunded: 0, // Would need separate query
      };
    });

    const totalQuantitySold = ticketTypes.reduce((sum, t) => sum + t.quantitySold, 0);
    const totalRevenue = ticketTypes.reduce((sum, t) => sum + t.revenue, 0);

    return {
      totalTicketTypes: ticketTypes.length,
      totalQuantitySold,
      totalRevenue,
      ticketTypes: ticketTypes.sort((a, b) => b.revenue - a.revenue),
      startDate,
      endDate,
    };
    } catch (error) {
      this.logger.error(`Ticket analytics error: ${error instanceof Error ? error.message : 'Unknown error'}`, error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to load ticket analytics');
    }
  }

  // ============== Private Helpers ==============

  /**
   * Resolve date range from query parameters
   */
  private resolveDateRange(query: AnalyticsQueryDto): { startDate: string; endDate: string } {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]!;

    if (query.period === 'custom' && query.startDate && query.endDate) {
      return { startDate: query.startDate, endDate: query.endDate };
    }

    switch (query.period) {
      case 'today':
        return { startDate: todayStr, endDate: todayStr };

      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0]!;
        return { startDate: yesterdayStr, endDate: yesterdayStr };
      }

      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { startDate: weekAgo.toISOString().split('T')[0]!, endDate: todayStr };
      }

      case 'quarter': {
        const quarterAgo = new Date(today);
        quarterAgo.setMonth(quarterAgo.getMonth() - 3);
        return { startDate: quarterAgo.toISOString().split('T')[0]!, endDate: todayStr };
      }

      case 'year': {
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return { startDate: yearAgo.toISOString().split('T')[0]!, endDate: todayStr };
      }

      case 'month':
      default: {
        const monthAgo = new Date(today);
        monthAgo.setDate(monthAgo.getDate() - 30);
        return { startDate: monthAgo.toISOString().split('T')[0]!, endDate: todayStr };
      }
    }
  }

  /**
   * Build time series from orders
   */
  private buildTimeSeriesFromOrders(
    orders: Array<{ created_at: string; total?: number; subtotal?: number }>,
    startDate: string,
    endDate: string,
    field: 'total' | 'subtotal'
  ): TimeSeriesDataPointDto[] {
    const dayMap = new Map<string, number>();

    // Initialize all days in range
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dayMap.set(d.toISOString().split('T')[0]!, 0);
    }

    // Aggregate orders by day
    for (const order of orders) {
      const day = order.created_at.split('T')[0]!;
      const value = field === 'total' ? (order.total || 0) : (order.subtotal || 0);
      dayMap.set(day, (dayMap.get(day) || 0) + value);
    }

    return Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }));
  }

  /**
   * Build time series count from orders
   */
  private buildTimeSeriesCount(
    orders: Array<{ created_at: string }>,
    startDate: string,
    endDate: string
  ): TimeSeriesDataPointDto[] {
    const dayMap = new Map<string, number>();

    // Initialize all days in range
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dayMap.set(d.toISOString().split('T')[0]!, 0);
    }

    // Count orders by day
    for (const order of orders) {
      const day = order.created_at.split('T')[0]!;
      dayMap.set(day, (dayMap.get(day) || 0) + 1);
    }

    return Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }));
  }

  /**
   * Build time series from check-ins
   */
  private buildTimeSeriesFromCheckIns(
    checkIns: Array<{ check_in_time?: string | null }>,
    startDate: string,
    endDate: string
  ): TimeSeriesDataPointDto[] {
    const dayMap = new Map<string, number>();

    // Initialize all days in range
    const start = new Date(startDate);
    const end = new Date(endDate);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dayMap.set(d.toISOString().split('T')[0]!, 0);
    }

    // Count check-ins by day
    for (const checkIn of checkIns) {
      if (checkIn.check_in_time) {
        const day = checkIn.check_in_time.split('T')[0]!;
        dayMap.set(day, (dayMap.get(day) || 0) + 1);
      }
    }

    return Array.from(dayMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }));
  }

  /**
   * Calculate period-over-period comparison
   */
  private async calculateComparison(
    orgId: OrgId,
    startDate: string,
    endDate: string,
    currentSummary: DashboardSummaryDto,
    attractionId?: string
  ): Promise<DashboardComparisonDto> {
    // Calculate previous period (same length)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const periodLength = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - periodLength + 1);

    const prevStartStr = prevStart.toISOString().split('T')[0]!;
    const prevEndStr = prevEnd.toISOString().split('T')[0]!;

    // Fetch previous period orders
    let prevOrdersQuery = this.supabase.adminClient
      .from('orders')
      .select('id, total, status, attraction_id')
      .eq('org_id', orgId)
      .eq('status', 'completed')
      .gte('created_at', `${prevStartStr}T00:00:00`)
      .lte('created_at', `${prevEndStr}T23:59:59`);

    if (attractionId) {
      prevOrdersQuery = prevOrdersQuery.eq('attraction_id', attractionId);
    }

    const { data: prevOrders } = await prevOrdersQuery;

    // Fetch previous period tickets
    let prevTicketsQuery = this.supabase.adminClient
      .from('tickets')
      .select('id, ticket_type:ticket_types!inner(attraction_id)', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .gte('created_at', `${prevStartStr}T00:00:00`)
      .lte('created_at', `${prevEndStr}T23:59:59`);

    if (attractionId) {
      prevTicketsQuery = prevTicketsQuery.eq('ticket_type.attraction_id', attractionId);
    }

    const { count: prevTickets } = await prevTicketsQuery;

    // Fetch previous period check-ins
    let prevCheckInsQuery = this.supabase.adminClient
      .from('check_ins')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .gte('check_in_time', `${prevStartStr}T00:00:00`)
      .lte('check_in_time', `${prevEndStr}T23:59:59`);

    if (attractionId) {
      prevCheckInsQuery = prevCheckInsQuery.eq('attraction_id', attractionId);
    }

    const { count: prevCheckIns } = await prevCheckInsQuery;

    const prevRevenue = (prevOrders || []).reduce((sum, o) => sum + (o.total || 0), 0);
    const prevOrderCount = prevOrders?.length || 0;
    const prevTicketCount = prevTickets || 0;
    const prevCheckInCount = prevCheckIns || 0;
    const prevCheckInRate = prevTicketCount > 0 ? Math.round((prevCheckInCount / prevTicketCount) * 100) : 0;

    return {
      ticketsSold: this.buildComparison(currentSummary.ticketsSold, prevTicketCount),
      grossRevenue: this.buildComparison(currentSummary.grossRevenue, prevRevenue),
      totalOrders: this.buildComparison(currentSummary.totalOrders, prevOrderCount),
      checkInRate: this.buildComparison(currentSummary.checkInRate, prevCheckInRate),
    };
  }

  /**
   * Build comparison object
   */
  private buildComparison(current: number, previous: number): PeriodComparisonDto {
    const change = current - previous;
    const changePercent = previous > 0 ? Math.round((change / previous) * 100) : current > 0 ? 100 : 0;

    let trend: 'up' | 'down' | 'flat' = 'flat';
    if (changePercent > 0) trend = 'up';
    else if (changePercent < 0) trend = 'down';

    return {
      current,
      previous,
      change,
      changePercent,
      trend,
    };
  }
}
