/**
 * Motion Animation Library Configuration
 *
 * Centralized animation presets, variants, and utilities for consistent
 * animations across the application. Uses motion.dev (Framer Motion successor).
 *
 * @see https://motion.dev/docs
 */

import type { Target, Transition, Variants } from 'motion/react';

// ============================================================================
// TRANSITION PRESETS
// ============================================================================

/**
 * Standard transition timings for consistent feel across the app
 */
export const transitions = {
  /** Fast interactions (button hover, toggle) */
  fast: {
    type: 'tween',
    duration: 0.15,
    ease: 'easeOut',
  } satisfies Transition,

  /** Normal interactions (card hover, modal) */
  normal: {
    type: 'tween',
    duration: 0.2,
    ease: 'easeOut',
  } satisfies Transition,

  /** Smooth transitions (page transitions, complex animations) */
  smooth: {
    type: 'tween',
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1], // Material Design ease-in-out
  } satisfies Transition,

  /** Spring animations (bouncy feel) */
  spring: {
    type: 'spring',
    stiffness: 300,
    damping: 20,
  } satisfies Transition,

  /** Gentle spring (subtle bounce) */
  gentleSpring: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
  } satisfies Transition,

  /** Stagger delay for list items */
  stagger: {
    staggerChildren: 0.05,
    delayChildren: 0.1,
  } satisfies Transition,
} as const;

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

/**
 * Fade in/out animations
 */
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    transition: transitions.fast,
  },
};

/**
 * Fade and slide up (great for cards, modals)
 */
export const fadeUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transitions.fast,
  },
};

/**
 * Fade and slide down (dropdowns, tooltips)
 */
export const fadeDownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: transitions.fast,
  },
};

/**
 * Scale animations (buttons, interactive elements)
 */
export const scaleVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.smooth,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: transitions.fast,
  },
};

/**
 * Slide in from right (panels, drawers)
 */
export const slideRightVariants: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.smooth,
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: transitions.normal,
  },
};

/**
 * Slide in from left (sidebars)
 */
export const slideLeftVariants: Variants = {
  hidden: {
    x: '-100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: transitions.smooth,
  },
  exit: {
    x: '-100%',
    opacity: 0,
    transition: transitions.normal,
  },
};

/**
 * Staggered children animation (lists, grids)
 */
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      ...transitions.stagger,
    },
  },
};

/**
 * Individual stagger item variant
 */
export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.smooth,
  },
};

// ============================================================================
// HOVER & TAP STATES
// ============================================================================

/**
 * Standard hover state for interactive elements
 */
export const hoverScale: Target = {
  scale: 1.02,
};

/**
 * Tap/press state for buttons
 */
export const tapScale: Target = {
  scale: 0.98,
};

/**
 * Subtle hover lift effect (for cards)
 */
export const hoverLift: Target = {
  y: -4,
};

/**
 * Combined hover states for cards
 */
export const cardHover = {
  whileHover: {
    y: -4,
    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.3)',
    transition: transitions.fast,
  },
  whileTap: {
    scale: 0.99,
    transition: transitions.fast,
  },
};

/**
 * Button hover/tap states
 */
export const buttonStates = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: transitions.fast,
};

// ============================================================================
// PAGE TRANSITION VARIANTS
// ============================================================================

/**
 * Page transition animation (fade with slight slide)
 */
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user prefers reduced motion
 * Use this to disable animations for accessibility
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation props conditionally based on reduced motion preference
 */
export function getMotionProps<T extends object>(props: T): T | Record<string, never> {
  if (prefersReducedMotion()) {
    return {};
  }
  return props;
}

/**
 * Create stagger delay for index-based animations
 */
export function staggerDelay(index: number, baseDelay = 0.05): number {
  return index * baseDelay;
}

/**
 * Generate variants for list items with stagger
 */
export function createStaggerVariants(staggerAmount = 0.05): {
  container: Variants;
  item: Variants;
} {
  return {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerAmount,
          delayChildren: 0.1,
        },
      },
    },
    item: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: transitions.smooth,
      },
    },
  };
}
