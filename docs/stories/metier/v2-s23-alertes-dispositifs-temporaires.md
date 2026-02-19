# Story V2-S23 : Système d'alertes pour dispositifs temporaires

> **Epic** : EPIC-V2-08 | **Sprint** : Sprint 4+ | **Effort** : M
> **Statut** : Completed

## Story

**As a** administrateur de la plateforme,
**I want** être alerté automatiquement 90 jours avant l'expiration d'un dispositif réglementaire temporaire,
**so that** les mises à jour fiscales soient anticipées et non réactives.

## Acceptance Criteria

1. Dashboard admin affiche le statut de tous les dispositifs temporaires (actif, expirant bientôt, expiré)
2. Alerte dans le dashboard si dateFin - today <= 90 jours
3. Email automatique 90 jours avant expiration (optionnel : 30 jours)
4. Les dispositifs expirés sont clairement marqués (rouge) mais conservés pour l'historique

## Tasks / Subtasks

- [x] Dépend de V2-S21 (interface admin)
- [x] Ajouter la logique de calcul de statut dans le ConfigService (AC: 1, 2)
- [x] Afficher le statut dans l'interface admin (AC: 1, 4)
- [x] Implémenter l'envoi d'email (utiliser le service email existant si disponible) (AC: 3)
- [x] Écrire les tests

## Dev Notes

**Fichiers à modifier :**

- src/server/services/config.service.ts
- src/app/admin/params/page.tsx

**Email** : Vérifier si le service email de l'envoi de rapport PDF existe et peut être réutilisé.

### Testing

- Test : dispositif avec dateFin dans 60 jours → alerte visible dans dashboard

## Change Log

| Date       | Version | Description             | Author      |
| ---------- | ------- | ----------------------- | ----------- |
| 2026-02-14 | 1.0     | Création                | John (PM)   |
| 2026-02-16 | 1.1     | Implémentation terminée | Antigravity |
