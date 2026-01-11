'use client';

import { AlertCircle, Calendar, Clock, ExternalLink, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getMySchedules, type Schedule, type ScheduleStatus } from '@/lib/api/client';
import {
  AnimatedEmptyState,
  AnimatedListItem,
  LoadingTransition,
} from './animated-dashboard';

interface MyScheduleWidgetProps {
  orgId: string;
  orgSlug: string;
}

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

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

function isFuture(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0]!;
  return dateStr >= today;
}

export function MyScheduleWidget({ orgId, orgSlug }: MyScheduleWidgetProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSchedules() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getMySchedules(orgId);
        if (response.error) {
          setError(response.error.message || 'Failed to load schedule');
          return;
        }
        // Filter to upcoming and sort by date/time, limit to 3
        const upcomingSchedules = (response.data || [])
          .filter((s) => isFuture(s.date))
          .sort((a, b) => {
            const dateCompare = a.date.localeCompare(b.date);
            if (dateCompare !== 0) return dateCompare;
            return a.start_time.localeCompare(b.start_time);
          })
          .slice(0, 3);
        setSchedules(upcomingSchedules);
      } catch {
        setError('Failed to load schedule');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSchedules();
  }, [orgId]);

  const skeletonContent = (
    <div className="space-y-2">
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  );

  const mainContent = (
    <div className="space-y-3">
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-3 w-3" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {!error && schedules.length === 0 && (
        <AnimatedEmptyState
          icon={<Calendar className="h-8 w-8" />}
          title="No upcoming shifts"
          description="Check back later for your schedule"
          className="py-4"
        />
      )}

      {schedules.map((schedule, index) => (
        <AnimatedListItem key={schedule.id} index={index} staggerDelay={0.08}>
          <div
            className={`rounded-lg border p-3 transition-colors ${isToday(schedule.date) ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  {isToday(schedule.date) ? (
                    <span className="font-medium text-primary">Today</span>
                  ) : (
                    <span>{formatDate(schedule.date)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium">
                    {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{schedule.attraction.name}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
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
                <Badge variant={STATUS_COLORS[schedule.status]} className="text-xs">
                  {schedule.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
        </AnimatedListItem>
      ))}

      {schedules.length > 0 && (
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={`/${orgSlug}/time/schedule`}>View All Shifts</Link>
        </Button>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            My Schedule
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${orgSlug}/time/schedule`}>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <LoadingTransition isLoading={isLoading} skeleton={skeletonContent}>
          {mainContent}
        </LoadingTransition>
      </CardContent>
    </Card>
  );
}
