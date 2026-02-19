# Story V2-S02 : Vérifier et consolider le barème abattements PV progressif

> **Epic** : EPIC-V2-01 | **Sprint** : Sprint 1 | **Effort** : S
> **Statut** : Completed

## Story

**As a** investisseur,
**I want** que les abattements progressifs d'IR et de PS sur la plus-value soient strictement conformes au barème légal,
**so that** les calculs fiscaux soient exacts pour toutes les durées de détention.

## Acceptance Criteria

1. `abattementIR()` conforme au barème v2 : 0% < 6 ans, 6% par an de 6 à 21 ans, 4% à 22 ans → exonération totale IR à 22 ans
2. `abattementPS()` conforme au barème v2 : 0% < 6 ans, 1.65% de 6-11 ans, 1.60% de 12-16 ans, 9% de 17-22 ans → exonération totale PS à 30 ans
3. Tests paramétriques pour les années 1, 5, 6, 10, 15, 22, 23, 30, 35 ans de détention
4. Aucune déviation > 0.01% par rapport au barème légal

## Tasks / Subtasks

- [x] Lire les fonctions `abattementIR()` et `abattementPS()` dans `fiscalite.ts`
- [x] Comparer chaque tranche avec le barème v2 (docs/core/regles_metier_explications_v2.md)
- [x] Corriger les éventuelles déviations (AC: 1, 2)
- [x] Écrire les tests paramétriques (AC: 3, 4)
  - [x] Table de vérité : années 1 à 35, valeurs IR et PS attendues
- [x] Vérifier l'intégration dans `calculerPlusValueIR()`

## Dev Notes

**Fichiers à vérifier :**

- `src/server/calculations/fiscalite.ts` — `abattementIR()` lignes 480-500, `abattementPS()`
- Contexte : implémenté lors de AUDIT-105, à vérifier conformité exacte v2

**Barème IR simplifié :**

- 0 à 5 ans : 0%
- 6 à 21 ans : 6% par année supplémentaire
- 22ème année : 4% → exonération IR totale

**Barème PS simplifié :**

- 0 à 5 ans : 0%
- 6 à 11 ans : 1.65% par année
- 12 à 16 ans : 1.60% par année
- 17 à 22 ans : 9% par année
- 23 à 30 ans : exonération totale PS à 30 ans

### Testing

- Fichier : `src/server/calculations/plus-value.test.ts`
- Pattern : `describe('abattementIR', () => { it.each([...])(...) })`
- Lancer : `npm test -- --testPathPattern=plus-value`

## Change Log

| Date       | Version | Description | Author    |
| ---------- | ------- | ----------- | --------- |
| 2026-02-14 | 1.0     | Création    | John (PM) |
