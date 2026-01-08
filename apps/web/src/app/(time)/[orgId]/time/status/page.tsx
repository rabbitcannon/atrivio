'use client';

import { AlertCircle, ArrowLeft, Clock, MapPin, RefreshCw, Timer, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/hooks/use-user';
import { type ActiveStaffEntry, getActiveClockedIn, getOrgBySlug } from '@/lib/api/client';

function getStaffName(entry: ActiveStaffEntry): string {
  if (entry.user) {
    return `${entry.user.first_name} ${entry.user.last_name}`.trim();
  }
  return 'Unknown';
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

export default function TimeStatusPage() {
  const params = useParams<{ orgId: string }>();
  // orgId here can be either a UUID or a slug - we use it as a slug for lookup
  const orgSlug = params.orgId;
  const { user, isLoading: userLoading } = useUser();

  const [org, setOrg] = useState<{
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
  } | null>(null);
  const [activeStaff, setActiveStaff] = useState<ActiveStaffEntry[]>([]);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

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

  // Fetch active staff when user and org are available
  useEffect(() => {
    async function fetchActiveStaff() {
      if (!user || !org) return;
      try {
        setIsLoadingStaff(true);
        setError(null);
        const response = await getActiveClockedIn(org.id);
        if (response.error) {
          const errorMessage = response.error.message ?? 'Failed to load active staff';
          if (
            errorMessage.includes('permission') ||
            errorMessage.includes('403') ||
            errorMessage.includes('Forbidden')
          ) {
            setError('You do not have permission to view this page');
          } else {
            setError(errorMessage);
          }
          return;
        }
        if (response.data) {
          setActiveStaff(response.data.data);
          setLastRefresh(new Date());
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load active staff';
        if (errorMessage.includes('permission') || errorMessage.includes('403')) {
          setError('You do not have permission to view this page');
        } else {
          setError(errorMessage);
        }
      } finally {
        setIsLoadingStaff(false);
      }
    }
    fetchActiveStaff();
  }, [user, org]);

  async function handleRefresh() {
    if (!user || !org) return;
    try {
      setIsRefreshing(true);
      setError(null);
      const response = await getActiveClockedIn(org.id);
      if (response.error) {
        setError(response.error.message ?? 'Failed to refresh');
        return;
      }
      if (response.data) {
        setActiveStaff(response.data.data);
        setLastRefresh(new Date());
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user || !org) return;
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, [user, org, handleRefresh]);

  // Loading org
  if (isLoadingOrg) {
    return (
      <div className="flex flex-1 flex-col p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-64 w-full" />
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

  // Not logged in
  if (!userLoading && !user) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
            <CardTitle className="mt-4">Sign In Required</CardTitle>
            <CardDescription>You need to sign in to view the status page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={`/login?redirect=/${orgSlug}/time/status`}>Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading user or staff
  if (userLoading || isLoadingStaff) {
    return (
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  // Permission error
  if (error?.includes('permission')) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <CardTitle className="mt-4">Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to view this page. Only managers, admins, and owners can
              view the status page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
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

  // Group by attraction
  const byAttraction: Record<string, ActiveStaffEntry[]> = {};
  const unassigned: ActiveStaffEntry[] = [];

  activeStaff.forEach((entry) => {
    if (entry.attraction) {
      const attractionName = entry.attraction.name;
      if (!byAttraction[attractionName]) {
        byAttraction[attractionName] = [];
      }
      byAttraction[attractionName]?.push(entry);
    } else {
      unassigned.push(entry);
    }
  });

  return (
    <div className="flex flex-1 flex-col p-4">
      {/* Header */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href={`/${orgSlug}/time`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{org?.name}</h1>
            <p className="text-sm text-muted-foreground">Staff Status</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Updated {lastRefresh.toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Card */}
      <Card className="mb-4">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-medium">Currently Working</span>
          </div>
          <Badge variant="secondary" className="text-lg">
            {activeStaff.length}
          </Badge>
        </CardContent>
      </Card>

      {/* No one clocked in */}
      {activeStaff.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Clock className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">No one is currently clocked in</p>
          </CardContent>
        </Card>
      )}

      {/* Staff list grouped by attraction */}
      <div className="space-y-4">
        {Object.entries(byAttraction).map(([attractionName, staff]) => (
          <Card key={attractionName}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">{attractionName}</CardTitle>
                <Badge variant="outline" className="ml-auto">
                  {staff.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {staff.map((entry) => (
                  <div
                    key={entry.staff_id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                  >
                    <span className="font-medium">{getStaffName(entry)}</span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Timer className="h-3 w-3" />
                      <span className="font-mono">{formatDuration(entry.duration_minutes)}</span>
                      <span className="text-xs">since {formatTime(entry.clock_in)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Unassigned staff */}
        {unassigned.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">No Attraction Assigned</CardTitle>
                <Badge variant="outline" className="ml-auto">
                  {unassigned.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {unassigned.map((entry) => (
                  <div
                    key={entry.staff_id}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                  >
                    <span className="font-medium">{getStaffName(entry)}</span>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Timer className="h-3 w-3" />
                      <span className="font-mono">{formatDuration(entry.duration_minutes)}</span>
                      <span className="text-xs">since {formatTime(entry.clock_in)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
