# Story V2-S19 : Concevoir le schéma de données ConfigParam

> **Epic** : EPIC-V2-08 | **Sprint** : Sprint 4+ | **Effort** : M
> **Statut** : Completed

## Story

**As a** développeur du back-office,
**I want** un schéma de données robuste pour stocker les paramètres réglementaires en base de données,
**so that** les paramètres puissent être gérés, versionnés, et mis à jour sans redéploiement.

## Acceptance Criteria

1. Interface TypeScript ConfigParam définie avec : id, cle, valeur, type, anneeFiscale, description, dateDebut, dateFin, createdAt, updatedAt
2. Migration Supabase créée : table config_params avec index sur (cle, anneeFiscale)
3. Versioning par année fiscale : possible d'avoir plusieurs valeurs pour la même clé selon l'année
4. Les 8 blocs de paramètres (A à H du v2) sont documentés avec leurs clés
5. Validation du schéma : contrainte d'unicité sur (cle, anneeFiscale)

## Tasks / Subtasks

- [x] Définir l'interface TypeScript ConfigParam dans src/server/types/config.ts (AC: 1)
- [x] Créer le fichier de migration Supabase (AC: 2)
- [x] Documenter les 8 blocs de paramètres et leurs clés (AC: 4)
- [x] Tester la migration dans l'environnement de dev

## Dev Notes

**Architecture** : Nouveau module — ne pas modifier les fichiers existants.

**Fichiers à créer :**

- src/server/types/config.ts — interface ConfigParam
- Migration Supabase : supabase/migrations/YYYYMMDD_config_params.sql

**Blocs paramètres v2** : A (Fiscalité LMNP), B (Fiscalité foncier), C (Plus-value), D (HCSF), E (DPE), F (Scoring), G (Charges), H (Projections)

**Note Supabase** : Utiliser createAdminClient() pour les opérations admin (service role key).

### Testing

- Test : création d'un ConfigParam, lecture par clé et année fiscale
- Vérifier contrainte d'unicité

## Change Log

| Date       | Version | Description             | Author      |
| ---------- | ------- | ----------------------- | ----------- |
| 2026-02-14 | 1.0     | Création                | John (PM)   |
| 2026-02-16 | 1.1     | Implémentation terminée | Antigravity |
