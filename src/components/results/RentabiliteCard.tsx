'use client';

import { Card, CardHeader, CardContent } from '@/components/ui';
import { formatPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { RentabiliteResultat } from '@/types';

interface RentabiliteCardProps {
  rentabilite: RentabiliteResultat;
}

export function RentabiliteCard({ rentabilite }: RentabiliteCardProps) {
  const getRentabiliteColor = (value: number) => {
    if (value >= 8) return 'text-green-600';
    if (value >= 5) return 'text-amber-600';
    return 'text-red-600';
  };

  const getRentabiliteBg = (value: number) => {
    if (value >= 8) return 'bg-green-50';
    if (value >= 5) return 'bg-amber-50';
    return 'bg-red-50';
  };

  return (
    <Card>
      <CardHeader
        title="Rentabilité"
        description="Analyse de la rentabilité de votre investissement"
      />
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <RentabiliteItem
            label="Brute"
            value={rentabilite.brute}
            description="Loyers / Prix d'achat"
            color={getRentabiliteColor(rentabilite.brute)}
            bg={getRentabiliteBg(rentabilite.brute)}
          />
          <RentabiliteItem
            label="Nette"
            value={rentabilite.nette}
            description="Après charges"
            color={getRentabiliteColor(rentabilite.nette)}
            bg={getRentabiliteBg(rentabilite.nette)}
          />
          <RentabiliteItem
            label="Nette-Nette"
            value={rentabilite.nette_nette}
            description="Après impôts"
            color={getRentabiliteColor(rentabilite.nette_nette)}
            bg={getRentabiliteBg(rentabilite.nette_nette)}
            highlighted
          />
        </div>

        {/* Barre de comparaison */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-3">Comparaison des rentabilités</p>
          <div className="space-y-2">
            <RentabiliteBar
              label="Brute"
              value={rentabilite.brute}
              maxValue={15}
              color="bg-blue-500"
            />
            <RentabiliteBar
              label="Nette"
              value={rentabilite.nette}
              maxValue={15}
              color="bg-primary-500"
            />
            <RentabiliteBar
              label="Nette-Nette"
              value={rentabilite.nette_nette}
              maxValue={15}
              color="bg-green-500"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface RentabiliteItemProps {
  label: string;
  value: number;
  description: string;
  color: string;
  bg: string;
  highlighted?: boolean;
}

function RentabiliteItem({
  label,
  value,
  description,
  color,
  bg,
  highlighted,
}: RentabiliteItemProps) {
  return (
    <div
      className={cn(
        'text-center p-4 rounded-lg',
        bg,
        highlighted && 'ring-2 ring-primary-500'
      )}
    >
      <p className="text-sm text-gray-600">{label}</p>
      <p className={cn('text-3xl font-bold mt-1', color)}>
        {formatPercent(value)}
      </p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </div>
  );
}

interface RentabiliteBarProps {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

function RentabiliteBar({ label, value, maxValue, color }: RentabiliteBarProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-600 w-20">{label}</span>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-900 w-12 text-right">
        {formatPercent(value)}
      </span>
    </div>
  );
}
