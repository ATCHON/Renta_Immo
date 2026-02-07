# Story TECH-008 : Route POST /api/calculate

> **Epic** : Epic 1 - Infrastructure Backend
> **Sprint** : 0.3 - Intégration
> **Points** : 3
> **Priorité** : P1 (Critique)
> **Statut** : ✅ Done
> **Dépendances** : TECH-006 (Synthèse)

---

## 1. User Story

**En tant que** frontend
**Je veux** un endpoint API pour soumettre les calculs
**Afin de** remplacer l'appel au webhook n8n

---

## 2. Contexte

### 2.1 Objectif

Créer l'endpoint API REST qui expose le moteur de calcul backend, avec un format de réponse compatible avec l'ancien workflow n8n pour une migration transparente.

### 2.2 Fichier cible

```
src/app/api/calculate/route.ts
```

### 2.3 Spécifications endpoint

| Propriété | Valeur |
|-----------|--------|
| URL | `/api/calculate` |
| Méthode | POST |
| Content-Type | application/json |
| Timeout | 30 secondes |
| CORS | Configuré |

---

## 3. Critères d'Acceptation

### 3.1 Endpoint fonctionnel

- [ ] Route `POST /api/calculate` créée
- [ ] Accepte JSON en body
- [ ] Retourne JSON en réponse
- [ ] Appelle `performCalculations()`
- [ ] Timeout de 30 secondes

### 3.2 Headers CORS

- [ ] `Access-Control-Allow-Origin` configuré
- [ ] `Access-Control-Allow-Methods: POST, OPTIONS`
- [ ] `Access-Control-Allow-Headers: Content-Type`
- [ ] Preflight OPTIONS supporté

### 3.3 Format de réponse

- [ ] Format identique à n8n (rétrocompatibilité)
- [ ] Champ `success: boolean`
- [ ] Champ `resultats` avec tous les calculs
- [ ] Champ `alertes: string[]`
- [ ] Champ `timestamp: string`

### 3.4 Gestion des erreurs

- [ ] Code `VALIDATION_ERROR` pour erreurs de validation
- [ ] Code `CALCULATION_ERROR` pour erreurs de calcul
- [ ] Code `SERVER_ERROR` pour erreurs serveur
- [ ] Messages d'erreur explicites
- [ ] HTTP status codes appropriés

### 3.5 Performance

- [ ] Temps de réponse < 500ms
- [ ] Logging des temps d'exécution

---

## 4. Spécifications Techniques

### 4.1 Route API

```typescript
// src/app/api/calculate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { performCalculations } from '@/server/calculations';
import type { CalculationResult, CalculationError } from '@/server/calculations/types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Codes d'erreur API
 */
type ErrorCode = 'VALIDATION_ERROR' | 'CALCULATION_ERROR' | 'SERVER_ERROR';

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
  /** Origines autorisées (configurable via env) */
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
} as const;

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
 * Handler OPTIONS (preflight CORS)
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  const origin = request.headers.get('origin');

  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

/**
 * Handler POST - Calcul principal
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  const startTime = performance.now();
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

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

      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: {
            code: errorResult.error.type === 'validation'
              ? 'VALIDATION_ERROR'
              : 'CALCULATION_ERROR',
            message: errorResult.error.message,
            details: errorResult.error.details,
          },
          timestamp: new Date().toISOString(),
        },
        {
          status: errorResult.error.type === 'validation' ? 400 : 422,
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
        timestamp: new Date().toISOString(),
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
    console.error('[API /api/calculate] Erreur serveur:', error);

    const executionTime = Math.round(performance.now() - startTime);

    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Erreur interne du serveur.',
          details:
            process.env.NODE_ENV === 'development'
              ? { error: String(error), stack: (error as Error)?.stack }
              : undefined,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * Configuration du segment (optionnel)
 */
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 secondes max (Vercel)
```

### 4.2 Types partagés

