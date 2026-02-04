# Story TECH-024 : Compléments et Dette Technique Supabase

> **Version** : 1.0
> **Date** : 2026-02-04
> **Auteur** : Antigravity (Assistant)
> **Statut** : 📋 Backlog
> **Type** : Feature / QA / Debt
> **Epic** : Epic 1 - Infrastructure Backend (Phase 2)
> **Sprint** : Sprint 2 (Compléments)

---

## 1. Description

**En tant que** développeur
**Je veux** finaliser les éléments manquants de l'intégration Supabase
**Afin de** respecter 100% des critères d'acceptation initiaux et assurer une robustesse de production.

---

## 2. Points à Finaliser

### 2.1 Interface Utilisateur (UI)
- [ ] **Page de Détail (`/simulations/[id]`)** : Créer la page de visualisation complète d'une simulation sauvegardée.
- [ ] **Actions de Gestion** :
  - Brancher la suppression (avec confirmation).
  - Brancher la mise en favoris (toggle ⭐).
  - Brancher l'archivage.
  - Implémenter la modale de renommage.
- [ ] **Filtres & Tris** : Rendre fonctionnels les tris (date, score, nom) et les filtres (favoris uniquement) dans la liste.
- [ ] **Pagination UI** : Ajouter les contrôles de navigation dans la liste des simulations.

### 2.2 Qualité et Tests (QA)
- [ ] **Tests Unitaires API** : Créer une suite de tests (Vitest) pour valider les Route Handlers `GET`, `POST`, `PATCH`, `DELETE`.
- [ ] **Validation Zod** : Étendre la validation aux paramètres de requête (query params).
- [ ] **Tests E2E** : Mettre en place des tests Playwright pour le flux complet "Calcul -> Sauvegarde -> Consultation".

### 2.3 Infrastructure et Types
- [ ] **Génération Automatique des Types** : Utiliser la CLI Supabase pour générer `src/types/database.ts` dynamiquement.
- [ ] **Middleware de Connexion** : Implémenter un middleware pour rediriger les utilisateurs non connectés tentant d'accéder à `/simulations`.

---

## 3. Critères d'acceptation de la story

- [ ] L'utilisateur peut consulter chaque simulation individuellement.
- [ ] Toutes les actions (supprimer, favori, renommer) sont persistées en base de données.
- [ ] La couverture de tests sur l'API atteint 80% minimum.
- [ ] Les types TypeScript sont synchronisés avec la base de données réelle.

---

## 4. Estimation

| Métrique | Valeur |
|----------|--------|
| Points | 8 |
| Priorité | P2 |
| Risque | Faible |

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-02-04 | 1.0 | Création initiale des compléments Sprint 2 | Antigravity |
