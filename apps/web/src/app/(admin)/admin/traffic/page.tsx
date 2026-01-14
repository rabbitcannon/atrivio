'use client';

import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Clock,
  RefreshCw,
  TrendingUp,
  Users,
  Wifi,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import {
  getRealTimeTraffic,
  getTrafficStats,
  type RealTimeTrafficStats,
  type TrafficStats,
} from '@/lib/api/admin';

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export default function AdminTrafficPage() {
  const [trafficStats, setTrafficStats] = useState<TrafficStats | null>(null);
  const [realTimeStats, setRealTimeStats] = useState<RealTimeTrafficStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [windowMinutes, setWindowMinutes] = useState(60);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [trafficResult, realTimeResult] = await Promise.all([
        getTrafficStats(windowMinutes),
        getRealTimeTraffic(),
      ]);

      if (trafficResult.error) {
        setError(trafficResult.error.message);
      } else if (trafficResult.data) {
        setTrafficStats(trafficResult.data);
      }

      if (realTimeResult.data) {
        setRealTimeStats(realTimeResult.data);
      }

      setLastUpdated(new Date());
    } catch {
      setError('Failed to fetch traffic data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [windowMinutes]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-5 w-80" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const hasThrottleEvents =
    trafficStats?.recentThrottleEvents && trafficStats.recentThrottleEvents.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Traffic Monitor</h1>
          <p className="text-muted-foreground">
            Real-time API traffic monitoring and rate limit analysis
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={windowMinutes.toString()} onValueChange={(v) => setWindowMinutes(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">Last 15 min</SelectItem>
              <SelectItem value="30">Last 30 min</SelectItem>
              <SelectItem value="60">Last hour</SelectItem>
              <SelectItem value="180">Last 3 hours</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {lastUpdated && (
        <p className="text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()} (auto-refreshes every 30s)
        </p>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Real-time Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Minute</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {realTimeStats?.currentMinuteRequests ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">requests this minute</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeStats?.activeUsers ?? 0}</div>
            <p className="text-xs text-muted-foreground">in the last minute</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique IPs</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{realTimeStats?.activeIps ?? 0}</div>
            <p className="text-xs text-muted-foreground">in the last minute</p>
          </CardContent>
        </Card>

        <Card className={hasThrottleEvents ? 'border-yellow-500' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Would-Be Throttles</CardTitle>
            <AlertTriangle
              className={`h-4 w-4 ${hasThrottleEvents ? 'text-yellow-500' : 'text-muted-foreground'}`}
            />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${hasThrottleEvents ? 'text-yellow-600' : ''}`}>
              {realTimeStats?.throttleEventsLastHour ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">in the last hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(trafficStats?.totalRequests ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {trafficStats?.requestsPerMinute ?? 0} req/min average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Window</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{windowMinutes} min</div>
            <p className="text-xs text-muted-foreground">analysis window</p>
          </CardContent>
        </Card>
      </div>

      {/* Would-Be Throttle Events */}
      {hasThrottleEvents && (
        <Alert variant="default" className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800 dark:text-yellow-200">
            Rate Limit Warnings
          </AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            {trafficStats?.recentThrottleEvents.length} requests would have been throttled if rate
            limiting was enforced. Review the events below.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle>Top Endpoints</CardTitle>
            <CardDescription>Most requested API endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint</TableHead>
                  <TableHead className="text-right">Requests</TableHead>
                  <TableHead className="text-right">Req/Min</TableHead>
                  <TableHead className="text-right">Users</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trafficStats?.topEndpoints.slice(0, 10).map((endpoint) => (
                  <TableRow key={endpoint.endpoint}>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {endpoint.endpoint}
                      </code>
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(endpoint.requestCount)}</TableCell>
                    <TableCell className="text-right">{endpoint.requestsPerMinute}</TableCell>
                    <TableCell className="text-right">{endpoint.uniqueUsers}</TableCell>
                  </TableRow>
                ))}
                {(!trafficStats?.topEndpoints || trafficStats.topEndpoints.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                      No traffic data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle>Top Users</CardTitle>
            <CardDescription>Users with highest request volume</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead className="text-right">Requests</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trafficStats?.topUsers.slice(0, 10).map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                        {user.userId.slice(0, 8)}...
                      </code>
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(user.requestCount)}</TableCell>
                    <TableCell>
                      {user.wouldBeThrottled ? (
                        <Badge variant="destructive" className="text-xs">
                          Would Throttle
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Normal
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {(!trafficStats?.topUsers || trafficStats.topUsers.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                      No user traffic data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Recent Throttle Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Would-Be Throttle Events
            {hasThrottleEvents && (
              <Badge variant="destructive">{trafficStats?.recentThrottleEvents.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Requests that would have been rate limited (monitoring only - not enforced)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>User/IP</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Rule</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-center">
                  <ArrowRight className="inline h-4 w-4" />
                </TableHead>
                <TableHead className="text-right">Limit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trafficStats?.recentThrottleEvents.slice(0, 20).map((event, idx) => (
                <TableRow key={`${event.timestamp}-${idx}`}>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatTimestamp(event.timestamp)}
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {event.userId ? `${event.userId.slice(0, 8)}...` : event.ip}
                    </code>
                  </TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{event.endpoint}</code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{event.ruleName}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    {event.actual}
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground">/</TableCell>
                  <TableCell className="text-right">{event.limit}</TableCell>
                </TableRow>
              ))}
              {(!trafficStats?.recentThrottleEvents ||
                trafficStats.recentThrottleEvents.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No throttle events detected - all traffic within limits
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertTitle>Monitoring Mode</AlertTitle>
        <AlertDescription>
          Rate limiting is in <strong>monitoring mode</strong> - no requests are being blocked.
          Traffic is tracked against your rate limit rules to help you tune thresholds before
          enabling enforcement. When ready, configure enforcement via Cloudflare or your API
          gateway.
        </AlertDescription>
      </Alert>
    </div>
  );
}
