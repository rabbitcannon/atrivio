'use client';

import { ArrowLeft } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Suspense } from 'react';
import { ScheduleTable } from '@/components/features/scheduling';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Material Design ease curve
const EASE = [0.4, 0, 0.2, 1] as const;

/**
 * Loading skeleton for shifts page
 */
function ShiftsPageLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
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
          <h1 className="text-3xl font-bold">All Shifts</h1>
          <p className="text-muted-foreground">View and manage all scheduled shifts.</p>
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
        <h1 className="text-3xl font-bold">All Shifts</h1>
        <p className="text-muted-foreground">View and manage all scheduled shifts.</p>
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

export default function ShiftsPage() {
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
        <Suspense fallback={<ShiftsPageLoadingSkeleton />}>
          <ScheduleTable orgId={orgIdentifier} orgSlug={orgIdentifier} />
        </Suspense>
      </AnimatedContent>
    </div>
  );
}
