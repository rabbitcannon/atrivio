'use client';

import { Calendar, Clock, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { apiClientDirect as apiClient, resolveOrgId } from '@/lib/api/client';

// Material Design ease curve
const EASE = [0.4, 0, 0.2, 1] as const;

/**
 * Loading skeleton for time slots page
 */
function TimeSlotsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-36 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-28 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Animated page header with action buttons
 */
function AnimatedPageHeader({
  children,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return <div className="flex items-center justify-between">{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex items-center justify-between"
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated table card
 */
function AnimatedTableCard({
  children,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return <Card>{children}</Card>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
    >
      <Card>{children}</Card>
    </motion.div>
  );
}

/**
 * Animated empty state
 */
function AnimatedEmptyState({
  shouldReduceMotion,
  onCreateClick,
  onBulkClick,
}: {
  shouldReduceMotion: boolean | null;
  onCreateClick: () => void;
  onBulkClick: () => void;
}) {
  if (shouldReduceMotion) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No time slots for this date.</p>
        <div className="flex gap-2 justify-center mt-4">
          <Button variant="outline" onClick={onBulkClick}>
            Bulk Create Slots
          </Button>
          <Button onClick={onCreateClick}>Create Single Slot</Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
          },
        },
      }}
      className="text-center py-12 text-muted-foreground"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.5, y: 10 },
          visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 15,
            },
          },
        }}
      >
        <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
      </motion.div>
      <motion.p
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
        }}
      >
        No time slots for this date.
      </motion.p>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
        }}
        className="flex gap-2 justify-center mt-4"
      >
        <Button variant="outline" onClick={onBulkClick}>
          Bulk Create Slots
        </Button>
        <Button onClick={onCreateClick}>Create Single Slot</Button>
      </motion.div>
    </motion.div>
  );
}

/**
 * Table row content component
 */
function TimeSlotRow({
  slot,
  formatTime,
  formatPrice,
  handleToggleActive,
  handleDelete,
}: {
  slot: TimeSlot;
  formatTime: (time: string) => string;
  formatPrice: (cents: number) => string;
  handleToggleActive: (slot: TimeSlot) => void;
  handleDelete: (slot: TimeSlot) => void;
}) {
  return (
    <>
      <TableCell className="font-medium">
        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
      </TableCell>
      <TableCell>{slot.attraction?.name || '—'}</TableCell>
      <TableCell>
        {slot.label || <span className="text-muted-foreground">—</span>}
      </TableCell>
      <TableCell className="text-right">
        {slot.capacity ? (
          <span
            className={slot.booked_count >= slot.capacity ? 'text-destructive' : ''}
          >
            {slot.booked_count} / {slot.capacity}
          </span>
        ) : (
          <span className="text-muted-foreground">Unlimited</span>
        )}
      </TableCell>
      <TableCell className="text-right">
        {slot.price_modifier !== 0 ? (
          <span
            className={slot.price_modifier > 0 ? 'text-green-600' : 'text-red-600'}
          >
            {formatPrice(slot.price_modifier)}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>
        <Badge variant={slot.is_active ? 'default' : 'secondary'}>
          {slot.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleToggleActive(slot)}>
              {slot.is_active ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(slot)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </>
  );
}

/**
 * Animated table row
 */
function AnimatedTimeSlotRow({
  slot,
  index,
  formatTime,
  formatPrice,
  handleToggleActive,
  handleDelete,
  shouldReduceMotion,
}: {
  slot: TimeSlot;
  index: number;
  formatTime: (time: string) => string;
  formatPrice: (cents: number) => string;
  handleToggleActive: (slot: TimeSlot) => void;
  handleDelete: (slot: TimeSlot) => void;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return (
      <TableRow>
        <TimeSlotRow
          slot={slot}
          formatTime={formatTime}
          formatPrice={formatPrice}
          handleToggleActive={handleToggleActive}
          handleDelete={handleDelete}
        />
      </TableRow>
    );
  }

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        ease: EASE,
        delay: index * 0.03,
      }}
      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
    >
      <TimeSlotRow
        slot={slot}
        formatTime={formatTime}
        formatPrice={formatPrice}
        handleToggleActive={handleToggleActive}
        handleDelete={handleDelete}
      />
    </motion.tr>
  );
}

interface TimeSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number | null;
  booked_count: number;
  price_modifier: number;
  label: string | null;
  is_active: boolean;
  attraction: { id: string; name: string } | null;
}

interface Attraction {
  id: string;
  name: string;
}

