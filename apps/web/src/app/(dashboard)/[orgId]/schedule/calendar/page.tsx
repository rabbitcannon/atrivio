import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScheduleWeekView } from '@/components/features/scheduling';
import { resolveOrgId } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Schedule Calendar',
};

interface CalendarPageProps {
  params: Promise<{ orgId: string }>;
}

export default async function CalendarPage({ params }: CalendarPageProps) {
  const { orgId: orgIdentifier } = await params;

  const orgId = await resolveOrgId(orgIdentifier);
  if (!orgId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/${orgIdentifier}/schedule`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Week View</h1>
          <p className="text-muted-foreground">Visual calendar view of the schedule.</p>
        </div>
      </div>

      <ScheduleWeekView orgId={orgId} orgSlug={orgIdentifier} />
    </div>
  );
}
