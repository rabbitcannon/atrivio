'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createZone, updateZone } from '@/lib/api/client';

interface ZoneFormProps {
  orgId: string;
  attractionId: string;
  zone?: {
    id: string;
    name: string;
    description?: string | null;
    capacity?: number | null;
    color?: string | null;
  };
  onSuccess?: () => void;
}

// Preset colors for zones
const presetColors = [
  { value: '#EF4444', label: 'Red' },
  { value: '#F97316', label: 'Orange' },
  { value: '#EAB308', label: 'Yellow' },
  { value: '#22C55E', label: 'Green' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#6B7280', label: 'Gray' },
];

export function ZoneForm({ orgId, attractionId, zone, onSuccess }: ZoneFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [selectedColor, setSelectedColor] = React.useState(zone?.color || '#3B82F6');

  const isEditing = !!zone;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const capacityStr = formData.get('capacity') as string;
    const color = formData.get('color') as string;

    if (isEditing && zone) {
      // Update existing zone
      const data: Parameters<typeof updateZone>[3] = {};

      if (name) data.name = name;
      if (description) data.description = description;
      if (capacityStr) data.capacity = parseInt(capacityStr, 10);
      if (color) data.color = color;

      const result = await updateZone(orgId, attractionId, zone.id, data);

      if (result.error) {
        setError(result.error.message || 'Failed to update zone');
        setIsLoading(false);
        return;
      }

      setSuccess('Zone updated successfully');
    } else {
      // Create new zone
      const data: Parameters<typeof createZone>[2] = {
        name,
      };

      if (description) data.description = description;
      if (capacityStr) data.capacity = parseInt(capacityStr, 10);
      if (color) data.color = color;

      const result = await createZone(orgId, attractionId, data);

      if (result.error) {
        setError(result.error.message || 'Failed to create zone');
        setIsLoading(false);
        return;
      }

      setSuccess('Zone created successfully');
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
          <CardTitle>{isEditing ? 'Edit Zone' : 'Add Zone'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update zone details.'
              : 'Create a new zone for this attraction.'}
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

          <div className="space-y-2">
            <Label htmlFor="name">Zone Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Victorian Parlor"
              defaultValue={zone?.name}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe this zone..."
              defaultValue={zone?.description || ''}
              disabled={isLoading}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min={0}
              placeholder="10"
              defaultValue={zone?.capacity ?? ''}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Maximum number of guests in this zone at once.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <input type="hidden" name="color" value={selectedColor} />
            <div className="flex flex-wrap gap-2">
              {presetColors.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => setSelectedColor(preset.value)}
                  className={`h-8 w-8 rounded-full border-2 transition-all ${
                    selectedColor === preset.value
                      ? 'border-foreground ring-2 ring-offset-2'
                      : 'border-transparent hover:border-muted-foreground/50'
                  }`}
                  style={{ backgroundColor: preset.value }}
                  title={preset.label}
                  disabled={isLoading}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Color for identifying this zone on maps and schedules.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEditing ? 'Update Zone' : 'Add Zone'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
