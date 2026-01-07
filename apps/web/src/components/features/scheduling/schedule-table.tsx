'use client';

import { AlertCircle, Calendar, Clock, Edit, MoreHorizontal, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  type AttractionListItem,
  deleteSchedule,
  getAttractions,
  getSchedules,
  type Schedule,
  type ScheduleStatus,
} from '@/lib/api/client';
import { ShiftFormDialog } from './shift-form-dialog';

interface ScheduleTableProps {
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

function ScheduleTableSkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Staff</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-8 w-8" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

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

export function ScheduleTable({ orgId, orgSlug }: ScheduleTableProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attractions, setAttractions] = useState<AttractionListItem[]>([]);
  const [selectedAttraction, setSelectedAttraction] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Load attractions on mount
  useEffect(() => {
    async function fetchAttractions() {
      const { data, error: apiError } = await getAttractions(orgId);
      if (data?.data) {
        setAttractions(data.data);
        if (data.data.length > 0 && !selectedAttraction) {
          setSelectedAttraction(data.data[0]?.id);
        }
      }
      if (apiError) {
        setError(apiError.message || 'Failed to load attractions');
      }
    }
    fetchAttractions();
  }, [orgId, selectedAttraction]);

  // Load schedules when attraction changes
  useEffect(() => {
    if (!selectedAttraction) return;

    async function fetchSchedules() {
      setLoading(true);
      setError(null);

      const { data, error: apiError } = await getSchedules(orgId, selectedAttraction);

      if (apiError) {
        setError(apiError.message || 'Failed to load schedules');
      } else if (data) {
        setSchedules(data);
      }

      setLoading(false);
    }

    fetchSchedules();
  }, [orgId, selectedAttraction]);

  const handleDelete = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this shift?')) return;

    const { error: deleteError } = await deleteSchedule(orgId, scheduleId);
    if (deleteError) {
      setError(deleteError.message || 'Failed to delete shift');
    } else {
      setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    }
  };

  const handleSaved = () => {
    // Refresh the list
    if (selectedAttraction) {
      getSchedules(orgId, selectedAttraction).then(({ data }) => {
        if (data) setSchedules(data);
      });
    }
    setShowCreateDialog(false);
    setEditingSchedule(null);
  };

  if (attractions.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
        <h3 className="text-lg font-medium">No attractions found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Create an attraction first before managing schedules.
        </p>
        <Button asChild className="mt-4">
          <a href={`/${orgSlug}/attractions/new`}>Create Attraction</a>
        </Button>
      </div>
    );
  }

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

        <Button onClick={() => setShowCreateDialog(true)}>
          <Calendar className="mr-2 h-4 w-4" />
          Add Shift
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <ScheduleTableSkeleton />
      ) : schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No shifts scheduled</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create shifts manually or generate them from templates.
          </p>
          <Button onClick={() => setShowCreateDialog(true)} className="mt-4">
            <Calendar className="mr-2 h-4 w-4" />
            Add Shift
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => {
                const staffName = schedule.staff
                  ? `${schedule.staff.org_memberships.profiles.first_name} ${schedule.staff.org_memberships.profiles.last_name}`
                  : 'Unassigned';

                return (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(schedule.date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className={!schedule.staff ? 'text-muted-foreground italic' : ''}>
                          {staffName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        style={{
                          borderColor: schedule.role.color,
                          color: schedule.role.color,
                        }}
                      >
                        {schedule.role.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_COLORS[schedule.status]}>
                        {schedule.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingSchedule(schedule)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Shift
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(schedule.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Shift
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <ShiftFormDialog
        orgId={orgId}
        attractionId={selectedAttraction}
        schedule={editingSchedule}
        open={showCreateDialog || !!editingSchedule}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingSchedule(null);
          }
        }}
        onSaved={handleSaved}
      />
    </div>
  );
}
