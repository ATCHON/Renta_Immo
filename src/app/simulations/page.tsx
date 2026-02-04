'use client';

import React from 'react';
import Link from 'next/link';
import { useSimulations } from '@/hooks/useSimulations';
import { formatCurrency } from '@/lib/utils';

export default function SimulationsPage() {
    const { data: response, isLoading, error } = useSimulations({ sort: 'created_at', order: 'desc' });

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-500 font-medium">Chargement de vos simulations...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="bg-red-50 text-red-700 p-6 rounded-2xl max-w-md mx-auto inline-block border border-red-100">
                    <p className="font-bold mb-2">Erreur lors du chargement</p>
                    <p className="text-sm opacity-90">Veuillez réessayer plus tard.</p>
                </div>
            </div>
        );
    }

    const simulations = response?.data || [];

    return (
        <main className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Mes Simulations</h1>
                    <p className="text-slate-500 mt-2 font-medium">Retrouvez et analysez vos projets sauvegardés.</p>
                </div>
                <Link
                    href="/calculateur"
                    className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:transform active:scale-95 transition-all text-sm uppercase tracking-wider"
                >
                    Nouvelle simulation
                </Link>
            </div>

            {simulations.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Aucune simulation sauvegardée</h2>
                    <p className="text-slate-500 max-w-xs mx-auto mb-8">
                        Lancez un calcul et sauvegardez-le pour le retrouver ici.
                    </p>
                    <Link
                        href="/calculateur"
                        className="text-blue-600 font-bold hover:underline"
                    >
                        Lancer ma première analyse →
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {simulations.map((sim: any) => (
                        <div
                            key={sim.id}
                            className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-slate-200 border border-slate-100 p-8 transition-all duration-300"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg ${(sim.score_global || 0) >= 70 ? 'bg-emerald-50 text-emerald-600' :
                                    (sim.score_global || 0) >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                    }`}>
                                    {sim.score_global || '-'}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors truncate">
                                {sim.name}
                            </h3>
                            <p className="text-slate-400 text-sm font-medium mb-6">
                                Crée le {new Date(sim.created_at).toLocaleDateString('fr-FR')}
                            </p>

                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider font-black text-slate-300 mb-1">Rentabilité</p>
                                    <p className="font-bold text-slate-700">{sim.rentabilite_brute}%</p>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider font-black text-slate-300 mb-1">Cash-flow</p>
                                    <p className={`font-bold ${sim.cashflow_mensuel >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {sim.cashflow_mensuel >= 0 ? '+' : ''}{formatCurrency(sim.cashflow_mensuel)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
