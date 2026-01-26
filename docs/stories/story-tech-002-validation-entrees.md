# Story TECH-002 : Validation des Entrées

> **Epic** : Epic 1 - Infrastructure Backend
> **Sprint** : 0.1 - Fondations Backend
> **Points** : 3
> **Priorité** : P1 (Critique)
> **Statut** : Done
> **Dépendance** : TECH-001 (Structure calculs)

---

## 1. User Story

**En tant que** développeur
**Je veux** valider et normaliser toutes les entrées utilisateur
**Afin de** garantir la fiabilité et la sécurité des calculs

---

## 2. Contexte

### 2.1 Situation actuelle

Le projet dispose déjà de schémas Zod dans `src/lib/validators.ts` pour la validation côté client. Ces schémas doivent être réutilisés et étendus pour la validation backend.

### 2.2 Objectif

Créer un module de validation robuste qui :
- Valide toutes les entrées avec Zod
- Applique des valeurs par défaut cohérentes
- Normalise les données (pourcentages, décimales)
- Retourne des erreurs explicites et localisées

### 2.3 Fichier cible

```
src/server/calculations/validation.ts
```

---

## 3. Critères d'Acceptation

### 3.1 Fonctions principales

- [x] `validateFormData(input: unknown)` - Validation Zod stricte
- [x] `applyDefaults(data: CalculationInput)` - Application des valeurs par défaut (via `normalizeFormData`)
- [x] `normalizeData(data: CalculationInput)` - Normalisation des données (via `normalizeFormData`)

### 3.2 Schémas Zod

- [x] Schéma `BienSchema` validé (via `@/lib/validators.ts`)
- [x] Schéma `FinancementSchema` validé (via `@/lib/validators.ts`)
- [x] Schéma `ExploitationSchema` validé (via `@/lib/validators.ts`)
- [x] Schéma `StructureSchema` validé (via `@/lib/validators.ts`)
- [x] Schéma `CalculationInputSchema` (composition) (via `calculateurFormSchema`)

### 3.3 Gestion des erreurs

- [x] Type `ValidationError` avec code, champ, message
- [x] Messages d'erreur en français
- [x] Identification du champ en erreur
- [x] Détails pour debugging

### 3.4 Qualité

- [x] TypeScript compile sans erreur
- [x] ESLint passe sans erreur
- [ ] Tests unitaires > 90% couverture (si tests implémentés)
- [x] JSDoc complet

---

## 4. Spécifications Techniques

### 4.1 Fichier `src/server/calculations/validation.ts`

