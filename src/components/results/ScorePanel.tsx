'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui';
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

function ScoreLegendBar({ score, colorKey }: { score: number; colorKey: string }) {
  const segments = [
    { label: 'Faible', range: [0, 39], color: 'bg-terracotta/20' },
    { label: 'Moyen', range: [40, 59], color: 'bg-amber/20' },
    { label: 'Bon', range: [60, 79], color: 'bg-sage/20' },
    { label: 'Excellent', range: [80, 100], color: 'bg-forest/20' },
  ];

  const markerPos = Math.min(100, Math.max(0, score));

  return (
    <div className="mt-4 w-full max-w-[220px]">
      <div className="relative h-3 rounded-full overflow-hidden flex">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className={cn('h-full', seg.color)}
            style={{ width: seg.range[0] === 80 ? '21%' : seg.range[0] === 0 ? '40%' : '20%' }}
          />
        ))}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md',
            SCORE_COLORS[colorKey as keyof typeof SCORE_COLORS]?.bar ?? 'bg-stone'
          )}
          style={{ left: `${markerPos}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[9px] text-stone font-medium">Faible</span>
        <span className="text-[9px] text-stone font-medium">Moyen</span>
        <span className="text-[9px] text-stone font-medium">Bon</span>
        <span className="text-[9px] text-stone font-medium">Excellent</span>
      </div>
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

  return (
    <Card variant="bordered" className="!p-0 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Score Hero */}
        <div className="p-6 md:p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-border">
          <p className="nordic-label-xs mb-4">Indice de Performance</p>
          <div className="flex items-baseline gap-2 mb-3">
            <span
              className={cn('text-7xl md:text-8xl font-black tracking-tighter', scoreColor.score)}
              data-testid="score-global"
            >
              {synthese.score_global}
            </span>
            <span className="text-2xl text-stone/40 font-bold">/100</span>
          </div>
          <span
            className={cn(
              'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border',
              evalStyle.bg,
              evalStyle.text,
              evalStyle.border
            )}
          >
            {evaluation}
          </span>
          <ScoreLegendBar score={synthese.score_global} colorKey={colorKey} />
        </div>

        {/* Décomposition du score */}
        <div className="p-6 md:p-8">
          <p className="nordic-label-xs mb-4">Décomposition du score</p>
          {ajustements ? (
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-medium text-stone w-28 shrink-0 text-right">
                  Base initiale
                </span>
                <div className="flex-1" />
                <span className="text-xs font-bold text-charcoal w-10 text-right tabular-nums">
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
              <div className="flex items-center gap-3 pt-3 mt-3 border-t border-border">
                <span className="text-xs font-bold text-charcoal w-28 shrink-0 text-right">
                  Total
                </span>
                <div className="flex-1" />
                <span
                  className={cn(
                    'text-sm font-black w-10 text-right tabular-nums',
                    scoreColor.score
                  )}
                >
                  {synthese.score_global}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone">Détail non disponible pour cette simulation.</p>
          )}
        </div>
      </div>

      {/* Recommandation */}
      <div className="px-6 md:px-8 py-4 bg-surface/50 border-t border-border">
        <p className="text-sm font-medium text-charcoal leading-relaxed">
          {synthese.recommandation}
        </p>
      </div>
    </Card>
  );
}
