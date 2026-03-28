import { cn } from '@/lib/utils';
import { Zap, AlertTriangle, BookOpen } from 'lucide-react';

type Variant = 'info' | 'warning' | 'success';

const STYLES: Record<Variant, string> = {
  info: 'bg-secondary-fixed/60 border-secondary-fixed-dim text-on-surface',
  warning: 'bg-amber-50 border-amber-200 text-on-surface',
  success: 'bg-primary/5 border-primary/10 text-primary',
};

const ICONS: Record<Variant, React.ElementType> = {
  info: Zap,
  warning: AlertTriangle,
  success: BookOpen,
};

interface ExpertTipProps {
  children: React.ReactNode;
  variant?: Variant;
}

export function ExpertTip({ children, variant = 'info' }: ExpertTipProps) {
  const Icon = ICONS[variant];
  return (
    <div className={cn('p-5 rounded-xl border flex gap-4 items-start', STYLES[variant])}>
      <Icon className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