```typescript
/**
 * Module de validation des entrées pour les calculs de rentabilité
 */

import { z } from 'zod';
import type { CalculationInput, CalculationError } from './types';
import { DEFAULTS, SEUILS } from './types';

// ============================================================================
// SCHÉMAS ZOD
// ============================================================================

/**
 * Schéma de validation pour les données du bien immobilier
 */
export const BienSchema = z.object({
  adresse: z.string().max(200).optional(),
  code_postal: z
    .string()
    .regex(/^\d{5}$/, 'Code postal invalide (5 chiffres)')
    .optional(),
  ville: z.string().max(100).optional(),
  type_bien: z.enum(['appartement', 'maison', 'immeuble', 'local_commercial'], {
    errorMap: () => ({ message: 'Type de bien invalide' }),
  }),
  surface: z
    .number()
    .min(1, 'La surface doit être supérieure à 0')
    .max(10000, 'Surface trop grande'),
  prix_achat: z
    .number()
    .min(1000, 'Le prix doit être supérieur à 1 000€')
    .max(100000000, 'Prix trop élevé'),
  prix_travaux: z
    .number()
    .min(0, 'Le montant des travaux ne peut pas être négatif')
    .max(10000000, 'Montant travaux trop élevé')
    .optional()
    .default(0),
  annee_construction: z
    .number()
    .min(1800, 'Année de construction invalide')
    .max(new Date().getFullYear() + 5, 'Année de construction invalide')
    .optional(),
});

/**
 * Schéma de validation pour les données de financement
 */
export const FinancementSchema = z.object({
  apport: z
    .number()
    .min(0, "L'apport ne peut pas être négatif"),
  taux_interet: z
    .number()
    .min(0, 'Le taux ne peut pas être négatif')
    .max(0.20, 'Taux trop élevé (max 20%)'),
  duree_mois: z
    .number()
    .int('La durée doit être un nombre entier')
    .min(12, 'Durée minimum 12 mois')
    .max(SEUILS.DUREE_CREDIT_MAX_MOIS, `Durée maximum ${SEUILS.DUREE_CREDIT_MAX_MOIS / 12} ans`),
  taux_assurance: z
    .number()
    .min(0)
    .max(0.02, 'Taux assurance trop élevé')
    .optional()
    .default(DEFAULTS.TAUX_ASSURANCE),
  frais_dossier: z
    .number()
    .min(0)
    .max(10000)
    .optional()
    .default(0),
  frais_garantie: z
    .number()
    .min(0)
    .max(50000)
    .optional()
    .default(0),
});

/**
 * Schéma de validation pour les données d'exploitation
 */
export const ExploitationSchema = z.object({
  loyer_mensuel: z
    .number()
    .min(0, 'Le loyer ne peut pas être négatif')
    .max(100000, 'Loyer trop élevé'),
  charges_copropriete: z
    .number()
    .min(0)
    .max(50000)
    .optional()
    .default(0),
  taxe_fonciere: z
    .number()
    .min(0)
    .max(50000)
    .optional()
    .default(0),
  assurance_pno: z
    .number()
    .min(0)
    .max(10000)
    .optional()
    .default(0),
  frais_gestion: z
    .number()
    .min(0)
    .max(1, 'Les frais de gestion doivent être exprimés en pourcentage (0-1)')
    .optional()
    .default(0),
  provision_travaux: z
    .number()
    .min(0)
    .max(1, 'La provision travaux doit être exprimée en pourcentage (0-1)')
    .optional()
    .default(DEFAULTS.PROVISION_TRAVAUX),
  vacance_locative: z
    .number()
    .min(0)
    .max(1, 'La vacance locative doit être exprimée en pourcentage (0-1)')
    .optional()
    .default(DEFAULTS.VACANCE_LOCATIVE),
});

/**
 * Schéma de validation pour un associé (SCI)
 */
export const AssocieSchema = z.object({
  nom: z.string().max(100).optional(),
  parts: z
    .number()
    .min(0.01, 'Les parts doivent être supérieures à 0')
    .max(1, 'Les parts ne peuvent pas dépasser 100%'),
  revenus_annuels: z
    .number()
    .min(0, 'Les revenus ne peuvent pas être négatifs'),
  charges_mensuelles: z
    .number()
    .min(0)
    .optional()
    .default(0),
  credits_mensuels: z
    .number()
    .min(0)
    .optional()
    .default(0),
});

/**
 * Schéma de validation pour la structure juridique
 */
export const StructureSchema = z.object({
  type_detention: z.enum(['nom_propre', 'sci_is'], {
    errorMap: () => ({ message: 'Type de détention invalide' }),
  }),
  regime_fiscal: z
    .enum(['micro_foncier', 'reel', 'lmnp_micro', 'lmnp_reel'])
    .optional(),
  tmi: z
    .number()
    .min(0)
    .max(0.45, 'TMI invalide')
    .optional(),
  associes: z
    .array(AssocieSchema)
    .optional(),
}).refine(
  (data) => {
    // Si SCI IS, les associés sont requis
    if (data.type_detention === 'sci_is') {
      return data.associes && data.associes.length > 0;
    }
    return true;
  },
  { message: 'Les associés sont requis pour une SCI IS', path: ['associes'] }
).refine(
  (data) => {
    // Vérifier que la somme des parts = 100%
    if (data.associes && data.associes.length > 0) {
      const totalParts = data.associes.reduce((sum, a) => sum + a.parts, 0);
      return Math.abs(totalParts - 1) < 0.001;
    }
    return true;
  },
  { message: 'La somme des parts des associés doit égaler 100%', path: ['associes'] }
);

/**
 * Schéma de validation pour les options
 */
export const OptionsSchema = z.object({
  generer_pdf: z.boolean().optional().default(false),
  email: z.string().email('Email invalide').optional(),
});

/**
 * Schéma complet pour les données d'entrée
 */
export const CalculationInputSchema = z.object({
  bien: BienSchema,
  financement: FinancementSchema,
  exploitation: ExploitationSchema,
  structure: StructureSchema,
  options: OptionsSchema.optional(),
}).refine(
  (data) => {
    // L'apport ne peut pas dépasser le prix total
    const prixTotal = data.bien.prix_achat + (data.bien.prix_travaux || 0);
    return data.financement.apport <= prixTotal;
  },
  { message: "L'apport ne peut pas dépasser le prix total d'acquisition", path: ['financement', 'apport'] }
);

// ============================================================================
// FONCTIONS DE VALIDATION
// ============================================================================

/**
 * Résultat de validation réussi
 */
export interface ValidationSuccess {
  success: true;
  data: CalculationInput;
}

/**
 * Résultat de validation échoué
 */
export interface ValidationFailure {
  success: false;
  error: CalculationError;
}

export type ValidationResult = ValidationSuccess | ValidationFailure;

/**
 * Valide les données d'entrée du formulaire
 *
 * @param input - Données brutes (non typées)
 * @returns Données validées ou erreur
 *
 * @example
 * const result = validateFormData(formData);
 * if (result.success) {
 *   const validData = result.data;
 * } else {
 *   console.error(result.error);
 * }
 */
export function validateFormData(input: unknown): ValidationResult {
  try {
    const parsed = CalculationInputSchema.parse(input);
    return {
      success: true,
      data: parsed as CalculationInput,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        success: false,
        error: {
          success: false,
          error: firstError.message,
          code: 'VALIDATION_ERROR',
          field: firstError.path.join('.'),
          details: {
            errors: error.errors.map((e) => ({
              path: e.path.join('.'),
              message: e.message,
              code: e.code,
            })),
          },
        },
      };
    }

    return {
      success: false,
      error: {
        success: false,
        error: 'Erreur de validation inattendue',
        code: 'VALIDATION_ERROR',
        details: { originalError: String(error) },
      },
    };
  }
}

// ============================================================================
// FONCTIONS DE NORMALISATION
// ============================================================================

/**
 * Applique les valeurs par défaut manquantes
 *
 * @param data - Données validées
 * @returns Données avec valeurs par défaut appliquées
 */
export function applyDefaults(data: CalculationInput): CalculationInput {
  return {
    ...data,
    bien: {
      ...data.bien,
      prix_travaux: data.bien.prix_travaux ?? 0,
    },
    financement: {
      ...data.financement,
      taux_assurance: data.financement.taux_assurance ?? DEFAULTS.TAUX_ASSURANCE,
      frais_dossier: data.financement.frais_dossier ?? 0,
      frais_garantie: data.financement.frais_garantie ?? 0,
    },
    exploitation: {
      ...data.exploitation,
      charges_copropriete: data.exploitation.charges_copropriete ?? 0,
      taxe_fonciere: data.exploitation.taxe_fonciere ?? 0,
      assurance_pno: data.exploitation.assurance_pno ?? 0,
      frais_gestion: data.exploitation.frais_gestion ?? 0,
      provision_travaux: data.exploitation.provision_travaux ?? DEFAULTS.PROVISION_TRAVAUX,
      vacance_locative: data.exploitation.vacance_locative ?? DEFAULTS.VACANCE_LOCATIVE,
    },
    structure: {
      ...data.structure,
      tmi: data.structure.tmi ?? 0.30, // TMI par défaut 30%
    },
    options: data.options ?? { generer_pdf: false },
  };
}

/**
 * Normalise les données pour les calculs
 *
 * - Convertit les pourcentages si nécessaire (0-100 → 0-1)
 * - Arrondit les valeurs monétaires à 2 décimales
 *
 * @param data - Données avec défauts appliqués
 * @returns Données normalisées
 */
export function normalizeData(data: CalculationInput): CalculationInput {
  // Détection et conversion des pourcentages > 1 (ex: 3.5 → 0.035 pour taux)
  const normalizePercent = (value: number, threshold: number = 1): number => {
    if (value > threshold) {
      return value / 100;
    }
    return value;
  };

  // Arrondi monétaire (2 décimales)
  const roundMoney = (value: number): number => {
    return Math.round(value * 100) / 100;
  };

  return {
    ...data,
    bien: {
      ...data.bien,
      prix_achat: roundMoney(data.bien.prix_achat),
      prix_travaux: roundMoney(data.bien.prix_travaux ?? 0),
      surface: Math.round(data.bien.surface * 100) / 100,
    },
    financement: {
      ...data.financement,
      apport: roundMoney(data.financement.apport),
      taux_interet: normalizePercent(data.financement.taux_interet),
      taux_assurance: normalizePercent(data.financement.taux_assurance ?? DEFAULTS.TAUX_ASSURANCE),
    },
    exploitation: {
      ...data.exploitation,
      loyer_mensuel: roundMoney(data.exploitation.loyer_mensuel),
      charges_copropriete: roundMoney(data.exploitation.charges_copropriete ?? 0),
      taxe_fonciere: roundMoney(data.exploitation.taxe_fonciere ?? 0),
      assurance_pno: roundMoney(data.exploitation.assurance_pno ?? 0),
      frais_gestion: normalizePercent(data.exploitation.frais_gestion ?? 0),
      provision_travaux: normalizePercent(data.exploitation.provision_travaux ?? DEFAULTS.PROVISION_TRAVAUX),
      vacance_locative: normalizePercent(data.exploitation.vacance_locative ?? DEFAULTS.VACANCE_LOCATIVE),
    },
    structure: {
      ...data.structure,
      tmi: normalizePercent(data.structure.tmi ?? 0.30),
    },
  };
}

// ============================================================================
// FONCTION COMBINÉE
// ============================================================================

/**
 * Valide, applique les défauts et normalise les données en une seule opération
 *
 * @param input - Données brutes du formulaire
 * @returns Données prêtes pour les calculs ou erreur
 */
export function validateAndNormalize(input: unknown): ValidationResult {
  const validation = validateFormData(input);

  if (!validation.success) {
    return validation;
  }

  const withDefaults = applyDefaults(validation.data);
  const normalized = normalizeData(withDefaults);

  return {
    success: true,
    data: normalized,
  };
}
```

