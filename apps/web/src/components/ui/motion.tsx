'use client';

/**
 * Motion Components
 *
 * Pre-configured motion components for common UI patterns.
 * These components respect user's reduced motion preference.
 *
 * Usage:
 * - MotionDiv: General animated container
 * - MotionCard: Animated card with hover effects
 * - MotionList: Staggered list animation
 * - MotionPage: Page transition wrapper
 * - FadeIn: Simple fade-in wrapper
 * - StaggerContainer/StaggerItem: Grid/list animations
 */

import type { HTMLMotionProps, Variants } from 'motion/react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import * as React from 'react';
import {
  cardHover,
  fadeUpVariants,
  fadeVariants,
  pageTransitionVariants,
  scaleVariants,
  slideLeftVariants,
  slideRightVariants,
  staggerItemVariants,
  transitions,
} from '@/lib/motion';
import { cn } from '@/lib/utils/cn';

// ============================================================================
// MOTION DIV (General Purpose)
// ============================================================================

export interface MotionDivProps extends HTMLMotionProps<'div'> {
  /** Animation variant to use */
  variant?: 'fade' | 'fadeUp' | 'scale' | 'slideLeft' | 'slideRight';
  /** Delay before animation starts (in seconds) */
  delay?: number;
}

const variantMap: Record<string, Variants> = {
  fade: fadeVariants,
  fadeUp: fadeUpVariants,
  scale: scaleVariants,
  slideLeft: slideLeftVariants,
  slideRight: slideRightVariants,
};

export const MotionDiv = React.forwardRef<HTMLDivElement, MotionDivProps>(
  ({ variant = 'fade', delay = 0, className, children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
      return (
        <div ref={ref} className={className}>
          {children as React.ReactNode}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        variants={variantMap[variant]}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ ...transitions.smooth, delay }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionDiv.displayName = 'MotionDiv';

// ============================================================================
// MOTION CARD (Interactive Card with Hover Effects)
// ============================================================================

export interface MotionCardProps extends HTMLMotionProps<'div'> {
  /** Disable hover effects */
  disableHover?: boolean;
}

export const MotionCard = React.forwardRef<HTMLDivElement, MotionCardProps>(
  ({ disableHover = false, className, children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
      return (
        <div
          ref={ref}
          className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
        >
          {children as React.ReactNode}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        variants={fadeUpVariants}
        initial="hidden"
        animate="visible"
        {...(!disableHover && cardHover)}
        className={cn(
          'rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow',
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionCard.displayName = 'MotionCard';

// ============================================================================
// MOTION LIST (Staggered List Animation)
// ============================================================================

export interface MotionListProps extends HTMLMotionProps<'ul'> {
  /** Stagger delay between items (in seconds) */
  staggerDelay?: number;
}

export const MotionList = React.forwardRef<HTMLUListElement, MotionListProps>(
  ({ staggerDelay = 0.05, className, children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
      return (
        <ul ref={ref} className={className}>
          {children as React.ReactNode}
        </ul>
      );
    }

    return (
      <motion.ul
        ref={ref}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
              delayChildren: 0.1,
            },
          },
        }}
        initial="hidden"
        animate="visible"
        className={className}
        {...props}
      >
        {children}
      </motion.ul>
    );
  }
);
MotionList.displayName = 'MotionList';

export interface MotionListItemProps extends HTMLMotionProps<'li'> {}

export const MotionListItem = React.forwardRef<HTMLLIElement, MotionListItemProps>(
  ({ className, children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
      return (
        <li ref={ref} className={className}>
          {children as React.ReactNode}
        </li>
      );
    }

    return (
      <motion.li ref={ref} variants={staggerItemVariants} className={className} {...props}>
        {children}
      </motion.li>
    );
  }
);
MotionListItem.displayName = 'MotionListItem';

// ============================================================================
// MOTION PAGE (Page Transition Wrapper)
// ============================================================================

export interface MotionPageProps extends HTMLMotionProps<'div'> {}

export const MotionPage = React.forwardRef<HTMLDivElement, MotionPageProps>(
  ({ className, children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
      return (
        <div ref={ref} className={className}>
          {children as React.ReactNode}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        variants={pageTransitionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
MotionPage.displayName = 'MotionPage';

// ============================================================================
// FADE IN (Simple Fade Animation)
// ============================================================================

export interface FadeInProps {
  children: React.ReactNode;
  /** Delay before fade starts (in seconds) */
  delay?: number;
  /** Duration of fade (in seconds) */
  duration?: number;
  /** Direction to fade from */
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  /** Distance to travel (in pixels) */
  distance?: number;
  /** Additional class names */
  className?: string;
}

export const FadeIn = React.forwardRef<HTMLDivElement, FadeInProps>(
  ({ children, delay = 0, duration = 0.3, direction = 'up', distance = 20, className }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
      return (
        <div ref={ref} className={className}>
          {children}
        </div>
      );
    }

    const getInitialOffset = () => {
      switch (direction) {
        case 'up':
          return { y: distance };
        case 'down':
          return { y: -distance };
        case 'left':
          return { x: distance };
        case 'right':
          return { x: -distance };
        default:
          return {};
      }
    };

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, ...getInitialOffset() }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration, delay, ease: [0.4, 0, 0.2, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }
);
FadeIn.displayName = 'FadeIn';

// ============================================================================
// STAGGER CONTAINER (For Grid/List Animations)
// ============================================================================

export interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  /** Delay between each child animation */
  staggerDelay?: number;
  /** Initial delay before animations start */
  delayChildren?: number;
}

export const StaggerContainer = React.forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ staggerDelay = 0.1, delayChildren = 0, className, children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
      return (
        <div ref={ref} className={className}>
          {children as React.ReactNode}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
              delayChildren,
            },
          },
        }}
        initial="hidden"
        animate="visible"
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);
StaggerContainer.displayName = 'StaggerContainer';

export interface StaggerItemProps extends HTMLMotionProps<'div'> {}

export const StaggerItem = React.forwardRef<HTMLDivElement, StaggerItemProps>(
  ({ className, children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
      return (
        <div ref={ref} className={className}>
          {children as React.ReactNode}
        </div>
      );
    }

    return (
      <motion.div ref={ref} variants={staggerItemVariants} className={className} {...props}>
        {children}
      </motion.div>
    );
  }
);
StaggerItem.displayName = 'StaggerItem';

// ============================================================================
// RE-EXPORT MOTION PRIMITIVES
// ============================================================================

export { motion, AnimatePresence, useReducedMotion };
