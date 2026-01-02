'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  AlertCircle,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getOrgBySlug,
  getMyAvailability,
  setMyAvailability,
  type StaffAvailability,
  type AvailabilityType,
} from '@/lib/api/client';

const DAYS = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const AVAILABILITY_OPTIONS: { value: AvailabilityType; label: string; icon: typeof CheckCircle2 }[] = [
  { value: 'available', label: 'Available', icon: CheckCircle2 },
  { value: 'preferred', label: 'Preferred', icon: CheckCircle2 },
  { value: 'unavailable', label: 'Unavailable', icon: XCircle },
];

interface DayAvailability {
  dayOfWeek: number;
  availabilityType: AvailabilityType;
  startTime: string;
  endTime: string;
}

export default function MyAvailabilityPage() {
  const params = useParams<{ orgId: string }>();
  const orgSlug = params.orgId;
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  const [org, setOrg] = useState<{ id: string; name: string } | null>(null);
  const [availability, setAvailability] = useState<DayAvailability[]>(
    DAYS.map((d) => ({
      dayOfWeek: d.value,
      availabilityType: 'available' as AvailabilityType,
      startTime: '17:00',
      endTime: '23:00',
    }))
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  // Fetch current availability
  useEffect(() => {
    async function fetchAvailability() {
      if (!user || !org) return;

      setIsLoading(true);
      setError(null);

      const response = await getMyAvailability(org.id);
      if (response.error) {
        // May be normal if no availability set yet
        setIsLoading(false);
        return;
      }

      // Map existing availability to form state
      if (response.data && response.data.length > 0) {
        const newAvailability = DAYS.map((d) => {
          const existing = response.data!.find((a: StaffAvailability) => a.day_of_week === d.value);
          if (existing) {
            return {
              dayOfWeek: d.value,
              availabilityType: existing.availability_type,
              startTime: existing.start_time.slice(0, 5),
              endTime: existing.end_time.slice(0, 5),
            };
          }
          return {
            dayOfWeek: d.value,
            availabilityType: 'available' as AvailabilityType,
            startTime: '17:00',
            endTime: '23:00',
          };
        });
        setAvailability(newAvailability);
      }

      setIsLoading(false);
    }

    fetchAvailability();
  }, [user, org]);

  const handleDayChange = (dayOfWeek: number, field: keyof DayAvailability, value: string) => {
    setAvailability((prev) =>
      prev.map((a) => (a.dayOfWeek === dayOfWeek ? { ...a, [field]: value } : a))
    );
    setSuccess(false);
  };

  const handleSave = async () => {
    if (!org) return;

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    // Convert to API format - wrap in availability object
    const availabilityData = availability.map((a) => ({
      dayOfWeek: a.dayOfWeek,
      availabilityType: a.availabilityType as 'available' | 'unavailable' | 'preferred',
      startTime: a.startTime,
      endTime: a.endTime,
    }));

    const response = await setMyAvailability(org.id, { availability: availabilityData });

    if (response.error) {
      setError(response.error.message || 'Failed to save availability');
    } else {
      setSuccess(true);
    }

    setIsSaving(false);
  };

  // Not logged in
  if (!userLoading && !user) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-primary" />
            <CardTitle className="mt-4">Sign In Required</CardTitle>
            <CardDescription>Sign in to set your availability.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push(`/login?redirect=/${orgSlug}/time/availability`)}
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
            {DAYS.map((d) => (
              <Skeleton key={d.value} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error (org not found)
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
          <h1 className="text-2xl font-bold">My Availability</h1>
          <p className="text-muted-foreground text-sm">
            Set your weekly availability at {org?.name}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>Availability saved successfully!</AlertDescription>
          </Alert>
        )}

        {/* Availability Form */}
        <div className="space-y-3">
          {DAYS.map((day) => {
            const dayAvail = availability.find((a) => a.dayOfWeek === day.value)!;
            const isUnavailable = dayAvail.availabilityType === 'unavailable';

            return (
              <Card key={day.value} className={isUnavailable ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">{day.label}</Label>
                      <Select
                        value={dayAvail.availabilityType}
                        onValueChange={(value) =>
                          handleDayChange(day.value, 'availabilityType', value)
                        }
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABILITY_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {!isUnavailable && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-muted-foreground">From</Label>
                          <Input
                            type="time"
                            value={dayAvail.startTime}
                            onChange={(e) =>
                              handleDayChange(day.value, 'startTime', e.target.value)
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">To</Label>
                          <Input
                            type="time"
                            value={dayAvail.endTime}
                            onChange={(e) =>
                              handleDayChange(day.value, 'endTime', e.target.value)
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Save Button */}
        <Button className="w-full mt-6" size="lg" onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Availability
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
