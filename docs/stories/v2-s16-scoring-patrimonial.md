# Story V2-S16 : Implémenter le profil scoring "Patrimonial"

> **Epic** : EPIC-V2-06 | **Sprint** : Sprint 3 | **Effort** : M
> **Statut** : Done

## Story

**En tant que** investisseur orienté patrimoine (plutôt que cashflow),
**Je veux** pouvoir activer un profil scoring "Patrimonial" qui pondère davantage le TRI long terme et la valorisation du bien,
**Afin que** les recommandations correspondent à mes objectifs d'investissement.

## Acceptance Criteria

1. Toggle Rentier/Patrimonial visible dans l'UI (page résultats) ✅
2. Profil Rentier (actuel) : pondération cashflow élevée ✅
3. Profil Patrimonial : pondération cashflow atténuée, rentabilité et TRI renforcés, valorisation bien pondérée ✅
4. Le score global et les scores par catégorie reflètent le profil sélectionné ✅
5. Tests : même simulation → scores différents selon profil ✅
6. Score stocké en BDD inclut l'information de profil ✅ (via `profil_investisseur` dans `OptionsData`)

## Tasks / Subtasks

- [x] Définir les pondérations profil Patrimonial dans `src/config/constants.ts` (`SCORING_PROFIL`)
- [x] Ajouter `ProfilInvestisseur: 'rentier' | 'patrimonial'` dans `src/types/calculateur.ts`
- [x] Modifier `calculerScoreGlobal()` dans `synthese.ts` pour appliquer les multiplicateurs selon profil (AC: 2, 3, 4)
- [x] Pré-calculer les deux scores dans `genererSynthese()` → `scores_par_profil: { rentier, patrimonial }` (AC: 4)
- [x] Ajouter le composant `ProfilInvestisseurToggle` dans `src/components/results/` (AC: 1)
- [x] Intégrer le toggle dans `Dashboard.tsx` avec switch client-side (pas de recalcul API)
- [x] Propager `profil_investisseur` dans le store Zustand (défaut `'rentier'`)
- [x] Écrire les tests (AC: 5)

## Implémentation

### Architecture retenue

Les deux scores (Rentier et Patrimonial) sont calculés **en une seule passe** côté serveur et inclus dans la réponse API :
```typescript
synthese.scores_par_profil = { rentier: ScoreDetail, patrimonial: ScoreDetail }
```
Le toggle UI bascule entre les deux scores **sans rappel API**, ce qui garantit une UX instantanée.

### Pondérations appliquées (`CONSTANTS.SCORING_PROFIL`)

| Ajustement | Rentier | Patrimonial |
|---|---|---|
| cashflow | ×1.0 | ×0.5 |
| rentabilité | ×1.0 | ×1.5 |
| hcsf | ×1.0 | ×1.0 |
| dpe | ×1.0 | ×1.5 |
| ratio_prix_loyer | ×1.0 | ×1.5 |
| reste_a_vivre | ×1.0 | ×0.75 |

### Fichiers modifiés

- `src/config/constants.ts` — bloc `SCORING_PROFIL`
- `src/types/calculateur.ts` — type `ProfilInvestisseur`, champ `profil_investisseur` dans `OptionsData`, champ `scores_par_profil` dans `SyntheseResultat`
- `src/server/calculations/types.ts` — re-export `ProfilInvestisseur`, champ `scores_par_profil` dans `SyntheseCalculations`
- `src/server/calculations/synthese.ts` — `calculerScoreGlobal()` avec multiplicateurs, `genererSynthese()` avec double calcul
- `src/server/calculations/index.ts` — propagation `profilInvestisseur` depuis `data.options`
- `src/components/results/ProfilInvestisseurToggle.tsx` — nouveau composant toggle
- `src/components/results/Dashboard.tsx` — intégration toggle + switch du score affiché
- `src/components/results/index.ts` — export du nouveau composant
- `src/stores/calculateur.store.ts` — défaut `profil_investisseur: 'rentier'`

### Testing

- Fichier : `src/server/calculations/synthese.test.ts`
- 4 tests ajoutés dans `V2-S16 : Scoring Rentier vs Patrimonial` :
  - même simulation → scores différents selon profil
  - ajustement cashflow plus faible en Patrimonial (×0.5)
  - ajustement rentabilité renforcé en Patrimonial (×1.5)
  - `genererSynthese` inclut les deux scores pré-calculés

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-14 | 1.0 | Création | John (PM) |
| 2026-02-15 | 1.1 | Implémentation complète — 169 tests OK | Dev |
