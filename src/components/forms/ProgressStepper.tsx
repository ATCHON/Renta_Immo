'use client';

import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

export function ProgressStepper({
  currentStep,
  totalSteps,
  onStepClick,
  isAllEnabled = false,
}: ProgressStepperProps & { isAllEnabled?: boolean }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <div className="w-full max-w-2xl mx-auto mb-12">
      <div className="relative flex justify-between items-center">
        {/* Progress Bar background */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-sand -translate-y-1/2 z-0" />

        {/* Progress Bar active */}
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-forest -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isUpcoming = step > currentStep;

          return (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <button
                onClick={() => (isCompleted || isCurrent || isAllEnabled) && onStepClick?.(step)}
                disabled={!isCompleted && !isCurrent && !isAllEnabled}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                  isCompleted && 'bg-forest text-white hover:bg-forest/90',
                  isCurrent &&
                    'bg-white border-2 border-forest text-forest shadow-[0_0_0_4px_rgba(45,90,69,0.1)]',
                  isUpcoming && 'bg-white border text-pebble border-sand'
                )}
                aria-label={`Étape ${step}`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : step}
              </button>
            </div>
          );
        })}
      </div>

      {/* Label for current step */}
      <div className="text-center mt-6">
        <p className="text-sm font-medium text-forest uppercase tracking-wider">
          Étape {currentStep} sur {totalSteps}
        </p>
      </div>
    </div>
  );
}
