import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Clock,
  Pause,
  Play,
  Settings,
  UserCheck,
  Users,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { UpgradePrompt } from '@/components/features/upgrade-prompt';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { getAttractions, getQueueConfig, getQueueEntries, isFeatureEnabled, requireRole } from '@/lib/api';
import type { QueueConfig, QueueEntriesResponse } from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Virtual Queue',
};

interface QueuePageProps {
  params: Promise<{ orgId: string }>;
}

const NAV_ITEMS = [
  {
    title: 'Manage Queue',
    description: 'View and manage current queue entries in real-time',
    href: '/queue/manage',
    icon: Users,
  },
  {
    title: 'Settings',
    description: 'Configure queue capacity, timing, and notifications',
    href: '/queue/settings',
    icon: Settings,
  },
  {
    title: 'Analytics',
    description: 'View queue statistics, wait times, and performance metrics',
    href: '/queue/stats',
    icon: BarChart3,
  },
];

export default async function QueuePage({ params }: QueuePageProps) {
  const { orgId: orgIdentifier } = await params;

  // Require owner, admin, or manager role
  const auth = await requireRole(orgIdentifier, ['owner', 'admin', 'manager']);
  if (!auth) {
    notFound();
  }

  const { orgId } = auth;

  // Check if virtual_queue feature is enabled (Enterprise tier only)
  const hasVirtualQueue = await isFeatureEnabled(orgId, 'virtual_queue');

  // Show upgrade prompt if feature not enabled
  if (!hasVirtualQueue) {
    return (
      <div className="space-y-6">
        <AnimatedPageHeader>
          <h1 className="text-3xl font-bold">Virtual Queue</h1>
          <p className="text-muted-foreground">Manage virtual queues for your attractions.</p>
        </AnimatedPageHeader>
        <UpgradePrompt
          feature="Virtual Queue"
          description="Manage guest lines with virtual queuing, real-time position tracking, and SMS notifications."
          requiredTier="enterprise"
        />
      </div>
    );
  }

  // Get the first attraction to show queue stats
  const attractionsResult = await getAttractions(orgId);
  const attractions = attractionsResult.data?.data || [];
  const primaryAttraction = attractions[0];

  let queueConfig: QueueConfig | null = null;
  let queueSummary: QueueEntriesResponse['summary'] | null = null;

  if (primaryAttraction) {
    try {
      const configResult = await getQueueConfig(orgId, primaryAttraction.id);
      queueConfig = configResult.data;

      const entriesResult = await getQueueEntries(orgId, primaryAttraction.id, { limit: 1 });
      queueSummary = entriesResult.data?.summary ?? null;
    } catch {
      // Queue not configured or feature not enabled
    }
  }

  const isActive = queueConfig?.is_active ?? false;
  const isPaused = queueConfig?.is_paused ?? false;

  const getStatusBadge = () => {
    if (!queueConfig) return <Badge variant="secondary">Not Configured</Badge>;
    if (!isActive) return <Badge variant="secondary">Inactive</Badge>;
    if (isPaused)
      return (
        <Badge variant="outline" className="text-amber-600">
          Paused
        </Badge>
      );
    return <Badge className="bg-green-500">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      <AnimatedPageHeader className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Virtual Queue</h1>
          <p className="text-muted-foreground">Manage virtual queues for your attractions.</p>
        </div>
        <div className="flex items-center gap-2">{getStatusBadge()}</div>
      </AnimatedPageHeader>

      {/* Quick Stats */}
      <StaggerContainer className="grid gap-4 md:grid-cols-4" staggerDelay={0.05} delayChildren={0.1}>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Currently Waiting</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueSummary?.totalWaiting ?? '--'}</div>
              <p className="text-xs text-muted-foreground">Guests in queue</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {queueSummary?.avgWaitMinutes != null
                  ? `${Math.round(queueSummary.avgWaitMinutes)} min`
                  : '--'}
              </div>
              <p className="text-xs text-muted-foreground">Current estimate</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Served Today</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queueSummary?.totalServedToday ?? '--'}</div>
              <p className="text-xs text-muted-foreground">Guests processed</p>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Next Batch</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {queueSummary?.nextBatchTime
                  ? new Date(queueSummary.nextBatchTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '--'}
              </div>
              <p className="text-xs text-muted-foreground">Estimated time</p>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Queue Status Banner */}
      {queueConfig && (
        <FadeIn delay={0.15}>
          <Card className={isPaused ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                {isPaused ? (
                  <>
                    <Pause className="h-8 w-8 text-amber-600" />
                    <div>
                      <h3 className="font-semibold">Queue is Paused</h3>
                      <p className="text-sm text-muted-foreground">
                        New guests cannot join. Existing entries are preserved.
                      </p>
                    </div>
                  </>
                ) : isActive ? (
                  <>
                    <Play className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="font-semibold">Queue is Active</h3>
                      <p className="text-sm text-muted-foreground">
                        Accepting new guests. Batch size: {queueConfig.capacity_per_batch} every{' '}
                        {queueConfig.batch_interval_minutes} minutes.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">Queue is Inactive</h3>
                      <p className="text-sm text-muted-foreground">
                        Enable the queue in settings to start accepting guests.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* No Queue Configured */}
      {!queueConfig && primaryAttraction && (
        <FadeIn delay={0.15}>
          <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <div>
                <h3 className="font-semibold">Queue Not Configured</h3>
                <p className="text-sm text-muted-foreground">
                  Set up virtual queue settings for {primaryAttraction.name} to get started.
                </p>
              </div>
              <Link
                href={`/${orgIdentifier}/queue/settings`}
                className="ml-auto text-sm font-medium text-primary hover:underline"
              >
                Configure Queue
              </Link>
            </div>
          </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* No Attractions */}
      {!primaryAttraction && (
        <FadeIn delay={0.15}>
          <Card className="border-dashed">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                <div>
                  <h3 className="font-semibold">No Attractions Found</h3>
                  <p className="text-sm text-muted-foreground">
                    Create an attraction first to enable virtual queue management.
                  </p>
                </div>
                <Link
                  href={`/${orgIdentifier}/attractions`}
                  className="ml-auto text-sm font-medium text-primary hover:underline"
                >
                  Manage Attractions
                </Link>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      )}

      {/* Navigation Cards */}
      <FadeIn delay={0.2}>
        <div className="grid gap-4 md:grid-cols-3">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={`/${orgIdentifier}${item.href}`}>
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
