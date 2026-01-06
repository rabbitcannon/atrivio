import { cn } from '@/lib/utils/cn';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use shimmer effect instead of pulse */
  shimmer?: boolean;
}

/**
 * Skeleton loader for content placeholders.
 * Supports both pulse (default) and shimmer effects.
 */
function Skeleton({ className, shimmer = false, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-md bg-muted',
        shimmer ? 'skeleton-shimmer' : 'animate-pulse',
        className
      )}
      {...props}
    />
  );
}

/**
 * Text skeleton - multiple lines of text placeholder
 */
function SkeletonText({
  lines = 3,
  className,
  shimmer,
}: {
  lines?: number;
  className?: string;
  shimmer?: boolean;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {[...Array(lines)].map((_, i) => (
        <Skeleton
          key={i}
          shimmer={shimmer}
          className={cn('h-4', i === lines - 1 ? 'w-4/5' : 'w-full')}
        />
      ))}
    </div>
  );
}

/**
 * Avatar skeleton - circular placeholder
 */
function SkeletonAvatar({
  size = 'md',
  shimmer,
}: {
  size?: 'sm' | 'md' | 'lg';
  shimmer?: boolean;
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return <Skeleton shimmer={shimmer} className={cn('rounded-full', sizeClasses[size])} />;
}

/**
 * Card skeleton - full card placeholder
 */
function SkeletonCard({ shimmer, className }: { shimmer?: boolean; className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-4 space-y-4', className)}>
      <div className="flex items-center space-x-3">
        <SkeletonAvatar shimmer={shimmer} />
        <div className="flex-1 space-y-2">
          <Skeleton shimmer={shimmer} className="h-4 w-1/3" />
          <Skeleton shimmer={shimmer} className="h-3 w-1/4" />
        </div>
      </div>
      <SkeletonText lines={2} shimmer={shimmer} />
    </div>
  );
}

/**
 * Table row skeleton
 */
function SkeletonTableRow({
  columns = 4,
  shimmer,
}: {
  columns?: number;
  shimmer?: boolean;
}) {
  return (
    <tr className="border-b">
      {[...Array(columns)].map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton
            shimmer={shimmer}
            className={cn('h-4', i === 0 ? 'w-32' : i === columns - 1 ? 'w-16' : 'w-24')}
          />
        </td>
      ))}
    </tr>
  );
}

/**
 * Image skeleton with aspect ratio
 */
function SkeletonImage({
  aspectRatio = '16/9',
  shimmer,
  className,
}: {
  aspectRatio?: string;
  shimmer?: boolean;
  className?: string;
}) {
  return (
    <Skeleton
      shimmer={shimmer}
      className={cn('w-full', className)}
      style={{ aspectRatio }}
    />
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonTableRow,
  SkeletonImage,
};
