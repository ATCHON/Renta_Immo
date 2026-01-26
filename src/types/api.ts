/**
 * Types pour les réponses API
 */

import type { CalculResultats } from './calculateur';

/**
 * Réponse API générique
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * Erreur API
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Réponse de l'API de calcul
 */
export interface CalculApiResponse {
  success: boolean;
  resultats: CalculResultats;
  pdf_url: string | null;
  timestamp: string;
}

/**
 * Erreur de validation
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Configuration de l'API
 */
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

/**
 * Options de requête
 */
export interface RequestOptions {
  timeout?: number;
  headers?: Record<string, string>;
}
