# Story TECH-007 : Tests de Régression

> **Epic** : Epic 1 - Infrastructure Backend
> **Sprint** : 0.3 - Intégration
> **Points** : 5
> **Priorité** : P1 (Critique)
> **Statut** : Ready for Development
> **Dépendances** : TECH-003, TECH-004, TECH-005, TECH-006

---

## 1. User Story

**En tant qu'** équipe QA
**Je veux** valider que les résultats du nouveau backend sont identiques à n8n
**Afin de** garantir une migration sans régression

---

## 2. Contexte

### 2.1 Objectif

Créer un dataset de référence et un système de tests automatisés pour comparer les résultats du nouveau moteur de calcul avec ceux de l'ancien backend n8n, garantissant une tolérance d'écart < 0.01%.

### 2.2 Fichiers cibles

```
src/server/calculations/__tests__/
├── regression.test.ts      # Tests automatisés
├── fixtures/
│   └── reference-cases.json # Cas de référence
└── utils/
    └── compare.ts          # Utilitaires de comparaison
```

### 2.3 Stratégie de test

| Phase | Action |
|-------|--------|
| 1 | Capturer résultats n8n pour 15-20 cas types |
| 2 | Exécuter nouveau moteur avec mêmes entrées |
| 3 | Comparer valeur par valeur avec tolérance |
| 4 | Générer rapport des écarts |

---

## 3. Critères d'Acceptation

### 3.1 Dataset de référence

- [ ] 15-20 cas de test documentés
- [ ] Couverture des scénarios types :
  - [ ] Achat nom propre simple
  - [ ] Achat avec travaux
  - [ ] LMNP micro-BIC
  - [ ] LMNP réel
  - [ ] SCI IS avec 2 associés
  - [ ] Cashflow positif
  - [ ] Cashflow négatif
  - [ ] HCSF limite (33-35%)
  - [ ] HCSF non conforme
  - [ ] Différentes durées (15, 20, 25 ans)
- [ ] Format JSON standardisé
- [ ] Résultats n8n capturés et documentés

### 3.2 Script de comparaison

- [ ] Fonction `compareResults(expected, actual, tolerance)`
- [ ] Comparaison récursive des objets
- [ ] Tolérance configurable (défaut: 0.01%)
- [ ] Gestion des valeurs nulles/undefined
- [ ] Liste détaillée des différences

### 3.3 Tests automatisés

- [ ] Tests Vitest pour chaque cas de référence
- [ ] Exécution via `npm run test:regression`
- [ ] Rapport détaillé en cas d'échec
- [ ] Intégration CI possible

### 3.4 Rapport de test

- [ ] Nombre de cas testés
- [ ] Nombre de cas OK / KO
- [ ] Détail des écarts par champ
- [ ] Pourcentage d'écart pour chaque valeur

---

## 4. Spécifications Techniques

### 4.1 Structure des cas de référence

```typescript
// src/server/calculations/__tests__/fixtures/reference-cases.json
{
  "version": "1.0",
  "generated_at": "2026-01-26T10:00:00Z",
  "source": "n8n",
  "cases": [
    {
      "id": "case-001",
      "name": "Achat nom propre simple - Studio Paris",
      "description": "Investissement classique studio 20m² Paris",
      "input": {
        "bien": {
          "prix_achat": 150000,
          "surface": 20,
          "type_bien": "appartement",
          "ville": "Paris"
        },
        "financement": {
          "apport": 30000,
          "taux_credit": 3.5,
          "duree_mois": 240,
          "taux_assurance": 0.36
        },
        "exploitation": {
          "loyer_mensuel": 750,
          "charges_copro_mensuel": 80,
          "taxe_fonciere_annuel": 600,
          "assurance_pno_annuel": 150,
          "vacance_locative": 5,
          "frais_gestion": 0
        },
        "structure": {
          "type_detention": "nom_propre",
          "regime_fiscal": "micro_foncier",
          "tmi": 0.30
        }
      },
      "expected": {
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
          "mensualite": 695.23,
          "cout_total_credit": 166855.20,
          "interets_totaux": 46855.20
        },
        "hcsf": {
          "taux_endettement": 18.5,
          "conforme": true
        },
        "synthese": {
          "score_global": 52
        }
      }
    }
    // ... autres cas
  ]
}
```

