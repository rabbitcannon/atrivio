'use client';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Loader2,
  MinusIcon,
  ShoppingCart,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { UpgradePrompt } from '@/components/features/upgrade-prompt';
import {
  getAnalyticsDashboard,
  getAttractions,
  getRequiredTier,
  isFeatureNotEnabledError,
  type AnalyticsQueryParams,
  type ApiError,
} from '@/lib/api/client';
import type { AttractionListItem, AnalyticsPeriod, DashboardResponse } from '@/lib/api/types';
import { formatCurrency } from '@atrivio/shared/utils/money';
import { exportToPDF } from '@/lib/utils/pdf-export';

// Lazy load MUI X Charts to reduce initial bundle
import dynamic from 'next/dynamic';

const LineChart = dynamic(() => import('@mui/x-charts/LineChart').then((m) => m.LineChart), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

const BarChart = dynamic(() => import('@mui/x-charts/BarChart').then((m) => m.BarChart), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

// Material Design ease curve
const EASE = [0.4, 0, 0.2, 1] as const;

// MUI X Charts dark mode styling
const chartSx = {
  // Axis labels and ticks
  '.MuiChartsAxis-tickLabel': {
    fill: 'hsl(var(--foreground)) !important',
  },
  '.MuiChartsAxis-label': {
    fill: 'hsl(var(--foreground)) !important',
  },
  '.MuiChartsAxis-line': {
    stroke: 'hsl(var(--border)) !important',
  },
  '.MuiChartsAxis-tick': {
    stroke: 'hsl(var(--border)) !important',
  },
  // Legend
  '.MuiChartsLegend-label': {
    fill: 'hsl(var(--foreground)) !important',
  },
  // Tooltip
  '.MuiChartsTooltip-root': {
    backgroundColor: 'hsl(var(--popover)) !important',
    color: 'hsl(var(--popover-foreground)) !important',
    border: '1px solid hsl(var(--border)) !important',
  },
  // Grid
  '.MuiChartsGrid-line': {
    stroke: 'hsl(var(--border)) !important',
  },
};

// Period options for the date selector
const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'quarter', label: 'Last 90 Days' },
  { value: 'year', label: 'Last 12 Months' },
];

/**
 * Animated page header
 */
function AnimatedPageHeader({
  children,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return <div className="flex flex-col gap-2">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex flex-col gap-2"
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated stats grid with staggered cards
 */
function AnimatedStatsGrid({
  children,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.06,
            delayChildren: 0.15,
          },
        },
      }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12, scale: 0.95 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.3, ease: EASE },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Animated two-column card grid
 */
function AnimatedCardGrid({
  children,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return <div className="grid gap-6 lg:grid-cols-2">{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.25,
          },
        },
      }}
      className="grid gap-6 lg:grid-cols-2"
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.35, ease: EASE },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Change indicator badge showing trend direction
 */
function ChangeIndicator({ comparison }: { comparison: { trend: 'up' | 'down' | 'flat'; changePercent: number } | null | undefined }) {
  if (!comparison) return null;

  const { changePercent, trend } = comparison;
  const isPositive = trend === 'up';
  const isNeutral = trend === 'flat';

  return (
    <Badge
      variant={isNeutral ? 'secondary' : isPositive ? 'default' : 'destructive'}
      className="ml-2 text-xs"
    >
      {isNeutral ? (
        <MinusIcon className="h-3 w-3 mr-1" />
      ) : isPositive ? (
        <ArrowUpIcon className="h-3 w-3 mr-1" />
      ) : (
        <ArrowDownIcon className="h-3 w-3 mr-1" />
      )}
      {Math.abs(changePercent).toFixed(1)}%
    </Badge>
  );
}

/**
 * Stats card component
 */
