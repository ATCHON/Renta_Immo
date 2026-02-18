'use client';

import { cn } from '@/lib/utils';
import type { RecommandationDetail } from '@/types/calculateur';

interface RecommandationsPanelProps {
  recommandations?: RecommandationDetail[];
  fiscalConseil?: string;
  hcsfConforme?: boolean;
  effetLevier?: number | null;
}

const PRIORITE_CONFIG = {
  haute: {
    border: 'border-terracotta/30',
    bg: 'bg-terracotta/5',
    badge: 'bg-terracotta/10 text-terracotta border-terracotta/20',
    label: 'Haute',
  },
  moyenne: {
    border: 'border-amber/30',
    bg: 'bg-amber/5',
    badge: 'bg-amber/10 text-amber border-amber/20',
    label: 'Moyenne',
  },
  info: {
    border: 'border-forest/30',
    bg: 'bg-forest/5',
    badge: 'bg-forest/10 text-forest border-forest/20',
    label: 'Info',
  },
} as const;

const CATEGORIE_LABELS: Record<string, string> = {
  financement: 'Financement',
  fiscalite: 'Fiscalité',
  rentabilite: 'Rentabilité',
  cashflow: 'Cash-flow',
  general: 'Général',
};

function RecommandationCard({ reco }: { reco: RecommandationDetail }) {
  const config = PRIORITE_CONFIG[reco.priorite];

  return (
    <div className={cn('rounded-lg border p-4', config.border, config.bg)}>
      <div className="flex items-center gap-2 mb-2">
        <span
          className={cn(
            'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border',
            config.badge
          )}
        >
          {config.label}
        </span>
        <span className="text-[10px] font-medium text-stone uppercase tracking-wider">
          {CATEGORIE_LABELS[reco.categorie] ?? reco.categorie}
        </span>
      </div>
      <h4 className="text-sm font-bold text-charcoal mb-1">{reco.titre}</h4>
      <p className="text-xs text-stone leading-relaxed mb-3">{reco.description}</p>
      {reco.actions.length > 0 && (
        <ul className="space-y-1.5">
          {reco.actions.map((action, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-charcoal/80">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-stone/40 shrink-0" />
              {action}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RecommandationsPanel({
  recommandations,
  fiscalConseil,
  hcsfConforme,
  effetLevier,
}: RecommandationsPanelProps) {
  const hasRecos = recommandations && recommandations.length > 0;

  // Sort by priority: haute first, then moyenne, then info
  const sorted = hasRecos
    ? [...recommandations].sort((a, b) => {
        const order = { haute: 0, moyenne: 1, info: 2 };
        return order[a.priorite] - order[b.priorite];
      })
    : [];

  return (
    <div>
      {hasRecos ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {sorted.map((reco, i) => (
            <RecommandationCard key={i} reco={reco} />
          ))}
        </div>
      ) : (
        /* Fallback: legacy expertise block content */
        <div className="nordic-card-expert !p-6">
          <div className="relative z-10 space-y-4">
            {fiscalConseil && (
              <div>
                <p className="nordic-label-xs !text-white/40 mb-2">Conseil Fiscal</p>
                <p className="text-xs font-medium text-white/80 leading-relaxed">{fiscalConseil}</p>
              </div>
            )}
            <div className="pt-4 border-t border-white/10">
              <p className="nordic-label-xs !text-white/40 mb-2">Levier & Risque Bancaire</p>
              <p className="text-xs font-medium text-white/80 leading-relaxed mb-4">
                {hcsfConforme
                  ? 'Profil sain. Profitez-en pour négocier les taux.'
                  : "Risque HCSF élevé. Envisagez une SCI à l'IS."}
              </p>
              <div>
                <p className="nordic-label-xs !text-amber">Impact Levier</p>
                <p className="text-2xl font-black tabular-nums text-white">
                  {effetLevier !== null && effetLevier !== undefined
                    ? `${effetLevier.toFixed(2)}x`
                    : 'Max (sans apport)'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
