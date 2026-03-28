'use client';

/**
 * UX-S02a — KPIs sidebar pour Step 5 (Options / Structure / Fiscalité)
 * Design cohérent avec steps 1-4 : KPI cards blanches + dark card projection
 */

import { TrendingUp, Banknote, Scale } from 'lucide-react';
import type { PreviewKPIs } from '@/types/calculateur';
import { fmtEuro, fmtPercent } from '@/utils/kpiFormat';

interface Props {
  kpis: PreviewKPIs;
}

/** Hauteurs relatives des barres du mini chart */
const BAR_HEIGHTS = [35, 50, 45, 65, 60, 75, 80, 100];

export function ResultsAnchorStep5({ kpis }: Props) {
  const cashflowPositif = kpis.cashflowMensuelEstime !== null && kpis.cashflowMensuelEstime >= 0;

  return (
    <div className="space-y-4">
      {/* Rendement brut */}
      <div className="p-5 bg-white/50 rounded-2xl shadow-[0_4px_12px_rgba(27,67,50,0.06)]">
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

      {/* Cash-flow mensuel */}
      <div className="p-5 bg-white/50 rounded-2xl shadow-[0_4px_12px_rgba(27,67,50,0.06)]">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <Banknote className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Cash-flow mensuel
          </span>
        </div>
        <div
          className={`text-3xl font-headline font-extrabold tracking-tighter ${
            cashflowPositif ? 'text-primary' : 'text-error'
          }`}
        >
          {fmtEuro(kpis.cashflowMensuelEstime)}
        </div>
      </div>

      {/* Carte sombre — Projection actuelle */}
      <div className="p-5 bg-primary-container rounded-3xl space-y-4">
        <div className="flex items-center gap-2 mb-1 opacity-80">
          <Scale
            className="h-4 w-4 text-on-primary-container"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-primary-container">
            Projection actuelle
          </span>
        </div>

        {/* Net-net yield */}
        <div>
          <span className="text-3xl font-headline font-extrabold text-white tracking-tighter">
            {fmtPercent(kpis.rendementBrut)}
          </span>
          <p className="text-sm text-on-primary-container font-medium mt-0.5">Rendement brut</p>
        </div>

        {/* Cash-flow mensuel */}
        <div className="flex items-center gap-2">
          <span
            className={`text-lg font-headline font-extrabold tracking-tighter ${
              cashflowPositif ? 'text-primary-fixed' : 'text-tertiary-fixed'
            }`}
          >
            {fmtEuro(kpis.cashflowMensuelEstime)}
          </span>
          <span className="text-xs text-on-primary-container font-label">/mois</span>
        </div>

        {/* Mini bar chart décoratif */}
        <div
          className="h-14 w-full bg-primary flex items-end gap-1 px-2 pb-2 rounded-xl overflow-hidden"
          aria-hidden="true"
        >
          {BAR_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-on-primary-container/60 hover:bg-on-primary-container transition-colors"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>

        <p className="text-[10px] text-on-primary-container/70 font-label">
          Résultat précis après soumission du régime fiscal
        </p>
      </div>
    </div>
  );
}
