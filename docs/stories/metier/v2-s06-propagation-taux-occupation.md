# Story V2-S06 : Propager tauxOccupation dans calculs cashflow et rentabilité

> **Epic** : EPIC-V2-02 | **Sprint** : Sprint 1 | **Effort** : M
> **Statut** : Completed

## Story

**As a** investisseur,
**I want** que la vacance locative soit prise en compte dans tous les calculs de cashflow et de rentabilité,
**so that** les projections financières reflètent la réalité du marché locatif.

## Acceptance Criteria

1. revenusBrutsAnnuels = loyerMensuel _ 12 _ tauxOccupation dans TOUS les calculateurs
2. Valeur par défaut tauxOccupation = 0.92 si non renseignée
3. Propagation dans rentabilite.ts, projection.ts, et synthese.ts
4. Aucun calcul de revenus n'utilise loyerMensuel \* 12 sans tauxOccupation
5. Tests de non-régression : recalcul des résultats existants avec vacance

## Tasks / Subtasks

- [x] Grep loyerMensuel \* 12 dans tout src/server/calculations/
- [x] Identifier tous les points de calcul des revenus bruts (AC: 4)
- [x] Modifier rentabilite.ts (AC: 1, 3)
- [x] Modifier projection.ts (AC: 1, 3)
- [x] Vérifier synthese.ts (AC: 3)
- [x] Ajouter valeur par défaut dans types.ts ou le store (AC: 2)
- [x] Mettre à jour les snapshots de tests existants (AC: 5)

## Dev Notes

**Fichiers à modifier :**

- src/server/calculations/rentabilite.ts
- src/server/calculations/projection.ts
- src/server/calculations/synthese.ts
- src/server/calculations/types.ts — vérifier que tauxOccupation est dans l'interface input

**Note** : tauxOccupation existe déjà dans certains types et calculs partiellement. L'objectif est la propagation complète et cohérente.

**Impact** : Cette story change TOUS les résultats cashflow. Les snapshots de tests devront être mis à jour dans V2-S08.

### Testing

- Fichier : src/server/calculations/rentabilite.test.ts, projection.test.ts
- Les tests V2-S08 couvrent la régression complète

## Change Log

| Date       | Version | Description | Author    |
| ---------- | ------- | ----------- | --------- |
| 2026-02-14 | 1.0     | Création    | John (PM) |
