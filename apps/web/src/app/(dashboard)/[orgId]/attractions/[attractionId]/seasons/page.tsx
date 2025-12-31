import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SeasonForm } from '@/components/features/attractions/season-form';

export const metadata: Metadata = {
  title: 'Seasons',
};

interface SeasonsPageProps {
  params: Promise<{ orgId: string; attractionId: string }>;
}

// Mock data
const mockSeasons = [
  {
    id: '1',
    name: 'Halloween 2024',
    startDate: '2024-09-15',
    endDate: '2024-11-01',
    status: 'upcoming',
  },
  {
    id: '2',
    name: 'Summer Scares 2024',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    status: 'completed',
  },
];

export default async function SeasonsPage({ params }: SeasonsPageProps) {
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
          <h1 className="text-3xl font-bold">Seasons</h1>
          <p className="text-muted-foreground">Manage operating seasons for this attraction.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Season List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">All Seasons</h2>
          {mockSeasons.map((season) => (
            <Card key={season.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{season.name}</CardTitle>
                  <Badge
                    variant={
                      season.status === 'active'
                        ? 'default'
                        : season.status === 'upcoming'
                          ? 'secondary'
                          : 'outline'
                    }
                  >
                    {season.status}
                  </Badge>
                </div>
                <CardDescription>
                  {new Date(season.startDate).toLocaleDateString()} -{' '}
                  {new Date(season.endDate).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Add Season Form */}
        <div>
          <h2 className="mb-4 text-lg font-semibold">Add Season</h2>
          <SeasonForm attractionId={attractionId} />
        </div>
      </div>
    </div>
  );
}
