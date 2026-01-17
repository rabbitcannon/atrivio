'use client';

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Crown,
  ExternalLink,
  Loader2,
  LogIn,
  Mail,
  MoreHorizontal,
  Shield,
  ShieldOff,
  Trash2,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useImpersonation } from '@/hooks/use-impersonation';
import {
  type AdminUser,
  deleteAdminUser,
  getAdminUser,
  updateAdminUser,
} from '@/lib/api/admin';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTime(dateString: string): string {
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

function getUserInitials(user: AdminUser): string {
  if (user.first_name || user.last_name) {
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
  }
  return user.email[0].toUpperCase();
}

function getUserDisplayName(user: AdminUser): string {
  if (user.first_name || user.last_name) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim();
  }
  return 'Unknown';
}

export default function AdminUserDetailPage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const userId = params.userId;

  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog states
  const [isConfirmAdminOpen, setIsConfirmAdminOpen] = useState(false);
  const [adminAction, setAdminAction] = useState<'grant' | 'revoke' | null>(null);
  const [isProcessingAdmin, setIsProcessingAdmin] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [isImpersonateOpen, setIsImpersonateOpen] = useState(false);

  // Impersonation hook
  const { startImpersonation, isProcessing: isImpersonating } = useImpersonation();

  useEffect(() => {
    async function fetchUser() {
      setIsLoading(true);
      setError(null);

      const result = await getAdminUser(userId);

      if (result.error) {
        setError(result.error.message);
      } else if (result.data) {
        setUser(result.data);
      }

      setIsLoading(false);
    }

    fetchUser();
  }, [userId]);

  const handleToggleAdmin = async () => {
    if (!user || !adminAction) return;

    setIsProcessingAdmin(true);
    const newStatus = adminAction === 'grant';
    const result = await updateAdminUser(user.id, { is_super_admin: newStatus });

    if (result.error) {
      setError(result.error.message);
    } else if (result.data) {
      setUser(result.data);
      setSuccess(
        adminAction === 'grant'
          ? 'Super admin access granted successfully'
          : 'Super admin access revoked successfully'
      );
      setTimeout(() => setSuccess(null), 3000);
    }

    setIsProcessingAdmin(false);
    setIsConfirmAdminOpen(false);
    setAdminAction(null);
  };

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    const result = await deleteAdminUser(user.id, {
      confirm: true,
      reason: deleteReason || undefined,
    });

    if (result.error) {
      setError(result.error.message);
      setIsDeleting(false);
    } else {
      router.push('/admin/users');
    }
  };

  const handleImpersonate = async () => {
    if (!user) return;

    setIsImpersonateOpen(false);
    const result = await startImpersonation(user.id);

    if (!result.success) {
      setError(result.error || 'Failed to start impersonation');
    }
    // If successful, the hook will redirect to the dashboard
  };

  const openAdminDialog = (action: 'grant' | 'revoke') => {
    setAdminAction(action);
    setIsConfirmAdminOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Users
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>User not found</AlertTitle>
          <AlertDescription>{error || 'The user could not be found.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/users">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatar_url || undefined} alt={getUserDisplayName(user)} />
            <AvatarFallback className="text-lg">{getUserInitials(user)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{getUserDisplayName(user)}</h1>
              {user.is_super_admin && (
                <Badge variant="destructive" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Super Admin
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setIsImpersonateOpen(true)}>
              <LogIn className="mr-2 h-4 w-4" />
              Impersonate User
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/audit-logs?actor_id=${user.id}`}>
                <Activity className="mr-2 h-4 w-4" />
                View Audit Logs
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.is_super_admin ? (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => openAdminDialog('revoke')}
              >
                <ShieldOff className="mr-2 h-4 w-4" />
                Revoke Admin
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => openAdminDialog('grant')}>
                <Shield className="mr-2 h-4 w-4" />
                Grant Admin
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* User Info & Activity Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="font-medium">
                  {user.is_super_admin ? (
                    <Badge variant="destructive" className="gap-1">
                      <Shield className="h-3 w-3" />
                      Super Admin
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Regular User</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="font-medium flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(user.created_at)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium">{formatDate(user.updated_at)}</p>
              </div>
            </div>
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-mono text-xs text-muted-foreground">{user.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Summary
            </CardTitle>
            <CardDescription>Last 30 days of activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Organizations</span>
                <span className="text-2xl font-bold">{user.organizations?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Recent Actions</span>
                <span className="text-2xl font-bold">
                  {user.audit_summary?.recent_actions || 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Active</span>
                <span className="font-medium">
                  {user.audit_summary?.last_action_at
                    ? formatRelativeTime(user.audit_summary.last_action_at)
                    : 'Never'}
                </span>
              </div>
              <div className="pt-4 border-t">
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/admin/audit-logs?actor_id=${user.id}`}>
                    View Full Activity Log
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Organizations
          </CardTitle>
          <CardDescription>
            Member of {user.organizations?.length || 0} organization
            {(user.organizations?.length || 0) !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.organizations && user.organizations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {user.organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {org.name}
                          {org.is_owner && (
                            <Badge variant="secondary" className="gap-1">
                              <Crown className="h-3 w-3" />
                              Owner
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{org.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {org.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(org.joined_at)}</TableCell>
                    <TableCell>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/organizations/${org.id}`}>
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <Building2 className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p>Not a member of any organizations</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grant/Revoke Admin Dialog */}
      <Dialog open={isConfirmAdminOpen} onOpenChange={setIsConfirmAdminOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {adminAction === 'grant' ? 'Grant Super Admin Access' : 'Revoke Super Admin Access'}
            </DialogTitle>
            <DialogDescription>
              {adminAction === 'grant'
                ? `Are you sure you want to grant super admin access to ${user.email}? They will have full platform access including the ability to manage all organizations and users.`
                : `Are you sure you want to revoke super admin access from ${user.email}? They will lose all platform administration privileges.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmAdminOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={adminAction === 'revoke' ? 'destructive' : 'default'}
              onClick={handleToggleAdmin}
              disabled={isProcessingAdmin}
            >
              {isProcessingAdmin && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {adminAction === 'grant' ? 'Grant Access' : 'Revoke Access'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {user.email}? This action cannot be undone. The user
              will be removed from all organizations.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deleteReason">Reason (optional)</Label>
              <Input
                id="deleteReason"
                placeholder="Enter a reason for deletion..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Impersonate Dialog */}
      <Dialog open={isImpersonateOpen} onOpenChange={setIsImpersonateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Impersonate User</DialogTitle>
            <DialogDescription>
              You are about to impersonate {user.email}. All actions performed while impersonating
              will be logged and attributed to your admin account.
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Impersonation should only be used for debugging and support purposes. The user will
              not be notified, but all actions will be recorded in the audit log.
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImpersonateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImpersonate} disabled={isImpersonating}>
              {isImpersonating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Impersonation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
