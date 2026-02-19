# Story V2-S17 : Ajouter l'alerte seuil LMP (23 000€)

> **Epic** : EPIC-V2-06 | **Sprint** : Sprint 3 | **Effort** : S
> **Statut** : Done

## Story

**As a** investisseur LMNP avec revenus locatifs élevés,
**I want** être alerté quand mes recettes approchent du seuil LMP (23 000€),
**so that** je puisse anticiper les conséquences fiscales et sociales du passage en LMP.

## Acceptance Criteria

1. Bandeau d'avertissement orange si recettes LMNP > 20 000€ ✅
2. Bandeau d'alerte rouge si recettes LMNP > 23 000€ (seuil LMP dépassé) ✅
3. Texte clair mentionnant le seuil et la recommandation de consulter un expert ✅
4. L'alerte est visible dans les résultats (pas dans le formulaire) ✅
5. Tests : recettes 15k (pas d'alerte), 21k (orange), 24k (rouge) ✅

## Tasks / Subtasks

- [x] Ajouter constantes `CONSTANTS.LMP.SEUIL_ALERTE: 20000` et `SEUIL_LMP: 23000` dans `constants.ts`
- [x] Ajouter `genererAlertesLmp()` dans `synthese.ts` (AC: 1, 2)
- [x] Injecter les alertes LMP dans `genererSynthese()` pour les régimes `lmnp_reel` et `lmnp_micro` (AC: 4)
- [x] Ajouter le composant `AlerteLmp` dans `src/components/results/` (AC: 3, 4)
- [x] Intégrer `AlerteLmp` dans `Dashboard.tsx` dans la section Points d'Attention
- [x] Écrire les tests (AC: 5)

## Implémentation

### Logique d'alerte (`genererAlertesLmp`)

```typescript
// src/server/calculations/synthese.ts
export function genererAlertesLmp(recettesLmnpAnnuelles: number): PointAttention[];
```

| Recettes          | Type              | Niveau             |
| ----------------- | ----------------- | ------------------ |
| ≤ 20 000€         | Aucune alerte     | —                  |
| 20 001€ – 23 000€ | Approche du seuil | `warning` (orange) |
| > 23 000€         | Seuil LMP dépassé | `error` (rouge)    |

### Double affichage

Les alertes LMP apparaissent à deux niveaux :

1. **Dans `points_attention_detail`** — incluses automatiquement via `genererSynthese()` pour les régimes LMNP
2. **En bandeau séparé** dans le Dashboard via le composant `AlerteLmp` — plus visible, calculé depuis `exploitation.loyer_mensuel * 12 * taux_occupation`

### Fichiers modifiés

- `src/config/constants.ts` — bloc `LMP` avec `SEUIL_ALERTE` et `SEUIL_LMP`
- `src/server/calculations/synthese.ts` — fonction `genererAlertesLmp()`, injection dans `genererSynthese()`
- `src/components/results/AlerteLmp.tsx` — nouveau composant bandeau
- `src/components/results/Dashboard.tsx` — intégration dans la section Points d'Attention
- `src/components/results/index.ts` — export du nouveau composant

### Testing

- Fichier : `src/server/calculations/synthese.test.ts`
- 3 tests ajoutés dans `V2-S17 : Alertes seuil LMP` :
  - 15 000€ → 0 alerte
  - 21 000€ → 1 alerte `warning`
  - 24 000€ → 1 alerte `error`

## Change Log

| Date       | Version | Description                            | Author    |
| ---------- | ------- | -------------------------------------- | --------- |
| 2026-02-14 | 1.0     | Création                               | John (PM) |
| 2026-02-15 | 1.1     | Implémentation complète — 169 tests OK | Dev       |
