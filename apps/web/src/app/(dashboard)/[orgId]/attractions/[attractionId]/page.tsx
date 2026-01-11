import {
  AlertCircle,
  Calendar,
  ChevronRight,
  MapPin,
  Settings,
  Store,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { getAttraction, resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Attraction Details',
};

interface AttractionDetailPageProps {
  params: Promise<{ orgId: string; attractionId: string }>;
}

export default async function AttractionDetailPage({ params }: AttractionDetailPageProps) {
  const { orgId: orgIdentifier, attractionId } = await params;

  // Resolve slug to UUID if needed
  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Fetch attraction data from API
  const { data: attraction, error } = await getAttraction(orgId, attractionId);

  if (error || !attraction) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading attraction</AlertTitle>
          <AlertDescription>
            {error?.message || 'Attraction not found. Please try refreshing the page.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const zonesCount = attraction.zones_count ?? attraction.zones?.length ?? 0;
  const typeName = attraction.type_name || attraction.type?.replace('_', ' ') || 'Unknown';
  const basePath = `/${orgIdentifier}/attractions/${attractionId}`;

  const featureCards = [
    {
      title: 'Zones',
      description: 'Manage areas and actor positions within your attraction',
      href: `${basePath}/zones`,
      icon: MapPin,
      stat: zonesCount,
      statLabel: zonesCount === 1 ? 'zone' : 'zones',
    },
    {
      title: 'Seasons',
      description: 'Configure operating dates, hours, and seasonal settings',
      href: `${basePath}/seasons`,
      icon: Calendar,
      stat: null, // TODO: Add active seasons count
      statLabel: 'Configure schedules',
    },
    {
      title: 'Storefront',
      description: 'Public-facing site for tickets, info, and announcements',
      href: `${basePath}/storefront`,
      icon: Store,
      stat: null, // TODO: Add published status
      statLabel: 'Manage public site',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <AnimatedPageHeader className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{attraction.name}</h1>
            <Badge variant={attraction.status === 'active' ? 'default' : 'secondary'}>
              {attraction.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {attraction.description || 'No description provided'}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={`${basePath}/settings`}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </Button>
      </AnimatedPageHeader>

      {/* Stats */}
      <StaggerContainer className="grid gap-4 sm:grid-cols-3" staggerDelay={0.06} delayChildren={0.1}>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Zones</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{zonesCount}</div>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Capacity</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{attraction.capacity || 0}</div>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{typeName}</div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Feature Cards */}
      <FadeIn delay={0.2}>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Manage</h2>
          <StaggerContainer className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08} delayChildren={0.1}>
            {featureCards.map((feature) => (
              <StaggerItem key={feature.title}>
                <Link href={feature.href} className="group block h-full">
                  <Card className="h-full transition-colors hover:bg-muted/50">
                    <CardHeader className="flex flex-row items-start justify-between pb-2">
                      <div className="rounded-md bg-primary/10 p-2">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </CardHeader>
                    <CardContent className="space-y-1">
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                      {feature.stat !== null ? (
                        <p className="pt-2 text-sm font-medium text-primary">
                          {feature.stat} {feature.statLabel}
                        </p>
                      ) : (
                        <p className="pt-2 text-sm text-muted-foreground">{feature.statLabel}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </FadeIn>
    </div>
  );
}
