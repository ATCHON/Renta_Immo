# Story V2-S11 : Frais de comptabilité LMNP réel (sans réduction OGA/CGA)

> **Epic** : EPIC-V2-03 | **Sprint** : Sprint 1-2 | **Effort** : S
> **Statut** : Draft

## Story

**As a** investisseur LMNP au régime réel,
**I want** que les frais de comptabilité soient intégrés comme charge déductible à 100% sans référence à la réduction OGA/CGA supprimée,
**so that** mes charges déductibles soient correctement calculées.

## Acceptance Criteria

1. Champ "frais de comptabilité" visible UNIQUEMENT en régime réel
2. Déductible à 100% en charge (pas de réduction 2/3)
3. Valeur par défaut : 500€
4. AUCUNE mention de réduction 915€, OGA, ou CGA dans l'UI et le code de cette feature
5. Infobulle explicative sur la déductibilité

## Tasks / Subtasks

- [ ] Vérifier COMPTABLE_LMNP: 400 dans constants.ts (AC: 3 — mettre à jour à 500€)
- [ ] Modifier calculerLMNPReel() pour déduire 100% des frais compta (AC: 2)
- [ ] Ajouter/modifier le champ dans le formulaire conditionnel au régime réel (AC: 1, 4)
- [ ] Ajouter l'infobulle (AC: 5)
- [ ] Vérifier qu'aucune référence OGA/CGA n'est ajoutée (coordination avec V2-S12)

## Dev Notes

**Fichiers à modifier :**
- src/config/constants.ts — COMPTABLE_LMNP: 400 → 500
- src/server/calculations/fiscalite.ts — calculerLMNPReel()
- src/components/forms/StepExploitation.tsx

**Contexte LFI 2025** : La réduction d'impôt pour adhésion à un OGA/CGA (anciennement 2/3 des frais plafonné à 915€) a été supprimée. Les frais de comptabilité restent déductibles comme charge à 100% en régime réel.

### Testing

- Test : régime micro-BIC → champ non visible
- Test : régime réel → champ visible, 500€ par défaut, inclus dans calcul charges

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-14 | 1.0 | Création | John (PM) |
