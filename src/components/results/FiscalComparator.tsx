'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Info, CheckCircle2 } from 'lucide-react';
import { FiscaliteComparaison } from '@/types/calculateur';

interface FiscalComparatorProps {
    data: FiscaliteComparaison;
}

export const FiscalComparator: React.FC<FiscalComparatorProps> = ({ data }) => {
    if (!data || !data.items || data.items.length === 0) return null;

    return (
        <section className="space-y-6 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Comparatif des Régimes Fiscaux</h2>
                    <p className="text-slate-500 mt-1 max-w-2xl">
                        Optimisez votre investissement en comparant l&apos;impact fiscal des principaux régimes.
                        Le cash-flow net est l&apos;indicateur clé pour votre poche.
                    </p>
                </div>
            </div>

            <Card className="overflow-hidden border-slate-200/60 shadow-sm transition-all hover:shadow-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200/60">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest min-w-[200px]">Régime Fiscal</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest text-center whitespace-nowrap">Impôt annuel (Moy.)</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest text-center whitespace-nowrap">Cashflow Net annuel</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest text-center whitespace-nowrap">Renta Nette-Nette</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest text-right">Analyse</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.items.map((item, idx) => (
                                <tr
                                    key={idx}
                                    className={`group transition-colors ${item.isOptimal ? 'bg-indigo-50/30' : 'hover:bg-slate-50/50'}`}
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold ${item.isOptimal ? 'text-indigo-700' : 'text-slate-800'}`}>
                                                {item.regime}
                                            </span>
                                            {item.isOptimal && (
                                                <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">
                                                    CONSEILLÉ
                                                </span>
                                            )}
                                            {item.isSelected && (
                                                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap">
                                                    VOTRE CHOIX
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 group-hover:line-clamp-none transition-all duration-300">
                                            {item.description}
                                        </p>
                                        {item.dividendes_bruts !== undefined && item.dividendes_bruts > 0 && (
                                            <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-100 text-[10px] space-y-1">
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Div. bruts:</span>
                                                    <span className="font-semibold text-slate-700">{Math.round(item.dividendes_bruts).toLocaleString()} €</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-slate-500">Flat Tax (30%):</span>
                                                    <span className="font-semibold text-rose-500">-{Math.round(item.flat_tax || 0).toLocaleString()} €</span>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-5 text-center font-medium text-slate-600 text-sm">
                                        {item.impotAnnuelMoyen > 0 ? `${Math.round(item.impotAnnuelMoyen).toLocaleString()} €` : '0 €'}
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`text-base font-bold ${item.cashflowNetMoyen > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                                            {item.cashflowNetMoyen > 0 ? '+' : ''}{Math.round(item.cashflowNetMoyen).toLocaleString()} €
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <div className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200/50">
                                            {item.rentabiliteNetteNette}%
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        {item.isOptimal ? (
                                            <div className="flex items-center justify-end text-indigo-600 font-medium text-sm gap-1.5 slide-in-from-right-2 animate-in duration-500">
                                                <CheckCircle2 size={16} />
                                                Optimisation Max
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-sm group-hover:text-slate-500 transition-colors">Alternative</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-5 flex items-start gap-4">
                <div className="bg-indigo-600 text-white rounded-full p-2 mt-0.5 shadow-sm">
                    <Info size={18} />
                </div>
                <div>
                    <h4 className="font-bold text-indigo-900">Conseil de l&apos;expert</h4>
                    <p className="text-indigo-800/80 text-sm mt-1 leading-relaxed">
                        {data.conseil}
                        <span className="block mt-2 font-medium opacity-75">
                            Rappel : Les calculs sont basés sur vos TMI déclarées et les taux de prélèvements sociaux 2025.
                        </span>
                    </p>
                </div>
            </div>
        </section>
    );
};
