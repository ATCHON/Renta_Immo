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

        {/* Détails par associé (Masqués si conforme ou compactés) */}
        {!isConforme && hcsf.details_associes && hcsf.details_associes.length > 0 && (
          <div className="mt-4 pt-4 border-t border-sand/30">
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

interface AssocieHCSFRowProps {
  associe: {
    nom: string;
    taux_endettement: number;
    conforme: boolean;
  };
}

function AssocieHCSFRow({ associe }: AssocieHCSFRowProps) {
  const percentage = Math.min((associe.taux_endettement / 50) * 100, 100);

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-bold text-charcoal w-24 truncate">{associe.nom}</span>
      <div className="flex-1 h-3 bg-sand/20 rounded-full overflow-hidden border border-sand/30 shadow-inner">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            associe.conforme ? 'bg-forest/60' : 'bg-terracotta/60'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span
        className={cn(
          'text-sm font-black w-14 text-right tabular-nums',
          associe.conforme ? 'text-forest' : 'text-terracotta'
        )}
      >
        {formatPercent(associe.taux_endettement)}
      </span>
      <span className="w-6 flex justify-center">
        {associe.conforme ? (
          <CheckIcon className="w-5 h-5 text-forest" />
        ) : (
          <XIcon className="w-5 h-5 text-terracotta" />
        )}
      </span>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  );
}
