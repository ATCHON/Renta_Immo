# Audit Technique Complet - Renta Immo

**Date** : 2026-02-07
**Application** : Renta Immo - Calculateur de Rentabilite Immobiliere
**Stack** : Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, React Query, Supabase, Better Auth
**Auditeur** : James (Dev Agent)

---

## Suivi des Corrections

| Phase | Statut | Date | Auteur | Details |
|-------|--------|------|--------|---------|
| Phase 1 - Securite critique | TERMINEE | 2026-02-07 | James (Dev Agent) | 7/7 items corriges. Migration SQL a appliquer via `supabase db push`. |
| Phase 2 - Qualite de code | TERMINEE | 2026-02-07 | James (Dev Agent) | 9/9 items corriges. ESLint renforce, Prettier ajoute, 0 `any`, 0 `@ts-ignore`. |
| Phase 3 - Performance | A FAIRE | - | - | - |
| Phase 4 - Tests & DevOps | A FAIRE | - | - | - |
| Phase 5 - Scalabilite | A FAIRE | - | - | - |

---

## Resume Executif

L'application repose sur des fondations solides : TypeScript strict, validation Zod, bonne separation des responsabilites API/calculs/UI. Cependant, l'audit revele **3 failles critiques**, **8 problemes de severite haute** et de nombreuses ameliorations a apporter en matiere de performance, maintenabilite et scalabilite.

> **Mise a jour 2026-02-07** : Les 3 failles critiques et 4 problemes de severite haute (Phase 1) ont ete corriges. Le score Securite passe de 4/10 a **7/10**.
> **Mise a jour 2026-02-07 (Phase 2)** : Qualite de code renforcee. 21 `any` elimines, 3 `@ts-ignore` supprimes, schemas Zod stricts, Error Boundaries, hook factorise, logger centralise, ESLint+Prettier configures. Score Qualite passe de 6/10 a **8/10**, Architecture de 7/10 a **8/10**.

### Bilan Global

| Axe | Score | Apres Phase 1 | Apres Phase 2 | Commentaire |
|-----|-------|---------------|---------------|-------------|
| Securite | 4/10 | **7/10** | 7/10 | ~~Failles critiques~~ Corrigees. Reste: rate limiting, headers securite |
| Qualite de code | 6/10 | 6/10 | **8/10** | ~~`any` excessifs, duplication, ESLint minimal~~ Corriges. Reste: fichiers volumineux, key props |
| Architecture | 7/10 | 7/10 | **8/10** | ~~Pas d'Error Boundaries~~ Corrige. Reste: Suspense Boundaries, loading.tsx |
| Performance | 5/10 | 5/10 | Pas de memoisation, calculs synchrones bloquants |
| Scalabilite | 4/10 | 4/10 | Pas de rate limiting, pagination OFFSET, pas de cache HTTP |
| Tests | 3/10 | 3/10 | Couverture estimee < 30%, tests E2E minimaux |
| DevOps | 3/10 | 3/10 | CI/CD incomplet, pas de pre-commit hooks |
| Accessibilite | 7/10 | 7/10 | Bonnes bases (labels, aria, skip-to-content) |
| Documentation | 4/10 | 4/10 | README obsolete, pas de doc API |

### Synthese des Problemes

| Severite | Total | Corriges | Restants |
|----------|-------|----------|----------|
| Critique | 3 | 3 | **0** |
| Haute | 8 | 4 | **4** |
| Moyenne | 18 | 0 | **18** |
| Basse | 8 | 0 | **8** |
| **Total** | **37** | **7** | **30** |

---

## Table des Matieres

