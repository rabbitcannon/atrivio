'use client';

import {
  Calendar,
  Loader2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  getAnalyticsAttendance,
  getAttractions,
  getRequiredTier,
  isFeatureNotEnabledError,
  type AnalyticsQueryParams,
  type ApiError,
} from '@/lib/api/client';
import type { AttractionListItem, AnalyticsPeriod, AttendanceResponse } from '@/lib/api/types';

import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('@mui/x-charts/BarChart').then((m) => m.BarChart), {
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
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

export default function AttendanceAnalyticsPage() {
  const params = useParams();
  const shouldReduceMotion = useReducedMotion();
  const orgId = params['orgId'] as string;

  const [attractions, setAttractions] = useState<AttractionListItem[]>([]);
  const [selectedAttraction, setSelectedAttraction] = useState<string>('all');
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<AttendanceResponse | null>(null);
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

      const res = await getAnalyticsAttendance(orgId, queryParams);
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
      setError(err instanceof Error ? err.message : 'Failed to load attendance analytics');
    } finally {
      setIsLoading(false);
    }
  }, [orgId, period, selectedAttraction]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const overTimeData = data?.checkInsTrend || [];
  const xAxisLabels = overTimeData.map((d) => {
    const date = new Date(d.date);
    if (period === 'today' || period === 'yesterday') {
      return date.toLocaleTimeString('en-US', { hour: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

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
              <Users className="h-8 w-8 text-orange-500" />
              Attendance Analytics
            </h1>
            <p className="text-muted-foreground">
              Guest check-ins and attendance patterns.
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
          feature="Attendance Analytics"
          description="Track check-ins, attendance patterns, and peak times across attractions."
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
              title="Total Check-Ins"
              value={data.totalCheckIns.toLocaleString()}
              icon={Users}
              iconColor="text-orange-500"
            />
            <StatsCard
              title="Tickets Sold"
              value={data.totalTicketsSold.toLocaleString()}
              subtitle="Expected attendance"
              icon={TrendingUp}
              iconColor="text-blue-500"
            />
            <StatsCard
              title="Check-In Rate"
              value={`${data.checkInRate.toFixed(1)}%`}
              subtitle="Actual vs expected"
              icon={TrendingUp}
              iconColor="text-green-500"
            />
            <StatsCard
              title="Peak Attendance"
              value={data.peakAttendance.toLocaleString()}
              subtitle={data.peakAttendanceTime ? new Date(data.peakAttendanceTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' }) : 'N/A'}
              icon={Calendar}
              iconColor="text-purple-500"
            />
          </div>

          {/* Attendance Over Time */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Check-Ins Over Time
              </CardTitle>
              <CardDescription>
                {data.startDate} - {data.endDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overTimeData.length > 0 ? (
                <BarChart
                  height={320}
                  series={[
                    {
                      data: overTimeData.map((d) => d.value),
                      label: 'Check-Ins',
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
                  No attendance data for this period
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance by Attraction */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance by Attraction</CardTitle>
              <CardDescription>Check-ins per venue</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.byAttraction.length > 0 ? (
                data.byAttraction.map((item) => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {item.orders.toLocaleString()} check-ins
                        </span>
                        <Badge variant="secondary">
                          {item.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={item.percentage} className="h-2" />
                  </div>
                ))
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No attraction data
                </div>
              )}
            </CardContent>
          </Card>

          {/* Detailed Table */}
          <Card>
            <CardHeader>
              <CardTitle>Attraction Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Attraction</TableHead>
                    <TableHead className="text-right">Check-Ins</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.byAttraction.length > 0 ? (
                    data.byAttraction.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-right">
                          {item.orders.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">
                            {item.percentage.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
