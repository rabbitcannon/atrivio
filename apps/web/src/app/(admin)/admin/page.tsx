'use client';

import {
  Activity,
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle,
  CreditCard,
  Ghost,
  TrendingUp,
  UserPlus,
  Users,
  XCircle,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  type AdminDashboardStats,
  type SystemHealth,
  getAdminDashboard,
  getSystemHealth,
} from '@/lib/api/admin';

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

function getHealthBadgeVariant(
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

// Action labels for human-readable display
const ACTION_LABELS: Record<string, string> = {
  'organization.created': 'Organization created',
  'organization.updated': 'Organization updated',
  'organization.suspended': 'Organization suspended',
  'organization.reactivated': 'Organization reactivated',
  'organization.deleted': 'Organization deleted',
  'subscription.created': 'Subscription started',
  'subscription.upgraded': 'Subscription upgraded',
  'subscription.downgraded': 'Subscription downgraded',
  'subscription.canceled': 'Subscription canceled',
  'subscription.renewed': 'Subscription renewed',
  'stripe.account_connected': 'Stripe connected',
  'stripe.account_restricted': 'Stripe account restricted',
  'stripe.account_disabled': 'Stripe account disabled',
  'stripe.payment_failed': 'Payment failed',
  'user.registered': 'User registered',
  'user.updated': 'User updated',
  'user.super_admin_granted': 'Super admin granted',
  'user.super_admin_revoked': 'Super admin revoked',
  'user.deleted': 'User deleted',
  'feature_flag.created': 'Feature flag created',
  'feature_flag.updated': 'Feature flag updated',
  'feature_flag.deleted': 'Feature flag deleted',
  'platform.maintenance_mode_enabled': 'Maintenance mode enabled',
  'platform.maintenance_mode_disabled': 'Maintenance mode disabled',
  'platform.setting_updated': 'Platform setting updated',
};

function getActionLabel(action: string): string {
  return ACTION_LABELS[action] || action.replace(/[._]/g, ' ');
}

function getActionIcon(action: string) {
  if (action.startsWith('organization.')) {
    return <Building2 className="h-4 w-4 text-blue-500" />;
  }
  if (action.startsWith('subscription.')) {
    return <CreditCard className="h-4 w-4 text-purple-500" />;
  }
  if (action.startsWith('stripe.')) {
    return <Zap className="h-4 w-4 text-yellow-500" />;
  }
  if (action.startsWith('user.')) {
    return <UserPlus className="h-4 w-4 text-green-500" />;
  }
  if (action.startsWith('feature_flag.')) {
    return <Activity className="h-4 w-4 text-orange-500" />;
  }
  if (action.startsWith('platform.')) {
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  }
  return <Activity className="h-4 w-4 text-muted-foreground" />;
}

// Helper to normalize services from object to array
function normalizeServices(
  services: SystemHealth['services']
): Array<{ name: string; status: string; latency_ms?: number; message?: string }> {
  if (Array.isArray(services)) {
    return services;
  }
  return Object.entries(services).map(([name, service]) => ({
    name,
    ...service,
  }));
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHealthLoading, setIsHealthLoading] = useState(true);
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

    async function fetchHealth() {
      const result = await getSystemHealth();
      if (result.data) {
        setHealth(result.data);
      }
      setIsHealthLoading(false);
    }

    fetchData();
    fetchHealth();
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
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  System Health
                </CardTitle>
                <CardDescription>Current status of platform services</CardDescription>
              </div>
              {health && (
                <Badge variant={getHealthBadgeVariant(health.status)}>
                  {health.status.toUpperCase()}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isHealthLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-40" />
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ) : health ? (
              <div className="space-y-4">
                {/* Overall status message */}
                <div className="flex items-center gap-2">
                  {getHealthIcon(health.status)}
                  <span className="text-sm">
                    {health.status === 'healthy'
                      ? 'All systems operational'
                      : health.status === 'degraded'
                        ? 'Some services experiencing issues'
                        : 'Critical issues detected'}
                  </span>
                </div>

                {/* Service list */}
                <div className="space-y-2">
                  {normalizeServices(health.services).map((service) => (
                    <div key={service.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getHealthIcon(service.status)}
                        <span className="text-sm capitalize">{service.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {service.latency_ms !== undefined ? `${service.latency_ms}ms` : ''}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Link to full health page */}
                <Link
                  href="/admin/health"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  View details
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Unable to load health data</p>
                <Link
                  href="/admin/health"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  Check system health
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform events</CardDescription>
              </div>
              <Link
                href="/admin/audit-logs"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                View all
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {(data?.recent_activity ?? []).length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">No recent platform activity</p>
                <Link
                  href="/admin/audit-logs"
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  View all audit logs
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {(data?.recent_activity ?? []).slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <div className="mt-0.5 flex-shrink-0">
                      {getActionIcon(activity.action)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{getActionLabel(activity.action)}</p>
                      <p className="truncate text-muted-foreground">
                        {activity.actor
                          ? activity.actor.display_name || activity.actor.email || 'Unknown user'
                          : activity.actor_type === 'webhook'
                            ? 'Webhook'
                            : activity.actor_type === 'system'
                              ? 'System'
                              : 'Unknown'}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-xs text-muted-foreground">
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
