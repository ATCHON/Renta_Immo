'use client';

/**
 * UX-S06 — KPIs sidebar pour Step 3 (Exploitation / revenus locatifs)
 * Focus : Rentabilité opérationnelle — 1ère apparition significative
 * Affiche : Cash-flow mensuel, Rendement brut, Ratio loyer/mensualité
 */

import { Banknote, TrendingUp, Scale } from 'lucide-react';
import type { PreviewKPIs } from '@/types/calculateur';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { fmtEuro, fmtPercent } from '@/utils/kpiFormat';

interface Props {
  kpis: PreviewKPIs;
}

export function ResultsAnchorStep3({ kpis }: Props) {
  const exploitation = useCalculateurStore((s) => s.getActiveScenario().exploitation);

  const cashflowColor =
    kpis.cashflowMensuelEstime !== null && kpis.cashflowMensuelEstime >= 0
      ? 'text-primary'
      : 'text-error';

  // Ratio loyer / mensualité (couverture de la dette par le loyer)
  const ratioLoyerMensualite: number | null =
    exploitation?.loyer_mensuel &&
    exploitation.loyer_mensuel > 0 &&
    kpis.mensualiteEstimee &&
    kpis.mensualiteEstimee > 0
      ? exploitation.loyer_mensuel / kpis.mensualiteEstimee
      : null;

  const ratioColor =
    ratioLoyerMensualite === null
      ? 'text-primary/40'
      : ratioLoyerMensualite >= 1.1
        ? 'text-primary'
        : ratioLoyerMensualite >= 0.9
          ? 'text-warning'
          : 'text-error';

  return (
    <div className="space-y-4">
      {/* Cash-flow mensuel */}
      <div className="p-5 bg-white/50 rounded-2xl shadow-[0_4px_12px_rgba(27,67,50,0.06)]">
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

      {/* Ratio loyer / mensualité */}
      <div className="p-5 bg-white/50 rounded-2xl shadow-[0_4px_12px_rgba(27,67,50,0.06)]">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <Scale className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Couverture mensualité
          </span>
        </div>
        <div className={`text-3xl font-headline font-extrabold tracking-tighter ${ratioColor}`}>
          {ratioLoyerMensualite !== null
            ? `×${ratioLoyerMensualite.toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`
            : '—'}
        </div>
        <p className="text-[10px] text-primary/50 font-label mt-1">
          {ratioLoyerMensualite !== null && ratioLoyerMensualite >= 1
            ? 'Le loyer couvre la mensualité'
            : ratioLoyerMensualite !== null
              ? 'Le loyer ne couvre pas la mensualité'
              : 'Ratio loyer / mensualité'}
        </p>
      </div>
    </div>
  );
}
