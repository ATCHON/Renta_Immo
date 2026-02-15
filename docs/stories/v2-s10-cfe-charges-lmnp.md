# Story V2-S10 : Intégrer la CFE dans les charges LMNP avec logique d'exonération

> **Epic** : EPIC-V2-03 | **Sprint** : Sprint 1-2 | **Effort** : M
> **Statut** : Completed

## Story

**As a** investisseur LMNP au régime réel,
**I want** que la Cotisation Foncière des Entreprises soit intégrée dans mes charges déductibles avec les bonnes règles d'exonération,
**so that** mon résultat fiscal soit correct.

## Acceptance Criteria

1. CFE ajoutée aux charges si recettes annuelles >= 5 000€
2. CFE exonérée la 1ère année d'activité
3. CFE déductible en régime réel uniquement (pas en micro-BIC)
4. Champ dans le formulaire avec valeur par défaut 300€ et infobulle explicative
5. Tests : recettes < 5000€ (sans CFE), recettes >= 5000€ (avec CFE), 1ère année (sans CFE)

## Tasks / Subtasks

- [x] Dépend de V2-S09 (catégories LMNP définies)
- [x] Ajouter constante CFE_SEUIL_EXONERATION: 5000 dans constants.ts (CFE_MIN existe déjà à 200)
- [x] Modifier calculerLMNPReel() pour intégrer CFE (AC: 1, 2, 3)
- [x] Ajouter champ CFE dans StepExploitation.tsx avec infobulle (AC: 4)
- [x] Connecter au store Zustand
- [x] Écrire les tests (AC: 5)

## Dev Notes

**Fichiers à modifier :**
- src/config/constants.ts — enrichir les constantes CFE (CFE_MIN: 200 existe)
- src/server/calculations/fiscalite.ts — calculerLMNPReel()
- src/components/forms/StepExploitation.tsx — champ CFE

**Règle** : La CFE est due par tout loueur meublé non professionnel dont les recettes dépassent 5 000€/an. Elle est exonérée la première année civile d'activité.

**Infobulle** : "La CFE (Cotisation Foncière des Entreprises) est due par les loueurs meublés dont les recettes dépassent 5 000€/an. Exonérée la 1ère année. Non déductible en Micro-BIC."

### Testing

- Fichier : src/server/calculations/fiscalite.test.ts

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-14 | 1.0 | Création | John (PM) |
