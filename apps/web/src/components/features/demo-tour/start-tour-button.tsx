'use client';

import { HelpCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoTour, useHasCompletedTour, type TourStep } from './demo-tour-context';

interface StartTourButtonProps {
  steps: TourStep[];
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function StartTourButton({
  steps,
  variant = 'outline',
  showIcon = true,
  className,
  children,
}: StartTourButtonProps) {
  const { startTour, isActive } = useDemoTour();

  if (isActive) return null;

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={() => startTour(steps)}
      className={className}
    >
      {showIcon && <PlayCircle className="h-4 w-4 mr-2" />}
      {children || 'Take a Tour'}
    </Button>
  );
}

interface TourPromptProps {
  steps: TourStep[];
  pageName?: string;
}

/**
 * Shows a prompt to take the tour if the user hasn't completed it yet.
 * Can be placed in pages to encourage first-time users to take the tour.
 */
export function TourPrompt({ steps, pageName = 'this page' }: TourPromptProps) {
  const { startTour, isActive } = useDemoTour();
  const hasCompleted = useHasCompletedTour();

  // Don't show if tour is active or user has completed it
  if (isActive || hasCompleted) return null;

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5 mb-6">
      <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium">New to {pageName}?</p>
        <p className="text-xs text-muted-foreground">
          Take a quick tour to learn about the key features.
        </p>
      </div>
      <Button size="sm" onClick={() => startTour(steps)}>
        <PlayCircle className="h-4 w-4 mr-2" />
        Start Tour
      </Button>
    </div>
  );
}
