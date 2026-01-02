'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowDown,
  Hand,
  Calendar,
  Clock,
  AlertCircle,
  X,
  Loader2,
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getOrgBySlug,
  getMySwapRequests,
  cancelSwapRequest,
  type ShiftSwapRequest,
  type SwapStatus,
} from '@/lib/api/client';

const STATUS_COLORS: Record<SwapStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  approved: 'default',
  rejected: 'destructive',
  canceled: 'secondary',
  expired: 'secondary',
};

const STATUS_LABELS: Record<SwapStatus, string> = {
  pending: 'Pending Review',
  approved: 'Approved',
  rejected: 'Rejected',
  canceled: 'Canceled',
  expired: 'Expired',
};

const SWAP_TYPE_ICONS = {
  swap: ArrowLeftRight,
  drop: ArrowDown,
  pickup: Hand,
};

const SWAP_TYPE_LABELS = {
  swap: 'Shift Swap',
  drop: 'Drop Shift',
  pickup: 'Pick Up Shift',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours!, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

function formatDateTime(isoStr: string): string {
  const date = new Date(isoStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function MySwapsPage() {
  const params = useParams<{ orgId: string }>();
  const orgSlug = params.orgId;
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  const [org, setOrg] = useState<{ id: string; name: string } | null>(null);
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancel dialog state
  const [cancelingSwap, setCancelingSwap] = useState<ShiftSwapRequest | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Fetch org
  useEffect(() => {
    async function fetchOrg() {
      const response = await getOrgBySlug(orgSlug);
      if (response.error || !response.data) {
        setError('Organization not found');
        setIsLoading(false);
        return;
      }
      setOrg(response.data);
    }
    fetchOrg();
  }, [orgSlug]);

  // Fetch swap requests
  useEffect(() => {
    async function fetchSwapRequests() {
      if (!user || !org) return;

      setIsLoading(true);
      setError(null);

      const response = await getMySwapRequests(org.id);
      if (response.error) {
        setError(response.error.message || 'Failed to load swap requests');
        setIsLoading(false);
        return;
      }

      // Sort by created_at descending
      const sorted = (response.data || []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setSwapRequests(sorted);
      setIsLoading(false);
    }

    fetchSwapRequests();
  }, [user, org]);

  const handleCancel = async () => {
    if (!cancelingSwap || !org) return;
    setCancelLoading(true);

    const { error: apiError } = await cancelSwapRequest(org.id, cancelingSwap.id);

    if (apiError) {
      setError(apiError.message || 'Failed to cancel request');
    } else {
      setSwapRequests((prev) =>
        prev.map((s) => (s.id === cancelingSwap.id ? { ...s, status: 'canceled' as SwapStatus } : s))
      );
    }

    setCancelLoading(false);
    setCancelingSwap(null);
  };

  // Group requests by status
  const pendingRequests = swapRequests.filter((r) => r.status === 'pending');
  const completedRequests = swapRequests.filter((r) => r.status !== 'pending');

  // Not logged in
  if (!userLoading && !user) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ArrowLeftRight className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="mt-4">Sign In Required</CardTitle>
            <CardDescription>Sign in to view your swap requests.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push(`/login?redirect=/${orgSlug}/time/swaps`)}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading
  if (userLoading || isLoading) {
    return (
      <div className="flex flex-1 flex-col p-4">
        <div className="mx-auto w-full max-w-md">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error && !org) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="mt-4">Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/${orgSlug}/time`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Time Clock
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="mb-2" asChild>
            <Link href={`/${orgSlug}/time`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Time Clock
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">My Swap Requests</h1>
          <p className="text-muted-foreground text-sm">
            View and manage your shift swap requests at {org?.name}
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* No Requests */}
        {swapRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ArrowLeftRight className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Swap Requests</h3>
              <p className="mt-1 text-sm text-muted-foreground text-center">
                You haven&apos;t made any swap requests yet.
              </p>
              <Button className="mt-4" asChild>
                <Link href={`/${orgSlug}/time/schedule`}>
                  View My Schedule
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div>
                <h2 className="text-sm font-medium mb-3 text-primary">
                  Pending ({pendingRequests.length})
                </h2>
                <div className="space-y-3">
                  {pendingRequests.map((swap) => {
                    const TypeIcon = SWAP_TYPE_ICONS[swap.swap_type];
                    const schedule = swap.schedule;

                    return (
                      <Card key={swap.id} className="border-primary/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <TypeIcon className="h-4 w-4 text-primary" />
                                <span className="font-medium">
                                  {SWAP_TYPE_LABELS[swap.swap_type]}
                                </span>
                                <Badge variant={STATUS_COLORS[swap.status]} className="text-xs">
                                  {STATUS_LABELS[swap.status]}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(schedule.date)}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                </div>
                                <Badge
                                  variant="outline"
                                  className="text-xs"
                                  style={{
                                    borderColor: schedule.role.color,
                                    color: schedule.role.color,
                                  }}
                                >
                                  {schedule.role.name}
                                </Badge>
                              </div>
                              {swap.reason && (
                                <p className="mt-2 text-xs text-muted-foreground">
                                  &quot;{swap.reason}&quot;
                                </p>
                              )}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setCancelingSwap(swap)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                            Requested {formatDateTime(swap.created_at)}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past Requests */}
            {completedRequests.length > 0 && (
              <div>
                <h2 className="text-sm font-medium mb-3 text-muted-foreground">
                  Past Requests ({completedRequests.length})
                </h2>
                <div className="space-y-3">
                  {completedRequests.map((swap) => {
                    const TypeIcon = SWAP_TYPE_ICONS[swap.swap_type];
                    const schedule = swap.schedule;

                    return (
                      <Card key={swap.id} className="opacity-75">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <TypeIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium text-muted-foreground">
                                  {SWAP_TYPE_LABELS[swap.swap_type]}
                                </span>
                                <Badge variant={STATUS_COLORS[swap.status]} className="text-xs">
                                  {STATUS_LABELS[swap.status]}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(schedule.date)}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                                </div>
                              </div>
                              {swap.admin_notes && (
                                <p className="mt-2 text-xs text-muted-foreground italic">
                                  Note: {swap.admin_notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                            Requested {formatDateTime(swap.created_at)}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!cancelingSwap} onOpenChange={(open) => !open && setCancelingSwap(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this swap request?
            </DialogDescription>
          </DialogHeader>

          {cancelingSwap && (
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="text-sm space-y-1">
                <div><strong>Type:</strong> {SWAP_TYPE_LABELS[cancelingSwap.swap_type]}</div>
                <div><strong>Shift:</strong> {formatDate(cancelingSwap.schedule.date)}</div>
                <div><strong>Time:</strong> {formatTime(cancelingSwap.schedule.start_time)} - {formatTime(cancelingSwap.schedule.end_time)}</div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelingSwap(null)}>
              Keep Request
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={cancelLoading}>
              {cancelLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cancel Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
