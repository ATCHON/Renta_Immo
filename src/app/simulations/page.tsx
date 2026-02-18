'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { SimulationFilters } from '@/components/simulations/SimulationFilters';
import { Pagination } from '@/components/ui/Pagination';
import { useSimulations } from '@/hooks/useSimulations';
import { useSimulationMutations } from '@/hooks/useSimulationMutations';
import { logger } from '@/lib/logger';
import { SimulationCard } from '@/components/simulations/SimulationCard';
import type { Simulation } from '@/types/database';

const VALID_STATUSES = ['all', 'favorites', 'archived'] as const;
type StatusFilter = (typeof VALID_STATUSES)[number];

const VALID_SORTS = ['created_at', 'score_global', 'name'] as const;
type SortField = (typeof VALID_SORTS)[number];

export default function SimulationsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read filters from URL search params
  const rawStatus = searchParams.get('status') || 'all';
  const status: StatusFilter = (VALID_STATUSES as readonly string[]).includes(rawStatus)
    ? (rawStatus as StatusFilter)
    : 'all';

  const rawSort = searchParams.get('sort') || 'created_at';
  const sort: SortField = (VALID_SORTS as readonly string[]).includes(rawSort)
    ? (rawSort as SortField)
    : 'created_at';

  const order = searchParams.get('order') === 'asc' ? ('asc' as const) : ('desc' as const);
  const search = searchParams.get('q') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);

  const limit = 9;
  const offset = (page - 1) * limit;

  // Helper to update URL params (shallow navigation)
  const updateParams = React.useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ''}`);
    },
    [searchParams, router, pathname]
  );

  // Local search state for responsive input (debounced sync to URL)
  const [localSearch, setLocalSearch] = React.useState(search);

  // Sync URL → local when URL changes externally (back/forward)
  React.useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  // Debounce local search → URL
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== search) {
        updateParams({ q: localSearch || null, page: null });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, search, updateParams]);

  const {
    data: response,
    isLoading,
    error,
  } = useSimulations({
    sort,
    order,
    status,
    search,
    limit,
    offset,
  });

  const { deleteSimulation, toggleFavorite, renameSimulation, toggleArchive } =
    useSimulationMutations();

  const safeMutate = async <T,>(fn: () => Promise<T>, label: string) => {
    try {
      await fn();
    } catch (error) {
      logger.error(`Failed to ${label}:`, error);
    }
  };

  const handleDelete = (id: string) =>
    safeMutate(() => deleteSimulation.mutateAsync(id), 'delete simulation');
  const handleToggleFavorite = (id: string, isFavorite: boolean) =>
    safeMutate(() => toggleFavorite.mutateAsync({ id, isFavorite }), 'toggle favorite');
  const handleRename = (id: string, newName: string) =>
    safeMutate(() => renameSimulation.mutateAsync({ id, name: newName }), 'rename');
  const handleToggleArchive = (id: string, isArchived: boolean) =>
    safeMutate(() => toggleArchive.mutateAsync({ id, isArchived }), 'toggle archive');

  const simulations = response?.data || [];
  const total = response?.meta?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <main className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Mes Simulations</h1>
          <p className="text-slate-500 mt-2 font-medium">
            Retrouvez et analysez vos projets sauvegardés.
          </p>
        </div>
        <Link
          href="/calculateur"
          className="px-6 py-3 bg-forest text-white font-bold rounded-xl shadow-lg shadow-forest/20 hover:bg-forest-dark active:transform active:scale-95 transition-all text-sm uppercase tracking-wider"
        >
          Nouvelle simulation
        </Link>
      </div>

      <SimulationFilters
        search={localSearch}
        onSearchChange={setLocalSearch}
        status={status}
        onStatusChange={(s) => updateParams({ status: s === 'all' ? null : s, page: null })}
        sort={sort}
        onSortChange={(s) => updateParams({ sort: s === 'created_at' ? null : s, page: null })}
        order={order}
        onOrderChange={(o) => updateParams({ order: o === 'desc' ? null : o, page: null })}
      />

      {isLoading ? (
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-forest rounded-full animate-spin mb-4" />
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 text-slate-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Aucune simulation trouvée</h2>
          <p className="text-slate-500 max-w-xs mx-auto mb-8">
            {status !== 'all' || search
              ? 'Essayez de modifier vos filtres.'
              : 'Lancez un calcul et sauvegardez-le pour le retrouver ici.'}
          </p>
          {status === 'all' && !search && (
            <Link href="/calculateur" className="text-forest font-bold hover:underline">
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
            onPageChange={(p) => updateParams({ page: p <= 1 ? null : String(p) })}
          />
        </>
      )}
    </main>
  );
}
