'use client';

/**
 * UX-S02a — KPIs sidebar pour Step 3 (Revenus locatifs)
 * Affiche : Cash-flow mensuel, Rendement brut
 */

import { TrendingUp, Banknote } from 'lucide-react';
import type { PreviewKPIs } from '@/types/calculateur';
import { fmtEuro, fmtPercent } from '@/utils/kpiFormat';

interface Props {
  kpis: PreviewKPIs;
}

export function ResultsAnchorStep3({ kpis }: Props) {
  const cashflowColor =
    kpis.cashflowMensuelEstime !== null && kpis.cashflowMensuelEstime >= 0
      ? 'text-primary'
      : 'text-error';

  return (
    <div className="space-y-4">
      {/* Cash-flow mensuel */}
      <div className="p-5 bg-white/40 rounded-2xl">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <Banknote className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Cash-flow mensuel
          </span>
        </div>
        <div className={`text-3xl font-headline font-extrabold tracking-tighter ${cashflowColor}`}>
          {fmtEuro(kpis.cashflowMensuelEstime)}
        </div>
        {kpis.cashflowMensuelEstime !== null && kpis.cashflowMensuelEstime < 0 && (
          <p className="text-[10px] text-error/70 font-label mt-1">
            Effort d&apos;épargne mensuel requis
          </p>
        )}
      </div>

      {/* Rendement brut */}
      <div className="p-5 bg-white/40 rounded-2xl">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <TrendingUp className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Rendement brut
          </span>
        </div>
        <div className="text-3xl font-headline font-extrabold tracking-tighter text-primary">
          {fmtPercent(kpis.rendementBrut)}
        </div>
      </div>
    </div>
  );
}
