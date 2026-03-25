'use client';

/**
 * UX-S02a — KPIs sidebar pour Step 1 (Bien)
 * Affiche : Rendement brut, Mensualité estimée, Investissement total, mini bar chart
 */

import { TrendingUp, CreditCard, Wallet, BarChart2 } from 'lucide-react';
import type { PreviewKPIs } from '@/types/calculateur';

interface Props {
  kpis: PreviewKPIs;
}

function fmt(value: number | null, type: 'percent' | 'euro'): string {
  if (value === null) return '—';
  if (type === 'percent') {
    return `~${value.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
  }
  if (value >= 1_000_000) {
    return `~${(value / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} M€`;
  }
  if (value >= 1_000) {
    return `~${(value / 1_000).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} k€`;
  }
  return `~${value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`;
}

/** Hauteurs relatives des barres du mini chart (8 colonnes = 8 années fictives) */
const BAR_HEIGHTS = [30, 42, 38, 55, 62, 70, 78, 90];

export function ResultsAnchorStep1({ kpis }: Props) {
  return (
    <div className="space-y-4">
      {/* Rendement brut */}
      <div className="p-5 bg-white/40 rounded-2xl">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <TrendingUp className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Rendement brut
          </span>
        </div>
        <div className="text-3xl font-headline font-extrabold tracking-tighter text-primary">
          {fmt(kpis.rendementBrut, 'percent')}
        </div>
      </div>

      {/* Mensualité estimée */}
      <div className="p-5 bg-white/40 rounded-2xl">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <CreditCard className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Mensualité est.
          </span>
        </div>
        <div className="text-3xl font-headline font-extrabold tracking-tighter text-primary">
          {fmt(kpis.mensualiteEstimee, 'euro')}
        </div>
      </div>

      {/* Investissement total */}
      <div className="p-5 bg-white/40 rounded-2xl">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <Wallet className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Investissement total
          </span>
        </div>
        <div className="text-3xl font-headline font-extrabold tracking-tighter text-primary">
          {fmt(kpis.investissementTotal, 'euro')}
        </div>
      </div>

      {/* Mini bar chart cash-flow */}
      <div className="p-5 bg-white/40 rounded-2xl">
        <div className="flex items-center gap-2 mb-4 opacity-70">
          <BarChart2 className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Cash-flow (projection)
          </span>
        </div>
        <div className="flex items-end gap-1 h-16 w-full" aria-hidden="true">
          {BAR_HEIGHTS.map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-primary/20 hover:bg-primary/40 transition-colors"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[10px] font-headline font-bold opacity-40 uppercase tracking-widest">
            An 1
          </span>
          <span className="text-[10px] font-headline font-bold opacity-40 uppercase tracking-widest">
            An 20
          </span>
        </div>
        <div className="mt-2 text-center text-sm font-headline font-extrabold tracking-tighter text-primary">
          {fmt(kpis.cashflowMensuelEstime, 'euro')}
          <span className="text-xs font-label font-medium opacity-60 ml-1">/mois</span>
        </div>
      </div>
    </div>
  );
}
