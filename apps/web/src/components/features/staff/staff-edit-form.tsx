'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateStaffMember } from '@/lib/api/client';
import type { StaffMember } from '@/lib/api/types';

interface StaffEditFormProps {
  orgId: string;
  staff: StaffMember;
}

const statusOptions = ['active', 'inactive', 'on_leave', 'terminated'] as const;
const employmentTypes = ['full_time', 'part_time', 'seasonal', 'contractor'] as const;
const shirtSizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const;

export function StaffEditForm({ orgId, staff }: StaffEditFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);

    // Build update data object with only changed fields
    const hourlyRateStr = formData.get('hourly_rate') as string;
    const hourlyRate = hourlyRateStr ? Math.round(parseFloat(hourlyRateStr) * 100) : undefined;

    const emergencyName = formData.get('emergency_name') as string;
    const emergencyPhone = formData.get('emergency_phone') as string;
    const emergencyRelation = formData.get('emergency_relation') as string;

    // Build data object with only defined values (exactOptionalPropertyTypes requires this)
    const data: Parameters<typeof updateStaffMember>[2] = {};

    const employeeId = formData.get('employee_id') as string;
    if (employeeId) data.employee_id = employeeId;

    const status = formData.get('status') as typeof statusOptions[number];
    if (status) data.status = status;

    const employmentType = formData.get('employment_type') as typeof employmentTypes[number];
    if (employmentType) data.employment_type = employmentType;

    if (hourlyRate !== undefined) data.hourly_rate = hourlyRate;

    const shirtSize = formData.get('shirt_size') as string;
    if (shirtSize) data.shirt_size = shirtSize;

    const notes = formData.get('notes') as string;
    if (notes) data.notes = notes;

    // Only include emergency contact if at least name and phone are provided
    if (emergencyName && emergencyPhone) {
      const emergencyContact: { name: string; phone: string; relation?: string } = {
        name: emergencyName,
        phone: emergencyPhone,
      };
      if (emergencyRelation) {
        emergencyContact.relation = emergencyRelation;
      }
      data.emergency_contact = emergencyContact;
    }

    const result = await updateStaffMember(orgId, staff.id, data);

    if (result.error) {
      setError(result.error.message || 'Failed to update staff member');
      setIsLoading(false);
      return;
    }

    setSuccess('Staff member updated successfully');
    setIsLoading(false);

    // Redirect after a short delay to show success message
    setTimeout(() => {
      router.push(`/${orgId}/staff/${staff.id}`);
      router.refresh();
    }, 1000);
  }

  const staffName = staff.user
    ? `${staff.user.first_name || ''} ${staff.user.last_name || ''}`.trim() || 'Unknown'
    : 'Unknown';

  // Convert hourly rate from cents to dollars for display
  const hourlyRateDisplay = staff.hourly_rate ? (staff.hourly_rate / 100).toFixed(2) : '';

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Edit Staff Profile</CardTitle>
          <CardDescription>
            Update profile information for {staffName}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          {/* Employment Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Employment Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  name="employee_id"
                  placeholder="EMP001"
                  defaultValue={staff.employee_id || ''}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={staff.status || 'active'} disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employment_type">Employment Type</Label>
                <Select
                  name="employment_type"
                  defaultValue={staff.employment_type || 'seasonal'}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {employmentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate ($)</Label>
                <Input
                  id="hourly_rate"
                  name="hourly_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="15.00"
                  defaultValue={hourlyRateDisplay}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personal Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shirt_size">Shirt Size</Label>
                <Select
                  name="shirt_size"
                  defaultValue={staff.shirt_size || ''}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {shirtSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Emergency Contact</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="emergency_name">Name</Label>
                <Input
                  id="emergency_name"
                  name="emergency_name"
                  placeholder="Jane Doe"
                  defaultValue={staff.emergency_contact?.name || ''}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_phone">Phone</Label>
                <Input
                  id="emergency_phone"
                  name="emergency_phone"
                  type="tel"
                  placeholder="555-0123"
                  defaultValue={staff.emergency_contact?.phone || ''}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_relation">Relationship</Label>
                <Input
                  id="emergency_relation"
                  name="emergency_relation"
                  placeholder="Spouse, Parent, etc."
                  defaultValue={staff.emergency_contact?.relation || ''}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Additional notes about this staff member..."
              defaultValue={staff.notes || ''}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
