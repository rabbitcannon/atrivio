import { cn } from '@/lib/utils/cn';

interface LoadingDotsProps {
  /** Size of the dots */
  size?: 'sm' | 'md' | 'lg';
  /** Optional className */
  className?: string;
}

const sizeClasses = {
  sm: 'h-1 w-1',
  md: 'h-1.5 w-1.5',
  lg: 'h-2 w-2',
};

/**
 * Animated loading dots indicator.
 * Great for inline "Loading..." states.
 */
export function LoadingDots({ size = 'md', className }: LoadingDotsProps) {
  return (
    <span
      className={cn('loading-dots inline-flex items-center gap-1', className)}
      role="status"
      aria-label="Loading"
    >
      <span className={cn('rounded-full bg-current', sizeClasses[size])} />
      <span className={cn('rounded-full bg-current', sizeClasses[size])} />
      <span className={cn('rounded-full bg-current', sizeClasses[size])} />
    </span>
  );
}

/**
 * Loading text with animated dots.
 */
export function LoadingText({
  text = 'Loading',
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-center gap-1 text-muted-foreground', className)}>
      {text}
      <LoadingDots size="sm" />
    </span>
  );
}
