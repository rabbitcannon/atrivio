import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { QueueSettingsForm } from '@/components/features/queue/queue-settings-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/motion';
import { getAttractions, getQueueConfig, resolveOrgId } from '@/lib/api';
import type { QueueConfig } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Queue Settings',
};

interface QueueSettingsPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function QueueSettingsPage({ params }: QueueSettingsPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  // Get the first attraction
  const attractionsResult = await getAttractions(orgId);
  const attractions = attractionsResult.data?.data || [];
  const primaryAttraction = attractions[0];

  if (!primaryAttraction) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/${orgIdentifier}/queue`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No attractions found. Create an attraction first.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  let queueConfig: QueueConfig | null = null;
  try {
    const configResult = await getQueueConfig(orgId, primaryAttraction.id);
    queueConfig = configResult.data;
  } catch {
    // Queue not configured - will show default values
  }

  const isActive = queueConfig?.is_active ?? false;
  const isPaused = queueConfig?.is_paused ?? false;

  return (
    <div className="space-y-6">
      <AnimatedPageHeader className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${orgIdentifier}/queue`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Queue Settings</h1>
            <p className="text-muted-foreground">{primaryAttraction.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isActive ? (isPaused ? 'outline' : 'default') : 'secondary'}>
            {isActive ? (isPaused ? 'Paused' : 'Active') : 'Inactive'}
          </Badge>
        </div>
      </AnimatedPageHeader>

      <FadeIn delay={0.1}>
        <QueueSettingsForm
          orgId={orgId}
          attractionId={primaryAttraction.id}
          attractionName={primaryAttraction.name}
          initialConfig={queueConfig}
        />
      </FadeIn>
    </div>
  );
}