export function TimeSlotsContent() {
  const params = useParams();
  const orgIdentifier = params['orgId'] as string;
  const { toast } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [resolvedOrgId, setResolvedOrgId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0] ?? '');

  // Single slot form
  const [formData, setFormData] = useState({
    attractionId: '',
    date: '',
    startTime: '',
    endTime: '',
    capacity: '',
    priceModifier: '',
    label: '',
  });

  // Bulk create form
  const [bulkFormData, setBulkFormData] = useState({
    attractionId: '',
    startDate: '',
    endDate: '',
    startTime: '18:00',
    endTime: '23:00',
    intervalMinutes: '30',
    capacity: '',
    daysOfWeek: [5, 6], // Fri, Sat by default
  });

  const loadTimeSlots = useCallback(async (orgId: string, date?: string) => {
    try {
      const dateFilter = date || selectedDate;
      const response = await apiClient.get<{ data: TimeSlot[] }>(
        `/organizations/${orgId}/time-slots?date=${dateFilter}&includeInactive=true`
      );
      setTimeSlots(response?.data || []);
    } catch (_error) {}
  }, [selectedDate]);

  const loadAttractions = useCallback(async (orgId: string) => {
    try {
      const response = await apiClient.get<{ data: Attraction[] }>(
        `/organizations/${orgId}/attractions`
      );
      setAttractions(response?.data || []);
    } catch (_error) {}
  }, []);

  useEffect(() => {
    async function init() {
      const orgId = await resolveOrgId(orgIdentifier);
      if (orgId) {
        setResolvedOrgId(orgId);
        await Promise.all([loadTimeSlots(orgId), loadAttractions(orgId)]);
      }
      setIsLoading(false);
    }
    init();
  }, [orgIdentifier, loadAttractions, loadTimeSlots]);

  function formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours || '0', 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  }

  function formatPrice(cents: number): string {
    if (cents === 0) return '$0.00';
    const sign = cents > 0 ? '+' : '';
    return `${sign}$${(cents / 100).toFixed(2)}`;
  }

  function openCreateDialog() {
    setFormData({
      attractionId: attractions[0]?.id || '',
      date: selectedDate,
      startTime: '18:00',
      endTime: '18:30',
      capacity: '',
      priceModifier: '',
      label: '',
    });
    setIsDialogOpen(true);
  }

  function openBulkDialog() {
    setBulkFormData({
      attractionId: attractions[0]?.id || '',
      startDate: selectedDate,
      endDate: selectedDate,
      startTime: '18:00',
      endTime: '23:00',
      intervalMinutes: '30',
      capacity: '',
      daysOfWeek: [5, 6],
    });
    setIsBulkDialogOpen(true);
  }

  async function handleCreateSlot() {
    if (!resolvedOrgId || !formData.attractionId) return;

    const payload = {
      attractionId: formData.attractionId,
      date: formData.date,
      startTime: `${formData.startTime}:00`,
      endTime: `${formData.endTime}:00`,
      capacity: formData.capacity ? parseInt(formData.capacity, 10) : undefined,
      priceModifier: formData.priceModifier
        ? Math.round(parseFloat(formData.priceModifier) * 100)
        : undefined,
      label: formData.label || undefined,
    };

    try {
      await apiClient.post(`/organizations/${resolvedOrgId}/time-slots`, payload);
      toast({ title: 'Time slot created' });
      setIsDialogOpen(false);
      await loadTimeSlots(resolvedOrgId);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to create time slot',
        variant: 'destructive',
      });
    }
  }

  async function handleBulkCreate() {
    if (!resolvedOrgId || !bulkFormData.attractionId) return;

    const payload = {
      attractionId: bulkFormData.attractionId,
      startDate: bulkFormData.startDate,
      endDate: bulkFormData.endDate,
      startTime: `${bulkFormData.startTime}:00`,
      endTime: `${bulkFormData.endTime}:00`,
      intervalMinutes: parseInt(bulkFormData.intervalMinutes, 10),
      capacity: bulkFormData.capacity ? parseInt(bulkFormData.capacity, 10) : undefined,
      daysOfWeek: bulkFormData.daysOfWeek,
    };

    try {
      const result = await apiClient.post<{ created: number }>(
        `/organizations/${resolvedOrgId}/time-slots/bulk`,
        payload
      );
      toast({ title: `Created ${result?.created || 0} time slots` });
      setIsBulkDialogOpen(false);
      await loadTimeSlots(resolvedOrgId);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to create time slots',
        variant: 'destructive',
      });
    }
  }

  async function handleToggleActive(slot: TimeSlot) {
    if (!resolvedOrgId) return;

    try {
      await apiClient.patch(`/organizations/${resolvedOrgId}/time-slots/${slot.id}`, {
        isActive: !slot.is_active,
      });
      toast({
        title: slot.is_active ? 'Time slot deactivated' : 'Time slot activated',
      });
      await loadTimeSlots(resolvedOrgId);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Failed to update time slot',
        variant: 'destructive',
      });
    }
  }

  async function handleDelete(slot: TimeSlot) {
    if (!resolvedOrgId) return;
    if (!confirm('Delete this time slot?')) return;

    try {
      await apiClient.delete(`/organizations/${resolvedOrgId}/time-slots/${slot.id}`);
      toast({ title: 'Time slot deleted' });
      await loadTimeSlots(resolvedOrgId);
    } catch (_error) {
      toast({
        title: 'Error',
        description: 'Cannot delete time slot with existing bookings',
        variant: 'destructive',
      });
    }
  }

  async function handleDateChange(date: string) {
    setSelectedDate(date);
    if (resolvedOrgId) {
      await loadTimeSlots(resolvedOrgId, date);
    }
  }

  const toggleDayOfWeek = (day: number) => {
    const days = bulkFormData.daysOfWeek;
    if (days.includes(day)) {
      setBulkFormData({ ...bulkFormData, daysOfWeek: days.filter((d) => d !== day) });
    } else {
      setBulkFormData({ ...bulkFormData, daysOfWeek: [...days, day].sort() });
    }
  };

  if (isLoading) {
    return <TimeSlotsLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <AnimatedPageHeader shouldReduceMotion={shouldReduceMotion}>
        <div>
          <h1 className="text-3xl font-bold">Time Slots</h1>
          <p className="text-muted-foreground">Manage timed entry slots and capacity limits.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openBulkDialog}>
            <Calendar className="h-4 w-4 mr-2" />
            Bulk Create
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Slot
          </Button>
        </div>
      </AnimatedPageHeader>

      <AnimatedTableCard shouldReduceMotion={shouldReduceMotion}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Time Slots</CardTitle>
              <CardDescription>
                {timeSlots.length} slot{timeSlots.length !== 1 ? 's' : ''} for{' '}
                {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </CardDescription>
            </div>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-auto"
            />
          </div>
        </CardHeader>
        <CardContent>
          {timeSlots.length === 0 ? (
            <AnimatedEmptyState
              shouldReduceMotion={shouldReduceMotion}
              onCreateClick={openCreateDialog}
              onBulkClick={openBulkDialog}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Attraction</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead className="text-right">Capacity</TableHead>
                  <TableHead className="text-right">Price Modifier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeSlots.map((slot, index) => (
                  <AnimatedTimeSlotRow
                    key={slot.id}
                    slot={slot}
                    index={index}
                    formatTime={formatTime}
                    formatPrice={formatPrice}
                    handleToggleActive={handleToggleActive}
                    handleDelete={handleDelete}
                    shouldReduceMotion={shouldReduceMotion}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </AnimatedTableCard>

      {/* Single Slot Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Time Slot</DialogTitle>
            <DialogDescription>Add a single time slot.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Attraction</Label>
              <Select
                value={formData.attractionId}
                onValueChange={(v) => setFormData({ ...formData, attractionId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select attraction" />
                </SelectTrigger>
                <SelectContent>
                  {attractions.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Capacity</Label>
                <Input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="Unlimited"
                />
              </div>
              <div className="grid gap-2">
                <Label>Price Modifier ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.priceModifier}
                  onChange={(e) => setFormData({ ...formData, priceModifier: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Label</Label>
              <Input
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="e.g., Peak Hours"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSlot}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Create Dialog */}
      <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk Create Time Slots</DialogTitle>
            <DialogDescription>Generate multiple time slots across a date range.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Attraction</Label>
              <Select
                value={bulkFormData.attractionId}
                onValueChange={(v) => setBulkFormData({ ...bulkFormData, attractionId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select attraction" />
                </SelectTrigger>
                <SelectContent>
                  {attractions.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={bulkFormData.startDate}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, startDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={bulkFormData.endDate}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={bulkFormData.startTime}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, startTime: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={bulkFormData.endTime}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, endTime: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Interval (min)</Label>
                <Select
                  value={bulkFormData.intervalMinutes}
                  onValueChange={(v) => setBulkFormData({ ...bulkFormData, intervalMinutes: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Days of Week</Label>
              <div className="flex gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                  <Button
                    key={day}
                    type="button"
                    variant={bulkFormData.daysOfWeek.includes(idx) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleDayOfWeek(idx)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Capacity Per Slot</Label>
              <Input
                type="number"
                min="1"
                value={bulkFormData.capacity}
                onChange={(e) => setBulkFormData({ ...bulkFormData, capacity: e.target.value })}
                placeholder="Unlimited"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkCreate}>Create Slots</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
