# Story V2-S03 : Vérifier le barème surtaxe PV vs spécification v2

> **Epic** : EPIC-V2-01 | **Sprint** : Sprint 1 | **Effort** : S
> **Statut** : Completed

## Story

**As a** investisseur avec une plus-value importante,
**I want** que la surtaxe sur les plus-values élevées soit calculée avec le bon barème,
**so that** le montant d'impôt total soit exact.

## Acceptance Criteria

1. Le barème `BAREME_SURTAXE` dans `constants.ts` contient exactement 5 tranches conformes au v2
2. Les tranches au-delà de 150k€ (0.06 et 0.07 actuels) sont vérifiées/corrigées selon v2
3. Tests pour PV nettes de 30k€, 60k€, 100k€, 150k€, 200k€, 300k€
4. La fonction `calculerSurtaxePV()` applique correctement le barème progressif

## Tasks / Subtasks

- [x] Lire `BAREME_SURTAXE` dans `constants.ts:142-151`
- [x] Lire la spécification v2 (docs/core/regles_metier_explications_v2.md section surtaxe)
- [x] Comparer chaque tranche — identifier les déviations (AC: 1, 2)
- [x] Corriger le barème si nécessaire
- [x] Vérifier `calculerSurtaxePV()` dans `fiscalite.ts` (AC: 4)
- [x] Écrire les tests (AC: 3)

## Dev Notes

**Fichiers à modifier :**

- `src/config/constants.ts:142-151` — `BAREME_SURTAXE`
- `src/server/calculations/fiscalite.ts` — `calculerSurtaxePV()`

**Attention** : Le barème actuel inclut des tranches 0.06 et 0.07 au-delà de 150k€ qui ne semblent pas conformes à v2. À vérifier impérativement.

**Barème v2 surtaxe (5 tranches) :**

- De 50 001€ à 100 000€ : 2%
- De 100 001€ à 150 000€ : 3%
- De 150 001€ à 200 000€ : 4%
- De 200 001€ à 250 000€ : 5%
- Au-delà de 250 000€ : 6%

### Testing

- Fichier : `src/server/calculations/plus-value.test.ts`
- Lancer : `npm test -- --testPathPattern=plus-value`

## Change Log

| Date       | Version | Description | Author    |
| ---------- | ------- | ----------- | --------- |
| 2026-02-14 | 1.0     | Création    | John (PM) |
