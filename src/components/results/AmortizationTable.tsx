'use client';

import React, { useState } from 'react';
import type { TableauAmortissement } from '@/types/calculateur';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

interface AmortizationTableProps {
  data: TableauAmortissement;
}

const TH = ({ children, right }: { children: React.ReactNode; right?: boolean }) => (
  <th
    className={cn(
      'px-4 py-3 text-[10px] font-black text-on-surface-variant uppercase tracking-widest',
      right && 'text-right'
    )}
  >
    {children}
  </th>
);

const TD = ({
  children,
  right,
  className,
}: {
  children: React.ReactNode;
  right?: boolean;
  className?: string;
}) => (
  <td className={cn('px-4 py-3 text-sm', right && 'text-right tabular-nums', className)}>
    {children}
  </td>
);

export const AmortizationTable = React.memo(function AmortizationTable({
  data,
}: AmortizationTableProps) {
  const [showAll, setShowAll] = useState(false);

  if (!data?.annuel) return null;

  const PREVIEW_ROWS = 5;
  const rows = data.annuel;
  const visibleRows = showAll ? rows : rows.slice(0, PREVIEW_ROWS);
  const hasMore = rows.length > PREVIEW_ROWS;
  const currentYear = new Date().getFullYear();

  return (
    <Card className="overflow-hidden border-outline-variant/50 shadow-sm">
      <CardHeader
        title="Tableau d'amortissement"
        description="Répartition capital / intérêts par an"
      />
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant/50">
                <TH>Année</TH>
                <TH right>Échéance</TH>
                <TH right>Capital</TH>
                <TH right>Intérêts</TH>
                <TH right>Assurance</TH>
                <TH right>Reste dû</TH>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {visibleRows.map((row) => (
                <tr key={row.periode} className="hover:bg-surface-container/50 transition-colors">
                  <TD className="font-bold text-on-surface">{currentYear + row.periode - 1}</TD>
                  <TD right className="text-on-surface-variant">
                    {formatCurrency(row.echeance)}
                  </TD>
                  <TD right className="text-primary font-medium">
                    {formatCurrency(row.capital)}
                  </TD>
                  <TD right className="text-tertiary">
                    {formatCurrency(row.interets)}
                  </TD>
                  <TD right className="text-on-surface-variant/60">
                    {formatCurrency(row.assurance)}
                  </TD>
                  <TD right className="font-bold text-on-surface">
                    {formatCurrency(row.capitalRestant)}
                  </TD>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-surface-container border-t-2 border-outline-variant/50">
              <tr className="font-black text-on-surface">
                <TD className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                  TOTAL
                </TD>
                <TD right>{formatCurrency(data.totaux.totalPaye)}</TD>
                <TD right>—</TD>
                <TD right className="text-tertiary">
                  {formatCurrency(data.totaux.totalInterets)}
                </TD>
                <TD right>{formatCurrency(data.totaux.totalAssurance)}</TD>
                <TD right>—</TD>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Accordéon "Voir le tableau complet" */}
        {hasMore && (
          <div className="border-t border-outline-variant/30 px-4 py-3">
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-primary font-medium hover:text-primary/80 transition-colors underline-offset-2 hover:underline"
            >
              {showAll
                ? 'Masquer le tableau complet'
                : `Voir le tableau complet (${rows.length} ans)`}
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
