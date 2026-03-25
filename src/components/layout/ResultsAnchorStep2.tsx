'use client';

/**
 * UX-S02a — KPIs sidebar pour Step 2 (Financement)
 * Affiche : Mensualité, Coût total crédit, TAEG
 */

import { CreditCard, PiggyBank, Percent } from 'lucide-react';
import type { PreviewKPIs } from '@/types/calculateur';

interface Props {
  kpis: PreviewKPIs;
}

function fmt(value: number | null, type: 'percent' | 'euro'): string {
  if (value === null) return '—';
  if (type === 'percent') {
    return `~${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
  }
  if (value >= 1_000_000) {
    return `~${(value / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} M€`;
  }
  if (value >= 1_000) {
    return `~${(value / 1_000).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} k€`;
  }
  return `~${value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`;
}

export function ResultsAnchorStep2({ kpis }: Props) {
  return (
    <div className="space-y-4">
      {/* Mensualité */}
      <div className="p-5 bg-white/40 rounded-2xl">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <CreditCard className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Mensualité
          </span>
        </div>
        <div className="text-3xl font-headline font-extrabold tracking-tighter text-primary">
          {fmt(kpis.mensualiteEstimee, 'euro')}
        </div>
      </div>

      {/* Coût total crédit */}
      <div className="p-5 bg-white/40 rounded-2xl">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <PiggyBank className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Coût total crédit
          </span>
        </div>
        <div className="text-3xl font-headline font-extrabold tracking-tighter text-primary">
          {fmt(kpis.coutTotalCreditEstime, 'euro')}
        </div>
      </div>

      {/* TAEG */}
      <div className="p-5 bg-white/40 rounded-2xl">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <Percent className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">TAEG</span>
        </div>
        <div className="text-3xl font-headline font-extrabold tracking-tighter text-primary">
          {fmt(kpis.taegApprox, 'percent')}
        </div>
        {kpis.taegApprox !== null && (
          <p className="text-[10px] text-primary/50 font-label mt-1">
            Valeur approximative — TAEG exact calculé à la soumission
          </p>
        )}
      </div>
    </div>
  );
}
