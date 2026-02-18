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
    onSuccess: async (data, variables) => {
      // Stocker les résultats et déclencher la redirection
      setResultats(data.resultats, data.pdfUrl);

      // Gérer l'envoi d'email si demandé
      if (variables.options.envoyer_email && variables.options.email) {
        try {
          // On envoie le résultat complet
          await fetch('/api/send-simulation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: variables.options.email,
              formData: variables,
              resultats: data.resultats,
            }),
          });
          // TODO: Ajouter un toast de succès via Sonner ou autre si disponible
        } catch (e) {
          console.error("Erreur lors de l'envoi de l'email", e);
        }
      }
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
