'use client';

import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PointAttentionDetail } from '@/types/calculateur';

interface PointsAttentionProps {
  points: string[];
  pointsDetail?: PointAttentionDetail[];
}

const TYPE_CONFIG = {
  error: {
    icon: AlertTriangle,
    border: 'border-l-terracotta',
    bg: 'bg-terracotta/5',
    iconColor: 'text-terracotta',
    label: 'Critique',
    labelBg: 'bg-terracotta/10 text-terracotta',
  },
  warning: {
    icon: AlertCircle,
    border: 'border-l-amber',
    bg: 'bg-amber/5',
    iconColor: 'text-amber',
    label: 'Alerte',
    labelBg: 'bg-amber/10 text-amber',
  },
  info: {
    icon: Info,
    border: 'border-l-forest',
    bg: 'bg-forest/5',
    iconColor: 'text-forest',
    label: 'Info',
    labelBg: 'bg-forest/10 text-forest',
  },
} as const;

function DetailItem({ point }: { point: PointAttentionDetail }) {
  const config = TYPE_CONFIG[point.type];
  const Icon = config.icon;

  return (
    <div className={cn('border-l-4 rounded-r-lg px-4 py-3', config.border, config.bg)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', config.iconColor)} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded', config.labelBg)}>
              {config.label}
            </span>
          </div>
          <p className="text-sm font-medium text-charcoal">{point.message}</p>
          {point.conseil && (
            <p className="text-xs text-stone mt-1">{point.conseil}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SimpleItem({ message }: { message: string }) {
  return (
    <div className="border-l-4 border-l-amber rounded-r-lg px-4 py-3 bg-amber/5">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-amber" />
        <p className="text-sm font-medium text-charcoal">{message}</p>
      </div>
    </div>
  );
}

export function PointsAttention({ points, pointsDetail }: PointsAttentionProps) {
  const hasDetail = pointsDetail && pointsDetail.length > 0;
  const hasSimple = points && points.length > 0;

  if (!hasDetail && !hasSimple) return null;

  // Sort detailed points: error first, then warning, then info
  const sortedDetail = hasDetail
    ? [...pointsDetail].sort((a, b) => {
        const order = { error: 0, warning: 1, info: 2 };
        return order[a.type] - order[b.type];
      })
    : [];

  return (
    <div className="space-y-3 max-w-4xl">
      {hasDetail
        ? sortedDetail.map((point, i) => <DetailItem key={i} point={point} />)
        : hasSimple
          ? points.map((msg, i) => <SimpleItem key={i} message={msg} />)
          : null}
    </div>
  );
}
