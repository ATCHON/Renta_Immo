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
        <div className="grid grid-cols-2 gap-6">
          {/* Cashflow mensuel */}
          <div
            className={cn(
              'p-6 rounded-xl text-center',
              isPositive ? 'bg-green-50' : 'bg-red-50'
            )}
          >
            <p className="text-sm text-gray-600">Mensuel</p>
            <p
              className={cn(
                'text-3xl font-bold mt-2',
                isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {isPositive ? '+' : ''}{formatCurrency(cashflow.mensuel)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {isPositive ? 'Effort d\'épargne positif' : 'Effort d\'épargne négatif'}
            </p>
          </div>

          {/* Cashflow annuel */}
          <div
            className={cn(
              'p-6 rounded-xl text-center',
              isPositive ? 'bg-green-50' : 'bg-red-50'
            )}
          >
            <p className="text-sm text-gray-600">Annuel</p>
            <p
              className={cn(
                'text-3xl font-bold mt-2',
                isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {isPositive ? '+' : ''}{formatCurrency(cashflow.annuel)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              sur 12 mois
            </p>
          </div>
        </div>

        {/* Indicateur visuel */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Indicateur de cashflow</span>
            <span
              className={cn(
                'text-sm font-medium px-2 py-1 rounded',
                isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}
            >
              {isPositive ? 'Positif' : 'Négatif'}
            </span>
          </div>

          {/* Barre de cashflow */}
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <div className="absolute inset-0 flex">
              <div className="w-1/2 bg-red-200" />
              <div className="w-1/2 bg-green-200" />
            </div>
            <div
              className="absolute top-0 bottom-0 w-1 bg-gray-800"
              style={{ left: '50%', transform: 'translateX(-50%)' }}
            />
            <CashflowIndicator value={cashflow.mensuel} maxValue={1000} />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>-1000€</span>
            <span>0€</span>
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

  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary-600 border-2 border-white shadow-md transition-all duration-500"
      style={{ left: `${position}%`, transform: 'translate(-50%, -50%)' }}
    />
  );
}
