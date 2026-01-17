'use client';

import {
  AlertCircle,
  Building2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Download,
  Filter,
  Flag,
  Megaphone,
  Search,
  Server,
  Settings,
  Shield,
  User,
  UserPlus,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { type AuditLog, getAuditLogs } from '@/lib/api/admin';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

// Human-readable labels for actions
const ACTION_LABELS: Record<string, string> = {
  'organization.created': 'Organization Created',
  'organization.updated': 'Organization Updated',
  'organization.suspended': 'Organization Suspended',
  'organization.reactivated': 'Organization Reactivated',
  'organization.deleted': 'Organization Deleted',
  'subscription.created': 'Subscription Started',
  'subscription.upgraded': 'Subscription Upgraded',
  'subscription.downgraded': 'Subscription Downgraded',
  'subscription.canceled': 'Subscription Canceled',
  'subscription.payment_failed': 'Payment Failed',
  'stripe.account_created': 'Stripe Account Created',
  'stripe.account_connected': 'Stripe Account Connected',
  'stripe.account_restricted': 'Stripe Account Restricted',
  'stripe.account_disabled': 'Stripe Account Disabled',
  'stripe.payout_failed': 'Payout Failed',
  'user.registered': 'User Registered',
  'user.updated': 'User Updated',
  'user.deleted': 'User Deleted',
  'user.super_admin_granted': 'Super Admin Granted',
  'user.super_admin_revoked': 'Super Admin Revoked',
  'user.impersonated': 'User Impersonated',
  'feature_flag.created': 'Feature Flag Created',
  'feature_flag.updated': 'Feature Flag Updated',
  'feature_flag.deleted': 'Feature Flag Deleted',
  'feature.enabled': 'Feature Enabled',
  'feature.disabled': 'Feature Disabled',
  'setting.updated': 'Setting Updated',
  'announcement.created': 'Announcement Created',
  'announcement.updated': 'Announcement Updated',
  'announcement.deleted': 'Announcement Deleted',
  'rate_limit.created': 'Rate Limit Created',
  'rate_limit.updated': 'Rate Limit Updated',
  'rate_limit.deleted': 'Rate Limit Deleted',
  'system.error': 'System Error',
  'system.maintenance_enabled': 'Maintenance Enabled',
  'system.maintenance_disabled': 'Maintenance Disabled',
};

function getActionIcon(action: string) {
  if (action.startsWith('user.')) return <User className="h-4 w-4" />;
  if (action.startsWith('organization.')) return <Building2 className="h-4 w-4" />;
  if (action.startsWith('subscription.')) return <CreditCard className="h-4 w-4" />;
  if (action.startsWith('stripe.')) return <CreditCard className="h-4 w-4" />;
  if (action.startsWith('setting.')) return <Settings className="h-4 w-4" />;
  if (action.startsWith('feature')) return <Flag className="h-4 w-4" />;
  if (action.startsWith('announcement.')) return <Megaphone className="h-4 w-4" />;
  if (action.startsWith('rate_limit.')) return <Zap className="h-4 w-4" />;
  if (action.startsWith('system.')) return <Server className="h-4 w-4" />;
  return <Shield className="h-4 w-4" />;
}

function getActionBadgeVariant(
  action: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (
    action.includes('delete') ||
    action.includes('suspend') ||
    action.includes('revoke') ||
    action.includes('disabled') ||
    action.includes('failed') ||
    action.includes('error')
  ) {
    return 'destructive';
  }
  if (
    action.includes('create') ||
    action.includes('grant') ||
    action.includes('enable') ||
    action.includes('connected') ||
    action.includes('registered') ||
    action.includes('upgraded')
  ) {
    return 'default';
  }
  if (action.includes('update') || action.includes('modify') || action.includes('downgraded')) {
    return 'secondary';
  }
  return 'outline';
}

function getActorTypeIcon(actorType: string) {
  switch (actorType) {
    case 'webhook':
      return <Zap className="h-3 w-3" />;
    case 'system':
      return <Server className="h-3 w-3" />;
    case 'api_key':
      return <Shield className="h-3 w-3" />;
    default:
      return <User className="h-3 w-3" />;
  }
}

function MetadataDisplay({ metadata }: { metadata: Record<string, unknown> | null }) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  // Filter out internal metadata
  const displayMeta = Object.entries(metadata).filter(
    ([key]) => !key.startsWith('is_') && key !== 'actor_type'
  );

  if (displayMeta.length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }

  return (
    <div className="space-y-1">
      {displayMeta.slice(0, 3).map(([key, value]) => (
        <div key={key} className="text-xs">
          <span className="text-muted-foreground">{key.replace(/_/g, ' ')}:</span>{' '}
          <span className="font-medium">
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </span>
        </div>
      ))}
      {displayMeta.length > 3 && (
        <span className="text-xs text-muted-foreground">+{displayMeta.length - 3} more</span>
      )}
    </div>
  );
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [platformOnly, setPlatformOnly] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 50 });

  async function fetchLogs(options?: {
    search?: string;
    action?: string;
    page?: number;
    platformOnly?: boolean;
  }) {
    setIsLoading(true);
    setError(null);

    const params: {
      page: number;
      limit: number;
      search?: string;
      action?: string;
      platform_only?: boolean;
    } = {
      page: options?.page ?? meta.page,
      limit: meta.limit,
    };

    if (options?.search) params.search = options.search;
    if (options?.action && options.action !== 'all') params.action = options.action;
    if (options?.platformOnly ?? platformOnly) params.platform_only = true;

    const result = await getAuditLogs(params);

    if (result.error) {
      setError(result.error.message);
    } else if (result.data) {
      setLogs(result.data.data);
      setMeta(result.data.meta);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchLogs({ platformOnly });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs({ search: searchQuery, action: actionFilter, page: 1, platformOnly });
  };

  const handleActionChange = (value: string) => {
    setActionFilter(value);
    fetchLogs({ search: searchQuery, action: value, page: 1, platformOnly });
  };

  const handlePlatformOnlyChange = (checked: boolean) => {
    setPlatformOnly(checked);
    fetchLogs({ search: searchQuery, action: actionFilter, page: 1, platformOnly: checked });
  };

  const handlePageChange = (newPage: number) => {
    fetchLogs({ search: searchQuery, action: actionFilter, page: newPage, platformOnly });
  };

  const totalPages = Math.ceil(meta.total / meta.limit);

  if (isLoading && logs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-10 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Audit Logs</h1>
            <p className="text-muted-foreground">
              Track platform-level administrative actions and system events
            </p>
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Activity Log</CardTitle>
                  <CardDescription>
                    {meta.total.toLocaleString()} total entries
                    {platformOnly && ' (platform events only)'}
                  </CardDescription>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="platform-only"
                    checked={platformOnly}
                    onCheckedChange={handlePlatformOnlyChange}
                  />
                  <Label htmlFor="platform-only" className="text-sm">
                    Platform events only
                  </Label>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Select value={actionFilter} onValueChange={handleActionChange}>
                  <SelectTrigger className="w-48">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="organization">Organizations</SelectItem>
                    <SelectItem value="subscription">Subscriptions</SelectItem>
                    <SelectItem value="stripe">Stripe / Payments</SelectItem>
                    <SelectItem value="user">Users</SelectItem>
                    <SelectItem value="feature">Feature Flags</SelectItem>
                    <SelectItem value="setting">Settings</SelectItem>
                    <SelectItem value="announcement">Announcements</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>

                <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by actor, action, or resource..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Button type="submit" variant="secondary">
                    Search
                  </Button>
                </form>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Event</TableHead>
                    <TableHead className="w-[180px]">Actor</TableHead>
                    <TableHead className="w-[150px]">Resource</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="w-[120px] text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            {getActionIcon(log.action)}
                          </div>
                          <div>
                            <Badge variant={getActionBadgeVariant(log.action)} className="mb-1">
                              {ACTION_LABELS[log.action] || log.action.replace(/[._]/g, ' ')}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                            {getActorTypeIcon(log.actor_type)}
                          </div>
                          <div>
                            {log.actor ? (
                              <>
                                <p className="text-sm font-medium">
                                  {log.actor.name || log.actor.email?.split('@')[0] || 'Unknown'}
                                </p>
                                <p className="text-xs text-muted-foreground">{log.actor.email}</p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm font-medium capitalize">{log.actor_type}</p>
                                <p className="text-xs text-muted-foreground">Automated</p>
                              </>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="outline" className="mb-1 capitalize">
                            {log.resource_type}
                          </Badge>
                          {log.resource_id && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="cursor-help font-mono text-xs text-muted-foreground">
                                  {log.resource_id.slice(0, 8)}...
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="font-mono text-xs">{log.resource_id}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <MetadataDisplay metadata={log.metadata} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help text-sm text-muted-foreground">
                              {formatRelativeTime(log.created_at)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{formatDate(log.created_at)}</p>
                            {log.ip_address && (
                              <p className="text-xs text-muted-foreground">IP: {log.ip_address}</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {logs.length === 0 && !isLoading && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <Shield className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">No audit logs found</p>
                          <p className="text-sm text-muted-foreground">
                            {platformOnly
                              ? 'Platform events will appear here as they occur'
                              : 'Try adjusting your filters'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Page {meta.page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(meta.page - 1)}
                    disabled={meta.page <= 1 || isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(meta.page + 1)}
                    disabled={meta.page >= totalPages || isLoading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
