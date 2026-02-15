# Story V2-S16 : Implémenter le profil scoring "Patrimonial"

> **Epic** : EPIC-V2-06 | **Sprint** : Sprint 3 | **Effort** : M
> **Statut** : Draft

## Story

**As a** investisseur orienté patrimoine (plutôt que cashflow),
**I want** to be able to activate a "Patrimonial" scoring profile that places more weight on long-term IRR and property appreciation,
**so that** les recommandations correspondent à mes objectifs d'investissement.

## Acceptance Criteria

1. Toggle Rentier/Patrimonial visible dans l'UI (page résultats ou formulaire)
2. Profil Rentier (actuel) : pondération cashflow élevée
3. Profil Patrimonial : pondération cashflow atténuée, TRI 15 ans renforcé, valorisation bien pondérée
4. Le score global et les scores par catégorie reflètent le profil sélectionné
5. Tests : même simulation → scores différents selon profil
6. Score stocké en BDD inclut l'information de profil

## Tasks / Subtasks

- [ ] Définir les pondérations profil Patrimonial dans constants.ts ou synthese.ts
- [ ] Ajouter profilInvestisseur: 'rentier' | 'patrimonial' dans types.ts
- [ ] Modifier calculerScore() dans synthese.ts pour appliquer les pondérations selon profil (AC: 2, 3, 4)
- [ ] Ajouter le toggle dans l'UI (AC: 1)
- [ ] Propager dans le store Zustand
- [ ] Vérifier Math.round() avant insert BDD score_global (AC: 6)
- [ ] Écrire les tests (AC: 5)

## Dev Notes

**Fichiers à modifier :**
- src/server/calculations/synthese.ts — calculerScore()
- src/config/constants.ts — pondérations par profil
- src/components/results/ — toggle UI
- src/stores/calculateur.store.ts
- src/server/calculations/types.ts

**Note BDD** : score_global en DB est integer → toujours Math.round() avant insert.

**Pondérations suggérées :**
- Rentier : cashflow 40%, TRI 5 ans 30%, TRI 15 ans 20%, valorisation 10%
- Patrimonial : cashflow 15%, TRI 5 ans 15%, TRI 15 ans 40%, valorisation 30%

### Testing

- Fichier : src/server/calculations/synthese.test.ts
- Cas : même input → scores différents avec profil Rentier vs Patrimonial

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-14 | 1.0 | Création | John (PM) |
