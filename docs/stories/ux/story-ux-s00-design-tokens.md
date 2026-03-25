# Story UX-S00 : Fondations Design System « Verdant Simulator »

> **Priorité** : P0 (prérequis de toutes les autres phases)
> **Effort** : M (2–3 jours)
> **Statut** : Ready for Dev
> **Type** : Chore / Design System
> **Epic** : UX Migration — Phase 0
> **Branche** : `feature/verdant-design-tokens`
> **Dépendances** : Aucune

---

## 1. User Story

**En tant que** développeur
**Je veux** un système de design tokens cohérent basé sur le design system « Nordic Minimalist »
**Afin de** disposer d'une base CSS et TypeScript commune pour toutes les phases de la migration UX, sans casser les composants existants.

---

## 2. Contexte

### 2.1 Design system cible

Le projet migre vers le thème **« Verdant Simulator »** (Nordic Minimalist), défini par 14 maquettes Stitch avec une palette Material Design 3 (32+ couleurs sémantiques), des polices Manrope + Inter, et un style glassmorphism.

- **Maquettes de référence** : `docs/ux/stitch/v1/stitch_nordic_minimalist/`
- **Code HTML source** : chaque maquette possède un `code.html` contenant la config Tailwind complète dans `<script id="tailwind-config">` — **ces fichiers sont la source de vérité des tokens**
- **Fichiers de spécification** : `docs/ux/stitch/v1/stitch_nordic_minimalist/DESIGN.md` et `handoff_technique.md`

### 2.2 Contrainte Tailwind v4 (⚠️ critique)

> [!IMPORTANT]
> L'application utilise **Tailwind CSS v4** (Lightning CSS, CSS-first). Il n'y a **pas** de fichier `tailwind.config.ts`. La configuration des tokens se fait **exclusivement** dans `src/app/globals.css` via `@theme {}`.
>
> Les fichiers `code.html` des maquettes utilisent le **CDN Tailwind v3** avec `<script id="tailwind-config">` — cette syntaxe **ne peut pas être copiée telle quelle**. Les tokens doivent être transposés en CSS variables dans `@theme {}`.

### 2.3 Stratégie de migration douce

Les anciens tokens (`--color-forest`, `--color-sage`, `--color-sand`) doivent **rester présents** dans `@theme {}` pendant toute la durée de la migration, marqués `/* DEPRECATED */`. Cela garantit la non-régression des composants non encore migrés. Ils seront supprimés en fin de migration (Phase 5).

---

## 3. Critères d'acceptation

### 3.1 Tokens CSS dans `globals.css`

- [ ] Le bloc `@theme {}` contient les tokens Verdant suivants (transposés depuis les `code.html`) :

```css
@theme {
  /* === Palette Verdant (Material Design 3) === */
  --color-primary: #012d1d;
  --color-primary-container: #1b4332;
  --color-secondary-fixed: #d6e6dd; /* sage wash */
  --color-surface: #f9f9f8;
  --color-surface-container-low: #f3f4f0;
  --color-on-surface: #191c1c;
  --color-outline-variant: #c1c8c2;
  --color-error: #ba1a1a;
  /* + 25 autres tokens sémantiques from code.html */

  /* === Typographie === */
  --font-headline: 'Manrope', sans-serif;
  --font-body: 'Inter', sans-serif;

  /* === Radii === */
  --radius-xl: 1.5rem;
  --radius-full: 9999px;

  /* === Shadows === */
  --shadow-ambient: 0 20px 40px rgba(27, 67, 50, 0.06);
}
```

- [ ] Les anciens tokens (`--color-forest`, etc.) sont conservés avec le commentaire `/* DEPRECATED */`
- [ ] Les classes utilitaires `.btn-verdant`, `.input-verdant`, `.glass-card` sont définies dans `globals.css`

### 3.2 Classes utilitaires

- [ ] `.btn-verdant` : bouton pill-shaped, gradient emerald, `border-radius: var(--radius-full)`
- [ ] `.input-verdant` : bloc large, `border-radius: 16px`, fond `--color-surface`, bordure `--color-outline-variant 1px`
- [ ] `.glass-card` : `backdrop-filter: blur(12px)`, `background: rgba(249, 249, 248, 0.85)`, bordure subtle `--color-outline-variant`

### 3.3 Polices via `next/font`

- [ ] Manrope configurée dans `src/app/layout.tsx` via `next/font/google` avec `variable: '--font-headline'`, `display: 'swap'`, `weight: ['400','500','600','700','800']`
- [ ] Inter configurée avec `variable: '--font-body'`, `display: 'swap'`
- [ ] Les variables CSS sont appliquées sur le `<body>` via `className`

