# Story TECH-001 : Structure du Module de Calculs

> **Epic** : Epic 1 - Infrastructure Backend
> **Sprint** : 0.1 - Fondations Backend
> **Points** : 2
> **Priorité** : P1 (Critique)
> **Statut** : Done

---

## 1. User Story

**En tant que** développeur
**Je veux** une structure de code modulaire pour les calculs backend
**Afin de** faciliter la maintenance, les tests et l'évolution du moteur de calcul

---

## 2. Contexte

### 2.1 Situation actuelle

Le projet utilise actuellement n8n comme backend pour les calculs de rentabilité. Cette dépendance externe doit être remplacée par un moteur de calcul intégré à l'application Next.js.

### 2.2 Objectif

Créer la structure de base du module de calculs dans `src/server/calculations/` qui servira de fondation pour toutes les fonctionnalités de calcul.

### 2.3 Architecture cible

```
src/server/calculations/
├── index.ts          # Orchestrateur principal - point d'entrée unique
├── types.ts          # Types, interfaces et constantes internes
├── validation.ts     # (Sprint 0.1 - TECH-002)
├── rentabilite.ts    # (Sprint 0.2 - TECH-003)
├── fiscalite.ts      # (Sprint 0.2 - TECH-004)
├── hcsf.ts           # (Sprint 0.2 - TECH-005)
└── synthese.ts       # (Sprint 0.3 - TECH-006)
```

---

## 3. Critères d'Acceptation

### 3.1 Structure des fichiers

- [x] Dossier `src/server/calculations/` créé
- [x] Fichier `index.ts` créé avec fonction `performCalculations`
- [x] Fichier `types.ts` créé avec types et constantes
- [x] Barrel export configuré dans `index.ts`

### 3.2 Orchestrateur (`index.ts`)

- [x] Fonction `performCalculations(input: unknown)` exportée
- [x] Retourne `CalculationResult | CalculationError`
- [x] Structure du flux de calcul documentée (commentaires)
- [x] Placeholder pour les étapes futures (validation, calculs, synthèse)

### 3.3 Types (`types.ts`)

- [x] Interface `CalculationResult` définie
- [x] Interface `CalculationError` définie
- [x] Types internes pour les modules de calcul
- [x] Constantes métier (seuils, taux par défaut)

### 3.4 Qualité

- [x] TypeScript compile sans erreur (`npm run type-check`)
- [x] ESLint passe sans erreur (`npm run lint`)
- [x] Pas de `any` explicite
- [x] JSDoc sur les fonctions et types publics

---

## 4. Spécifications Techniques

### 4.1 Fichier `src/server/calculations/index.ts`

```typescript
/**
 * Module de calculs de rentabilité immobilière
 * Point d'entrée unique pour tous les calculs
 */

import type { CalculationResult, CalculationError } from './types';

/**
 * Effectue tous les calculs de rentabilité pour une simulation
 *
 * @param input - Données brutes du formulaire (non typées pour validation)
 * @returns Résultat des calculs ou erreur
 *
 * @example
 * const result = performCalculations(formData);
 * if (result.success) {
 *   console.log(result.resultats);
 * } else {
 *   console.error(result.error);
 * }
 */
export function performCalculations(input: unknown): CalculationResult | CalculationError {
  // TODO: Étape 1 - Validation et normalisation (TECH-002)
  // TODO: Étape 2 - Calculs de rentabilité (TECH-003)
  // TODO: Étape 3 - Calculs fiscaux (TECH-004)
  // TODO: Étape 4 - Analyse HCSF (TECH-005)
  // TODO: Étape 5 - Génération synthèse (TECH-006)
  // TODO: Étape 6 - Assemblage résultat final

  // Placeholder - retourne erreur en attendant l'implémentation
  return {
    success: false,
    error: 'Module de calcul non implémenté',
    code: 'NOT_IMPLEMENTED',
  };
}

// Re-export des types publics
export type { CalculationResult, CalculationError } from './types';
```

### 4.2 Fichier `src/server/calculations/types.ts`

