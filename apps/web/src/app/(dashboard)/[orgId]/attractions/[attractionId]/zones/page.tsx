import { AlertCircle, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ZoneForm } from '@/components/features/attractions/zone-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAttraction, getAttractionZones, resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Zones',
};

interface ZonesPageProps {
  params: Promise<{ orgId: string; attractionId: string }>;
}

export default async function ZonesPage({ params }: ZonesPageProps) {
  const { orgId: orgIdentifier, attractionId } = await params;

  // Resolve slug to UUID if needed
  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Fetch attraction and zones data
  const [attractionResult, zonesResult] = await Promise.all([
    getAttraction(orgId, attractionId),
    getAttractionZones(orgId, attractionId),
  ]);

  const attraction = attractionResult.data;
  const zones = zonesResult.data?.data ?? [];
  const error = attractionResult.error || zonesResult.error;

  if (error || !attraction) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading zones</AlertTitle>
          <AlertDescription>
            {error?.message || 'Failed to load zones. Please try refreshing the page.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <a href={`/${orgIdentifier}/attractions/${attractionId}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to attraction</span>
          </a>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Zones</h1>
          <p className="text-muted-foreground">Manage zones and areas within {attraction.name}.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Zones List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Zones ({zones.length})</h2>
          {zones.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No zones yet. Create your first zone.</p>
              </CardContent>
            </Card>
          ) : (
            zones.map((zone) => (
              <Card key={zone.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-6 w-6 items-center justify-center rounded-full text-xs text-white"
                        style={{ backgroundColor: zone.color || '#6366f1' }}
                      >
                        {(zone.sort_order ?? 0) + 1}
                      </span>
                      <CardTitle className="text-base">{zone.name}</CardTitle>
                    </div>
                    {zone.capacity && <Badge variant="outline">Cap: {zone.capacity}</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  {zone.description ? (
                    <p className="text-sm text-muted-foreground">{zone.description}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {zone.staff_count ?? 0} staff assigned
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Add Zone Form */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Add Zone</h2>
          <ZoneForm orgId={orgId} attractionId={attractionId} />
        </div>
      </div>
    </div>
  );
}
