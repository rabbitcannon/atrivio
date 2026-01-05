'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Phone,
  Mail,
  MoreHorizontal,
  UserCheck,
  XCircle,
  Bell,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { QueueEntry, QueueEntryStatus } from '@/lib/api/types';

interface QueueEntryRowProps {
  entry: QueueEntry;
  orgId: string;
  attractionId: string;
}

function getStatusBadge(status: QueueEntryStatus) {
  const variants: Record<QueueEntryStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    waiting: { variant: 'secondary', label: 'Waiting' },
    notified: { variant: 'outline', label: 'Notified' },
    called: { variant: 'default', label: 'Called' },
    checked_in: { variant: 'default', label: 'Checked In' },
    expired: { variant: 'destructive', label: 'Expired' },
    left: { variant: 'secondary', label: 'Left' },
    no_show: { variant: 'destructive', label: 'No Show' },
  };

  const config = variants[status] || { variant: 'secondary' as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatWaitTime(joinedAt: string) {
  const joined = new Date(joinedAt);
  const now = new Date();
  const diffMs = now.getTime() - joined.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min`;
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return `${hours}h ${mins}m`;
}

export function QueueEntryRow({ entry, orgId, attractionId }: QueueEntryRowProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (newStatus: QueueEntryStatus, actionLabel: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/queue/${orgId}/${attractionId}/entries/${entry.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${actionLabel.toLowerCase()}`);
      }

      toast({
        title: 'Status updated',
        description: `Guest ${entry.guest_name || entry.confirmation_code} has been ${actionLabel.toLowerCase()}.`,
      });

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNotify = () => updateStatus('notified', 'notified');
  const handleCall = () => updateStatus('called', 'called');
  const handleCheckIn = () => updateStatus('checked_in', 'checked in');
  const handleRemove = () => updateStatus('left', 'removed from queue');
  const handleNoShow = () => updateStatus('no_show', 'marked as no-show');

  const isLoading = isPending || isUpdating;

  return (
    <TableRow className={isLoading ? 'opacity-50' : undefined}>
      <TableCell className="font-mono text-lg font-bold">
        #{entry.position}
      </TableCell>
      <TableCell className="font-mono">
        {entry.confirmation_code}
      </TableCell>
      <TableCell>
        {entry.guest_name || <span className="text-muted-foreground">Anonymous</span>}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          {entry.party_size}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1 text-sm">
          {entry.guest_phone && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Phone className="h-3 w-3" />
              {entry.guest_phone}
            </span>
          )}
          {entry.guest_email && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Mail className="h-3 w-3" />
              {entry.guest_email}
            </span>
          )}
          {!entry.guest_phone && !entry.guest_email && (
            <span className="text-muted-foreground">--</span>
          )}
        </div>
      </TableCell>
      <TableCell>{formatTime(entry.joined_at)}</TableCell>
      <TableCell>
        {entry.status === 'waiting' || entry.status === 'notified' || entry.status === 'called'
          ? formatWaitTime(entry.joined_at)
          : '--'}
      </TableCell>
      <TableCell>{getStatusBadge(entry.status)}</TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreHorizontal className="h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {entry.status === 'waiting' && (
              <DropdownMenuItem onClick={handleNotify}>
                <Bell className="mr-2 h-4 w-4" />
                Notify Guest
              </DropdownMenuItem>
            )}
            {(entry.status === 'waiting' || entry.status === 'notified') && (
              <DropdownMenuItem onClick={handleCall}>
                <UserCheck className="mr-2 h-4 w-4" />
                Call Guest
              </DropdownMenuItem>
            )}
            {entry.status === 'called' && (
              <>
                <DropdownMenuItem onClick={handleCheckIn}>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Mark Checked In
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleNoShow}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Mark No Show
                </DropdownMenuItem>
              </>
            )}
            {(entry.status === 'waiting' || entry.status === 'notified' || entry.status === 'called') && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleRemove} className="text-destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Remove from Queue
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
