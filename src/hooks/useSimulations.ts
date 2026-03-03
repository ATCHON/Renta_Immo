// src/hooks/useSimulations.ts — Pagination curseur (ARCH-S05)
// Migré de useQuery+offset vers useInfiniteQuery+cursor pour performances stables
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import type { SimulationSort, CursorPaginationMeta } from '@/types/simulations';

interface QueryOptions {
  limit?: number;
  sort?: SimulationSort | 'name';
  favorite?: boolean;
  archived?: boolean;
  status?: 'all' | 'favorites' | 'archived';
  search?: string;
}

interface SimulationListResponse {
  success: boolean;
  data: unknown[];
  meta: CursorPaginationMeta;
}

async function fetchSimulations(
  options: QueryOptions & { cursor?: string }
): Promise<SimulationListResponse> {
  const params = new URLSearchParams();
  if (options.limit) params.set('limit', String(options.limit));
  if (options.cursor) params.set('cursor', options.cursor);
  // Note: name n'est pas une colonne keyset-compatible — fallback sur created_at
  if (options.sort && options.sort !== 'name') params.set('sort', options.sort);
  // Les filtres stables restent dans l'URL
  if (options.status === 'favorites' || options.favorite) params.set('favorite', 'true');
  if (options.status === 'archived' || options.archived) params.set('archived', 'true');
  if (options.search) params.set('search', options.search);

  const res = await fetch(`/api/simulations?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch simulations');
  return res.json() as Promise<SimulationListResponse>;
}

/**
 * Hook principal pour la liste paginée des simulations.
 * Utilise useInfiniteQuery avec pagination curseur (keyset).
 * Le cursor n'est PAS dans l'URL (éphémère) — les filtres restent dans l'URL.
 */
export function useSimulations(options: QueryOptions = {}) {
  return useInfiniteQuery({
    queryKey: ['simulations', options],
    queryFn: ({ pageParam }) =>
      fetchSimulations({ ...options, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage: SimulationListResponse) => lastPage.meta.next_cursor ?? undefined,
  });
}

export function useSimulation(id: string | null) {
  return useQuery({
    queryKey: ['simulation', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/simulations/${id}`);
      if (!res.ok) throw new Error('Failed to fetch simulation');
      return res.json();
    },
    enabled: !!id,
  });
}
