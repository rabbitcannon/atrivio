'use client';

import { AnimatePresence, motion, useReducedMotion, useSpring, useTransform } from 'motion/react';
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

// Material Design ease curve
const EASE = [0.4, 0, 0.2, 1] as const;

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
export function AnimatedCardGrid({ children, className, baseDelay = 0.4 }: AnimatedCardGridProps) {
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

// ============================================================================
// ANIMATED NUMBER (Counter Animation)
// ============================================================================

interface AnimatedNumberProps {
  /** The target number to animate to */
  value: number;
  /** Duration of animation in seconds */
  duration?: number;
  /** Formatting function (e.g., for currency) */
  formatFn?: (value: number) => string;
  /** Additional class names */
  className?: string;
}

/**
 * Animated number counter that animates from 0 to the target value
 */
export function AnimatedNumber({
  value,
  duration = 1,
  formatFn = (v) => Math.round(v).toLocaleString(),
  className,
}: AnimatedNumberProps) {
  const shouldReduceMotion = useReducedMotion();
  const spring = useSpring(0, { duration: duration * 1000 });
  const display = useTransform(spring, (current) => formatFn(current));
  const [displayValue, setDisplayValue] = React.useState(formatFn(0));

  React.useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(formatFn(value));
      return;
    }
    spring.set(value);
  }, [value, spring, shouldReduceMotion, formatFn]);

  React.useEffect(() => {
    if (shouldReduceMotion) return;
    const unsubscribe = display.on('change', (v) => setDisplayValue(v));
    return () => unsubscribe();
  }, [display, shouldReduceMotion]);

  return <span className={className}>{displayValue}</span>;
}

// ============================================================================
// ANIMATED WIDGET (Widget Card with Entrance Animation)
// ============================================================================

interface AnimatedWidgetProps {
  children: React.ReactNode;
  /** Delay before animation starts (in seconds) */
  delay?: number;
  /** Direction the widget animates from */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Additional class names */
  className?: string;
}

/**
 * Animated widget wrapper for dashboard widget cards
 */
export function AnimatedWidget({
  children,
  delay = 0,
  direction = 'up',
  className,
}: AnimatedWidgetProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const getInitialOffset = () => {
    switch (direction) {
      case 'up':
        return { y: 24 };
      case 'down':
        return { y: -24 };
      case 'left':
        return { x: 24 };
      case 'right':
        return { x: -24 };
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, ...getInitialOffset() }}
      animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: EASE,
      }}
      whileHover={{
        y: -2,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      className={cn('transition-shadow hover:shadow-md', className)}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// ANIMATED EMPTY STATE (Empty State with Icon Animation)
// ============================================================================

interface AnimatedEmptyStateProps {
  /** Pre-rendered icon element */
  icon: React.ReactNode;
  /** Main message */
  title: string;
  /** Optional description */
  description?: string;
  /** Optional action button */
  action?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * Animated empty state with bouncing icon and staggered text
 */
export function AnimatedEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: AnimatedEmptyStateProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8 text-center', className)}>
        <div className="text-muted-foreground">{icon}</div>
        <h3 className="mt-3 text-sm font-medium">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        {action && <div className="mt-4">{action}</div>}
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
      className={cn('flex flex-col items-center justify-center py-8 text-center', className)}
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
        className="text-muted-foreground"
      >
        {icon}
      </motion.div>
      <motion.h3
        variants={{
          hidden: { opacity: 0, y: 10 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
        }}
        className="mt-3 text-sm font-medium"
      >
        {title}
      </motion.h3>
      {description && (
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
          }}
          className="mt-1 text-sm text-muted-foreground"
        >
          {description}
        </motion.p>
      )}
      {action && (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
          }}
          className="mt-4"
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================================================
// LOADING TRANSITION (Skeleton to Content)
// ============================================================================

interface LoadingTransitionProps {
  /** Whether content is loading */
  isLoading: boolean;
  /** Skeleton placeholder to show while loading */
  skeleton: React.ReactNode;
  /** Content to show when loaded */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * Smooth transition from skeleton loading state to content
 */
export function LoadingTransition({
  isLoading,
  skeleton,
  children,
  className,
}: LoadingTransitionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{isLoading ? skeleton : children}</div>;
  }

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {skeleton}
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// ANIMATED LIST ITEM (For Widget Lists)
// ============================================================================

interface AnimatedListItemProps {
  children: React.ReactNode;
  /** Index for stagger delay calculation */
  index?: number;
  /** Base stagger delay in seconds */
  staggerDelay?: number;
  /** Additional class names */
  className?: string;
}

/**
 * Animated list item for use in widget lists
 */
export function AnimatedListItem({
  children,
  index = 0,
  staggerDelay = 0.05,
  className,
}: AnimatedListItemProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.3,
        delay: index * staggerDelay,
        ease: EASE,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================================
// ANIMATED TABLE COMPONENTS
// ============================================================================

interface AnimatedTableBodyProps {
  children: React.ReactNode;
  /** Stagger delay between rows in seconds */
  staggerDelay?: number;
  /** Additional class names */
  className?: string;
}

/**
 * Animated table body with staggered row animations
 */
export function AnimatedTableBody({
  children,
  staggerDelay = 0.03,
  className,
}: AnimatedTableBodyProps) {
  const shouldReduceMotion = useReducedMotion();
  const childArray = React.Children.toArray(children);

  if (shouldReduceMotion) {
    return <tbody className={cn('[&_tr:last-child]:border-0', className)}>{children}</tbody>;
  }

  return (
    <motion.tbody
      initial="hidden"
      animate="visible"
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
      className={cn('[&_tr:last-child]:border-0', className)}
    >
      {childArray.map((child, index) => (
        <motion.tr
          key={index}
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.25,
                ease: EASE,
              },
            },
          }}
          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
        >
          {React.isValidElement(child)
            ? (child as React.ReactElement<{ children: React.ReactNode }>).props.children
            : child}
        </motion.tr>
      ))}
    </motion.tbody>
  );
}

