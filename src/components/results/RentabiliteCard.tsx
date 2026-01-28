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
    if (value >= 8) return 'text-forest';
    if (value >= 5) return 'text-amber-700';
    return 'text-terracotta';
  };

  const getRentabiliteBg = (value: number) => {
    if (value >= 8) return 'bg-forest/5';
    if (value >= 5) return 'bg-amber/5';
    return 'bg-terracotta/5';
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
        <div className="mt-6 pt-5 border-t border-sand/50">
          <p className="text-sm font-bold text-charcoal mb-4 uppercase tracking-wider">Comparaison des taux</p>
          <div className="space-y-4">
            <RentabiliteBar
              label="Brute"
              value={rentabilite.brute}
              maxValue={15}
              color="bg-stone/40"
            />
            <RentabiliteBar
              label="Nette"
              value={rentabilite.nette}
              maxValue={15}
              color="bg-forest/60"
            />
            <RentabiliteBar
              label="Nette-Nette"
              value={rentabilite.nette_nette}
              maxValue={15}
              color="bg-forest"
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
    <div className="flex items-center gap-4">
      <span className="text-xs font-medium text-pebble w-24">{label}</span>
      <div className="flex-1 h-2 bg-sand/30 rounded-full overflow-hidden shadow-inner">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-bold text-charcoal w-14 text-right">
        {formatPercent(value)}
      </span>
    </div>
  );
}
