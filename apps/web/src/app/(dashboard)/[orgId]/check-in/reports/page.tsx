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
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
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
import { getAttractions, getCheckInStats, listCheckIns } from '@/lib/api/client';
import type { AttractionListItem, CheckInStats } from '@/lib/api/types';

function ReportsPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orgId = params['orgId'] as string;
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
      <div className="flex items-center gap-4">
        <Link href={`/${orgId}/check-in`}>
          <Button variant="ghost" size="icon" aria-label="Back to check-in">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Check-In Reports</h1>
          <p className="text-muted-foreground">Analytics and statistics for guest check-ins.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid gap-4 sm:grid-cols-3">
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
      </div>

      {isLoadingStats ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
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
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No station data available</p>
                  </div>
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
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No method data available</p>
                  </div>
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
          </div>

          {/* Hourly Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Hourly Check-In Distribution
              </CardTitle>
              <CardDescription>Check-ins throughout the day. Peak hour: {peakHour}</CardDescription>
            </CardHeader>
            <CardContent>
              {!stats?.byHour || stats.byHour.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No check-in data yet</p>
                  <p className="text-sm">
                    Check-in data will appear here once guests start arriving.
                  </p>
                </div>
              ) : (
                <div className="flex items-end justify-between h-48 gap-1">
                  {stats.byHour.map((hour) => {
                    const maxCount = Math.max(...stats.byHour.map((h) => h.count), 1);
                    const height = maxCount > 0 ? (hour.count / maxCount) * 100 : 0;
                    return (
                      <div key={hour.hour} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs text-muted-foreground">{hour.count}</span>
                        <div
                          className="w-full bg-primary rounded-t transition-all"
                          style={{ height: `${height}%`, minHeight: hour.count > 0 ? '4px' : '0' }}
                        />
                        <span className="text-xs text-muted-foreground">{hour.hour}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats Summary */}
          <div className="grid gap-4 md:grid-cols-3">
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
          </div>
        </>
      )}
    </div>
  );
}

export default function ReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ReportsPageContent />
    </Suspense>
  );
}