1. [Securite](#1-securite)
2. [Qualite de Code & Clean Code](#2-qualite-de-code--clean-code)
3. [Architecture & Performance](#3-architecture--performance)
4. [Scalabilite](#4-scalabilite)
5. [Tests](#5-tests)
6. [DevOps & CI/CD](#6-devops--cicd)
7. [Dependances](#7-dependances)
8. [Accessibilite](#8-accessibilite)
9. [Documentation](#9-documentation)
10. [Points Positifs](#10-points-positifs)
11. [Plan d'Action Priorise](#11-plan-daction-priorise)

---

## 1. Securite

### 1.1 ~~CRITIQUE~~ CORRIGE : Politiques RLS Supabase cassees apres migration Better Auth

> **CORRIGE le 2026-02-07** - Migration `supabase/migrations/20260207_fix_rls_policies.sql`
> - Suppression des anciennes policies cassees (`auth.uid()`)
> - RLS "deny all" pour les connexions non-service-role (defense en profondeur)
> - RLS active egalement sur les tables Better Auth (`user`, `session`, `account`, `verification`)
> - Index composite `idx_simulations_user_archived` ajoute (item 4.3 anticipe)
> - **Action requise** : Appliquer la migration via `supabase db push`

**Fichier original** : `supabase/migrations/20260204_better_auth_setup.sql` (lignes 65-71)

La migration activait RLS sur la table `simulations` mais ne definissait **aucune politique** compatible avec Better Auth. Les anciennes policies referencaient `auth.uid()` (Supabase Auth) qui n'existe plus.

**Approche retenue** : Plutot que de creer des policies RLS avec `current_setting()` (complexe a maintenir), l'architecture repose sur le service role key via `createAdminClient()` qui bypass le RLS. Le RLS sert uniquement de defense en profondeur : si la cle anon fuite, aucun acces n'est possible.

---

### 1.2 ~~CRITIQUE~~ CORRIGE : Injection SQL via ORDER BY non valide

> **CORRIGE le 2026-02-07** - `src/app/api/simulations/route.ts`
> Whitelist de 6 colonnes autorisees : `created_at`, `updated_at`, `name`, `is_favorite`, `rentabilite_nette`, `score_global`. Toute valeur non reconnue est remplacee par `created_at`.

---

### 1.3 ~~CRITIQUE~~ CORRIGE : Injection LIKE via recherche non echappee

> **CORRIGE le 2026-02-07** - `src/app/api/simulations/route.ts`
> Echappement des caracteres `%`, `_` et `\` via `replace(/[%_\\]/g, '\\$&')`. Les recherches vides/whitespace sont ignorees.

---

### 1.4 ~~HAUTE~~ CORRIGE : Middleware d'authentification desactive

> **CORRIGE le 2026-02-07** - `src/middleware.ts`
> - Redirection vers `/auth/login?callbackUrl=...` pour les utilisateurs non authentifies sur `/simulations/*`
> - Redirection vers `/` pour les utilisateurs authentifies sur les pages `/auth/*`

---

### 1.5 ~~HAUTE~~ CORRIGE : CORS trop permissif (wildcard par defaut)

> **CORRIGE le 2026-02-07** - `src/app/api/calculate/route.ts`
> Valeur par defaut changee de `['*']` a `['https://renta-immo.vercel.app']`. Toujours configurable via `ALLOWED_ORIGINS` env var.

---

### 1.6 ~~HAUTE~~ CORRIGE : Validation redirect insuffisante

> **CORRIGE le 2026-02-07** - `src/lib/auth/redirect.ts`
> - Whitelist de prefixes autorises (`/`, `/calculateur`, `/simulations`, `/auth`)
> - Blocage des path traversal (`..`), URLs protocol-relative (`//`), backslashes (`\`)
> - Blocage des encodages malveillants (`%2e`, `%2f`)

---

### 1.7 HAUTE : Pas de rate limiting sur les endpoints API

**Fichiers** : Tous les fichiers `src/app/api/*/route.ts`

Aucun endpoint n'a de rate limiting. `/api/calculate` est particulierement sensible car CPU-intensif.

**Correction** : Implementer un rate limiter (ex: `@upstash/ratelimit` ou middleware custom) :
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});
```

---

### 1.8 ~~HAUTE~~ CORRIGE : Overflow entier sur la pagination

> **CORRIGE le 2026-02-07** - `src/app/api/simulations/route.ts`
> Fonction `safeInt()` avec gestion NaN et bornes : `limit` [1, 100] (defaut 20), `offset` [0, 100000] (defaut 0).

---

### 1.9 MOYENNE : Pas de headers de securite (CSP, HSTS, X-Frame-Options)

**Fichier** : `next.config.mjs`

Aucun header de securite n'est configure.

**Correction** : Ajouter dans `next.config.mjs` :
```javascript
async headers() {
  return [{
    source: '/(.*)',
    headers: [
      { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; font-src 'self';" },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ],
  }];
}
```

---

### 1.10 MOYENNE : Donnees financieres en localStorage non chiffrees

**Fichier** : `src/stores/calculateur.store.ts`

Le store Zustand persiste en localStorage les donnees financieres (prix, revenus, montants de credit). En cas de XSS, ces donnees sont immediatement accessibles.

**Correction** : Envisager un chiffrement cote client ou limiter la persistence aux donnees non sensibles.

---

### 1.11 MOYENNE : Validation BETTER_AUTH_SECRET manquante

**Fichier** : `src/lib/auth.ts`

Seul `DATABASE_URL` est valide au demarrage. `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` ne sont pas verifies.

**Correction** : Valider toutes les variables d'environnement critiques avec Zod au demarrage.

---

### 1.12 BASSE : Politique de mot de passe absente

**Fichier** : `src/lib/auth.ts` (lignes 12-14)

Better Auth est configure avec `emailAndPassword: { enabled: true }` sans politique de complexite.

---

## 2. Qualite de Code & Clean Code

### 2.1 ~~HAUTE~~ CORRIGE : Usage excessif du type `any` (21+ instances)

> **CORRIGE le 2026-02-07**
> - Tous les `as any` ont été supprimés et remplacés par des types précis.
> - Utilisation de `unknown` et de type guards pour les blocs `catch`.
> - Typage complet des réponses API et des états du store.

---

### 2.2 ~~HAUTE~~ CORRIGE : 3 directives `@ts-ignore`

> **CORRIGE le 2026-02-07**
> - Les erreurs de types dans `rentabilite.ts` et `fiscalite.ts` ont été résolues en améliorant les interfaces.

---

### 2.3 ~~HAUTE~~ CORRIGE : Pas d'Error Boundary React

> **CORRIGE le 2026-02-07**
> - Ajout de fichiers `error.tsx` à la racine et dans les segments `/calculateur` et `/simulations`.
> - Fallback UI propre avec possibilité de réessai.

---

### 2.4 ~~MOYENNE~~ CORRIGE : Duplication de code significative

#### a) Pattern de reset de formulaire (6 fichiers identiques)

> **CORRIGE le 2026-02-07**
> - Création du hook `useScenarioFormReset.ts` pour centraliser la logique de réinitialisation des formulaires.

#### b) Handlers d'action simulations (4 handlers identiques)

> **CORRIGE le 2026-02-07**
> - Utilisation de `useSimulationMutations.ts` pour centraliser les appels API et la gestion des notifications.

#### c) Pattern d'erreur authentification

> **CORRIGE le 2026-02-07**
> - Unification de la gestion des erreurs via un helper partagé.

---

### 2.5 ~~MOYENNE~~ CORRIGE : Erreurs avalees silencieusement

> **CORRIGE le 2026-02-07**
> - Intégration de toasts (notifications UI) pour toutes les erreurs d'actions utilisateur.
> - Remplacement des `console.error` par des appels au nouveau module `logger`.

---

### 2.6 ~~MOYENNE~~ CORRIGE : 6 regles ESLint desactivees

> **CORRIGE le 2026-02-07**
> - Suppression des `eslint-disable` et correction des dépendances de hooks.

---

### 2.7 ~~MOYENNE~~ CORRIGE : Configuration ESLint minimale

> **CORRIGE le 2026-02-07**
> - Configuration enrichie avec `@typescript-eslint/recommended`.
> - Activation des erreurs pour les `any` explicites et les variables inutilisées.

---

### 2.8 ~~MOYENNE~~ CORRIGE : Validation `z.any()` dans les schemas API

> **CORRIGE le 2026-02-07**
> - Remplacement par les types réels importés de `src/types/`.

---

### 2.9 ~~MOYENNE~~ CORRIGE : 19 console.* en code de production

> **CORRIGE le 2026-02-07**
> - Implémentation du module `src/lib/logger.ts` qui filtre les logs selon l'environnement.

---

### 2.10 BASSE : Fichiers volumineux a refactorer

| Fichier | Taille estimee | Action |
|---------|----------------|--------|
| `src/stores/calculateur.store.ts` | ~400 lignes | Splitter en modules (navigation, scenarios, resultats) |
| `src/components/results/Dashboard.tsx` | ~300+ lignes | Extraire les sous-composants |
| `src/components/forms/StepStructure.tsx` | ~430 lignes | Separer type de structure, associes, HCSF |

---

### 2.11 BASSE : Key props avec index au lieu d'ID unique

| Fichier | Ligne | Probleme |
|---------|-------|----------|
| `src/lib/pdf/components/Table.tsx` | 70-89 | `key={rowIndex}` |
| `src/components/results/CashflowChart.tsx` | 54-58 | `key={cell-${index}}` |

---

## 3. Architecture & Performance

### 3.1 HAUTE : Calculs lourds synchrones bloquent l'event loop

**Fichier** : `src/app/api/calculate/route.ts` (ligne 161)

```typescript
const result = performCalculations(body);
```

`performCalculations` execute en synchrone : rentabilite, fiscalite, HCSF, projections 20 ans, tableaux d'amortissement.

**Impact** : Bloque les autres requetes, risque de timeout.

**Correction a moyen terme** : Deplacer vers un worker ou une queue (ex: BullMQ, Vercel Background Functions).

---

### 3.2 HAUTE : Generation PDF synchrone

**Fichier** : `src/app/api/pdf/route.ts`

Meme probleme que les calculs : la generation PDF bloque le handler de requete.

---

### 3.3 HAUTE : Pas de Suspense Boundaries strategiques

Aucun `<Suspense>` dans :
- Le Dashboard de resultats (composant le plus lourd)
- Les composants de graphiques
- Les pages de chargement de donnees

**Correction** : Wrapper les composants couteux dans `<Suspense fallback={<Skeleton />}>`.

---

### 3.4 HAUTE : Pas de memoisation sur les composants couteux

Les composants de graphiques (`CashflowChart`, `PatrimoineChart`) et tableaux (`ProjectionTable`, `AmortizationTable`) ne sont pas wrappés dans `React.memo()`.

**Correction** :
```typescript
export const CashflowChart = React.memo(({ data }: Props) => {
  return <ResponsiveContainer>...</ResponsiveContainer>;
});
```

---

### 3.5 MOYENNE : Pas de fichiers loading.tsx

Aucun fichier `loading.tsx` pour les segments de routes asynchrones. Pas de skeleton screens.

**Correction** : Creer `loading.tsx` pour `/calculateur`, `/simulations`, `/simulations/[id]`.

---

### 3.6 MOYENNE : Pas de fichiers error.tsx

Voir section 2.3.

---

### 3.7 MOYENNE : Etat redondant dans le store

**Fichier** : `src/stores/calculateur.store.ts`

`currentStep` et `status` existent a la fois au niveau global et par scenario, creant des risques de desynchronisation.

**Correction** : Deriver ces valeurs depuis `getActiveScenario()`.

---

### 3.8 MOYENNE : Configuration React Query sous-optimale

**Fichier** : `src/components/providers/QueryProvider.tsx` (lignes 14-23)

```typescript
staleTime: 60 * 1000,  // 1 min - trop court pour les simulations stables
retry: 1,              // Trop agressif
```

**Correction** :
```typescript
staleTime: 5 * 60 * 1000,  // 5 min
gcTime: 30 * 60 * 1000,    // 30 min
retry: (count, error) => count < 2 && error instanceof TypeError,
```

---

### 3.9 MOYENNE : Filtres simulations pas dans l'URL

**Fichier** : `src/app/simulations/page.tsx`

Les filtres (search, status, sort) sont en state local au lieu de searchParams. Cela casse la navigation arriere, le partage d'URL et les favoris.

**Correction** : Utiliser `useSearchParams()` de Next.js.

---

### 3.10 BASSE : Metadata SEO incomplete

**Fichier** : `src/app/layout.tsx`

Pas d'Open Graph, pas de schema.org, pas de robots.txt configure, pas de hreflang.

---

## 4. Scalabilite

### 4.1 HAUTE : Pas de rate limiting

Voir section 1.7.

---

### 4.2 MOYENNE : Pagination par OFFSET (non scalable)

**Fichier** : `src/app/api/simulations/route.ts`

```typescript
.range(offset, offset + limit - 1)
```

OFFSET scanne toutes les lignes precedentes. Page 100 = 2000 lignes scannees.

**Correction** : Passer a la pagination par curseur :
```typescript
if (cursor) {
    query = query.lt('created_at', cursor);
}
query = query.limit(20).order('created_at', { ascending: false });
```

---

### 4.3 MOYENNE : Index de base de donnees manquants

**Fichier** : `supabase/migrations/20260204_create_simulations_table.sql`

Index existants : `user_id`, `created_at`. Manquants :
```sql
CREATE INDEX idx_simulations_user_archived
  ON public.simulations(user_id, is_archived, created_at DESC);

CREATE INDEX idx_simulations_user_favorite
  ON public.simulations(user_id, is_favorite);
```

---

### 4.4 MOYENNE : Pas de cache HTTP sur les reponses API

Les reponses ne contiennent aucun header `Cache-Control`, `ETag` ou `Last-Modified`.

**Correction** : Ajouter des headers de cache pour les endpoints de lecture :
```typescript
return NextResponse.json(data, {
  headers: { 'Cache-Control': 'private, max-age=300' }
});
```

---

### 4.5 MOYENNE : SELECT * au lieu de colonnes specifiques

**Fichier** : `src/app/api/simulations/route.ts` (ligne 38)

```typescript
.select('*', { count: 'exact' })
```

En listing, les colonnes `form_data` et `resultats` (JSONB volumineux) sont inutiles.

**Correction** :
```typescript
.select('id, name, created_at, updated_at, score_global, rentabilite_brute, cashflow_mensuel, is_favorite, is_archived', { count: 'exact' })
```

---

## 5. Tests

### 5.1 HAUTE : Couverture de tests insuffisante

**Couverture estimee** : < 30%
**Fichiers de test** : ~10 (pour ~3000 lignes de code source)

**Manquent** :
- Tests unitaires des handlers API (CRUD simulations)
- Tests des mutations Zustand store
- Tests des schemas de validation Zod
- Tests des fonctions utilitaires (formatCurrency, etc.)
- Tests des hooks personnalises (useSimulations, useCalculateur)

---

### 5.2 MOYENNE : Tests E2E limites

Seulement 2 fichiers E2E Playwright :
- `multi-scenarios.spec.ts`
- `simulation-complete.spec.ts`

**Manquent** :
- Flux d'authentification (signup, login, logout, Google OAuth)
- CRUD simulations (creer, renommer, archiver, supprimer)
- Generation PDF
- Filtrage et pagination
- Cas d'erreur et validations

---

### 5.3 MOYENNE : Configuration Vitest incorrecte

**Fichier** : `vitest.config.ts`

```typescript
environment: 'node',  // Devrait etre 'jsdom' pour les tests de composants React
```

Manquent aussi : `setupFiles`, `testTimeout`, seuils de couverture.

---

### 5.4 MOYENNE : Configuration Playwright incomplete

**Fichier** : `playwright.config.ts`

- `webServer` est commente (lignes 35-40)
- Seul Chromium est configure
- `baseURL` en dur au lieu de variable d'environnement

---

## 6. DevOps & CI/CD

### 6.1 HAUTE : Pipeline CI/CD incomplet

**Fichier** : `.github/workflows/sonarcloud.yml`

- SonarCloud a des `projectKey` et `organization` vides
- Pas de workflow de build/test sur PR
- Pas de validation de deploiement

**Correction** : Creer `.github/workflows/ci.yml` :
```yaml
name: CI
on: [pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:coverage
      - run: npm run build
```

---

### 6.2 HAUTE : Pas de pre-commit hooks

Ni Husky ni lint-staged ne sont configures.

**Correction** :
```bash
npx husky-init && npm install
npx husky add .husky/pre-commit "npx lint-staged"
```

Ajouter dans `package.json` :
```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

---

### 6.3 MOYENNE : Scripts package.json incomplets

**Manquent** :
```json
{
  "format": "prettier --write src",
  "format:check": "prettier --check src",
  "test:watch": "vitest",
  "analyze": "ANALYZE=true next build",
  "db:push": "supabase db push",
  "db:pull": "supabase db pull",
  "prepare": "husky install"
}
```

---

### 6.4 MOYENNE : Pas de vercel.json

Aucune configuration Vercel explicite pour le build et les variables d'environnement.

---

### 6.5 BASSE : Pas de Prettier configure

Aucun fichier `.prettierrc` dans le projet.

---

## 7. Dependances

### 7.1 MOYENNE : @react-pdf/renderer - impact bundle

**Fichier** : `package.json` (ligne 18)

Cette librairie apporte 50+ dependances transitives (crypto-js, fontkit, yoga-layout, babel-runtime). Deja partiellement mitige via `serverComponentsExternalPackages`.

---

### 7.2 MOYENNE : DevDependencies manquantes

| Package | Usage |
|---------|-------|
| `prettier` | Formatage de code |
| `@testing-library/react` | Tests de composants React |
| `@testing-library/jest-dom` | Matchers DOM |
| `husky` | Pre-commit hooks |
| `lint-staged` | Lint sur fichiers modifies |

---

### 7.3 BASSE : `pg` dans dependencies au lieu de devDependencies

Le package `pg` est uniquement utilise cote serveur dans Better Auth. Il pourrait etre en devDependencies.

---

### 7.4 BASSE : Version eslint-config-next desalignee

`eslint-config-next@14.2.21` ne correspond pas a `next@14.2.35`.

---

## 8. Accessibilite

### 8.1 Points positifs

- Labels et `htmlFor` sur les formulaires
- `aria-invalid` et `aria-describedby` pour les erreurs
- Lien "skip-to-content" dans le layout
- `aria-label` et `aria-expanded` sur le menu mobile

### 8.2 MOYENNE : Pas de `<fieldset>` / `<legend>` dans les formulaires multi-etapes

Les composants Step* n'utilisent pas de groupement semantique.

### 8.3 MOYENNE : Icones decoratives sans `aria-hidden`

Les icones Lucide dans le Header ne sont pas marquees comme decoratives.

### 8.4 BASSE : Pagination sans etat `aria-disabled`

`src/components/ui/Pagination.tsx` manque l'attribut `aria-disabled` sur les boutons inactifs.

---

## 9. Documentation

### 9.1 HAUTE : README obsolete

Le README reference encore n8n webhook alors que l'app utilise des API routes Next.js natives. Pas de documentation API.

### 9.2 MOYENNE : Pas de documentation d'architecture

Pas de diagramme de flux, pas de documentation du schema de base, pas de guide de contribution.

### 9.3 BASSE : Pas de CHANGELOG

---

## 10. Points Positifs

L'application a de solides fondations qu'il convient de souligner :

- **TypeScript strict** : `strict: true` dans tsconfig.json
- **Validation Zod** : Schemas de validation robustes pour les formulaires
- **Separation des responsabilites** : Calculs dans `src/server/`, API dans `src/app/api/`, UI dans `src/components/`
- **Store Zustand bien structure** : Persistence, hydration, valeurs par defaut claires
- **React Query** : Integration propre pour le data fetching
- **Pas de XSS** : Aucun usage de `dangerouslySetInnerHTML`
- **Authentification API** : Toutes les routes API verifient la session
- **Service Role Key isolee** : Uniquement cote serveur
- **Path aliases** : Configuration `@/` propre
- **Hooks personnalises** : Bonne extraction de logique (useSimulations, useCalculateur, useDownloadPdf)
- **Accessibilite de base** : Skip-to-content, aria-labels, form labels
- **Git propre** : .gitignore complet, pas de secrets dans le tracking

---

## 11. Plan d'Action Priorise

### Phase 1 : Securite critique - TERMINEE (2026-02-07)

| # | Action | Fichier(s) | Statut |
|---|--------|-----------|--------|
| 1 | ~~Implementer les politiques RLS pour Better Auth~~ | `supabase/migrations/20260207_fix_rls_policies.sql` | FAIT |
| 2 | ~~Whitelister le parametre `sort`~~ | `src/app/api/simulations/route.ts` | FAIT |
| 3 | ~~Echapper les wildcards LIKE dans la recherche~~ | `src/app/api/simulations/route.ts` | FAIT |
| 4 | ~~Reactiver le middleware d'authentification~~ | `src/middleware.ts` | FAIT |
| 5 | ~~Restreindre les origines CORS~~ | `src/app/api/calculate/route.ts` | FAIT |
| 6 | ~~Valider les entiers de pagination~~ | `src/app/api/simulations/route.ts` | FAIT |
| 7 | ~~Securiser la validation de redirect~~ | `src/lib/auth/redirect.ts` | FAIT |

> **Note** : La migration SQL `20260207_fix_rls_policies.sql` doit etre appliquee sur Supabase via `supabase db push` ou le dashboard.

### Phase 2 : Qualite de code & type safety - TERMINEE (2026-02-07)

| # | Action | Effort | Statut |
|---|--------|--------|--------|
| 8 | Remplacer les 21+ usages de `any` par des types concrets | 4h | FAIT |
| 9 | Supprimer les 3 `@ts-ignore` | 1h | FAIT |
| 10 | Remplacer `z.any()` par des schemas stricts dans les API simulations | 2h | FAIT |
| 11 | Creer les Error Boundaries (`error.tsx`) | 2h | FAIT |
| 12 | Extraire le hook `useFormReset()` | 1h | FAIT |
| 13 | Factoriser les handlers de simulation | 1h | FAIT |
| 14 | Renforcer la config ESLint | 30min | FAIT |
| 15 | Ajouter un module logger centralise | 1h | FAIT |
| 16 | Ajouter Prettier + `.prettierrc` | 30min | FAIT |

### Phase 3 : Performance & architecture (1-2 semaines)

| # | Action | Effort |
|---|--------|--------|
| 17 | Ajouter `React.memo()` aux composants de graphiques/tableaux | 2h |
| 18 | Creer des fichiers `loading.tsx` avec skeletons | 3h |
| 19 | Ajouter des Suspense Boundaries strategiques | 2h |
| 20 | Selectionner uniquement les colonnes necessaires dans le listing simulations | 30min |
| 21 | Migrer les filtres vers les URL search params | 3h |
| 22 | Optimiser la configuration React Query | 1h |
| 23 | Ajouter les headers de securite HTTP | 1h |
| 24 | Implementer le rate limiting | 4h |

### Phase 4 : Tests & DevOps (2-3 semaines)

| # | Action | Effort |
|---|--------|--------|
| 25 | Creer le workflow CI/CD GitHub Actions | 3h |
| 26 | Installer Husky + lint-staged | 1h |
| 27 | Ecrire les tests unitaires API routes | 8h |
| 28 | Ecrire les tests unitaires store/hooks | 6h |
| 29 | Etendre les tests E2E (auth, CRUD, PDF, filtres) | 8h |
| 30 | Corriger la config Vitest (jsdom, setupFiles) | 1h |
| 31 | Ajouter les seuils de couverture (>70%) | 30min |

### Phase 5 : Scalabilite & optimisations (quand necessaire)

| # | Action | Effort |
|---|--------|--------|
| 32 | Migrer vers la pagination par curseur | 4h |
| 33 | Ajouter les index composites Supabase | 1h |
| 34 | Ajouter les headers de cache HTTP | 2h |
| 35 | Deplacer les calculs lourds vers un worker/background job | 8h |
| 36 | Deplacer la generation PDF en arriere-plan | 4h |
| 37 | Mettre a jour le README et creer la doc d'architecture | 4h |

---

**Estimation totale** : ~80-100 heures de travail reparties sur 6-8 semaines.

Les phases 1 et 2 sont **imperatives avant la mise en production**. Les phases 3-5 ameliorent progressivement la qualite et la scalabilite.

---

## Historique des Corrections

| Date | Phase | Items corriges | Fichiers modifies | Auteur |
|------|-------|----------------|-------------------|--------|
| 2026-02-07 | Phase 1 | 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.8 | `supabase/migrations/20260207_fix_rls_policies.sql` (nouveau), `src/app/api/simulations/route.ts`, `src/middleware.ts`, `src/app/api/calculate/route.ts`, `src/lib/auth/redirect.ts` | James (Dev Agent) |
