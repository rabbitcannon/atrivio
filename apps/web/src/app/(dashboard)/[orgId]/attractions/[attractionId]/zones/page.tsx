import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ZoneForm } from '@/components/features/attractions/zone-form';

export const metadata: Metadata = {
  title: 'Zones',
};

interface ZonesPageProps {
  params: Promise<{ orgId: string; attractionId: string }>;
}

// Mock data
const mockZones = [
  {
    id: '1',
    name: 'Entry Hall',
    type: 'queue',
    actorCount: 2,
    order: 1,
  },
  {
    id: '2',
    name: 'Victorian Parlor',
    type: 'scare',
    actorCount: 4,
    order: 2,
  },
  {
    id: '3',
    name: 'Haunted Library',
    type: 'scare',
    actorCount: 3,
    order: 3,
  },
];

export default async function ZonesPage({ params }: ZonesPageProps) {
  const { orgId, attractionId } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <a href={`/${orgId}/attractions/${attractionId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to attraction</span>
          </a>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Zones</h1>
          <p className="text-muted-foreground">Manage zones and areas within this attraction.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Zones List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Zones</h2>
          {mockZones.map((zone) => (
            <Card key={zone.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {zone.order}
                    </span>
                    <CardTitle className="text-base">{zone.name}</CardTitle>
                  </div>
                  <Badge variant="outline">{zone.type}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <p className="text-sm text-muted-foreground">
                  {zone.actorCount} actors assigned
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Zone Form */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Add Zone</h2>
          <ZoneForm attractionId={attractionId} />
        </div>
      </div>
    </div>
  );
}
