# Story UP-S03 : Migrer React 18 → 19 et Next.js 14 → 16 (APIs asynchrones)

> **Priorité** : P3 — LE GROS MORCEAU
> **Effort** : L (5–7 jours)
> **Statut** : Approved
> **Type** : Feature majeure / Migration critique
> **Epic** : UPGRADE-01 — Montée de Version des Dépendances
> **Branche** : `feature/upgrade-react-next`
> **Dépendances** : UP-S01 (ESLint v10) + UP-S02 (Tailwind v4) — les deux mergés sur `master`

---

## 1. User Story

**En tant que** développeur fullstack
**Je veux** que le projet tourne sur React 19 et Next.js 16
**Afin de** bénéficier du React Compiler, des nouvelles APIs de gestion d'état de formulaires, et du support long terme de l'écosystème Next.js

---

## 2. Contexte

### 2.1 Situation actuelle

- React : `18.3.1` / React DOM : `18.3.1`
- Next.js : `14.2.35`
- Stack SSR : App Router, Supabase SSR via `cookies()` (serveur), Better Auth

### 2.2 Breaking Changes React 19

- **`forwardRef` obsolète** : Les composants avec `forwardRef` doivent être réécrits — `ref` est désormais une prop directe (`function MyInput({ ref }) {...}`)
- **String Refs supprimées** : `ref="string"` n'existe plus — codemod officiel disponible
- **Nouveaux hooks natifs** :
  - `useActionState` : remplace les patterns `useState` + `async handler` sur les formulaires
  - `useFormStatus` : état `pending` d'un formulaire parent accessible dans les enfants
  - `useOptimistic` : mises à jour UI optimistes avec rollback automatique
  - `use(promise)` : résolution de promesses directement dans le rendu

### 2.3 Breaking Changes Next.js 15→16 (depuis v14)

> **Attention** : le saut est Next.js 14 → 16. Il couvre tous les breaking changes des versions intermédiaires (15 incluse).

- **APIs de requête strictement asynchrones** :
  - `params` dans les pages/layouts
  - `searchParams` dans les pages
  - `cookies()` (next/headers)
  - `headers()` (next/headers)
  - `draftMode()` (next/headers)

  En Next.js 14, ces APIs étaient synchrones. En Next.js 15, elles étaient asynchrones avec compatibilité temporaire. **En Next.js 16, la compatibilité est supprimée** — tous les accès doivent être `await`és.

- **Cache `fetch` désactivé par défaut** : Les requêtes `fetch` dans les Server Components ne sont plus mises en cache au CDN par défaut (comportement de Next.js 15+). Il faut annoter explicitement avec `{ cache: 'force-cache' }` ou `revalidate`.

- **Turbopack bundler par défaut** : Vérifier la compatibilité de `next.config.mjs` et des plugins éventuels.

- **React Compiler intégré** : Peut rendre obsolètes les `useMemo` et `useCallback` manuels. À activer progressivement.

- **`PageProps` helper** : Typage type-safe des pages avec `PageProps<'/blog/[slug]'>` pour les params asynchrones.

### 2.4 Impact spécifique à Renta_Immo

Les zones critiques identifiées sont :

1. **`src/lib/auth.ts`** (Better Auth) — utilise probablement `cookies()` de `next/headers` → doit être `await`é
2. **`src/lib/supabase/*.ts`** — `createServerClient` avec `cookies()` SSR → `await cookies()`
3. **Pages App Router** avec `searchParams` : page de simulations avec filtres URL
4. **Layouts** avec `params` : si des routes dynamiques (`[id]`) existent
5. **Composants avec `forwardRef`** : à inventorier via grep
6. **API routes** `/api/calculate`, `/api/simulations`, `/api/pdf` — vérifier accès aux cookies/headers

---

## 3. Critères d'acceptation

### 3.1 Mise à jour des packages

- [ ] `react` et `react-dom` mis à jour vers `19.x`
- [ ] `@types/react` et `@types/react-dom` mis à jour en cohérence
- [ ] `next` mis à jour vers `16.x`
- [ ] `eslint-config-next` mis à jour vers la version compatible Next.js 16
- [ ] `@supabase/ssr` mis à jour vers la version compatible Next.js 16 (cookies async)
- [ ] `supabase-js` mis à jour vers `2.97.x` (montée mineure incluse)

### 3.2 APIs asynchrones Next.js — Correction obligatoire

