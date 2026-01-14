import { Calendar, CalendarDays, Clock, RefreshCw } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnimatedPageHeader } from '@/components/features/attractions';
import { UpgradePrompt } from '@/components/features/upgrade-prompt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FadeIn } from '@/components/ui/motion';
import { isFeatureEnabled, requireRole } from '@/lib/api';

export const metadata: Metadata = {
  title: 'My Schedule',
};

interface MySchedulePageProps {
  params: Promise<{ orgId: string }>;
}

export default async function MySchedulePage({ params }: MySchedulePageProps) {
  const { orgId: orgIdentifier } = await params;

  // Require any authenticated membership (using actor role as minimum)
  const auth = await requireRole(orgIdentifier, ['owner', 'admin', 'manager', 'hr', 'box_office', 'finance', 'actor', 'scanner']);
  if (!auth) {
    notFound();
  }

  const { orgId } = auth;

  // Check if scheduling feature is enabled (Pro tier)
  const hasScheduling = await isFeatureEnabled(orgId, 'scheduling');

  // Show upgrade prompt if feature not enabled
  if (!hasScheduling) {
    return (
      <div className="space-y-6">
        <AnimatedPageHeader>
          <h1 className="text-3xl font-bold">My Schedule</h1>
          <p className="text-muted-foreground">View your upcoming shifts and schedule.</p>
        </AnimatedPageHeader>
        <UpgradePrompt
          feature="Scheduling"
          description="View your assigned shifts, request time off, and manage your availability all in one place."
          requiredTier="pro"
        />
      </div>
    );
  }

  // Feature is enabled - show the schedule UI
  return (
    <div className="space-y-6">
      <AnimatedPageHeader>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Schedule</h1>
            <p className="text-muted-foreground">View your upcoming shifts and schedule.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${orgIdentifier}/schedule/availability`}>
                <Clock className="h-4 w-4 mr-2" />
                Set Availability
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/${orgIdentifier}/schedule/swaps`}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Swap Requests
              </Link>
            </Button>
          </div>
        </div>
      </AnimatedPageHeader>

      {/* Empty State - No shifts scheduled yet */}
      <FadeIn delay={0.1}>
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              No Upcoming Shifts
            </CardTitle>
            <CardDescription>
              You don&apos;t have any shifts scheduled. Check with your manager for upcoming schedules.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${orgIdentifier}/schedule`}>
                  <CalendarDays className="h-4 w-4 mr-2" />
                  View Full Schedule
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${orgIdentifier}/schedule/availability`}>
                  <Clock className="h-4 w-4 mr-2" />
                  Update Availability
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </FadeIn>

      {/* Quick Stats */}
      <FadeIn delay={0.15}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Shifts</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">0h</div>
                <div className="text-sm text-muted-foreground">Scheduled Hours</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Pending Swaps</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </FadeIn>
    </div>
  );
}
