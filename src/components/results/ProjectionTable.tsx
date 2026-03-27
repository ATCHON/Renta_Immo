'use client';

import React, { useState, useMemo } from 'react';
import { ProjectionData } from '@/types/calculateur';
import { formatCurrency, cn } from '@/lib/utils';
import { Card, CardHeader, CardContent } from '@/components/ui';

interface ProjectionTableProps {
  data: ProjectionData;
}

export const ProjectionTable = React.memo(function ProjectionTable({ data }: ProjectionTableProps) {
  const [mode, setMode] = useState<'annuel' | 'trimestriel'>('annuel');

  const rows = useMemo(() => {
    if (!data?.projections) return [];

    const currentYear = new Date().getFullYear();

    if (mode === 'annuel') {
      return data.projections.map((r) => ({
        ...r,
        periodLabel: `${currentYear + r.annee - 1}`,
      }));
    }

    // Trimestriel interpolation
    const result = [];
    for (let i = 0; i < data.projections.length; i++) {
      const curr = data.projections[i];

      // Approximate the starting values for interpolation
      const prevCap =
        i > 0
          ? data.projections[i - 1].capitalRestant
          : curr.capitalRestant + curr.capitalRembourse;

      const prevPat =
        i > 0
          ? data.projections[i - 1].patrimoineNet
          : curr.patrimoineNet - (curr.cashflowNetImpot + curr.capitalRembourse);

      for (let q = 1; q <= 4; q++) {
        result.push({
          periodLabel: `T${q} ${currentYear + curr.annee - 1}`,
          loyer: curr.loyer / 4,
          charges: curr.charges / 4,
          mensualite: curr.mensualite / 4,
          cashflow: curr.cashflow / 4,
          impot: curr.impot / 4,
          cashflowNetImpot: curr.cashflowNetImpot / 4,
          capitalRestant: prevCap + (curr.capitalRestant - prevCap) * (q / 4),
          patrimoineNet: prevPat + (curr.patrimoineNet - prevPat) * (q / 4),
          key: `${curr.annee}-T${q}`,
        });
      }
    }
    return result;
  }, [data, mode]);

  if (!data || !data.projections) return null;

  const h = data.hypotheses;
  const hypothesesLine = h
    ? `Hypothèses : loyers +${(h.inflationLoyer * 100).toFixed(1)} %/an · charges +${(h.inflationCharges * 100).toFixed(1)} %/an · revalorisation bien +${(h.revalorisationBien * 100).toFixed(1)} %/an`
    : null;

  return (
    <Card className="col-span-full border-sand/50 shadow-sm overflow-hidden">
      <CardHeader
        title={`Projection sur ${data.horizon} ans`}
        description="Évolution du patrimoine et des flux financiers"
      />
      {hypothesesLine && <p className="text-xs text-stone px-6 pb-2 -mt-2">{hypothesesLine}</p>}
      <CardContent className="p-0">
        <div className="flex items-center justify-end px-6 pb-4 pt-2">
          <div className="bg-surface-container rounded-full p-1 flex">
            <button
              onClick={() => setMode('annuel')}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-bold transition-colors',
                mode === 'annuel'
                  ? 'bg-surface shadow-sm text-charcoal'
                  : 'text-stone hover:text-charcoal'
              )}
            >
              Annuel
            </button>
            <button
              onClick={() => setMode('trimestriel')}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-bold transition-colors',
                mode === 'trimestriel'
                  ? 'bg-surface shadow-sm text-charcoal'
                  : 'text-stone hover:text-charcoal'
              )}
            >
              Trimestriel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-sand scrollbar-track-transparent">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-surface border-b border-sand/50 border-t">
                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest">
                  Période
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">
                  Loyer
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">
                  Charges expl.
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">
                  Crédit
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">
                  CF brut
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">
                  Impôts
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">
                  CF net
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">
                  Capital restant
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">
                  Patrimoine net
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/30">
              {rows.map((row) => (
                <tr
                  key={'key' in row ? row.key : row.periodLabel}
                  className="hover:bg-sand/10 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-charcoal tabular-nums whitespace-nowrap">
                    {row.periodLabel}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums text-pebble">
                    {formatCurrency(row.loyer)}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums text-terracotta/70 font-medium whitespace-nowrap">
                    -{formatCurrency(row.charges)}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums text-amber-700/70 font-medium whitespace-nowrap">
                    -{formatCurrency(row.mensualite)}
                  </td>
                  <td
                    className={cn(
                      'px-6 py-4 text-right tabular-nums font-medium whitespace-nowrap',
                      row.cashflow >= 0 ? 'text-forest/70' : 'text-terracotta/70'
                    )}
                  >
                    {formatCurrency(row.cashflow)}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums text-terracotta/70 font-medium whitespace-nowrap">
                    {row.impot > 0 ? `-${formatCurrency(row.impot)}` : formatCurrency(row.impot)}
                  </td>
                  <td
                    className={cn(
                      'px-6 py-4 text-right tabular-nums font-black whitespace-nowrap',
                      row.cashflowNetImpot >= 0 ? 'text-forest' : 'text-terracotta'
                    )}
                  >
                    {formatCurrency(row.cashflowNetImpot)}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums text-pebble whitespace-nowrap">
                    {formatCurrency(row.capitalRestant)}
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums font-black text-charcoal whitespace-nowrap">
                    {formatCurrency(row.patrimoineNet)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-surface/50 border-t-2 border-sand/30">
              <tr className="font-black text-charcoal">
                <td className="px-6 py-4 text-[10px] uppercase tracking-widest text-pebble">
                  TOTAL / FIN
                </td>
                <td className="px-6 py-4 text-right">-</td>
                <td className="px-6 py-4 text-right">-</td>
                <td className="px-6 py-4 text-right">-</td>
                <td className="px-6 py-4 text-right">-</td>
                <td className="px-6 py-4 text-right">-</td>
                <td
                  className={cn(
                    'px-6 py-4 text-right tabular-nums',
                    data.totaux.cashflowCumule >= 0 ? 'text-forest' : 'text-terracotta'
                  )}
                >
                  {formatCurrency(data.totaux.cashflowCumule)}
                </td>
                <td className="px-6 py-4 text-right">-</td>
                <td className="px-6 py-4 text-right tabular-nums text-forest-dark whitespace-nowrap">
                  {formatCurrency(data.totaux.enrichissementTotal)}
                  <span className="ml-1 text-[10px] font-bold text-pebble uppercase tracking-tighter">
                    Enrich.
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
});
