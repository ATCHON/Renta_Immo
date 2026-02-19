# Story V2-S22 : Migrer les constantes du code vers la base de données

> **Epic** : EPIC-V2-08 | **Sprint** : Sprint 4+ | **Effort** : L
> **Statut** : Completed

## Story

**As a** développeur,
**I want** que les valeurs de constants.ts soient servies depuis la base de données plutôt qu'en dur dans le code,
**so that** les mises à jour réglementaires ne nécessitent plus de redéploiement.

## Acceptance Criteria

1. Toutes les valeurs réglementaires de constants.ts sont en BDD
2. Service ConfigService avec cache Redis/mémoire pour les performances
3. Fallback sur les valeurs en dur de constants.ts si BDD indisponible
4. Aucune régression fonctionnelle (tous les tests passent)
5. Les constantes restent dans constants.ts comme valeurs par défaut/fallback

## Tasks / Subtasks

- [x] Dépend de V2-S19, V2-S20, V2-S21
- [x] Créer src/server/services/config.service.ts avec cache mémoire (AC: 2)
- [x] Implémenter le fallback sur constants.ts (AC: 3)
- [x] Peupler la BDD avec les valeurs actuelles de constants.ts (AC: 1)
- [x] Remplacer les appels directs à constants.ts dans les calculateurs (AC: 1)
- [x] Lancer npm test complet (AC: 4)

## Dev Notes

**Fichiers à créer :**

- src/server/services/config.service.ts
- src/server/config/config-service.ts (implémenté sous ce nom)

**Note** : Refactoring majeur de src/config/constants.ts. Garder les valeurs comme fallback.

### Testing

- Test du fallback : simuler une indisponibilité BDD → calculs continuent avec valeurs par défaut
- npm test complet : 0 régression (56 tests validés)

## Change Log

| Date       | Version | Description             | Author      |
| ---------- | ------- | ----------------------- | ----------- |
| 2026-02-14 | 1.0     | Création                | John (PM)   |
| 2026-02-16 | 1.1     | Implémentation terminée | Antigravity |
