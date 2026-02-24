# Étude d'impact : Montée de version des dépendances principales

**Date** : Février 2026
**Périmètre** : Projet Renta_Immo
**Objectif** : Analyser l'impact d'une migration des dépendances majeures actuelles vers leurs versions stables de dernière génération.

---

## 1. État des lieux des dépendances majeures

Suite à l'analyse via `npm outdated`, plusieurs composants essentiels de notre stack disposent de nouvelles versions majeures ou significatives :

| Dépendance       | Version Actuelle | Version Cible (Latest) |     Type de saut     |
| :--------------- | :--------------: | :--------------------: | :------------------: |
| **Next.js**      |    `14.2.35`     |        `16.1.6`        | Majeur (+2 versions) |
| **React**        |     `18.3.1`     |        `19.2.4`        |        Majeur        |
| **React DOM**    |     `18.3.1`     |        `19.2.4`        |        Majeur        |
| **Tailwind CSS** |     `3.4.19`     |        `4.2.1`         |        Majeur        |
| **ESLint**       |     `8.57.1`     |        `10.0.2`        | Majeur (+2 versions) |
| **Supabase JS**  |     `2.94.1`     |        `2.97.0`        |        Mineur        |

## 2. Analyse d'impact détaillée par technologie

### 2.1. React 19 & Next.js 16

_C'est le changement le plus structurant pour l'application._

**Impact global : ÉLEVÉ**

**Principaux Breaking Changes / Nouveautés :**

