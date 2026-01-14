'use client';

import {
  Clock,
  DollarSign,
  Package,
  Percent,
  ShoppingCart,
  Tag,
  Ticket,
  TrendingUp,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TicketPreview } from '@/components/features/ticketing';
import { apiClientDirect as apiClient, resolveOrgId, getAnalyticsDashboard } from '@/lib/api/client';
import type { TimeSeriesDataPoint } from '@/lib/api/types';

// Dynamically import chart to avoid SSR issues
const SparkLineChart = dynamic(
  () => import('@mui/x-charts/SparkLineChart').then((m) => m.SparkLineChart),
  { ssr: false, loading: () => <Skeleton className="h-16 w-full" /> }
);

interface TicketingStats {
  todaysSales: number;
  weeklyRevenue: number;
  activeTicketTypes: number;
  activePromos: number;
  revenueChart: TimeSeriesDataPoint[];
}

// Material Design ease curve
const EASE = [0.4, 0, 0.2, 1] as const;

const NAV_ITEMS = [
  {
    title: 'Ticket Types',
    description: 'Configure ticket types, pricing, and availability',
    href: '/ticketing/types',
    icon: Ticket,
  },
  {
    title: 'Time Slots',
    description: 'Manage timed entry slots and capacity',
    href: '/ticketing/slots',
    icon: Clock,
  },
  {
    title: 'Orders',
    description: 'View and manage ticket orders',
    href: '/ticketing/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Promo Codes',
    description: 'Create and manage promotional codes',
    href: '/ticketing/promo-codes',
    icon: Percent,
  },
];

/**
 * Loading skeleton for ticketing page
 */
