'use client';

import { cn } from '@/lib/utils';

type MetricVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: MetricVariant;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

const variantStyles: Record<MetricVariant, { bg: string; text: string; icon: string }> = {
  default: {
    bg: 'bg-gray-50',
    text: 'text-gray-900',
    icon: 'text-gray-400',
  },
  success: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: 'text-green-500',
  },
  warning: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    icon: 'text-amber-500',
  },
  danger: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    icon: 'text-red-500',
  },
  info: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    icon: 'text-blue-500',
  },
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
  trend,
  className,
}: MetricCardProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'rounded-xl p-5',
        styles.bg,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={cn('text-2xl font-bold mt-1', styles.text)}>
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <TrendIcon value={trend.value} />
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.value >= 0 ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.value >= 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-sm text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn('p-2 rounded-lg', styles.bg)}>
            <div className={styles.icon}>{icon}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function TrendIcon({ value }: { value: number }) {
  if (value >= 0) {
    return (
      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  return (
    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
