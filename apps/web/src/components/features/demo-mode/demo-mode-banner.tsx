'use client';

import { useState } from 'react';
import { Info, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

interface DemoModeBannerProps {
  /** Organization name to display */
  orgName?: string;
  /** Whether to allow dismissing the banner */
  dismissible?: boolean;
}

/**
 * A banner that indicates the user is viewing demo/sample data.
 * Helps set expectations during client demos.
 */
export function DemoModeBanner({ orgName, dismissible = true }: DemoModeBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  if (isDismissed) return null;

  const content = (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-amber-500/10 border-b border-amber-500/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20">
              <Info className="h-3 w-3 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-amber-700 dark:text-amber-300 font-medium">
              Demo Mode
            </span>
            <span className="text-amber-600/80 dark:text-amber-400/80 hidden sm:inline">
              {orgName ? `Viewing sample data for ${orgName}` : 'Viewing sample data'}
            </span>
          </div>
          {dismissible && (
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded hover:bg-amber-500/10 transition-colors"
              aria-label="Dismiss demo mode banner"
            >
              <X className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (shouldReduceMotion) {
    return content;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        {content}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * A smaller floating badge version for less intrusive demo indication
 */
export function DemoModeBadge() {
  const shouldReduceMotion = useReducedMotion();

  const badge = (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/90 text-white text-xs font-medium shadow-lg">
        <Info className="h-3 w-3" />
        Demo Mode
      </div>
    </div>
  );

  if (shouldReduceMotion) {
    return badge;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
    >
      {badge}
    </motion.div>
  );
}
