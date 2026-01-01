'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertCircle,
  Clock,
  LogIn,
  LogOut,
  MoreHorizontal,
  CheckCircle,
  Pencil,
} from 'lucide-react';
import {
  getTimeEntries,
  getAttractions,
  clockIn,
  clockOut,
  approveTimeEntry,
  type TimeEntry,
} from '@/lib/api/client';
import type { AttractionListItem } from '@/lib/api/types';

interface TimeManagerProps {
  orgId: string;
  staffId: string;
  timeSummary?: {
    current_week_hours: number;
    current_month_hours: number;
    season_total_hours: number;
  } | undefined;
  /** Whether the current user can approve time entries (requires manager role) */
  canApprove?: boolean;
}

function TimeManagerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

function formatTime(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
}

export function TimeManager({ orgId, staffId, timeSummary, canApprove = false }: TimeManagerProps) {
  const router = useRouter();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [summary, setSummary] = useState<{
    total_hours: number;
    total_entries: number;
    pending_approval: number;
  } | null>(null);
  const [attractions, setAttractions] = useState<AttractionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active clock-in state
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);

  // Clock in dialog state
  const [clockInDialogOpen, setClockInDialogOpen] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState('');
  const [clockInLoading, setClockInLoading] = useState(false);
  const [clockInError, setClockInError] = useState<string | null>(null);

  // Clock out dialog state
  const [clockOutDialogOpen, setClockOutDialogOpen] = useState(false);
  const [breakMinutes, setBreakMinutes] = useState('0');
  const [clockOutNotes, setClockOutNotes] = useState('');
  const [clockOutLoading, setClockOutLoading] = useState(false);
  const [clockOutError, setClockOutError] = useState<string | null>(null);

  // Approve loading state
  const [approvingId, setApprovingId] = useState<string | null>(null);

  async function fetchData() {
    setLoading(true);
    setError(null);

    const [entriesResult, attractionsResult] = await Promise.all([
      getTimeEntries(orgId, staffId),
      getAttractions(orgId),
    ]);

    if (entriesResult.error) {
      setError(entriesResult.error.message || 'Failed to load time entries');
      setLoading(false);
      return;
    }

    if (entriesResult.data) {
      setEntries(entriesResult.data.entries);
      setSummary(entriesResult.data.summary);

      // Check for active clock-in (entry without clock_out)
      const active = entriesResult.data.entries.find((e) => !e.clock_out);
      setActiveEntry(active || null);
    }

    if (attractionsResult.data) {
      setAttractions(attractionsResult.data.data);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [orgId, staffId]);

  function openClockInDialog() {
    setSelectedAttraction('');
    setClockInError(null);
    setClockInDialogOpen(true);
  }

  async function handleClockIn() {
    if (!selectedAttraction) {
      setClockInError('Please select an attraction');
      return;
    }

    setClockInLoading(true);
    setClockInError(null);

    const { data, error: apiError } = await clockIn(orgId, staffId, selectedAttraction);

    if (apiError) {
      setClockInError(apiError.message || 'Failed to clock in');
      setClockInLoading(false);
      return;
    }

    if (data) {
      // Refresh data
      await fetchData();
    }

    setClockInLoading(false);
    setClockInDialogOpen(false);
    router.refresh();
  }

  function openClockOutDialog() {
    setBreakMinutes('0');
    setClockOutNotes('');
    setClockOutError(null);
    setClockOutDialogOpen(true);
  }

  async function handleClockOut() {
    setClockOutLoading(true);
    setClockOutError(null);

    const breakMins = parseInt(breakMinutes, 10) || 0;
    const data: { break_minutes?: number; notes?: string } = {};
    if (breakMins > 0) data.break_minutes = breakMins;
    if (clockOutNotes.trim()) data.notes = clockOutNotes.trim();

    const { error: apiError } = await clockOut(orgId, staffId, Object.keys(data).length > 0 ? data : undefined);

    if (apiError) {
      setClockOutError(apiError.message || 'Failed to clock out');
      setClockOutLoading(false);
      return;
    }

    // Refresh data
    await fetchData();

    setClockOutLoading(false);
    setClockOutDialogOpen(false);
    router.refresh();
  }

  async function handleApprove(entry: TimeEntry) {
    setApprovingId(entry.id);

    const { data, error: apiError } = await approveTimeEntry(orgId, entry.id);

    if (apiError) {
      console.error('Failed to approve:', apiError.message);
    } else if (data) {
      setEntries((prev) =>
        prev.map((e) => (e.id === entry.id ? { ...e, status: 'approved' as const } : e))
      );
    }

    setApprovingId(null);
    router.refresh();
  }

  if (loading) {
    return <TimeManagerSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading time entries</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeSummary?.current_week_hours ?? summary?.total_hours ?? 0} hours
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeSummary?.current_month_hours ?? 0} hours
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Season</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeSummary?.season_total_hours ?? 0} hours
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clock In/Out Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Clock Status
          </CardTitle>
          <CardDescription>
            {activeEntry
              ? `Clocked in since ${formatTime(activeEntry.clock_in)} at ${activeEntry.attraction?.name || 'Unknown'}`
              : 'Not currently clocked in'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeEntry ? (
            <Button onClick={openClockOutDialog} variant="destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Clock Out
            </Button>
          ) : (
            <Button onClick={openClockInDialog}>
              <LogIn className="mr-2 h-4 w-4" />
              Clock In
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
          <CardDescription>
            {summary?.pending_approval
              ? `${summary.pending_approval} entries pending approval`
              : 'All entries approved'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No time entries yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Attraction</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Break</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
                  const isApproving = approvingId === entry.id;

                  return (
                    <TableRow key={entry.id}>
                      <TableCell>{formatDate(entry.clock_in)}</TableCell>
                      <TableCell>{entry.attraction?.name || '-'}</TableCell>
                      <TableCell>{formatTime(entry.clock_in)}</TableCell>
                      <TableCell>{formatTime(entry.clock_out)}</TableCell>
                      <TableCell>
                        {entry.break_minutes ? `${entry.break_minutes} min` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {entry.total_hours?.toFixed(1) || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={entry.status === 'approved' ? 'default' : 'secondary'}
                        >
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {canApprove && entry.clock_out && entry.status === 'pending' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled={isApproving}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleApprove(entry)}
                                disabled={isApproving}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Approve
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Clock In Dialog */}
      <Dialog open={clockInDialogOpen} onOpenChange={setClockInDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clock In</DialogTitle>
            <DialogDescription>
              Select the attraction you&apos;re working at today.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {clockInError && (
              <div
                className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {clockInError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="attraction">Attraction</Label>
              <Select
                value={selectedAttraction}
                onValueChange={setSelectedAttraction}
                disabled={clockInLoading}
              >
                <SelectTrigger>
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
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClockInDialogOpen(false)}
              disabled={clockInLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleClockIn}
              disabled={clockInLoading || !selectedAttraction}
            >
              {clockInLoading ? 'Clocking In...' : 'Clock In'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clock Out Dialog */}
      <Dialog open={clockOutDialogOpen} onOpenChange={setClockOutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clock Out</DialogTitle>
            <DialogDescription>
              Enter any break time and optional notes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {clockOutError && (
              <div
                className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {clockOutError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="break-minutes">Break Time (minutes)</Label>
              <Input
                id="break-minutes"
                type="number"
                min="0"
                value={breakMinutes}
                onChange={(e) => setBreakMinutes(e.target.value)}
                disabled={clockOutLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={clockOutNotes}
                onChange={(e) => setClockOutNotes(e.target.value)}
                placeholder="e.g., Extended shift for event"
                disabled={clockOutLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setClockOutDialogOpen(false)}
              disabled={clockOutLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleClockOut} disabled={clockOutLoading}>
              {clockOutLoading ? 'Clocking Out...' : 'Clock Out'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
