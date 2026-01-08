'use client';

import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface SliderProps {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  disabled?: boolean;
  className?: string;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    { value, defaultValue, min = 0, max = 100, step = 1, onValueChange, disabled, className },
    ref
  ) => {
    const currentValue = value?.[0] ?? defaultValue?.[0] ?? min;

    return (
      <div className={cn('relative flex w-full touch-none select-none items-center', className)}>
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <div
            className="absolute h-full bg-primary"
            style={{ width: `${((currentValue - min) / (max - min)) * 100}%` }}
          />
        </div>
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          disabled={disabled}
          onChange={(e) => onValueChange?.([parseInt(e.target.value, 10)])}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <div
          className="absolute h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          style={{ left: `calc(${((currentValue - min) / (max - min)) * 100}% - 10px)` }}
        />
      </div>
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };
