# Epic V2-03 : Conformité Fiscale LMNP

> **Priorité** : CRITIQUE | **Sprint** : Sprint 1-2 | **Effort** : 4-6 jours
> **Statut** : Draft
> **Source** : handoff-sm-regles-metier-v2.md

## Objectif

Compléter la couverture fiscale LMNP : 3 catégories Micro-BIC, CFE, frais de comptabilité, et suppression des références OGA/CGA.

## Stories

| ID | Titre | Effort | Statut |
|----|-------|--------|--------|
| V2-S09 | Propager les 3 catégories Micro-BIC dans le calculateur fiscal | M | Draft |
| V2-S10 | Intégrer la CFE dans les charges LMNP avec logique d'exonération | M | Draft |
| V2-S11 | Frais de comptabilité LMNP réel (sans réduction OGA/CGA) | S | Draft |
| V2-S12 | Auditer et supprimer toute référence OGA/CGA dans le code et la documentation | S | Draft |

## Fichiers principaux impactés

- `src/server/calculations/fiscalite.ts`
- `src/config/constants.ts`
- `src/components/forms/StepStructure.tsx`
- `src/components/forms/StepExploitation.tsx`
- `src/server/calculations/types.ts`

## Dépendances

- V2-S10 (CFE) dépend de V2-S09 (catégories LMNP)
- V2-S12 (audit OGA) indépendant

## Definition of Done

- 3 catégories Micro-BIC opérationnelles
- CFE et frais compta intégrés dans les calculs LMNP
- Aucune référence OGA/CGA dans le code
