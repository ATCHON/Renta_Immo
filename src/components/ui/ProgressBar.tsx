'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
  className?: string;
}

export function ProgressBar({ currentStep, totalSteps, labels, className }: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className={cn('w-full', className)}>
      {/* Barre de progression */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-600 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Indicateurs d'étapes */}
      {labels && labels.length > 0 && (
        <div className="flex justify-between mt-4">
          {labels.map((label, index) => (
            <StepIndicator
              key={index}
              stepNumber={index + 1}
              label={label}
              status={
                index < currentStep ? 'completed' : index === currentStep ? 'current' : 'upcoming'
              }
            />
          ))}
        </div>
      )}

      {/* Texte de progression simple */}
      {(!labels || labels.length === 0) && (
        <p className="text-sm text-gray-600 mt-2 text-center">
          Étape {currentStep + 1} sur {totalSteps}
        </p>
      )}
    </div>
  );
}

type StepStatus = 'completed' | 'current' | 'upcoming';

interface StepIndicatorProps {
  stepNumber: number;
  label: string;
  status: StepStatus;
}

function StepIndicator({ stepNumber, label, status }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
          'transition-colors duration-200',
          status === 'completed' && 'bg-primary-600 text-white',
          status === 'current' && 'bg-primary-600 text-white ring-4 ring-primary-100',
          status === 'upcoming' && 'bg-gray-200 text-gray-600'
        )}
      >
        {status === 'completed' ? <CheckIcon className="w-4 h-4" /> : stepNumber}
      </div>
      <span
        className={cn(
          'text-xs mt-2 max-w-[80px] text-center hidden sm:block',
          status === 'current' ? 'text-primary-600 font-medium' : 'text-gray-500'
        )}
      >
        {label}
      </span>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={3}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}
