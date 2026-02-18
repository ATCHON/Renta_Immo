'use client';

import { cn } from '@/lib/utils';

type MetricStatus = 'success' | 'warning' | 'danger' | 'info';

interface MetricCardProps {
  value: string | number;
  label: string;
  status?: MetricStatus;
  tooltip?: string;
  className?: string;
  'data-testid'?: string;
}

const statusStyles: Record<MetricStatus, string> = {
  success: 'bg-sage/5 border-sage/20',
  warning: 'bg-amber/5 border-amber/20',
  danger: 'bg-terracotta/5 border-terracotta/20',
  info: 'bg-surface border-sand/50',
};

const valueStyles: Record<MetricStatus, string> = {
  success: 'text-forest',
  warning: 'text-amber-700',
  danger: 'text-terracotta',
  info: 'text-charcoal',
};

export function MetricCard({
  value,
  label,
  status = 'info',
  tooltip,
  className,
  'data-testid': dataTestId,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg p-3 sm:p-6 border transition-shadow hover:shadow-md',
        statusStyles[status],
        className
      )}
      title={tooltip}
      data-testid={dataTestId}
    >
      <div className="flex flex-col items-center text-center space-y-1 sm:space-y-2">
        <p className={cn('text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold', valueStyles[status])}>
          {value}
        </p>
        <p className="text-xs font-medium uppercase tracking-wide text-pebble">
          {label}
        </p>
      </div>
    </div>
  );
}
