# Story TECH-010 : Éliminer les types `any` explicites

> **Version** : 1.0
> **Date** : 2026-02-04
> **Auteur** : John (PM)
> **Statut** : 📋 Backlog
> **Type** : Dette Technique
> **Epic** : Epic 1 - Infrastructure Backend (Phase 2)

---

## 1. Description

**En tant que** développeur
**Je veux** éliminer tous les types `any` explicites du codebase
**Afin de** garantir la type-safety et faciliter la maintenance

---

## 2. Contexte

Lors de la validation DoD de l'Epic 1, 7 occurrences de `any` explicite ont été identifiées. Ces usages contournent le système de types TypeScript et peuvent masquer des bugs.

---

## 3. Fichiers à corriger

| Fichier | Ligne | Usage actuel | Correction suggérée |
|---------|-------|--------------|---------------------|
| `src/server/calculations/fiscalite.test.ts` | 47 | `mockRentabilite: any` | Créer type `MockRentabiliteResult` ou utiliser `Partial<RentabiliteResult>` |
| `src/components/results/CashflowChart.tsx` | 18 | `data: any[]` | Définir interface `CashflowDataPoint` |
| `src/components/results/CashflowChart.tsx` | 50 | `formatter={(value: any) => ...}` | `value: number` |
| `src/components/results/PatrimoineChart.tsx` | 17 | `data: any[]` | Définir interface `PatrimoineDataPoint` |
| `src/components/results/PatrimoineChart.tsx` | 59 | `formatter={(value: any) => ...}` | `value: number` |
| `src/components/forms/StepAssocies.tsx` | 77 | `a: any` dans reduce | Utiliser le type `Associe` existant |
| `src/components/forms/StepOptions.tsx` | 56 | `data: any` | Utiliser le type du formulaire |

---

## 4. Critères d'acceptation

- [ ] Aucun `any` explicite dans `src/` (hors `node_modules`)
- [ ] `npm run type-check` passe sans erreur
- [ ] `npm run lint` passe sans erreur
- [ ] Tests existants passent toujours

---

## 5. Notes techniques

- Préférer `unknown` à `any` si le type est vraiment inconnu
- Utiliser les génériques de Recharts pour les formatters
- Les fichiers `.test.ts` peuvent utiliser `Partial<T>` pour les mocks

---

## 6. Estimation

| Métrique | Valeur |
|----------|--------|
| Points | 2 |
| Priorité | P3 |
| Risque | Faible |

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-02-04 | 1.0 | Création (dette technique DoD Epic 1) | John (PM) |
