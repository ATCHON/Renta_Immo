import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SimulationInsert, SimulationUpdate } from '@/types/database';

export function useSimulationMutations() {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (data: SimulationInsert) => {
            const res = await fetch('/api/simulations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to create simulation');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['simulations'] });
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: SimulationUpdate }) => {
            const res = await fetch(`/api/simulations/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error('Failed to update simulation');
            return res.json();
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['simulations'] });
            queryClient.invalidateQueries({ queryKey: ['simulation', variables.id] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/simulations/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete simulation');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['simulations'] });
        },
    });

    return {
        createSimulation: createMutation,
        updateSimulation: updateMutation,
        deleteSimulation: deleteMutation,
    };
}
