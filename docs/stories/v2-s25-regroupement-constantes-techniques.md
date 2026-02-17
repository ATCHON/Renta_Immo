# Story V2-S25 : Regroupement des constantes techniques

> **Epic** : EPIC-V2-08 | **Sprint** : Sprint 4+ | **Effort** : S
> **Statut** : Completed

## Story

**As a** développeur,
**I want** regrouper toutes les constantes techniques et réglementaires non configurables dans un fichier unique,
**so that** le code soit plus propre, centralisé et facile à maintenir.

## Acceptance Criteria

1. Créer `src/server/calculations/constants.ts`
2. Déplacer toutes les valeurs "en dur" (amortissements, barèmes fiscaux fixes, scoring, technique)
3. Remplacer les littéraux dans tous les modules de calcul
4. Vérifier la non-régression via les tests unitaires

## Tasks / Subtasks

- [x] Créer `src/server/calculations/constants.ts` (AC: 1, 2)
- [x] Refactorer `fiscalite.ts`, `hcsf.ts`, `synthese.ts`, `projection.ts` (AC: 3)
- [x] Nettoyer `types.ts` (AC: 2)
- [x] Valider via `metier.test.ts` (AC: 4)

## Dev Notes

**Fichiers impactés :**
- src/server/calculations/constants.ts
- src/server/calculations/fiscalite.ts
- src/server/calculations/hcsf.ts
- src/server/calculations/synthese.ts
- src/server/calculations/projection.ts
- src/server/calculations/types.ts

### Testing

- `npm test src/server/calculations/metier.test.ts` : 56/56 passés.

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-16 | 1.0 | Création et implémentation | Antigravity |
