'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, AlertCircle, User, Building2, Settings, Shield, Flag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getAuditLogs, type AuditLog } from '@/lib/api/admin';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function getActionIcon(action: string) {
  if (action.includes('user')) return <User className="h-4 w-4" />;
  if (action.includes('org')) return <Building2 className="h-4 w-4" />;
  if (action.includes('setting')) return <Settings className="h-4 w-4" />;
  if (action.includes('admin')) return <Shield className="h-4 w-4" />;
  if (action.includes('flag')) return <Flag className="h-4 w-4" />;
  return <Settings className="h-4 w-4" />;
}

function getActionBadgeVariant(action: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (action.includes('delete') || action.includes('suspend') || action.includes('revoke')) {
    return 'destructive';
  }
  if (action.includes('create') || action.includes('grant') || action.includes('enable')) {
    return 'default';
  }
  if (action.includes('update') || action.includes('modify')) {
    return 'secondary';
  }
  return 'outline';
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 50 });

  async function fetchLogs(search?: string, action?: string) {
    setIsLoading(true);
    const params: { page: number; limit: number; search?: string; action?: string } = {
      page: meta.page,
      limit: meta.limit,
    };
    if (search) params.search = search;
    if (action && action !== 'all') params.action = action;
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
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(searchQuery, actionFilter);
  };

  const handleActionChange = (value: string) => {
    setActionFilter(value);
    fetchLogs(searchQuery, value);
  };

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
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">Track all administrative actions on the platform</p>
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
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Activity Log</CardTitle>
              <CardDescription>{meta.total} total entries</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select value={actionFilter} onValueChange={handleActionChange}>
                <SelectTrigger className="w-40">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="user">User Actions</SelectItem>
                  <SelectItem value="org">Organization Actions</SelectItem>
                  <SelectItem value="setting">Setting Changes</SelectItem>
                  <SelectItem value="flag">Feature Flags</SelectItem>
                  <SelectItem value="admin">Admin Actions</SelectItem>
                </SelectContent>
              </Select>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-8"
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Action</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.action)}
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.actor ? (
                      <div>
                        <p className="text-sm font-medium">{log.actor.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{log.actor.email}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">System</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.target_type && log.target_id ? (
                      <div>
                        <Badge variant="outline" className="capitalize">
                          {log.target_type}
                        </Badge>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          {log.target_id.slice(0, 8)}...
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.metadata ? (
                      <pre className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {JSON.stringify(log.metadata)}
                      </pre>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.ip_address || '-'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(log.created_at)}
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    No audit logs found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
