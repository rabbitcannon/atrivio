'use client';

import { ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { ScheduleWeekView } from '@/components/features/scheduling';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Material Design ease curve
const EASE = [0.4, 0, 0.2, 1] as const;

/**
 * Loading skeleton for calendar page
 */
function CalendarPageLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div>
          <Skeleton className="h-9 w-36 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10" />
              <Skeleton className="h-10 w-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Animated page header with back button
 */
function AnimatedPageHeader({
  orgIdentifier,
  shouldReduceMotion,
}: {
  orgIdentifier: string;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return (
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
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex items-center gap-4"
    >
      <Button variant="ghost" size="icon" asChild>
        <Link href={`/${orgIdentifier}/schedule`}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <div>
        <h1 className="text-3xl font-bold">Week View</h1>
        <p className="text-muted-foreground">Visual calendar view of the schedule.</p>
      </div>
    </motion.div>
  );
}

/**
 * Animated content wrapper
 */
function AnimatedContent({
  children,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

export default function CalendarPage() {
  const params = useParams();
  const shouldReduceMotion = useReducedMotion();
  const orgIdentifier = params['orgId'] as string;

  return (
    <div className="space-y-6">
      <AnimatedPageHeader
        orgIdentifier={orgIdentifier}
        shouldReduceMotion={shouldReduceMotion}
      />

      <AnimatedContent shouldReduceMotion={shouldReduceMotion}>
        <Suspense fallback={<CalendarPageLoadingSkeleton />}>
          <ScheduleWeekView orgId={orgIdentifier} orgSlug={orgIdentifier} />
        </Suspense>
      </AnimatedContent>
    </div>
  );
}