### 4.2 Utilitaires de comparaison

```typescript
// src/server/calculations/__tests__/utils/compare.ts

/**
 * Options de comparaison
 */
export interface CompareOptions {
  /** Tolérance en pourcentage (défaut: 0.01 = 0.01%) */
  tolerance: number;
  /** Ignorer les champs undefined */
  ignoreUndefined: boolean;
  /** Chemin actuel (pour le reporting) */
  path?: string;
}

/**
 * Résultat de comparaison
 */
export interface CompareResult {
  /** Comparaison réussie */
  success: boolean;
  /** Liste des différences */
  differences: Difference[];
  /** Nombre de valeurs comparées */
  totalCompared: number;
  /** Nombre de valeurs identiques */
  totalMatched: number;
}

/**
 * Détail d'une différence
 */
export interface Difference {
  /** Chemin du champ (ex: "rentabilite.rentabilite_brute") */
  path: string;
  /** Valeur attendue */
  expected: number | string | boolean | null;
  /** Valeur obtenue */
  actual: number | string | boolean | null;
  /** Écart en pourcentage (pour les nombres) */
  percentDiff?: number;
  /** Message d'erreur */
  message: string;
}

/**
 * Compare deux résultats avec tolérance
 *
 * @param expected - Résultat attendu (référence n8n)
 * @param actual - Résultat obtenu (nouveau moteur)
 * @param options - Options de comparaison
 * @returns Résultat de la comparaison
 */
export function compareResults(
  expected: unknown,
  actual: unknown,
  options: Partial<CompareOptions> = {}
): CompareResult {
  const opts: CompareOptions = {
    tolerance: 0.01,
    ignoreUndefined: true,
    path: '',
    ...options,
  };

  const differences: Difference[] = [];
  let totalCompared = 0;
  let totalMatched = 0;

  function compare(exp: unknown, act: unknown, path: string): void {
    // Null check
    if (exp === null && act === null) {
      totalCompared++;
      totalMatched++;
      return;
    }

    if (exp === null || act === null) {
      differences.push({
        path,
        expected: exp as null,
        actual: act as null,
        message: `Valeur null: attendu ${exp}, obtenu ${act}`,
      });
      totalCompared++;
      return;
    }

    // Undefined check
    if (exp === undefined && act === undefined) {
      return;
    }

    if (opts.ignoreUndefined && (exp === undefined || act === undefined)) {
      return;
    }

    // Type check
    const expType = typeof exp;
    const actType = typeof act;

    if (expType !== actType) {
      differences.push({
        path,
        expected: exp as string,
        actual: act as string,
        message: `Type différent: attendu ${expType}, obtenu ${actType}`,
      });
      totalCompared++;
      return;
    }

    // Number comparison with tolerance
    if (typeof exp === 'number' && typeof act === 'number') {
      totalCompared++;
      const diff = Math.abs(exp - act);
      const percentDiff = exp !== 0 ? (diff / Math.abs(exp)) * 100 : (act !== 0 ? 100 : 0);

      if (percentDiff <= opts.tolerance) {
        totalMatched++;
      } else {
        differences.push({
          path,
          expected: exp,
          actual: act,
          percentDiff,
          message: `Écart de ${percentDiff.toFixed(4)}% (tolérance: ${opts.tolerance}%)`,
        });
      }
      return;
    }

    // String/Boolean comparison
    if (typeof exp === 'string' || typeof exp === 'boolean') {
      totalCompared++;
      if (exp === act) {
        totalMatched++;
      } else {
        differences.push({
          path,
          expected: exp,
          actual: act as string | boolean,
          message: `Valeur différente`,
        });
      }
      return;
    }

    // Array comparison
    if (Array.isArray(exp) && Array.isArray(act)) {
      if (exp.length !== act.length) {
        differences.push({
          path,
          expected: `Array[${exp.length}]`,
          actual: `Array[${act.length}]`,
          message: `Taille différente`,
        });
      }
      const maxLen = Math.max(exp.length, act.length);
      for (let i = 0; i < maxLen; i++) {
        compare(exp[i], act[i], `${path}[${i}]`);
      }
      return;
    }

    // Object comparison
    if (typeof exp === 'object' && typeof act === 'object') {
      const expObj = exp as Record<string, unknown>;
      const actObj = act as Record<string, unknown>;
      const allKeys = new Set([...Object.keys(expObj), ...Object.keys(actObj)]);

      for (const key of allKeys) {
        compare(expObj[key], actObj[key], path ? `${path}.${key}` : key);
      }
      return;
    }
  }

  compare(expected, actual, opts.path || '');

  return {
    success: differences.length === 0,
    differences,
    totalCompared,
    totalMatched,
  };
}

/**
 * Génère un rapport de test formaté
 */
export function generateReport(
  caseName: string,
  result: CompareResult
): string {
  const lines: string[] = [];

  lines.push(`\n${'='.repeat(60)}`);
  lines.push(`Test: ${caseName}`);
  lines.push(`${'='.repeat(60)}`);
  lines.push(`Résultat: ${result.success ? '✅ PASS' : '❌ FAIL'}`);
  lines.push(`Valeurs comparées: ${result.totalCompared}`);
  lines.push(`Valeurs identiques: ${result.totalMatched}`);
  lines.push(`Différences: ${result.differences.length}`);

  if (result.differences.length > 0) {
    lines.push(`\nDétail des différences:`);
    lines.push('-'.repeat(60));

    for (const diff of result.differences) {
      lines.push(`  ${diff.path}:`);
      lines.push(`    Attendu: ${diff.expected}`);
      lines.push(`    Obtenu:  ${diff.actual}`);
      if (diff.percentDiff !== undefined) {
        lines.push(`    Écart:   ${diff.percentDiff.toFixed(4)}%`);
      }
      lines.push(`    ${diff.message}`);
    }
  }

  return lines.join('\n');
}
```

