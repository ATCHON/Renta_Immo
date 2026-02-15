# Story V2-S18 : Rendre la pondération loyers HCSF configurable

> **Epic** : EPIC-V2-07 | **Sprint** : Sprint 3 | **Effort** : S
> **Statut** : Done

## Story

**As a** utilisateur faisant une simulation d'emprunt,
**I want** pouvoir ajuster la pondération des loyers dans le calcul HCSF (actuellement fixée à 70%),
**so that** la simulation reflète les critères réels de ma banque ou l'impact d'une GLI.

## Acceptance Criteria

1. Champ numérique (slider) dans le formulaire (section financement) : "Pondération loyers HCSF", défaut 70% ✅
2. Bouton "Avec GLI (80%)" qui fixe la pondération à 80% ✅
3. Note explicative visible dans le formulaire ✅
4. La valeur est propagée dans `hcsf.ts` pour le calcul du taux d'endettement ✅
5. Tests : pondération 70% vs 80% → différence sur le taux d'endettement ✅

## Tasks / Subtasks

- [x] Ajouter `ponderation_loyers?: number` dans `OptionsData` (défaut 70) dans `src/types/calculateur.ts`
- [x] Modifier `calculerRevenusPonderes()` dans `hcsf.ts` pour accepter un paramètre de pondération (AC: 4)
- [x] Modifier `calculerHcsfNomPropre()` et `calculerHcsfSciIs()` pour propager la pondération
- [x] Modifier `analyserHcsf()` pour lire `data.options.ponderation_loyers` et le propager
- [x] Ajouter le slider et le bouton GLI dans `StepFinancement.tsx` (AC: 1, 2)
- [x] Ajouter la note explicative (AC: 3)
- [x] Sauvegarder via `updateOptions({ ponderation_loyers })` au submit du formulaire
- [x] Écrire les tests (AC: 5)

## Implémentation

### Propagation de la pondération

```
OptionsData.ponderation_loyers (number, 60–90, défaut 70)
  ↓ via analyserHcsf()
  calculerHcsfNomPropre() / calculerHcsfSciIs()
    ↓ ponderationLoyers / 100 (conversion % → décimal)
    calculerRevenusPonderes(..., ponderation)
```

La valeur est stockée en **pourcentage entier** (70, 80...) dans le store/options et convertie en décimal (0.70, 0.80) à l'entrée des fonctions de calcul.

### UI dans StepFinancement

- Slider HTML natif (`range`) de 60 à 90 par pas de 5
- Bouton "Avec GLI (80%)" qui fixe la valeur à 80
- Affichage de la valeur courante en temps réel
- Note explicative sous forme de sous-titre du bloc

### Compatibilité rétroactive

`data.options` peut être `undefined` dans les anciens tests — géré avec `?.ponderation_loyers` :
```typescript
const ponderationLoyers = (data.options as {...} | undefined)?.ponderation_loyers;
```
Si absent → fallback sur `HCSF_CONSTANTES.PONDERATION_LOCATIFS` (0.70), comportement inchangé.

### Fichiers modifiés

- `src/types/calculateur.ts` — champ `ponderation_loyers` dans `OptionsData`
- `src/server/calculations/hcsf.ts` — `calculerRevenusPonderes()`, `calculerHcsfNomPropre()`, `calculerHcsfSciIs()`, `analyserHcsf()`
- `src/components/forms/StepFinancement.tsx` — slider + bouton GLI + note explicative
- `src/stores/calculateur.store.ts` — défaut `ponderation_loyers: 70`

### Testing

- Fichier : `src/server/calculations/hcsf.test.ts`
- 3 tests ajoutés dans `V2-S18 : Pondération loyers HCSF configurable` :
  - pondération 70% par défaut → taux ≈ 13.30%
  - pondération 80% avec GLI → taux ≈ 13.02%
  - pondération 80% donne un taux d'endettement plus bas que 70%

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-14 | 1.0 | Création | John (PM) |
| 2026-02-15 | 1.1 | Implémentation complète — 169 tests OK | Dev |
