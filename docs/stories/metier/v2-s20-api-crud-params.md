# Story V2-S20 : Créer l'API CRUD pour les paramètres

> **Epic** : EPIC-V2-08 | **Sprint** : Sprint 4+ | **Effort** : L
> **Statut** : Completed

## Story

**As a** administrateur de la plateforme,
**I want** une API REST sécurisée pour gérer les paramètres réglementaires,
**so that** je puisse mettre à jour les valeurs sans toucher au code source.

## Acceptance Criteria

1. GET /api/admin/params — liste tous les paramètres avec filtres (anneeFiscale, bloc)
2. GET /api/admin/params/:cle — détail d'un paramètre
3. PUT /api/admin/params/:cle — mise à jour d'un paramètre
4. POST /api/admin/params — création d'un nouveau paramètre
5. Authentification admin requise (Better Auth, rôle admin)
6. Validation de cohérence sur PUT/POST (type, plages valides)
7. Audit log : chaque modification enregistrée dans une table config_params_audit

## Tasks / Subtasks

- [x] Dépend de V2-S19 (schéma défini)
- [x] Créer src/app/api/admin/params/route.ts (AC: 1, 4)
- [x] Créer src/app/api/admin/params/[cle]/route.ts (AC: 2, 3)
- [x] Implémenter la vérification du rôle admin via Better Auth (AC: 5)
- [x] Ajouter la validation de cohérence (AC: 6)
- [x] Créer la table audit et l'enregistrement des modifications (AC: 7)

## Dev Notes

**Auth** : Utiliser auth.ts (Better Auth). Vérifier le rôle admin de l'utilisateur connecté.
**DB** : createAdminClient() depuis src/lib/supabase/

**Fichiers à créer :**

- src/app/api/admin/params/route.ts
- src/app/api/admin/params/[cle]/route.ts

### Testing

- Tests API : chaque endpoint, avec et sans auth admin
- Test audit log : vérifier l'enregistrement après modification

## Change Log

| Date       | Version | Description             | Author      |
| ---------- | ------- | ----------------------- | ----------- |
| 2026-02-14 | 1.0     | Création                | John (PM)   |
| 2026-02-16 | 1.1     | Implémentation terminée | Antigravity |
