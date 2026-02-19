# Story V2-S05 : Paramètres résidence de services et mobilier dans réintégration PV LMNP

> **Epic** : EPIC-V2-01 | **Sprint** : Sprint 1 | **Effort** : M
> **Statut** : Completed
> **Remplace** : E5 du backlog P3

## Story

**As a** investisseur LMNP,
**I want** que la réintégration des amortissements lors du calcul de plus-value tienne compte du type de résidence, du mobilier, et de la date d'application,
**so that** mon montant de plus-value imposable soit exact selon ma situation.

## Acceptance Criteria

1. Champ typeResidence dans le formulaire : classique | services (résidences de services : EHPAD, étudiantes, etc.)
2. Les amortissements mobilier sont exclus de la réintégration (seul l'immobilier est réintégré)
3. Les résidences de services sont exemptées de réintégration (loi Le Meur)
4. La date d'application est respectée : règle applicable aux cessions depuis le 15/02/2025
5. Si date de cession < 15/02/2025 : ancienne règle (réintégration totale)

## Tasks / Subtasks

- [x] Ajouter typeResidence: 'classique' | 'services' dans types.ts (AC: 1)
- [x] Ajouter le sélecteur dans le formulaire (StepBien ou StepStructure) (AC: 1)
- [x] Modifier calculerPlusValueIR() pour exclure mobilier de la réintégration (AC: 2)
  - [x] Identifier la part mobilier dans les amortissements (champ amortissementMobilier)
- [x] Ajouter l'exemption résidences de services (AC: 3)
- [x] Ajouter la condition sur la date d'application (AC: 4, 5)
  - [x] Constante DATE_APPLICATION_LOI_LE_MEUR = new Date('2025-02-15')
- [x] Tests : résidence classique vs services, avec/sans mobilier, avant/après 15/02/2025

## Dev Notes

**Dépendance** : Doit s'appuyer sur la nouvelle formule de V2-S01.

**Fichiers à modifier :**

- src/server/calculations/types.ts — ajout typeResidence, amortissementMobilier
- src/server/calculations/fiscalite.ts — enrichir calculerPlusValueIR()
- src/config/constants.ts — DATE_APPLICATION_LOI_LE_MEUR
- src/components/forms/StepBien.tsx ou StepStructure.tsx

**Loi Le Meur** : Les résidences de services (EHPAD, résidences étudiantes gérées) sont exemptées de la réintégration des amortissements dans le calcul de plus-value pour les cessions depuis le 15/02/2025.

### Testing

- Fichier : src/server/calculations/plus-value.test.ts
- Cas obligatoires : résidence classique, résidence services, cession avant/après 15/02/2025

## Change Log

| Date       | Version | Description | Author    |
| ---------- | ------- | ----------- | --------- |
| 2026-02-14 | 1.0     | Création    | John (PM) |