function TicketingPageLoadingSkeleton() {
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
  shouldReduceMotion,
}: {
  shouldReduceMotion: boolean | null;
}) {
  if (shouldReduceMotion) {
    return (
      <div>
        <h1 className="text-3xl font-bold">Ticketing</h1>
        <p className="text-muted-foreground">
          Manage ticket types, time slots, orders, and promotions.
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
      <h1 className="text-3xl font-bold">Ticketing</h1>
      <p className="text-muted-foreground">
        Manage ticket types, time slots, orders, and promotions.
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

/**
 * Format cents to dollars
 */
function formatMoney(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

const DIGIT_HEIGHT_PX = 32;

/**
 * Single scrolling digit - rolls through 0→target like an odometer
 */
function ScrollingDigit({
  digit,
  delay = 0,
  duration = 1,
}: {
  digit: string;
  delay?: number;
  duration?: number;
}) {
  const isNumber = /\d/.test(digit);
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  // Non-digits (commas, $, %, etc.) - render inline with same height for alignment
  if (!isNumber) {
    return (
      <span
        className="inline-flex items-center justify-center"
        style={{ height: DIGIT_HEIGHT_PX }}
      >
        {digit}
      </span>
    );
  }

  const targetDigit = parseInt(digit, 10);
  const scrollDistance = targetDigit * DIGIT_HEIGHT_PX;
  const animDuration = duration * (0.4 + targetDigit * 0.1);

  return (
    <span
      className="relative inline-block overflow-hidden align-bottom"
      style={{ width: '0.65em', height: DIGIT_HEIGHT_PX }}
    >
      <motion.div
        className="absolute left-0 right-0 flex flex-col items-center"
        animate={{ y: shouldAnimate ? -scrollDistance : 0 }}
        transition={{
          duration: animDuration,
          ease: [0.33, 1, 0.68, 1],
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <span
            key={num}
            className="flex items-center justify-center leading-none"
            style={{ height: DIGIT_HEIGHT_PX }}
          >
            {num}
          </span>
        ))}
      </motion.div>
    </span>
  );
}

/**
 * Animated stat value with odometer/slot machine effect
 */
function AnimatedStatValue({
  value,
  format = 'number',
}: {
  value: number;
  format?: 'number' | 'money';
}) {
  const shouldReduceMotion = useReducedMotion();
  const formatFn = format === 'money' ? formatMoney : (v: number) => Math.round(v).toLocaleString();
  const formattedValue = formatFn(value);
  const characters = formattedValue.split('');

  if (shouldReduceMotion) {
    return <span>{formattedValue}</span>;
  }

  return (
    <span
      className="inline-flex items-center tabular-nums"
      style={{ height: DIGIT_HEIGHT_PX }}
    >
      {characters.map((char, index) => (
        <ScrollingDigit
          key={`${index}-${char}`}
          digit={char}
          delay={0.2 + index * 0.06}
          duration={1.2}
        />
      ))}
    </span>
  );
}

/**
 * Stat card with loading state and animated value
 */
function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  isLoading,
  format = 'number',
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  isLoading: boolean;
  format?: 'number' | 'money';
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">
              <AnimatedStatValue value={value} format={format} />
            </div>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function TicketingPage() {
  const params = useParams();
  const shouldReduceMotion = useReducedMotion();
  const orgIdentifier = params['orgId'] as string;

  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<TicketingStats>({
    todaysSales: 0,
    weeklyRevenue: 0,
    activeTicketTypes: 0,
    activePromos: 0,
    revenueChart: [],
  });

  const loadStats = useCallback(async (orgId: string) => {
    try {
      // Fetch all stats in parallel
      const [ticketTypes, promoCodes, todayResponse, weekResponse] = await Promise.all([
        apiClient.get<{ id: string; is_active: boolean }[]>(
          `/organizations/${orgId}/ticket-types`
        ).catch(() => []),
        apiClient.get<{ id: string; is_active: boolean }[]>(
          `/organizations/${orgId}/promo-codes`
        ).catch(() => []),
        getAnalyticsDashboard(orgId, { period: 'today' }).catch(() => null),
        getAnalyticsDashboard(orgId, { period: 'week' }).catch(() => null),
      ]);

      setStats({
        todaysSales: todayResponse?.data?.summary?.ticketsSold ?? 0,
        weeklyRevenue: weekResponse?.data?.summary?.grossRevenue ?? 0,
        activeTicketTypes: Array.isArray(ticketTypes)
          ? ticketTypes.filter((t) => t.is_active).length
          : 0,
        activePromos: Array.isArray(promoCodes)
          ? promoCodes.filter((p) => p.is_active).length
          : 0,
        revenueChart: weekResponse?.data?.revenueChart ?? [],
      });
    } catch {
      // Stats remain at 0 on error
    }
  }, []);

  useEffect(() => {
    async function init() {
      const orgId = await resolveOrgId(orgIdentifier);
      if (orgId) {
        await loadStats(orgId);
      }
      setIsLoading(false);
    }
    init();
  }, [orgIdentifier, loadStats]);

  return (
    <div className="space-y-6">
      <AnimatedPageHeader shouldReduceMotion={shouldReduceMotion} />

      {/* Quick Stats */}
      <AnimatedStatsGrid shouldReduceMotion={shouldReduceMotion}>
        <StatCard
          title="Today's Sales"
          value={stats.todaysSales}
          subtitle="Tickets sold today"
          icon={DollarSign}
          isLoading={isLoading}
        />
        <StatCard
          title="Revenue"
          value={stats.weeklyRevenue}
          subtitle="This week"
          icon={TrendingUp}
          isLoading={isLoading}
          format="money"
        />
        <StatCard
          title="Ticket Types"
          value={stats.activeTicketTypes}
          subtitle="Active types"
          icon={Package}
          isLoading={isLoading}
        />
        <StatCard
          title="Active Promos"
          value={stats.activePromos}
          subtitle="Promo codes"
          icon={Tag}
          isLoading={isLoading}
        />
      </AnimatedStatsGrid>

      {/* Revenue Trend Sparkline */}
      {!isLoading && stats.revenueChart.length > 0 && (
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE, delay: 0.25 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Revenue Trend
              </CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <SparkLineChart
                data={stats.revenueChart.map((d) => d.value / 100)}
                height={60}
                curve="natural"
                area
                showHighlight
                showTooltip
                color="#22c55e"
                sx={{
                  '.MuiLineElement-root': { strokeWidth: 2 },
                  '.MuiAreaElement-root': { fillOpacity: 0.15 },
                }}
              />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Navigation Cards */}
      <AnimatedNavGrid shouldReduceMotion={shouldReduceMotion}>
        {NAV_ITEMS.map((item) => (
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

      {/* Sample Ticket Preview */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE, delay: 0.35 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Sample Ticket Preview
            </CardTitle>
            <CardDescription>
              This is how your tickets will appear to customers
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg py-8">
            <TicketPreview animate={!shouldReduceMotion} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
