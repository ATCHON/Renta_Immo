'use client';

import { useState, useCallback } from 'react';
import type { CalculateurFormData, CalculResultats } from '@/types/calculateur';

type PdfStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseDownloadPdfReturn {
  downloadPdf: (formData: CalculateurFormData, resultats: CalculResultats) => Promise<void>;
  status: PdfStatus;
  error: string | null;
  reset: () => void;
}

/**
 * Hook for downloading PDF simulation reports
 * Handles the API call, blob creation, and file download
 */
export function useDownloadPdf(): UseDownloadPdfReturn {
  const [status, setStatus] = useState<PdfStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const downloadPdf = useCallback(
    async (formData: CalculateurFormData, resultats: CalculResultats) => {
      setStatus('loading');
      setError(null);

      try {
        const response = await fetch('/api/pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formData, resultats }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Erreur lors de la génération du PDF');
        }

        // Create blob from response
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        // Generate filename with date
        const today = new Date().toISOString().split('T')[0];
        const filename = `simulation-renta-immo-${today}.pdf`;

        // Trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup blob URL
        URL.revokeObjectURL(url);

        setStatus('success');

        // Reset to idle after 2 seconds
        setTimeout(() => setStatus('idle'), 2000);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erreur inconnue';
        setError(message);
        setStatus('error');
      }
    },
    []
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return { downloadPdf, status, error, reset };
}
