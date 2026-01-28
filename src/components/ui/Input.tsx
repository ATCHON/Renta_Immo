'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      hint,
      leftAddon,
      rightAddon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          {leftAddon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            id={inputId}
            className={cn(
              'input-field',
              leftAddon && 'pl-10',
              rightAddon && 'pr-10',
              error && 'input-error',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {rightAddon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-stone">
              {rightAddon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="error-message">
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-sm text-pebble mt-1">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Input pour les montants en euros
 */
export const CurrencyInput = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    return (
      <Input
        ref={ref}
        type="number"
        min="0"
        step="1"
        rightAddon="€"
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

/**
 * Input pour les pourcentages
 */
export const PercentInput = forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    return (
      <Input
        ref={ref}
        type="number"
        min="0"
        max="100"
        step="0.1"
        rightAddon="%"
        {...props}
      />
    );
  }
);

PercentInput.displayName = 'PercentInput';
