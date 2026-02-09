'use client';

import { forwardRef, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      options,
      placeholder,
      id,
      value,
      onChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || props.name;
    const [isOpen, setIsOpen] = useState(false);
    // Internal state for controlled/uncontrolled compatibility
    const [internalValue, setInternalValue] = useState(value || '');
    const containerRef = useRef<HTMLDivElement>(null);
    const nativeSelectRef = useRef<HTMLSelectElement>(null);

    // Sync internal value with prop value
    useEffect(() => {
      if (value !== undefined) {
        setInternalValue(value);
      }
    }, [value]);

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string | number) => {
      setInternalValue(optionValue);
      setIsOpen(false);

      // Update native select and trigger change event for React Hook Form
      if (nativeSelectRef.current) {
        nativeSelectRef.current.value = String(optionValue);
        const event = new Event('change', { bubbles: true });
        nativeSelectRef.current.dispatchEvent(event);

        // Call props onChange if it exists (for controlled components)
        if (onChange) {
          onChange({ target: nativeSelectRef.current } as React.ChangeEvent<HTMLSelectElement>);
        }
      }
    };

    const selectedOption = options.find(opt => String(opt.value) === String(internalValue));

    return (
      <div className="w-full" ref={containerRef}>
        {label && (
          <label htmlFor={selectId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          {/* Hidden Native Select for Form Data */}
          <select
            ref={(node) => {
              // Merge refs
              // @ts-expect-error - ref type mismatch with RHF
              nativeSelectRef.current = node;
              if (typeof ref === 'function') ref(node);
              else if (ref) ref.current = node;
            }}
            id={selectId}
            className="sr-only" // Screen reader only / hidden
            value={internalValue}
            onChange={(e) => {
              setInternalValue(e.target.value);
              onChange?.(e);
            }}
            disabled={disabled}
            {...props}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Custom Trigger */}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            className={cn(
              'input-field flex items-center justify-between w-full text-left bg-white',
              error && 'input-error',
              disabled && 'opacity-50 cursor-not-allowed',
              isOpen && 'ring-2 ring-forest/20 border-forest',
              className
            )}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            disabled={disabled}
          >
            <span className={cn(
              "block truncate",
              !selectedOption && "text-pebble"
            )}>
              {selectedOption ? selectedOption.label : (placeholder || "Sélectionner...")}
            </span>
            <ChevronDown className={cn(
              "h-4 w-4 text-pebble transition-transform duration-200",
              isOpen && "transform rotate-180"
            )} />
          </button>

          {/* Custom Dropdown */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-xl border border-sand/50 max-h-60 overflow-auto animate-in fade-in zoom-in-95 duration-100">
              <ul role="listbox" className="py-1">
                {placeholder && (
                  <li
                    className="px-4 py-2 text-sm text-pebble hover:bg-sand/10 cursor-pointer"
                    onClick={() => handleSelect('')}
                  >
                    {placeholder}
                  </li>
                )}
                {options.map((option) => {
                  const isSelected = String(option.value) === String(internalValue);
                  return (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between transition-colors",
                        option.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-sand/10",
                        isSelected && "bg-forest/5 text-forest font-medium"
                      )}
                      onClick={() => !option.disabled && handleSelect(option.value)}
                    >
                      <span className="truncate">{option.label}</span>
                      {isSelected && <Check className="h-4 w-4 text-forest" />}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        {error && (
          <p id={`${selectId}-error`} className="error-message">
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

Select.displayName = 'Select';
