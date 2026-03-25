'use client';

/**
 * UX-S02a — KPIs sidebar pour Step 4 (Charges annuelles)
 * Affiche : Rendement net projeté (approx = rendementBrut), NOI mensuel (approx = cashflow + mensualité)
 */

import { TrendingUp, Activity } from 'lucide-react';
import type { PreviewKPIs } from '@/types/calculateur';

interface Props {
  kpis: PreviewKPIs;
}

function fmtPercent(value: number | null): string {
  if (value === null) return '—';
  return `~${value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}

function fmtEuro(value: number | null): string {
  if (value === null) return '—';
  if (value >= 1_000) {
    return `~${(value / 1_000).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} k€`;
  }
  return `~${value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`;
}

/** Approximation NOI mensuel = cashflow + mensualité (valeur brute avant service de la dette) */
function computeNoiMensuel(kpis: PreviewKPIs): number | null {
  if (kpis.cashflowMensuelEstime === null || kpis.mensualiteEstimee === null) return null;
  return kpis.cashflowMensuelEstime + kpis.mensualiteEstimee;
}

export function ResultsAnchorStep4({ kpis }: Props) {
  const noiMensuel = computeNoiMensuel(kpis);

  return (
    <div className="space-y-4">
      {/* Rendement net projeté (approximation) */}
      <div className="p-5 bg-white/40 rounded-2xl">
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
          Approx. — affinement à la soumission
        </p>
      </div>

      {/* NOI mensuel */}
      <div className="p-5 bg-white/40 rounded-2xl">
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
    </div>
  );
}
