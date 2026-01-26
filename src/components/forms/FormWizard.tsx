'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, ProgressBar } from '@/components/ui';
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
    <div className="max-w-2xl mx-auto">
      {/* Barre de progression */}
      <div className="mb-8">
        <ProgressBar
          currentStep={displayStep}
          totalSteps={visibleSteps.length}
          labels={visibleSteps as unknown as string[]}
        />
      </div>

      {/* Carte du formulaire */}
      <Card>
        {/* Message d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Contenu de l'étape */}
        {renderStep()}
      </Card>

      {/* Navigation rapide (optionnel) */}
      <div className="mt-4 flex justify-center gap-2">
        {visibleSteps.map((_, index) => {
          const actualIndex = structure.type === 'nom_propre' && index >= 4
            ? index + 1
            : index;

          return (
            <button
              key={index}
              type="button"
              onClick={() => setStep(actualIndex)}
              disabled={actualIndex > currentStep}
              className={`w-2 h-2 rounded-full transition-colors ${
                actualIndex === currentStep
                  ? 'bg-primary-600'
                  : actualIndex < currentStep
                    ? 'bg-primary-300 hover:bg-primary-400'
                    : 'bg-gray-300'
              }`}
              aria-label={`Aller à l'étape ${index + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}
