'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, XCircle, Clock, MinusCircle } from 'lucide-react';
import {
  getStaff,
  getStaffAvailability,
  type StaffListItem,
  type StaffAvailability,
  type AvailabilityType,
} from '@/lib/api/client';

interface AvailabilityMatrixProps {
  orgId: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const AVAILABILITY_ICONS: Record<AvailabilityType, { icon: typeof CheckCircle; color: string }> = {
  available: { icon: CheckCircle, color: 'text-green-500' },
  preferred: { icon: CheckCircle, color: 'text-green-600' },
  unavailable: { icon: XCircle, color: 'text-red-500' },
  time_off_approved: { icon: MinusCircle, color: 'text-yellow-500' },
  time_off_pending: { icon: Clock, color: 'text-orange-500' },
};

function MatrixSkeleton() {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Staff</TableHead>
            {DAYS.map((day) => (
              <TableHead key={day} className="text-center w-[80px]">
                {day}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </TableCell>
              {DAYS.map((day) => (
                <TableCell key={day} className="text-center">
                  <Skeleton className="h-6 w-6 mx-auto rounded-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

interface StaffWithAvailability extends StaffListItem {
  availability: StaffAvailability[];
}

export function AvailabilityMatrix({ orgId }: AvailabilityMatrixProps) {
  const [staffWithAvailability, setStaffWithAvailability] = useState<StaffWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      // First get all staff
      const { data: staffData, error: staffError } = await getStaff(orgId);

      if (staffError) {
        setError(staffError.message || 'Failed to load staff');
        setLoading(false);
        return;
      }

      if (!staffData?.data || staffData.data.length === 0) {
        setStaffWithAvailability([]);
        setLoading(false);
        return;
      }

      // Fetch availability for each staff member
      const staffList = staffData.data;
      const availabilityPromises = staffList.map((staff) =>
        getStaffAvailability(orgId, staff.id).then(({ data }) => ({
          ...staff,
          availability: data || [],
        }))
      );

      const results = await Promise.all(availabilityPromises);
      setStaffWithAvailability(results);
      setLoading(false);
    }

    fetchData();
  }, [orgId]);

  if (loading) {
    return <MatrixSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading availability</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (staffWithAvailability.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
        <h3 className="text-lg font-medium">No staff members yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Add staff members to view their availability.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] sticky left-0 bg-card">Staff</TableHead>
              {DAYS.map((day) => (
                <TableHead key={day} className="text-center min-w-[80px]">
                  {day}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffWithAvailability.map((staff) => {
              const fullName =
                [staff.user.first_name, staff.user.last_name].filter(Boolean).join(' ') ||
                staff.user.email;
              const initials = fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2);

              // Create availability map by day
              const availabilityByDay: Record<number, StaffAvailability | null> = {};
              for (const avail of staff.availability) {
                availabilityByDay[avail.day_of_week] = avail;
              }

              return (
                <TableRow key={staff.id}>
                  <TableCell className="sticky left-0 bg-card">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{fullName}</p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {staff.role.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  {DAYS.map((_, dayIndex) => {
                    const avail = availabilityByDay[dayIndex];

                    if (!avail) {
                      // No availability set - show neutral
                      return (
                        <TableCell key={dayIndex} className="text-center">
                          <span className="text-muted-foreground">-</span>
                        </TableCell>
                      );
                    }

                    const config = AVAILABILITY_ICONS[avail.availability_type] ?? AVAILABILITY_ICONS.available;
                    const Icon = config.icon;

                    return (
                      <TableCell key={dayIndex} className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Icon className={`h-5 w-5 ${config.color}`} />
                          {avail.start_time && avail.end_time && (
                            <span className="text-[10px] text-muted-foreground">
                              {avail.start_time.slice(0, 5)}-{avail.end_time.slice(0, 5)}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="text-muted-foreground">Legend:</span>
        <div className="flex items-center gap-1">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <XCircle className="h-4 w-4 text-red-500" />
          <span>Unavailable</span>
        </div>
        <div className="flex items-center gap-1">
          <MinusCircle className="h-4 w-4 text-yellow-500" />
          <span>Time Off (Approved)</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-orange-500" />
          <span>Time Off (Pending)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">-</span>
          <span>Not Set</span>
        </div>
      </div>
    </div>
  );
}
