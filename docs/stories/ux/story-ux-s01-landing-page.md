# Story UX-S01 : Refonte Landing Page « Petra Nova »

> **Priorité** : P1
> **Effort** : M (2–3 jours)
> **Statut** : Ready for Dev
> **Type** : Feature / UI
> **Epic** : UX Migration — Phase 1 : Landing Page
> **Branche** : `feature/verdant-landing-page`
> **Dépendances** : UX-S00 (Design tokens doivent être en place)

---

## 1. User Story

**En tant que** visiteur arrivant sur la page d'accueil
**Je veux** découvrir une landing page premium avec une identité visuelle forte « Verdant Simulator »
**Afin de** comprendre immédiatement la valeur de l'outil et être incité à lancer une simulation.

---

## 2. Contexte

### 2.1 Maquette de référence

- **Screenshot** : `docs/ux/stitch/v1/stitch_nordic_minimalist/landing_page_accueil_premium/screen.png`
- **Code HTML source** : `docs/ux/stitch/v1/stitch_nordic_minimalist/landing_page_accueil_premium/code.html` (281 lignes)
  - Contient : Navbar glassmorphism, Hero split grid 12 colonnes, Bento features (3 cartes), Testimonials, CTA pill + blur décoratif, Footer sage

> [!NOTE]
> Le `code.html` contient le code Tailwind **complet et fonctionnel** — c'est la référence directe pour le développeur. Les classes Tailwind, les structures HTML et les tokens sont directement extractibles de ce fichier.

### 2.2 Décisions design validées

- **Nom du produit** : « **Petra Nova** » (remplace Renta Immo / Verdant Simulator dans la navbar)
- **Icônes** : Lucide React avec `strokeWidth={1.5}` (Material Symbols reporté à après MVP)
- **Langue** : Tout le contenu en **français** malgré les maquettes en anglais

### 2.3 Traduction des textes clés

| Maquette (anglais)                                 | Version française                               |
| -------------------------------------------------- | ----------------------------------------------- |
| « The power of Excel, the simplicity of the web. » | « La puissance d'Excel, la simplicité du web. » |
| « Start Simulation → »                             | « Lancer la simulation → »                      |
| « View Demo »                                      | « Voir un exemple »                             |
| « Get Started Now »                                | « Commencer maintenant »                        |
| « Engineered for Alpha »                           | « Conçu pour la Performance »                   |
| « Real-time yield mapping »                        | « Cartographie des rendements en temps réel »   |
| « Tax optimization »                               | « Optimisation fiscale »                        |
| « Wealth projections »                             | « Projections patrimoniales »                   |

---

## 3. Critères d'acceptation

### 3.1 Composants créés

Les composants suivants sont créés dans `src/components/landing/` :

- [ ] **`HeroSection.tsx`** : Split grid 12 colonnes — slogan à gauche, visuel immobilier avec overlay KPI à droite
- [ ] **`BentoFeatures.tsx`** : 3 cartes horizontales (Cartographie rendements, Optimisation fiscale, Projections patrimoniales)
- [ ] **`TestimonialsSection.tsx`** : Section de témoignages (données fictives autorisées pour social proof)
- [ ] **`LandingCTA.tsx`** : Bouton pill final + sous-titre

### 3.2 Composants de navigation créés

- [ ] **`VerdantNavbar.tsx`** (`src/components/layout/`) : Navbar glassmorphism avec :
  - Logo/texte « Petra Nova » (nom du produit validé)
  - Liens : Simulateur (`/calculateur`) | Comment ça marche (`/comment-ca-marche`) | Mes simulations (`/simulations`, masqué si non connecté)
  - Bouton CTA « Nouvelle simulation » (pill emerald)
  - Fond glassmorphism : `backdrop-blur`, fond semi-transparent
- [ ] **`VerdantFooter.tsx`** (`src/components/layout/`) :
  - Liens : Mentions légales | Politique de confidentialité
  - Copyright : `© 2026 Petra Nova`

> [!NOTE]
> La navbar et le footer sont créés ici mais **pas encore intégrés globalement** dans `layout.tsx`. Ce sera fait en Phase 5 (UX-S05). En Phase 1, ils sont utilisés uniquement dans `page.tsx`.

### 3.3 Refonte `src/app/page.tsx`