```typescript
// src/server/calculations/types.ts (ajouts)

/**
 * Résultat de calcul réussi
 */
export interface CalculationResult {
  success: true;
  resultats: {
    rentabilite: RentabiliteResultats;
    cashflow: CashflowResultats;
    financement: FinancementResultats;
    charges: ChargesResultats;
    fiscalite: FiscaliteResultats;
    hcsf: HCSFResultats;
    synthese: SyntheseResultats;
  };
  alertes: string[];
  timestamp: string;
}

/**
 * Résultat de calcul en erreur
 */
export interface CalculationError {
  success: false;
  error: {
    type: 'validation' | 'calculation' | 'server';
    message: string;
    details?: Record<string, unknown>;
  };
}
```

---

## 5. Format de Réponse

### 5.1 Succès (HTTP 200)

```json
{
  "success": true,
  "resultats": {
    "rentabilite": {
      "rentabilite_brute": 6.00,
      "rentabilite_nette": 4.85,
      "rentabilite_nette_nette": 3.42
    },
    "cashflow": {
      "cashflow_mensuel": -152.34,
      "cashflow_annuel": -1828.08
    },
    "financement": {
      "montant_emprunt": 120000,
      "mensualite": 695.23,
      "cout_total_credit": 166855.20,
      "interets_totaux": 46855.20
    },
    "charges": {
      "charges_copro": 960,
      "taxe_fonciere": 600,
      "assurance_pno": 150,
      "vacance_locative": 450,
      "frais_gestion": 0,
      "total_charges": 2160
    },
    "fiscalite": {
      "regime": "micro_foncier",
      "revenu_imposable": 6300,
      "impot_estime": 2973,
      "prelevement_sociaux": 1084,
      "revenu_net_apres_impot": 2967
    },
    "hcsf": {
      "taux_endettement": 18.5,
      "conforme": true,
      "capacite_emprunt_residuelle": 85000
    },
    "synthese": {
      "score_global": 52,
      "evaluation": "Moyen",
      "points_attention": [
        "Cashflow négatif de 152€/mois"
      ],
      "recommandations": [
        "Améliorer le cashflow",
        "Optimisation fiscale possible"
      ]
    }
  },
  "pdf_url": null,
  "timestamp": "2026-01-26T10:30:00.000Z",
  "alertes": [
    "Cashflow négatif de 152€/mois",
    "TMI de 30% : l'imposition sera significative"
  ],
  "meta": {
    "version": "1.0.0",
    "execution_time_ms": 45
  }
}
```

### 5.2 Erreur de validation (HTTP 400)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Données d'entrée invalides",
    "details": {
      "fields": [
        {
          "path": "bien.prix_achat",
          "message": "Le prix d'achat doit être supérieur à 0"
        },
        {
          "path": "financement.taux_credit",
          "message": "Le taux de crédit est requis"
        }
      ]
    }
  },
  "timestamp": "2026-01-26T10:30:00.000Z"
}
```

### 5.3 Erreur de calcul (HTTP 422)

```json
{
  "success": false,
  "error": {
    "code": "CALCULATION_ERROR",
    "message": "Erreur lors du calcul de la mensualité",
    "details": {
      "step": "financement",
      "reason": "Division par zéro"
    }
  },
  "timestamp": "2026-01-26T10:30:00.000Z"
}
```

### 5.4 Erreur serveur (HTTP 500)

```json
{
  "success": false,
  "error": {
    "code": "SERVER_ERROR",
    "message": "Erreur interne du serveur."
  },
  "timestamp": "2026-01-26T10:30:00.000Z"
}
```

---

## 6. Cas de Test

### 6.1 Test endpoint fonctionnel

```bash
# Test basique
curl -X POST http://localhost:3000/api/calculate \
  -H "Content-Type: application/json" \
  -d '{"bien":{"prix_achat":150000},"financement":{"apport":30000,"taux_credit":3.5,"duree_mois":240},"exploitation":{"loyer_mensuel":750},"structure":{"type_detention":"nom_propre"}}'