```typescript
/**
 * Types et constantes pour le module de calculs
 */

// ============================================================================
// TYPES DE RÉSULTAT
// ============================================================================

/**
 * Résultat réussi d'un calcul de simulation
 */
export interface CalculationResult {
  success: true;
  resultats: CalculResultats;
  pdf_url: string | null;
  timestamp: string;
  alertes: string[];
}

/**
 * Erreur de calcul
 */
export interface CalculationError {
  success: false;
  error: string;
  code: CalculationErrorCode;
  field?: string;
  details?: Record<string, unknown>;
}

export type CalculationErrorCode =
  | 'VALIDATION_ERROR'
  | 'CALCULATION_ERROR'
  | 'SERVER_ERROR'
  | 'NOT_IMPLEMENTED';

// ============================================================================
// TYPES DE DONNÉES MÉTIER
// ============================================================================

/**
 * Résultats complets de la simulation
 */
export interface CalculResultats {
  rentabilite: RentabiliteResultats;
  financement: FinancementResultats;
  fiscalite: FiscaliteResultats;
  hcsf: HCSFResultats;
  synthese: SyntheseResultats;
}

export interface RentabiliteResultats {
  rentabilite_brute: number;
  rentabilite_nette: number;
  rentabilite_nette_nette: number;
  cashflow_mensuel: number;
  cashflow_annuel: number;
}

export interface FinancementResultats {
  montant_emprunt: number;
  mensualite: number;
  cout_total_credit: number;
  cout_interets: number;
  cout_assurance: number;
}

export interface FiscaliteResultats {
  regime: string;
  revenu_imposable: number;
  impot_estime: number;
  prelevement_sociaux: number;
  revenu_net_apres_impot: number;
}

export interface HCSFResultats {
  taux_endettement: number;
  conforme: boolean;
  capacite_emprunt_residuelle: number;
  alertes: string[];
}

export interface SyntheseResultats {
  score_global: number;
  evaluation: 'Excellent' | 'Bon' | 'Moyen' | 'Faible';
  points_forts: string[];
  points_attention: string[];
  recommandations: string[];
}

// ============================================================================
// TYPES D'ENTRÉE (Données brutes du formulaire)
// ============================================================================

export interface CalculationInput {
  bien: BienInput;
  financement: FinancementInput;
  exploitation: ExploitationInput;
  structure: StructureInput;
  options?: OptionsInput;
}

export interface BienInput {
  adresse?: string;
  code_postal?: string;
  ville?: string;
  type_bien: 'appartement' | 'maison' | 'immeuble' | 'local_commercial';
  surface: number;
  prix_achat: number;
  prix_travaux?: number;
  annee_construction?: number;
}

export interface FinancementInput {
  apport: number;
  taux_interet: number;
  duree_mois: number;
  taux_assurance?: number;
  frais_dossier?: number;
  frais_garantie?: number;
}

export interface ExploitationInput {
  loyer_mensuel: number;
  charges_copropriete?: number;
  taxe_fonciere?: number;
  assurance_pno?: number;
  frais_gestion?: number;
  provision_travaux?: number;
  vacance_locative?: number;
}

export interface StructureInput {
  type_detention: 'nom_propre' | 'sci_is';
  regime_fiscal?: 'micro_foncier' | 'reel' | 'lmnp_micro' | 'lmnp_reel';
  tmi?: number;
  associes?: AssocieInput[];
}

export interface AssocieInput {
  nom?: string;
  parts: number;
  revenus_annuels: number;
  charges_mensuelles?: number;
  credits_mensuels?: number;
}

export interface OptionsInput {
  generer_pdf?: boolean;
  email?: string;
}

// ============================================================================
// CONSTANTES MÉTIER
// ============================================================================

/**
 * Seuils et taux réglementaires
 */
export const SEUILS = {
  /** Taux d'endettement max HCSF */
  TAUX_ENDETTEMENT_MAX: 0.35,

  /** Pondération revenus locatifs HCSF */
  PONDERATION_REVENUS_LOCATIFS: 0.70,

  /** Durée max crédit HCSF (mois) */
  DUREE_CREDIT_MAX_MOIS: 300,

  /** Plafond micro-foncier */
  PLAFOND_MICRO_FONCIER: 15000,

  /** Plafond micro-BIC LMNP */
  PLAFOND_MICRO_BIC: 77700,

  /** Abattement micro-foncier */
  ABATTEMENT_MICRO_FONCIER: 0.30,

  /** Abattement micro-BIC */
  ABATTEMENT_MICRO_BIC: 0.50,

  /** Seuil IS taux réduit */
  SEUIL_IS_TAUX_REDUIT: 42500,

  /** Taux IS réduit */
  TAUX_IS_REDUIT: 0.15,

  /** Taux IS normal */
  TAUX_IS_NORMAL: 0.25,

  /** Taux prélèvements sociaux */
  TAUX_PRELEVEMENTS_SOCIAUX: 0.172,
} as const;

/**
 * Valeurs par défaut
 */
export const DEFAULTS = {
  /** Taux d'assurance emprunteur par défaut */
  TAUX_ASSURANCE: 0.0034,

  /** Taux vacance locative par défaut */
  VACANCE_LOCATIVE: 0.05,

  /** Provision travaux par défaut (% loyer) */
  PROVISION_TRAVAUX: 0.05,

  /** Frais de gestion locative par défaut */
  FRAIS_GESTION: 0.08,

  /** Frais de notaire ancien */
  FRAIS_NOTAIRE_ANCIEN: 0.08,

  /** Frais de notaire neuf */
  FRAIS_NOTAIRE_NEUF: 0.025,
} as const;

/**
 * TMI (Tranches Marginales d'Imposition) 2024
 */
export const TMI_TRANCHES = [
  { seuil: 0, taux: 0 },
  { seuil: 11294, taux: 0.11 },
  { seuil: 28797, taux: 0.30 },
  { seuil: 82341, taux: 0.41 },
  { seuil: 177106, taux: 0.45 },
] as const;
```