### 4.3 Tests automatisés

```typescript
// src/server/calculations/__tests__/regression.test.ts

import { describe, it, expect } from 'vitest';
import { performCalculations } from '../index';
import { compareResults, generateReport } from './utils/compare';
import referenceCases from './fixtures/reference-cases.json';

describe('Tests de régression vs n8n', () => {
  const TOLERANCE = 0.01; // 0.01%

  // Test global
  it('devrait avoir des cas de test valides', () => {
    expect(referenceCases.cases).toBeDefined();
    expect(referenceCases.cases.length).toBeGreaterThanOrEqual(10);
  });

  // Tests par cas
  describe.each(referenceCases.cases)('$name', (testCase) => {
    it(`devrait produire des résultats identiques (tolérance ${TOLERANCE}%)`, () => {
      // Exécuter le calcul
      const result = performCalculations(testCase.input);

      // Vérifier succès
      expect(result.success).toBe(true);
      if (!result.success) return;

      // Comparer les résultats
      const comparison = compareResults(
        testCase.expected,
        result.resultats,
        { tolerance: TOLERANCE }
      );

      // Afficher le rapport en cas d'échec
      if (!comparison.success) {
        console.log(generateReport(testCase.name, comparison));
      }

      // Assertions
      expect(comparison.success).toBe(true);
      expect(comparison.differences).toHaveLength(0);
    });
  });

  // Test récapitulatif
  it('devrait avoir un taux de succès de 100%', () => {
    let passed = 0;
    let failed = 0;

    for (const testCase of referenceCases.cases) {
      const result = performCalculations(testCase.input);

      if (result.success) {
        const comparison = compareResults(
          testCase.expected,
          result.resultats,
          { tolerance: TOLERANCE }
        );

        if (comparison.success) {
          passed++;
        } else {
          failed++;
        }
      } else {
        failed++;
      }
    }

    console.log(`\n📊 Récapitulatif: ${passed}/${passed + failed} cas réussis`);
    expect(failed).toBe(0);
  });
});
```

