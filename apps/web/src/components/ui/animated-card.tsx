'use client';

import { motion, useReducedMotion } from 'motion/react';
import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface AnimatedCardProps {
  /** Card content */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Enable hover lift effect */
  hoverable?: boolean;
  /** Delay before animation starts (for stagger effects) */
  delay?: number;
}

/**
 * Animated card wrapper with optional hover effects.
 * Wraps children in a motion container with entrance animation.
 */
export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, hoverable = true, delay = 0 }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
      return (
        <div ref={ref} className={className}>
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.4,
          delay,
          ease: [0.4, 0, 0.2, 1],
        }}
        whileHover={
          hoverable
            ? {
                y: -4,
                transition: { duration: 0.2, ease: 'easeOut' },
              }
            : undefined
        }
        className={cn('transition-shadow hover:shadow-lg', className)}
      >
        {children}
      </motion.div>
    );
  }
);
AnimatedCard.displayName = 'AnimatedCard';

interface AnimatedStatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Animated stats card with counter effect for numbers.
 */
export function AnimatedStatCard({
  title,
  value,
  description,
  icon,
  delay = 0,
  className,
}: AnimatedStatCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const cardContent = (
    <>
      <div className="flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
    </>
  );

  if (shouldReduceMotion) {
    return (
      <div
        className={cn('rounded-lg border bg-card p-6 text-card-foreground shadow-sm', className)}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      className={cn(
        'rounded-lg border bg-card p-6 text-card-foreground shadow-sm transition-shadow hover:shadow-lg',
        className
      )}
    >
      {cardContent}
    </motion.div>
  );
}
