'use client';

/**
 * UX-S06 — KPIs sidebar pour Step 4 (Structure juridique / fiscalité)
 * Focus : Revenus nets avant impôt et capacité d'endettement
 * Affiche : NOI mensuel, Taux d'effort HCSF simplifié, Rendement net projeté (approx)
 */

import { Activity, Shield, TrendingUp } from 'lucide-react';
import type { PreviewKPIs } from '@/types/calculateur';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { fmtEuro, fmtPercent } from '@/utils/kpiFormat';

interface Props {
  kpis: PreviewKPIs;
}

/** NOI mensuel = cashflow + mensualité (revenus nets avant service de la dette) */
function computeNoiMensuel(kpis: PreviewKPIs): number | null {
  if (kpis.cashflowMensuelEstime === null || kpis.mensualiteEstimee === null) return null;
  return kpis.cashflowMensuelEstime + kpis.mensualiteEstimee;
}

export function ResultsAnchorStep4({ kpis }: Props) {
  const exploitation = useCalculateurStore((s) => s.getActiveScenario().exploitation);
  const structure = useCalculateurStore((s) => s.getActiveScenario().structure);
  const noiMensuel = computeNoiMensuel(kpis);

  // Taux d'endettement HCSF : charges mensuelles totales / revenus mensuels pondérés
  // Formule de référence (page "Comment ça marche" > Fiscalité & Normes HCSF) :
  //   Revenus = revenus_activite + loyer_mensuel×70% + loyers_actuels×70%
  //   Charges = mensualité_crédit + crédits_immobiliers_existants + autres_charges
  const revenusMensuels =
    (structure?.revenus_activite ?? 0) +
    (exploitation?.loyer_mensuel ?? 0) * 0.7 +
    (structure?.loyers_actuels ?? 0) * 0.7;

  const chargesMensuelles =
    (kpis.mensualiteEstimee ?? 0) +
    (structure?.credits_immobiliers ?? 0) +
    (structure?.autres_charges ?? 0);

  const tauxEffortHCSF: number | null =
    revenusMensuels > 0 ? (chargesMensuelles / revenusMensuels) * 100 : null;

  // Seuils couleur alignés HCSF 2026 : ≤35% conforme | 35-50% limite | >50% non conforme
  const tauxEffortColor =
    tauxEffortHCSF === null
      ? 'text-primary/40'
      : tauxEffortHCSF <= 35
        ? 'text-primary'
        : tauxEffortHCSF <= 50
          ? 'text-warning'
          : 'text-error';

  return (
    <div className="space-y-4">
      {/* NOI mensuel */}
      <div className="p-5 bg-white/50 rounded-2xl shadow-[0_4px_12px_rgba(27,67,50,0.06)]">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <Activity className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            NOI mensuel
          </span>
        </div>
        <div className="text-3xl font-headline font-extrabold tracking-tighter text-primary">
          {fmtEuro(noiMensuel)}
        </div>
        <p className="text-[10px] text-primary/50 font-label mt-1">
          Revenus nets avant service de la dette
        </p>
      </div>

      {/* Taux d'effort HCSF simplifié */}
      <div className="p-5 bg-white/50 rounded-2xl shadow-[0_4px_12px_rgba(27,67,50,0.06)]">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <Shield className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Taux d&apos;effort HCSF
          </span>
        </div>
        <div
          className={`text-3xl font-headline font-extrabold tracking-tighter ${tauxEffortColor}`}
        >
          {tauxEffortHCSF !== null
            ? `~${tauxEffortHCSF.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} %`
            : '—'}
        </div>
        <p className="text-[10px] text-primary/50 font-label mt-1">
          Charges / Revenus pondérés — seuil HCSF : 35 %
        </p>
      </div>

      {/* Rendement net projeté (approximation) */}
      <div className="p-5 bg-white/50 rounded-2xl shadow-[0_4px_12px_rgba(27,67,50,0.06)]">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <TrendingUp className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Rendement net proj.
          </span>
        </div>
        <div className="text-3xl font-headline font-extrabold tracking-tighter text-primary">
          {fmtPercent(kpis.rendementBrut)}
        </div>
        <p className="text-[10px] text-primary/50 font-label mt-1">
          Approx. — affinement fiscal à la soumission
        </p>
      </div>
    </div>
  );
}
