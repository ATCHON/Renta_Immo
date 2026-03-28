'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { NumericFormat } from 'react-number-format';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'label'> {
  label?: React.ReactNode;
  error?: string;
  hint?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = 'text', label, error, hint, leftAddon, rightAddon, id, ...props },
  ref
) {
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
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-on-surface-variant">
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
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-on-surface-variant">
            {rightAddon}
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="error-message">
          {error}
        </p>
      )}
      {hint && !error && <p className="text-sm text-on-surface-variant/70 mt-1">{hint}</p>}
    </div>
  );
});

Input.displayName = 'Input';

/**
 * Input pour les montants en euros — formatage automatique "200 000 €"
 * Utilise react-number-format + Controller react-hook-form pour gérer
 * correctement les reset() et setValue() de formulaire.
 */
interface CurrencyInputProps<T extends FieldValues> {
  // string accepté pour les noms dynamiques (ex: useFieldArray `associes.${index}.revenus`)
  name: Path<T> | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Control<T> est trop strict pour useForm<TIn, TCtx, TOut> generics
  control: Control<any>;
  label?: React.ReactNode;
  error?: string;
  hint?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CurrencyInput<T extends FieldValues>({
  name,
  control,
  label,
  error,
  hint,
  placeholder,
  disabled,
  className,
}: CurrencyInputProps<T>) {
  return (
    <Controller
      name={name as Path<T>}
      control={control}
      render={({ field: { onChange, onBlur, value, ref } }) => (
        <NumericFormat
          thousandSeparator=" "
          decimalSeparator=","
          allowNegative={false}
          value={value ?? ''}
          onValueChange={(values) => onChange(values.floatValue ?? 0)}
          onBlur={onBlur}
          getInputRef={ref}
          customInput={Input as React.ComponentType<InputProps>}
          label={label}
          error={error}
          hint={hint}
          placeholder={placeholder}
          rightAddon="€"
          disabled={disabled}
          className={className}
        />
      )}
    />
  );
}

/**
 * Input pour les pourcentages
 */
export const PercentInput = forwardRef<HTMLInputElement, InputProps>(
  function PercentInput(props, ref) {
    return (
      <Input ref={ref} type="number" min="0" max="100" step="0.01" rightAddon="%" {...props} />
    );
  }
);

PercentInput.displayName = 'PercentInput';
