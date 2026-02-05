import React from 'react';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';
import type { Simulation } from '@/types/database';
import { SimulationActions } from './SimulationActions';

interface SimulationCardProps {
    simulation: Simulation;
    onDelete?: (id: string) => void;
    onToggleFavorite?: (id: string, isFavorite: boolean) => void;
    onRename?: (id: string, newName: string) => Promise<void>;
    onToggleArchive?: (id: string, isArchived: boolean) => Promise<void>;
}

export const SimulationCard: React.FC<SimulationCardProps> = ({
    simulation,
    onDelete,
    onToggleFavorite,
    onRename,
    onToggleArchive
}) => {
    return (
        <div className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-slate-200 border border-slate-100 p-8 transition-all duration-300 relative">
            <div className="flex justify-between items-start mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg ${(simulation.score_global || 0) >= 70 ? 'bg-emerald-50 text-emerald-600' :
                    (simulation.score_global || 0) >= 40 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                    {simulation.score_global || '-'}
                </div>

                <SimulationActions
                    simulation={simulation}
                    onDelete={onDelete}
                    onToggleFavorite={onToggleFavorite}
                    onRename={onRename}
                    onToggleArchive={onToggleArchive}
                />
            </div>

            <Link href={`/simulations/${simulation.id}`} className="block">
                <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors truncate">
                    {simulation.name}
                </h3>
                <p className="text-slate-400 text-sm font-medium mb-6">
                    Créé le {new Date(simulation.created_at).toLocaleDateString('fr-FR')}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                    <div>
                        <p className="text-[10px] uppercase tracking-wider font-black text-slate-300 mb-1">Rentabilité</p>
                        <p className="font-bold text-slate-700">{simulation.rentabilite_brute}%</p>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-wider font-black text-slate-300 mb-1">Cash-flow</p>
                        <p className={`font-bold ${(simulation.cashflow_mensuel || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {(simulation.cashflow_mensuel || 0) >= 0 ? '+' : ''}{formatCurrency(simulation.cashflow_mensuel || 0)}
                        </p>
                    </div>
                </div>
            </Link>
        </div>
    );
};
