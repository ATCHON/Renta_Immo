# Story V2-S17 : Ajouter l'alerte seuil LMP (23 000€)

> **Epic** : EPIC-V2-06 | **Sprint** : Sprint 3 | **Effort** : S
> **Statut** : Draft

## Story

**As a** investisseur LMNP avec revenus locatifs élevés,
**I want** être alerté quand mes recettes approchent du seuil LMP (23 000€),
**so that** je puisse anticiper les conséquences fiscales et sociales du passage en LMP.

## Acceptance Criteria

1. Bandeau d'avertissement orange si recettes LMNP > 20 000€
2. Bandeau d'alerte rouge si recettes LMNP > 23 000€ (seuil LMP dépassé)
3. Texte clair : "Vos recettes LMNP dépassent le seuil LMP (23 000€). Vous pourriez être qualifié en LMP avec des conséquences sociales et fiscales différentes. Consultez un expert."
4. L'alerte est visible dans les résultats (pas dans le formulaire)
5. Tests : recettes 15k (pas d'alerte), 21k (orange), 24k (rouge)

## Tasks / Subtasks

- [ ] Ajouter constante SEUIL_ALERTE_LMP: 20000 et SEUIL_LMP: 23000 dans constants.ts
- [ ] Ajouter la logique d'alerte dans synthese.ts (AC: 1, 2)
- [ ] Ajouter le composant bandeau dans les résultats (AC: 3, 4)
- [ ] Écrire les tests (AC: 5)

## Dev Notes

**Fichiers à modifier :**
- src/config/constants.ts
- src/server/calculations/synthese.ts — ajouter dans la section alertes
- src/components/results/ — bandeau alerte LMP

**Seuil LMP** : Un loueur est qualifié LMP si ses recettes LMNP > 23 000€/an ET > revenus du foyer fiscal. Conséquences : cotisations sociales TNS, plus-value professionnelle différente.

### Testing

- Fichier : src/server/calculations/synthese.test.ts

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-14 | 1.0 | Création | John (PM) |
