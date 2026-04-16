'use client';

/**
 * UX-S06 — KPIs sidebar pour Step 1 (Bien immobilier)
 * Focus : Évaluation du bien — indicateurs propres à l'asset
 * Affiche : Prix au m², Investissement total, Frais notaire estimés
 */

import { MapPin, Wallet, Receipt } from 'lucide-react';
import type { PreviewKPIs } from '@/types/calculateur';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { fmtEuro } from '@/utils/kpiFormat';

interface Props {
  kpis: PreviewKPIs;
}

function fmtEuroPerM2(value: number | null): string {
  if (value === null || !isFinite(value)) return '—';
  return `~${value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €/m²`;
}

export function ResultsAnchorStep1({ kpis }: Props) {
  const bien = useCalculateurStore((s) => s.getActiveScenario().bien);

  const prixAuM2: number | null =
    bien?.prix_achat && bien?.surface && bien.surface > 0 ? bien.prix_achat / bien.surface : null;

  // Frais notaire = investissementTotal - prix_achat - travaux
  const fraisNotaire: number | null =
    kpis.investissementTotal !== null && bien?.prix_achat
      ? kpis.investissementTotal - bien.prix_achat - (bien.montant_travaux ?? 0)
      : bien?.prix_achat
        ? bien.prix_achat * 0.08
        : null;

  return (
    <div className="space-y-4">
      {/* Prix au m² */}
      <div className="p-5 bg-white/50 rounded-2xl shadow-[0_4px_12px_rgba(27,67,50,0.06)]">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <MapPin className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Prix au m²
          </span>
        </div>
        <div className="text-3xl font-headline font-extrabold tracking-tighter text-primary">
          {fmtEuroPerM2(prixAuM2)}
        </div>
        {prixAuM2 === null && bien?.prix_achat && !bien?.surface && (
          <p className="text-[10px] text-primary/50 font-label mt-1">
            Renseignez la surface pour calculer
          </p>
        )}
      </div>

      {/* Investissement total */}
      <div className="p-5 bg-white/50 rounded-2xl shadow-[0_4px_12px_rgba(27,67,50,0.06)]">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <Wallet className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Investissement total
          </span>
        </div>
        <div className="text-3xl font-headline font-extrabold tracking-tighter text-primary">
          {fmtEuro(kpis.investissementTotal)}
        </div>
        <p className="text-[10px] text-primary/50 font-label mt-1">
          Prix + travaux + frais notaire
        </p>
      </div>

      {/* Frais notaire estimés */}
      <div className="p-5 bg-white/50 rounded-2xl shadow-[0_4px_12px_rgba(27,67,50,0.06)]">
        <div className="flex items-center gap-2 mb-2 opacity-70">
          <Receipt className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[10px] font-headline font-bold uppercase tracking-wider">
            Frais notaire est.
          </span>
        </div>
        <div className="text-3xl font-headline font-extrabold tracking-tighter text-primary">
          {fmtEuro(fraisNotaire)}
        </div>
        <p className="text-[10px] text-primary/50 font-label mt-1">~8 % du prix d&apos;achat</p>
      </div>
    </div>
  );
}
