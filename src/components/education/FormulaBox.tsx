import { cn } from '@/lib/utils';

interface FormulaBoxProps {
  children: React.ReactNode;
  highlight?: boolean;
}

export function FormulaBox({ children, highlight = false }: FormulaBoxProps) {
  return (
    <div
      className={cn(
        'p-4 rounded-xl font-mono text-sm font-semibold leading-relaxed',
        highlight
          ? 'bg-primary/5 border border-primary/10 text-primary'
          : 'bg-surface-container-low border border-outline-variant/40 text-primary'
      )}
    >
      {children}
    </div>
  );
}
