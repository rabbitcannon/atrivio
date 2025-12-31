'use client';

import { useEffect, useState } from 'react';
import { Search, MoreHorizontal, Building2, AlertCircle, Pause, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getAdminOrganizations,
  suspendOrganization,
  reactivateOrganization,
  type AdminOrg,
} from '@/lib/api/admin';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default';
    case 'suspended':
      return 'destructive';
    case 'deleted':
      return 'secondary';
    default:
      return 'outline';
  }
}

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState<AdminOrg[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20 });
  const [selectedOrg, setSelectedOrg] = useState<AdminOrg | null>(null);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isReactivateOpen, setIsReactivateOpen] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');

  async function fetchOrganizations(search?: string, status?: string) {
    setIsLoading(true);
    const params: { page: number; limit: number; search?: string; status?: 'active' | 'suspended' | 'deleted' } = {
      page: meta.page,
      limit: meta.limit,
    };
    if (search) params.search = search;
    if (status && status !== 'all') params.status = status as 'active' | 'suspended' | 'deleted';
    const result = await getAdminOrganizations(params);

    if (result.error) {
      setError(result.error.message);
    } else if (result.data) {
      setOrganizations(result.data.data);
      setMeta(result.data.meta);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrganizations(searchQuery, statusFilter);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    fetchOrganizations(searchQuery, value);
  };

  const handleSuspend = async () => {
    if (!selectedOrg || !suspendReason.trim()) return;

    const result = await suspendOrganization(selectedOrg.id, {
      reason: suspendReason,
      notify_owner: true,
    });

    if (result.error) {
      setError(result.error.message);
    } else {
      fetchOrganizations(searchQuery, statusFilter);
    }

    setIsSuspendOpen(false);
    setSelectedOrg(null);
    setSuspendReason('');
  };

  const handleReactivate = async () => {
    if (!selectedOrg) return;

    const result = await reactivateOrganization(selectedOrg.id);

    if (result.error) {
      setError(result.error.message);
    } else {
      fetchOrganizations(searchQuery, statusFilter);
    }

    setIsReactivateOpen(false);
    setSelectedOrg(null);
  };

  if (isLoading && organizations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="mt-2 h-5 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-10 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
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
        <h1 className="text-3xl font-bold">Organizations</h1>
        <p className="text-muted-foreground">Manage platform organizations</p>
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
              <CardTitle>All Organizations</CardTitle>
              <CardDescription>{meta.total} total organizations</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search organizations..."
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
                <TableHead>Organization</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Attractions</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {organizations.map((org) => (
                <TableRow key={org.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{org.name}</p>
                        <p className="text-xs text-muted-foreground">{org.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {org.owner ? (
                      <div>
                        <p className="text-sm">{org.owner.name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{org.owner.email}</p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No owner</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(org.status)}>{org.status}</Badge>
                  </TableCell>
                  <TableCell>{org.member_count}</TableCell>
                  <TableCell>{org.attraction_count}</TableCell>
                  <TableCell>{formatDate(org.created_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <a href={`/admin/organizations/${org.id}`}>View Details</a>
                        </DropdownMenuItem>
                        {org.status === 'active' && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedOrg(org);
                              setIsSuspendOpen(true);
                            }}
                          >
                            <Pause className="mr-2 h-4 w-4" />
                            Suspend
                          </DropdownMenuItem>
                        )}
                        {org.status === 'suspended' && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedOrg(org);
                              setIsReactivateOpen(true);
                            }}
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Reactivate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {organizations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    No organizations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Suspend Dialog */}
      <Dialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend Organization</DialogTitle>
            <DialogDescription>
              Suspending {selectedOrg?.name} will prevent all members from accessing the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for suspension</Label>
              <Textarea
                id="reason"
                placeholder="Enter the reason for suspending this organization..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuspendOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={!suspendReason.trim()}
            >
              Suspend Organization
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reactivate Dialog */}
      <Dialog open={isReactivateOpen} onOpenChange={setIsReactivateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reactivate Organization</DialogTitle>
            <DialogDescription>
              Are you sure you want to reactivate {selectedOrg?.name}? Members will regain access
              to the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReactivateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReactivate}>Reactivate Organization</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
