'use client';

import React from 'react';
import Link from 'next/link';
import { SimulationFilters } from '@/components/simulations/SimulationFilters';
import { Pagination } from '@/components/ui/Pagination';
import { useSimulations } from '@/hooks/useSimulations';
import { useSimulationMutations } from '@/hooks/useSimulationMutations';
import { logger } from '@/lib/logger';
import { SimulationCard } from '@/components/simulations/SimulationCard';
import type { Simulation } from '@/types/database';

export default function SimulationsPage() {
    // Filter States
    const [search, setSearch] = React.useState('');
    const [status, setStatus] = React.useState<'all' | 'favorites' | 'archived'>('all');
    const [sort, setSort] = React.useState<'created_at' | 'score_global' | 'name'>('created_at');
    const [order, setOrder] = React.useState<'asc' | 'desc'>('desc');

    // Pagination State
    const [page, setPage] = React.useState(1);
    const limit = 9; // 9 cards per page
    const offset = (page - 1) * limit;

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = React.useState(search);
    React.useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: response, isLoading, error } = useSimulations({
        sort,
        order,
        status,
        search: debouncedSearch,
        limit,
        offset
    });

    // Reset page when filters change
    React.useEffect(() => {
        setPage(1);
    }, [status, search, sort, order]);

    const { deleteSimulation, toggleFavorite, renameSimulation, toggleArchive } = useSimulationMutations();

    const safeMutate = async <T,>(fn: () => Promise<T>, label: string) => {
        try { await fn(); } catch (error) { logger.error(`Failed to ${label}:`, error); }
    };

    const handleDelete = (id: string) => safeMutate(() => deleteSimulation.mutateAsync(id), 'delete simulation');
    const handleToggleFavorite = (id: string, isFavorite: boolean) => safeMutate(() => toggleFavorite.mutateAsync({ id, isFavorite }), 'toggle favorite');
    const handleRename = (id: string, newName: string) => safeMutate(() => renameSimulation.mutateAsync({ id, name: newName }), 'rename');
    const handleToggleArchive = (id: string, isArchived: boolean) => safeMutate(() => toggleArchive.mutateAsync({ id, isArchived }), 'toggle archive');

    const simulations = response?.data || [];
    const total = response?.meta?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return (
        <main className="container mx-auto px-4 py-12 max-w-6xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
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

            <SimulationFilters
                search={search}
                onSearchChange={setSearch}
                status={status}
                onStatusChange={setStatus}
                sort={sort}
                onSortChange={setSort}
                order={order}
                onOrderChange={setOrder}
            />

            {isLoading ? (
                <div className="container mx-auto px-4 py-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Chargement de vos simulations...</p>
                </div>
            ) : error ? (
                <div className="container mx-auto px-4 py-12 text-center">
                    <div className="bg-red-50 text-red-700 p-6 rounded-2xl max-w-md mx-auto inline-block border border-red-100">
                        <p className="font-bold mb-2">Erreur lors du chargement</p>
                        <p className="text-sm opacity-90">Veuillez réessayer plus tard.</p>
                    </div>
                </div>
            ) : simulations.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Aucune simulation trouvée</h2>
                    <p className="text-slate-500 max-w-xs mx-auto mb-8">
                        {status !== 'all' || search ? "Essayez de modifier vos filtres." : "Lancez un calcul et sauvegardez-le pour le retrouver ici."}
                    </p>
                    {(status === 'all' && !search) && (
                        <Link
                            href="/calculateur"
                            className="text-blue-600 font-bold hover:underline"
                        >
                            Lancer ma première analyse →
                        </Link>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {simulations.map((sim: Simulation) => (
                            <SimulationCard
                                key={sim.id}
                                simulation={sim}
                                onDelete={handleDelete}
                                onToggleFavorite={handleToggleFavorite}
                                onRename={handleRename}
                                onToggleArchive={handleToggleArchive}
                            />
                        ))}
                    </div>

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </>
            )}
        </main>
    );
}
