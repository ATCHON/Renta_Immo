/**
 * Client API pour communiquer avec le backend de calcul
 * Migré de n8n webhook vers API Next.js interne
 */

import type { CalculateurFormData, CalculResultats } from '@/types';
import type { CalculApiResponse, ApiError } from '@/types/api';

/**
 * URL de l'API de calcul
 * Utilise l'API interne Next.js par défaut, avec fallback vers n8n si configuré
 */
const API_URL = '/api/calculate';

/**
 * @deprecated Conservé pour compatibilité, préférer API_URL
 */
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '';

/**
 * Timeout par défaut pour les requêtes (ms)
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * Classe d'erreur personnalisée pour les erreurs API
 */
export class ApiRequestError extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(message: string, code: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
    this.details = details;
  }

  get userMessage(): string {
    switch (this.code) {
      case 'NETWORK_ERROR':
        return 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      case 'TIMEOUT':
        return 'La requête a pris trop de temps. Veuillez réessayer.';
      case 'VALIDATION_ERROR':
        return 'Les données envoyées sont invalides.';
      case 'SERVER_ERROR':
        return 'Une erreur serveur est survenue. Veuillez réessayer plus tard.';
      default:
        return this.message || 'Une erreur inattendue est survenue.';
    }
  }
}

/**
 * Effectue une requête avec timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number = DEFAULT_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiRequestError(
        'La requête a été annulée (timeout)',
        'TIMEOUT'
      );
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Calcule la rentabilité via l'API interne
 * (Migré depuis le webhook n8n)
 */
export async function calculateRentability(
  formData: CalculateurFormData
): Promise<{ resultats: CalculResultats; pdfUrl: string | null }> {
  try {
    const response = await fetchWithTimeout(
      API_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiRequestError(
        errorData.message || `Erreur HTTP ${response.status}`,
        response.status >= 500 ? 'SERVER_ERROR' : 'VALIDATION_ERROR',
        errorData
      );
    }

    const data: CalculApiResponse = await response.json();

    if (!data.success) {
      throw new ApiRequestError(
        'Le calcul a échoué',
        'CALCULATION_ERROR',
        { response: data }
      );
    }

    return {
      resultats: data.resultats,
      pdfUrl: data.pdf_url,
    };
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new ApiRequestError(
        'Erreur réseau',
        'NETWORK_ERROR',
        { originalError: error.message }
      );
    }

    throw new ApiRequestError(
      error instanceof Error ? error.message : 'Erreur inconnue',
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Télécharge le PDF généré
 */
export async function downloadPdf(pdfUrl: string): Promise<Blob> {
  try {
    const response = await fetchWithTimeout(pdfUrl, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new ApiRequestError(
        'Impossible de télécharger le PDF',
        'DOWNLOAD_ERROR'
      );
    }

    return await response.blob();
  } catch (error) {
    if (error instanceof ApiRequestError) {
      throw error;
    }

    throw new ApiRequestError(
      'Erreur lors du téléchargement',
      'NETWORK_ERROR'
    );
  }
}

/**
 * Utilitaire pour obtenir un message d'erreur utilisateur
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Une erreur inattendue est survenue';
}