```typescript
// src/app/layout.tsx — implémentation attendue
import { Inter, Manrope } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-headline',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});
```

### 3.4 Material Symbols

> [!CAUTION]
> **Material Symbols ne peut pas être importé via `next/font`** (pas dans le registre Google Fonts de Next.js). Il doit être ajouté comme stylesheet dans le `<head>` via le Metadata API de Next.js App Router.

- [ ] La stylesheet Google Fonts Material Symbols Outlined est chargée dans `<head>` avec `display=swap`
- [ ] Le poids ~30 KB supplémentaire est documenté dans la PR

### 3.5 Export TypeScript des tokens

> [!NOTE]
> Recharts (bibliothèque de graphiques) ne lit pas les CSS custom properties nativement. Les couleurs Verdant doivent être exportées sous forme de constantes TypeScript pour usage dans `CashflowChart.tsx`, `PatrimoineChart.tsx`, etc.

- [ ] Fichier `src/styles/verdant-tokens.ts` créé avec les couleurs sous forme de constantes TypeScript
- [ ] Aucun `any` TypeScript dans ce fichier (règle stricte du projet)

```typescript
// src/styles/verdant-tokens.ts
export const VerdantColors = {
  primary: '#012d1d',
  primaryContainer: '#1b4332',
  secondaryFixed: '#d6e6dd',
  surface: '#f9f9f8',
  onSurface: '#191c1c',
  outlineVariant: '#c1c8c2',
  error: '#ba1a1a',
} as const;

export type VerdantColorKey = keyof typeof VerdantColors;
```

---

## 4. Spécifications techniques

### 4.1 Fichiers impactés

| Fichier                        | Action | Détail                                                                                                 |
| ------------------------------ | ------ | ------------------------------------------------------------------------------------------------------ |
| `src/app/globals.css`          | MODIFY | Ajouter bloc `@theme {}` avec tokens Verdant + classes `.btn-verdant`, `.input-verdant`, `.glass-card` |
| `src/styles/verdant-tokens.ts` | NEW    | Export TypeScript des couleurs pour Recharts                                                           |
| `src/app/layout.tsx`           | MODIFY | Ajouter `next/font` Manrope + Inter + Material Symbols dans le head                                    |

### 4.2 Source des tokens

Extraire les 32+ tokens depuis n'importe quel `code.html` des maquettes — tous embarquent la **même configuration Tailwind**. Suggéré : partir de `simulateur_immobilier_unifi/code.html` (le plus complet).

```bash
# Repérer le bloc tailwind-config
grep -A 200 '"extend"' docs/ux/stitch/v1/stitch_nordic_minimalist/simulateur_immobilier_unifi/code.html | head -100
```

### 4.3 Vérification glassmorphism

La classe `.glass-card` doit être testable visuellement en la posant sur un `<div>` avec une image en fond. Consulter les sections de la maquette `tableau_de_bord_de_r_sultats_complet/screen.png` pour la référence visuelle.

---

## 5. Tests

### 5.1 Tests à exécuter

```bash
# Type-check (pas d'erreur TypeScript)
npm run type-check

# Suite complète (les tokens CSS n'impactent pas les TU métier)
npm run test

# Lint
npm run lint
```

### 5.2 Vérification visuelle

```bash
# Démarrer le serveur de dev
npm run dev
```

- Inspecter les CSS custom properties dans DevTools (`--color-primary`, `--font-headline`, etc.)
- Vérifier que les polices Manrope et Inter se chargent (Network tab — pas de FOUT)
- Vérifier que les anciens composants (ex: formulaire calculateur) n'ont pas régressé visuellement

---

## 6. Definition of Done

- [ ] `npm run type-check` : 0 erreur TypeScript
- [ ] `npm run lint` : 0 erreur, 0 warning
- [ ] `npm run test` : 530 TU verts (zéro régression)
- [ ] Les tokens Verdant sont visibles dans DevTools
- [ ] La police Manrope se charge (Network tab)
- [ ] Les anciens composants ne régressent pas visuellement
- [ ] PR mergée vers `master` depuis `feature/verdant-design-tokens`

---

## Changelog

| Date       | Version | Description                                           | Auteur    |
| ---------- | ------- | ----------------------------------------------------- | --------- |
| 2026-03-25 | 1.0     | Création — Plan UX (Sally) + Plan téchnique (Winston) | John (PM) |
