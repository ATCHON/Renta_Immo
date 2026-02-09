'use client';

import { Card, CardHeader, CardContent } from '@/components/ui';
import { formatPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { HCSF } from '@/lib/constants';
import type { HCSFResultat } from '@/types';

interface HCSFIndicatorProps {
  hcsf: HCSFResultat;
}

export function HCSFIndicator({ hcsf }: HCSFIndicatorProps) {
  const isConforme = hcsf.conforme;

  return (
    <Card>
      <CardHeader
        title="Conformité HCSF"
        className="pb-2"
        action={
          <span
            className={cn(
              'nordic-badge',
              isConforme
                ? 'bg-forest/10 text-forest border-forest/20'
                : 'bg-terracotta/10 text-terracotta border-terracotta/20'
            )}
          >
            {isConforme ? 'Conforme' : 'Alerte'}
          </span>
        }
      />
      <CardContent>
        {/* Jauge principale compacte */}
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <HCSFGauge value={hcsf.taux_endettement} maxValue={50} threshold={HCSF.TAUX_ENDETTEMENT_MAX} />
          </div>
          <div className="shrink-0 text-right">
            <p className="nordic-label-xs mb-1">Taux Global</p>
            <span
              className={cn(
                'nordic-kpi-value leading-none',
                hcsf.taux_endettement <= HCSF.TAUX_ENDETTEMENT_MAX
                  ? '!text-forest'
                  : '!text-terracotta'
              )}
            >
              {formatPercent(hcsf.taux_endettement)}
            </span>
          </div>
        </div>

        {/* Détails par associé */}
        {hcsf.details_associes && hcsf.details_associes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-sand/30">
            <p className="nordic-label-xs mb-2">Détail par associé</p>
            <div className="space-y-2">
              {hcsf.details_associes.map((associe, index) => (
                <div key={index} className="flex justify-between items-center text-[11px]">
                  <span className="text-stone font-medium">{associe.nom}</span>
                  <span className={cn("font-bold", associe.conforme ? "text-forest" : "text-terracotta")}>
                    {formatPercent(associe.taux_endettement)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AUDIT-107 : Reste à vivre */}
        {hcsf.reste_a_vivre !== undefined && (
          <div className="mt-4 pt-4 border-t border-sand/30">
            <div className="flex justify-between items-center">
              <div>
                <p className="nordic-label-xs">Reste à vivre</p>
                <p className="text-[10px] text-stone mt-0.5">
                  {hcsf.reste_a_vivre >= 1500
                    ? 'Confortable'
                    : hcsf.reste_a_vivre >= 700
                      ? 'Correct'
                      : 'Insuffisant'}
                </p>
              </div>
              <span
                className={cn(
                  'text-lg font-bold',
                  hcsf.reste_a_vivre >= 1500
                    ? 'text-forest'
                    : hcsf.reste_a_vivre >= 700
                      ? 'text-amber-600'
                      : 'text-terracotta'
                )}
              >
                {Math.round(hcsf.reste_a_vivre)} €/mois
              </span>
            </div>
          </div>
        )}

        {/* Information Rappel (Ultra-compact) */}
        <div className="mt-4 pt-4 border-t border-sand/50">
          <p className="text-[10px] text-stone leading-relaxed italic">
            <strong className="text-charcoal not-italic">HCSF :</strong> Max 35% d&apos;endettement sur 25 ans.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface HCSFGaugeProps {
  value: number;
  maxValue: number;
  threshold: number;
}

function HCSFGauge({ value, maxValue, threshold }: HCSFGaugeProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const thresholdPosition = (threshold / maxValue) * 100;
  const isOverThreshold = value > threshold;

  return (
    <div className="relative h-2 w-full bg-sand/20 rounded-full overflow-hidden border border-sand/10">
      {/* Barre de fond */}
      <div
        className={cn(
          'h-full rounded-full transition-all duration-700 ease-out',
          isOverThreshold ? 'bg-terracotta' : 'bg-forest'
        )}
        style={{ width: `${percentage}%` }}
      />

      {/* Marqueur du seuil */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-charcoal/30 z-10"
        style={{ left: `${thresholdPosition}%` }}
      />
    </div>
  );
}


