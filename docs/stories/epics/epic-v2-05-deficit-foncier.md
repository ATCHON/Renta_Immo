# Epic V2-05 : Déficit Foncier Majoré et Location Nue

> **Priorité** : IMPORTANT | **Sprint** : Sprint 2 | **Effort** : 1-2 jours
> **Statut** : Draft
> **Source** : handoff-sm-regles-metier-v2.md

## Objectif

Implémenter le plafond majoré de déficit foncier à 21 400€ pour les travaux de rénovation énergétique (2023-2025).

## Stories

| ID     | Titre                                                 | Effort | Statut |
| ------ | ----------------------------------------------------- | ------ | ------ |
| V2-S15 | Implémenter le plafond déficit foncier majoré 21 400€ | S      | Draft  |

## Fichiers principaux impactés

- `src/config/constants.ts`
- `src/server/calculations/fiscalite.ts`
- `src/components/forms/StepBien.tsx` ou `StepStructure.tsx`

## Risque

Dispositif expiré au 31/12/2025 — implémenter quand même pour simulations rétrospectives avec alerte d'expiration.

## Definition of Done

- Checkbox "Rénovation énergétique éligible (E/F/G vers A/B/C/D)"
- Si cochée ET année <= 2025 : plafond = 21 400€
- Alerte si dispositif expiré
