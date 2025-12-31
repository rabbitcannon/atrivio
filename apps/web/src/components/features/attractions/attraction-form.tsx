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

interface AttractionFormProps {
  orgId: string;
  attraction?: {
    id: string;
    name: string;
    type: string;
    description?: string;
    capacity?: number;
  };
}

const attractionTypes = [
  { value: 'haunted_house', label: 'Haunted House' },
  { value: 'trail', label: 'Trail' },
  { value: 'escape_room', label: 'Escape Room' },
  { value: 'maze', label: 'Maze' },
  { value: 'hayride', label: 'Hayride' },
  { value: 'other', label: 'Other' },
];

export function AttractionForm({ orgId, attraction }: AttractionFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      description: formData.get('description') as string,
      capacity: Number.parseInt(formData.get('capacity') as string, 10),
    };

    // TODO: Implement API call - data will be sent to the server
    void data; // Placeholder until API is implemented
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    window.location.href = `/${orgId}/attractions`;
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{attraction ? 'Edit Attraction' : 'New Attraction'}</CardTitle>
          <CardDescription>
            {attraction
              ? 'Update attraction details.'
              : 'Fill in the details to create a new attraction.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Haunted Manor"
              defaultValue={attraction?.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select name="type" defaultValue={attraction?.type || 'haunted_house'}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {attractionTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              placeholder="A brief description of the attraction"
              defaultValue={attraction?.description}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity</Label>
            <Input
              id="capacity"
              name="capacity"
              type="number"
              min={1}
              placeholder="100"
              defaultValue={attraction?.capacity}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : attraction ? 'Save Changes' : 'Create Attraction'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
