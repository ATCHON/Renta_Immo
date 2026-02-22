# Story V2-S25 : Page d'Audit Global et historique des modifications

> **Epic** : EPIC-V2-08 | **Sprint** : Sprint 4+ | **Effort** : S
> **Statut** : Completed

## Story

**As a** administrateur de la plateforme,
**I want** accéder à une vue unifiée et globale de toutes les modifications apportées aux paramètres du simulateur,
**so that** je puisse contrôler et tracer les changements de version, les motifs de modification et leurs auteurs indépendamment du paramètre concerné.

## Acceptance Criteria

1. Un lien "Audit Global" est présent et actif dans la navigation de l'administration.
2. La route API sécurisée `GET /api/admin/audit` retourne l'historique complet, enrichi avec les labels des paramètres et les emails des administrateurs.
3. L'API implémente un système de pagination afin de supporter le volume de logs qui augmentera avec le temps.
4. Une interface utilisateur (tableau de données) affiche les logs sous forme chronologique avec un format clair (Date, Administrateur, Paramètre, Ancienne valeur → Nouvelle valeur, Motif).

## Tasks / Subtasks

- [x] Créer le service DAO `getGlobalAuditLogs` dans `src/server/admin/audit-service.ts` (AC: 2, 3)
- [x] Créer la route d'API paginée dans `src/app/api/admin/audit/route.ts` (AC: 2, 3)
- [x] Réactiver le lien du menu "Audit Global" dans `src/app/admin/layout.tsx` (AC: 1)
- [x] Créer le composant client `AuditGlobalTable` avec gestion de la pagination (AC: 4)
- [x] Créer la page principale `src/app/admin/audit/page.tsx` embarquant le tableau (AC: 4)
- [x] Assurer le bon fonctionnement et le typage strict (`tsc`, `eslint`).

## Dev Notes

**Fichiers à modifier / créer :**

- `src/server/admin/audit-service.ts` (Nouveau)
- `src/app/api/admin/audit/route.ts` (Nouveau)
- `src/app/admin/audit/page.tsx` (Nouveau)
- `src/components/admin/AuditGlobalTable.tsx` (Nouveau)
- `src/app/admin/layout.tsx` (Modifié)

**Pagination** : Implémentée nativement via un comptage (`count`) puis un range (`range()`) sur Supabase, avec des enrichissements applicatifs synchrones (`in` query) sur une taille de page plafonnée à 50.

### Testing

- L'affichage correct du tableau sur l'URL `/admin/audit`.
- Vérifier le fonctionnement de la pagination (Si `totalPages` > 1).
- Vérifier l'intégration dans `test:e2e tests/e2e/calculateur/validation.spec.ts`.

## Change Log

| Date       | Version | Description             | Author      |
| ---------- | ------- | ----------------------- | ----------- |
| 2026-02-22 | 1.0     | Implémentation terminée | Antigravity |
