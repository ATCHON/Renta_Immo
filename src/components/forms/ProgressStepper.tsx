'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: readonly string[];
  onStepClick?: (step: number) => void;
  isAllEnabled?: boolean;
}

export function ProgressStepper({
  currentStep,
  totalSteps,
  stepLabels,
  onStepClick,
  isAllEnabled = false,
}: ProgressStepperProps) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <div className="relative flex justify-between items-start">
        {/* Ligne de fond */}
        <div className="absolute top-5 left-0 w-full h-px bg-outline-variant z-0" />

        {/* Ligne active */}
        <div
          className="absolute top-5 left-0 h-px bg-primary z-0 transition-all duration-500 ease-in-out"
          style={{ width: `${totalSteps > 1 ? ((currentStep - 1) / (totalSteps - 1)) * 100 : 0}%` }}
        />

        {steps.map((step) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isClickable = isCompleted || isCurrent || isAllEnabled;
          const label = stepLabels?.[step - 1];

          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
              <button
                onClick={() => isClickable && onStepClick?.(step)}
                disabled={!isClickable}
                aria-label={label ? `Étape ${step} : ${label}` : `Étape ${step}`}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
                  'transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
                  isCompleted &&
                    'bg-primary text-on-primary shadow-sm cursor-pointer hover:bg-primary/90',
                  isCurrent && [
                    'bg-surface-container-lowest text-primary border-2 border-primary',
                    'shadow-[0_0_0_4px_var(--color-primary-fixed)]',
                  ],
                  !isCompleted &&
                    !isCurrent &&
                    'bg-surface-container text-on-surface-variant border border-outline-variant',
                  isClickable &&
                    !isCurrent &&
                    !isCompleted &&
                    'cursor-pointer hover:border-primary/50'
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : step}
              </button>

              {label && (
                <span
                  className={cn(
                    'text-[10px] font-medium text-center leading-tight max-w-[64px] transition-colors duration-200',
                    isCurrent
                      ? 'text-primary'
                      : isCompleted
                        ? 'text-on-surface-variant'
                        : 'text-outline'
                  )}
                >
                  {label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
