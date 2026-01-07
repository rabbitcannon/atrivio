import { AlertCircle, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SeasonForm } from '@/components/features/attractions/season-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAttraction, getAttractionSeasons, resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Seasons',
};

interface SeasonsPageProps {
  params: Promise<{ orgId: string; attractionId: string }>;
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'active':
      return 'default';
    case 'upcoming':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
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
          <h1 className="text-3xl font-bold">Seasons</h1>
          <p className="text-muted-foreground">Manage operating seasons for {attraction.name}.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Season List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Seasons ({seasons.length})</h2>
          {seasons.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No seasons yet. Create your first season.</p>
              </CardContent>
            </Card>
          ) : (
            seasons.map((season) => (
              <Card key={season.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{season.name}</CardTitle>
                    <Badge variant={getStatusVariant(season.status)}>{season.status}</Badge>
                  </div>
                  <CardDescription>
                    {new Date(season.start_date).toLocaleDateString()} -{' '}
                    {new Date(season.end_date).toLocaleDateString()}
                    <span className="ml-2 text-muted-foreground">({season.year})</span>
                  </CardDescription>
                </CardHeader>
              </Card>
            ))
          )}
        </div>

        {/* Add Season Form */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Add Season</h2>
          <SeasonForm orgId={orgId} attractionId={attractionId} />
        </div>
      </div>
    </div>
  );
}
