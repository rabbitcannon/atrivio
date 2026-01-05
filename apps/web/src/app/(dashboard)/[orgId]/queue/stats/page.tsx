import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  UserCheck,
  UserX,
  AlertCircle,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { resolveOrgId, getAttractions, getQueueStats } from '@/lib/api';
import type { QueueStats } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Queue Analytics',
};

interface QueueStatsPageProps {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ date?: string }>;
}

export default async function QueueStatsPage({ params, searchParams }: QueueStatsPageProps) {
  const { orgId: orgIdentifier } = await params;
  const { date } = await searchParams;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Get the first attraction
  const attractionsResult = await getAttractions(orgId);
  const attractions = attractionsResult.data?.data || [];
  const primaryAttraction = attractions[0];

  if (!primaryAttraction) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/${orgIdentifier}/queue`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">No attractions found. Create an attraction first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  let stats: QueueStats | null = null;
  try {
    const statsResult = await getQueueStats(orgId, primaryAttraction.id, date);
    stats = statsResult.data;
  } catch {
    // Stats not available
  }

  const today = stats?.today;
  const byHour = stats?.byHour || [];

  // Calculate totals
  const totalJoined = today?.totalJoined ?? 0;
  const totalServed = today?.totalServed ?? 0;
  const totalExpired = today?.totalExpired ?? 0;
  const totalLeft = today?.totalLeft ?? 0;
  const totalNoShow = today?.totalNoShow ?? 0;
  const currentInQueue = today?.currentInQueue ?? 0;
  const avgWait = today?.avgWaitMinutes;
  const maxWait = today?.maxWaitMinutes;

  // Calculate conversion rate
  const conversionRate = totalJoined > 0 ? Math.round((totalServed / totalJoined) * 100) : 0;

  // Get today's date for display
  const displayDate = date ? new Date(date) : new Date();
  const formattedDate = displayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${orgIdentifier}/queue`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Queue Analytics</h1>
            <p className="text-muted-foreground">{primaryAttraction.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{formattedDate}</span>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Joined</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalJoined}</div>
            <p className="text-xs text-muted-foreground">Guests entered queue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Served</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalServed}</div>
            <p className="text-xs text-muted-foreground">Successfully checked in</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expired/Left</CardTitle>
            <UserX className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{totalExpired + totalLeft}</div>
            <p className="text-xs text-muted-foreground">
              {totalExpired} expired, {totalLeft} left
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">No Shows</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totalNoShow}</div>
            <p className="text-xs text-muted-foreground">Called but didn&apos;t arrive</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgWait != null ? `${Math.round(avgWait)} min` : '--'}
            </div>
            <p className="text-xs text-muted-foreground">Average across all guests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Max Wait Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {maxWait != null ? `${Math.round(maxWait)} min` : '--'}
            </div>
            <p className="text-xs text-muted-foreground">Longest wait today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Joined → Checked In</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Current Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{currentInQueue}</div>
            <div className="text-sm text-muted-foreground">
              guests currently in queue
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hourly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Hourly Breakdown</CardTitle>
          <CardDescription>
            Queue activity by hour
          </CardDescription>
        </CardHeader>
        <CardContent>
          {byHour.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hourly data available for this date.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hour</TableHead>
                  <TableHead className="text-right">Joined</TableHead>
                  <TableHead className="text-right">Served</TableHead>
                  <TableHead className="text-right">Expired</TableHead>
                  <TableHead className="text-right">Avg Wait</TableHead>
                  <TableHead className="text-right">Max Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {byHour.map((hourData) => {
                  const hourNum = parseInt(hourData.hour, 10);
                  const hourLabel = hourNum === 0 ? '12 AM' :
                    hourNum < 12 ? `${hourNum} AM` :
                    hourNum === 12 ? '12 PM' :
                    `${hourNum - 12} PM`;

                  return (
                    <TableRow key={hourData.hour}>
                      <TableCell className="font-medium">{hourLabel}</TableCell>
                      <TableCell className="text-right">{hourData.joined}</TableCell>
                      <TableCell className="text-right text-green-600">{hourData.served}</TableCell>
                      <TableCell className="text-right text-amber-600">{hourData.expired}</TableCell>
                      <TableCell className="text-right">
                        {hourData.avgWait != null ? `${Math.round(hourData.avgWait)} min` : '--'}
                      </TableCell>
                      <TableCell className="text-right">{hourData.maxSize}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>
            Performance summary and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
              <UserCheck className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium">Service Rate</h4>
              <p className="text-sm text-muted-foreground">
                {totalServed > 0
                  ? `${totalServed} guests successfully served with ${conversionRate}% conversion rate.`
                  : 'No guests served yet today.'}
              </p>
            </div>
          </div>

          {totalExpired > 0 && (
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h4 className="font-medium">Expired Entries</h4>
                <p className="text-sm text-muted-foreground">
                  {totalExpired} entries expired. Consider adjusting max wait time or notification timing.
                </p>
              </div>
            </div>
          )}

          {totalNoShow > 0 && (
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-red-100 p-2 dark:bg-red-900">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h4 className="font-medium">No Shows</h4>
                <p className="text-sm text-muted-foreground">
                  {totalNoShow} guests were called but didn&apos;t arrive. Consider sending reminder notifications.
                </p>
              </div>
            </div>
          )}

          {avgWait != null && avgWait > 60 && (
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Wait Time</h4>
                <p className="text-sm text-muted-foreground">
                  Average wait time is {Math.round(avgWait)} minutes. Consider increasing batch size or frequency.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