---

## 5. Cas de Référence

### 5.1 Liste des cas à capturer

| ID | Nom | Description | Spécificités |
|----|-----|-------------|--------------|
| 001 | Nom propre simple | Studio Paris 150k€ | Micro-foncier, cashflow - |
| 002 | Nom propre travaux | Appart + 30k€ travaux | Réel, déduction travaux |
| 003 | LMNP micro-BIC | T2 meublé Lyon | Abattement 50% |
| 004 | LMNP réel | T3 meublé Bordeaux | Amortissement simplifié |
| 005 | SCI IS 2 associés | Immeuble 300k€ | 60/40, IS + amort |
| 006 | Cashflow positif | T2 province | Rentabilité > 10% |
| 007 | Cashflow négatif | Studio Paris premium | Effort d'épargne |
| 008 | HCSF limite | Revenus serrés | Taux 33-34% |
| 009 | HCSF non conforme | Revenus faibles | Taux > 35% |
| 010 | Durée 15 ans | Crédit court | Mensualité élevée |
| 011 | Durée 25 ans | Crédit long | Cashflow optimisé |
| 012 | TMI élevé (41%) | Hauts revenus | Impact fiscal fort |
| 013 | TMI bas (11%) | Revenus modestes | Fiscalité légère |
| 014 | Gros apport (50%) | 50% apport | Peu d'emprunt |
| 015 | Petit apport (10%) | 10% apport | Effet levier max |

### 5.2 Processus de capture

1. **Préparer les entrées** : Créer les 15 inputs JSON normalisés
2. **Exécuter sur n8n** : Appeler le workflow n8n pour chaque cas
3. **Capturer les sorties** : Enregistrer les résultats dans `reference-cases.json`
4. **Documenter** : Ajouter description et spécificités de chaque cas

---

## 6. Configuration

### 6.1 Script npm

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:regression": "vitest run --testPathPattern=regression",
    "test:regression:watch": "vitest --testPathPattern=regression"
  }
}
```

### 6.2 Configuration Vitest

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/server/calculations/**/*.ts'],
      exclude: ['**/__tests__/**'],
    },
  },
});
```

---

## 7. Checklist de Développement

### 7.1 Préparation

- [ ] TECH-003 à TECH-006 complétées
- [ ] Vitest installé et configuré
- [ ] Accès au workflow n8n fonctionnel

### 7.2 Capture des références

- [ ] Créer les 15 inputs de test
- [ ] Exécuter chaque input sur n8n
- [ ] Capturer et formater les résultats
- [ ] Créer `reference-cases.json`
- [ ] Documenter chaque cas

### 7.3 Implémentation tests

- [ ] Créer `utils/compare.ts`
- [ ] Implémenter `compareResults()`
- [ ] Implémenter `generateReport()`
- [ ] Créer `regression.test.ts`
- [ ] Configurer scripts npm

### 7.4 Validation

- [ ] `npm run test:regression` exécute tous les tests
- [ ] Tous les tests passent (100%)
- [ ] Rapport lisible en cas d'échec
- [ ] Tolérance 0.01% respectée

---

## 8. Definition of Done

- [ ] Dataset de référence créé (15+ cas)
- [ ] Utilitaires de comparaison implémentés
- [ ] Tests automatisés fonctionnels
- [ ] Tous les cas passent avec tolérance 0.01%
- [ ] Script `npm run test:regression` opérationnel
- [ ] Rapport de test généré
- [ ] Documentation des cas de test
- [ ] Code review approuvée

---

## 9. Références

| Document | Lien |
|----------|------|
| Story précédente | [TECH-006 - Synthèse](./story-tech-006-synthese-scoring.md) |
| Story suivante | [TECH-008 - API Route](./story-tech-008-api-route.md) |
| Vitest | https://vitest.dev/ |

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-01-26 | 1.0 | Création initiale | John (PM) |
