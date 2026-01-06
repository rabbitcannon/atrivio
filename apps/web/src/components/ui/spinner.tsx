import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Optional className */
  className?: string;
  /** Screen reader label */
  label?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
};

/**
 * Animated spinner for loading states.
 * Uses Lucide's Loader2 icon with CSS animation.
 */
export function Spinner({ size = 'md', className, label = 'Loading' }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-muted-foreground', sizeClasses[size], className)}
      aria-label={label}
      role="status"
    />
  );
}

interface SpinnerWithTextProps extends SpinnerProps {
  /** Text to display next to spinner */
  text?: string;
}

/**
 * Spinner with optional text label beside it.
 */
export function SpinnerWithText({
  size = 'md',
  text = 'Loading...',
  className,
  label,
}: SpinnerWithTextProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Spinner size={size} label={label} />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  );
}

/**
 * Full-page centered spinner for page-level loading.
 */
export function PageSpinner({ text }: { text?: string }) {
  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4">
      <Spinner size="xl" className="text-primary" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

/**
 * Inline spinner for buttons - smaller and matches button text.
 */
export function ButtonSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} aria-hidden="true" />;
}
