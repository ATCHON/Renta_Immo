'use client';

import React, { useState } from 'react';
import { TableauAmortissement } from '@/types/calculateur';
import { formatCurrency } from '@/lib/utils';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';
import { X } from 'lucide-react';

interface AmortizationTableProps {
  data: TableauAmortissement;
}

export const AmortizationTable = React.memo(function AmortizationTable({
  data,
}: AmortizationTableProps) {
  const [showMonthly, setShowMonthly] = useState(false);

  if (!data || !data.annuel) return null;

  return (
    <Card className="col-span-full border-sand/50 shadow-sm overflow-hidden">
      <CardHeader
        title="Détail du crédit"
        description="Répartition capital / intérêts par an"
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowMonthly(true)}
            className="text-xs uppercase tracking-widest font-bold"
          >
            Détail mensuel
          </Button>
        }
      />
      <CardContent className="p-0">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-sand scrollbar-track-transparent">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-sand/50">
                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest">
                  Année
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">
                  Échéance
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">
                  Capital
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">
                  Intérêts
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">
                  Assurance
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">
                  Reste dû
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/30">
              {data.annuel.map((row) => (
                <tr key={row.periode} className="hover:bg-sand/10 transition-colors group">
                  <td className="px-6 py-4 font-bold text-charcoal">
                    {new Date().getFullYear() + row.periode - 1}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums text-pebble">
                    {formatCurrency(row.echeance)}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums text-forest font-medium">
                    {formatCurrency(row.capital)}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums text-amber-700">
                    {formatCurrency(row.interets)}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums text-charcoal/60">
                    {formatCurrency(row.assurance)}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums font-bold text-charcoal">
                    {formatCurrency(row.capitalRestant)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-surface/50 border-t-2 border-sand/30">
              <tr className="font-black text-charcoal">
                <td className="px-6 py-4 text-[10px] uppercase tracking-widest text-pebble">
                  TOTAL
                </td>
                <td className="px-6 py-4 text-right tabular-nums">
                  {formatCurrency(data.totaux.totalPaye)}
                </td>
                <td className="px-6 py-4 text-right">-</td>
                <td className="px-6 py-4 text-right tabular-nums text-amber-900">
                  {formatCurrency(data.totaux.totalInterets)}
                </td>
                <td className="px-6 py-4 text-right tabular-nums">
                  {formatCurrency(data.totaux.totalAssurance)}
                </td>
                <td className="px-6 py-4 text-right">-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>

      {/* Modal Détail Mensuel */}
      {showMonthly && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-md animate-in fade-in duration-300 hover:cursor-pointer"
          onClick={() => setShowMonthly(false)}
        >
          <Card
            className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border-none hover:cursor-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader
              title="Détail mensuel du crédit"
              description="Détail mois par mois sur toute la durée du crédit"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMonthly(false)}
                  className="rounded-full hover:bg-sand/30 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              }
            />
            <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-sand">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="sticky top-0 bg-white shadow-sm z-10">
                    <tr className="bg-surface border-b border-sand/50">
                      <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest">
                        Mois
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">
                        Échéance
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">
                        Capital
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">
                        Intérêts
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">
                        Assurance
                      </th>
                      <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">
                        Reste dû
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/20">
                    {data.mensuel?.map((row) => (
                      <tr key={row.periode} className="hover:bg-sand/5 transition-colors">
                        <td className="px-6 py-3 font-bold text-charcoal tabular-nums">
                          Mois {row.periode}
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums text-pebble">
                          {formatCurrency(row.echeance)}
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums text-forest font-medium">
                          {formatCurrency(row.capital)}
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums text-amber-700">
                          {formatCurrency(row.interets)}
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums text-charcoal/40">
                          {formatCurrency(row.assurance)}
                        </td>
                        <td className="px-6 py-3 text-right tabular-nums font-bold text-charcoal">
                          {formatCurrency(row.capitalRestant)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Card>
  );
});
