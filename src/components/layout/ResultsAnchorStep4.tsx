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
  const noiMensuel = computeNoiMensuel(kpis);

  // Taux d'effort HCSF simplifié : mensualité / (loyer × 70%)
  // Représente la part de la mensualité non couverte par les revenus locatifs pondérés
  const tauxEffortHCSF: number | null =
    kpis.mensualiteEstimee !== null && exploitation?.loyer_mensuel && exploitation.loyer_mensuel > 0
      ? (kpis.mensualiteEstimee / (exploitation.loyer_mensuel * 0.7)) * 100
      : null;

  const tauxEffortColor =
    tauxEffortHCSF === null
      ? 'text-primary/40'
      : tauxEffortHCSF <= 100
        ? 'text-primary'
        : tauxEffortHCSF <= 130
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
          Mensualité / (loyer × 70%) — seuil HCSF : 35 %
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
