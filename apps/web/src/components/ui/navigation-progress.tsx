'use client';

import { useEffect, useState, useTransition, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils/cn';

/**
 * NavigationProgress - Shows a thin progress bar at the top during navigation
 * Provides immediate visual feedback when navigating between pages
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Reset progress when navigation completes
  // biome-ignore lint/correctness/useExhaustiveDependencies: pathname and searchParams changes indicate navigation completed
  useEffect(() => {
    setIsNavigating(false);
    setProgress(100);

    const timeout = setTimeout(() => {
      setProgress(0);
    }, 200);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  // Animate progress during navigation
  useEffect(() => {
    if (!isNavigating) return;

    const intervals = [
      { delay: 0, progress: 20 },
      { delay: 100, progress: 40 },
      { delay: 300, progress: 60 },
      { delay: 600, progress: 75 },
      { delay: 1000, progress: 85 },
      { delay: 2000, progress: 90 },
      { delay: 4000, progress: 95 },
    ];

    const timeouts = intervals.map(({ delay, progress }) =>
      setTimeout(() => setProgress(progress), delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, [isNavigating]);

  // Check if a link should trigger navigation progress
  const shouldTriggerProgress = useCallback(
    (link: HTMLAnchorElement, event: MouseEvent): boolean => {
      const href = link.getAttribute('href');
      if (!href) return false;

      // Skip non-navigation links (external, hash, mailto, tel, download, new tab)
      const skipPrefixes = ['http', '#', 'mailto:', 'tel:'];
      const hasSkipPrefix = skipPrefixes.some((prefix) => href.startsWith(prefix));
      const isSpecialLink = link.hasAttribute('download') || link.getAttribute('target') === '_blank';
      const hasModifier = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

      if (hasSkipPrefix || isSpecialLink || hasModifier) return false;

      // Skip if it's the current page
      const url = new URL(href, window.location.origin);
      const isSamePage = url.pathname === pathname && url.search === window.location.search;

      return !isSamePage;
    },
    [pathname]
  );

  // Listen for link clicks to start progress
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');

      if (link && shouldTriggerProgress(link, e)) {
        setIsNavigating(true);
        setProgress(10);
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [shouldTriggerProgress]);

  return (
    <AnimatePresence>
      {progress > 0 && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-primary/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className={cn(
              'h-full bg-primary',
              'shadow-[0_0_10px_var(--primary),0_0_5px_var(--primary)]'
            )}
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{
              duration: progress === 100 ? 0.2 : 0.4,
              ease: progress === 100 ? 'easeOut' : 'easeInOut',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook to manually trigger navigation progress
 * Useful for programmatic navigation with useRouter
 */
export function useNavigationProgress() {
  const [isPending, startTransition] = useTransition();

  const navigate = (callback: () => void) => {
    startTransition(() => {
      callback();
    });
  };

  return { isPending, navigate };
}