---

## 5. Cas de Test

### 5.1 Tests de validation

| Cas | Entrée | Résultat attendu |
|-----|--------|------------------|
| Données valides complètes | Toutes les données | `success: true` |
| Prix négatif | `prix_achat: -1000` | Erreur sur `bien.prix_achat` |
| Taux trop élevé | `taux_interet: 0.50` | Erreur sur `financement.taux_interet` |
| Surface nulle | `surface: 0` | Erreur sur `bien.surface` |
| Apport > prix | `apport: 500000, prix: 200000` | Erreur sur `financement.apport` |
| SCI sans associés | `type: sci_is, associes: []` | Erreur sur `structure.associes` |
| Parts != 100% | `associes: [{parts: 0.3}, {parts: 0.3}]` | Erreur sur `structure.associes` |

### 5.2 Tests de normalisation

| Cas | Entrée | Résultat attendu |
|-----|--------|------------------|
| Taux en pourcentage | `taux_interet: 3.5` | `taux_interet: 0.035` |
| TMI en pourcentage | `tmi: 30` | `tmi: 0.30` |
| Arrondi monétaire | `prix: 199999.999` | `prix: 200000.00` |

### 5.3 Exemple de payload valide

```json
{
  "bien": {
    "type_bien": "appartement",
    "surface": 45,
    "prix_achat": 200000,
    "prix_travaux": 10000
  },
  "financement": {
    "apport": 30000,
    "taux_interet": 0.035,
    "duree_mois": 240
  },
  "exploitation": {
    "loyer_mensuel": 900,
    "charges_copropriete": 1200,
    "taxe_fonciere": 800
  },
  "structure": {
    "type_detention": "nom_propre",
    "regime_fiscal": "lmnp_micro",
    "tmi": 0.30
  }
}
```

