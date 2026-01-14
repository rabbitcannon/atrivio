'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'motion/react';

interface AnimatedCounterProps {
  /** The target value to count to */
  value: number;
  /** Duration of the animation in milliseconds */
  duration?: number;
  /** Format function for the displayed value */
  formatValue?: (value: number) => string;
  /** CSS class name */
  className?: string;
  /** Prefix to display before the number (e.g., "$") */
  prefix?: string;
  /** Suffix to display after the number (e.g., "%") */
  suffix?: string;
}

/**
 * Animated counter that counts up from 0 to the target value.
 * Uses easeOut animation for a natural feel.
 * Respects reduced motion preferences.
 */
export function AnimatedCounter({
  value,
  duration = 1500,
  formatValue = (v) => v.toLocaleString(),
  className,
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const shouldReduceMotion = useReducedMotion();
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Skip animation if reduced motion is preferred or already animated
    if (shouldReduceMotion || hasAnimated.current) {
      setDisplayValue(value);
      return;
    }

    // Only start animation when in view
    if (!isInView) return;

    hasAnimated.current = true;
    const startTime = performance.now();
    const startValue = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (value - startValue) * easeOut);

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, isInView, shouldReduceMotion]);

  // Update if value changes after initial animation
  useEffect(() => {
    if (hasAnimated.current && shouldReduceMotion) {
      setDisplayValue(value);
    }
  }, [value, shouldReduceMotion]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatValue(displayValue)}
      {suffix}
    </span>
  );
}

/**
 * Animated currency counter with dollar formatting
 */
export function AnimatedCurrency({
  value,
  duration = 1500,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <AnimatedCounter
      value={value}
      duration={duration}
      formatValue={formatCurrency}
      className={className}
    />
  );
}

/**
 * Animated percentage counter
 */
export function AnimatedPercentage({
  value,
  duration = 1500,
  decimals = 1,
  className,
}: {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
}) {
  // Multiply by 10^decimals to animate with precision
  const multiplier = Math.pow(10, decimals);
  const scaledValue = Math.round(value * multiplier);

  const formatPercentage = (v: number) => {
    return (v / multiplier).toFixed(decimals);
  };

  return (
    <AnimatedCounter
      value={scaledValue}
      duration={duration}
      formatValue={formatPercentage}
      className={className}
      suffix="%"
    />
  );
}
