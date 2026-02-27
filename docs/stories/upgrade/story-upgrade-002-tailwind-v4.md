# Story UP-S02 : Migrer Tailwind CSS v3 vers v4 (nouveau moteur CSS)

> **Priorité** : P2
> **Effort** : M (2–3 jours)
> **Statut** : Ready for Review
> **Type** : Dette Technique / Chore
> **Epic** : UPGRADE-01 — Montée de Version des Dépendances
> **Branche** : `chore/upgrade-tailwind`
> **Dépendances** : UP-S01 (ESLint v10 mergé)

---

## 1. User Story

**En tant que** développeur frontend
**Je veux** que Tailwind CSS soit en version 4 avec son nouveau moteur Lightning CSS
**Afin de** bénéficier de builds CSS plus rapides, d'un format de configuration moderne, et d'un support long terme de la bibliothèque

---

## 2. Contexte

### 2.1 Situation actuelle

- Tailwind CSS version installée : `3.4.19`
- Configuration actuelle : `tailwind.config.ts` (format JS/TS avec `content`, `theme.extend`, `plugins`)
- PostCSS : `postcss.config.mjs` avec `tailwindcss` plugin standard

### 2.2 Breaking Changes Tailwind v4

- **Nouveau moteur** : Tailwind v4 utilise Lightning CSS (Rust) à la place du moteur JS — **pas de `tailwind.config.js/ts` nécessaire**
- **Configuration CSS-first** : le fichier de configuration migre vers des directives CSS `@theme {}` dans le fichier CSS principal (`globals.css`)
- **Nouveau plugin PostCSS** : le package PostCSS change (`@tailwindcss/postcss` remplace l'ancien plugin)
- **Nouvelles directives CSS** : `@import "tailwindcss"` remplace les trois directives `@tailwind base/components/utilities`
- **Classes renommées/retirées** : certaines classes obsolètes de v3 ont été supprimées ou renommées — à auditer

### 2.3 Outils de migration officiels

Tailwind fournit un outil de migration automatique :

```bash
npx @tailwindcss/upgrade@next
```

Cet outil :

- Convertit `tailwind.config.ts` → directives `@theme` dans `globals.css`
- Met à jour les imports PostCSS
- Tente de migrer les classes obsolètes dans les fichiers `.tsx`

---

## 3. Critères d'acceptation

### 3.1 Migration de la configuration

- [x] `tailwind.config.ts` est **supprimé**
- [x] `src/app/globals.css` contient les directives `@import "tailwindcss"` et `@theme {}` avec tous les tokens design du projet
- [x] `postcss.config.mjs` est mis à jour pour utiliser `@tailwindcss/postcss`
- [x] Aucune référence à l'ancien `tailwindcss` plugin PostCSS ne subsiste

### 3.2 Intégrité visuelle

- [x] `npm run build` produit un build sans erreur CSS
- [ ] Toutes les pages s'affichent correctement (vérification visuelle E2E)
- [x] Le design premium (couleurs personnalisées, variants) est préservé dans `@theme`
- [x] Aucun style cassé au build sur les composants critiques

### 3.3 Tests E2E visuels

- [ ] `npm run test:e2e` : la suite Playwright passe sans régression
- [ ] Vérification manuelle sur les navigateurs configurés

### 3.4 Mise à jour des dépendances

- [x] `tailwindcss@4.2.1` installé
- [x] `@tailwindcss/postcss@4.2.1` ajouté en devDependencies
- [x] Ancien plugin PostCSS `tailwindcss` retiré de `postcss.config.mjs`
- [x] `autoprefixer` retiré (Lightning CSS gère le prefixing nativement)

---

## 4. Spécifications techniques

### 4.1 Fichiers impactés

| Fichier                   | Modification                                                    |
| ------------------------- | --------------------------------------------------------------- |
| `tailwind.config.ts`      | **Supprimé** — configuration migrée vers CSS                    |
| `src/app/globals.css`     | Migration vers `@import "tailwindcss"` + `@theme {}`            |
| `postcss.config.mjs`      | Remplacement du plugin `tailwindcss` par `@tailwindcss/postcss` |
| `package.json`            | Mise à jour `tailwindcss` v4, ajout `@tailwindcss/postcss`      |
| `src/components/**/*.tsx` | Potentielles classes renommées à corriger                       |

### 4.2 Procédure de migration recommandée

```bash
# 1. Installer l'outil de migration officiel
npx @tailwindcss/upgrade@next

# 2. Vérifier le résultat de la migration automatique
git diff

# 3. Corriger manuellement les tokens design non migrés
# (ouvrir src/app/globals.css et vérifier la section @theme)

# 4. Mettre à jour package.json manuellement si nécessaire
npm install tailwindcss@4 @tailwindcss/postcss@next

# 5. Vérifier le build
npm run build

# 6. Lancer les tests E2E
npm run test:e2e
```

### 4.3 Structure cible `globals.css`

```css
@import 'tailwindcss';

@theme {
  /* Reproduire ici les tokens de tailwind.config.ts > theme.extend */
  --color-primary: oklch(/* valeur */);
  --color-premium-gold: oklch(/* valeur */);
  /* ... tous les tokens custom du projet */

  --font-sans: 'Inter', sans-serif;
  /* ... */
}

/* Les styles globaux existants restent inchangés */
```

### 4.4 Structure cible `postcss.config.mjs`

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
    // autoprefixer: {} — supprimer si Lightning CSS suffit
  },
};
```

### 4.5 Tokens design à préserver impérativement

Avant suppression de `tailwind.config.ts`, **inventorier et documenter** :

- Toutes les couleurs dans `theme.extend.colors` (palette premium, couleurs métier)
- Les polices personnalisées (`theme.extend.fontFamily`)
- Les breakpoints custom (`theme.extend.screens`)
- Les animations/transitions custom
- Les plugins Tailwind utilisés (`plugins: [...]`)

---

## 5. Points d'attention

- **Le codemod automatique est imparfait** : il ne migre pas toujours les classes renommées dans les `.tsx` — prévoir un audit manuel post-migration
- **Classes supprimées en v4** : `flex-shrink`, `overflow-ellipsis`, etc. ont été renommées — vérifier la liste officielle de migration Tailwind v4
- **Shadcn/ui ou composants UI tiers** : si le projet utilise des bibliothèques UI basées sur Tailwind, vérifier leur compatibilité v4
- **`@apply` dans CSS** : les directives `@apply` dans `globals.css` ou composants CSS Modules continuent de fonctionner mais peuvent nécessiter des ajustements
- **Dark mode** : la configuration du dark mode change légèrement en v4 — à vérifier si utilisé

---

## 6. Definition of Done

- [x] `npm run build` : 0 erreur, 0 warning CSS
- [x] `npm run lint` : 0 erreur (ESLint v9 de UP-S01)
- [x] `npm run type-check` : TypeScript strict sans erreur
- [ ] `npm run test:e2e` : suite Playwright verte (0 régression)
- [ ] Vérification visuelle manuelle des pages principales
- [x] `tailwind.config.ts` absent du repository
- [ ] CI (`ci.yml`) verte sur `chore/upgrade-tailwind`
- [ ] PR reviewée et mergée vers `master`

---

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Completion Notes

- **Tailwind v4.2.1** installé avec `@tailwindcss/postcss@4.2.1`
- **`eslint-config-next` Flat Config natif** : `eslint-config-next@16.1.6` exporte un tableau de configs Flat Config — aucune FlatCompat requise
- **Namespace transition-duration** : En Tailwind v4, les durées custom doivent utiliser `--transition-duration-{name}` (et non `--duration-{name}`) pour générer les classes `duration-{name}`
- **autoprefixer supprimé** : Lightning CSS (moteur de Tailwind v4) gère le prefixing nativement
- **Content auto-detection** : Tailwind v4 scanne automatiquement tous les fichiers — le tableau `content` de `tailwind.config.ts` n'est plus nécessaire

### File List

- `tailwind.config.ts` — supprimé
- `src/app/globals.css` — migré vers `@import "tailwindcss"` + `@theme {}`
- `postcss.config.mjs` — remplacé `tailwindcss` par `@tailwindcss/postcss`
- `package.json` — ajout tailwindcss@4, @tailwindcss/postcss, suppression autoprefixer
- `package-lock.json` — mis à jour

### Change Log

| Date       | Version | Description                                 | Auteur               |
| ---------- | ------- | ------------------------------------------- | -------------------- |
| 2026-02-26 | 1.0     | Création — étude d'impact montée de version | Winston (Architecte) |
| 2026-02-26 | 1.1     | Implémentation migration Tailwind CSS v4    | James (Dev)          |

---

## Changelog

| Date       | Version | Description                                 | Auteur               |
| ---------- | ------- | ------------------------------------------- | -------------------- |
| 2026-02-26 | 1.0     | Création — étude d'impact montée de version | Winston (Architecte) |
