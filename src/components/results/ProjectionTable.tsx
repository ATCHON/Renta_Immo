import React from 'react';
import { ProjectionData } from '@/types/calculateur';
import { formatCurrency, cn } from '@/lib/utils';
import { Card, CardHeader, CardContent } from '@/components/ui';

interface ProjectionTableProps {
    data: ProjectionData;
}

export const ProjectionTable = React.memo(function ProjectionTable({ data }: ProjectionTableProps) {
    if (!data || !data.projections) return null;

    return (
        <Card className="col-span-full border-sand/50 shadow-sm overflow-hidden">
            <CardHeader
                title={`Projection sur ${data.horizon} ans`}
                description="Évolution du patrimoine et des flux financiers"
            />
            <CardContent className="p-0">
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-sand scrollbar-track-transparent">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-surface border-b border-sand/50">
                                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest">Année</th>
                                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">Loyer annuel</th>
                                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">Charges expl.</th>
                                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">Crédit</th>
                                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">Cash-flow</th>
                                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">Capital restant</th>
                                <th className="px-6 py-4 text-[10px] font-black text-pebble uppercase tracking-widest text-right">Patrimoine net</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sand/30">
                            {data.projections.map((row) => (
                                <tr key={row.annee} className="hover:bg-sand/10 transition-colors">
                                    <td className="px-6 py-4 font-bold text-charcoal tabular-nums">
                                        {row.annee}
                                    </td>
                                    <td className="px-6 py-4 text-right tabular-nums text-pebble">
                                        {formatCurrency(row.loyer)}
                                    </td>
                                    <td className="px-6 py-4 text-right tabular-nums text-terracotta/70 font-medium">
                                        -{formatCurrency(row.charges)}
                                    </td>
                                    <td className="px-6 py-4 text-right tabular-nums text-amber-700/70 font-medium">
                                        -{formatCurrency(row.mensualite)}
                                    </td>
                                    <td className={cn(
                                        "px-6 py-4 text-right tabular-nums font-black",
                                        row.cashflow >= 0 ? 'text-forest' : 'text-terracotta'
                                    )}>
                                        {formatCurrency(row.cashflow)}
                                    </td>
                                    <td className="px-6 py-4 text-right tabular-nums text-pebble">
                                        {formatCurrency(row.capitalRestant)}
                                    </td>
                                    <td className="px-6 py-4 text-right tabular-nums font-black text-charcoal">
                                        {formatCurrency(row.patrimoineNet)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-surface/50 border-t-2 border-sand/30">
                            <tr className="font-black text-charcoal">
                                <td className="px-6 py-4 text-[10px] uppercase tracking-widest text-pebble">TOTAL / FIN</td>
                                <td className="px-6 py-4 text-right">-</td>
                                <td className="px-6 py-4 text-right">-</td>
                                <td className="px-6 py-4 text-right">-</td>
                                <td className={cn(
                                    "px-6 py-4 text-right tabular-nums",
                                    data.totaux.cashflowCumule >= 0 ? 'text-forest' : 'text-terracotta'
                                )}>
                                    {formatCurrency(data.totaux.cashflowCumule)}
                                </td>
                                <td className="px-6 py-4 text-right">-</td>
                                <td className="px-6 py-4 text-right tabular-nums text-forest-dark">
                                    {formatCurrency(data.totaux.enrichissementTotal)}
                                    <span className="ml-1 text-[10px] font-bold text-pebble uppercase tracking-tighter">Enrich.</span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
});