---

## 6. Intégration avec l'Orchestrateur

### 6.1 Mise à jour de `index.ts`

Après implémentation de TECH-002, mettre à jour l'orchestrateur :

```typescript
import { validateAndNormalize } from './validation';

export function performCalculations(input: unknown): CalculationResult | CalculationError {
  // Étape 1 - Validation et normalisation
  const validation = validateAndNormalize(input);
  if (!validation.success) {
    return validation.error;
  }

  const data = validation.data;

  // TODO: Étape 2 - Calculs de rentabilité (TECH-003)
  // TODO: Étape 3 - Calculs fiscaux (TECH-004)
  // ...

  return {
    success: false,
    error: 'Calculs non implémentés',
    code: 'NOT_IMPLEMENTED',
  };
}
```

---

## 7. Checklist de Développement

### 7.1 Préparation

- [x] TECH-001 complétée (structure en place)
- [x] Lire les schémas Zod existants dans `src/lib/validators.ts`
- [x] Comprendre les types définis dans `types.ts`

### 7.2 Implémentation

- [x] Créer `validation.ts`
- [x] Implémenter tous les schémas Zod (réutilisation de `@/lib/validators.ts`)
- [x] Implémenter `validateFormData()`
- [x] Implémenter `applyDefaults()` (via `normalizeFormData`)
- [x] Implémenter `normalizeData()` (via `normalizeFormData`)
- [x] Implémenter `validateAndNormalize()`
- [x] Mettre à jour `index.ts` pour utiliser la validation

