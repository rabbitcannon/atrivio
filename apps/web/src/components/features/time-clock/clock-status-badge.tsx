'use client';

import { useEffect, useState } from 'react';
import { Clock, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getMyTimeStatus, type TimeClockStatus } from '@/lib/api/client';

interface ClockStatusBadgeProps {
  orgId: string;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  return `${hours}h ${mins}m`;
}

export function ClockStatusBadge({ orgId }: ClockStatusBadgeProps) {
  const [status, setStatus] = useState<TimeClockStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        setIsLoading(true);
        const response = await getMyTimeStatus(orgId);
        if (response.data) {
          setStatus(response.data);
        }
      } catch {
        // Silently fail - badge is non-essential
      } finally {
        setIsLoading(false);
      }
    }
    fetchStatus();

    // Refresh every minute to update duration
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, [orgId]);

  // Don't show anything while loading or if not a staff member
  if (isLoading || !status) {
    return null;
  }

  // Show badge only when clocked in
  if (!status.is_clocked_in || !status.current_entry) {
    return null;
  }

  return (
    <Badge
      variant="secondary"
      className="gap-1 bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-900"
    >
      <CheckCircle2 className="h-3 w-3" />
      <span className="font-mono text-xs">
        {formatDuration(status.current_entry.duration_minutes)}
      </span>
    </Badge>
  );
}
