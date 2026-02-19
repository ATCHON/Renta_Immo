# Story AUDIT-201 : Corriger la configuration Vitest & Playwright

> **Priorite** : P4-1 (Tests & DevOps — prérequis des autres stories de test)
> **Effort** : 1 jour
> **Statut** : A faire
> **Source** : Audit technique 2026-02-07, Sections 5.3 et 5.4
> **Dependance** : Aucune

---

## 1. User Story

**En tant que** développeur
**Je veux** que les configurations Vitest et Playwright soient correctes et complètes
**Afin de** pouvoir écrire et exécuter des tests fiables en environnement simulé navigateur

---

## 2. Contexte

### 2.1 Problème Vitest

L'environnement Vitest est configuré en `'node'` (ligne 8 de `vitest.config.ts`). Or les tests de composants React et de hooks nécessitent un DOM simulé (`jsdom`). Les tests actuels de store (`calculateur.store.test.ts`) contournent ce problème avec un mock localStorage manuel, ce qui est fragile.

Manquent également :

- `setupFiles` pour configurer les mocks globaux (localStorage, window, fetch)
- Seuils de couverture minimum (l'audit cible > 70%)
- Configuration `testTimeout` pour les tests lents

### 2.2 Problème Playwright

- Le bloc `webServer` est commenté (lignes 35-40 de `playwright.config.ts`) — sans lui, les tests E2E nécessitent un serveur démarré manuellement
- `baseURL` est en dur (`http://localhost:3000`) au lieu d'utiliser une variable d'environnement
- Seul Chromium est configuré — Firefox et WebKit devraient être couverts en CI
- `dotenv` n'est pas chargé pour injecter les variables de test

---

## 3. Critères d'acceptation

### 3.1 Vitest — Environnement dual

- [ ] Fichiers dans `tests/unit/calculations/` et `tests/unit/api/` utilisent `environment: 'node'` (via commentaire `@vitest-environment node`)
- [ ] Fichiers dans `tests/unit/stores/` et `tests/unit/hooks/` utilisent `environment: 'jsdom'` (via commentaire `@vitest-environment jsdom`)
- [ ] Le `environment` global par défaut dans `vitest.config.ts` est défini à `'node'` (le plus commun)
- [ ] Un fichier `tests/setup.ts` est créé avec les mocks globaux nécessaires (localStorage, window.matchMedia, IntersectionObserver)
- [ ] `setupFiles: ['./tests/setup.ts']` est ajouté à la config
- [ ] `testTimeout: 10000` est configuré (10s par défaut)

### 3.2 Vitest — Seuils de couverture

- [ ] Seuils de couverture ajoutés dans `vitest.config.ts` :
  ```
  thresholds: {
    lines: 70,
    functions: 70,
    branches: 60,
    statements: 70,
  }
  ```
- [ ] Les fichiers de configuration (`*.config.*`, `src/lib/auth.ts`, générés auto) sont exclus de la couverture

### 3.3 Playwright — Configuration complète

- [ ] Le bloc `webServer` est activé (non commenté) avec `reuseExistingServer: !process.env.CI`
- [ ] `baseURL` provient de `process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'`
- [ ] Un projet `firefox` est ajouté (en plus de `chromium`)
- [ ] `dotenv` est chargé pour injecter `.env.test` si présent
- [ ] `screenshot: 'only-on-failure'` et `trace: 'on-first-retry'` sont conservés
- [ ] Un dossier `tests/e2e/helpers/` est créé avec un helper `auth.ts` pour l'authentification E2E

### 3.4 Scripts package.json manquants

- [ ] `"test:watch": "vitest"` ajouté
- [ ] `"test:ui": "vitest --ui"` ajouté
- [ ] `"test:e2e": "playwright test"` ajouté
- [ ] `"test:e2e:ui": "playwright test --ui"` ajouté
- [ ] `"analyze": "ANALYZE=true next build"` ajouté
- [ ] `"prepare": "husky"` ajouté (prépare l'installation de Husky)

---

## 4. Spécifications techniques

### 4.1 Fichiers impactés

| Fichier                     | Modification                                                 |
| --------------------------- | ------------------------------------------------------------ |
| `vitest.config.ts`          | Ajout setupFiles, testTimeout, seuils couverture, exclusions |
| `playwright.config.ts`      | Activation webServer, baseURL env, Firefox, dotenv           |
| `tests/setup.ts`            | Nouveau — mocks globaux (localStorage, matchMedia, IO)       |
| `tests/e2e/helpers/auth.ts` | Nouveau — helper login/logout pour E2E                       |
| `package.json`              | Ajout scripts manquants                                      |

### 4.2 Contenu de `tests/setup.ts`

```typescript
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

// Mock window.matchMedia (Tailwind/résolution)
vi.stubGlobal(
  'matchMedia',
  vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
);

// Mock IntersectionObserver (composants lazy-load)
vi.stubGlobal(
  'IntersectionObserver',
  vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
);
```

### 4.3 Helper E2E `tests/e2e/helpers/auth.ts`

```typescript
import { Page } from '@playwright/test';

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/auth/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/mot de passe/i).fill(password);
  await page.getByRole('button', { name: /connexion/i }).click();
  await page.waitForURL(/\/(calculateur|simulations)/);
}

export async function logout(page: Page) {
  // À adapter selon le composant Header
  await page.getByRole('button', { name: /déconnexion/i }).click();
  await page.waitForURL('/auth/login');
}
```

### 4.4 Dépendances à installer

```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitest/ui
```

---

## 5. Points d'attention

- Le passage à `jsdom` dans les tests de store rend le mock localStorage manuel redondant — le supprimer après activation du `setupFiles`
- Les tests de calcul serveur (`src/server/calculations/`) doivent rester en `node` (pas de DOM)
- Ne pas ajouter `@testing-library/jest-dom` dans `setupFiles` si les matchers ne sont pas utilisés — attendre la story AUDIT-204

---

## 6. Définition of Done

- [ ] `npm run test` passe sans erreur avec les nouvelles configs
- [ ] `npm run test:coverage` génère un rapport avec les seuils vérifiés
- [ ] `npm run test:e2e` démarre le serveur et exécute les tests E2E
- [ ] `tests/setup.ts` est opérationnel (localStorage mock retiré du store test)
- [ ] TypeScript compile sans erreur (`npm run type-check`)
- [ ] PR validée par la CI (ci.yml)