---

## 5. Tests de Validation

### 5.1 Tests manuels

| Test | Commande | Résultat attendu |
|------|----------|------------------|
| Compilation TypeScript | `npm run type-check` | Aucune erreur |
| Lint | `npm run lint` | Aucune erreur |
| Import module | `import { performCalculations } from '@/server/calculations'` | Import réussi |

### 5.2 Test fonctionnel minimal

```typescript
// Test à exécuter manuellement ou via console
import { performCalculations } from '@/server/calculations';

const result = performCalculations({});
console.log(result);
// Attendu: { success: false, error: 'Module de calcul non implémenté', code: 'NOT_IMPLEMENTED' }
```

---

## 6. Checklist de Développement

### 6.1 Préparation

- [x] Lire la documentation d'architecture ([architecture.md](../architecture.md) Section 6)
- [x] Comprendre les types existants dans `src/types/`
- [x] Vérifier les schémas Zod existants dans `src/lib/validators.ts`

### 6.2 Implémentation

- [x] Créer le dossier `src/server/calculations/`
- [x] Créer `types.ts` avec tous les types et constantes
- [x] Créer `index.ts` avec l'orchestrateur
- [x] Configurer le path alias si nécessaire (`@/server/*`)

### 6.3 Validation

- [x] `npm run type-check` passe
- [x] `npm run lint` passe
- [x] Import fonctionne depuis un autre fichier
- [x] Code review effectuée par l'agent Gemni

---

## 7. Notes d'Implémentation

### 7.1 Conventions

- **Fichiers** : kebab-case (`types.ts`, `index.ts`)
- **Types/Interfaces** : PascalCase (`CalculationResult`)
- **Constantes** : SCREAMING_SNAKE_CASE (`SEUILS.TAUX_ENDETTEMENT_MAX`)
- **Fonctions** : camelCase (`performCalculations`)

### 7.2 Path Alias

Le projet utilise déjà `@/*` → `./src/*`. Le module sera accessible via :
```typescript
import { performCalculations } from '@/server/calculations';
```

### 7.3 Réutilisation

Vérifier si certains types existent déjà dans `src/types/` pour éviter les doublons. Si oui, les importer plutôt que les redéfinir.

---

## 8. Definition of Done

- [x] Dossier `src/server/calculations/` créé
- [x] `index.ts` avec `performCalculations()` fonctionnel (placeholder)
- [x] `types.ts` avec tous les types et constantes
- [x] TypeScript compile sans erreur
- [x] ESLint passe sans erreur
- [x] JSDoc sur fonctions et types publics
- [x] Code review approuvée
- [ ] Merge dans la branche principale

---

## 9. Références

| Document | Lien |
|----------|------|
| Architecture | [docs/architecture.md](../architecture.md) - Section 6 |
| Epic 1 | [epic-1-infrastructure-backend.md](./epic-1-infrastructure-backend.md) |
| Story suivante | [TECH-002 - Validation](./story-tech-002-validation-entrees.md) |

---

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5

### File List
| Fichier | Action |
|---------|--------|
| `src/server/calculations/index.ts` | Vérifié (existant) |
| `src/server/calculations/types.ts` | Vérifié (existant) |
| `src/server/calculations/validation.ts` | Vérifié (existant) |
| `src/server/calculations/rentabilite.ts` | Vérifié (existant) |
| `src/server/calculations/fiscalite.ts` | Vérifié (existant) |
| `src/server/calculations/hcsf.ts` | Vérifié (existant) |
| `src/server/calculations/synthese.ts` | Vérifié (existant) |

### Completion Notes
- Structure complète déjà implémentée avec tous les modules
- `performCalculations()` est fonctionnel (pas juste placeholder)
- Types réutilisent ceux de `@/types/calculateur` pour éviter doublons
- Toutes validations passent (type-check, lint)

### Debug Log References
N/A

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-01-26 | 1.0 | Création initiale | John (PM) |
| 2026-01-26 | 1.1 | Implémentation vérifiée et complétée | James (Dev) |
