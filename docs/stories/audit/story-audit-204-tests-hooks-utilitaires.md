# Story AUDIT-204 : Tests unitaires — Hooks personnalisés & utilitaires

> **Priorite** : P4-4 (Tests & DevOps)
> **Effort** : 1.5 jour
> **Statut** : A faire
> **Source** : Audit technique 2026-02-07, Section 5.1
> **Dependance** : AUDIT-201 (configuration Vitest avec jsdom pour les hooks)

---

## 1. User Story

**En tant que** développeur
**Je veux** des tests unitaires pour les hooks personnalisés et les fonctions utilitaires
**Afin de** garantir leur bon comportement et faciliter leur refactoring sans risque de régression

---

## 2. Contexte

### 2.1 Périmètre actuel

Seul `tests/unit/stores/calculateur.store.test.ts` couvre partiellement le store Zustand. Les hooks personnalisés et les utilitaires ne sont pas testés :

**Hooks personnalisés** (dans `src/hooks/`) :

- `useSimulations` — fetching, filtres, mutations CRUD
- `useSimulationMutations` — création, mise à jour, suppression, archivage, favori
- `useCalculateur` — déclenchement du calcul, gestion des résultats
- `useDownloadPdf` — téléchargement du rapport PDF
- `useScenarioFormReset` — réinitialisation des formulaires

**Utilitaires** (dans `src/lib/`) :

- `formatCurrency`, `formatPercent`, `formatNumber` (formatage)
- `src/lib/auth/redirect.ts` — validation de l'URL de redirection
- `src/lib/rate-limit.ts` — logique de rate limiting
- `src/lib/logger.ts` — filtre selon l'environnement

### 2.2 Stratégie

- Hooks React : tester avec `@testing-library/react` (`renderHook`) dans un environnement `jsdom`
- Utilitaires purs : tester directement dans `node` (pas de DOM nécessaire)
- Zustand store : compléter les tests existants avec les cas manquants

---

## 3. Critères d'acceptation

### 3.1 Tests utilitaires de formatage

Fichier : `tests/unit/lib/format.test.ts`

- [ ] `formatCurrency(150000)` → `"150 000 €"` (espace milliers, symbole euro)
- [ ] `formatCurrency(0)` → `"0 €"`
- [ ] `formatCurrency(-500)` → `"-500 €"` (valeur négative)
- [ ] `formatPercent(5.23)` → `"5,23 %"` (virgule décimale française)
- [ ] `formatPercent(0)` → `"0 %"`
- [ ] `formatPercent(100)` → `"100 %"`
- [ ] Valeurs NaN/undefined/null gérées sans crash (retournent `"—"` ou `"0 €"`)

### 3.2 Tests `src/lib/auth/redirect.ts`

Fichier : `tests/unit/lib/redirect.test.ts`

- [ ] `/calculateur` est accepté (path interne valide)
- [ ] `/simulations` est accepté
- [ ] `/simulations/abc-123` est accepté
- [ ] `https://evil.com` est rejeté (URL absolue externe)
- [ ] `//evil.com` est rejeté (protocol-relative)
- [ ] `/../etc/passwd` est rejeté (path traversal)
- [ ] `%2e%2e/etc` est rejeté (encodage malveillant)
- [ ] `\evil` est rejeté (backslash)
- [ ] Une URL vide retourne `/` (fallback sécurisé)

### 3.3 Tests `src/lib/rate-limit.ts`

Fichier : `tests/unit/lib/rate-limit.test.ts`

- [ ] La première requête d'une IP passe (200)
- [ ] Après N requêtes dépassant la limite, retourne 429
- [ ] Le header `Retry-After` est présent dans la réponse 429
- [ ] Une IP différente n'est pas affectée par la limite d'une autre IP
- [ ] Après écoulement de la fenêtre de temps, les requêtes passent à nouveau

### 3.4 Tests `src/lib/logger.ts`

Fichier : `tests/unit/lib/logger.test.ts`

