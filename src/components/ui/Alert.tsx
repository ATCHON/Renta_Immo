'use client';

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  icon?: LucideIcon;
  title?: string;
}

const variantStyles: Record<AlertVariant, { container: string; text: string }> = {
  info: {
    container: 'bg-forest-light border-forest',
    text: 'text-forest',
  },
  success: {
    container: 'bg-sage-light border-sage',
    text: 'text-sage',
  },
  warning: {
    container: 'bg-amber-light border-amber',
    text: 'text-amber',
  },
  error: {
    container: 'bg-terracotta-light border-terracotta',
    text: 'text-terracotta',
  },
};

export function Alert({
  variant = 'info',
  icon: Icon,
  title,
  className,
  children,
  ...props
}: AlertProps) {
  const styles = variantStyles[variant];

  return (
    <div
      className={cn('p-4 rounded-lg border', styles.container, className)}
      role="alert"
      {...props}
    >
      <div className="flex gap-3">
        {Icon && <Icon className={cn('h-5 w-5 flex-shrink-0', styles.text)} />}
        <div className="flex-1">
          {title && <h4 className={cn('font-medium mb-1', styles.text)}>{title}</h4>}
          <div className={cn('text-sm', styles.text)}>{children}</div>
        </div>
      </div>
    </div>
  );
}
