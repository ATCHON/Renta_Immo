# Story V2-S14 : Conditionner la revalorisation du bien au DPE

> **Epic** : EPIC-V2-04 | **Sprint** : Sprint 2 | **Effort** : S
> **Statut** : Completed

## Story

**As a** investisseur,
**I want** que la revalorisation du bien immobilier dans les projections tienne compte de l'impact du DPE sur la valeur,
**so that** l'estimation de revente soit cohérente avec la réalité du marché.

## Acceptance Criteria

1. DPE F/G : décote appliquée sur la valeur du bien dans les projections (coefficient configurable, défaut -15%)
2. DPE E : décote progressive à partir de 2034
3. DPE A-D : revalorisation normale selon tauxAppreciationAnnuel
4. Cohérence avec V2-S13 (gel loyers ↔ décote valeur)
5. Tests sur projection 20 ans avec différentes classes DPE

## Tasks / Subtasks

- [x] Modifier projection.ts pour appliquer la décote DPE sur la valeur bien (AC: 1, 2, 3)
- [x] Ajouter constante DECOTE_DPE_F_G: 0.15 dans constants.ts (AC: 1)
- [x] Vérifier la cohérence avec V2-S13 (AC: 4)
- [x] Écrire les tests (AC: 5)

## Dev Notes

**Fichiers à modifier :**
- src/server/calculations/projection.ts
- src/config/constants.ts — DECOTE_DPE_F_G

**Note** : La décote de valeur des passoires thermiques est observée sur le marché (études notariales 2023-2024). La valeur de -15% est une estimation conservatrice.

### Testing

- Fichier : src/server/calculations/projection.test.ts

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-14 | 1.0 | Création | John (PM) |
