/**
 * API Route : POST /api/calculate
 * Endpoint principal pour les calculs de rentabilité immobilière
 *
 * Story TECH-008 : Route POST /api/calculate
 * Remplace le webhook n8n avec une implémentation native Next.js
 */

import { NextRequest, NextResponse } from 'next/server';
import { performCalculations } from '@/server/calculations';
import { logger } from '@/lib/logger';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import type { CalculationResult, CalculationError } from '@/server/calculations';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Codes d'erreur API
 */
type ErrorCode = 'VALIDATION_ERROR' | 'CALCULATION_ERROR' | 'SERVER_ERROR' | 'RATE_LIMIT';

/**
 * Réponse succès
 */
interface ApiSuccessResponse {
  success: true;
  resultats: CalculationResult['resultats'];
  pdf_url: string | null;
  timestamp: string;
  alertes: string[];
  meta: {
    version: string;
    execution_time_ms: number;
  };
}

/**
 * Réponse erreur
 */
interface ApiErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  /** Version de l'API */
  VERSION: '1.0.0',
  /** Timeout en ms */
  TIMEOUT_MS: 30000,
  /** Origines autorisées (configurable via env, pas de wildcard par défaut - Audit 1.5) */
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ?.split(',')
    .map(o => o.trim())
    .filter(Boolean) || ['https://renta-immo.vercel.app'],
} as const;

/**
 * Configuration de la route
 * - runtime: nodejs (pas edge, pour permettre les calculs complexes)
 * - maxDuration: 30 secondes (suffisant pour les calculs)
 */
export const runtime = 'nodejs';
export const maxDuration = 30;

// ============================================================================
// CORS HEADERS
// ============================================================================

/**
 * Headers CORS pour les réponses
 */
function getCorsHeaders(origin?: string | null): HeadersInit {
  const allowedOrigin = CONFIG.ALLOWED_ORIGINS.includes('*')
    ? '*'
    : CONFIG.ALLOWED_ORIGINS.includes(origin || '')
      ? origin
      : CONFIG.ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 heures
  };
}

// ============================================================================
// HANDLERS
// ============================================================================

/**
 * OPTIONS /api/calculate
 *
 * Support CORS preflight pour les requêtes cross-origin
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get('origin');

  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

/**
 * POST /api/calculate
 *
 * Effectue les calculs de rentabilité immobilière
 *
 * @param request - Requête avec les données du formulaire
 * @returns Résultats des calculs ou erreur
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const startTime = performance.now();
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Rate limiting: 10 requests per minute per IP (CPU-intensive endpoint)
  const ip = getClientIp(request);
  const rl = rateLimit(`calculate:${ip}`, { limit: 10, window: 60_000 });
  if (!rl.success) {
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT',
          message: 'Trop de requêtes. Réessayez dans quelques instants.',
        },
        timestamp: new Date().toISOString(),
      },
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    // 1. Parser le body JSON
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Corps de la requête invalide. JSON attendu.',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. Vérifier que le body n'est pas vide
    if (!body || typeof body !== 'object') {
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Corps de la requête vide ou invalide.',
          },
          timestamp: new Date().toISOString(),
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Exécuter les calculs
    const result = performCalculations(body);

    // 4. Calculer le temps d'exécution
    const executionTime = Math.round(performance.now() - startTime);

    // 5. Gérer le résultat
    if (!result.success) {
      // Erreur de validation ou calcul
      const errorResult = result as CalculationError;

      const errorCode: ErrorCode = errorResult.code === 'VALIDATION_ERROR'
        ? 'VALIDATION_ERROR'
        : 'CALCULATION_ERROR';

      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: {
            code: errorCode,
            message: errorResult.error,
            details: {
              field: errorResult.field,
              ...errorResult.details,
            },
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: errorCode === 'VALIDATION_ERROR' ? 400 : 422,
          headers: corsHeaders,
        }
      );
    }

    // 6. Succès
    const successResult = result as CalculationResult;

    return NextResponse.json<ApiSuccessResponse>(
      {
        success: true,
        resultats: successResult.resultats,
        pdf_url: null, // PDF sera implémenté en Phase 2
        timestamp: successResult.timestamp,
        alertes: successResult.alertes || [],
        meta: {
          version: CONFIG.VERSION,
          execution_time_ms: executionTime,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    // Erreur serveur inattendue
    logger.error('[API /api/calculate] Erreur serveur:', error);

    const executionTime = Math.round(performance.now() - startTime);

    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Erreur interne du serveur.',
          details:
            process.env.NODE_ENV === 'development'
              ? {
                error: String(error),
                stack: (error as Error)?.stack,
                execution_time_ms: executionTime,
              }
              : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