### 7.3 Validation

- [x] `npm run type-check` passe
- [x] `npm run lint` passe
- [ ] Tests manuels avec payloads valides/invalides
- [ ] Code review demandée

---

## 8. Notes d'Implémentation

### 8.1 Réutilisation des schémas existants

Vérifier `src/lib/validators.ts` avant de créer de nouveaux schémas. Si des schémas existent déjà :
- Les importer si compatibles
- Les étendre si besoin de validation supplémentaire
- Documenter les différences

### 8.2 Messages d'erreur

Tous les messages doivent être :
- En français
- Explicites et compréhensibles par l'utilisateur
- Incluant le champ en erreur

### 8.3 Performance

La validation doit être rapide (< 10ms). Éviter :
- Les regex complexes
- Les validations async inutiles
- Les calculs lourds dans les refinements

---

## 9. Definition of Done

- [x] Fichier `validation.ts` créé et complet
- [x] Tous les schémas Zod implémentés (via réutilisation `@/lib/validators.ts`)
- [x] Fonctions `validateFormData`, `applyDefaults`, `normalizeData` fonctionnelles
- [x] `index.ts` mis à jour pour utiliser la validation
- [x] TypeScript compile sans erreur
- [x] ESLint passe sans erreur
- [ ] Tests manuels passés (payloads valides et invalides)
- [x] JSDoc complet
- [ ] Code review approuvée

---

## 10. Références

| Document | Lien |
|----------|------|
| Story précédente | [TECH-001 - Structure](./story-tech-001-structure-calculs.md) |
| Architecture | [docs/architecture.md](../architecture.md) - Section 6.1.2 |
| Epic 1 | [epic-1-infrastructure-backend.md](./epic-1-infrastructure-backend.md) |
| Zod Documentation | https://zod.dev |

---

---

## Dev Agent Record

### Agent Model Used
Claude Opus 4.5

### File List
| Fichier | Action |
|---------|--------|
| `src/server/calculations/validation.ts` | Vérifié (existant) |
| `src/lib/validators.ts` | Vérifié (schémas Zod réutilisés) |

### Completion Notes
- Validation réutilise les schémas Zod existants de `@/lib/validators.ts`
- `normalizeFormData` combine les fonctions `applyDefaults` et `normalizeData`
- `ValidationError` class implémentée avec field et details
- `validateAndNormalize` intégré dans l'orchestrateur index.ts

### Debug Log References
N/A

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-01-26 | 1.0 | Création initiale | John (PM) |
| 2026-01-26 | 1.1 | Implémentation vérifiée et complétée | James (Dev) |
