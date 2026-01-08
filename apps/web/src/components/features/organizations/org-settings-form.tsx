'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateOrganization } from '@/lib/api/client';
import type { Address, Organization } from '@/lib/api/types';
import { siteConfig } from '@/lib/config';

interface OrgSettingsFormProps {
  orgId: string;
  organization: Organization;
}

export function OrgSettingsForm({ orgId, organization }: OrgSettingsFormProps) {
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
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const website = formData.get('website') as string;
    const timezone = formData.get('timezone') as string;

    // Address fields
    const line1 = formData.get('address_line1') as string;
    const line2 = formData.get('address_line2') as string;
    const city = formData.get('address_city') as string;
    const state = formData.get('address_state') as string;
    const postalCode = formData.get('address_postal_code') as string;
    const country = formData.get('address_country') as string;

    // Build the update data object conditionally
    const data: Parameters<typeof updateOrganization>[1] = {};

    if (name && name !== organization.name) data.name = name;
    if (email && email !== (organization.email || '')) data.email = email;
    if (phone && phone !== (organization.phone || '')) data.phone = phone;
    if (website && website !== (organization.website || '')) data.website = website;
    if (timezone && timezone !== organization.timezone) data.timezone = timezone;

    // Build address if any field is filled
    const hasAddress = line1 || city || state || postalCode || country;
    if (hasAddress) {
      const address: Address = {
        line1: line1 || '',
        city: city || '',
        state: state || '',
        postal_code: postalCode || '',
        country: country || 'US',
      };
      if (line2) address.line2 = line2;
      data.address = address;
    }

    // Only submit if there are changes
    if (Object.keys(data).length === 0) {
      setError('No changes to save');
      setIsLoading(false);
      return;
    }

    const result = await updateOrganization(orgId, data);

    if (result.error) {
      setError(result.error.message || 'Failed to update organization');
      setIsLoading(false);
      return;
    }

    setSuccess('Organization updated successfully');
    setIsLoading(false);

    // Refresh page to show updated data
    setTimeout(() => {
      router.refresh();
    }, 1000);
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Update your organization information.</CardDescription>
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

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Basic Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={organization.name}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{siteConfig.platformDomain}/</span>
                  <Input id="slug" value={organization.slug} disabled className="flex-1 bg-muted" />
                </div>
                <p className="text-xs text-muted-foreground">
                  Slug cannot be changed after creation.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Contact Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={organization.email || ''}
                  placeholder="contact@example.com"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={organization.phone || ''}
                  placeholder="+1 (555) 123-4567"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={organization.website || ''}
                placeholder="https://example.com"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Address</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address_line1">Street Address</Label>
                <Input
                  id="address_line1"
                  name="address_line1"
                  defaultValue={organization.address?.line1 || ''}
                  placeholder="123 Main Street"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_line2">Apt, Suite, etc. (optional)</Label>
                <Input
                  id="address_line2"
                  name="address_line2"
                  defaultValue={organization.address?.line2 || ''}
                  placeholder="Suite 100"
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="address_city">City</Label>
                  <Input
                    id="address_city"
                    name="address_city"
                    defaultValue={organization.address?.city || ''}
                    placeholder="Salem"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_state">State</Label>
                  <Input
                    id="address_state"
                    name="address_state"
                    defaultValue={organization.address?.state || ''}
                    placeholder="MA"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_postal_code">ZIP Code</Label>
                  <Input
                    id="address_postal_code"
                    name="address_postal_code"
                    defaultValue={organization.address?.postal_code || ''}
                    placeholder="01970"
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address_country">Country</Label>
                  <Input
                    id="address_country"
                    name="address_country"
                    defaultValue={organization.address?.country || 'US'}
                    placeholder="US"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Timezone */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Locale</h3>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                name="timezone"
                defaultValue={organization.timezone || 'America/New_York'}
                placeholder="America/New_York"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                IANA timezone identifier (e.g., America/New_York, America/Los_Angeles)
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