- [ ] La page actuelle est **entièrement remplacée** par l'assemblage des nouveaux composants (pas de logique métier sur la landing page — risque de régression nul)
- [ ] Le CTA principal redirige vers `/calculateur`
- [ ] Structure : `<VerdantNavbar>` + `<HeroSection>` + `<BentoFeatures>` + `<TestimonialsSection>` + `<LandingCTA>` + `<VerdantFooter>`

### 3.4 Style et tokens

- [ ] Les composants utilisent les classes utilitaires définies en Phase 0 : `.btn-verdant`, `.glass-card`
- [ ] Les couleurs utilisent les tokens CSS `var(--color-primary)`, `var(--color-secondary-fixed)`, etc.
- [ ] La police Manrope est appliquée sur les titres (`font-headline`)
- [ ] Micro-animations : hover effects sur les cartes Bento, transition smooth sur le CTA (opacity + translate)

### 3.5 SEO

- [ ] La page a un `<title>` descriptif (ex: `Petra Nova — Simulateur d'investissement immobilier`)
- [ ] Une `<meta name="description">` est définie
- [ ] Un seul `<h1>` par page (slogan dans `HeroSection`)

---

## 4. Spécifications techniques

### 4.1 Fichiers impactés

| Fichier                                          | Action                    | Détail                             |
| ------------------------------------------------ | ------------------------- | ---------------------------------- |
| `src/app/page.tsx`                               | MODIFY (refonte complète) | Assemblage des nouveaux composants |
| `src/components/landing/HeroSection.tsx`         | NEW                       | Split grid 12 colonnes             |
| `src/components/landing/BentoFeatures.tsx`       | NEW                       | 3 cartes features                  |
| `src/components/landing/TestimonialsSection.tsx` | NEW                       | Section témoignages                |
| `src/components/landing/LandingCTA.tsx`          | NEW                       | Bouton CTA final                   |
| `src/components/layout/VerdantNavbar.tsx`        | NEW                       | Navbar glassmorphism               |
| `src/components/layout/VerdantFooter.tsx`        | NEW                       | Footer                             |

### 4.2 Référence HTML directe

```bash
# Ouvrir le code source de la maquette
cat "docs/ux/stitch/v1/stitch_nordic_minimalist/landing_page_accueil_premium/code.html"
```

La structure HTML et les classes Tailwind contenues dans ce fichier sont **directement réutilisables** (en adaptant les classes v3 → tokens Tailwind v4 définis en Phase 0).

### 4.3 Contrainte de non-régression

Pas de logique métier sur la landing page → **zéro risque de régression** sur les 530 TU existants. Les tests pour cette page seront des tests E2E uniquement.

---

## 5. Tests

### 5.1 Tests automatisés

```bash
# TU existants (s'assurer de zéro régression)
npm run test

# E2E — vérifier navigation CTA
npm run test:e2e
# Scénario : cliquer sur « Lancer la simulation » → arriver sur /calculateur
```

### 5.2 Vérification visuelle via Chrome DevTools

```bash
npm run dev
# Puis utiliser mcp_chrome-devtools_take_screenshot
```

- Comparer screenshot avec `landing_page_accueil_premium/screen.png`
- Viewports à tester : 375px (mobile), 768px (tablet), 1440px (desktop)
- Vérifier le glassmorphism de la navbar (fond flou sur défilement)

### 5.3 Audit Lighthouse

Après la phase 1, lancer un audit Lighthouse SEO + Accessibility sur la landing page.

---

## 6. Definition of Done

- [ ] Tous les composants listés en 3.1 et 3.2 créés
- [ ] `src/app/page.tsx` refontue
- [ ] `npm run test` : 530+ TU verts
- [ ] `npm run test:e2e` : navigation CTA fonctionnelle
- [ ] Vérification visuelle sur les 3 viewports
- [ ] Aucun `any` TypeScript
- [ ] TU ajoutés si des hooks/utilitaires sont créés dans les composants
- [ ] PR mergée depuis `feature/verdant-landing-page`

---

## Changelog

| Date       | Version | Description                                       | Auteur    |
| ---------- | ------- | ------------------------------------------------- | --------- |
| 2026-03-25 | 1.0     | Création — Plan UX Sally + Plan technique Winston | John (PM) |
