'use client';

import { AlertCircle, CheckCircle2, Clock, ExternalLink, MapPin, Timer } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getMyTimeStatus, selfClockIn, selfClockOut, type TimeClockStatus } from '@/lib/api/client';

interface TimeClockWidgetProps {
  orgId: string;
  orgSlug: string;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  return `${hours}h ${mins}m`;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function TimeClockWidget({ orgId, orgSlug }: TimeClockWidgetProps) {
  const [status, setStatus] = useState<TimeClockStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClocking, setIsClocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch time status on mount
  useEffect(() => {
    async function fetchStatus() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getMyTimeStatus(orgId);
        if (response.error || !response.data) {
          const errorMessage = response.error?.message ?? 'Failed to load status';
          if (errorMessage.includes('not a staff member') || errorMessage.includes('membership')) {
            // User is not a staff member - just don't show the widget
            setStatus(null);
          } else {
            setError(errorMessage);
          }
          return;
        }
        setStatus(response.data);
      } catch {
        setError('Failed to load time status');
      } finally {
        setIsLoading(false);
      }
    }
    fetchStatus();
  }, [orgId]);

  async function handleClockIn() {
    if (!status) return;
    // Use primary attraction or first available
    const attractionId =
      status.attractions.find((a) => a.is_primary)?.id || status.attractions[0]?.id;
    if (!attractionId) {
      setError('No attractions assigned');
      return;
    }
    try {
      setIsClocking(true);
      setError(null);
      const clockInResponse = await selfClockIn(orgId, attractionId);
      if (clockInResponse.error) {
        setError(clockInResponse.error.message ?? 'Failed to clock in');
        return;
      }
      // Refresh status
      const response = await getMyTimeStatus(orgId);
      if (response.data) {
        setStatus(response.data);
      }
    } catch {
      setError('Failed to clock in');
    } finally {
      setIsClocking(false);
    }
  }

  async function handleClockOut() {
    try {
      setIsClocking(true);
      setError(null);
      const clockOutResponse = await selfClockOut(orgId);
      if (clockOutResponse.error) {
        setError(clockOutResponse.error.message ?? 'Failed to clock out');
        return;
      }
      // Refresh status
      const response = await getMyTimeStatus(orgId);
      if (response.data) {
        setStatus(response.data);
      }
    } catch {
      setError('Failed to clock out');
    } finally {
      setIsClocking(false);
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Time Clock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Not a staff member - don't render
  if (!status) {
    return null;
  }

  // No attractions assigned
  if (status.attractions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Time Clock
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No attractions assigned. Contact your manager.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Time Clock
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${orgSlug}/time`}>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-3 w-3" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* Clocked In State */}
        {status.is_clocked_in && status.current_entry && (
          <>
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    Clocked In
                  </span>
                </div>
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Timer className="h-3 w-3" />
                  <span className="font-mono text-sm">
                    {formatDuration(status.current_entry.duration_minutes)}
                  </span>
                </div>
              </div>
              {status.current_entry.attraction && (
                <div className="mt-1 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                  <MapPin className="h-3 w-3" />
                  <span>{status.current_entry.attraction.name}</span>
                  <span className="text-green-600/70 dark:text-green-400/70">
                    since {formatTime(status.current_entry.clock_in)}
                  </span>
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="w-full"
              onClick={handleClockOut}
              disabled={isClocking}
            >
              {isClocking ? 'Clocking out...' : 'Clock Out'}
            </Button>
          </>
        )}

        {/* Not Clocked In State */}
        {!status.is_clocked_in && (
          <>
            <div className="rounded-lg border bg-muted/50 p-3 text-center">
              <p className="text-sm text-muted-foreground">Not clocked in</p>
            </div>
            <Button size="sm" className="w-full" onClick={handleClockIn} disabled={isClocking}>
              {isClocking ? 'Clocking in...' : 'Clock In'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
