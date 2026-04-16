'use client';

/**
 * UX-S06 — KPIs sidebar pour Step 2 (Financement)
 * Focus : Coût du crédit — indicateurs propres au financement
 * Affiche : Mensualité estimée, Part apport (%), Coût total crédit, TAEG approx
 */

import { CreditCard, PiggyBank, Percent, TrendingDown } from 'lucide-react';
import type { PreviewKPIs } from '@/types/calculateur';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { fmtEuro, fmtPercent } from '@/utils/kpiFormat';

interface Props {
  kpis: PreviewKPIs;
}

export function ResultsAnchorStep2({ kpis }: Props) {
  const financement = useCalculateurStore((s) => s.getActiveScenario().financement);

  const partApport: number | null =
    financement?.apport && kpis.investissementTotal && kpis.investissementTotal > 0
      ? (financement.apport / kpis.investissementTotal) * 100
      : null;

  return (
    <div className="space-y-4">
      {/* Mensualité estimée */}
      <div className="p-5 bg-white/50 rounded-2xl shadow-[0_4px_12px_rgba(27,67,50,0.06)]">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <CreditCard className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Mensualité
          </span>
        </div>
        <div className="text-3xl font-headline font-extrabold tracking-tighter text-primary">
          {fmtEuro(kpis.mensualiteEstimee)}
        </div>
      </div>

      {/* Part d'apport */}
      <div className="p-5 bg-white/50 rounded-2xl shadow-[0_4px_12px_rgba(27,67,50,0.06)]">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <TrendingDown className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Part d&apos;apport
          </span>
        </div>
        <div className="text-3xl font-headline font-extrabold tracking-tighter text-primary">
          {fmtPercent(partApport)}
        </div>
        {financement?.apport ? (
          <p className="text-[10px] text-primary/50 font-label mt-1">
            {fmtEuro(financement.apport)} sur l&apos;investissement total
          </p>
        ) : null}
      </div>

      {/* Coût total crédit */}
      <div className="p-5 bg-white/50 rounded-2xl shadow-[0_4px_12px_rgba(27,67,50,0.06)]">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <PiggyBank className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Coût total crédit
          </span>
        </div>
        <div className="text-3xl font-headline font-extrabold tracking-tighter text-primary">
          {fmtEuro(kpis.coutTotalCreditEstime)}
        </div>
      </div>

      {/* TAEG approximatif */}
      <div className="p-5 bg-white/50 rounded-2xl shadow-[0_4px_12px_rgba(27,67,50,0.06)]">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <Percent className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">TAEG</span>
        </div>
        <div className="text-3xl font-headline font-extrabold tracking-tighter text-primary">
          {fmtPercent(kpis.taegApprox, 2)}
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
