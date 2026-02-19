# Epic V2-07 : Paramètres HCSF Ajustables

> **Priorité** : UTILE | **Sprint** : Sprint 3 | **Effort** : 1 jour
> **Statut** : Draft
> **Source** : handoff-sm-regles-metier-v2.md

## Objectif

Rendre la pondération des loyers HCSF configurable dans le formulaire (actuellement fixée à 70%).

## Stories

| ID     | Titre                                          | Effort | Statut |
| ------ | ---------------------------------------------- | ------ | ------ |
| V2-S18 | Rendre la pondération loyers HCSF configurable | S      | Draft  |

## Fichiers principaux impactés

- `src/server/calculations/hcsf.ts`
- `src/components/forms/StepFinancement.tsx`

## Definition of Done

- Champ dans formulaire HCSF (défaut 70%)
- Bouton "Avec GLI" passe à 80%
- Note explicative visible
