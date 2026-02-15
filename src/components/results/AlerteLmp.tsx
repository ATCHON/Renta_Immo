'use client';

import { AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CONSTANTS } from '@/config/constants';

interface AlerteLmpProps {
  recettesLmnpAnnuelles: number;
}

export function AlerteLmp({ recettesLmnpAnnuelles }: AlerteLmpProps) {
  if (recettesLmnpAnnuelles <= CONSTANTS.LMP.SEUIL_ALERTE) return null;

  const isRouge = recettesLmnpAnnuelles > CONSTANTS.LMP.SEUIL_LMP;

  return (
    <div className={cn(
      'flex items-start gap-3 px-4 py-3 rounded-xl border-l-4',
      isRouge
        ? 'border-l-terracotta bg-terracotta/5'
        : 'border-l-amber bg-amber/5'
    )}>
      {isRouge
        ? <AlertTriangle className="h-5 w-5 text-terracotta shrink-0 mt-0.5" />
        : <AlertCircle className="h-5 w-5 text-amber shrink-0 mt-0.5" />}
      <div>
        <p className={cn('text-sm font-semibold', isRouge ? 'text-terracotta' : 'text-amber')}>
          {isRouge ? 'Seuil LMP dépassé' : 'Approche du seuil LMP'}
        </p>
        <p className="text-sm text-charcoal mt-0.5">
          {isRouge
            ? `Vos recettes LMNP dépassent le seuil LMP (${CONSTANTS.LMP.SEUIL_LMP.toLocaleString('fr-FR')} €). Vous pourriez être qualifié en LMP avec des conséquences sociales et fiscales différentes.`
            : `Vos recettes LMNP approchent du seuil LMP (${CONSTANTS.LMP.SEUIL_LMP.toLocaleString('fr-FR')} €). Surveillez l'évolution de vos recettes.`}{' '}
          Consultez un expert.
        </p>
      </div>
    </div>
  );
}
