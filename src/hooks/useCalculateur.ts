'use client';

import { useMutation } from '@tanstack/react-query';
import { calculateRentability, getErrorMessage } from '@/lib/api';
import { useCalculateurStore } from '@/stores/calculateur.store';
import type { CalculateurFormData } from '@/types';

/**
 * Hook pour effectuer le calcul de rentabilité via l'API n8n
 */
export function useCalculateur() {
  const { setResultats, setStatus, setError } = useCalculateurStore();

  const mutation = useMutation({
    mutationFn: (formData: CalculateurFormData) => calculateRentability(formData),
    onMutate: () => {
      setStatus('loading');
      setError(null);
    },
    onSuccess: (data) => {
      setResultats(data.resultats, data.pdfUrl);
    },
    onError: (error: Error) => {
      const message = getErrorMessage(error);
      setError(message);
    },
  });

  return {
    calculate: mutation.mutate,
    calculateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error ? getErrorMessage(mutation.error) : null,
    reset: mutation.reset,
  };
}