- [ ] En `NODE_ENV=production`, `logger.debug()` et `logger.info()` ne loguent pas
- [ ] En `NODE_ENV=development`, tous les niveaux loguent
- [ ] `logger.error()` logue toujours (même en production)
- [ ] `logger.warn()` logue toujours (même en production)

### 3.5 Tests Zustand store — cas manquants

Fichier : `tests/unit/stores/calculateur.store.test.ts` (à compléter)

- [ ] `addScenario()` crée un nouveau scénario avec un ID unique
- [ ] `duplicateScenario()` crée une copie avec les mêmes données
- [ ] `removeScenario()` supprime le scénario et active le précédent
- [ ] `setActiveScenario(id)` change le scénario actif
- [ ] `updateFinancement()` met à jour les données de financement
- [ ] `updateExploitation()` met à jour les données d'exploitation
- [ ] `setResults()` stocke les résultats et passe le status à `'success'`
- [ ] `reset()` remet le store à son état initial
- [ ] La persistence localStorage sauvegarde l'état après modification
- [ ] La rehydratation depuis localStorage restaure l'état à l'initialisation

### 3.6 Tests hooks avec React Testing Library

Fichier : `tests/unit/hooks/useDownloadPdf.test.ts`

- [ ] `useDownloadPdf()` retourne une fonction `download` et un état `isLoading: false` initialement
- [ ] Appeler `download(id)` passe `isLoading` à `true` puis `false` après résolution
- [ ] En cas d'erreur API, `isLoading` repasse à `false` et un toast d'erreur est déclenché

---

## 4. Spécifications techniques

### 4.1 Structure des fichiers

```
tests/unit/
├── api/
│   ├── calculate.test.ts          (existant)
│   ├── simulations.test.ts        (AUDIT-203)
│   └── simulations-id.test.ts     (AUDIT-203)
├── calculations/                  (existants)
├── hooks/
│   └── useDownloadPdf.test.ts     (nouveau)
├── lib/
│   ├── format.test.ts             (nouveau)
│   ├── redirect.test.ts           (nouveau)
│   ├── rate-limit.test.ts         (nouveau)
│   └── logger.test.ts             (nouveau)
└── stores/
    └── calculateur.store.test.ts  (à compléter)
```

### 4.2 En-tête d'environnement dans les fichiers de hooks

Les tests de hooks nécessitent jsdom :

```typescript
// @vitest-environment jsdom
import { renderHook, act } from '@testing-library/react';
```

Les tests utilitaires restent en node (pas d'en-tête → utilise le défaut `node`).

### 4.3 Mock pour les hooks avec fetch

```typescript
vi.mock('@/hooks/useSimulations', async () => {
  const actual = await vi.importActual('@/hooks/useSimulations');
  return {
    ...actual,
    // Override si nécessaire
  };
});

// Mock fetch global
vi.stubGlobal(
  'fetch',
  vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ success: true, data: [] }),
  })
);
```

### 4.4 Dépendances à installer (si pas déjà fait via AUDIT-201)

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

---

## 5. Points d'attention

- `useSimulations` et `useSimulationMutations` utilisent React Query — nécessitent un wrapper `QueryClientProvider` dans `renderHook`
- Les tests du store Zustand doivent appeler `reset()` dans `beforeEach` pour éviter les effets de bord entre tests
- `logger.ts` utilise `process.env.NODE_ENV` — configurer via `vi.stubEnv('NODE_ENV', 'production')` dans les tests
- Les fonctions de formatage peuvent dépendre de la locale système — forcer `'fr-FR'` dans les tests

---

## 6. Définition of Done

- [ ] Minimum 50 nouveaux tests unitaires couvrant les modules listés
- [ ] Couverture `src/lib/` > 70%
- [ ] Couverture `src/stores/` > 80%
- [ ] `npm run test` passe sans erreur
- [ ] Aucune dépendance réelle vers le réseau ou Supabase
- [ ] TypeScript compile sans erreur
- [ ] Non-régression sur les 169+ tests existants
