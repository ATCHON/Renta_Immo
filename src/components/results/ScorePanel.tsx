'use client';

import { useMemo } from 'react';
import { Card, Collapsible } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { SyntheseResultat } from '@/types/calculateur';

interface ScorePanelProps {
  synthese: SyntheseResultat;
}

const EVALUATIONS = {
  Excellent: {
    color: 'forest',
    bg: 'bg-forest/10',
    text: 'text-forest',
    border: 'border-forest/30',
  },
  Bon: { color: 'sage', bg: 'bg-sage/10', text: 'text-sage', border: 'border-sage/30' },
  Moyen: { color: 'amber', bg: 'bg-amber/10', text: 'text-amber', border: 'border-amber/30' },
  Faible: {
    color: 'terracotta',
    bg: 'bg-terracotta/10',
    text: 'text-terracotta',
    border: 'border-terracotta/30',
  },
} as const;

const SCORE_COLORS = {
  forest: { score: 'text-forest', bar: 'bg-forest' },
  sage: { score: 'text-sage', bar: 'bg-sage' },
  amber: { score: 'text-amber', bar: 'bg-amber' },
  terracotta: { score: 'text-terracotta', bar: 'bg-terracotta' },
} as const;

function deriveEvaluation(score: number): 'Excellent' | 'Bon' | 'Moyen' | 'Faible' {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Bon';
  if (score >= 40) return 'Moyen';
  return 'Faible';
}

function deriveColorKey(score: number): 'forest' | 'sage' | 'amber' | 'terracotta' {
  if (score >= 80) return 'forest';
  if (score >= 60) return 'sage';
  if (score >= 40) return 'amber';
  return 'terracotta';
}

const AJUSTEMENT_LABELS: Record<string, string> = {
  cashflow: 'Cash-flow',
  rentabilite: 'Rentabilité',
  hcsf: 'HCSF',
  dpe: 'DPE',
  ratio_prix_loyer: 'Ratio prix/loyer',
  reste_a_vivre: 'Reste à vivre',
};

const AJUSTEMENT_MAX: Record<string, [number, number]> = {
  cashflow: [-20, 20],
  rentabilite: [-15, 20],
  hcsf: [-25, 20],
  dpe: [-10, 5],
  ratio_prix_loyer: [-5, 10],
  reste_a_vivre: [-10, 5],
};

function AjustementBar({
  label,
  value,
  range,
}: {
  label: string;
  value: number;
  range: [number, number];
}) {
  const [min, max] = range;
  const totalRange = max - min;
  const zeroPos = (Math.abs(min) / totalRange) * 100;

  const barStart = value >= 0 ? zeroPos : zeroPos + (value / totalRange) * 100;
  const barWidth = (Math.abs(value) / totalRange) * 100;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium text-stone w-28 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-5 bg-surface rounded relative overflow-hidden">
        <div className="absolute top-0 bottom-0 w-px bg-stone/30" style={{ left: `${zeroPos}%` }} />
        {value !== 0 && (
          <div
            className={cn(
              'absolute top-0.5 bottom-0.5 rounded-sm transition-all',
              value > 0 ? 'bg-forest/70' : 'bg-terracotta/70'
            )}
            style={{
              left: `${Math.max(0, barStart)}%`,
              width: `${Math.min(barWidth, 100)}%`,
            }}
          />
        )}
      </div>
      <span
        className={cn(
          'text-xs font-bold w-10 text-right tabular-nums',
          value > 0 ? 'text-forest' : value < 0 ? 'text-terracotta' : 'text-stone'
        )}
      >
        {value > 0 ? '+' : ''}
        {value}
      </span>
    </div>
  );
}

export function ScorePanel({ synthese }: ScorePanelProps) {
  const evaluation = synthese.evaluation ?? deriveEvaluation(synthese.score_global);
  const colorKey = deriveColorKey(synthese.score_global);
  const evalStyle = EVALUATIONS[evaluation];
  const scoreColor = SCORE_COLORS[colorKey];

  const ajustements = useMemo(() => {
    if (!synthese.score_detail?.ajustements) return null;
    return Object.entries(synthese.score_detail.ajustements).map(([key, value]) => ({
      key,
      label: AJUSTEMENT_LABELS[key] ?? key,
      value: value as number,
      range: AJUSTEMENT_MAX[key] ?? ([-20, 20] as [number, number]),
    }));
  }, [synthese.score_detail]);

  // SVG Gauge Calculations
  const radius = 80;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Score is mapped assuming 100 max
  const strokeDashoffset = circumference - (synthese.score_global / 100) * circumference;

  return (
    <Card variant="bordered" className="!p-0 overflow-hidden relative">
      <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center">
        <p className="nordic-label-xs mb-8">Indice de Performance Global</p>

        {/* Jauge Circulaire */}
        <div className="relative flex items-center justify-center mb-6">
          <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
            <circle
              className="text-outline-variant/30"
              strokeWidth={strokeWidth}
              stroke="currentColor"
              fill="transparent"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              className={cn('transition-all duration-1000 ease-out', scoreColor.score)}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={cn('text-6xl font-black tracking-tighter', scoreColor.score)}
              data-testid="score-global"
            >
              {synthese.score_global}
            </span>
            <span className="text-sm text-on-surface-variant font-bold">/100</span>
          </div>
        </div>

        {/* Badge & Description */}
        <div className="space-y-4 max-w-lg">
          <div className="flex justify-center">
            <span
              className={cn(
                'inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest border',
                evalStyle.bg,
                evalStyle.text,
                evalStyle.border
              )}
            >
              {evaluation}
            </span>
          </div>
          <p className="text-base font-medium text-on-surface leading-relaxed">
            {synthese.recommandation}
          </p>
        </div>
      </div>

      {/* Décomposition du score en Accordéon */}
      <div className="px-6 md:px-8 py-5 bg-surface-container-lowest border-t border-outline-variant/40">
        <Collapsible
          title="Voir le détail des sous-scores"
          className="bg-transparent border-0 shadow-none !p-0"
        >
          <div className="pt-4 pb-2">
            {ajustements ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 mb-4 bg-surface-container/50 p-3 rounded-lg">
                  <span className="text-sm font-bold text-on-surface w-28 shrink-0 text-right">
                    Base initiale
                  </span>
                  <div className="flex-1" />
                  <span className="text-sm font-black text-on-surface w-10 text-right tabular-nums">
                    {synthese.score_detail!.base}
                  </span>
                </div>
                {ajustements.map((aj) => (
                  <AjustementBar
                    key={aj.key}
                    label={aj.label}
                    value={aj.value}
                    range={aj.range as [number, number]}
                  />
                ))}
                <div className="flex items-center gap-3 pt-4 mt-4 border-t border-outline-variant/40">
                  <span className="text-sm font-bold text-on-surface w-28 shrink-0 text-right">
                    Score Total
                  </span>
                  <div className="flex-1" />
                  <span
                    className={cn(
                      'text-lg font-black w-10 text-right tabular-nums',
                      scoreColor.score
                    )}
                  >
                    {synthese.score_global}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-on-surface-variant">
                Détail non disponible pour cette simulation.
              </p>
            )}
          </div>
        </Collapsible>
      </div>
    </Card>
  );
}
