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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { AttractionType } from '@/lib/api';
import { createAttraction, updateAttraction } from '@/lib/api/client';

interface AttractionFormProps {
  orgId: string;
  attractionTypes: AttractionType[];
  attraction?: {
    id: string;
    name: string;
    slug: string;
    type_id: string;
    description?: string | null;
    capacity?: number | null;
    min_age?: number | null;
    intensity_level?: number | null;
    duration_minutes?: number | null;
  };
}

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function AttractionForm({ orgId, attractionTypes, attraction }: AttractionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [slug, setSlug] = React.useState(attraction?.slug || '');
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(!!attraction);

  const isEditing = !!attraction;

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    if (!slugManuallyEdited && !isEditing) {
      setSlug(generateSlug(name));
    }
  }

  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value);
    setSlugManuallyEdited(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);

    if (isEditing && attraction) {
      // Update existing attraction
      const data: Parameters<typeof updateAttraction>[2] = {};

      const name = formData.get('name') as string;
      if (name) data.name = name;

      const description = formData.get('description') as string;
      if (description) data.description = description;

      const capacity = formData.get('capacity') as string;
      if (capacity) data.capacity = parseInt(capacity, 10);

      const minAge = formData.get('min_age') as string;
      if (minAge) data.min_age = parseInt(minAge, 10);

      const intensityLevel = formData.get('intensity_level') as string;
      if (intensityLevel) data.intensity_level = parseInt(intensityLevel, 10);

      const durationMinutes = formData.get('duration_minutes') as string;
      if (durationMinutes) data.duration_minutes = parseInt(durationMinutes, 10);

      const result = await updateAttraction(orgId, attraction.id, data);

      if (result.error) {
        setError(result.error.message || 'Failed to update attraction');
        setIsLoading(false);
        return;
      }

      setSuccess('Attraction updated successfully');
    } else {
      // Create new attraction
      const name = formData.get('name') as string;
      const typeId = formData.get('type_id') as string;
      const slugValue = formData.get('slug') as string;
      const description = formData.get('description') as string;
      const capacity = formData.get('capacity') as string;
      const minAge = formData.get('min_age') as string;
      const intensityLevel = formData.get('intensity_level') as string;
      const durationMinutes = formData.get('duration_minutes') as string;

      const data: Parameters<typeof createAttraction>[1] = {
        name,
        slug: slugValue || generateSlug(name),
        type_id: typeId,
      };

      if (description) data.description = description;
      if (capacity) data.capacity = parseInt(capacity, 10);
      if (minAge) data.min_age = parseInt(minAge, 10);
      if (intensityLevel) data.intensity_level = parseInt(intensityLevel, 10);
      if (durationMinutes) data.duration_minutes = parseInt(durationMinutes, 10);

      const result = await createAttraction(orgId, data);

      if (result.error) {
        setError(result.error.message || 'Failed to create attraction');
        setIsLoading(false);
        return;
      }

      setSuccess('Attraction created successfully');
    }

    setIsLoading(false);

    // Redirect after a short delay to show success message
    setTimeout(() => {
      router.push(`/${orgId}/attractions`);
      router.refresh();
    }, 1000);
  }

  // Fallback types if none provided
  const fallbackTypes: AttractionType[] = [
    {
      id: 'haunted_house',
      key: 'haunted_house',
      name: 'Haunted House',
      category: 'indoor',
      icon: 'ghost',
    },
    {
      id: 'haunted_trail',
      key: 'haunted_trail',
      name: 'Haunted Trail',
      category: 'outdoor',
      icon: 'tree',
    },
    { id: 'escape_room', key: 'escape_room', name: 'Escape Room', category: 'indoor', icon: 'key' },
    { id: 'other', key: 'other', name: 'Other', category: 'hybrid', icon: 'help-circle' },
  ];
  const types: AttractionType[] = attractionTypes.length > 0 ? attractionTypes : fallbackTypes;
  const defaultTypeId = types[0]?.id ?? 'haunted_house';

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Attraction' : 'New Attraction'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update attraction details.'
              : 'Fill in the details to create a new attraction.'}
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
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Haunted Manor"
                defaultValue={attraction?.name}
                onChange={handleNameChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                name="slug"
                placeholder="haunted-manor"
                value={slug}
                onChange={handleSlugChange}
                required={!isEditing}
                disabled={isLoading || isEditing}
                pattern="[a-z0-9-]+"
                title="Only lowercase letters, numbers, and hyphens"
              />
              <p className="text-xs text-muted-foreground">
                Used in URLs: example.com/{slug || 'your-slug'}
              </p>
            </div>
          </div>

          {!isEditing && (
            <div className="space-y-2">
              <Label htmlFor="type_id">Type</Label>
              <Select name="type_id" defaultValue={defaultTypeId} disabled={isLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your attraction..."
              defaultValue={attraction?.description || ''}
              disabled={isLoading}
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min={1}
                placeholder="100"
                defaultValue={attraction?.capacity ?? ''}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_age">Min Age</Label>
              <Input
                id="min_age"
                name="min_age"
                type="number"
                min={0}
                max={21}
                placeholder="12"
                defaultValue={attraction?.min_age ?? ''}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="intensity_level">Intensity (1-5)</Label>
              <Input
                id="intensity_level"
                name="intensity_level"
                type="number"
                min={1}
                max={5}
                placeholder="3"
                defaultValue={attraction?.intensity_level ?? ''}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (min)</Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min={1}
                placeholder="30"
                defaultValue={attraction?.duration_minutes ?? ''}
                disabled={isLoading}
              />
            </div>
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
            {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Attraction'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
