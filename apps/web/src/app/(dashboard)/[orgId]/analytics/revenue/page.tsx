'use client';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  Calendar,
  DollarSign,
  Loader2,
  MinusIcon,
  TrendingDown,
  TrendingUp,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UpgradePrompt } from '@/components/features/upgrade-prompt';
import {
  getAnalyticsRevenue,
  getAttractions,
  getRequiredTier,
  isFeatureNotEnabledError,
  type AnalyticsQueryParams,
  type ApiError,
} from '@/lib/api/client';
import type { AttractionListItem, AnalyticsPeriod, RevenueResponse } from '@/lib/api/types';
import { formatCurrency } from '@atrivio/shared/utils/money';

import dynamic from 'next/dynamic';

const LineChart = dynamic(() => import('@mui/x-charts/LineChart').then((m) => m.LineChart), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

const PieChart = dynamic(() => import('@mui/x-charts/PieChart').then((m) => m.PieChart), {
  ssr: false,
  loading: () => <Skeleton className="h-64 w-full" />,
});

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

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'quarter', label: 'Last 90 Days' },
  { value: 'year', label: 'Last 12 Months' },
];

function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  trend,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconColor: string;
  trend?: 'up' | 'down' | 'flat';
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">{value}</div>
          {trend && trend !== 'flat' && (
            <Badge variant={trend === 'up' ? 'default' : 'destructive'} className="text-xs">
              {trend === 'up' ? (
                <ArrowUpIcon className="h-3 w-3" />
              ) : (
                <ArrowDownIcon className="h-3 w-3" />
              )}
            </Badge>
          )}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export default function RevenueAnalyticsPage() {
  const params = useParams();
  const shouldReduceMotion = useReducedMotion();
  const orgId = params['orgId'] as string;

  const [attractions, setAttractions] = useState<AttractionListItem[]>([]);
  const [selectedAttraction, setSelectedAttraction] = useState<string>('all');
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<RevenueResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [featureError, setFeatureError] = useState<ApiError | null>(null);

  useEffect(() => {
    async function loadAttractions() {
      try {
        const res = await getAttractions(orgId);
        if (res.data?.data) {
          setAttractions(res.data.data);
        }
      } catch {
        // Non-critical
      }
    }
    loadAttractions();
  }, [orgId]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setFeatureError(null);

    try {
      const queryParams: AnalyticsQueryParams = { period };
      if (selectedAttraction !== 'all') {
        queryParams.attractionId = selectedAttraction;
      }

      const res = await getAnalyticsRevenue(orgId, queryParams);
      if (res.error) {
        if (isFeatureNotEnabledError(res.error)) {
          setFeatureError(res.error);
        } else {
          setError(res.error.message);
        }
      } else if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load revenue analytics');
    } finally {
      setIsLoading(false);
    }
  }, [orgId, period, selectedAttraction]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const chartData = data?.trend || [];
  const xAxisLabels = chartData.map((d) => {
    const date = new Date(d.date);
    if (period === 'today' || period === 'yesterday') {
      return date.toLocaleTimeString('en-US', { hour: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  // Prepare pie chart data
  const attractionPieData = data?.byAttraction.map((item, index) => ({
    id: index,
    value: item.revenue / 100,
    label: item.name,
  })) || [];

  const ticketTypePieData = data?.byTicketType.map((item, index) => ({
    id: index,
    value: item.revenue / 100,
    label: item.name,
  })) || [];

  return (
    <div className="space-y-6">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="flex flex-col gap-2"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-green-500" />
              Revenue Analytics
            </h1>
            <p className="text-muted-foreground">
              Detailed revenue breakdown and trends.
            </p>
          </div>
        </div>
      </motion.div>

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

        <Button variant="outline" onClick={loadData} disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Refresh
        </Button>
      </motion.div>

      {featureError && (
        <UpgradePrompt
          feature="Revenue Analytics"
          description="Track revenue, breakdown by attraction and ticket type, and visualize trends."
          requiredTier={getRequiredTier(featureError)}
        />
      )}

      {error && !featureError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={loadData}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <>
          {/* Summary Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Gross Revenue"
              value={formatCurrency(data.grossRevenue)}
              subtitle={`${data.byAttraction.reduce((sum, a) => sum + a.orders, 0)} orders`}
              icon={DollarSign}
              iconColor="text-green-500"
            />
            <StatsCard
              title="Net Revenue"
              value={formatCurrency(data.netRevenue)}
              subtitle="After refunds & discounts"
              icon={TrendingUp}
              iconColor="text-blue-500"
            />
            <StatsCard
              title="Refunds"
              value={formatCurrency(data.refunds)}
              icon={TrendingDown}
              iconColor="text-red-500"
            />
            <StatsCard
              title="Discounts"
              value={formatCurrency(data.discounts)}
              icon={MinusIcon}
              iconColor="text-orange-500"
            />
          </div>

          {/* Revenue Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Over Time
              </CardTitle>
              <CardDescription>
                {data.startDate} - {data.endDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <LineChart
                  height={320}
                  series={[
                    {
                      data: chartData.map((d) => d.value / 100),
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
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  No revenue data for this period
                </div>
              )}
            </CardContent>
          </Card>

          {/* Breakdown Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* By Attraction */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Attraction</CardTitle>
                <CardDescription>Distribution across attractions</CardDescription>
              </CardHeader>
              <CardContent>
                {attractionPieData.length > 0 ? (
                  <PieChart
                    height={280}
                    series={[
                      {
                        data: attractionPieData,
                        highlightScope: { fade: 'global', highlight: 'item' },
                        valueFormatter: (item) => `$${item.value.toLocaleString()}`,
                      },
                    ]}
                    sx={chartSx}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No attraction data
                  </div>
                )}
              </CardContent>
            </Card>

            {/* By Ticket Type */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Ticket Type</CardTitle>
                <CardDescription>Distribution across ticket types</CardDescription>
              </CardHeader>
              <CardContent>
                {ticketTypePieData.length > 0 ? (
                  <PieChart
                    height={280}
                    series={[
                      {
                        data: ticketTypePieData,
                        highlightScope: { fade: 'global', highlight: 'item' },
                        valueFormatter: (item) => `$${item.value.toLocaleString()}`,
                      },
                    ]}
                    sx={chartSx}
                  />
                ) : (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    No ticket type data
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Breakdown Tables */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Attraction Breakdown Table */}
            <Card>
              <CardHeader>
                <CardTitle>Attraction Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Attraction</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.byAttraction.length > 0 ? (
                      data.byAttraction.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.revenue)}
                          </TableCell>
                          <TableCell className="text-right">{item.orders}</TableCell>
                          <TableCell className="text-right">
                            {item.percentage.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No data
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Ticket Type Breakdown Table */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Type Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket Type</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                      <TableHead className="text-right">Orders</TableHead>
                      <TableHead className="text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.byTicketType.length > 0 ? (
                      data.byTicketType.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.revenue)}
                          </TableCell>
                          <TableCell className="text-right">{item.orders}</TableCell>
                          <TableCell className="text-right">
                            {item.percentage.toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No data
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
