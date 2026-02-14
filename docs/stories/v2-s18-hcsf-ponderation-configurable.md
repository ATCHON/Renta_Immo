# Story V2-S18 : Rendre la pondération loyers HCSF configurable

> **Epic** : EPIC-V2-07 | **Sprint** : Sprint 3 | **Effort** : S
> **Statut** : Draft

## Story

**As a** utilisateur faisant une simulation d'emprunt,
**I want** pouvoir ajuster la pondération des loyers dans le calcul HCSF (actuellement fixée à 70%),
**so that** la simulation reflète les critères réels de ma banque ou l'impact d'une GLI.

## Acceptance Criteria

1. Champ numérique dans le formulaire HCSF (section financement) : "Pondération loyers (%)", défaut 70
2. Bouton "Avec GLI" qui passe la pondération à 80%
3. Note explicative : "La banque peut prendre en compte 70 à 80% des loyers selon les établissements. Avec une GLI (Garantie Loyers Impayés), certaines banques appliquent 80%."
4. La valeur est propagée dans hcsf.ts pour le calcul du taux d'effort
5. Tests : pondération 70% vs 80% → différence sur le taux d'endettement

## Tasks / Subtasks

- [ ] Ajouter ponderationLoyers: number dans les types et le store (défaut 0.70)
- [ ] Modifier hcsf.ts pour utiliser la pondération configurable (AC: 4)
- [ ] Ajouter le champ dans StepFinancement.tsx (AC: 1)
- [ ] Ajouter le bouton GLI (AC: 2)
- [ ] Ajouter la note explicative (AC: 3)
- [ ] Écrire les tests (AC: 5)

## Dev Notes

**Fichiers à modifier :**
- src/server/calculations/hcsf.ts — PONDERATION_LOCATIFS actuellement fixé à 70%
- src/components/forms/StepFinancement.tsx
- src/stores/calculateur.store.ts

### Testing

- Fichier : src/server/calculations/hcsf.test.ts
- Test : même emprunt → taux d'effort différent avec 70% vs 80% de pondération

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-14 | 1.0 | Création | John (PM) |
