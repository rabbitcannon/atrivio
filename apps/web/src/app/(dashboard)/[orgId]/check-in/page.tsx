'use client';

import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Gauge,
  Loader2,
  MonitorSmartphone,
  QrCode,
  Users,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useOrg } from '@/hooks/use-org';
import { getAttractions, getCapacity, getCheckInQueue, getCheckInStats } from '@/lib/api/client';
import type {
  AttractionListItem,
  CapacityResponse,
  CheckInStats,
  QueueResponse,
} from '@/lib/api/types';

// Material Design ease curve
const EASE = [0.4, 0, 0.2, 1] as const;

/**
 * Loading skeleton for check-in page
 */
function CheckInPageLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-full sm:w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
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
  children,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      {children}
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

/**
 * Animated info card at the bottom
 */
function AnimatedInfoCard({
  children,
  shouldReduceMotion,
}: {
  children: React.ReactNode;
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return <Card>{children}</Card>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.4 }}
    >
      <Card>{children}</Card>
    </motion.div>
  );
}

/**
 * Animated empty state
 */
function AnimatedEmptyState({
  shouldReduceMotion,
}: {
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Check-In</h1>
          <p className="text-muted-foreground">
            Manage guest check-ins, stations, and monitor capacity.
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Attractions Found</h3>
            <p className="text-muted-foreground text-center">
              Create an attraction first to start using check-in features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <h1 className="text-3xl font-bold">Check-In</h1>
        <p className="text-muted-foreground">
          Manage guest check-ins, stations, and monitor capacity.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE, delay: 0.1 }}
      >
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 15,
                delay: 0.2,
              }}
            >
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE, delay: 0.3 }}
              className="text-lg font-medium mb-2"
            >
              No Attractions Found
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE, delay: 0.4 }}
              className="text-muted-foreground text-center"
            >
              Create an attraction first to start using check-in features.
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

const NAV_ITEMS = [
  {
    title: 'Scan Tickets',
    description: 'Scan barcodes or QR codes to check in guests',
    href: '/check-in/scan',
    icon: QrCode,
    roles: ['owner', 'admin', 'manager', 'scanner'],
  },
  {
    title: 'Stations',
    description: 'Manage check-in stations and devices',
    href: '/check-in/stations',
    icon: MonitorSmartphone,
    roles: ['owner', 'admin', 'manager'],
  },
  {
    title: 'Queue',
    description: 'View pending arrivals and late guests',
    href: '/check-in/queue',
    icon: Clock,
    roles: ['owner', 'admin', 'manager', 'scanner'],
  },
  {
    title: 'Reports',
    description: 'Check-in statistics and analytics',
    href: '/check-in/reports',
    icon: Activity,
    roles: ['owner', 'admin', 'manager'],
  },
];

