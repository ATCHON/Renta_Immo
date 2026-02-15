# Story V2-S13 : Conditionner l'inflation des loyers à la classe DPE

> **Epic** : EPIC-V2-04 | **Sprint** : Sprint 2 | **Effort** : S
> **Statut** : Completed
> **Fusionne** : E4 (DPE alertes) du backlog P3

## Story

**As a** investisseur,
**I want** que les projections de loyers tiennent compte de la classe DPE pour appliquer le gel légal des loyers des passoires thermiques,
**so that** mes projections long terme soient réalistes et conformes à la loi.

## Acceptance Criteria

1. DPE F ou G : taux d'inflation des loyers = 0% dès la 1ère année de projection
2. DPE E : taux d'inflation des loyers = 0% à partir de 2034 (dans les projections)
3. DPE A, B, C, D : taux d'inflation normal (ILC/IRL paramétré)
4. Alerte forte (rouge) affichée si DPE F ou G : "Loyer gelé — bien non louable après 2025"
5. Tests pour chaque classe DPE sur projection 30 ans

## Tasks / Subtasks

- [x] Modifier projection.ts pour conditionner tauxInflationLoyer au DPE (AC: 1, 2, 3)
- [x] Ajouter la logique de date 2034 pour DPE E (AC: 2)
- [x] Ajouter les alertes dans synthese.ts (AC: 4)
- [x] Écrire les tests (AC: 5)

## Dev Notes

**Fichiers à modifier :**
- src/server/calculations/projection.ts
- src/server/calculations/synthese.ts

**Dépendance** : Doit s'exécuter après EPIC-V2-02 (la projection intègre déjà tauxOccupation).

**Règle légale :**
- Passoires thermiques F/G : interdiction d'augmenter les loyers depuis 2022
- DPE E : probable extension du gel en 2034 selon la loi Climat
- DPE F/G : interdiction de location prévue progressivement

### Testing

- Fichier : src/server/calculations/projection.test.ts
- Tests : DPE A/B/C/D (loyers augmentent), F/G (stagnent), E (augmentent jusqu'en 2034)

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-14 | 1.0 | Création | John (PM) |
