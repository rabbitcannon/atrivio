import { AlertCircle, Plus } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  AnimatedAttractionsEmpty,
  AnimatedAttractionsGrid,
  AnimatedPageHeader,
  AttractionCard,
} from '@/components/features/attractions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { getAttractions, requireRole } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Attractions',
};

interface AttractionsPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function AttractionsPage({ params }: AttractionsPageProps) {
  const { orgId: orgIdentifier } = await params;

  // Require owner, admin, or manager role
  const auth = await requireRole(orgIdentifier, ['owner', 'admin', 'manager']);
  if (!auth) {
    notFound();
  }

  const { orgId } = auth;

  // Fetch attractions from API
  const { data, error } = await getAttractions(orgId);
  const attractions = data?.data ?? [];

  return (
    <div className="space-y-6">
      <AnimatedPageHeader className="flex items-center justify-between">
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
      </AnimatedPageHeader>

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
        <AnimatedAttractionsGrid>
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
        </AnimatedAttractionsGrid>
      )}

      {!error && attractions.length === 0 && (
        <AnimatedAttractionsEmpty orgId={orgIdentifier} />
      )}
    </div>
  );
}
