'use client';

import {
  Activity,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Loader2,
  Timer,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getAttractions, getCheckInStats, listCheckIns } from '@/lib/api/client';
import type { AttractionListItem, CheckInStats } from '@/lib/api/types';

// Material Design ease curve
const EASE = [0.4, 0, 0.2, 1] as const;

/**
 * Loading skeleton for reports page
 */
function ReportsPageLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="flex-1">
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-52" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-4 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48" />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Animated page header with back button
 */
function AnimatedPageHeader({
  children,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return <div className="flex items-center gap-4">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex items-center gap-4"
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated filters section
 */
function AnimatedFiltersSection({
  children,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return <div className="grid gap-4 sm:grid-cols-3">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE, delay: 0.1 }}
      className="grid gap-4 sm:grid-cols-3"
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
  columns = 4,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
  columns?: 3 | 4;
}) {
  const gridClass =
    columns === 3 ? 'grid gap-4 md:grid-cols-3' : 'grid gap-4 md:grid-cols-2 lg:grid-cols-4';

  if (shouldReduceMotion) {
    return <div className={gridClass}>{children}</div>;
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
      className={gridClass}
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
 * Animated single card
 */
function AnimatedCard({
  children,
  shouldReduceMotion,
  delay = 0.35,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
  delay?: number;
}) {
  if (shouldReduceMotion) {
    return <Card>{children}</Card>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay }}
    >
      <Card>{children}</Card>
    </motion.div>
  );
}

/**
 * Animated chart bar for hourly distribution
 */
