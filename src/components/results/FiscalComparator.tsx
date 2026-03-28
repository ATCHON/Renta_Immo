'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FiscaliteComparaison } from '@/types/calculateur';

interface FiscalComparatorProps {
  data: FiscaliteComparaison;
}

export const FiscalComparator = React.memo(function FiscalComparator({
  data,
}: FiscalComparatorProps) {
  if (!data?.items?.length) return null;

  return (
    <div className="space-y-3" data-testid="fiscal-comparator">
      {data.items.map((item, idx) => (
        <div
          key={idx}
          className={cn(
            'rounded-xl border p-4 transition-all duration-normal',
            item.isOptimal
              ? 'border-primary bg-primary/5 shadow-sm'
              : 'border-outline-variant bg-surface-container-lowest'
          )}
          data-testid={item.isOptimal ? 'fiscal-item-recommended' : 'fiscal-item'}
        >
          <div className="flex items-start justify-between gap-3">
            {/* Nom + badges */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span
                  className={cn(
                    'font-bold text-sm',
                    item.isOptimal ? 'text-primary' : 'text-on-surface'
                  )}
                >
                  {item.regime}
                </span>

                {item.isOptimal && (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary text-on-primary"
                    data-testid="badge-recommande"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    RECOMMANDÉ
                  </span>
                )}

                {item.isSelected && (
                  <span
                    className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                      item.isOptimal
                        ? 'border border-primary text-primary'
                        : 'bg-on-surface text-surface'
                    )}
                  >
                    VOTRE CHOIX
                  </span>
                )}
              </div>

              <p className="text-xs text-on-surface-variant">{item.description}</p>

              {item.dividendes_bruts !== undefined && item.dividendes_bruts > 0 && (
                <div className="mt-2 flex gap-4 text-xs text-on-surface-variant">
                  <span>
                    Dividendes bruts :{' '}
                    <strong>{Math.round(item.dividendes_bruts).toLocaleString()} €</strong>
                  </span>
                  <span>
                    Flat Tax (30%) :{' '}
                    <strong className="text-error">
                      -{Math.round(item.flat_tax || 0).toLocaleString()} €
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* KPIs à droite */}
            <div className="text-right shrink-0 space-y-1">
              <p
                className={cn(
                  'text-lg font-black tabular-nums',
                  item.cashflowNetMoyen >= 0 ? 'text-primary' : 'text-error'
                )}
              >
                {item.cashflowNetMoyen >= 0 ? '+' : ''}
                {Math.round(item.cashflowNetMoyen).toLocaleString()} €
              </p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">
                cashflow / an
              </p>
              <p className="text-xs font-bold text-on-surface tabular-nums">
                {item.rentabiliteNetteNette}% net-net
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});
