/**
 * Types pour les réponses API
 * 
 * Story TECH-008 & TECH-009 : Types API compatibles avec le nouveau backend
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
  code: 'VALIDATION_ERROR' | 'CALCULATION_ERROR' | 'SERVER_ERROR' | 'NETWORK_ERROR' | 'TIMEOUT' | 'HTTP_ERROR' | 'UNKNOWN_ERROR';
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Métadonnées de la réponse API
 */
export interface ApiMeta {
  version: string;
  execution_time_ms: number;
}

/**
 * Réponse succès de l'API de calcul
 */
export interface CalculApiSuccessResponse {
  success: true;
  resultats: CalculResultats;
  pdf_url: string | null;
  timestamp: string;
  alertes: string[];
  meta: ApiMeta;
}

/**
 * Réponse erreur de l'API de calcul
 */
export interface CalculApiErrorResponse {
  success: false;
  error: ApiError;
  timestamp: string;
}

/**
 * Réponse de l'API de calcul (union type)
 */
export type CalculApiResponse = CalculApiSuccessResponse | CalculApiErrorResponse;

/**
 * Erreur de validation côté formulaire
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
  signal?: AbortSignal;
}
