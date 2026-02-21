'use client';

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Card, SideNavigation, type SideNavigationItem } from '@/components/ui';
import { ProgressStepper } from './ProgressStepper';
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

export function FormWizard() {
  const router = useRouter();
  const { currentStep, setStep, nextStep, prevStep, status, error, getFormData } =
    useCalculateurStore();

  const hasHydrated = useHasHydrated();

  // Récupérer le scénario actif de manière réactive - directement depuis le store
  const activeScenarioId = useCalculateurStore((state) => state.activeScenarioId);
  const scenarios = useCalculateurStore((state) => state.scenarios);
  const scenario = scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
  const { structure } = scenario;

  const { calculate, isLoading } = useCalculateur();

  // Rediriger vers les résultats si le calcul est réussi
  useEffect(() => {
    if (status === 'success') {
      router.push('/calculateur/resultats');
    }
  }, [status, router]);

  // Gérer la soumission finale
  // FIX BUG-CALC-01: Utiliser getFormData() pour toujours récupérer les valeurs fraîches du store
  // au lieu de capturer les variables statiques qui peuvent être obsolètes
  const handleSubmit = useCallback(() => {
    const formData = getFormData() as CalculateurFormData;
    calculate(formData);
  }, [getFormData, calculate]);

  // Déterminer les étapes à afficher selon la structure
  const visibleSteps =
    structure.type === 'nom_propre'
      ? STEP_LABELS.filter((_, index) => index !== 4) // Exclure l'étape Associés
      : STEP_LABELS;

  // Ajuster le currentStep pour l'affichage si nom propre
  const displayStep =
    structure.type === 'nom_propre' && currentStep > 4 ? currentStep - 1 : currentStep;

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

  // Construire les items pour le SideNavigation
  const sideNavItems: SideNavigationItem[] = visibleSteps.map((label, index) => {
    let itemStatus: 'current' | 'completed' | 'upcoming' = 'upcoming';
    if (index === displayStep) itemStatus = 'current';
    else if (index < displayStep || status === 'success') itemStatus = 'completed';

    // Trouver l'index réel pour le setStep
    const actualIndex = structure.type === 'nom_propre' && index >= 4 ? index + 1 : index;

    return {
      id: `step-${index}`,
      label,
      status: itemStatus,
      onClick:
        itemStatus !== 'upcoming' || status === 'success' ? () => setStep(actualIndex) : undefined,
    };
  });

  if (!hasHydrated) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 overflow-x-auto">
          <ScenarioTabs />
        </div>
      </div>

      {/* Grid Layout pour navigation latérale et formulaire */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8 items-start">
        {/* Navigation latérale sur bureau */}
        <SideNavigation
          items={sideNavItems}
          title="Étapes"
          className="hidden lg:block mt-8 sticky top-8"
        />

        <div className="w-full">
          {/* Stepper de progression (visible sur mobile/tablette en haut, gardé pour la progression) */}
          <div className="mb-8">
            <ProgressStepper
              currentStep={displayStep + 1}
              totalSteps={visibleSteps.length}
              onStepClick={(step) => {
                const actualIndex = structure.type === 'nom_propre' && step > 4 ? step : step - 1;
                setStep(actualIndex);
              }}
              isAllEnabled={status === 'success'}
            />
          </div>

          {/* Carte du formulaire */}
          <Card className="w-full">
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
      </div>
    </div>
  );
}
