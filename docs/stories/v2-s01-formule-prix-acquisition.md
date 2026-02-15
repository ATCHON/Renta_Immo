# Story V2-S01 : Corriger la formule prix d'acquisition corrigé (forfaits 7.5% + 15%)

> **Epic** : EPIC-V2-01 | **Sprint** : Sprint 1 | **Effort** : M
> **Statut** : Completed

## Story

**As a** investisseur immobilier,
**I want** que le calcul de plus-value intègre correctement les forfaits de frais (7.5%) et travaux (15%) AVANT la soustraction des amortissements,
**so that** le montant de plus-value imposable soit conforme à la réglementation fiscale en vigueur.

## Acceptance Criteria

1. La PV brute est calculée avec : `prixAcquisitionCorrigé = prixAchat * (1 + 0.075) + travaux * 1.15`
2. Les amortissements LMNP sont soustraits APRÈS application des forfaits
3. La formule actuelle `prixVente - prixAchat + amortissements` est remplacée
4. Tests paramétriques : PV correcte pour détentions > 5 ans avec et sans travaux déclarés
5. Les cas de test du v2 section 5.1/5.2 passent tous

## Tasks / Subtasks

- [x] Lire et comprendre la formule actuelle dans `fiscalite.ts` (fonction `calculerPlusValueIR`)
  - [x] Identifier la ligne de calcul `prixVente - prixAchat + amortissements`
- [x] Ajouter les constantes dans `constants.ts`
  - [x] `FORFAIT_FRAIS_ACQUISITION: 0.075`
  - [x] `FORFAIT_TRAVAUX_PV: 0.15`
- [x] Refactorer `calculerPlusValueIR()` pour appliquer les forfaits avant amortissements (AC: 1, 2, 3)
- [x] Écrire les tests TDD dans `plus-value.test.ts` (AC: 4, 5)
  - [x] Cas : achat 200k, pas de travaux déclarés (forfait 7.5% appliqué)
  - [x] Cas : achat 200k + 50k travaux déclarés (forfait 15% appliqué)
  - [x] Cas : détention 10 ans, 20 ans, 30 ans avec abattements
- [x] Vérifier que V2-S05 (réintégration amort) peut s'appuyer sur cette nouvelle formule

## Dev Notes

**Fichiers à modifier :**
- `src/config/constants.ts` — ajouter `FORFAIT_FRAIS_ACQUISITION` et `FORFAIT_TRAVAUX_PV`
- `src/server/calculations/fiscalite.ts` — refactorer `calculerPlusValueIR()`

**Règle métier v2 (section 5.1) :**
```
Prix acquisition corrigé = prix achat × (1 + 7.5%) + travaux × (1 + 15%)
PV brute = prix vente - prix acquisition corrigé
PV nette = PV brute - amortissements réintégrés
```

**ATTENTION** : Ne pas toucher à V2-S05 (réintégration mobilier/résidences de services) dans cette story. V2-S01 pose les bases, V2-S05 enrichit.

### Testing

- Framework : Jest
- Fichier test : `src/server/calculations/plus-value.test.ts`
- Pattern : TDD — écrire les tests AVANT la correction
- Lancer : `npm test -- --testPathPattern=plus-value`

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-14 | 1.0 | Création | John (PM) |
