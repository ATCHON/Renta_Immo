# Epic UPGRADE-01 : Montée de Version des Dépendances Majeures

> **Priorité** : IMPORTANT (Sécurité + Support écosystème)
> **Sprint** : Chore Sprint (hors fonctionnel V2)
> **Effort** : 3 semaines (3 phases séquentielles)
> **Statut** : Draft
> **Source** : `docs/audit/technique/etude-impact-dependances.md`

## Objectif

Mettre à niveau les 3 dépendances majeures arrivant à obsolescence : ESLint (v8→v10), Tailwind CSS (v3→v4), et le cœur applicatif React+Next.js (18+14→19+16). La migration suit une stratégie **séquentielle et incrémentale** pour préserver l'intégrité des règles de calcul fiscaux et des règles HCSF.

> **Principe directeur** : Aucun « Big Bang ». Chaque phase vit sur sa propre branche, passe l'intégralité des tests avant merge, et est indépendante des autres.

## Stories

| ID         | Titre                                                      | Effort | Phase | Statut |
| ---------- | ---------------------------------------------------------- | ------ | ----- | ------ |
| **UP-S01** | Migrer ESLint v8 vers v10 (Flat Config)                    | S      | 1     | Draft  |
| **UP-S02** | Migrer Tailwind CSS v3 vers v4 (nouveau moteur CSS)        | M      | 2     | Draft  |
| **UP-S03** | Migrer React 18 → 19 et Next.js 14 → 16 (APIs asynchrones) | L      | 3     | Draft  |

## Séquence obligatoire

```
UP-S01 (ESLint) → UP-S02 (Tailwind) → UP-S03 (React/Next)
```

- UP-S01 est un prérequis : ESLint v10 configure les règles qui valideront le code migré en S03
- UP-S02 est isolé (styles uniquement) et peut précéder S03 sans risque
- UP-S03 est le chantier critique : ne démarre qu'après S01 et S02 mergés

## Fichiers principaux impactés

**Phase 1 — ESLint :**

- `.eslintrc.json` → à remplacer par `eslint.config.mjs`
- `package.json` (devDependencies + scripts)

**Phase 2 — Tailwind :**

- `tailwind.config.ts` → à convertir vers format `@theme` CSS
- `src/app/globals.css`
- `postcss.config.mjs`

**Phase 3 — React/Next :**

- `next.config.mjs`
- `src/app/**/(pages/layouts avec params/searchParams asynchrones)`
- `src/lib/auth.ts` (cookies() asynchrones)
- `src/lib/supabase/*.ts` (cookies() SSR)
- Tous les composants utilisant `forwardRef`
- `package.json`, `tsconfig.json`

## Definition of Done (Epic)

- [ ] `npm run lint` : 0 erreur, 0 warning sur ESLint v10
- [ ] `npm run build` : build Next.js 16 sans erreur ni warning de dépréciation
- [ ] `npm test` (Vitest) : 0 régression — suite complète verte
- [ ] `npm run test:e2e` (Playwright) : 0 régression — parcours auth + CRUD + PDF
- [ ] `npm run type-check` : TypeScript strict sans `any`
- [ ] Aucune référence à des APIs dépréciées (forwardRef, params synchrones, cookies() synchrones)
- [ ] Supabase JS à jour (2.97) — inclus en UP-S03 (effort mineur)
