# Story UX-BE03 : Exposer le TAEG dans `FinancementResultat`

> **Priorité** : P1 — 🟠 Requis pour la Phase 2
> **Effort** : M (1–2 jours)
> **Statut** : Done ✅
> **Type** : Feature / Backend
> **Epic** : UX Migration — Prérequis Backend
> **Branche** : `feature/verdant-taeg-financement`
> **Dépendances** : Aucune (peut démarrer en parallèle de BE-01, BE-02)

---

## 1. User Story

**En tant que** utilisateur qui consulte ses résultats de simulation
**Je veux** voir le TAEG (Taux Annuel Effectif Global) affiché dans la sidebar financement et dans le dashboard de résultats
**Afin de** comprendre le coût réel de mon crédit immobilier, conforme à la réglementation française (affichage TAEG obligatoire).

---

## 2. Contexte

### 2.1 Situation actuelle

Le TAEG est calculé quelque part dans le moteur (`src/server/calculations/financement.ts`) mais **n'est pas exposé** dans l'interface `FinancementResultat` renvoyé par l'API. La maquette Stitch Step 2 (Financement) affiche explicitement le TAEG dans la sidebar Results Anchor.

```typescript
// ÉTAT ACTUEL — src/types/calculateur.ts
export interface FinancementResultat {
  montant_emprunt: number;
  mensualite: number;
  cout_total_credit: number;
  frais_notaire: number;
  // ← TAEG manquant ici
}
```

### 2.2 Solution Winston

Modifier `FinancementResultat` pour ajouter les champs `taeg` et `capacite_endettement`.

> [!WARNING]
> **Impact sur les tests existants** : La modification de `FinancementResultat` est un **breaking change potentiel** sur les mocks de tests. Il faut mettre à jour les mocks dans :
>
> - `tests/helpers/test-config.ts`
> - `tests/unit/calculations/` (tous les tests qui mockent `FinancementResultat`)
> - Possiblement des tests d'intégration
>
> **Relancer les 530 TU** après chaque modification et corriger les mocks cassés.

### 2.3 Vérification préalable

Avant d'implémenter, vérifier si le TAEG est déjà calculé dans `src/server/calculations/financement.ts` :

```bash
grep -n "taeg\|TAEG\|taux.*effectif\|newton" src/server/calculations/financement.ts
```

Si oui, il suffit de l'exposer dans le type et la réponse. Si non, utiliser BE-04 pour implémenter le calcul.

---

## 3. Critères d'acceptation

### 3.1 Modification du type `FinancementResultat`

- [x] L'interface `FinancementResultat` dans `src/types/calculateur.ts` contient les nouveaux champs :

```typescript
export interface FinancementResultat {
  montant_emprunt: number;
  mensualite: number;
  cout_total_credit: number;
  frais_notaire: number;
  taeg?: number; // NOUVEAU — taux annuel effectif global (ex: 4.32)
  capacite_endettement?: number; // NOUVEAU — copie du taux HCSF pour affichage sidebar
}
```

- [x] Les champs sont **optionnels** (`?`) pour rétro-compatibilité avec les tests existants utilisant des mocks partiels
- [x] Aucune modification des champs existants (non-breaking sur les types)

### 3.2 Mocks de tests mis à jour

- [x] `tests/helpers/test-config.ts` : le mock de `FinancementResultat` est mis à jour (ajout de `taeg: 4.32, capacite_endettement: 33.0` dans les données de test)
- [x] Tous les TU dans `tests/unit/calculations/` toujours verts après modification
- [x] `npm run test` passe avec 530+ TU verts

### 3.3 Validation visuelle

- [x] Le TAEG est affiché dans la Step 2 (Financement) de la sidebar Results Anchor (après Phase 2)
- [x] La valeur affichée est en format `4,32 %` (format français, 2 décimales)

---

## 4. Spécifications techniques

### 4.1 Fichiers impactés

| Fichier                                       | Action | Détail                                                                                       |
| --------------------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| `src/types/calculateur.ts`                    | MODIFY | Ajouter `taeg?` et `capacite_endettement?` dans `FinancementResultat`                        |
| `tests/helpers/test-config.ts`                | MODIFY | Mettre à jour les mocks de `FinancementResultat`                                             |
| `tests/unit/calculations/financement.test.ts` | MODIFY | Vérifier que les assertions sur `FinancementResultat` prennent en compte les nouveaux champs |

### 4.2 Distinction TAEG approx vs TAEG exact

| Source                                | Précision            | Usage                                      | Affichage             |
| ------------------------------------- | -------------------- | ------------------------------------------ | --------------------- |
| `PreviewKPIs.taegApprox` (BE-01)      | Approximation client | Sidebar Results Anchor (pendant la saisie) | `~4,2 %` (avec tilde) |
| `FinancementResultat.taeg` (BE-03+04) | Exact serveur        | Dashboard résultats finaux                 | `4,32 %` (exact)      |

> [!NOTE]
> Cette distinction est **intentionnelle et importante**. Le développeur ne doit pas confondre les deux. Le tilde `~` dans l'affichage sidebar est une exigence UX pour signaler l'approximation.

---

## 5. Tests

### 5.1 Commandes

```bash
# Après modification du type + mocks
npm run test
npm run type-check

# Cibler spécifiquement les tests de calcul financement
npx vitest run tests/unit/calculations/financement.test.ts
```

### 5.2 Critère de succès

- 530+ TU verts — aucune régression
- 0 erreur TypeScript

---

## 6. Definition of Done

- [x] Interface `FinancementResultat` modifiée avec `taeg?` et `capacite_endettement?`
- [x] Mocks de tests mis à jour
- [x] `npm run test` : 530+ TU verts
- [x] `npm run type-check` : 0 erreur
- [x] PR mergée depuis `feature/verdant-taeg-financement`

---

## Changelog

| Date       | Version | Description                       | Auteur    |
| ---------- | ------- | --------------------------------- | --------- |
| 2026-03-25 | 1.0     | Création — Plan technique Winston | John (PM) |
