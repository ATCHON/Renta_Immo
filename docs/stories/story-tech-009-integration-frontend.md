# Story TECH-009 : Intégration Frontend

> **Epic** : Epic 1 - Infrastructure Backend
> **Sprint** : 0.3 - Intégration
> **Points** : 1
> **Priorité** : P1 (Critique)
> **Statut** : Ready for Development
> **Dépendances** : TECH-008 (Route API)

---

## 1. User Story

**En tant qu'** utilisateur
**Je veux** que l'application fonctionne de manière transparente
**Afin de** ne pas percevoir le changement de backend

---

## 2. Contexte

### 2.1 Objectif

Basculer le frontend de l'appel au webhook n8n vers la nouvelle API interne `/api/calculate`, de manière transparente pour l'utilisateur.

### 2.2 Fichier cible principal

```
src/lib/api.ts
```

### 2.3 Changements requis

| Élément | Avant | Après |
|---------|-------|-------|
| URL API | `NEXT_PUBLIC_N8N_WEBHOOK_URL` | `/api/calculate` |
| Méthode | POST | POST (inchangé) |
| Format requête | JSON | JSON (inchangé) |
| Format réponse | Compatible | Compatible |

### 2.4 Impact

- **Utilisateur** : Aucun changement visible
- **Code** : Modification mineure de `api.ts`
- **Store Zustand** : Aucun changement
- **Composants** : Aucun changement

---

## 3. Critères d'Acceptation

### 3.1 Migration API

- [ ] `src/lib/api.ts` modifié pour utiliser `/api/calculate`
- [ ] Suppression de la dépendance à `NEXT_PUBLIC_N8N_WEBHOOK_URL`
- [ ] Fallback vers n8n désactivé (optionnel en dev)

### 3.2 Rétrocompatibilité

- [ ] Aucun changement visible côté utilisateur
- [ ] Store Zustand inchangé
- [ ] Composants résultats inchangés
- [ ] Format des données préservé

### 3.3 Configuration

- [ ] Variable `NEXT_PUBLIC_N8N_WEBHOOK_URL` marquée dépréciée
- [ ] Documentation mise à jour
- [ ] `.env.example` mis à jour

### 3.4 Tests

- [ ] Application démarre sans erreur
- [ ] Formulaire fonctionne
- [ ] Résultats s'affichent correctement
- [ ] Erreurs gérées correctement

---

## 4. Spécifications Techniques

### 4.1 Fichier `src/lib/api.ts` - AVANT

```typescript
// src/lib/api.ts (version actuelle avec n8n)

const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

export interface CalculateRequest {
  bien: {
    prix_achat: number;
    // ...
  };
  financement: {
    apport: number;
    taux_credit: number;
    duree_mois: number;
    // ...
  };
  exploitation: {
    loyer_mensuel: number;
    // ...
  };
  structure: {
    type_detention: string;
    // ...
  };
}

export interface CalculateResponse {
  success: boolean;
  resultats?: {
    rentabilite: { /* ... */ };
    cashflow: { /* ... */ };
    // ...
  };
  error?: {
    message: string;
  };
}

export async function calculateRentability(
  data: CalculateRequest
): Promise<CalculateResponse> {
  if (!N8N_WEBHOOK_URL) {
    throw new Error('N8N_WEBHOOK_URL non configurée');
  }

  const response = await fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }

  return response.json();
}
```

### 4.2 Fichier `src/lib/api.ts` - APRÈS

