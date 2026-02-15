# Epic V2-01 : Corrections Critiques Plus-Value

> **Priorité** : CRITIQUE | **Sprint** : Sprint 1 | **Effort** : 3-5 jours
> **Statut** : Draft
> **Source** : handoff-sm-regles-metier-v2.md

## Objectif

Corriger les 4 bugs critiques du module plus-value (fiscalite.ts) concernant la formule d'acquisition, les abattements, la surtaxe, et les taux de prélèvements sociaux.

## Stories

| ID | Titre | Effort | Statut |
|----|-------|--------|--------|
| V2-S01 | Corriger la formule prix d'acquisition corrigé (forfaits 7.5% + 15%) | M | Draft |
| V2-S02 | Vérifier et consolider le barème abattements PV progressif | S | Draft |
| V2-S03 | Vérifier le barème surtaxe PV vs spécification v2 | S | Draft |
| V2-S04 | Audit taux PS PV (17.2%) vs PS revenus BIC LMNP (18.6%) | S | Draft |
| V2-S05 | Ajouter paramètres résidence de services et mobilier dans réintégration PV LMNP | M | Draft |

## Fichiers principaux impactés

- `src/config/constants.ts`
- `src/server/calculations/fiscalite.ts`
- `src/server/calculations/types.ts`
- `src/server/calculations/plus-value.test.ts`

## Dépendances

- V2-S05 dépend de V2-S01 (forfaits avant réintégration)
- Indépendant des autres epics

## Definition of Done

- Formule PV conforme à la v2 (forfaits, abattements, surtaxe, taux PS)
- Tests de non-régression passés
- Aucune régression fonctionnelle
