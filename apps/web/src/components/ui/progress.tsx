'use client';

import * as ProgressPrimitive from '@radix-ui/react-progress';
import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  /** Progress value (0-100). Null/undefined shows indeterminate state. */
  value?: number | null;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show percentage text */
  showValue?: boolean;
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

/**
 * Progress bar with determinate and indeterminate states.
 */
const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, ProgressProps>(
  ({ className, value, size = 'md', showValue = false, ...props }, ref) => {
    const isIndeterminate = value === null || value === undefined;

    return (
      <div className="flex items-center gap-2">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            'relative w-full overflow-hidden rounded-full bg-secondary',
            sizeClasses[size],
            className
          )}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              'h-full bg-primary transition-all',
              isIndeterminate && 'w-1/4 progress-indeterminate'
            )}
            style={
              !isIndeterminate
                ? { transform: `translateX(-${100 - (value || 0)}%)`, width: '100%' }
                : undefined
            }
          />
        </ProgressPrimitive.Root>
        {showValue && !isIndeterminate && (
          <span className="text-xs text-muted-foreground tabular-nums min-w-[3ch]">
            {Math.round(value!)}%
          </span>
        )}
      </div>
    );
  }
);
Progress.displayName = 'Progress';

/**
 * Progress bar with label.
 */
function ProgressWithLabel({
  label,
  value,
  size = 'md',
  className,
}: {
  label: string;
  value?: number | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        {value !== null && value !== undefined && (
          <span className="font-medium tabular-nums">{Math.round(value)}%</span>
        )}
      </div>
      <Progress value={value} size={size} />
    </div>
  );
}

export { Progress, ProgressWithLabel };
