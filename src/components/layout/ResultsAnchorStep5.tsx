'use client';

/**
 * UX-S06 — KPIs sidebar pour Step 5 (Options / synthèse finale)
 * Focus : Récapitulatif global avant soumission
 * Affiche : Carte synthèse (Rendement + Cash-flow + Investissement) + mini chart + CTA
 */

import { TrendingUp, Banknote, Wallet, Calculator, CheckCircle2, AlertCircle } from 'lucide-react';
import type { PreviewKPIs } from '@/types/calculateur';
import { fmtEuro, fmtPercent } from '@/utils/kpiFormat';

interface Props {
  kpis: PreviewKPIs;
}

export function ResultsAnchorStep5({ kpis }: Props) {
  const cashflowPositif = kpis.cashflowMensuelEstime !== null && kpis.cashflowMensuelEstime >= 0;

  return (
    <div className="space-y-4">
      {/* Carte synthèse foncée */}
      <div className="p-5 bg-primary-container rounded-3xl space-y-4">
        <div className="flex items-center gap-2 mb-1 opacity-80">
          <TrendingUp
            className="h-4 w-4 text-on-primary-container"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-primary-container">
            Synthèse de votre projet
          </span>
        </div>

        {/* Rendement brut */}
        <div>
          <div className="flex items-center gap-1.5 opacity-70 mb-0.5">
            <TrendingUp className="h-3 w-3 text-on-primary-container" strokeWidth={1.5} />
            <span className="text-[9px] font-headline font-bold uppercase tracking-wider text-on-primary-container">
              Rendement brut
            </span>
          </div>
          <span className="text-3xl font-headline font-extrabold text-white tracking-tighter">
            {fmtPercent(kpis.rendementBrut)}
          </span>
        </div>

        {/* Cash-flow mensuel */}
        <div>
          <div className="flex items-center gap-1.5 opacity-70 mb-0.5">
            <Banknote className="h-3 w-3 text-on-primary-container" strokeWidth={1.5} />
            <span className="text-[9px] font-headline font-bold uppercase tracking-wider text-on-primary-container">
              Cash-flow mensuel
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xl font-headline font-extrabold tracking-tighter ${
                cashflowPositif ? 'text-primary-fixed' : 'text-tertiary-fixed'
              }`}
            >
              {fmtEuro(kpis.cashflowMensuelEstime)}
            </span>
            <span className="text-xs text-on-primary-container/70 font-label">/mois</span>
          </div>
        </div>

        {/* Investissement total */}
        <div>
          <div className="flex items-center gap-1.5 opacity-70 mb-0.5">
            <Wallet className="h-3 w-3 text-on-primary-container" strokeWidth={1.5} />
            <span className="text-[9px] font-headline font-bold uppercase tracking-wider text-on-primary-container">
              Investissement total
            </span>
          </div>
          <span className="text-xl font-headline font-extrabold text-white tracking-tighter">
            {kpis.investissementTotal !== null
              ? `~${(kpis.investissementTotal / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} k€`
              : '—'}
          </span>
        </div>

        {/* Mensualité estimée */}
        <div>
          <div className="flex items-center gap-1.5 opacity-70 mb-0.5">
            <Calculator className="h-3 w-3 text-on-primary-container" strokeWidth={1.5} />
            <span className="text-[9px] font-headline font-bold uppercase tracking-wider text-on-primary-container">
              Mensualité estimée
            </span>
          </div>
          <span className="text-xl font-headline font-extrabold text-white tracking-tighter">
            {fmtEuro(kpis.mensualiteEstimee)}
          </span>
        </div>

        {/* Badge statut autofinancement */}
        {kpis.cashflowMensuelEstime !== null && (
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-headline font-bold ${
              cashflowPositif
                ? 'bg-primary-fixed/20 text-primary-fixed'
                : 'bg-tertiary-fixed/20 text-tertiary-fixed'
            }`}
          >
            {cashflowPositif ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
            )}
            {cashflowPositif
              ? 'Autofinancé'
              : `Effort d'épargne : ${fmtEuro(Math.abs(kpis.cashflowMensuelEstime))}/mois`}
          </div>
        )}
      </div>

      {/* Note CTA */}
      <div className="px-1">
        <p className="text-[10px] text-primary/50 font-label text-center leading-relaxed">
          Soumettez pour obtenir l&apos;analyse complète : score, fiscalité, TRI, plus-value
        </p>
      </div>
    </div>
  );
}
