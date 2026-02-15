# Story V2-S09 : Propager les 3 catégories Micro-BIC dans le calculateur fiscal

> **Epic** : EPIC-V2-03 | **Sprint** : Sprint 1-2 | **Effort** : M
> **Statut** : Completed

## Story

**As a** investisseur en location meublée,
**I want** que le calcul fiscal Micro-BIC applique le bon abattement et plafond selon ma catégorie de location (longue durée, tourisme classé, tourisme non classé),
**so that** mon optimisation fiscale soit correcte.

## Acceptance Criteria

1. calculerMicroBIC() applique le bon abattement selon typeLocation :
   - meublee_longue_duree : 50%, plafond 77 700€
   - meublee_tourisme_classe : 71%, plafond 188 700€
   - meublee_tourisme_non_classe : 50%, plafond 77 700€
2. Sélecteur visible dans le formulaire (StepStructure) avec les 3 options
3. Tests pour chaque catégorie avec différents niveaux de revenus (sous/au-dessus du plafond)
4. La propagation est cohérente du formulaire → store → API → calcul

## Tasks / Subtasks

- [x] Vérifier calculerMicroBIC() dans fiscalite.ts pour les 3 types (AC: 1)
- [x] Vérifier le sélecteur dans StepStructure.tsx (AC: 2)
- [x] Ajouter les constantes dans constants.ts si manquantes
- [x] Écrire les tests pour les 3 catégories (AC: 3)
- [x] Vérifier la propagation end-to-end (AC: 4)

## Dev Notes

**Fichiers à vérifier :**
- src/server/calculations/fiscalite.ts — calculerMicroBIC()
- src/config/constants.ts — plafonds et abattements Micro-BIC
- src/components/forms/StepStructure.tsx — sélecteur TypeLocation
- src/server/calculations/types.ts — TypeLocation enum (4 valeurs dont nue)

**Note** : TypeLocation a déjà 4 valeurs dans le code. Vérifier que calculerMicroBIC() gère bien les 3 catégories LMNP distinctement.

### Testing

- Fichier : src/server/calculations/fiscalite.test.ts
- Lancer : npm test -- --testPathPattern=fiscalite

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-14 | 1.0 | Création | John (PM) |
