'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, AlertCircle, Calendar } from 'lucide-react';
import {
  getSchedules,
  getAttractions,
  type Schedule,
  type AttractionListItem,
} from '@/lib/api/client';

interface ScheduleWeekViewProps {
  orgId: string;
  orgSlug: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getWeekDates(date: Date): Date[] {
  const week: Date[] = [];
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay()); // Start from Sunday

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    week.push(day);
  }
  return week;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0]!;
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours!, 10);
  const ampm = hour >= 12 ? 'p' : 'a';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes}${ampm}`;
}

function WeekViewSkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="grid grid-cols-7 border-b">
        {DAYS.map((day) => (
          <div key={day} className="p-3 text-center border-r last:border-r-0">
            <Skeleton className="h-4 w-12 mx-auto" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 min-h-[400px]">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="p-2 border-r last:border-r-0 space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScheduleWeekView({ orgId, orgSlug }: ScheduleWeekViewProps) {
  const [attractions, setAttractions] = useState<AttractionListItem[]>([]);
  const [selectedAttraction, setSelectedAttraction] = useState<string>('');
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek]);
  const startDate = formatDateKey(weekDates[0]!);
  const endDate = formatDateKey(weekDates[6]!);

  // Group schedules by date
  const schedulesByDate = useMemo(() => {
    const grouped: Record<string, Schedule[]> = {};
    for (const schedule of schedules) {
      const key = schedule.date;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key]!.push(schedule);
    }
    // Sort each day's schedules by start time
    for (const key of Object.keys(grouped)) {
      grouped[key]!.sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    return grouped;
  }, [schedules]);

  // Load attractions on mount
  useEffect(() => {
    async function fetchAttractions() {
      const { data, error: apiError } = await getAttractions(orgId);
      if (data?.data) {
        setAttractions(data.data);
        if (data.data.length > 0 && !selectedAttraction) {
          setSelectedAttraction(data.data[0]!.id);
        }
      }
      if (apiError) {
        setError(apiError.message || 'Failed to load attractions');
      }
    }
    fetchAttractions();
  }, [orgId, selectedAttraction]);

  // Load schedules when attraction or week changes
  useEffect(() => {
    if (!selectedAttraction) return;

    async function fetchSchedules() {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await getSchedules(orgId, selectedAttraction, {
        startDate,
        endDate,
      });

      if (apiError) {
        setError(apiError.message || 'Failed to load schedules');
      } else if (data) {
        setSchedules(data);
      }

      setLoading(false);
    }

    fetchSchedules();
  }, [orgId, selectedAttraction, startDate, endDate]);

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentWeek(newDate);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  if (attractions.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
        <h3 className="text-lg font-medium">No attractions found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create an attraction first before viewing schedules.
        </p>
        <Button asChild className="mt-4">
          <a href={`/${orgSlug}/attractions/new`}>Create Attraction</a>
        </Button>
      </div>
    );
  }

  const weekLabel = `${weekDates[0]!.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })} - ${weekDates[6]!.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Select value={selectedAttraction} onValueChange={setSelectedAttraction}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select attraction" />
          </SelectTrigger>
          <SelectContent>
            {attractions.map((attraction) => (
              <SelectItem key={attraction.id} value={attraction.id}>
                {attraction.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigateWeek(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[200px] text-center font-medium">{weekLabel}</span>
            <Button variant="ghost" size="icon" onClick={() => navigateWeek(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <WeekViewSkeleton />
      ) : (
        <div className="rounded-lg border bg-card overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-7 border-b bg-muted/50">
            {weekDates.map((date, i) => {
              const isToday = formatDateKey(date) === formatDateKey(new Date());
              return (
                <div
                  key={i}
                  className={`p-3 text-center border-r last:border-r-0 ${
                    isToday ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="text-sm font-medium">{DAYS[i]}</div>
                  <div
                    className={`text-lg ${
                      isToday ? 'font-bold text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Schedule Grid */}
          <div className="grid grid-cols-7 min-h-[400px]">
            {weekDates.map((date, i) => {
              const dateKey = formatDateKey(date);
              const daySchedules = schedulesByDate[dateKey] || [];
              const isToday = dateKey === formatDateKey(new Date());

              return (
                <div
                  key={i}
                  className={`p-2 border-r last:border-r-0 space-y-1 ${
                    isToday ? 'bg-primary/5' : ''
                  }`}
                >
                  {daySchedules.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                      No shifts
                    </div>
                  ) : (
                    daySchedules.map((schedule) => {
                      const staffName = schedule.staff
                        ? `${schedule.staff.org_memberships.profiles.first_name} ${schedule.staff.org_memberships.profiles.last_name?.charAt(0)}.`
                        : 'Unassigned';

                      return (
                        <div
                          key={schedule.id}
                          className="p-2 rounded text-xs bg-background border"
                          style={{
                            borderLeftWidth: '3px',
                            borderLeftColor: schedule.role.color,
                          }}
                        >
                          <div className="font-medium truncate">{staffName}</div>
                          <div className="text-muted-foreground">
                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                          </div>
                          <Badge
                            variant="outline"
                            className="mt-1 text-[10px] px-1 py-0"
                            style={{
                              borderColor: schedule.role.color,
                              color: schedule.role.color,
                            }}
                          >
                            {schedule.role.name}
                          </Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      {!loading && schedules.length > 0 && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-muted-foreground">Roles:</span>
          {Array.from(new Set(schedules.map((s) => JSON.stringify({ name: s.role.name, color: s.role.color }))))
            .map((json) => JSON.parse(json) as { name: string; color: string })
            .map((role) => (
              <Badge
                key={role.name}
                variant="outline"
                style={{ borderColor: role.color, color: role.color }}
              >
                {role.name}
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}
