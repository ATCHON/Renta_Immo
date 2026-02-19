# Story V2-S04 : Audit taux PS PV (17.2%) vs PS revenus BIC LMNP (18.6%)

> **Epic** : EPIC-V2-01 | **Sprint** : Sprint 1 | **Effort** : S
> **Statut** : Completed

## Story

**As a** développeur de la plateforme,
**I want** que les deux taux de prélèvements sociaux soient clairement distincts dans le code et correctement appliqués selon le contexte,
**so that** il n'y ait aucune confusion entre PS sur plus-values (17.2%) et PS sur revenus BIC LMNP (18.6%).

## Acceptance Criteria

1. Grep exhaustif : aucun usage de `PRELEVEMENTS_SOCIAUX_LMNP` (18.6%) dans le module de calcul plus-value
2. Constante renommée `TAUX_PS_REVENUS_BIC_LMNP = 0.186` (revenus LMNP)
3. Constante renommée/confirmée `TAUX_PS_PLUS_VALUES = 0.172` (plus-values immobilières)
4. Tous les imports mis à jour après renommage
5. Aucun test échoue suite au renommage

## Tasks / Subtasks

- [x] Grep dans tout `src/` pour `PRELEVEMENTS_SOCIAUX_LMNP` et `PRELEVEMENTS_SOCIAUX`
- [x] Identifier les usages dans le module plus-value (AC: 1)
- [x] Renommer les constantes dans `constants.ts` (AC: 2, 3)
- [x] Mettre à jour tous les imports et usages dans le code (AC: 4)
- [x] Lancer la suite de tests complète (AC: 5)
- [x] Ajouter un commentaire explicatif dans `constants.ts` : "PS revenus LMNP ≠ PS plus-values"

## Dev Notes

**Fichiers à auditer :**

- `src/config/constants.ts` — `TAUX_PS = 0.172` actuel (ligne ~137), `PRELEVEMENTS_SOCIAUX_LMNP`
- `src/server/calculations/fiscalite.ts` — vérifier tous les usages
- `src/server/calculations/plus-value.test.ts`

**Règle métier :**

- PS sur plus-values immobilières = 17.2% (CGI art. 200 A)
- PS sur revenus BIC LMNP = 17.2% aussi pour les non-professionnels, 18.6% pour certains cas spécifiques
- → Clarifier la distinction dans les commentaires

### Testing

- Lancer `npm test` complet après renommage
- Vérifier 0 test échoué

## Change Log

| Date       | Version | Description | Author    |
| ---------- | ------- | ----------- | --------- |
| 2026-02-14 | 1.0     | Création    | John (PM) |
