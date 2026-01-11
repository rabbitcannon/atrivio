import { AlertCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { SeasonForm } from '@/components/features/attractions/season-form';
import { SeasonsList } from '@/components/features/attractions/seasons-list';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { FadeIn } from '@/components/ui/motion';
import { getAttraction, getAttractionSeasons, resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Seasons',
};

interface SeasonsPageProps {
  params: Promise<{ orgId: string; attractionId: string }>;
}

export default async function SeasonsPage({ params }: SeasonsPageProps) {
  const { orgId: orgIdentifier, attractionId } = await params;

  // Resolve slug to UUID if needed
  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Fetch attraction and seasons data
  const [attractionResult, seasonsResult] = await Promise.all([
    getAttraction(orgId, attractionId),
    getAttractionSeasons(orgId, attractionId),
  ]);

  const attraction = attractionResult.data;
  const seasons = seasonsResult.data?.data ?? [];
  const error = attractionResult.error || seasonsResult.error;

  if (error || !attraction) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading seasons</AlertTitle>
          <AlertDescription>
            {error?.message || 'Failed to load seasons. Please try refreshing the page.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const breadcrumbs = [
    { label: 'Attractions', href: `/${orgIdentifier}/attractions` },
    { label: attraction.name, href: `/${orgIdentifier}/attractions/${attractionId}` },
    { label: 'Seasons' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Breadcrumb items={breadcrumbs} />
        <AnimatedPageHeader>
          <h1 className="text-3xl font-bold tracking-tight">Seasons</h1>
          <p className="text-muted-foreground">Manage operating seasons for {attraction.name}.</p>
        </AnimatedPageHeader>
      </div>

      <FadeIn delay={0.1}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Season List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">All Seasons ({seasons.length})</h2>
            <SeasonsList orgId={orgId} attractionId={attractionId} seasons={seasons} />
          </div>

          {/* Add Season Form */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Add Season</h2>
            <SeasonForm orgId={orgId} attractionId={attractionId} />
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
