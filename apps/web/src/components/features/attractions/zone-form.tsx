'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ZoneFormProps {
  attractionId: string;
  zone?: {
    id: string;
    name: string;
    type: string;
    order: number;
  };
}

const zoneTypes = [
  { value: 'queue', label: 'Queue' },
  { value: 'scare', label: 'Scare Zone' },
  { value: 'transition', label: 'Transition' },
  { value: 'finale', label: 'Finale' },
  { value: 'exit', label: 'Exit' },
];

export function ZoneForm({ attractionId, zone }: ZoneFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      order: Number.parseInt(formData.get('order') as string, 10),
    };

    // TODO: Implement API call - data will be sent to the server
    void { attractionId, ...data }; // Placeholder until API is implemented
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    event.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Zone Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Victorian Parlor"
              defaultValue={zone?.name}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Zone Type</Label>
            <Select name="type" defaultValue={zone?.type || 'scare'}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {zoneTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order">Order</Label>
            <Input
              id="order"
              name="order"
              type="number"
              min={1}
              placeholder="1"
              defaultValue={zone?.order}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Saving...' : zone ? 'Update Zone' : 'Add Zone'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
