# Story UP-S01 : Migrer ESLint v8 vers v10 (Flat Config)

> **Priorité** : P1 (prérequis de l'Epic UPGRADE-01)
> **Effort** : S (1–2 jours)
> **Statut** : Ready for Review
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

- [x] Le fichier `.eslintrc.json` est **supprimé** du projet
- [x] Aucune référence à `.eslintrc.*` ne subsiste (`.gitignore`, scripts, CI)

### 3.2 Nouveau fichier `eslint.config.mjs`

- [x] Le fichier `eslint.config.mjs` est créé à la racine du projet
- [x] La configuration importe explicitement les packages nécessaires (`typescript-eslint`, `eslint-config-next/core-web-vitals`)
- [x] Les règles TypeScript strict sont maintenues (pas de régression permissive)
- [x] La règle `no-any` (ou équivalent `@typescript-eslint/no-explicit-any`) est conservée et active
- [x] `eslint-config-next` est intégré (import direct natif Flat Config — pas besoin de FlatCompat)

### 3.3 Compatibilité outillage

- [x] `npm run lint` passe **sans erreur** sur l'intégralité du code source
- [x] `npm run lint` passe **sans warning** (0 warning)
- [x] La CI (`ci.yml`) exécute `npm run lint` et ne régresse pas
- [x] Prettier est toujours compatible (pas de conflit de règles)

### 3.4 Mise à jour des dépendances

- [x] `eslint` mis à jour vers `9.x` dans `package.json` (v10 incompatible avec eslint-plugin-react — voir notes)
- [x] `@eslint/js` ajouté en `devDependencies`
- [x] `@eslint/eslintrc` ajouté (FlatCompat disponible si besoin futur)
- [x] `eslint-config-next` mis à jour vers `16.1.6` (compatible ESLint v9, Flat Config natif)
- [x] `typescript-eslint@8.56.1` ajouté (remplace @typescript-eslint/\* séparés)

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

- [x] `npm run lint` : 0 erreur, 0 warning
- [x] `npm run type-check` : TypeScript strict sans erreur
- [x] `npm test` : 0 régression (523 TU + 35 TI verts — 1 suite pré-existante ignorée)
- [ ] CI (`ci.yml`) verte sur la branche `chore/upgrade-eslint`
- [ ] PR reviewée et mergée vers `master`
- [x] `.eslintrc.json` absent du repository

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Completion Notes

- **ESLint v9 au lieu de v10** : ESLint v10 (10.0.2) est incompatible avec `eslint-plugin-react@7.37.5` (API `context.getFilename()` supprimée). Cible réelle : ESLint v9.39.3 qui satisfait le peer dep `>=9.0.0` de `eslint-config-next@16`.
- **`next lint` remplacé** : Next.js 14 ne reconnaît pas le Flat Config ESLint v9/v10. Le script `lint` passe de `next lint` à `eslint . --max-warnings 0`.
- **Règles React Compiler désactivées** : `eslint-plugin-react-hooks@7` (inclus dans `eslint-config-next@16`) introduit des règles React Compiler (`set-state-in-effect`, `immutability`, `static-components`, `incompatible-library`) qui signalent des patterns React 18 valides. Ces règles sont désactivées — à réévaluer lors de UP-S03 si React Compiler est activé.
- **`tests/` et `supabase-docker/` exclus** : `next lint` ne lintait pas ces répertoires. Comportement préservé.
- **Régression pré-existante** : `useDownloadPdf.test.ts` échoue sur `@testing-library/dom` manquant — constaté sur `master` avant la migration, hors scope.

### File List

- `.eslintrc.json` — supprimé
- `eslint.config.mjs` — créé
- `package.json` — mis à jour (eslint 9, eslint-config-next 16, typescript-eslint 8, @eslint/js, @eslint/eslintrc)
- `package-lock.json` — mis à jour
- `src/components/forms/StepFinancement.tsx` — suppression directive eslint-disable obsolète

### Change Log

| Date       | Version | Description                                 | Auteur               |
| ---------- | ------- | ------------------------------------------- | -------------------- |
| 2026-02-26 | 1.0     | Création — étude d'impact montée de version | Winston (Architecte) |
| 2026-02-26 | 1.1     | Implémentation migration Flat Config        | James (Dev)          |

---

## Changelog

| Date       | Version | Description                                 | Auteur               |
| ---------- | ------- | ------------------------------------------- | -------------------- |
| 2026-02-26 | 1.0     | Création — étude d'impact montée de version | Winston (Architecte) |
