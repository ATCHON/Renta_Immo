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
              'px-3 py-1 rounded-full text-sm font-medium',
              isConforme
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            )}
          >
            {isConforme ? 'Conforme' : 'Non conforme'}
          </span>
        }
      />
      <CardContent>
        {/* Jauge principale */}
        <div className="mb-6">
          <div className="flex items-end justify-between mb-2">
            <span className="text-sm text-gray-600">Taux d&apos;endettement global</span>
            <span
              className={cn(
                'text-2xl font-bold',
                hcsf.taux_endettement <= HCSF.TAUX_ENDETTEMENT_MAX
                  ? 'text-green-600'
                  : 'text-red-600'
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
          <div className="border-t border-gray-100 pt-4">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Détail par associé
            </p>
            <div className="space-y-3">
              {hcsf.details_associes.map((associe, index) => (
                <AssocieHCSFRow key={index} associe={associe} />
              ))}
            </div>
          </div>
        )}

        {/* Information */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>HCSF :</strong> Le Haut Conseil de Stabilité Financière
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
    <div className="relative">
      {/* Barre de fond */}
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isOverThreshold ? 'bg-red-500' : 'bg-green-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Marqueur du seuil */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-gray-800"
        style={{ left: `${thresholdPosition}%` }}
      >
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap">
          {threshold}%
        </div>
      </div>

      {/* Légende */}
      <div className="flex justify-between mt-1 text-xs text-gray-500">
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
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-700 w-24 truncate">{associe.nom}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            associe.conforme ? 'bg-green-500' : 'bg-red-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span
        className={cn(
          'text-sm font-medium w-14 text-right',
          associe.conforme ? 'text-green-600' : 'text-red-600'
        )}
      >
        {formatPercent(associe.taux_endettement)}
      </span>
      <span className="w-6">
        {associe.conforme ? (
          <CheckIcon className="w-5 h-5 text-green-500" />
        ) : (
          <XIcon className="w-5 h-5 text-red-500" />
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
