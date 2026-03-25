'use client';

/**
 * UX-S02a — Sidebar Results Anchor
 *
 * Affiche les KPIs temps réel (usePreviewKPIs) selon le step actif.
 * Sur mobile, se transforme en panneau glassmorphism fixé en bas.
 * Sur desktop, sidebar pleine hauteur.
 *
 * Référence maquette : simulateur_immobilier_unifi/code.html
 */

import { Download } from 'lucide-react';
import { usePreviewKPIs } from '@/hooks/usePreviewKPIs';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { DownloadPdfButton } from '@/components/results/DownloadPdfButton';
import type { CalculateurFormData } from '@/types';
import { ResultsAnchorStep1 } from './ResultsAnchorStep1';
import { ResultsAnchorStep2 } from './ResultsAnchorStep2';
import { ResultsAnchorStep3 } from './ResultsAnchorStep3';
import { ResultsAnchorStep4 } from './ResultsAnchorStep4';
import { ResultsAnchorStep5 } from './ResultsAnchorStep5';

export type SidebarStep = 1 | 2 | 3 | 4 | 5;

interface ResultsAnchorProps {
  currentStep: SidebarStep;
  /** Mode compact pour mobile (bottom panel) */
  compact?: boolean;
}

const STEP_LABELS: Record<SidebarStep, string> = {
  1: 'Bien',
  2: 'Financement',
  3: 'Revenus',
  4: 'Charges',
  5: 'Fiscalité',
};

function StepKPIs({ step, kpis }: { step: SidebarStep; kpis: ReturnType<typeof usePreviewKPIs> }) {
  switch (step) {
    case 1:
      return <ResultsAnchorStep1 kpis={kpis} />;
    case 2:
      return <ResultsAnchorStep2 kpis={kpis} />;
    case 3:
      return <ResultsAnchorStep3 kpis={kpis} />;
    case 4:
      return <ResultsAnchorStep4 kpis={kpis} />;
    case 5:
      return <ResultsAnchorStep5 kpis={kpis} />;
  }
}

export function ResultsAnchor({ currentStep, compact = false }: ResultsAnchorProps) {
  const kpis = usePreviewKPIs();
  const scenario = useCalculateurStore((s) => s.getActiveScenario());
  const getFormData = useCalculateurStore((s) => s.getFormData);
  const hasResults = scenario.resultats !== null;

  if (compact) {
    // Mobile : résumé compact en 2 colonnes
    return (
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-[10px] font-headline font-bold uppercase tracking-wider opacity-60 mb-0.5">
              Rendement
            </div>
            <div className="text-lg font-headline font-extrabold text-primary">
              {kpis.rendementBrut !== null
                ? `~${kpis.rendementBrut.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`
                : '—'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-headline font-bold uppercase tracking-wider opacity-60 mb-0.5">
              Cash-flow
            </div>
            <div
              className={`text-lg font-headline font-extrabold ${kpis.cashflowMensuelEstime !== null && kpis.cashflowMensuelEstime < 0 ? 'text-error' : 'text-primary'}`}
            >
              {kpis.cashflowMensuelEstime !== null
                ? `~${kpis.cashflowMensuelEstime.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`
                : '—'}
            </div>
          </div>
          {kpis.mensualiteEstimee !== null && (
            <div className="text-center">
              <div className="text-[10px] font-headline font-bold uppercase tracking-wider opacity-60 mb-0.5">
                Mensualité
              </div>
              <div className="text-lg font-headline font-extrabold text-primary">
                ~{kpis.mensualiteEstimee.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
              </div>
            </div>
          )}
          {kpis.investissementTotal !== null && (
            <div className="text-center">
              <div className="text-[10px] font-headline font-bold uppercase tracking-wider opacity-60 mb-0.5">
                Investissement
              </div>
              <div className="text-lg font-headline font-extrabold text-primary">
                ~
                {(kpis.investissementTotal / 1000).toLocaleString('fr-FR', {
                  maximumFractionDigits: 0,
                })}{' '}
                k€
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop : sidebar pleine hauteur
  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto">
      {/* En-tête */}
      <div className="mb-8 flex-shrink-0">
        <p className="text-primary font-headline font-bold uppercase tracking-widest text-xs mb-1 opacity-60">
          Results Anchor
        </p>
        <h2 className="font-headline font-extrabold text-2xl tracking-tight text-primary">
          Calculs en direct
        </h2>
        <div className="flex gap-1 mt-3">
          {([1, 2, 3, 4, 5] as SidebarStep[]).map((step) => (
            <div
              key={step}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                step <= currentStep ? 'bg-primary' : 'bg-primary/20'
              }`}
              title={STEP_LABELS[step]}
              aria-label={`Étape ${step} : ${STEP_LABELS[step]}${step <= currentStep ? ' (actif)' : ''}`}
            />
          ))}
        </div>
        <p className="text-xs font-label text-primary/50 mt-2">
          Étape {currentStep} — {STEP_LABELS[currentStep]}
        </p>
      </div>

      {/* KPIs dynamiques selon le step */}
      <div className="flex-1">
        <StepKPIs step={currentStep} kpis={kpis} />
      </div>

      {/* Bouton PDF */}
      <div className="mt-8 flex-shrink-0">
        {hasResults ? (
          <DownloadPdfButton
            formData={getFormData() as CalculateurFormData}
            resultats={scenario.resultats!}
            className="w-full py-3 rounded-xl font-headline font-bold text-sm"
          />
        ) : (
          <button
            type="button"
            disabled
            className="w-full py-3 flex items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary/40 font-headline font-bold text-sm cursor-not-allowed"
            title="Lancez la simulation pour télécharger le rapport"
          >
            <Download className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            Télécharger le rapport
          </button>
        )}
        {!hasResults && (
          <p className="text-[10px] text-center text-primary/40 font-label mt-1.5">
            Disponible après soumission du formulaire
          </p>
        )}
      </div>
    </div>
  );
}
