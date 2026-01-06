'use client';

import * as React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

interface StatItem {
  title: string;
  value: string;
  description: string;
  /** Pre-rendered icon element (render in server component before passing) */
  icon: React.ReactNode;
}

interface AnimatedDashboardHeaderProps {
  title: string;
  subtitle: string;
}

/**
 * Animated dashboard header with title and subtitle
 */
export function AnimatedDashboardHeader({ title, subtitle }: AnimatedDashboardHeaderProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div>
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="text-muted-foreground">{subtitle}</p>
    </motion.div>
  );
}

interface AnimatedStatsGridProps {
  stats: StatItem[];
}

/**
 * Animated stats grid with staggered card animations
 */
export function AnimatedStatsGrid({ stats }: AnimatedStatsGridProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="text-muted-foreground">{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
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
            staggerChildren: 0.1,
            delayChildren: 0.2,
          },
        },
      }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.title}
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
              },
            },
          }}
          whileHover={{
            y: -4,
            transition: { duration: 0.2, ease: 'easeOut' },
          }}
          className="transition-shadow hover:shadow-lg"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className="text-muted-foreground">{stat.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

interface AnimatedCardGridProps {
  children: React.ReactNode;
  className?: string;
  baseDelay?: number;
}

/**
 * Animated grid that staggers its children
 */
export function AnimatedCardGrid({
  children,
  className,
  baseDelay = 0.4,
}: AnimatedCardGridProps) {
  const shouldReduceMotion = useReducedMotion();
  const childArray = React.Children.toArray(children);

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
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
            staggerChildren: 0.15,
            delayChildren: baseDelay,
          },
        },
      }}
      className={className}
    >
      {childArray.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.4,
                ease: [0.4, 0, 0.2, 1],
              },
            },
          }}
          whileHover={{
            y: -2,
            transition: { duration: 0.2, ease: 'easeOut' },
          }}
          className="transition-shadow hover:shadow-md"
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

interface AnimatedQuickLinkProps {
  href: string;
  /** Pre-rendered icon element (render in server component before passing) */
  icon: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Animated quick link with hover effect
 */
export function AnimatedQuickLink({ href, icon, children }: AnimatedQuickLinkProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <a
        href={href}
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
      >
        {icon}
        {children}
      </a>
    );
  }

  return (
    <motion.a
      href={href}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {icon}
      {children}
    </motion.a>
  );
}

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Simple fade-in container for page content
 */
export function AnimatedContainer({ children, className }: AnimatedContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={cn('space-y-6', className)}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('space-y-6', className)}
    >
      {children}
    </motion.div>
  );
}
