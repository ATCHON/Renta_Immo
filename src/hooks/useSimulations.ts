import { useQuery } from '@tanstack/react-query';

interface QueryOptions {
  limit?: number;
  offset?: number;
  sort?: 'created_at' | 'updated_at' | 'score_global' | 'name';
  order?: 'asc' | 'desc';
  favorite?: boolean;
  archived?: boolean;
  status?: 'all' | 'favorites' | 'archived';
  search?: string;
}

export function useSimulations(options: QueryOptions = {}) {
  const params = new URLSearchParams();
  if (options.limit) params.set('limit', String(options.limit));
  if (options.offset) params.set('offset', String(options.offset));
  if (options.sort) params.set('sort', options.sort);
  if (options.order) params.set('order', options.order);

  // Legacy support + new status param
  if (options.status === 'favorites' || options.favorite) params.set('favorite', 'true');
  if (options.status === 'archived' || options.archived) params.set('archived', 'true');

  if (options.search) params.set('search', options.search);

  return useQuery({
    queryKey: ['simulations', options],
    queryFn: async () => {
      const res = await fetch(`/api/simulations?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch simulations');
      return res.json();
    },
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
