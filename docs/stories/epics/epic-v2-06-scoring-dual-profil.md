# Epic V2-06 : Scoring et Recommandations v2

> **Priorité** : UTILE | **Sprint** : Sprint 3 | **Effort** : 3-4 jours
> **Statut** : Draft
> **Source** : handoff-sm-regles-metier-v2.md

## Objectif

Implémenter le scoring dual profil (Rentier / Patrimonial) et l'alerte seuil LMP.

## Stories

| ID     | Titre                                       | Effort | Statut |
| ------ | ------------------------------------------- | ------ | ------ |
| V2-S16 | Implémenter le profil scoring "Patrimonial" | M      | Draft  |
| V2-S17 | Ajouter l'alerte seuil LMP (23 000€)        | S      | Draft  |

## Fichiers principaux impactés

- `src/server/calculations/synthese.ts`
- `src/components/results/`
- `src/server/calculations/validation.ts`

## Dépendances

- Dépend de EPIC-V2-01 et EPIC-V2-02 (calculs corrigés)

## Definition of Done

- Toggle Rentier/Patrimonial dans l'UI
- Profil Patrimonial : cashflow atténué, TRI 15 ans renforcé
- Bandeau d'avertissement si recettes LMNP > 20 000€
