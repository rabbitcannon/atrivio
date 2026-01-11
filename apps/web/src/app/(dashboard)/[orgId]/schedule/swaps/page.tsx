'use client';

import {
  AlertCircle,
  ArrowDown,
  ArrowLeftRight,
  Calendar,
  Check,
  Clock,
  Hand,
  X,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import {
  approveSwapRequest,
  getSwapRequests,
  rejectSwapRequest,
  type ShiftSwapRequest,
  type SwapStatus,
} from '@/lib/api/client';

// Material Design ease curve
const EASE = [0.4, 0, 0.2, 1] as const;

const STATUS_COLORS: Record<SwapStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  approved: 'default',
  rejected: 'destructive',
  canceled: 'secondary',
  expired: 'secondary',
};

const SWAP_TYPE_ICONS = {
  swap: ArrowLeftRight,
  drop: ArrowDown,
  pickup: Hand,
};

const SWAP_TYPE_LABELS = {
  swap: 'Swap',
  drop: 'Drop',
  pickup: 'Pickup',
};

function formatDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
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

function getStaffName(staff: ShiftSwapRequest['requesting_staff'] | null): string {
  if (!staff) return 'Unknown';
  const { profiles } = staff.org_memberships;
  return `${profiles.first_name} ${profiles.last_name}`;
}

/**
 * Loading skeleton for swaps page
 */
function SwapsPageLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-40 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-24" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/**
 * Animated page header
 */
