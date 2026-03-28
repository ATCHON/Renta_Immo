'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Check, Lock } from 'lucide-react';

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
  recap,
  onOpen,
  children,
}: {
  stepIndex: number;
  currentStep: number;
  title: string;
  displayNumber: number;
  recap?: string;
  onOpen: () => void;
  children: React.ReactNode;
}) {
  const isOpen = currentStep === stepIndex;
  const isPast = stepIndex < currentStep;
  const isFuture = stepIndex > currentStep;

  return (
    <div
      className={cn(
        'overflow-hidden transition-all',
        isOpen
          ? 'rounded-[2rem] bg-surface-container-lowest ring-2 ring-primary/15'
          : 'rounded-2xl bg-surface-container-low',
        isFuture ? 'opacity-40' : ''
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          'w-full px-6 py-5 flex items-center justify-between transition-colors text-left',
          isOpen
            ? 'bg-surface-container-lowest'
            : 'bg-surface-container-low hover:bg-surface-container'
        )}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors',
              isOpen || isPast
                ? 'bg-primary text-on-primary'
                : 'bg-surface text-on-surface-variant border border-outline-variant'
            )}
          >
            {isPast ? (
              <Check className="w-4 h-4" />
            ) : isFuture ? (
              <Lock className="w-3.5 h-3.5" />
            ) : (
              displayNumber
            )}
          </div>
          <div className="flex flex-col">
            <span
              className={cn(
                'transition-all',
                isOpen
                  ? 'text-2xl font-headline font-extrabold tracking-tighter text-primary'
                  : 'text-base font-medium text-on-surface'
              )}
            >
              {title}
            </span>
            {isPast && recap && (
              <p className="text-xs text-on-surface-variant/60 mt-0.5 font-label">{recap}</p>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-on-surface-variant" />
        ) : (
          <ChevronDown className="h-5 w-5 text-on-surface-variant" />
        )}
      </button>
      <div
        aria-hidden={!isOpen}
        ref={(el) => {
          if (el) el.inert = !isOpen;
        }}
        className={cn(
          'transition-all duration-normal ease-out overflow-hidden',
          isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-8 border-t border-outline-variant/10">{children}</div>
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
  const { structure, bien, financement, exploitation } = scenario;

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
          recap={
            bien?.prix_achat
              ? `${bien.type_bien} • ${bien.prix_achat.toLocaleString('fr-FR')} €`
              : undefined
          }
          onOpen={() => setStep(currentStep === 0 ? -1 : 0)}
        >
          <StepBien onNext={nextStep} />
        </StepAccordion>

        {/* Step 2 : Financement */}
        <StepAccordion
          stepIndex={1}
          currentStep={currentStep}
          title={STEP_LABELS[1]}
          displayNumber={2}
          recap={
            bien?.prix_achat != null &&
            financement?.apport != null &&
            financement?.duree_emprunt != null
              ? `${(bien.prix_achat - financement.apport).toLocaleString('fr-FR')} € emprunté • ${financement.duree_emprunt} ans`
              : undefined
          }
          onOpen={() => setStep(currentStep === 1 ? -1 : 1)}
        >
          <StepFinancement onNext={nextStep} onPrev={prevStep} />
        </StepAccordion>

        {/* Step 3 : Exploitation */}
        <StepAccordion
          stepIndex={2}
          currentStep={currentStep}
          title={STEP_LABELS[2]}
          displayNumber={3}
          recap={
            exploitation?.loyer_mensuel
              ? `${exploitation.loyer_mensuel.toLocaleString('fr-FR')} €/mois`
              : undefined
          }
          onOpen={() => setStep(currentStep === 2 ? -1 : 2)}
        >
          <StepExploitation onNext={nextStep} onPrev={prevStep} />
        </StepAccordion>

        {/* Step 4 : Structure juridique */}
        <StepAccordion
          stepIndex={3}
          currentStep={currentStep}
          title={STEP_LABELS[3]}
          displayNumber={4}
          recap={structure?.regime_fiscal ?? undefined}
          onOpen={() => setStep(currentStep === 3 ? -1 : 3)}
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
            onOpen={() => setStep(currentStep === 4 ? -1 : 4)}
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
          onOpen={() =>
            setStep(
              currentStep === (structure.type === 'nom_propre' ? 4 : 5)
                ? -1
                : structure.type === 'nom_propre'
                  ? 4
                  : 5
            )
          }
        >
          <StepOptions onSubmit={handleSubmit} onPrev={prevStep} isLoading={isLoading} />
        </StepAccordion>
      </div>
    </div>
  );
}