function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  comparison,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  comparison?: { trend: 'up' | 'down' | 'flat'; changePercent: number } | null;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <div className="text-2xl font-bold">{value}</div>
          {comparison && <ChangeIndicator comparison={comparison} />}
        </div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const params = useParams();
  const shouldReduceMotion = useReducedMotion();
  const orgId = params['orgId'] as string;

  const [attractions, setAttractions] = useState<AttractionListItem[]>([]);
  const [selectedAttraction, setSelectedAttraction] = useState<string>('all');
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [featureError, setFeatureError] = useState<ApiError | null>(null);

  // Load attractions on mount
  useEffect(() => {
    async function loadAttractions() {
      try {
        const res = await getAttractions(orgId);
        if (res.data?.data) {
          setAttractions(res.data.data);
        }
      } catch (_err) {
        // Non-critical, attractions filter just won't be available
      }
    }
    loadAttractions();
  }, [orgId]);

  // Load dashboard data when filters change
  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setFeatureError(null);

    try {
      const queryParams: AnalyticsQueryParams = {
        period,
        includeComparison: true,
      };
      if (selectedAttraction !== 'all') {
        queryParams.attractionId = selectedAttraction;
      }

      const res = await getAnalyticsDashboard(orgId, queryParams);
      if (res.error) {
        if (isFeatureNotEnabledError(res.error)) {
          setFeatureError(res.error);
        } else {
          setError(res.error.message);
        }
      } else if (res.data) {
        setDashboard(res.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [orgId, period, selectedAttraction]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Handle PDF export
  const handleExportPDF = useCallback(async () => {
    const element = document.getElementById('analytics-content');
    if (!element || !dashboard) return;

    setIsExporting(true);
    try {
      const periodLabel = PERIOD_OPTIONS.find((p) => p.value === period)?.label || period;
      const attractionName =
        selectedAttraction === 'all'
          ? 'All Attractions'
          : attractions.find((a) => a.id === selectedAttraction)?.name || '';

      await exportToPDF(element, {
        filename: `analytics-report-${period}-${new Date().toISOString().split('T')[0]}`,
        title: 'Analytics Report',
        subtitle: `${periodLabel} • ${attractionName} • ${dashboard.startDate} to ${dashboard.endDate}`,
        orientation: 'landscape',
      });
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [dashboard, period, selectedAttraction, attractions]);

  // Prepare chart data
  const revenueChartData = dashboard?.revenueChart || [];
  const ordersChartData = dashboard?.ordersChart || [];
  const checkInsChartData = dashboard?.checkInsChart || [];

  // Format x-axis dates for display
  const xAxisLabels = revenueChartData.map((d) => {
    const date = new Date(d.date);
    if (period === 'today' || period === 'yesterday') {
      return date.toLocaleTimeString('en-US', { hour: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  return (
    <div className="space-y-6">
      <AnimatedPageHeader shouldReduceMotion={shouldReduceMotion}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Analytics
            </h1>
            <p className="text-muted-foreground">
              Track revenue, attendance, and ticket performance.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            Pro Feature
          </Badge>
        </div>
      </AnimatedPageHeader>

      {/* Filters */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE, delay: 0.1 }}
        className="flex flex-wrap gap-4"
      >
        <Select value={period} onValueChange={(v) => setPeriod(v as AnalyticsPeriod)}>
          <SelectTrigger className="w-48">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {attractions.length > 0 && (
          <Select value={selectedAttraction} onValueChange={setSelectedAttraction}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All attractions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Attractions</SelectItem>
              {attractions.map((attr) => (
                <SelectItem key={attr.id} value={attr.id}>
                  {attr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button variant="outline" onClick={loadDashboard} disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Refresh
        </Button>

        {dashboard && (
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={isExporting || isLoading}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export PDF
          </Button>
        )}
      </motion.div>

      {featureError && (
        <UpgradePrompt
          feature="Analytics"
          description="Track revenue, attendance, and ticket performance with advanced analytics."
          requiredTier={getRequiredTier(featureError)}
        />
      )}

      {error && !featureError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={loadDashboard}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {!featureError && isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : dashboard ? (
        <div id="analytics-content" className="space-y-6">
          {/* Summary Stats */}
          <AnimatedStatsGrid shouldReduceMotion={shouldReduceMotion}>
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(dashboard.summary.grossRevenue)}
              subtitle={`${dashboard.summary.totalOrders} orders`}
              icon={DollarSign}
              iconColor="text-green-500"
              comparison={dashboard.comparison?.grossRevenue}
            />
            <StatsCard
              title="Orders"
              value={dashboard.summary.totalOrders.toLocaleString()}
              subtitle={`Avg ${formatCurrency(dashboard.summary.avgOrderValue)}/order`}
              icon={ShoppingCart}
              iconColor="text-blue-500"
              comparison={dashboard.comparison?.totalOrders}
            />
            <StatsCard
              title="Tickets Sold"
              value={dashboard.summary.ticketsSold.toLocaleString()}
              subtitle="Total tickets"
              icon={Ticket}
              iconColor="text-purple-500"
              comparison={dashboard.comparison?.ticketsSold}
            />
            <StatsCard
              title="Check-Ins"
              value={dashboard.summary.ticketsCheckedIn.toLocaleString()}
              subtitle={`${dashboard.summary.checkInRate.toFixed(1)}% rate`}
              icon={Users}
              iconColor="text-orange-500"
              comparison={dashboard.comparison?.checkInRate}
            />
          </AnimatedStatsGrid>

          {/* Charts */}
          <AnimatedCardGrid shouldReduceMotion={shouldReduceMotion}>
            {/* Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Over Time
                </CardTitle>
                <CardDescription>
                  {dashboard.startDate} - {dashboard.endDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {revenueChartData.length > 0 ? (
                  <LineChart
                    height={280}
                    series={[
                      {
                        data: revenueChartData.map((d) => d.value / 100),
                        label: 'Revenue',
                        color: '#22c55e',
                        area: true,
                      },
                    ]}
                    xAxis={[
                      {
                        data: xAxisLabels,
                        scaleType: 'point',
                      },
                    ]}
                    yAxis={[
                      {
                        valueFormatter: (value: number | null) =>
                          value !== null ? `$${value.toLocaleString()}` : '',
                      },
                    ]}
                    sx={{
                      ...chartSx,
                      '.MuiLineElement-root': { strokeWidth: 2 },
                      '.MuiAreaElement-root': { fillOpacity: 0.1 },
                    }}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No revenue data for this period
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Orders Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Orders Over Time
                </CardTitle>
                <CardDescription>Order volume trends</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersChartData.length > 0 ? (
                  <BarChart
                    height={280}
                    series={[
                      {
                        data: ordersChartData.map((d) => d.value),
                        label: 'Orders',
                        color: '#3b82f6',
                      },
                    ]}
                    xAxis={[
                      {
                        data: xAxisLabels,
                        scaleType: 'band',
                      },
                    ]}
                    sx={chartSx}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No orders for this period
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedCardGrid>

          {/* Check-ins Chart - Full Width */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.35 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Attendance Over Time
                </CardTitle>
                <CardDescription>Guest check-ins and attendance patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {checkInsChartData.length > 0 ? (
                  <BarChart
                    height={320}
                    series={[
                      {
                        data: checkInsChartData.map((d) => d.value),
                        label: 'Check-ins',
                        color: '#f97316',
                      },
                    ]}
                    xAxis={[
                      {
                        data: xAxisLabels,
                        scaleType: 'band',
                      },
                    ]}
                    sx={chartSx}
                  />
                ) : (
                  <div className="h-80 flex items-center justify-center text-muted-foreground">
                    No check-in data for this period
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
