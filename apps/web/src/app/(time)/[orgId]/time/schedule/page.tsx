'use client';

import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowLeftRight,
  Calendar,
  Clock,
  Loader2,
  MapPin,
  MoreVertical,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useUser } from '@/hooks/use-user';
import {
  createSwapRequest,
  getMySchedules,
  getOrgBySlug,
  type Schedule,
  type ScheduleStatus,
} from '@/lib/api/client';

const STATUS_COLORS: Record<ScheduleStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  scheduled: 'outline',
  published: 'default',
  confirmed: 'default',
  checked_in: 'default',
  completed: 'secondary',
  no_show: 'destructive',
  canceled: 'destructive',
};

// Statuses that allow swap requests
const SWAPPABLE_STATUSES: ScheduleStatus[] = ['published', 'confirmed', 'scheduled'];

function formatDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
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

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

function isFuture(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0]!;
  return dateStr >= today;
}

export default function MySchedulePage() {
  const params = useParams<{ orgId: string }>();
  const orgSlug = params.orgId;
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  const [org, setOrg] = useState<{ id: string; name: string } | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Swap request dialog state
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [swapType, setSwapType] = useState<'swap' | 'drop'>('swap');
  const [swapReason, setSwapReason] = useState('');
  const [swapLoading, setSwapLoading] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);

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

  // Fetch schedules
  useEffect(() => {
    async function fetchSchedules() {
      if (!user || !org) return;

      setIsLoading(true);
      setError(null);

      const response = await getMySchedules(org.id);
      if (response.error) {
        setError(response.error.message || 'Failed to load schedules');
        setIsLoading(false);
        return;
      }

      // Sort by date and filter to upcoming only
      const upcomingSchedules = (response.data || [])
        .filter((s) => isFuture(s.date))
        .sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return a.start_time.localeCompare(b.start_time);
        });

      setSchedules(upcomingSchedules);
      setIsLoading(false);
    }

    fetchSchedules();
  }, [user, org]);

  const openSwapDialog = (schedule: Schedule, type: 'swap' | 'drop') => {
    setSelectedSchedule(schedule);
    setSwapType(type);
    setSwapReason('');
    setSwapSuccess(false);
  };

  const closeSwapDialog = () => {
    setSelectedSchedule(null);
    setSwapReason('');
    setSwapSuccess(false);
  };

  const handleSubmitSwapRequest = async () => {
    if (!selectedSchedule || !org) return;

    setSwapLoading(true);
    setError(null);

    const { error: apiError } = await createSwapRequest(org.id, selectedSchedule.id, {
      swapType,
      ...(swapReason ? { reason: swapReason } : {}),
    });

    setSwapLoading(false);

    if (apiError) {
      setError(apiError.message || 'Failed to submit request');
      return;
    }

    setSwapSuccess(true);
  };

  const canRequestSwap = (schedule: Schedule): boolean => {
    return SWAPPABLE_STATUSES.includes(schedule.status);
  };

  // Not logged in
  if (!userLoading && !user) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="mt-4">Sign In Required</CardTitle>
            <CardDescription>Sign in to view your schedule.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push(`/login?redirect=/${orgSlug}/time/schedule`)}
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
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error (only show if no org loaded)
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

  // Group schedules by date
  const schedulesByDate: Record<string, Schedule[]> = {};
  for (const schedule of schedules) {
    if (!schedulesByDate[schedule.date]) {
      schedulesByDate[schedule.date] = [];
    }
    schedulesByDate[schedule.date]?.push(schedule);
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
          <h1 className="text-2xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground text-sm">Upcoming shifts at {org?.name}</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Schedule List */}
        {schedules.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No Upcoming Shifts</h3>
              <p className="mt-1 text-sm text-muted-foreground text-center">
                You don&apos;t have any scheduled shifts coming up.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(schedulesByDate).map(([date, daySchedules]) => (
              <div key={date}>
                <h2
                  className={`text-sm font-medium mb-2 ${isToday(date) ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {isToday(date) ? 'Today' : formatDate(date)}
                </h2>
                <div className="space-y-2">
                  {daySchedules.map((schedule) => (
                    <Card
                      key={schedule.id}
                      className={isToday(schedule.date) ? 'border-primary' : ''}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="font-medium">
                                {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{schedule.attraction.name}</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="flex flex-col items-end gap-1">
                              <Badge
                                variant="outline"
                                style={{
                                  borderColor: schedule.role.color,
                                  color: schedule.role.color,
                                }}
                              >
                                {schedule.role.name}
                              </Badge>
                              <Badge variant={STATUS_COLORS[schedule.status]} className="text-xs">
                                {schedule.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            {canRequestSwap(schedule) && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">Shift options</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => openSwapDialog(schedule, 'swap')}
                                  >
                                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                                    Request Swap
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openSwapDialog(schedule, 'drop')}
                                  >
                                    <ArrowDown className="mr-2 h-4 w-4" />
                                    Drop Shift
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                        {schedule.notes && (
                          <p className="mt-2 text-xs text-muted-foreground border-t pt-2">
                            {schedule.notes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {schedules.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total upcoming shifts</span>
                <span className="font-medium">{schedules.length}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Swap Request Dialog */}
      <Dialog open={!!selectedSchedule} onOpenChange={(open) => !open && closeSwapDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {swapType === 'swap' ? 'Request Shift Swap' : 'Request to Drop Shift'}
            </DialogTitle>
            <DialogDescription>
              {swapType === 'swap'
                ? 'Submit a request to swap this shift with another staff member.'
                : 'Submit a request to drop this shift. A manager will review your request.'}
            </DialogDescription>
          </DialogHeader>

          {swapSuccess ? (
            <div className="py-6 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                <ArrowLeftRight className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Request Submitted</h3>
              <p className="text-sm text-muted-foreground">
                Your {swapType === 'swap' ? 'swap' : 'drop'} request has been submitted. You&apos;ll
                be notified when a manager reviews it.
              </p>
              <Button className="mt-4" onClick={closeSwapDialog}>
                Done
              </Button>
            </div>
          ) : (
            <>
              {selectedSchedule && (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>Date:</strong> {formatDate(selectedSchedule.date)}
                    </div>
                    <div>
                      <strong>Time:</strong> {formatTime(selectedSchedule.start_time)} -{' '}
                      {formatTime(selectedSchedule.end_time)}
                    </div>
                    <div>
                      <strong>Location:</strong> {selectedSchedule.attraction.name}
                    </div>
                    <div>
                      <strong>Role:</strong> {selectedSchedule.role.name}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason (Optional)</Label>
                <Textarea
                  id="reason"
                  value={swapReason}
                  onChange={(e) => setSwapReason(e.target.value)}
                  placeholder={
                    swapType === 'swap'
                      ? 'Why do you need to swap this shift?'
                      : 'Why do you need to drop this shift?'
                  }
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={closeSwapDialog}>
                  Cancel
                </Button>
                <Button onClick={handleSubmitSwapRequest} disabled={swapLoading}>
                  {swapLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
