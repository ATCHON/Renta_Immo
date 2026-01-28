'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui';
import { ProgressStepper } from './ProgressStepper';
import { StepBien } from './StepBien';
import { StepFinancement } from './StepFinancement';
import { StepExploitation } from './StepExploitation';
import { StepStructure } from './StepStructure';
import { StepAssocies } from './StepAssocies';
import { StepOptions } from './StepOptions';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { useCalculateur } from '@/hooks/useCalculateur';
import { STEP_LABELS } from '@/lib/constants';
import type { CalculateurFormData } from '@/types';

export function FormWizard() {
  const router = useRouter();
  const {
    currentStep,
    setStep,
    nextStep,
    prevStep,
    bien,
    financement,
    exploitation,
    structure,
    options,
    status,
    error,
  } = useCalculateurStore();

  const { calculate, isLoading } = useCalculateur();

  // Rediriger vers les résultats si le calcul est réussi
  useEffect(() => {
    if (status === 'success') {
      router.push('/calculateur/resultats');
    }
  }, [status, router]);

  // Gérer la soumission finale
  const handleSubmit = useCallback(() => {
    const formData: CalculateurFormData = {
      bien: bien as CalculateurFormData['bien'],
      financement: financement as CalculateurFormData['financement'],
      exploitation: exploitation as CalculateurFormData['exploitation'],
      structure: structure as CalculateurFormData['structure'],
      options: options,
    };

    calculate(formData);
  }, [bien, financement, exploitation, structure, options, calculate]);

  // Déterminer les étapes à afficher selon la structure
  const visibleSteps = structure.type === 'nom_propre'
    ? STEP_LABELS.filter((_, index) => index !== 4) // Exclure l'étape Associés
    : STEP_LABELS;

  // Ajuster le currentStep pour l'affichage si nom propre
  const displayStep = structure.type === 'nom_propre' && currentStep >= 4
    ? currentStep - 1
    : currentStep;

  // Rendre le composant de l'étape actuelle
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepBien onNext={nextStep} />;
      case 1:
        return <StepFinancement onNext={nextStep} onPrev={prevStep} />;
      case 2:
        return <StepExploitation onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <StepStructure onNext={nextStep} onPrev={prevStep} />;
      case 4:
        if (structure.type === 'nom_propre') {
          // Passer directement aux options
          return <StepOptions onSubmit={handleSubmit} onPrev={prevStep} isLoading={isLoading} />;
        }
        return <StepAssocies onNext={nextStep} onPrev={prevStep} />;
      case 5:
        return <StepOptions onSubmit={handleSubmit} onPrev={prevStep} isLoading={isLoading} />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Stepper de progression */}
      <ProgressStepper
        currentStep={displayStep + 1}
        totalSteps={visibleSteps.length}
        onStepClick={(step) => {
          const actualIndex = structure.type === 'nom_propre' && step > 4
            ? step
            : step - 1;
          setStep(actualIndex);
        }}
      />

      {/* Carte du formulaire */}
      <Card className="max-w-2xl mx-auto">
        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Contenu de l'étape */}
        {renderStep()}
      </Card>
    </div>
  );
}
