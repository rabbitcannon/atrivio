import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, MapPin, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Attraction Details',
};

interface AttractionDetailPageProps {
  params: Promise<{ orgId: string; attractionId: string }>;
}

export default async function AttractionDetailPage({ params }: AttractionDetailPageProps) {
  const { orgId, attractionId } = await params;

  // TODO: Fetch attraction data
  const attraction = {
    id: attractionId,
    name: 'Haunted Manor',
    description: 'A terrifying journey through a decrepit Victorian mansion.',
    type: 'haunted_house',
    status: 'active',
    zones: 12,
    capacity: 150,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{attraction.name}</h1>
            <Badge variant={attraction.status === 'active' ? 'default' : 'secondary'}>
              {attraction.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">{attraction.description}</p>
        </div>
        <Button variant="outline" asChild>
          <a href={`/${orgId}/attractions/${attractionId}/settings`}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </a>
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="zones">Zones</TabsTrigger>
          <TabsTrigger value="seasons">Seasons</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Zones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attraction.zones}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Capacity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{attraction.capacity}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {attraction.type.replace('_', ' ')}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="zones">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Zones</CardTitle>
                  <CardDescription>Manage zones within this attraction.</CardDescription>
                </div>
                <Button asChild>
                  <a href={`/${orgId}/attractions/${attractionId}/zones`}>
                    <MapPin className="mr-2 h-4 w-4" />
                    Manage Zones
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                View and configure zones for this attraction.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasons">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Seasons</CardTitle>
                  <CardDescription>Manage operating seasons.</CardDescription>
                </div>
                <Button asChild>
                  <a href={`/${orgId}/attractions/${attractionId}/seasons`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Manage Seasons
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Configure operating hours and seasonal settings.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
