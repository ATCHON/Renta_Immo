'use client';

import { Card, CardHeader, CardContent } from '@/components/ui';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { CashflowResultat } from '@/types';

interface CashflowCardProps {
  cashflow: CashflowResultat;
}

export function CashflowCard({ cashflow }: CashflowCardProps) {
  const isPositive = cashflow.mensuel >= 0;

  return (
    <Card>
      <CardHeader
        title="Cashflow"
        description="Flux de trésorerie de votre investissement"
      />
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Cashflow mensuel */}
          <div
            className={cn(
              'p-4 sm:p-6 rounded-xl text-center border',
              isPositive ? 'bg-sage/5 border-sage/20' : 'bg-terracotta/5 border-terracotta/20'
            )}
          >
            <p className="text-sm text-pebble font-medium uppercase tracking-tight">Mensuel</p>
            <p
              className={cn(
                'text-3xl sm:text-4xl font-bold mt-2',
                isPositive ? 'text-forest' : 'text-terracotta'
              )}
            >
              {isPositive ? '+' : ''}{formatCurrency(cashflow.mensuel)}
            </p>
            <p className="text-xs text-pebble mt-2 font-medium">
              {isPositive ? 'Excédent de trésorerie' : 'Effort d\'épargne requis'}
            </p>
          </div>

          {/* Cashflow annuel */}
          <div
            className={cn(
              'p-4 sm:p-6 rounded-xl text-center border',
              isPositive ? 'bg-sage/5 border-sage/20' : 'bg-terracotta/5 border-terracotta/20'
            )}
          >
            <p className="text-sm text-pebble font-medium uppercase tracking-tight">Annuel</p>
            <p
              className={cn(
                'text-3xl sm:text-4xl font-bold mt-2',
                isPositive ? 'text-forest' : 'text-terracotta'
              )}
            >
              {isPositive ? '+' : ''}{formatCurrency(cashflow.annuel)}
            </p>
            <p className="text-xs text-pebble mt-2 font-medium">
              Résultat net d&apos;exploitation
            </p>
          </div>
        </div>

        {/* Indicateur visuel */}
        <div className="mt-6 pt-5 border-t border-sand/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-charcoal uppercase tracking-wider">Indicateur de Cashflow</span>
            <span
              className={cn(
                'text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide',
                isPositive ? 'bg-forest/10 text-forest' : 'bg-terracotta/10 text-terracotta'
              )}
            >
              {isPositive ? 'Positif' : 'Négatif'}
            </span>
          </div>

          {/* Barre de cashflow */}
          <div className="relative h-6 bg-sand/20 rounded-full overflow-hidden shadow-inner border border-sand/30">
            <div className="absolute inset-0 flex">
              <div className="w-1/2 bg-terracotta/10 border-r border-sand/30" />
              <div className="w-1/2 bg-sage/10" />
            </div>
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-charcoal/20 z-10"
              style={{ left: '50%' }}
            />
            <CashflowIndicator value={cashflow.mensuel} maxValue={1000} />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold text-pebble uppercase tracking-widest">
            <span>-1000€</span>
            <span>Équilibre</span>
            <span>+1000€</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CashflowIndicatorProps {
  value: number;
  maxValue: number;
}

function CashflowIndicator({ value, maxValue }: CashflowIndicatorProps) {
  // Calculer la position (50% = 0, 0% = -max, 100% = +max)
  const clampedValue = Math.max(-maxValue, Math.min(maxValue, value));
  const position = 50 + (clampedValue / maxValue) * 50;
  const isPositive = clampedValue >= 0;

  return (
    <div
      className={cn(
        "absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-4 border-white shadow-lg transition-all duration-700 ease-out z-20 flex items-center justify-center",
        isPositive ? "bg-forest" : "bg-terracotta"
      )}
      style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }}
    />
  );
}
