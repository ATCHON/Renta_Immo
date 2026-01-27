/**
 * Client API pour le simulateur de rentabilité immobilière
 *
 * Story TECH-009 : Intégration Frontend
 * Migré de n8n webhook vers API Next.js interne /api/calculate
 * 
 * @deprecated NEXT_PUBLIC_N8N_WEBHOOK_URL n'est plus utilisé
 * L'API utilise maintenant /api/calculate en interne
 */

import type { CalculateurFormData, CalculResultats } from '@/types';
import type { CalculApiResponse, ApiError, ApiMeta } from '@/types/api';

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * URL de l'API interne
 * Relative pour fonctionner en développement et production
 */
const API_URL = '/api/calculate';

/**
 * Timeout par défaut pour les requêtes (ms)
 */
const DEFAULT_TIMEOUT = 30000;

// ============================================================================
// ERREURS
// ============================================================================

/**
 * Classe d'erreur personnalisée pour les erreurs API
 */
export class ApiRequestError extends Error {
  code: ApiError['code'];
  details?: Record<string, unknown>;

  constructor(message: string, code: ApiError['code'], details?: Record<string, unknown>) {
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
      case 'CALCULATION_ERROR':
        return 'Erreur lors du calcul. Vérifiez vos données.';
      case 'SERVER_ERROR':
        return 'Une erreur serveur est survenue. Veuillez réessayer plus tard.';
      default:
        return this.message || 'Une erreur inattendue est survenue.';
    }
  }
}

// ============================================================================
// OPTIONS
// ============================================================================

/**
 * Options pour la requête API
 */
export interface CalculateOptions {
  /** Timeout en ms (défaut: 30000) */
  timeout?: number;
  /** Signal d'annulation */
  signal?: AbortSignal;
}

/**
 * Résultat du calcul avec métadonnées
 */
export interface CalculateResult {
  resultats: CalculResultats;
  pdfUrl: string | null;
  alertes: string[];
  meta?: ApiMeta;
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Combine plusieurs AbortSignals en un seul
 */
function anySignal(signals: AbortSignal[]): AbortSignal {
  const controller = new AbortController();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      return controller.signal;
    }

    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  return controller.signal;
}

// ============================================================================
// CLIENT API
// ============================================================================

/**
 * Effectue un calcul de rentabilité via l'API interne
 *
 * @param formData - Données du formulaire
 * @param options - Options de requête
 * @returns Résultats du calcul avec métadonnées
 *
 * @example
 * const result = await calculateRentability({
 *   bien: { prix_achat: 150000, ... },
 *   financement: { apport: 30000, taux_credit: 3.5, duree_mois: 240, ... },
 *   exploitation: { loyer_mensuel: 750, ... },
 *   structure: { type: 'nom_propre', ... }
 * });
 */
export async function calculateRentability(
  formData: CalculateurFormData,
  options: CalculateOptions = {}
): Promise<CalculateResult> {
  const { timeout = DEFAULT_TIMEOUT, signal } = options;

  // Créer un AbortController pour le timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Combiner les signaux si un signal externe est fourni
  const combinedSignal = signal
    ? anySignal([signal, controller.signal])
    : controller.signal;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
      signal: combinedSignal,
    });

    // Nettoyer le timeout
    clearTimeout(timeoutId);

    // Parser la réponse
    const data: CalculApiResponse = await response.json();

    // Gérer les erreurs HTTP
    if (!response.ok || !data.success) {
      const errorData = data as { error?: ApiError; success: false };
      throw new ApiRequestError(
        errorData.error?.message || `Erreur HTTP ${response.status}`,
        errorData.error?.code || (response.status >= 500 ? 'SERVER_ERROR' : 'VALIDATION_ERROR'),
        errorData.error?.details
      );
    }

    // Succès
    return {
      resultats: data.resultats,
      pdfUrl: data.pdf_url,
      alertes: data.alertes || [],
      meta: data.meta,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    // Gestion des erreurs
    if (error instanceof ApiRequestError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiRequestError(
          'La requête a été annulée (timeout)',
          'TIMEOUT'
        );
      }

      // Erreur réseau
      if (error instanceof TypeError) {
        throw new ApiRequestError(
          'Erreur réseau',
          'NETWORK_ERROR',
          { originalError: error.message }
        );
      }
    }

    throw new ApiRequestError(
      error instanceof Error ? error.message : 'Erreur inconnue',
      'UNKNOWN_ERROR'
    );
  }
}

/**
 * Télécharge le PDF généré
 *
 * @param pdfUrl - URL du PDF à télécharger
 * @returns Blob du fichier PDF
 */
export async function downloadPdf(pdfUrl: string): Promise<Blob> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(pdfUrl, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ApiRequestError(
        'Impossible de télécharger le PDF',
        'HTTP_ERROR',
        { status: response.status }
      );
    }

    return await response.blob();
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiRequestError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiRequestError('Timeout lors du téléchargement', 'TIMEOUT');
    }

    throw new ApiRequestError(
      'Erreur lors du téléchargement',
      'NETWORK_ERROR'
    );
  }
}

/**
 * Utilitaire pour obtenir un message d'erreur utilisateur
 *
 * @param error - Erreur capturée
 * @returns Message d'erreur convivial
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

// ============================================================================
// HOOK REACT QUERY (optionnel)
// ============================================================================

/**
 * Clé de cache pour React Query
 */
export const CALCULATE_QUERY_KEY = ['calculate'] as const;

/**
 * Fonction de mutation pour React Query
 *
 * @example
 * const mutation = useMutation({
 *   mutationFn: calculateMutation,
 *   onSuccess: (data) => console.log(data),
 * });
 */
export async function calculateMutation(
  formData: CalculateurFormData
): Promise<CalculateResult> {
  return calculateRentability(formData);
}
