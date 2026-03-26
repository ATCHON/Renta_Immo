'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { StepBien } from './StepBien';
import { StepFinancement } from './StepFinancement';
import { StepExploitation } from './StepExploitation';
import { StepStructure } from './StepStructure';
import { StepAssocies } from './StepAssocies';
import { StepOptions } from './StepOptions';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { useCalculateur } from '@/hooks/useCalculateur';
import { useHasHydrated } from '@/hooks/useHasHydrated';
import { ScenarioTabs } from '@/components/results/ScenarioTabs';
import { STEP_LABELS } from '@/lib/constants';
import type { CalculateurFormData } from '@/types';

function StepAccordion({
  stepIndex,
  currentStep,
  title,
  displayNumber,
  onOpen,
  children,
}: {
  stepIndex: number;
  currentStep: number;
  title: string;
  displayNumber: number;
  onOpen: () => void;
  children: React.ReactNode;
}) {
  const isOpen = currentStep === stepIndex;
  const isPast = stepIndex < currentStep;

  return (
    <div
      className={cn(
        'border border-outline-variant rounded-2xl overflow-hidden bg-white shadow-sm transition-all',
        isOpen ? 'ring-2 ring-primary/20' : ''
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          'w-full px-6 py-5 flex items-center justify-between transition-colors text-left',
          isOpen ? 'bg-surface' : 'bg-white hover:bg-surface/50'
        )}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
              isOpen
                ? 'bg-primary text-on-primary'
                : isPast
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface text-on-surface-variant border border-outline-variant'
            )}
          >
            {isPast ? <Check className="w-4 h-4" /> : displayNumber}
          </div>
          <span className={cn('font-medium text-lg', isOpen ? 'text-primary' : 'text-charcoal')}>
            {title}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-stone" />
        ) : (
          <ChevronDown className="h-5 w-5 text-stone" />
        )}
      </button>
      <div
        className={cn(
          'transition-all duration-normal ease-out overflow-hidden',
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-6 border-t border-outline-variant/30">{children}</div>
      </div>
    </div>
  );
}

export function FormWizard() {
  const router = useRouter();
  const { currentStep, setStep, nextStep, prevStep, status, error, getFormData } =
    useCalculateurStore();

  const hasHydrated = useHasHydrated();

  const activeScenarioId = useCalculateurStore((state) => state.activeScenarioId);
  const scenarios = useCalculateurStore((state) => state.scenarios);
  const scenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  const { structure } = scenario;

  const { calculate, isLoading } = useCalculateur();

  useEffect(() => {
    if (status === 'success') {
      router.push('/calculateur/resultats');
    }
  }, [status, router]);

  const handleSubmit = useCallback(() => {
    const formData = getFormData() as CalculateurFormData;
    calculate(formData);
  }, [getFormData, calculate]);

  if (!hasHydrated) return null;

  const getActiveStepNumber = (step: number) => {
    return structure.type === 'nom_propre' && step > 4 ? step : step + 1;
  };

  return (
    <div className="px-4 py-8">
      <div className="max-w-2xl mx-auto mb-6">
        <ScenarioTabs />
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {error && (
          <div className="p-4 bg-error-container border border-error/20 rounded-lg">
            <p className="text-on-error-container text-sm">{error}</p>
          </div>
        )}

        {/* Step 1 : Bien */}
        <StepAccordion
          stepIndex={0}
          currentStep={currentStep}
          title={STEP_LABELS[0]}
          displayNumber={1}
          onOpen={() => setStep(0)}
        >
          <StepBien onNext={nextStep} />
        </StepAccordion>

        {/* Step 2 : Financement */}
        <StepAccordion
          stepIndex={1}
          currentStep={currentStep}
          title={STEP_LABELS[1]}
          displayNumber={2}
          onOpen={() => setStep(1)}
        >
          <StepFinancement onNext={nextStep} onPrev={prevStep} />
        </StepAccordion>

        {/* Step 3 : Exploitation */}
        <StepAccordion
          stepIndex={2}
          currentStep={currentStep}
          title={STEP_LABELS[2]}
          displayNumber={3}
          onOpen={() => setStep(2)}
        >
          <StepExploitation onNext={nextStep} onPrev={prevStep} />
        </StepAccordion>

        {/* Step 4 : Structure juridique */}
        <StepAccordion
          stepIndex={3}
          currentStep={currentStep}
          title={STEP_LABELS[3]}
          displayNumber={4}
          onOpen={() => setStep(3)}
        >
          <StepStructure onNext={nextStep} onPrev={prevStep} />
        </StepAccordion>

        {/* Step 5 : Associés (conditionnel) */}
        {structure.type !== 'nom_propre' && (
          <StepAccordion
            stepIndex={4}
            currentStep={currentStep}
            title={STEP_LABELS[4]}
            displayNumber={5}
            onOpen={() => setStep(4)}
          >
            <StepAssocies onNext={nextStep} onPrev={prevStep} />
          </StepAccordion>
        )}

        {/* Step 6 : Options */}
        <StepAccordion
          stepIndex={structure.type === 'nom_propre' ? 4 : 5}
          currentStep={currentStep}
          title={STEP_LABELS[5]}
          displayNumber={structure.type === 'nom_propre' ? 5 : 6}
          onOpen={() => setStep(structure.type === 'nom_propre' ? 4 : 5)}
        >
          <StepOptions onSubmit={handleSubmit} onPrev={prevStep} isLoading={isLoading} />
        </StepAccordion>
      </div>
    </div>
  );
}
