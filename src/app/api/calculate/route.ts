/**
 * API Route : POST /api/calculate
 * Endpoint principal pour les calculs de rentabilité immobilière
 *
 * Remplace le webhook n8n avec une implémentation native Next.js
 */

import { NextRequest, NextResponse } from 'next/server';
import { performCalculations } from '@/server/calculations';

/**
 * Configuration de la route
 * - runtime: nodejs (pas edge, pour permettre les calculs complexes)
 * - maxDuration: 30 secondes (suffisant pour les calculs)
 */
export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * POST /api/calculate
 *
 * Effectue les calculs de rentabilité immobilière
 *
 * @param request - Requête avec les données du formulaire
 * @returns Résultats des calculs ou erreur
 */
export async function POST(request: NextRequest) {
  try {
    // Parse du body JSON
    const body = await request.json();

    // Exécution des calculs
    const result = performCalculations(body);

    // Gestion des erreurs de calcul
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          code: result.code,
          field: result.field,
          details: result.details,
        },
        { status: 400 }
      );
    }

    // Succès : retourner les résultats
    // Format compatible avec l'ancien endpoint n8n
    return NextResponse.json({
      success: true,
      resultats: result.resultats,
      pdf_url: null, // PDF sera implémenté en Phase 2
      timestamp: result.timestamp,
      alertes: result.alertes,
    });
  } catch (error) {
    // Erreur de parsing JSON ou autre
    console.error('Erreur API /api/calculate:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur',
        code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/calculate
 *
 * Support CORS pour les requêtes cross-origin
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
