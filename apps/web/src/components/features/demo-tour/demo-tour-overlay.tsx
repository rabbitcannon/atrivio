'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useDemoTour } from './demo-tour-context';

// Material Design ease curve
const EASE = [0.4, 0, 0.2, 1] as const;

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function DemoTourOverlay() {
  const { isActive, currentStep, steps, currentStepData, nextStep, prevStep, endTour } =
    useDemoTour();
  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom' | 'left' | 'right'>(
    'bottom'
  );
  const shouldReduceMotion = useReducedMotion();
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Find and track target element position
  useEffect(() => {
    if (!currentStepData) {
      setTargetRect(null);
      return;
    }

    const updateTargetRect = () => {
      const target = document.getElementById(currentStepData.targetId);
      if (target) {
        const rect = target.getBoundingClientRect();
        const padding = 8;
        setTargetRect({
          top: rect.top - padding + window.scrollY,
          left: rect.left - padding + window.scrollX,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2,
        });

        // Determine best tooltip position
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const spaceRight = viewportWidth - rect.right;
        const spaceLeft = rect.left;

        if (spaceBelow > 200) {
          setTooltipPosition('bottom');
        } else if (spaceAbove > 200) {
          setTooltipPosition('top');
        } else if (spaceRight > 320) {
          setTooltipPosition('right');
        } else if (spaceLeft > 320) {
          setTooltipPosition('left');
        } else {
          setTooltipPosition('bottom');
        }
      }
    };

    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);

    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [currentStepData]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          endTour();
          break;
        case 'ArrowRight':
        case 'Enter':
          nextStep();
          break;
        case 'ArrowLeft':
          prevStep();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, nextStep, prevStep, endTour]);

  if (!isActive || !currentStepData || !targetRect) return null;

  const getTooltipStyle = () => {
    const offset = 16;
    switch (tooltipPosition) {
      case 'top':
        return {
          bottom: `calc(100vh - ${targetRect.top}px + ${offset}px)`,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%)',
        };
      case 'bottom':
        return {
          top: targetRect.top + targetRect.height + offset,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%)',
        };
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2,
          right: `calc(100vw - ${targetRect.left}px + ${offset}px)`,
          transform: 'translateY(-50%)',
        };
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left + targetRect.width + offset,
          transform: 'translateY(-50%)',
        };
    }
  };

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {/* Backdrop with spotlight cutout */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="fixed inset-0 z-[100] pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px, transparent ${Math.max(targetRect.width, targetRect.height) / 2 + 20}px, rgba(0, 0, 0, 0.75) ${Math.max(targetRect.width, targetRect.height) / 2 + 80}px)`,
            }}
          />

          {/* Highlight ring around target */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed z-[101] pointer-events-none rounded-lg ring-2 ring-primary ring-offset-2 ring-offset-background"
            style={{
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
            }}
          />

          {/* Clickable overlay to catch outside clicks */}
          <div
            className="fixed inset-0 z-[100]"
            onClick={endTour}
            aria-hidden="true"
          />

          {/* Tooltip */}
          <motion.div
            ref={tooltipRef}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: EASE, delay: 0.1 }}
            className="fixed z-[102] w-80 bg-card border border-border rounded-lg shadow-xl"
            style={getTooltipStyle()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg">{currentStepData.title}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 -mt-1 -mr-1"
                  onClick={endTour}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close tour</span>
                </Button>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4">
                {currentStepData.description}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {currentStep + 1} of {steps.length}
                </span>

                <div className="flex gap-2">
                  {currentStep > 0 && (
                    <Button variant="outline" size="sm" onClick={prevStep}>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}
                  <Button size="sm" onClick={nextStep}>
                    {currentStep === steps.length - 1 ? (
                      'Finish'
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Progress dots */}
            <div className="px-4 pb-3 flex justify-center gap-1.5">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-4 bg-primary'
                      : index < currentStep
                        ? 'w-1.5 bg-primary/60'
                        : 'w-1.5 bg-muted'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
