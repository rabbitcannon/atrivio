'use client';

import { Ghost, Plus } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

// Material Design ease curve
const EASE = [0.4, 0, 0.2, 1] as const;

interface AnimatedAttractionsGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Animated grid wrapper for attraction cards with staggered entrance
 */
export function AnimatedAttractionsGrid({ children, className }: AnimatedAttractionsGridProps) {
  const shouldReduceMotion = useReducedMotion();
  const childArray = React.Children.toArray(children);

  if (shouldReduceMotion) {
    return <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}>{children}</div>;
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
            delayChildren: 0.1,
          },
        },
      }}
      className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className)}
    >
      {childArray.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20, scale: 0.95 },
            visible: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                duration: 0.4,
                ease: EASE,
              },
            },
          }}
          whileHover={{
            y: -4,
            transition: { duration: 0.2, ease: 'easeOut' },
          }}
          className="transition-shadow hover:shadow-lg rounded-lg"
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

interface AnimatedAttractionsEmptyProps {
  orgId: string;
}

/**
 * Animated empty state for attractions page
 */
export function AnimatedAttractionsEmpty({ orgId }: AnimatedAttractionsEmptyProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center">
        <Ghost className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No attractions yet</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by creating your first attraction.
        </p>
        <Button asChild className="mt-4">
          <a href={`/${orgId}/attractions/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Attraction
          </a>
        </Button>
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
            delayChildren: 0.1,
          },
        },
      }}
      className="flex flex-col items-center justify-center rounded-lg border bg-card p-12 text-center"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, scale: 0.5, y: 10 },
          visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 15,
            },
          },
        }}
      >
        <Ghost className="h-12 w-12 text-muted-foreground" />
      </motion.div>
      <motion.h3
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
        }}
        className="mt-4 text-lg font-medium"
      >
        No attractions yet
      </motion.h3>
      <motion.p
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
        }}
        className="mt-1 text-sm text-muted-foreground"
      >
        Get started by creating your first attraction.
      </motion.p>
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
        }}
        className="mt-4"
      >
        <Button asChild>
          <a href={`/${orgId}/attractions/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Attraction
          </a>
        </Button>
      </motion.div>
    </motion.div>
  );
}

interface AnimatedPageHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Animated page header with fade-down effect
 */
export function AnimatedPageHeader({ children, className }: AnimatedPageHeaderProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
