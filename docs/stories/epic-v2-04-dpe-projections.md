# Epic V2-04 : DPE et Conditionnels de Projection

> **Priorité** : IMPORTANT | **Sprint** : Sprint 2 | **Effort** : 1-2 jours
> **Statut** : Draft
> **Source** : handoff-sm-regles-metier-v2.md

## Objectif

Conditionner l'inflation des loyers et la revalorisation du bien à la classe DPE dans les projections long terme.

## Notes de fusion

Cet epic **fusionne** avec E4 (DPE alertes) du backlog P3 existant.

## Stories

| ID | Titre | Effort | Statut |
|----|-------|--------|--------|
| V2-S13 | Conditionner l'inflation des loyers à la classe DPE | S | Draft |
| V2-S14 | Conditionner la revalorisation du bien au DPE | S | Draft |

## Fichiers principaux impactés

- `src/server/calculations/projection.ts`
- `src/server/calculations/synthese.ts`

## Dépendances

- Dépend de EPIC-V2-02 (vacance dans projections)

## Definition of Done

- DPE F/G : 0% loyers dès la 1ère année
- DPE E : 0% loyers à partir de 2034
- DPE A-D : taux normal
- Alerte forte si F/G
