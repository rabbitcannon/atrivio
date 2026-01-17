'use client';

import { ArrowLeftRight, Calendar, Clock, Copy, List, Tag, Users } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrg } from '@/hooks/use-org';

// Material Design ease curve
const EASE = [0.4, 0, 0.2, 1] as const;

const NAV_ITEMS = [
  {
    title: 'All Shifts',
    description: 'View and manage all scheduled shifts',
    href: '/schedule/shifts',
    icon: List,
    roles: ['owner', 'admin', 'manager'],
  },
  {
    title: 'Week View',
    description: 'Visual calendar view of the schedule',
    href: '/schedule/calendar',
    icon: Calendar,
    roles: ['owner', 'admin', 'manager'],
  },
  {
    title: 'Templates',
    description: 'Create reusable shift templates',
    href: '/schedule/templates',
    icon: Copy,
    roles: ['owner', 'admin', 'manager'],
  },
  {
    title: 'Staff Availability',
    description: 'View team availability and time-off',
    href: '/schedule/availability',
    icon: Users,
    roles: ['owner', 'admin', 'manager', 'hr', 'actor', 'scanner'],
  },
  {
    title: 'Swap Requests',
    description: 'Review and approve shift swap requests',
    href: '/schedule/swaps',
    icon: ArrowLeftRight,
    roles: ['owner', 'admin', 'manager', 'actor', 'scanner'],
  },
  {
    title: 'Roles',
    description: 'View schedule roles and color coding',
    href: '/schedule/roles',
    icon: Tag,
    roles: ['owner', 'admin', 'manager'],
  },
];

/**
 * Loading skeleton for schedule page
 */
function SchedulePageLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-9 w-32 mb-2" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-56" />
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Animated page header
 */
function AnimatedPageHeader({
  shouldReduceMotion,
}: {
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Schedule</h1>
        <p className="text-muted-foreground">
          Manage staff schedules, shifts, and availability.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      <h1 className="text-3xl font-bold">Schedule</h1>
      <p className="text-muted-foreground">
        Manage staff schedules, shifts, and availability.
      </p>
    </motion.div>
  );
}

/**
 * Animated stats grid with staggered cards
 */
function AnimatedStatsGrid({
  children,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return <div className="grid gap-4 md:grid-cols-4">{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.06,
            delayChildren: 0.1,
          },
        },
      }}
      className="grid gap-4 md:grid-cols-4"
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 12, scale: 0.95 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: 0.3, ease: EASE },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Animated navigation grid with staggered cards
 */
function AnimatedNavGrid({
  children,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.2,
          },
        },
      }}
      className="grid gap-4 md:grid-cols-2"
    >
      {children}
    </motion.div>
  );
}

/**
 * Animated navigation card
 */
function AnimatedNavCard({
  children,
  href,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  href: string;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return (
      <Link href={href}>
        <Card className="transition-colors hover:bg-muted/50 cursor-pointer h-full">
          {children}
        </Card>
      </Link>
    );
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: EASE },
        },
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
    >
      <Link href={href}>
        <Card className="transition-colors hover:bg-muted/50 cursor-pointer h-full">
          {children}
        </Card>
      </Link>
    </motion.div>
  );
}

export default function SchedulePage() {
  const params = useParams();
  const shouldReduceMotion = useReducedMotion();
  const orgIdentifier = params['orgId'] as string;
  const { currentOrg } = useOrg();

  // Filter nav items based on user's role
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => currentOrg?.role && item.roles.includes(currentOrg.role)
  );

  return (
    <div className="space-y-6">
      <AnimatedPageHeader shouldReduceMotion={shouldReduceMotion} />

      {/* Quick Stats */}
      <AnimatedStatsGrid shouldReduceMotion={shouldReduceMotion}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Scheduled shifts</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Shifts need coverage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <Copy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Active templates</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Scheduled this week</p>
          </CardContent>
        </Card>
      </AnimatedStatsGrid>

      {/* Navigation Cards */}
      <AnimatedNavGrid shouldReduceMotion={shouldReduceMotion}>
        {visibleNavItems.map((item) => (
          <AnimatedNavCard
            key={item.href}
            href={`/${orgIdentifier}${item.href}`}
            shouldReduceMotion={shouldReduceMotion}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <item.icon className="h-5 w-5" />
                {item.title}
              </CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
          </AnimatedNavCard>
        ))}
      </AnimatedNavGrid>
    </div>
  );
}
