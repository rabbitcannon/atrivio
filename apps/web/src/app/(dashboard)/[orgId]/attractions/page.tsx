import { AlertCircle, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AttractionCard } from '@/components/features/attractions/attraction-card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getAttractions, resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Attractions',
};

interface AttractionsPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function AttractionsPage({ params }: AttractionsPageProps) {
  const { orgId: orgIdentifier } = await params;

  // Resolve the org identifier (could be slug or UUID) to an actual UUID
  const orgId = await resolveOrgId(orgIdentifier);

  if (!orgId) {
    notFound();
  }

  // Fetch attractions from API
  const { data, error } = await getAttractions(orgId);
  const attractions = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attractions</h1>
          <p className="text-muted-foreground">Manage your attractions, zones, and seasons.</p>
        </div>
        <Button asChild>
          <a href={`/${orgIdentifier}/attractions/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Attraction
          </a>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading attractions</AlertTitle>
          <AlertDescription>
            {error.message || 'Failed to load attractions. Please try refreshing the page.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Attractions Grid */}
      {attractions.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {attractions.map((attraction) => (
            <AttractionCard
              key={attraction.id}
              attraction={{
                id: attraction.id,
                name: attraction.name,
                type: attraction.type_name || attraction.type,
                status: attraction.status === 'active' ? 'active' : 'inactive',
                zones: attraction.zones_count ?? 0,
                capacity: attraction.capacity ?? 0,
              }}
              orgId={orgIdentifier}
            />
          ))}
        </div>
      )}

      {!error && attractions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
          <h3 className="text-lg font-medium">No attractions yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get started by creating your first attraction.
          </p>
          <Button asChild className="mt-4">
            <a href={`/${orgIdentifier}/attractions/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Attraction
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
