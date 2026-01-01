'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createSeason, updateSeason } from '@/lib/api/client';

interface SeasonFormProps {
  orgId: string;
  attractionId: string;
  season?: {
    id: string;
    name: string;
    year: number;
    start_date: string;
    end_date: string;
    status?: 'upcoming' | 'active' | 'completed' | 'cancelled';
  };
  onSuccess?: () => void;
}

// Generate year options (current year - 1 to current year + 2)
function getYearOptions() {
  const currentYear = new Date().getFullYear();
  return [
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
  ];
}

const statusOptions = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function SeasonForm({ orgId, attractionId, season, onSuccess }: SeasonFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const isEditing = !!season;
  const yearOptions = getYearOptions();
  const defaultYear = season?.year || new Date().getFullYear();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const yearStr = formData.get('year') as string;
    const startDate = formData.get('start_date') as string;
    const endDate = formData.get('end_date') as string;
    const status = formData.get('status') as 'upcoming' | 'active' | 'completed' | 'cancelled' | null;

    // Validate dates
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date must be after start date');
      setIsLoading(false);
      return;
    }

    if (isEditing && season) {
      // Update existing season
      const data: Parameters<typeof updateSeason>[3] = {};

      if (name) data.name = name;
      if (yearStr) data.year = parseInt(yearStr, 10);
      if (startDate) data.start_date = startDate;
      if (endDate) data.end_date = endDate;
      if (status) data.status = status;

      const result = await updateSeason(orgId, attractionId, season.id, data);

      if (result.error) {
        setError(result.error.message || 'Failed to update season');
        setIsLoading(false);
        return;
      }

      setSuccess('Season updated successfully');
    } else {
      // Create new season
      const data: Parameters<typeof createSeason>[2] = {
        name,
        year: parseInt(yearStr, 10),
        start_date: startDate,
        end_date: endDate,
      };

      const result = await createSeason(orgId, attractionId, data);

      if (result.error) {
        setError(result.error.message || 'Failed to create season');
        setIsLoading(false);
        return;
      }

      setSuccess('Season created successfully');
    }

    setIsLoading(false);

    // Call onSuccess callback or redirect
    setTimeout(() => {
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    }, 1000);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Season' : 'Add Season'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update season details.'
              : 'Create a new operating season for this attraction.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div
              className="rounded-md bg-destructive/15 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="rounded-md bg-green-500/15 px-4 py-3 text-sm text-green-600 dark:text-green-400"
              role="status"
            >
              {success}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Season Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Halloween 2024"
                defaultValue={season?.name}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select name="year" defaultValue={defaultYear.toString()} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                name="start_date"
                type="date"
                defaultValue={season?.start_date}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                name="end_date"
                type="date"
                defaultValue={season?.end_date}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={season?.status || 'upcoming'} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Season' : 'Add Season'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
