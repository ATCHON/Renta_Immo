# Story V2-S24 : Mode Dry Run (simulation impact changement)

> **Epic** : EPIC-V2-08 | **Sprint** : Sprint 4+ | **Effort** : M
> **Statut** : Completed

## Story

**As a** administrateur de la plateforme,
**I want** to be able to test l'impact d'un changement de paramètre sur un jeu de cas tests avant de l'activer,
**so that** les modifications réglementaires ne causent pas de régressions silencieuses.

## Acceptance Criteria

1. Bouton "Dry Run" dans l'interface de modification d'un paramètre
2. Jeu de 5 cas tests prédéfinis (profils investisseurs représentatifs)
3. Affichage des différences de résultats (avant/après) pour chaque cas test
4. La modification n'est pas sauvegardée tant que le dry run n'est pas validé
5. Rapport exportable des différences (CSV ou PDF)

## Tasks / Subtasks

- [x] Dépend de V2-S21, V2-S22
- [x] Définir les 5 cas tests de référence
- [x] Créer l'endpoint POST /api/admin/params/dry-run (AC: 1)
- [x] Afficher le comparatif dans l'UI (AC: 2, 3)
- [x] Implémenter le workflow de confirmation (AC: 4)
- [x] Ajouter l'export rapport (AC: 5)

## Dev Notes

**Fichiers à créer :**
- src/app/api/admin/params/dry-run/route.ts
- Composant DryRunModal.tsx

### Testing

- Test : changer un taux d'abattement → dry run affiche les différences de PV calculées

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-14 | 1.0 | Création | John (PM) |
| 2026-02-16 | 1.1 | Implémentation terminée | Antigravity |
