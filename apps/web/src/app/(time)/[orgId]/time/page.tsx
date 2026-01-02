'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Clock, MapPin, CheckCircle2, Timer, AlertCircle, LogIn } from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  getOrgBySlug,
  getMyTimeStatus,
  selfClockIn,
  selfClockOut,
  type TimeClockStatus,
} from '@/lib/api/client';

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

export default function QuickTimePage() {
  const params = useParams<{ orgId: string }>();
  // orgId here can be either a UUID or a slug - we use it as a slug for lookup
  const orgSlug = params.orgId;
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  const [org, setOrg] = useState<{ id: string; name: string; slug: string; logo_url: string | null } | null>(null);
  const [status, setStatus] = useState<TimeClockStatus | null>(null);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isClocking, setIsClocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttraction, setSelectedAttraction] = useState<string | null>(null);

  // Fetch org by slug
  useEffect(() => {
    async function fetchOrg() {
      try {
        setIsLoadingOrg(true);
        setError(null);
        const response = await getOrgBySlug(orgSlug);
        if (response.error || !response.data) {
          setError('Organization not found');
          return;
        }
        setOrg(response.data);
      } catch {
        setError('Organization not found');
      } finally {
        setIsLoadingOrg(false);
      }
    }
    fetchOrg();
  }, [orgSlug]);

  // Fetch time status when user and org are available
  useEffect(() => {
    async function fetchStatus() {
      if (!user || !org) return;
      try {
        setIsLoadingStatus(true);
        setError(null);
        const response = await getMyTimeStatus(org.id);
        if (response.error || !response.data) {
          const errorMessage = response.error?.message ?? 'Failed to load time status';
          // Check if it's a "not a staff member" error
          if (errorMessage.includes('not a staff member') || errorMessage.includes('membership')) {
            setError('You are not a staff member of this organization');
          } else {
            setError(errorMessage);
          }
          return;
        }
        const statusData = response.data;
        setStatus(statusData);
        // Auto-select primary attraction if only one
        const firstAttraction = statusData.attractions[0];
        if (statusData.attractions.length === 1 && firstAttraction) {
          setSelectedAttraction(firstAttraction.id);
        } else {
          const primary = statusData.attractions.find((a) => a.is_primary);
          if (primary) {
            setSelectedAttraction(primary.id);
          }
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load time status';
        // Check if it's a "not a staff member" error
        if (errorMessage.includes('not a staff member') || errorMessage.includes('membership')) {
          setError('You are not a staff member of this organization');
        } else {
          setError(errorMessage);
        }
      } finally {
        setIsLoadingStatus(false);
      }
    }
    fetchStatus();
  }, [user, org]);

  async function handleClockIn() {
    if (!org || !selectedAttraction) return;
    try {
      setIsClocking(true);
      setError(null);
      const clockInResponse = await selfClockIn(org.id, selectedAttraction);
      if (clockInResponse.error) {
        setError(clockInResponse.error.message ?? 'Failed to clock in');
        return;
      }
      // Refresh status
      const response = await getMyTimeStatus(org.id);
      if (response.data) {
        setStatus(response.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to clock in');
    } finally {
      setIsClocking(false);
    }
  }

  async function handleClockOut() {
    if (!org) return;
    try {
      setIsClocking(true);
      setError(null);
      const clockOutResponse = await selfClockOut(org.id);
      if (clockOutResponse.error) {
        setError(clockOutResponse.error.message ?? 'Failed to clock out');
        return;
      }
      // Refresh status
      const response = await getMyTimeStatus(org.id);
      if (response.data) {
        setStatus(response.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to clock out');
    } finally {
      setIsClocking(false);
    }
  }

  // Loading org
  if (isLoadingOrg) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Skeleton className="mx-auto h-8 w-48" />
            <Skeleton className="mx-auto mt-2 h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Org not found
  if (error && !org) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="mt-4">Organization Not Found</CardTitle>
            <CardDescription>
              The organization &ldquo;{orgSlug}&rdquo; does not exist or is not active.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Not logged in - show login prompt
  if (!userLoading && !user) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">{org?.name}</CardTitle>
            <CardDescription>Time Clock</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Sign in to clock in or out
            </p>
            <Button
              className="w-full"
              size="lg"
              onClick={() => router.push(`/login?redirect=/${orgSlug}/time`)}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading user or status
  if (userLoading || isLoadingStatus) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{org?.name}</CardTitle>
            <CardDescription>Time Clock</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get user's first name for greeting
  const firstName = (user?.user_metadata?.['first_name'] as string) ||
                   (user?.user_metadata?.['full_name'] as string)?.split(' ')[0] ||
                   'there';

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Clock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">{org?.name}</CardTitle>
          <CardDescription>Hey, {firstName}!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Clocked In State */}
          {status?.is_clocked_in && status.current_entry && (
            <>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-medium text-green-700 dark:text-green-300">Clocked In</span>
                  </div>
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Timer className="h-4 w-4" />
                    <span className="font-mono text-lg">
                      {formatDuration(status.current_entry.duration_minutes)}
                    </span>
                  </div>
                </div>
                {status.current_entry.attraction && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                    <MapPin className="h-3 w-3" />
                    <span>{status.current_entry.attraction.name}</span>
                  </div>
                )}
                <div className="mt-1 text-xs text-green-600/70 dark:text-green-400/70">
                  Since {formatTime(status.current_entry.clock_in)}
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                variant="destructive"
                onClick={handleClockOut}
                disabled={isClocking}
              >
                {isClocking ? 'Clocking out...' : 'Clock Out'}
              </Button>
            </>
          )}

          {/* Not Clocked In State */}
          {status && !status.is_clocked_in && (
            <>
              <div className="rounded-lg border bg-muted/50 p-4 text-center">
                <p className="text-muted-foreground">You are not clocked in</p>
              </div>

              {/* Attraction Selection */}
              {status.attractions.length > 0 ? (
                <>
                  {status.attractions.length > 1 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Where are you working?</p>
                      <div className="grid gap-2">
                        {status.attractions.map((attraction) => (
                          <button
                            key={attraction.id}
                            type="button"
                            onClick={() => setSelectedAttraction(attraction.id)}
                            className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                              selectedAttraction === attraction.id
                                ? 'border-primary bg-primary/5'
                                : 'hover:bg-muted'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{attraction.name}</span>
                            </div>
                            {attraction.is_primary && (
                              <span className="text-xs text-muted-foreground">Primary</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleClockIn}
                    disabled={isClocking || !selectedAttraction}
                  >
                    {isClocking ? 'Clocking in...' : 'Clock In'}
                  </Button>
                </>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You are not assigned to any attractions. Contact your manager.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