function AnimatedChartBar({
  hour,
  count,
  height,
  index,
  shouldReduceMotion,
}: {
  hour: string;
  count: number;
  height: number;
  index: number;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return (
      <div className="flex-1 flex flex-col items-center gap-1">
        <span className="text-xs text-muted-foreground">{count}</span>
        <div
          className="w-full bg-primary rounded-t transition-all"
          style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
        />
        <span className="text-xs text-muted-foreground">{hour}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: index * 0.02 }}
      className="flex-1 flex flex-col items-center gap-1"
    >
      <span className="text-xs text-muted-foreground">{count}</span>
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${height}%` }}
        transition={{
          duration: 0.5,
          ease: EASE,
          delay: 0.3 + index * 0.02,
        }}
        className="w-full bg-primary rounded-t"
        style={{ minHeight: count > 0 ? '4px' : '0' }}
      />
      <span className="text-xs text-muted-foreground">{hour}</span>
    </motion.div>
  );
}

/**
 * Animated empty state
 */
function AnimatedEmptyState({
  shouldReduceMotion,
  icon: Icon,
  title,
  description,
}: {
  shouldReduceMotion: boolean | null;
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  if (shouldReduceMotion) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">{title}</p>
        {description && <p className="text-sm">{description}</p>}
      </div>
    );
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
            delayChildren: 0.1,
          },
        },
      }}
      className="text-center py-8 text-muted-foreground"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.5, y: 10 },
          visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 15,
            },
          },
        }}
      >
        <Icon className="h-12 w-12 mx-auto mb-4 opacity-50" />
      </motion.div>
      <motion.p
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
        }}
        className="text-lg font-medium"
      >
        {title}
      </motion.p>
      {description && (
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
          }}
          className="text-sm"
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}

interface ReportsContentProps {
  orgId: string;
}

function ReportsPageContentInner({ orgId }: ReportsContentProps) {
  const searchParams = useSearchParams();
  const shouldReduceMotion = useReducedMotion();
  const attractionIdFromUrl = searchParams.get('attractionId');

  const [attractions, setAttractions] = useState<AttractionListItem[]>([]);
  const [attractionId, setAttractionId] = useState<string | null>(attractionIdFromUrl);
  const [isLoadingAttractions, setIsLoadingAttractions] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [dateRange, setDateRange] = useState('today');
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [checkInCounts, setCheckInCounts] = useState({ success: 0, failed: 0 });

  // Load attractions on mount
  useEffect(() => {
    async function loadAttractions() {
      setIsLoadingAttractions(true);
      try {
        const res = await getAttractions(orgId);
        if (res.data?.data) {
          setAttractions(res.data.data);
          if (!attractionIdFromUrl) {
            const saved = localStorage.getItem(`check-in-attraction-${orgId}`);
            const defaultAttraction = res.data.data.find((a) => a.id === saved) || res.data.data[0];
            if (defaultAttraction) {
              setAttractionId(defaultAttraction.id);
            }
          }
        }
      } catch (_error) {
      } finally {
        setIsLoadingAttractions(false);
      }
    }
    loadAttractions();
  }, [orgId, attractionIdFromUrl]);

  // Load stats when attraction or date changes
  useEffect(() => {
    if (!attractionId) return;

    async function loadStats() {
      setIsLoadingStats(true);
      try {
        // Calculate date based on range
        const today = new Date();
        let dateStr: string;

        switch (dateRange) {
          case 'yesterday': {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            dateStr = yesterday.toISOString().split('T')[0];
            break;
          }
          default:
            dateStr = today.toISOString().split('T')[0];
            break;
        }

        const statsResult = await getCheckInStats(orgId, attractionId!, dateStr);
        if (statsResult.data) {
          setStats(statsResult.data);
        }

        // Get check-in records to calculate success/failure counts
        const checkInsResult = await listCheckIns(orgId, attractionId!, {
          from: `${dateStr}T00:00:00`,
          to: `${dateStr}T23:59:59`,
          limit: 1000,
        });
        if (checkInsResult.data?.checkIns) {
          const successCount = checkInsResult.data.checkIns.length;
          // Note: We don't have failed scans in check-ins table, only successful ones
          setCheckInCounts({ success: successCount, failed: 0 });
        }
      } catch (_error) {
      } finally {
        setIsLoadingStats(false);
      }
    }
    loadStats();
  }, [orgId, attractionId, dateRange]);

  const handleExport = async () => {
    if (!stats) return;

    // Generate CSV content
    const csvRows = [
      ['Check-In Report', stats.date],
      [],
      ['Summary'],
      ['Total Checked In', stats.totalCheckedIn],
      ['Total Expected', stats.totalExpected],
      ['Check-In Rate', `${stats.checkInRate}%`],
      ['Avg Check-In Time', `${stats.avgCheckInTimeSeconds}s`],
      [],
      ['By Hour'],
      ['Hour', 'Count'],
      ...stats.byHour.map((h) => [h.hour, h.count]),
      [],
      ['By Station'],
      ['Station', 'Count'],
      ...stats.byStation.map((s) => [s.station, s.count]),
      [],
      ['By Method'],
      ['Method', 'Count'],
      ...stats.byMethod.map((m) => [m.method, m.count]),
    ];

    const csvContent = csvRows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `check-in-report-${stats.date}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Find peak hour
  const peakHour =
    stats?.byHour.reduce((max, h) => (h.count > (max?.count || 0) ? h : max), stats?.byHour[0])
      ?.hour || '--';

  if (isLoadingAttractions) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader shouldReduceMotion={shouldReduceMotion}>
        <Link href={`/${orgId}/check-in`}>
          <Button variant="ghost" size="icon" aria-label="Back to check-in">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Check-In Reports</h1>
          <p className="text-muted-foreground">Analytics and statistics for guest check-ins.</p>
        </div>
      </AnimatedPageHeader>

      {/* Filters */}
      <AnimatedFiltersSection shouldReduceMotion={shouldReduceMotion}>
        <div className="space-y-2">
          <Label>Attraction</Label>
          <Select value={attractionId ?? ''} onValueChange={setAttractionId}>
            <SelectTrigger>
              <SelectValue placeholder="Select attraction" />
            </SelectTrigger>
            <SelectContent>
              {attractions.map((attr) => (
                <SelectItem key={attr.id} value={attr.id}>
                  {attr.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date Range</Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button variant="outline" onClick={handleExport} disabled={!stats} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </AnimatedFiltersSection>

      {isLoadingStats ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <AnimatedStatsGrid shouldReduceMotion={shouldReduceMotion} columns={4}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Checked In</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCheckedIn ?? 0}</div>
                <p className="text-xs text-muted-foreground">
                  of {stats?.totalExpected ?? 0} expected
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Check-In Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.checkInRate ?? 0}%</div>
                <Progress value={stats?.checkInRate ?? 0} className="mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Check-In Time</CardTitle>
                <Timer className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.avgCheckInTimeSeconds
                    ? `${Math.round(stats.avgCheckInTimeSeconds)}s`
                    : '--'}
                </div>
                <p className="text-xs text-muted-foreground">Per guest</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
                <Activity className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{peakHour}</div>
                <p className="text-xs text-muted-foreground">Busiest time</p>
              </CardContent>
            </Card>
          </AnimatedStatsGrid>

          <AnimatedCardGrid shouldReduceMotion={shouldReduceMotion}>
            {/* Check-ins by Station */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Check-Ins by Station
                </CardTitle>
                <CardDescription>Breakdown by check-in station</CardDescription>
              </CardHeader>
              <CardContent>
                {!stats?.byStation || stats.byStation.length === 0 ? (
                  <AnimatedEmptyState
                    shouldReduceMotion={shouldReduceMotion}
                    icon={Clock}
                    title="No station data available"
                  />
                ) : (
                  <div className="space-y-4">
                    {stats.byStation.map((station) => {
                      const total = stats.byStation.reduce((sum, s) => sum + s.count, 0);
                      const percentage = total > 0 ? Math.round((station.count / total) * 100) : 0;
                      return (
                        <div key={station.station} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{station.station || 'No Station'}</span>
                            <span className="text-muted-foreground">
                              {station.count} ({percentage}%)
                            </span>
                          </div>
                          <Progress value={percentage} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Check-ins by Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Check-Ins by Method
                </CardTitle>
                <CardDescription>Scan type distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {!stats?.byMethod || stats.byMethod.length === 0 ? (
                  <AnimatedEmptyState
                    shouldReduceMotion={shouldReduceMotion}
                    icon={BarChart3}
                    title="No method data available"
                  />
                ) : (
                  <div className="space-y-4">
                    {stats.byMethod.map((method) => {
                      const total = stats.byMethod.reduce((sum, m) => sum + m.count, 0);
                      const percentage = total > 0 ? Math.round((method.count / total) * 100) : 0;
                      const methodLabel = method.method
                        .replace('_', ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase());
                      return (
                        <div key={method.method} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{methodLabel}</span>
                            <span className="text-muted-foreground">
                              {method.count} ({percentage}%)
                            </span>
                          </div>
                          <Progress value={percentage} />
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </AnimatedCardGrid>

          {/* Hourly Distribution */}
          <AnimatedCard shouldReduceMotion={shouldReduceMotion} delay={0.4}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Hourly Check-In Distribution
              </CardTitle>
              <CardDescription>Check-ins throughout the day. Peak hour: {peakHour}</CardDescription>
            </CardHeader>
            <CardContent>
              {!stats?.byHour || stats.byHour.length === 0 ? (
                <AnimatedEmptyState
                  shouldReduceMotion={shouldReduceMotion}
                  icon={Activity}
                  title="No check-in data yet"
                  description="Check-in data will appear here once guests start arriving."
                />
              ) : (
                <div className="flex items-end justify-between h-48 gap-1">
                  {stats.byHour.map((hour, index) => {
                    const maxCount = Math.max(...stats.byHour.map((h) => h.count), 1);
                    const height = maxCount > 0 ? (hour.count / maxCount) * 100 : 0;
                    return (
                      <AnimatedChartBar
                        key={hour.hour}
                        hour={hour.hour}
                        count={hour.count}
                        height={height}
                        index={index}
                        shouldReduceMotion={shouldReduceMotion}
                      />
                    );
                  })}
                </div>
              )}
            </CardContent>
          </AnimatedCard>

          {/* Quick Stats Summary */}
          <AnimatedStatsGrid shouldReduceMotion={shouldReduceMotion} columns={3}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Successful Check-Ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{checkInCounts.success}</div>
                <p className="text-xs text-muted-foreground">Completed check-ins</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Expected Remaining
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.max(0, (stats?.totalExpected ?? 0) - (stats?.totalCheckedIn ?? 0))}
                </div>
                <p className="text-xs text-muted-foreground">Still pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Total Scans Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCheckedIn ?? 0}</div>
                <p className="text-xs text-muted-foreground">All scan attempts</p>
              </CardContent>
            </Card>
          </AnimatedStatsGrid>
        </>
      )}
    </div>
  );
}

export function ReportsContent({ orgId }: ReportsContentProps) {
  return (
    <Suspense fallback={<ReportsPageLoadingSkeleton />}>
      <ReportsPageContentInner orgId={orgId} />
    </Suspense>
  );
}