export default function CheckInPage() {
  const params = useParams();
  const shouldReduceMotion = useReducedMotion();
  const orgIdentifier = params['orgId'] as string;
  const { currentOrg } = useOrg();

  // Filter nav items based on user's role
  const visibleNavItems = NAV_ITEMS.filter(
    (item) => currentOrg?.role && item.roles.includes(currentOrg.role)
  );

  const [attractions, setAttractions] = useState<AttractionListItem[]>([]);
  const [selectedAttractionId, setSelectedAttractionId] = useState<string | null>(null);
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [capacity, setCapacity] = useState<CapacityResponse | null>(null);
  const [queue, setQueue] = useState<QueueResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Load attractions on mount
  useEffect(() => {
    async function loadAttractions() {
      setIsLoading(true);
      try {
        const result = await getAttractions(orgIdentifier);
        if (result.data?.data) {
          setAttractions(result.data.data);
          // Auto-select first attraction or retrieve from localStorage
          const savedAttractionId = localStorage.getItem(`check-in-attraction-${orgIdentifier}`);
          const defaultAttraction =
            result.data.data.find((a) => a.id === savedAttractionId) || result.data.data[0];
          if (defaultAttraction) {
            setSelectedAttractionId(defaultAttraction.id);
          }
        }
      } catch (_error) {
      } finally {
        setIsLoading(false);
      }
    }
    loadAttractions();
  }, [orgIdentifier]);

  // Load stats when attraction changes
  useEffect(() => {
    if (!selectedAttractionId) return;

    // Save selection to localStorage
    localStorage.setItem(`check-in-attraction-${orgIdentifier}`, selectedAttractionId);

    async function loadStats() {
      setIsLoadingStats(true);
      try {
        const [statsResult, capacityResult, queueResult] = await Promise.all([
          getCheckInStats(orgIdentifier, selectedAttractionId!),
          getCapacity(orgIdentifier, selectedAttractionId!),
          getCheckInQueue(orgIdentifier, selectedAttractionId!),
        ]);

        if (statsResult.data) setStats(statsResult.data);
        if (capacityResult.data) setCapacity(capacityResult.data);
        if (queueResult.data) setQueue(queueResult.data);
      } catch (_error) {
      } finally {
        setIsLoadingStats(false);
      }
    }
    loadStats();
  }, [orgIdentifier, selectedAttractionId]);

  const handleAttractionChange = (attractionId: string) => {
    setSelectedAttractionId(attractionId);
  };

  const selectedAttraction = attractions.find((a) => a.id === selectedAttractionId);

  if (isLoading) {
    return <CheckInPageLoadingSkeleton />;
  }

  if (attractions.length === 0) {
    return <AnimatedEmptyState shouldReduceMotion={shouldReduceMotion} />;
  }

  const lateCount = queue?.late.length ?? 0;
  const pendingCount = queue?.pending.length ?? 0;

  return (
    <div className="space-y-6">
      <AnimatedPageHeader shouldReduceMotion={shouldReduceMotion}>
        <div>
          <h1 className="text-3xl font-bold">Check-In</h1>
          <p className="text-muted-foreground">
            Manage guest check-ins, stations, and monitor capacity.
          </p>
        </div>
        <div className="w-full sm:w-64">
          <Select value={selectedAttractionId ?? ''} onValueChange={handleAttractionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select attraction" />
            </SelectTrigger>
            <SelectContent>
              {attractions.map((attraction) => (
                <SelectItem key={attraction.id} value={attraction.id}>
                  {attraction.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </AnimatedPageHeader>

      {/* Quick Stats */}
      <AnimatedStatsGrid shouldReduceMotion={shouldReduceMotion}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Checked In Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                (stats?.totalCheckedIn ?? '--')
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              of {stats?.totalExpected ?? '--'} expected
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Capacity</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : capacity ? (
                `${capacity.percentage}%`
              ) : (
                '--%'
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {capacity ? `${capacity.currentCount} / ${capacity.capacity}` : 'Of max capacity'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Arrivals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : pendingCount}
            </div>
            <p className="text-xs text-muted-foreground">Expected soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingStats ? <Loader2 className="h-5 w-5 animate-spin" /> : lateCount}
            </div>
            <p className="text-xs text-muted-foreground">Past their slot</p>
          </CardContent>
        </Card>
      </AnimatedStatsGrid>

      {/* Navigation Cards */}
      <AnimatedNavGrid shouldReduceMotion={shouldReduceMotion}>
        {visibleNavItems.map((item) => (
          <AnimatedNavCard
            key={item.href}
            href={`/${orgIdentifier}${item.href}?attractionId=${selectedAttractionId}`}
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

      {/* Current Attraction Info */}
      {selectedAttraction && (
        <AnimatedInfoCard shouldReduceMotion={shouldReduceMotion}>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Currently viewing: {selectedAttraction.name}
            </CardTitle>
            <CardDescription>
              {selectedAttraction.type_name || selectedAttraction.type}
            </CardDescription>
          </CardHeader>
        </AnimatedInfoCard>
      )}
    </div>
  );
}