- **React 19** :
  - **Nouveaux hooks natifs** : `useOptimistic` (Mise à jour d'UI optimiste avec retour automatique à l'état initial en cas d'erreur de mutation), `useActionState` et `useFormStatus` (gestion automatique des états de formulaires asynchrones `pending` et des erreurs), `use` (résolution de promesses dans le rendu).
  - **Refs en tant que prop** : Plus besoin de `forwardRef` pour les composants fonctionnels, `ref` passe en prop directe (`function MyInput({ref}) {...}`).
  - **Codemods officiels** : Ex. `npx codemod@latest react/19/replace-string-ref` pour remplacer les String Refs définitivement retirées.
- **Next.js 16** (depuis la v14) :
  - **APIs asynchrones** : De nombreuses APIs liées aux requêtes (`params`, `searchParams`, `cookies()`, `headers()`) sont devenues **strictement asynchrones** et doivent être `await`ées. (Next 15 offrait une compatibilité temporaire, Next 16 la supprime).
  - **Aide à la migration (Types)** : Il est recommandé de typer les pages avec le helper dynamique généré `PageProps` (ex: `PageProps<'/blog/[slug]'>`) pour un accès type-safe aux params asynchrones.
  - **React Compiler** : Next 15+ intègre le _React Compiler_ par défaut (ou en option forte), rendant souvent obsolètes les `useMemo` et `useCallback` manuels.
  - **Comportement de Cache** (App Router) : Les requêtes `fetch` ne sont plus mises en cache au niveau du CDN par défaut depuis Next 15.
  - **Turbopack** : Devient le bundler par défaut (stabilité confirmée).

**Risques pour Renta_Immo :**

- Casse immédiate du routage ou de la récupération de données aux endroits où `searchParams`/`params` ou les utilitaires de session (ex. Supabase SSR `cookies()`) sont utilisés de manière synchrone.
- Nos tests e2e (Playwright) et tests unitaires (Vitest/testing-library) devront valider rigoureusement le nouveau système de cache par défaut sur toutes les pages de Simulation (profil).
- Opportunité majeure de refactoring sur les formulaires de calculs (HCSF, variables d'emprunt) en tirant parti de `useActionState` pour gérer les états de chargement (loading) sans la lourdeur d'états manuels.

### 2.2. Tailwind CSS v4

**Impact global : MODÉRÉ à ÉLEVÉ**

**Principaux Breaking Changes :**

- Tailwind v4 est une refonte majeure conçue pour la rapidité (nouveau moteur Rust/Lightning CSS).
- Changement du système de configuration : Le fichier `tailwind.config.js` classique est remplacé par une configuration orientée CSS (via `@theme` dans le CSS principal).
- Changement dans la façon dont les directives `@tailwind` sont structurées (remplacées par de nouveaux imports CSS standards).
- Certaines classes obsolètes pourraient nécessiter une migration.

**Risques pour Renta_Immo :**

- Nécessite de réécrire le fichier de configuration `tailwind.config.ts` (qui gère potentiellement nos design tokens spécifiques pour le rendu "premium") au nouveau format CSS.
- Vite/Next plugin setup à revoir.

### 2.3. ESLint v10 (depuis v8)

**Impact global : MODÉRÉ**

**Principaux Breaking Changes :**

- Passage obligatoire au **Flat Config format** (`eslint.config.js` ou équivalent) depuis ESLint v9. L'ancien format `.eslintrc.json` n'est plus supporté et ne sera plus lu par défaut.
- **Fin des références "Strings"** : L'utilisation de configurations héritées via des chaînes de caractères (ex: `"extends": ["eslint:recommended"]`) dans les tableaux d'objets génère une erreur formelle. Il faut dorénavant importer explicitement le package (`import js from "@eslint/js"`) et utiliser `js.configs.recommended`.
- **Outil de rétro-compatibilité** : Pour faciliter la transition des anciens plugins qui n'ont pas encore adopté le Flat Config, un utilitaire explicite appelé `FlatCompat` est disponible via le module officiel `@eslint/eslintrc` pour traduire l'ancien format vers le nouveau (via `...compat.extends('vieux-plugin-name')`).
- De nombreuses règles natives obsolètes ont été supprimées ou externalisées.
- Obligation de vérifier la compatibilité de tous nos plugins en cours (`eslint-config-next`, Vitest, etc.) avec la v10 et le Flat Config.

### 2.4. Supabase JS & Autres utilitaires

- **Supabase JS (2.94 vers 2.97)** : Impact FAIBLE. Mises à jour mineures, potentiellement des améliorations de typage ou de performance, pas de breaking changes attendus.
- **Zustand, React-hook-form, Zod** : Versions mineures/patches. Impact TRÈS FAIBLE assuré par le typage strict en place.

---

## 3. Stratégie de Migration Recommandée

La migration ne doit pas être faite en mode "Big Bang" en raison de l'architecture fullstack complexe et des règles de calcul critiques.

### 📍 Phase 1 : Outillage et Qualité (Impact isolé)

1.  Créer une branche `chore/upgrade-eslint`.
2.  Migrer vers ESLint 10 et le format _Flat Config_.
3.  S'assurer que `next lint` passe et vérifier l'intégration avec `prettier`.

### 📍 Phase 2 : Le Style (Frontend UI isolé)

1.  Créer une branche `chore/upgrade-tailwind`.
2.  Migrer Tailwind CSS v3 vers v4.
3.  Transcrire `tailwind.config.ts` vers le nouveau format CSS `@theme`.
4.  Lancer la suite complète de tests Playwright E2E UI pour détecter d'éventuels décalages visuels ou classes non résolues.

### 📍 Phase 3 : Le Cœur de l'App (React 19 & Next.js 16) - Le GROS MORCEAU

Cette phase requiert la validation rigoureuse des TDD et des règles fonctionnelles :

1.  Créer une branche `feature/upgrade-react-next`.
2.  Mettre à jour `react`, `react-dom`, `@types/react`, `next`, et `eslint-config-next`.
3.  **Audit du code** (via l'IDE ou script) pour traquer et modifier :
    - Les accès synchrones aux `params` / `searchParams` / APIs Next.js (cookies, headers).
    - Les `forwardRef` obsolètes (simplification).
4.  **Tests unitaires (Vitest)** : Exécution de TOUTE la suite de calcul (`npm run test`), c'est critique pour Renta_Immo.
5.  **Tests E2E (Playwright)** : Vérification des formulaires et des pages de score.

## 4. Conclusion

La stack actuelle de Renta_Immo commence à accuser un retard de génération (React 18 vs 19, Next 14 vs 16, Tailwind 3 vs 4).
La migration est inévitable à moyen terme pour des raisons de sécurité, de performance (React Compiler, Tailwind v4) et de support de l'écosystème.

Toutefois, en raison de la complexité des calculs fiscaux (LMNP, SCI) et des règles HCSF, **cette montée de version doit être traitée comme une Feature majeure (Epic)** à part entière, en suivant strictement la directive de couverture de tests détaillée dans `claude.md`.
