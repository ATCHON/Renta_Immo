'use client';

/**
 * UX-S02a — KPIs sidebar pour Step 5 (Fiscalité / Structure / Options)
 * Affiche : Projection cashflow (net-net approx), Rendement net-net approx
 */

import { TrendingUp, Banknote } from 'lucide-react';
import type { PreviewKPIs } from '@/types/calculateur';
import { fmtEuro, fmtPercent } from '@/utils/kpiFormat';

interface Props {
  kpis: PreviewKPIs;
}

export function ResultsAnchorStep5({ kpis }: Props) {
  const cashflowColor =
    kpis.cashflowMensuelEstime !== null && kpis.cashflowMensuelEstime >= 0
      ? 'text-primary'
      : 'text-error';

  return (
    <div className="space-y-4">
      {/* Projection cashflow net-net */}
      <div className="p-5 bg-white/40 rounded-2xl">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <Banknote className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Cash-flow net-net
          </span>
        </div>
        <div className={`text-3xl font-headline font-extrabold tracking-tighter ${cashflowColor}`}>
          {fmtEuro(kpis.cashflowMensuelEstime)}
        </div>
        <p className="text-[10px] text-primary/50 font-label mt-1">
          Avant optimisation fiscale — affinement à la soumission
        </p>
      </div>

      {/* Rendement net-net */}
      <div className="p-5 bg-white/40 rounded-2xl">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <TrendingUp className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Rendement net-net
          </span>
        </div>
        <div className="text-3xl font-headline font-extrabold tracking-tighter text-primary">
          {fmtPercent(kpis.rendementBrut)}
        </div>
        <p className="text-[10px] text-primary/50 font-label mt-1">
          Résultat précis après soumission du régime fiscal
        </p>
      </div>
    </div>
  );
}
