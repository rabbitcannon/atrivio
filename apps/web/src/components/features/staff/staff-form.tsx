'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { OrgRole } from '@haunt/shared';

interface StaffFormProps {
  orgId: string;
  staff?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: OrgRole;
  };
}

const staffRoles: OrgRole[] = ['manager', 'hr', 'box_office', 'finance', 'actor', 'scanner'];

export function StaffForm({ orgId, staff }: StaffFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      role: formData.get('role') as OrgRole,
    };

    // TODO: Implement API call - data will be sent to the server
    void data; // Placeholder until API is implemented
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    window.location.href = `/${orgId}/staff`;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{staff ? 'Edit Staff Member' : 'New Staff Member'}</CardTitle>
          <CardDescription>
            {staff
              ? 'Update staff member details.'
              : 'Fill in the details to add a new staff member.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Jane Smith"
              defaultValue={staff?.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="jane@example.com"
              defaultValue={staff?.email}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="555-0123"
              defaultValue={staff?.phone}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select name="role" defaultValue={staff?.role || 'actor'}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {staffRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role.replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : staff ? 'Save Changes' : 'Add Staff Member'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
