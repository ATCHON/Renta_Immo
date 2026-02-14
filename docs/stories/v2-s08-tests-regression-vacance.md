# Story V2-S08 : Mettre à jour les tests de régression après vacance locative

> **Epic** : EPIC-V2-02 | **Sprint** : Sprint 1 | **Effort** : S
> **Statut** : Completed

## Story

**As a** équipe de développement,
**I want** que toute la suite de tests soit mise à jour pour intégrer le paramètre tauxOccupation,
**so that** les tests reflètent la réalité des nouveaux calculs et détectent les régressions futures.

## Acceptance Criteria

1. Tous les tests existants passent avec tauxOccupation = 1.0 (comportement identique à avant)
2. Nouveaux tests ajoutés avec tauxOccupation = 0.92 (défaut)
3. Cashflow et rentabilité nette recalculés avec vacance dans les tests
4. Couverture tests rentabilite.ts et projection.ts >= 90%

## Tasks / Subtasks

- [x] Identifier tous les tests impactés par V2-S06 (npm test → identifier les échecs)
- [x] Mettre à jour les fixtures/données de test pour inclure tauxOccupation (AC: 1)
- [x] Mettre à jour les valeurs attendues (snapshots) (AC: 1)
- [x] Ajouter les cas de test avec tauxOccupation = 0.92 (AC: 2, 3)
- [x] Vérifier la couverture (AC: 4)

## Dev Notes

**Dépendance** : Doit s'exécuter APRÈS V2-S06.

**Fichiers à modifier :**
- Tous les fichiers *.test.ts dans src/server/calculations/
- Particulièrement rentabilite.test.ts et projection.test.ts

**Note** : Les valeurs numériques des résultats vont changer. Ne pas paniquer — c'est attendu.

### Testing

- Lancer : npm test -- --coverage
- Objectif : 0 test échoué, couverture >= 90% sur les modules modifiés

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-14 | 1.0 | Création | John (PM) |
