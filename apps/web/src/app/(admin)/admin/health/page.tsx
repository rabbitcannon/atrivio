'use client';

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Database,
  HardDrive,
  RefreshCw,
  Server,
  Wifi,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getSystemHealth, type ServiceStatus, type SystemHealth } from '@/lib/api/admin';

function getStatusIcon(status: string) {
  switch (status) {
    case 'healthy':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'degraded':
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case 'unhealthy':
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <Clock className="h-5 w-5 text-muted-foreground" />;
  }
}

function getStatusBadgeVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'healthy':
      return 'default';
    case 'degraded':
      return 'secondary';
    case 'unhealthy':
      return 'destructive';
    default:
      return 'outline';
  }
}

// Convert services object to array format
function normalizeServices(
  services: SystemHealth['services']
): Array<ServiceStatus & { name: string }> {
  if (Array.isArray(services)) {
    return services;
  }
  // Convert object to array
  return Object.entries(services).map(([name, service]) => ({
    name,
    ...service,
  }));
}

export default function AdminHealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Normalize services to array format
  const services = useMemo(() => {
    if (!health) return [];
    return normalizeServices(health.services);
  }, [health]);

  const healthyCount = useMemo(() => {
    return services.filter((s) => s.status === 'healthy').length;
  }, [services]);

  async function fetchHealth() {
    const result = await getSystemHealth();

    if (result.error) {
      setError(result.error.message);
    } else if (result.data) {
      setHealth(result.data);
      setError(null);
    }
    setLastChecked(new Date());
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    await fetchHealth();
    setIsRefreshing(false);
  }

  useEffect(() => {
    setIsLoading(true);
    fetchHealth().finally(() => setIsLoading(false));

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground">
            Monitor platform services and infrastructure status
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastChecked && (
            <span className="text-sm text-muted-foreground">
              Last checked: {lastChecked.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {health && (
        <>
          {/* Overall Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Overall Status</CardTitle>
                <Badge variant={getStatusBadgeVariant(health.status)} className="text-sm">
                  {health.status.toUpperCase()}
                </Badge>
              </div>
              <CardDescription>Platform-wide health summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                {getStatusIcon(health.status)}
                <div>
                  <p className="font-medium">
                    {health.status === 'healthy'
                      ? 'All systems operational'
                      : health.status === 'degraded'
                        ? 'Some services are experiencing issues'
                        : 'Critical issues detected'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {healthyCount} of {services.length} services healthy
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Status Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {service.name === 'database' && <Database className="h-4 w-4" />}
                      {service.name === 'api' && <Server className="h-4 w-4" />}
                      {service.name === 'redis' && <HardDrive className="h-4 w-4" />}
                      {!['database', 'api', 'redis'].includes(service.name) && (
                        <Wifi className="h-4 w-4" />
                      )}
                      <CardTitle className="text-base capitalize">
                        {service.name.replace(/_/g, ' ')}
                      </CardTitle>
                    </div>
                    {getStatusIcon(service.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant={getStatusBadgeVariant(service.status)}>{service.status}</Badge>
                  {service.latency_ms !== undefined && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Latency: {service.latency_ms}ms
                    </p>
                  )}
                  {service.message && (
                    <p className="mt-1 text-sm text-muted-foreground">{service.message}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Request Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Request Metrics</CardTitle>
              <CardDescription>API performance and error rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Requests/min</p>
                  <p className="text-2xl font-bold">{health.metrics.requests_per_minute ?? 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Error Rate</p>
                  <p className="text-2xl font-bold">
                    {(health.metrics.error_rate ?? 0).toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <p className="text-2xl font-bold">
                    {(health.metrics.avg_response_time_ms ?? 0).toFixed(0)}ms
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
