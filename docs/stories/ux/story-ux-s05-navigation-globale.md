# Story UX-S05 : Navigation Globale — Intégration Navbar & Footer Verdant

> **Priorité** : P2 (dernier sprint)
> **Effort** : S (1–2 jours)
> **Statut** : Ready for Dev
> **Type** : Feature / UI / Integration
> **Epic** : UX Migration — Phase 5 : Navigation Globale
> **Branche** : `feature/verdant-navigation`
> **Dépendances** : UX-S01 ✅, UX-S02 ✅, UX-S03 ✅, UX-S04 ✅ (toutes les phases précédentes)

---

## 1. User Story

**En tant que** utilisateur navigant sur l'application
**Je veux** une navigation globale cohérente (navbar + footer) sur toutes les pages
**Afin de** passer facilement du simulateur à la landing page, à la section pédagogique, et à mes simulations sauvegardées.

---

## 2. Contexte

### 2.1 Situation actuelle

La navbar actuelle (`src/components/layout/Header.tsx`) reste en place pendant toutes les phases précédentes. `VerdantNavbar.tsx` et `VerdantFooter.tsx` ont été créés en Phase 1 mais utilisés uniquement dans `page.tsx`.

Cette story remplace `Header.tsx` par `VerdantNavbar.tsx` dans `src/app/layout.tsx` et intègre `VerdantFooter.tsx` globalement.

> [!NOTE]
> **Décision Winston** : `VerdantNavbar.tsx` est créé en Phase 1 **en parallèle** de `Header.tsx` pour éviter de modifier l'existant en cours de sprint. Le switch global est réalisé ici en Phase 5, une fois que toutes les pages utilisent les nouveaux composants.

### 2.2 Nom du produit

Le nom validé dans la navbar est **« Petra Nova »**.

### 2.3 Liens de navigation finale

| Item                        | Route                | Auth requis | Notes                          |
| --------------------------- | -------------------- | ----------- | ------------------------------ |
| Logo « Petra Nova »         | `/`                  | Non         | Cliquable, retour landing page |
| Simulateur                  | `/calculateur`       | Non         | Lien principal                 |
| Comment ça marche           | `/comment-ca-marche` | Non         | (remplace `/en-savoir-plus`)   |
| Mes simulations             | `/simulations`       | Oui         | Masqué si non connecté         |
| Connexion                   | `/auth/login`        | Non         | Masqué si connecté             |
| CTA « Nouvelle simulation » | `/calculateur`       | Non         | Bouton pill emerald            |

---

## 3. Critères d'acceptation

### 3.1 Intégration dans `layout.tsx`

- [ ] `src/app/layout.tsx` remplace `<Header />` par `<VerdantNavbar />`
- [ ] `src/app/layout.tsx` ajoute `<VerdantFooter />` après le `{children}`
- [ ] `Header.tsx` est gardé mais non importé (supprimer l'import, pas le fichier — garder pour référence)
- [ ] La navbar est rendue côté serveur si possible (pas de `'use client'` inutile)

### 3.2 `VerdantNavbar.tsx` — Fonctionnalités

- [ ] Le lien actif est mis en évidence (underline, ou couleur `--color-primary`)
- [ ] Sur mobile : menu hamburger qui ouvre un drawer latéral (ou menu vertical)
- [ ] Glassmorphism : `backdrop-blur-md`, fond semi-transparent `rgba(249, 249, 248, 0.85)`, `border-b border-[var(--color-outline-variant)]`
- [ ] « Mes simulations » visible uniquement pour les utilisateurs connectés (lecture du session/auth Supabase)
- [ ] « Connexion » masqué si l'utilisateur est connecté (remplacé par un avatar ou « Mon compte »)
- [ ] Le CTA « Nouvelle simulation » est un bouton pill emerald distinct des liens nav

### 3.3 `VerdantFooter.tsx` — Contenu

- [ ] Section gauche : Logo + copyright « © 2026 Petra Nova »
- [ ] Section droite : Liens légaux (Mentions légales | Politique de confidentialité)
- [ ] Fond sage `--color-secondary-fixed`, texte `--color-on-surface`
- [ ] Vérifier les pages légales existantes (chercher dans `src/app/`) — si inexistantes, créer des pages stubs

### 3.4 Compatibilité complète

- [ ] La landing page (Phase 1) affiche la nouvelle navbar globale sans doublon
- [ ] Le simulateur (Phase 2) affiche la nouvelle navbar
- [ ] Le dashboard résultats (Phase 3) affiche la nouvelle navbar
- [ ] La section « Comment ça marche » (Phase 4) affiche la nouvelle navbar

---

## 4. Spécifications techniques

### 4.1 Fichiers impactés

| Fichier                                   | Action               | Détail                                                     |
| ----------------------------------------- | -------------------- | ---------------------------------------------------------- |
| `src/app/layout.tsx`                      | MODIFY               | Remplacer Header par VerdantNavbar + ajouter VerdantFooter |
| `src/components/layout/VerdantNavbar.tsx` | MODIFY (ajustements) | Vérifier auth, liens, responsive                           |
| `src/components/layout/VerdantFooter.tsx` | MODIFY (ajustements) | Copyright, liens légaux                                    |
| `src/components/layout/Header.tsx`        | KEEP (non importé)   | Supprimer l'import dans layout.tsx                         |

### 4.2 Gestion de l'auth dans la navbar

Utiliser le hook d'auth Supabase existant (chercher `useAuth`, `useSession` ou équivalent dans la codebase) :

```bash
grep -rn "useAuth\|useSession\|supabase.auth" src/hooks/ src/components/layout/
```

La navbar doit être un **client component** si elle lit l'état d'auth côté client. Sinon, utiliser un Server Component avec les cookies Supabase.

---

## 5. Tests

### 5.1 Vérification E2E

```bash
# Tous les tests E2E existants doivent passer avec la nouvelle navbar
npm run test:e2e

# Vérifier notamment :
# - tests/e2e/auth/login.spec.ts (flux de connexion)
# - tests/e2e/calculateur/validation.spec.ts (formulaire)
# - tests/e2e/simulations/crud.spec.ts (CRUD simulations si existant)
```

### 5.2 Tests visuels responsive

```bash
npm run dev
# Viewport 375px : vérifier menu hamburger
# Viewport 1440px : vérifier liens + CTA pill
```

---

## 6. Definition of Done

- [ ] `layout.tsx` utilise `VerdantNavbar` et `VerdantFooter`
- [ ] Liens « Mes simulations » masqué si non connecté
- [ ] Tous les tests E2E existants passent avec la nouvelle navbar
- [ ] `npm run test` : 530+ TU verts
- [ ] Vérification visuelle sur 3 viewports (375px, 768px, 1440px)
- [ ] Aucun `any` TypeScript
- [ ] PR mergée depuis `feature/verdant-navigation`

---

## Changelog

| Date       | Version | Description                                       | Auteur    |
| ---------- | ------- | ------------------------------------------------- | --------- |
| 2026-03-25 | 1.0     | Création — Plan UX Sally + Plan technique Winston | John (PM) |