```typescript
// src/lib/api.ts (nouvelle version avec API interne)

/**
 * Client API pour le simulateur de rentabilité immobilière
 *
 * @deprecated NEXT_PUBLIC_N8N_WEBHOOK_URL n'est plus utilisé
 * L'API utilise maintenant /api/calculate en interne
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Requête de calcul
 */
export interface CalculateRequest {
  bien: {
    prix_achat: number;
    surface?: number;
    type_bien?: string;
    ville?: string;
  };
  financement: {
    apport: number;
    taux_credit: number;
    duree_mois: number;
    taux_assurance?: number;
  };
  exploitation: {
    loyer_mensuel: number;
    charges_copro_mensuel?: number;
    taxe_fonciere_annuel?: number;
    assurance_pno_annuel?: number;
    vacance_locative?: number;
    frais_gestion?: number;
  };
  structure: {
    type_detention: 'nom_propre' | 'sci_is';
    regime_fiscal?: string;
    tmi?: number;
    associes?: Array<{
      nom?: string;
      parts: number;
      revenus_annuels: number;
      charges_mensuelles?: number;
      credits_mensuels?: number;
    }>;
  };
}

/**
 * Réponse de calcul
 */
export interface CalculateResponse {
  success: boolean;
  resultats?: {
    rentabilite: {
      rentabilite_brute: number;
      rentabilite_nette: number;
      rentabilite_nette_nette: number;
    };
    cashflow: {
      cashflow_mensuel: number;
      cashflow_annuel: number;
    };
    financement: {
      montant_emprunt: number;
      mensualite: number;
      cout_total_credit: number;
      interets_totaux: number;
    };
    charges: {
      charges_copro: number;
      taxe_fonciere: number;
      assurance_pno: number;
      vacance_locative: number;
      frais_gestion: number;
      total_charges: number;
    };
    fiscalite: {
      regime: string;
      revenu_imposable: number;
      impot_estime: number;
      prelevement_sociaux: number;
      revenu_net_apres_impot: number;
    };
    hcsf: {
      taux_endettement: number;
      conforme: boolean;
      capacite_emprunt_residuelle: number;
    };
    synthese: {
      score_global: number;
      evaluation: string;
      points_attention: string[];
      recommandations: string[];
    };
  };
  alertes?: string[];
  timestamp?: string;
  meta?: {
    version: string;
    execution_time_ms: number;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * URL de l'API interne
 * Relative pour fonctionner en développement et production
 */
const API_URL = '/api/calculate';

/**
 * Timeout par défaut en ms
 */
const DEFAULT_TIMEOUT = 30000;

// ============================================================================
// CLIENT API
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
 * Effectue un calcul de rentabilité
 *
 * @param data - Données d'entrée du formulaire
 * @param options - Options de requête
 * @returns Résultats du calcul
 *
 * @example
 * const result = await calculateRentability({
 *   bien: { prix_achat: 150000 },
 *   financement: { apport: 30000, taux_credit: 3.5, duree_mois: 240 },
 *   exploitation: { loyer_mensuel: 750 },
 *   structure: { type_detention: 'nom_propre' }
 * });
 */
export async function calculateRentability(
  data: CalculateRequest,
  options: CalculateOptions = {}
): Promise<CalculateResponse> {
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
      body: JSON.stringify(data),
      signal: combinedSignal,
    });

    // Nettoyer le timeout
    clearTimeout(timeoutId);

    // Parser la réponse
    const result: CalculateResponse = await response.json();

    // Gérer les erreurs HTTP
    if (!response.ok) {
      return {
        success: false,
        error: result.error || {
          code: 'HTTP_ERROR',
          message: `Erreur HTTP: ${response.status}`,
        },
      };
    }

    return result;
  } catch (error) {
    clearTimeout(timeoutId);

    // Gestion des erreurs
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: {
            code: 'TIMEOUT',
            message: 'La requête a expiré. Veuillez réessayer.',
          },
        };
      }

      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Erreur de connexion. Vérifiez votre connexion internet.',
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'Une erreur inattendue est survenue.',
      },
    };
  }
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
  data: CalculateRequest
): Promise<CalculateResponse> {
  return calculateRentability(data);
}
```

### 4.3 Mise à jour `.env.example`

```env
# .env.example

# ============================================================================
# Configuration Renta_Immo
# ============================================================================

# API n8n (DÉPRÉCIÉ - Ne plus utiliser)
# L'application utilise maintenant /api/calculate en interne
# NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/xxx

# Environnement
NODE_ENV=development

# URL de base (optionnel, pour les liens absolus)
# NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4.4 Mise à jour `.env.local` (si existant)

```env
# .env.local

# L'URL n8n n'est plus nécessaire
# NEXT_PUBLIC_N8N_WEBHOOK_URL est déprécié

