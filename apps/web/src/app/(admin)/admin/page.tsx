'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  Ghost,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getAdminDashboard, type AdminDashboardStats } from '@/lib/api/admin';

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getHealthIcon(status: string) {
  switch (status) {
    case 'healthy':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'degraded':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'unhealthy':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
}

function getHealthBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
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

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const result = await getAdminDashboard();
      if (result.error) {
        setError(result.error.message);
      } else if (result.data) {
        setData(result.data);
      }
      setIsLoading(false);
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-5 w-72" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="mt-2 h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Platform Dashboard</h1>
          <p className="text-muted-foreground">Platform-wide statistics and health overview</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading dashboard</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Users',
      value: formatNumber(data?.stats.total_users ?? 0),
      change: `+${data?.growth.users_7d ?? 0} this week`,
      icon: Users,
    },
    {
      title: 'Organizations',
      value: formatNumber(data?.stats.total_organizations ?? 0),
      change: `+${data?.growth.orgs_7d ?? 0} this week`,
      icon: Building2,
    },
    {
      title: 'Attractions',
      value: formatNumber(data?.stats.total_attractions ?? 0),
      change: 'Active venues',
      icon: Ghost,
    },
    {
      title: 'Growth (30d)',
      value: `+${data?.growth.users_30d ?? 0}`,
      change: 'New users this month',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Dashboard</h1>
        <p className="text-muted-foreground">Platform-wide statistics and health overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Health & Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Current status of platform services</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(data?.health ?? {}).length === 0 ? (
              <p className="text-sm text-muted-foreground">No health data available</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(data?.health ?? {}).map(([service, status]) => (
                  <div key={service} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getHealthIcon(status)}
                      <span className="text-sm font-medium capitalize">{service}</span>
                    </div>
                    <Badge variant={getHealthBadgeVariant(status)}>{status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest admin and system actions</CardDescription>
          </CardHeader>
          <CardContent>
            {(data?.recent_activity ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : (
              <div className="space-y-4">
                {(data?.recent_activity ?? []).slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="flex-1">
                      <p className="font-medium">
                        {activity.actor
                          ? `${activity.actor.first_name} ${activity.actor.last_name}`
                          : 'System'}
                      </p>
                      <p className="text-muted-foreground">
                        {activity.action} on {activity.resource_type}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <a
            href="/admin/users"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            <Users className="h-4 w-4" />
            Manage Users
          </a>
          <a
            href="/admin/organizations"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            <Building2 className="h-4 w-4" />
            Manage Organizations
          </a>
          <a
            href="/admin/feature-flags"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            <Activity className="h-4 w-4" />
            Feature Flags
          </a>
          <a
            href="/admin/audit-logs"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            <AlertCircle className="h-4 w-4" />
            Audit Logs
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