- [ ] Audit complet des fichiers utilisant `cookies()`, `headers()`, `draftMode()` — **aucun accès synchrone**
- [ ] Audit complet des pages/layouts avec `params` ou `searchParams` — **aucun accès synchrone**
- [ ] Tous les `params`/`searchParams` sont `await`és dans les Server Components
- [ ] `cookies()` de `next/headers` est `await`é partout (auth, supabase SSR)
- [ ] Le typage des pages utilise le helper `PageProps` ou `Promise<{...}>` pour les props asynchrones

### 3.3 Migration `forwardRef`

- [ ] Tous les composants utilisant `forwardRef` sont identifiés (via grep)
- [ ] Chaque composant est réécrit pour recevoir `ref` comme prop directe
- [ ] Le codemod officiel est exécuté et ses résultats vérifiés :
  ```bash
  npx codemod@latest react/19/replace-string-ref
  npx codemod@latest react/19/replace-use-form-state
  ```

### 3.4 Cache Next.js — Validation du comportement

- [ ] Les routes API `/api/calculate`, `/api/simulations`, `/api/pdf` ne mettent **pas** en cache les données sensibles utilisateur
- [ ] Les pages publiques (si applicables) ont des annotations de cache explicites si nécessaire
- [ ] Aucun bug de données « stale » sur le Dashboard de résultats après calcul

### 3.5 Qualité et tests

- [ ] `npm run type-check` : TypeScript strict, 0 erreur, 0 `any` introduit
- [ ] `npm run lint` : ESLint v10 (de UP-S01), 0 erreur
- [ ] `npm test` (Vitest) : **TOUTE la suite verte** — 0 régression sur les calculs LMNP/SCI/HCSF
- [ ] `npm run test:integration` (si applicable) : 0 régression
- [ ] `npm run test:e2e` (Playwright) : parcours auth + calcul simulateur + CRUD simulations + export PDF — 0 régression

---

## 4. Spécifications techniques

### 4.1 Fichiers à auditer en priorité

| Fichier / Dossier            | Raison de l'audit                           | Risque   |
| ---------------------------- | ------------------------------------------- | -------- |
| `src/lib/auth.ts`            | `cookies()` pour session Better Auth        | CRITIQUE |
| `src/lib/supabase/server.ts` | `createServerClient` + `cookies()`          | CRITIQUE |
| `src/app/**/page.tsx`        | `searchParams` / `params` asynchrones       | ÉLEVÉ    |
| `src/app/**/layout.tsx`      | `params` asynchrones si routes dynamiques   | ÉLEVÉ    |
| `src/app/api/**/route.ts`    | `cookies()` / `headers()` dans les handlers | ÉLEVÉ    |
| `src/components/**/*.tsx`    | Présence de `forwardRef`                    | MODÉRÉ   |
| `next.config.mjs`            | Compatibilité Turbopack, React Compiler     | MODÉRÉ   |

### 4.2 Procédure de migration étape par étape

```bash
# === ÉTAPE 1 : Codemods officiels (exécuter avant la mise à jour des packages) ===
npx codemod@latest next/15/async-request-api   # Next.js 15 async params/cookies
# Note: pas de codemod Next 16 officiel distinct — vérifier la doc officielle

npx codemod@latest react/19/replace-string-ref    # String Refs → callback refs
npx codemod@latest react/19/replace-use-form-state # useFormState → useActionState

# === ÉTAPE 2 : Mise à jour des packages ===
npm install react@19 react-dom@19 next@16
npm install --save-dev @types/react@19 @types/react-dom@19

# === ÉTAPE 3 : Mise à jour dépendances liées ===
npm install @supabase/ssr@latest @supabase/supabase-js@2.97

# === ÉTAPE 4 : Type-check pour identifier les erreurs restantes ===
npm run type-check 2>&1 | head -100

# === ÉTAPE 5 : Lint ===
npm run lint

# === ÉTAPE 6 : Tests unitaires — LES PLUS IMPORTANTS ===
npm test

# === ÉTAPE 7 : Build ===
npm run build

# === ÉTAPE 8 : Tests E2E ===
npm run test:e2e
```

### 4.3 Pattern cible pour `cookies()` asynchrones

**Avant (Next.js 14 — synchrone) :**

```typescript
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies(); // synchrone
  return createServerClient(url, key, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}
```

**Après (Next.js 16 — asynchrone) :**

```typescript
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies(); // asynchrone obligatoire
  return createServerClient(url, key, {
    cookies: {
      get(name) {
        return cookieStore.get(name)?.value;
      },
    },
  });
}
```