```

### 6.2 Test CORS preflight

```bash
# Test OPTIONS
curl -X OPTIONS http://localhost:3000/api/calculate \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

### 6.3 Tests automatisés

```typescript
// src/app/api/calculate/__tests__/route.test.ts

import { describe, it, expect } from 'vitest';
import { POST, OPTIONS } from '../route';
import { NextRequest } from 'next/server';

describe('POST /api/calculate', () => {
  const validInput = {
    bien: { prix_achat: 150000 },
    financement: { apport: 30000, taux_credit: 3.5, duree_mois: 240 },
    exploitation: { loyer_mensuel: 750 },
    structure: { type_detention: 'nom_propre' },
  };

  it('devrait retourner 200 avec des données valides', async () => {
    const request = new NextRequest('http://localhost/api/calculate', {
      method: 'POST',
      body: JSON.stringify(validInput),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.resultats).toBeDefined();
  });

  it('devrait retourner 400 avec JSON invalide', async () => {
    const request = new NextRequest('http://localhost/api/calculate', {
      method: 'POST',
      body: 'invalid json',
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  it('devrait retourner 400 avec body vide', async () => {
    const request = new NextRequest('http://localhost/api/calculate', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it('devrait inclure les headers CORS', async () => {
    const request = new NextRequest('http://localhost/api/calculate', {
      method: 'POST',
      body: JSON.stringify(validInput),
      headers: {
        'Content-Type': 'application/json',
        Origin: 'http://localhost:3001',
      },
    });

    const response = await POST(request);

    expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
  });

  it('devrait répondre en moins de 500ms', async () => {
    const request = new NextRequest('http://localhost/api/calculate', {
      method: 'POST',
      body: JSON.stringify(validInput),
      headers: { 'Content-Type': 'application/json' },
    });

    const start = performance.now();
    await POST(request);
    const duration = performance.now() - start;

    expect(duration).toBeLessThan(500);
  });
});

describe('OPTIONS /api/calculate', () => {
  it('devrait retourner 204 avec headers CORS', async () => {
    const request = new NextRequest('http://localhost/api/calculate', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3001',
        'Access-Control-Request-Method': 'POST',
      },
    });

    const response = await OPTIONS(request);

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });
});
```

---

## 7. Checklist de Développement

### 7.1 Préparation

- [ ] TECH-006 complétée
- [ ] `performCalculations()` testée et fonctionnelle
- [ ] Types de réponse définis

### 7.2 Implémentation

- [ ] Créer `src/app/api/calculate/route.ts`
- [ ] Implémenter handler OPTIONS (CORS preflight)
- [ ] Implémenter handler POST
- [ ] Configurer headers CORS
- [ ] Implémenter gestion des erreurs
- [ ] Ajouter logging
- [ ] Ajouter mesure de performance

### 7.3 Validation

- [ ] Test curl manuel
- [ ] Tests automatisés passent
- [ ] Performance < 500ms
- [ ] CORS fonctionnel
- [ ] Format réponse compatible n8n
- [ ] `npm run lint` passe

---

## 8. Definition of Done

- [ ] Endpoint POST `/api/calculate` créé
- [ ] Endpoint OPTIONS (preflight) fonctionnel
- [ ] Headers CORS configurés
- [ ] Format de réponse compatible n8n
- [ ] Codes d'erreur explicites
- [ ] Tests automatisés passent
- [ ] Performance < 500ms
- [ ] TypeScript compile sans erreur
- [ ] Code review approuvée

---

## 9. Références

| Document | Lien |
|----------|------|
| Story précédente | [TECH-007 - Tests régression](./story-tech-007-tests-regression.md) |
| Story suivante | [TECH-009 - Intégration frontend](./story-tech-009-integration-frontend.md) |
| Next.js Route Handlers | https://nextjs.org/docs/app/building-your-application/routing/route-handlers |

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-01-26 | 1.0 | Création initiale | John (PM) |
