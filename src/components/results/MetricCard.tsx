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

const valueStyles: Record<MetricStatus, string> = {
  success: 'text-primary',
  warning: 'text-tertiary',
  danger: 'text-error',
  info: 'text-on-surface',
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
        'rounded-xl p-5 sm:p-7 bg-surface-container transition-all duration-normal border border-outline-variant/10 shadow-[0_8px_24px_rgba(1,45,29,0.06)]',
        'hover:-translate-y-0.5 hover:shadow-lg cursor-default',
        className
      )}
      title={tooltip}
      data-testid={dataTestId}
    >
      <div className="flex flex-col items-center text-center space-y-1.5">
        <p
          className={cn(
            'text-2xl sm:text-3xl md:text-4xl font-black tabular-nums',
            valueStyles[status]
          )}
        >
          {value}
        </p>
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
          {label}
        </p>
      </div>
    </div>
  );
}
