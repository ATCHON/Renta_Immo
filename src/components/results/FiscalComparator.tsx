'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Info, CheckCircle2 } from 'lucide-react';
import { FiscaliteComparaison } from '@/types/calculateur';

interface FiscalComparatorProps {
    data: FiscaliteComparaison;
}

export const FiscalComparator = React.memo(function FiscalComparator({ data }: FiscalComparatorProps) {
    if (!data || !data.items || data.items.length === 0) return null;

    return (
        <section className="space-y-6 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-charcoal tracking-tight">Comparatif des Régimes Fiscaux</h2>
                    <p className="text-stone font-medium mt-1 max-w-2xl">
                        Optimisez votre investissement en comparant l&apos;impact fiscal des principaux régimes.
                        Le cash-flow net est l&apos;indicateur clé pour votre poche.
                    </p>
                </div>
            </div>

            <Card className="overflow-hidden border-sand/50 shadow-sm transition-all hover:shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface/50 border-b border-sand/50">
                                <th className="px-6 py-4 nordic-label-xs min-w-[200px]">Régime Fiscal</th>
                                <th className="px-6 py-4 nordic-label-xs text-center whitespace-nowrap">Impôt annuel (Moy.)</th>
                                <th className="px-6 py-4 nordic-label-xs text-center whitespace-nowrap">Cashflow Net annuel</th>
                                <th className="px-6 py-4 nordic-label-xs text-center whitespace-nowrap">Renta Nette-Nette</th>
                                <th className="px-6 py-4 nordic-label-xs text-right whitespace-nowrap">Conseil</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-sand/30">
                            {data.items.map((item, idx) => (
                                <tr
                                    key={idx}
                                    className={`group transition-colors ${item.isOptimal ? 'bg-forest/5' : 'hover:bg-surface/30'}`}
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-black tracking-tight ${item.isOptimal ? 'text-forest' : 'text-charcoal'}`}>
                                                {item.regime}
                                            </span>
                                            {item.isOptimal && (
                                                <span className="nordic-badge bg-forest text-white">
                                                    CONSEILLÉ
                                                </span>
                                            )}
                                            {item.isSelected && (
                                                <span className="nordic-badge bg-charcoal text-white">
                                                    VOTRE CHOIX
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-stone font-medium mt-1 line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                                            {item.description}
                                        </p>
                                        {item.dividendes_bruts !== undefined && item.dividendes_bruts > 0 && (
                                            <div className="mt-2 p-2 bg-white/50 rounded-xl border border-sand/50 text-[10px] space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-stone">Div. bruts:</span>
                                                    <span className="font-bold text-charcoal">{Math.round(item.dividendes_bruts).toLocaleString()} €</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-stone">Flat Tax (30%):</span>
                                                    <span className="font-bold text-terracotta">-{Math.round(item.flat_tax || 0).toLocaleString()} €</span>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-center font-bold text-charcoal text-sm">
                                        {item.impotAnnuelMoyen > 0 ? `${Math.round(item.impotAnnuelMoyen).toLocaleString()} €` : '0 €'}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`text-base font-black tabular-nums ${item.cashflowNetMoyen > 0 ? 'text-forest' : 'text-terracotta'}`}>
                                            {item.cashflowNetMoyen > 0 ? '+' : ''}{Math.round(item.cashflowNetMoyen).toLocaleString()} €
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="inline-flex items-center px-2 py-1 rounded-lg bg-surface text-charcoal text-xs font-black border border-sand/50">
                                            {item.rentabiliteNetteNette}%
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {item.isOptimal ? (
                                            <div className="flex items-center justify-end text-forest font-black text-xs gap-1.5 slide-in-from-right-2 animate-in duration-500 uppercase tracking-widest">
                                                <CheckCircle2 size={14} />
                                                Optimal
                                            </div>
                                        ) : (
                                            <span className="nordic-label-xs">Alternative</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

        </section>
    );
});
