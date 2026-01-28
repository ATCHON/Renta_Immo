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
        description="Vérification du taux d'endettement (max 35%)"
        action={
          <span
            className={cn(
              'px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide',
              isConforme
                ? 'bg-forest/10 text-forest border border-forest/20'
                : 'bg-terracotta/10 text-terracotta border border-terracotta/20'
            )}
          >
            {isConforme ? 'Conforme' : 'Alerte HCSF'}
          </span>
        }
      />
      <CardContent>
        {/* Jauge principale */}
        <div className="mb-6">
          <div className="flex items-end justify-between mb-2">
            <span className="text-sm font-bold text-pebble uppercase tracking-wider">Taux d&apos;endettement global</span>
            <span
              className={cn(
                'text-3xl font-black tabular-nums',
                hcsf.taux_endettement <= HCSF.TAUX_ENDETTEMENT_MAX
                  ? 'text-forest'
                  : 'text-terracotta'
              )}
            >
              {formatPercent(hcsf.taux_endettement)}
            </span>
          </div>

          {/* Jauge visuelle */}
          <HCSFGauge value={hcsf.taux_endettement} maxValue={50} threshold={HCSF.TAUX_ENDETTEMENT_MAX} />
        </div>

        {/* Détails par associé */}
        {hcsf.details_associes && hcsf.details_associes.length > 0 && (
          <div className="border-t border-sand/50 pt-6">
            <p className="text-xs font-bold text-pebble uppercase tracking-widest mb-4">
              Détails par associé
            </p>
            <div className="space-y-5">
              {hcsf.details_associes.map((associe, index) => (
                <AssocieHCSFRow key={index} associe={associe} />
              ))}
            </div>
          </div>
        )}

        {/* Information */}
        <div className="mt-6 p-4 bg-surface border border-sand/50 rounded-xl flex gap-3 italic">
          <div className="text-forest">ℹ</div>
          <p className="text-xs text-pebble leading-relaxed">
            <strong className="text-charcoal not-italic font-bold">Rappel HCSF :</strong> Le Haut Conseil de Stabilité Financière
            recommande un taux d&apos;endettement maximum de 35% et une durée
            de crédit limitée à 25 ans.
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
    <div className="relative pt-6">
      {/* Barre de fond */}
      <div className="h-4 bg-sand/20 rounded-full overflow-hidden shadow-inner border border-sand/10">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-700 ease-out',
            isOverThreshold ? 'bg-terracotta' : 'bg-forest'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Marqueur du seuil */}
      <div
        className="absolute top-4 bottom-0 w-0.5 bg-charcoal/30 z-10"
        style={{ left: `${thresholdPosition}%` }}
      >
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-charcoal/40 uppercase tracking-tighter whitespace-nowrap bg-white px-1">
          Seuil {threshold}%
        </div>
      </div>

      {/* Légende */}
      <div className="flex justify-between mt-2 text-[10px] font-bold text-pebble uppercase tracking-widest">
        <span>0%</span>
        <span>{maxValue}%</span>
      </div>
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
