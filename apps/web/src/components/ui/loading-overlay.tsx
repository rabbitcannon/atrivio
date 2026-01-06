'use client';

import { cn } from '@/lib/utils/cn';
import { Spinner } from './spinner';

interface LoadingOverlayProps {
  /** Whether the overlay is visible */
  isLoading: boolean;
  /** Text to display under the spinner */
  text?: string;
  /** Optional className for the overlay */
  className?: string;
  /** Children to render behind the overlay */
  children: React.ReactNode;
  /** Whether to blur the background content */
  blur?: boolean;
  /** Whether overlay should be full screen or just cover parent */
  fullScreen?: boolean;
}

/**
 * Loading overlay that covers content during async operations.
 * Provides visual feedback while preserving layout.
 */
export function LoadingOverlay({
  isLoading,
  text,
  className,
  children,
  blur = true,
  fullScreen = false,
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/80 backdrop-blur-sm transition-all',
            fullScreen && 'fixed',
            !blur && 'backdrop-blur-none'
          )}
          role="status"
          aria-live="polite"
          aria-label={text || 'Loading'}
        >
          <Spinner size="lg" className="text-primary" />
          {text && (
            <p className="text-sm font-medium text-muted-foreground animate-pulse">{text}</p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Simpler inline loading state for cards and sections.
 */
export function LoadingCard({
  isLoading,
  children,
  minHeight = '200px',
}: {
  isLoading: boolean;
  children: React.ReactNode;
  minHeight?: string;
}) {
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border bg-card"
        style={{ minHeight }}
      >
        <Spinner size="lg" className="text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
