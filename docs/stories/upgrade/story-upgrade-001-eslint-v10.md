# Story UP-S01 : Migrer ESLint v8 vers v10 (Flat Config)

> **Priorité** : P1 (prérequis de l'Epic UPGRADE-01)
> **Effort** : S (1–2 jours)
> **Statut** : Approved
> **Type** : Dette Technique / Chore
> **Epic** : UPGRADE-01 — Montée de Version des Dépendances
> **Branche** : `chore/upgrade-eslint`
> **Dépendances** : Aucune

---

## 1. User Story

**En tant que** développeur
**Je veux** que le projet utilise ESLint v10 avec le format Flat Config
**Afin de** bénéficier du support long terme, des nouvelles règles de qualité, et d'un linting cohérent avec le code React/Next migré en UP-S03

---

## 2. Contexte

### 2.1 Situation actuelle

- ESLint version installée : `8.57.1`
- Configuration actuelle : `.eslintrc.json` (ancien format « legacy »)
- Ce format n'est **plus supporté** à partir d'ESLint v9+ par défaut

### 2.2 Breaking Changes ESLint v9/v10

- **Flat Config obligatoire** : le fichier `.eslintrc.json` n'est plus lu ; il faut créer `eslint.config.mjs`
- **Imports explicites** : les extends sous forme de chaînes (ex. `"eslint:recommended"`) ne fonctionnent plus — il faut importer le package (`import js from "@eslint/js"`)
- **FlatCompat** : pour les plugins qui n'ont pas encore migré, `@eslint/eslintrc` fournit un utilitaire de transition `FlatCompat`
- **Règles supprimées** : plusieurs règles natives ont été externalisées (vérifier la compatibilité de `eslint-config-next`)

### 2.3 Plugins actuels à vérifier

À identifier dans `.eslintrc.json` actuel. Typiquement pour un projet Next.js : `eslint-config-next`, règles `react-hooks`, `@typescript-eslint`. Vérifier leur compatibilité Flat Config avant de démarrer.

---

## 3. Critères d'acceptation

### 3.1 Suppression de l'ancien format

- [ ] Le fichier `.eslintrc.json` est **supprimé** du projet
- [ ] Aucune référence à `.eslintrc.*` ne subsiste (`.gitignore`, scripts, CI)

### 3.2 Nouveau fichier `eslint.config.mjs`

- [ ] Le fichier `eslint.config.mjs` est créé à la racine du projet
- [ ] La configuration importe explicitement les packages nécessaires (ex. `import js from "@eslint/js"`, `import tsPlugin from "@typescript-eslint/eslint-plugin"`)
- [ ] Les règles TypeScript strict sont maintenues (pas de régression permissive)
- [ ] La règle `no-any` (ou équivalent `@typescript-eslint/no-explicit-any`) est conservée et active
- [ ] `eslint-config-next` est intégré (via import direct ou `FlatCompat` si pas encore compatible)

### 3.3 Compatibilité outillage

- [ ] `npm run lint` (`next lint`) passe **sans erreur** sur l'intégralité du code source
- [ ] `npm run lint` passe **sans warning** (0 warning)
- [ ] La CI (`ci.yml`) exécute `next lint` et ne régresse pas
- [ ] Prettier est toujours compatible (pas de conflit de règles)

### 3.4 Mise à jour des dépendances

- [ ] `eslint` mis à jour vers `10.x` dans `package.json`
- [ ] `@eslint/js` ajouté en `devDependencies`
- [ ] `@eslint/eslintrc` ajouté si `FlatCompat` est nécessaire
- [ ] `eslint-config-next` mis à jour vers la version compatible ESLint v10
- [ ] `@typescript-eslint/*` mis à jour vers la version compatible ESLint v10

---

## 4. Spécifications techniques

### 4.1 Fichiers impactés

| Fichier                    | Modification                                                  |
| -------------------------- | ------------------------------------------------------------- |
| `.eslintrc.json`           | **Supprimé**                                                  |
| `eslint.config.mjs`        | **Créé** — nouvelle configuration Flat Config                 |
| `package.json`             | Mise à jour `eslint` + ajout `@eslint/js`, `@eslint/eslintrc` |
| `.gitignore`               | Vérifier qu'aucune règle ne référence `.eslintrc`             |
| `.github/workflows/ci.yml` | Vérifier que `next lint` est toujours appelé correctement     |

### 4.2 Structure cible du `eslint.config.mjs`

```js
import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import { FlatCompat } from '@eslint/eslintrc';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  js.configs.recommended,
  // Si eslint-config-next n'est pas encore compatible Flat Config nativement :
  ...compat.extends('next/core-web-vitals'),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { project: './tsconfig.json' },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      // Reproduire ici les règles de l'ancien .eslintrc.json
    },
  },
  {
    ignores: ['node_modules/**', '.next/**', 'dist/**', 'coverage/**', '*.config.js'],
  },
];
```

> ⚠️ **À adapter** : lire le `.eslintrc.json` actuel pour reproduire fidèlement toutes les règles et extends existantes.

### 4.3 Commandes de vérification

```bash
# Vérifier que ESLint trouve bien le nouveau fichier
npx eslint --print-config src/app/page.tsx

# Lint complet
npm run lint

# Type-check
npm run type-check
```

---

## 5. Points d'attention

- **`eslint-config-next` v15+** : vérifier si la version compatible Next.js 14 supporte le Flat Config nativement ou nécessite `FlatCompat`
- **Règles personnalisées** : inventorier toutes les règles de `.eslintrc.json` avant suppression — ne pas en perdre
- **Husky pre-commit** : si le hook lint est configuré dans `.husky/pre-commit`, vérifier qu'il continue de fonctionner après migration
- **`@typescript-eslint` v8** : la version 8+ de `@typescript-eslint` supporte nativement le Flat Config — cibler cette version

---

## 6. Definition of Done

- [ ] `npm run lint` : 0 erreur, 0 warning
- [ ] `npm run type-check` : TypeScript strict sans erreur
- [ ] `npm test` : 0 régression (suite Vitest verte)
- [ ] CI (`ci.yml`) verte sur la branche `chore/upgrade-eslint`
- [ ] PR reviewée et mergée vers `master`
- [ ] `.eslintrc.json` absent du repository

---

## Changelog

| Date       | Version | Description                                 | Auteur               |
| ---------- | ------- | ------------------------------------------- | -------------------- |
| 2026-02-26 | 1.0     | Création — étude d'impact montée de version | Winston (Architecte) |
