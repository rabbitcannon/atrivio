import { ArrowLeft, Bell, Clock, UserCheck, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { QueueEntryRow } from '@/components/features/queue/queue-entry-row';
import { QueueManageActions } from '@/components/features/queue/queue-manage-actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getAttractions, getQueueConfig, getQueueEntries, resolveOrgId } from '@/lib/api';
import type {
  QueueConfig,
  QueueEntriesResponse,
  QueueEntry,
  QueueEntryStatus,
} from '@/lib/api/types';

export const metadata: Metadata = {
  title: 'Manage Queue',
};

interface ManageQueuePageProps {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ status?: string; search?: string }>;
}

export default async function ManageQueuePage({ params, searchParams }: ManageQueuePageProps) {
  const { orgId: orgIdentifier } = await params;
  const { status: statusFilter } = await searchParams;

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
  let entries: QueueEntry[] = [];
  let summary: QueueEntriesResponse['summary'] | null = null;

  try {
    const configResult = await getQueueConfig(orgId, primaryAttraction.id);
    queueConfig = configResult.data;

    // Only pass status if it's a valid QueueEntryStatus
    const validStatuses: QueueEntryStatus[] = [
      'waiting',
      'notified',
      'called',
      'checked_in',
      'expired',
      'left',
      'no_show',
    ];
    const status =
      statusFilter && validStatuses.includes(statusFilter as QueueEntryStatus)
        ? (statusFilter as QueueEntryStatus)
        : undefined;

    const entriesResult = await getQueueEntries(orgId, primaryAttraction.id, {
      ...(status ? { status } : {}),
      limit: 50,
    });
    entries = entriesResult.data?.data || [];
    summary = entriesResult.data?.summary ?? null;
  } catch {
    // Queue not configured
  }

  const waitingCount = entries.filter((e) => e.status === 'waiting').length;
  const calledCount = entries.filter(
    (e) => e.status === 'called' || e.status === 'notified'
  ).length;

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
            <h1 className="text-3xl font-bold">Manage Queue</h1>
            <p className="text-muted-foreground">{primaryAttraction.name}</p>
          </div>
        </div>
        <QueueManageActions
          orgId={orgId}
          attractionId={primaryAttraction.id}
          isActive={queueConfig?.is_active ?? false}
          waitingCount={summary?.totalWaiting ?? waitingCount}
          capacityPerBatch={queueConfig?.capacity_per_batch ?? 10}
        />
      </AnimatedPageHeader>

      {/* Summary Cards */}
      <StaggerContainer className="grid gap-4 md:grid-cols-4" staggerDelay={0.05} delayChildren={0.1}>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Waiting</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalWaiting ?? waitingCount}</div>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Called/Notified</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{calledCount}</div>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Wait</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary?.avgWaitMinutes != null ? `${Math.round(summary.avgWaitMinutes)} min` : '--'}
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Served Today</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.totalServedToday ?? '--'}</div>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Filter Tabs */}
      <FadeIn delay={0.15}>
        <div className="flex gap-2 border-b pb-4">
          <Link href={`/${orgIdentifier}/queue/manage`}>
            <Button variant={!statusFilter ? 'default' : 'ghost'} size="sm">
              All
            </Button>
          </Link>
          <Link href={`/${orgIdentifier}/queue/manage?status=waiting`}>
            <Button variant={statusFilter === 'waiting' ? 'default' : 'ghost'} size="sm">
              Waiting
            </Button>
          </Link>
          <Link href={`/${orgIdentifier}/queue/manage?status=called`}>
            <Button variant={statusFilter === 'called' ? 'default' : 'ghost'} size="sm">
              Called
            </Button>
          </Link>
          <Link href={`/${orgIdentifier}/queue/manage?status=checked_in`}>
            <Button variant={statusFilter === 'checked_in' ? 'default' : 'ghost'} size="sm">
              Checked In
            </Button>
          </Link>
          <Link href={`/${orgIdentifier}/queue/manage?status=expired`}>
            <Button variant={statusFilter === 'expired' ? 'default' : 'ghost'} size="sm">
              Expired
            </Button>
          </Link>
        </div>
      </FadeIn>

      {/* Queue Entries Table */}
      <FadeIn delay={0.2}>
        <Card>
          <CardHeader>
            <CardTitle>Queue Entries</CardTitle>
            <CardDescription>
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No queue entries found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Position</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Party</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Wait Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <QueueEntryRow
                      key={entry.id}
                      entry={entry}
                      orgId={orgId}
                      attractionId={primaryAttraction.id}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