function AnimatedPageHeader({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  if (shouldReduceMotion) {
    return (
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Swap Requests</h1>
        <p className="text-muted-foreground">
          Review and manage staff shift swap, drop, and pickup requests.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <h1 className="text-3xl font-bold tracking-tight">Swap Requests</h1>
      <p className="text-muted-foreground">
        Review and manage staff shift swap, drop, and pickup requests.
      </p>
    </motion.div>
  );
}

/**
 * Animated filters
 */
function AnimatedFilters({
  children,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return <div className="flex items-center gap-4">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE, delay: 0.05 }}
      className="flex items-center gap-4"
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated content wrapper
 */
function AnimatedContent({
  children,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated empty state
 */
function AnimatedEmptyState({
  statusFilter,
  shouldReduceMotion,
}: {
  statusFilter: string;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
        <ArrowLeftRight className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No Swap Requests</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {statusFilter === 'pending'
            ? 'No pending requests to review.'
            : 'No swap requests match your filters.'}
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 15,
          delay: 0.1,
        }}
      >
        <ArrowLeftRight className="h-12 w-12 text-muted-foreground" />
      </motion.div>
      <h3 className="mt-4 text-lg font-medium">No Swap Requests</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {statusFilter === 'pending'
          ? 'No pending requests to review.'
          : 'No swap requests match your filters.'}
      </p>
    </motion.div>
  );
}

/**
 * Animated swap row
 */
function AnimatedSwapRow({
  swap,
  index,
  shouldReduceMotion,
  onApprove,
  onReject,
}: {
  swap: ShiftSwapRequest;
  index: number;
  shouldReduceMotion: boolean | null;
  onApprove: (swap: ShiftSwapRequest) => void;
  onReject: (swap: ShiftSwapRequest) => void;
}) {
  const TypeIcon = SWAP_TYPE_ICONS[swap.swap_type];
  const schedule = swap.schedule;

  const content = (
    <>
      <TableCell>
        <div className="flex items-center gap-2">
          <TypeIcon className="h-4 w-4" />
          <span>{SWAP_TYPE_LABELS[swap.swap_type]}</span>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <div className="font-medium">{getStaffName(swap.requesting_staff)}</div>
          <div className="text-sm text-muted-foreground">
            {swap.requesting_staff.org_memberships.profiles.email}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            {formatDate(schedule.date)}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
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
      </TableCell>
      <TableCell>
        <Badge variant={STATUS_COLORS[swap.status]}>{swap.status}</Badge>
      </TableCell>
      <TableCell>
        <div className="text-sm text-muted-foreground">{formatDateTime(swap.created_at)}</div>
        {swap.reason && (
          <div className="text-xs text-muted-foreground mt-1 max-w-[150px] truncate">
            &quot;{swap.reason}&quot;
          </div>
        )}
      </TableCell>
      <TableCell>
        {swap.status === 'pending' && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="text-green-600 hover:text-green-700"
              onClick={() => onApprove(swap)}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive"
              onClick={() => onReject(swap)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </TableCell>
    </>
  );

  if (shouldReduceMotion) {
    return <TableRow>{content}</TableRow>;
  }

  return (
    <motion.tr
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: EASE, delay: index * 0.03 }}
      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
    >
      {content}
    </motion.tr>
  );
}

export default function SwapRequestsPage() {
  const params = useParams<{ orgId: string }>();
  const shouldReduceMotion = useReducedMotion();
  const orgId = params.orgId;

  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Approval/Rejection dialog state
  const [selectedSwap, setSelectedSwap] = useState<ShiftSwapRequest | null>(null);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSwapRequests = useCallback(async () => {
    setLoading(true);
    setError(null);

    const filters: { status?: SwapStatus; swapType?: 'swap' | 'drop' | 'pickup' } = {};
    if (statusFilter !== 'all') {
      filters.status = statusFilter as SwapStatus;
    }
    if (typeFilter !== 'all') {
      filters.swapType = typeFilter as 'swap' | 'drop' | 'pickup';
    }

    const { data, error: apiError } = await getSwapRequests(orgId, filters);

    if (apiError) {
      setError(apiError.message || 'Failed to load swap requests');
    } else if (data) {
      setSwapRequests(data);
    }

    setLoading(false);
  }, [orgId, statusFilter, typeFilter]);

  useEffect(() => {
    fetchSwapRequests();
  }, [fetchSwapRequests]);

  const handleApprove = async () => {
    if (!selectedSwap) return;
    setActionLoading(true);

    const { error: apiError } = await approveSwapRequest(
      orgId,
      selectedSwap.id,
      actionNotes || undefined
    );

    if (apiError) {
      setError(apiError.message || 'Failed to approve request');
    } else {
      // Refresh list
      setSwapRequests((prev) =>
        prev.map((s) => (s.id === selectedSwap.id ? { ...s, status: 'approved' as SwapStatus } : s))
      );
    }

    setActionLoading(false);
    setSelectedSwap(null);
    setDialogAction(null);
    setActionNotes('');
  };

  const handleReject = async () => {
    if (!selectedSwap || !actionNotes) return;
    setActionLoading(true);

    const { error: apiError } = await rejectSwapRequest(orgId, selectedSwap.id, actionNotes);

    if (apiError) {
      setError(apiError.message || 'Failed to reject request');
    } else {
      setSwapRequests((prev) =>
        prev.map((s) => (s.id === selectedSwap.id ? { ...s, status: 'rejected' as SwapStatus } : s))
      );
    }

    setActionLoading(false);
    setSelectedSwap(null);
    setDialogAction(null);
    setActionNotes('');
  };

  if (loading) {
    return <SwapsPageLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader shouldReduceMotion={shouldReduceMotion} />

      {/* Filters */}
      <AnimatedFilters shouldReduceMotion={shouldReduceMotion}>
        <div className="flex items-center gap-2">
          <Label className="text-sm">Status:</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-sm">Type:</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="swap">Swap</SelectItem>
              <SelectItem value="drop">Drop</SelectItem>
              <SelectItem value="pickup">Pickup</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </AnimatedFilters>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {swapRequests.length === 0 ? (
        <AnimatedEmptyState statusFilter={statusFilter} shouldReduceMotion={shouldReduceMotion} />
      ) : (
        <AnimatedContent shouldReduceMotion={shouldReduceMotion}>
          <div className="rounded-lg border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Shift Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {swapRequests.map((swap, index) => (
                  <AnimatedSwapRow
                    key={swap.id}
                    swap={swap}
                    index={index}
                    shouldReduceMotion={shouldReduceMotion}
                    onApprove={(s) => {
                      setSelectedSwap(s);
                      setDialogAction('approve');
                    }}
                    onReject={(s) => {
                      setSelectedSwap(s);
                      setDialogAction('reject');
                    }}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </AnimatedContent>
      )}

      {/* Approve/Reject Dialog */}
      <Dialog
        open={!!dialogAction}
        onOpenChange={(open) => {
          if (!open) {
            setDialogAction(null);
            setSelectedSwap(null);
            setActionNotes('');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === 'approve' ? 'Approve Request' : 'Reject Request'}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === 'approve'
                ? 'This will execute the shift change. Add optional notes below.'
                : 'Please provide a reason for rejecting this request.'}
            </DialogDescription>
          </DialogHeader>

          {selectedSwap && (
            <div className="rounded-lg border p-4 bg-muted/50">
              <div className="text-sm space-y-1">
                <div>
                  <strong>Type:</strong> {SWAP_TYPE_LABELS[selectedSwap.swap_type]}
                </div>
                <div>
                  <strong>Staff:</strong> {getStaffName(selectedSwap.requesting_staff)}
                </div>
                <div>
                  <strong>Shift:</strong> {formatDate(selectedSwap.schedule.date)} at{' '}
                  {formatTime(selectedSwap.schedule.start_time)}
                </div>
                {selectedSwap.reason && (
                  <div>
                    <strong>Reason:</strong> {selectedSwap.reason}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">
              {dialogAction === 'approve' ? 'Notes (Optional)' : 'Rejection Reason (Required)'}
            </Label>
            <Textarea
              id="notes"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder={
                dialogAction === 'approve'
                  ? 'Add any notes about this approval...'
                  : 'Explain why this request is being rejected...'
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogAction(null);
                setSelectedSwap(null);
                setActionNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant={dialogAction === 'approve' ? 'default' : 'destructive'}
              onClick={dialogAction === 'approve' ? handleApprove : handleReject}
              disabled={actionLoading || (dialogAction === 'reject' && !actionNotes)}
            >
              {actionLoading ? 'Processing...' : dialogAction === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
