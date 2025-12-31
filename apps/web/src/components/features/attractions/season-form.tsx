'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface SeasonFormProps {
  attractionId: string;
  season?: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
  };
}

export function SeasonForm({ attractionId, season }: SeasonFormProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
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
            <Label htmlFor="name">Season Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Halloween 2024"
              defaultValue={season?.name}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={season?.startDate}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={season?.endDate}
                required
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Saving...' : season ? 'Update Season' : 'Add Season'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