NODE_ENV=development
```

---

## 5. Vérifications

### 5.1 Checklist de test manuel

| Test | Résultat attendu |
|------|------------------|
| Démarrer l'app (`npm run dev`) | Pas d'erreur |
| Ouvrir la page principale | Formulaire s'affiche |
| Remplir le formulaire | Validation fonctionne |
| Soumettre le formulaire | Loader s'affiche |
| Attendre le résultat | Résultats s'affichent |
| Vérifier la console | Pas d'erreur |
| Vérifier Network tab | Appel vers `/api/calculate` |

### 5.2 Comparaison avant/après

| Aspect | Avant (n8n) | Après (API interne) |
|--------|-------------|---------------------|
| URL | Externe (n8n webhook) | Interne (/api/calculate) |
| Latence | Variable (externe) | Faible (même serveur) |
| Disponibilité | Dépend de n8n | Autonome |
| Format réponse | JSON | JSON (identique) |
| Affichage résultats | OK | OK (inchangé) |

---

## 6. Rollback Plan

En cas de problème, le rollback est simple :

### 6.1 Restaurer l'ancienne configuration

```typescript
// src/lib/api.ts (rollback temporaire)

const API_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '/api/calculate';

// Le reste du code reste identique
// L'API interne est utilisée par défaut si n8n n'est pas configuré
```

### 6.2 Variables d'environnement

```env
# Pour forcer l'utilisation de n8n en cas de problème
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/xxx
```

---

## 7. Documentation

### 7.1 Mise à jour README (si nécessaire)

```markdown
## Configuration

L'application ne nécessite plus de configuration externe pour les calculs.
Le moteur de calcul est intégré directement dans l'application Next.js.

### Variables d'environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `NODE_ENV` | Environnement (development/production) | Non |

> **Note** : `NEXT_PUBLIC_N8N_WEBHOOK_URL` est déprécié et n'est plus utilisé.
```

### 7.2 Mise à jour CLAUDE.md

Mettre à jour la section "Configuration n8n" :

```markdown
## Configuration n8n (DÉPRÉCIÉ)

> **Migration effectuée** : Le backend n8n a été remplacé par un moteur de calcul
> intégré dans l'application Next.js. Voir `/src/server/calculations/`.

- **API** : `/api/calculate` (POST)
- **Variables d'environnement** : Plus de configuration requise
```

---

## 8. Checklist de Développement

### 8.1 Préparation

- [ ] TECH-008 complétée et testée
- [ ] API `/api/calculate` fonctionnelle
- [ ] Comprendre le code frontend actuel

### 8.2 Implémentation

- [ ] Modifier `src/lib/api.ts`
- [ ] Supprimer référence à `NEXT_PUBLIC_N8N_WEBHOOK_URL`
- [ ] Mettre à jour `.env.example`
- [ ] Mettre à jour documentation

### 8.3 Validation

- [ ] `npm run dev` démarre sans erreur
- [ ] Formulaire fonctionne
- [ ] Résultats s'affichent
- [ ] Aucune erreur console
- [ ] Network : appels vers `/api/calculate`
- [ ] `npm run build` réussit
- [ ] `npm run lint` passe

### 8.4 Décommissionnement n8n

- [ ] Vérifier que n8n n'est plus appelé
- [ ] Supprimer/archiver le workflow n8n
- [ ] Mettre à jour la documentation projet

---

## 9. Definition of Done

- [ ] `src/lib/api.ts` modifié pour utiliser `/api/calculate`
- [ ] Variable `NEXT_PUBLIC_N8N_WEBHOOK_URL` supprimée/dépréciée
- [ ] Application fonctionne identiquement pour l'utilisateur
- [ ] Store Zustand inchangé
- [ ] Composants résultats inchangés
- [ ] Tests manuels passent
- [ ] Build production réussit
- [ ] Documentation mise à jour
- [ ] Code review approuvée

---

## 10. Références

| Document | Lien |
|----------|------|
| Story précédente | [TECH-008 - API Route](./story-tech-008-api-route.md) |
| Epic 1 | [Epic 1 - Infrastructure Backend](./epic-1-infrastructure-backend.md) |
| Epic 2 (suivante) | [Epic 2 - Fonctionnalités MVP](./epic-2-fonctionnalites-mvp.md) |

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-01-26 | 1.0 | Création initiale | John (PM) |
