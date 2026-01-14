'use client';

import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  LogOut,
  Phone,
  RefreshCw,
  Users,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getQueuePosition, leaveQueue, type QueuePosition } from '@/lib/api';

interface QueuePositionTrackerProps {
  initialPosition: QueuePosition;
  confirmationCode: string;
}

const STATUS_CONFIG = {
  waiting: {
    icon: Clock,
    label: 'Waiting',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  notified: {
    icon: Bell,
    label: 'Get Ready!',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  called: {
    icon: Phone,
    label: 'Your Turn!',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  checked_in: {
    icon: CheckCircle2,
    label: 'Checked In',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  expired: {
    icon: XCircle,
    label: 'Expired',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
  left: {
    icon: LogOut,
    label: 'Left Queue',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
  },
  no_show: {
    icon: XCircle,
    label: 'No Show',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
  },
};

export function QueuePositionTracker({
  initialPosition,
  confirmationCode,
}: QueuePositionTrackerProps) {
  const router = useRouter();
  const [position, setPosition] = useState(initialPosition);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    const data = await getQueuePosition(confirmationCode);
    if (data) {
      setPosition(data);
    }
    setLastRefreshed(new Date());
    setIsRefreshing(false);
  }, [confirmationCode]);

  // Auto-refresh every 30 seconds for active statuses
  useEffect(() => {
    const activeStatuses = ['waiting', 'notified', 'called'];
    if (!activeStatuses.includes(position.status)) return;

    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [position.status, refresh]);

  const handleLeaveQueue = async () => {
    if (!confirm('Are you sure you want to leave the queue? You will lose your spot.')) {
      return;
    }

    setIsLeaving(true);
    const result = await leaveQueue(confirmationCode);
    setIsLeaving(false);

    if (result.success) {
      router.push('/queue');
    } else {
      alert(result.error || 'Failed to leave queue');
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(confirmationCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const config = STATUS_CONFIG[position.status] || STATUS_CONFIG.waiting;
  const StatusIcon = config.icon;
  const isActive = ['waiting', 'notified', 'called'].includes(position.status);
  const canLeave = ['waiting', 'notified'].includes(position.status);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Confirmation Code */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
              Confirmation Code
            </p>
            <p className="text-2xl font-mono font-bold tracking-widest">
              {confirmationCode}
            </p>
          </div>
          <button
            onClick={handleCopyCode}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            title="Copy code"
          >
            {copied ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Copy className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div className={`rounded-xl border ${config.borderColor} ${config.bgColor} p-6`}>
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 rounded-full ${config.bgColor} flex items-center justify-center`}>
            <StatusIcon className={`h-7 w-7 ${config.color}`} />
          </div>
          <div>
            <p className={`text-sm font-medium ${config.color}`}>{config.label}</p>
            <p className="text-3xl font-bold">
              {isActive ? `#${position.position}` : '--'}
            </p>
          </div>
        </div>

        {/* Position Details */}
        {isActive && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-background/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Users className="h-4 w-4" />
                <span>People Ahead</span>
              </div>
              <p className="text-xl font-semibold">{position.peopleAhead}</p>
            </div>
            <div className="bg-background/50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Clock className="h-4 w-4" />
                <span>Est. Wait</span>
              </div>
              <p className="text-xl font-semibold">~{position.estimatedWaitMinutes} min</p>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {position.status === 'notified' && (
          <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900 dark:text-amber-100">
                  Your turn is coming up!
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Please make your way to the entrance. Estimated time: {formatTime(position.estimatedTime)}
                </p>
              </div>
            </div>
          </div>
        )}

        {position.status === 'called' && (
          <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  It&apos;s your turn!
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Please proceed to the entrance now. Show this code to staff.
                </p>
              </div>
            </div>
          </div>
        )}

        {!isActive && (
          <div className="text-center text-muted-foreground">
            <p>This queue entry is no longer active.</p>
          </div>
        )}

        {/* Party Info */}
        <div className="text-sm text-muted-foreground">
          <span>Party of {position.partySize}</span>
          <span className="mx-2">&middot;</span>
          <span>Joined {formatTime(position.joinedAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={refresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>

        <p className="text-xs text-muted-foreground">
          Updated {lastRefreshed.toLocaleTimeString()}
        </p>
      </div>

      {/* Leave Queue */}
      {canLeave && (
        <button
          onClick={handleLeaveQueue}
          disabled={isLeaving}
          className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-md border border-destructive/50 text-destructive font-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
        >
          {isLeaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Leaving...
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              Leave Queue
            </>
          )}
        </button>
      )}
    </div>
  );
}
