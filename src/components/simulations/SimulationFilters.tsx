'use client';

import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

interface SimulationFiltersProps {
    search: string;
    onSearchChange: (value: string) => void;
    status: 'all' | 'favorites' | 'archived';
    onStatusChange: (status: 'all' | 'favorites' | 'archived') => void;
    sort: 'created_at' | 'score_global' | 'name';
    onSortChange: (sort: 'created_at' | 'score_global' | 'name') => void;
    order: 'asc' | 'desc';
    onOrderChange: (order: 'asc' | 'desc') => void;
}

export const SimulationFilters: React.FC<SimulationFiltersProps> = ({
    search,
    onSearchChange,
    status,
    onStatusChange,
    sort,
    onSortChange,
    order,
    onOrderChange,
}) => {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:gap-4 md:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                    type="text"
                    placeholder="Rechercher une simulation..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-forest/20 focus:bg-white transition-all text-sm font-medium"
                />
            </div>

            <div className="flex flex-wrap gap-2 md:gap-4 items-center overflow-x-auto pb-1 md:pb-0">
                {/* Status Filter */}
                <div className="flex bg-slate-50 p-1 rounded-xl">
                    {(['all', 'favorites', 'archived'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => onStatusChange(s)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${status === s
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {s === 'all' && 'Tous'}
                            {s === 'favorites' && 'Favoris'}
                            {s === 'archived' && 'Archivés'}
                        </button>
                    ))}
                </div>

                <div className="w-px h-8 bg-slate-100 hidden md:block" />

                {/* Sort */}
                <div className="flex items-center gap-2">
                    <select
                        value={sort}
                        onChange={(e) => onSortChange(e.target.value as any)}
                        className="bg-transparent text-sm font-medium text-slate-600 focus:outline-none cursor-pointer hover:text-slate-900"
                    >
                        <option value="created_at">Date de création</option>
                        <option value="score_global">Score global</option>
                        <option value="name">Nom</option>
                    </select>

                    <button
                        onClick={() => onOrderChange(order === 'asc' ? 'desc' : 'asc')}
                        className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        title={order === 'asc' ? 'Croissant' : 'Décroissant'}
                    >
                        <ArrowUpDown className={`w-4 h-4 transition-transform ${order === 'asc' ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>
        </div>
    );
};
