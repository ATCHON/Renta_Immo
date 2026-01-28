# Implémentation du Design Nordic Minimal pour Renta Immo

## Objectif

Mettre à jour l'interface utilisateur de l'application Renta Immo pour adopter la direction design **Nordic Minimal** définie dans [docs/front-end-spec.md](file:///d:/Projets/Renta_Immo/docs/front-end-spec.md). Cette mise à jour vise à créer une expérience utilisateur plus épurée, professionnelle et accessible, en suivant les principes de clarté, progression naturelle et respiration visuelle.

## User Review Required

> [!IMPORTANT]
> **Changements visuels majeurs** : Cette mise à jour modifie complètement la palette de couleurs, la typographie et le style visuel de l'application. Tous les utilisateurs existants verront une interface totalement différente.

> [!WARNING]
> **Impact sur les composants** : Tous les composants UI existants ont été refactorisés. Les tests de build et de typage ont été validés.

## Proposed Changes

### Configuration et Fondations

#### [MODIFY] [tailwind.config.ts](file:///d:/Projets/Renta_Immo/tailwind.config.ts)
- Palette de couleurs Nordic Minimal (Forest, Sage, Sand, Charcoal, etc.)
- Tokens d'espacement et radius (8px default)
- Durées d'animation harmonisées

#### [MODIFY] [globals.css](file:///d:/Projets/Renta_Immo/src/app/globals.css)
- Fond background neutre (#FAFAF8)
- Focus indicators WCAG (2px solid Forest)
- Support `prefers-reduced-motion`

#### [MODIFY] [layout.tsx](file:///d:/Projets/Renta_Immo/src/app/layout.tsx)
- Configuration Inter avec poids 400, 500, 600
- Ajout du skip-link "Passer au contenu principal"

---

### Composants UI

#### [MODIFY] [Button.tsx](file:///d:/Projets/Renta_Immo/src/components/ui/Button.tsx)
- Variants Nordic (Forest primary, Sand secondary)
- Micro-animations au hover/active

#### [MODIFY] [Input.tsx](file:///d:/Projets/Renta_Immo/src/components/ui/Input.tsx)
- Variantes currency/percent
- Coercion des nombres et messages d'erreur localisés

#### [MODIFY] [Select.tsx](file:///d:/Projets/Renta_Immo/src/components/ui/Select.tsx)
- Design aligné sur Input
- Utilisation de ChevronDown de lucide-react

---

### Navigation et Layout

#### [NEW] [Header.tsx](file:///d:/Projets/Renta_Immo/src/components/layout/Header.tsx)
- Sticky header avec menu mobile (hamburger)
- ARIA labels pour l'accessibilité

#### [NEW] [ProgressStepper.tsx](file:///d:/Projets/Renta_Immo/src/components/forms/ProgressStepper.tsx)
- Indicateur de progression 6 étapes pour le wizard

---

### Phase 11 : Corrections & Ajustements (Final)

#### [MODIFY] [Dashboard.tsx](file:///d:/Projets/Renta_Immo/src/components/results/Dashboard.tsx)
- Correction du lien "Modifier" (reset du statut du formulaire)
- Augmentation du contraste des textes blancs sur fond Forest

#### [MODIFY] [validators.ts](file:///d:/Projets/Renta_Immo/src/lib/validators.ts)
- Utilisation de `z.coerce.number()`
- Messages d'erreur en français ("Veuillez saisir un nombre valide")

## Verification Plan Success

- [x] `npm run type-check` : PASS
- [x] `npm run build` : PASS
- [x] Responsive test (Mobile/Desktop) : PASS
- [x] Accessibilité (Focus/Contrast/Skip-link) : PASS
