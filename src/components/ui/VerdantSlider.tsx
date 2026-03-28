'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

interface VerdantSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
  hint?: string;
  unit?: string;
  className?: string;
}

export function VerdantSlider({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  hint,
  unit,
  className,
}: VerdantSliderProps) {
  const id = useId();
  const range = max - min;
  const percent = range > 0 ? ((value - min) / range) * 100 : 0;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-sm font-medium text-on-surface-variant">
            {label}
          </label>
          <div className="flex items-baseline gap-1">
            <input
              type="number"
              value={value}
              min={min}
              max={max}
              step={step}
              onChange={(e) => {
                const parsed = Number(e.target.value);
                if (!isNaN(parsed)) {
                  onChange(Math.min(max, Math.max(min, parsed)));
                }
              }}
              className="w-16 text-right text-sm font-bold text-on-surface bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:outline-none tabular-nums"
              aria-label={label}
            />
            {unit && <span className="text-xs text-on-surface-variant">{unit}</span>}
          </div>
        </div>
      )}

      <div className="relative h-5 flex items-center">
        {/* Track background */}
        <div className="absolute inset-x-0 h-1 rounded-full bg-secondary-container" />

        {/* Track filled */}
        <div
          className="absolute left-0 h-1 rounded-full bg-primary transition-all duration-fast"
          style={{ width: `${percent}%` }}
        />

        {/* Native range input */}
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="verdant-slider-input relative z-10 w-full h-5 appearance-none bg-transparent cursor-pointer"
          style={
            {
              '--thumb-color': 'var(--color-primary)',
            } as React.CSSProperties
          }
        />
      </div>

      <div className="flex justify-between text-xs text-on-surface-variant/70">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>

      {hint && <p className="text-xs text-on-surface-variant">{hint}</p>}
    </div>
  );
}
