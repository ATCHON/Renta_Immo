# Epic V2-02 : Vacance Locative et Revenus Corrigés

> **Priorité** : CRITIQUE | **Sprint** : Sprint 1 | **Effort** : 3-5 jours
> **Statut** : Draft
> **Source** : handoff-sm-regles-metier-v2.md

## Objectif

Propager correctement le taux d'occupation dans tous les calculs de cashflow et rentabilité, et exposer le paramètre dans l'UI.

## Stories

| ID | Titre | Effort | Statut |
|----|-------|--------|--------|
| V2-S06 | Propager `tauxOccupation` dans calculs cashflow et rentabilité | M | Draft |
| V2-S07 | Ajouter le slider taux d'occupation dans le formulaire | S | Draft |
| V2-S08 | Mettre à jour les tests de régression | S | Draft |

## Fichiers principaux impactés

- `src/server/calculations/rentabilite.ts`
- `src/server/calculations/projection.ts`
- `src/components/forms/StepExploitation.tsx`
- `src/stores/calculateur.store.ts`
- Tous les fichiers `*.test.ts`

## Dépendances

- V2-S08 dépend de V2-S06 (tests après refactoring)
- EPIC-V2-04 (DPE) dépend de cet epic

## Definition of Done

- `revenusBrutsAnnuels = loyerMensuel * 12 * tauxOccupation` dans tous les calculateurs
- Valeur par défaut = 0.92
- Slider UI opérationnel
- Tests mis à jour