interface AnimatedTableRowProps {
  children: React.ReactNode;
  /** Index for calculating stagger delay */
  index?: number;
  /** Base delay in seconds */
  delay?: number;
  /** Additional class names */
  className?: string;
}

/**
 * Individual animated table row
 */
export function AnimatedTableRow({
  children,
  index = 0,
  delay = 0.03,
  className,
}: AnimatedTableRowProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <tr
        className={cn(
          'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
          className
        )}
      >
        {children}
      </tr>
    );
  }

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        delay: index * delay + 0.1,
        ease: EASE,
      }}
      className={cn(
        'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
        className
      )}
    >
      {children}
    </motion.tr>
  );
}

// ============================================================================
// ANIMATED PAGE HEADER
// ============================================================================

interface AnimatedPageHeaderProps {
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * Animated page header wrapper
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

// ============================================================================
// ANIMATED GRID (Enhanced with Scale)
// ============================================================================

interface AnimatedGridProps {
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Stagger delay between items */
  staggerDelay?: number;
  /** Initial delay before animations start */
  delayChildren?: number;
}

/**
 * Animated grid with scale and fade-up animations
 */
export function AnimatedGrid({
  children,
  className,
  staggerDelay = 0.1,
  delayChildren = 0.2,
}: AnimatedGridProps) {
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
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
      className={className}
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
          className="transition-shadow hover:shadow-lg"
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

// ============================================================================
// ANIMATED SECTION
// ============================================================================

interface AnimatedSectionProps {
  children: React.ReactNode;
  /** Delay before animation starts */
  delay?: number;
  /** Additional class names */
  className?: string;
}

/**
 * Animated section with fade-up effect
 */
export function AnimatedSection({ children, delay = 0, className }: AnimatedSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <section className={className}>{children}</section>;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ============================================================================
// ANIMATED BADGE (For Status Indicators)
// ============================================================================

interface AnimatedBadgeProps {
  children: React.ReactNode;
  /** Whether to show pulse animation (for urgent items) */
  pulse?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Animated badge with optional pulse effect for urgent items
 */
export function AnimatedBadge({ children, pulse = false, className }: AnimatedBadgeProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion || !pulse) {
    return <span className={className}>{children}</span>;
  }

  return (
    <motion.span
      animate={{
        boxShadow: [
          '0 0 0 0 currentColor',
          '0 0 0 4px transparent',
        ],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'loop',
      }}
      className={cn('relative', className)}
    >
      {children}
    </motion.span>
  );
}
