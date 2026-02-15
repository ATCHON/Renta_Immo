# Story V2-S15 : Implémenter le plafond de déficit foncier majoré de 21 400 €

> **Epic** : EPIC-V2-05 | **Sprint** : Sprint 2 | **Effort** : S
> **Statut** : Completed

## Story

**As a** propriétaire bailleur en location nue avec travaux de rénovation énergétique,
**I want** bénéficier du plafond majoré de déficit foncier à 21 400€ pour les travaux réalisés entre 2023 et 2025,
**so that** mon optimisation fiscale soit maximisée et conforme à la loi Énergie-Climat.

## Acceptance Criteria

1. Checkbox "Rénovation énergétique éligible (passage de DPE E/F/G vers A/B/C/D)" dans le formulaire
2. Si cochée ET année de réalisation des travaux <= 2025 : plafond = 21 400€
3. Si non cochée ou année > 2025 : plafond standard = 10 700€
4. Alerte affichée si dispositif expiré : "Dispositif expiré au 31/12/2025 — valable pour simulations historiques"
5. Tests : sans checkbox (10 700€), avec checkbox avant 2025 (21 400€), avec checkbox après 2025 (alerte + 10 700€)

## Tasks / Subtasks

- [x] Ajouter constante DEFICIT_FONCIER.PLAFOND_ENERGIE: 21400 dans constants.ts (la constante existante = 10 700€)
- [x] Ajouter renovationEnergetiqueEligible: boolean et anneeTravauxRenovation: number dans types.ts
- [x] Modifier la logique déficit foncier dans fiscalite.ts (AC: 2, 3)
- [x] Ajouter la checkbox dans le formulaire (StepBien ou StepStructure) (AC: 1)
- [x] Ajouter l'alerte si dispositif expiré (AC: 4)
- [x] Écrire les tests (AC: 5)

## Dev Notes

**Fichiers à modifier :**
- src/config/constants.ts — enrichir DEFICIT_FONCIER
- src/server/calculations/fiscalite.ts — logique déficit foncier location nue
- src/server/calculations/types.ts
- src/components/forms/StepBien.tsx ou StepStructure.tsx

**Contexte** : La loi Énergie-Climat (art. 171 quater du CGI) a temporairement porté le plafond du déficit foncier à 21 400€ pour les travaux de rénovation énergétique permettant de sortir d'une classe F/G vers A/B/C/D, réalisés entre le 01/01/2023 et le 31/12/2025.

**Dispositif expiré** : Le dispositif a expiré le 31/12/2025. L'implémenter quand même pour les simulations rétrospectives.

### Testing

- Fichier : src/server/calculations/fiscalite.test.ts

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-14 | 1.0 | Création | John (PM) |