### 4.4 Pattern cible pour les pages avec `searchParams`

**Avant (Next.js 14) :**

```typescript
export default function Page({ searchParams }: { searchParams: { page?: string } }) {
  const page = searchParams.page ?? '1'; // synchrone
}
```

**Après (Next.js 16) :**

```typescript
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const { page } = await searchParams; // asynchrone obligatoire
  const currentPage = page ?? '1';
}
```

### 4.5 Pattern cible `forwardRef` → prop `ref` directe

**Avant (React 18) :**

```typescript
const MyInput = forwardRef<HTMLInputElement, InputProps>(
  function MyInput({ label, ...props }, ref) {
    return <input ref={ref} {...props} />;
  }
);
```

**Après (React 19) :**

```typescript
function MyInput({ label, ref, ...props }: InputProps & { ref?: React.Ref<HTMLInputElement> }) {
  return <input ref={ref} {...props} />;
}
```

### 4.6 React Compiler (optionnel en UP-S03)

Le React Compiler (optimisation automatique des re-renders) peut être activé dans `next.config.mjs`. Il est **optionnel** dans cette story — l'activer uniquement si stable et si les tests passent. Ne pas supprimer les `useMemo`/`useCallback` existants sans validation préalable par les tests.

```js
// next.config.mjs
export default {
  experimental: {
    reactCompiler: true, // À activer prudemment
  },
};
```

### 4.7 Grep de recherche pour l'audit

```bash
# Rechercher les accès synchrones à cookies/headers
grep -rn "cookies()" src/ --include="*.ts" --include="*.tsx"
grep -rn "headers()" src/ --include="*.ts" --include="*.tsx"

# Rechercher forwardRef
grep -rn "forwardRef" src/ --include="*.tsx"

# Rechercher searchParams synchrones dans les pages
grep -rn "searchParams\." src/app --include="*.tsx"

# Rechercher params synchrones dans les pages
grep -rn "params\." src/app --include="*.tsx"
```

---

## 5. Points d'attention CRITIQUES

1. **Ne pas modifier le moteur de calcul** (`src/server/calculations/`) pendant cette migration — ce code est serveur-pur (Node) et non impacté par React/Next. Les tests unitaires de calcul sont le filet de sécurité principal.

2. **Better Auth + cookies asynchrones** : Better Auth gère ses propres cookies pour la session. Vérifier la version de Better Auth compatible avec Next.js 16 et ses `cookies()` asynchrones AVANT de démarrer.

3. **`@supabase/ssr` doit être audité** : le package `@supabase/ssr` fournit des helpers qui accèdent aux cookies. Vérifier que la version installée supporte Next.js 16.

4. **Tests de régression des calculs sont NON NÉGOCIABLES** : `npm test` doit rester 100% vert. Les calculs LMNP, SCI-IS, HCSF, et scoring ne doivent subir aucune altération.

5. **Cache désactivé par défaut** : vérifier que les routes `/api/calculate` renvoient toujours des données fraîches (elles ne doivent PAS être mises en cache — vérifier les headers HTTP de réponse).

6. **Turbopack en dev** : si `next dev --turbo` devient le défaut, s'assurer que les alias TypeScript (`@/*`) sont correctement résolus.

---

## 6. Definition of Done

- [ ] `npm run type-check` : TypeScript strict, 0 erreur, 0 `any`
- [ ] `npm run lint` : ESLint v10, 0 erreur, 0 warning
- [ ] `npm test` : **suite Vitest complète verte** — aucune régression calculs
- [ ] `npm run build` : build Next.js 16 sans erreur ni warning de dépréciation
- [ ] `npm run test:e2e` : Playwright — parcours complets verts (auth, calcul, CRUD, PDF)
- [ ] Aucun `cookies()` synchrone dans le codebase (`grep` confirms 0 occurrence non-`await`ée)
- [ ] Aucun `forwardRef` dans le codebase (`grep` confirms 0 occurrence)
- [ ] Aucun `searchParams`/`params` accédé de façon synchrone dans les pages
- [ ] CI (`ci.yml`) verte sur `feature/upgrade-react-next`
- [ ] PR reviewée (architecture + tests) et mergée vers `master`

---

## Changelog

| Date       | Version | Description                                 | Auteur               |
| ---------- | ------- | ------------------------------------------- | -------------------- |
| 2026-02-26 | 1.0     | Création — étude d'impact montée de version | Winston (Architecte) |
