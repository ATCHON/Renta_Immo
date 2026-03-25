# Story UX-BE04 : Calcul du TAEG exact dans le moteur serveur (`financement.ts`)

> **Priorité** : P1 — 🟠 Requis pour la Phase 3 (Dashboard résultats)
> **Effort** : M (1–2 jours)
> **Statut** : Done ✅
> **Type** : Feature / Calcul Moteur
> **Epic** : UX Migration — Prérequis Backend
> **Branche** : `feature/verdant-taeg-financement`
> **Dépendances** : UX-BE03 (interface `FinancementResultat` modifiée)

---

## 1. User Story

**En tant que** développeur backend
**Je veux** que le moteur de calcul serveur calcule et retourne le TAEG exact
**Afin que** le dashboard de résultats affiche un TAEG réglementaire précis (conforme à la directive européenne sur le crédit immobilier).

---

## 2. Contexte

### 2.1 Situation actuelle

Après vérification avec `grep` dans `src/server/calculations/financement.ts`, il est possible que le TAEG soit déjà calculé en interne mais non retourné. Si c'est le cas, cette story se réduit à l'exposition du champ dans la réponse. Si non, il faut l'implémenter.

```bash
# Vérifier AVANT de coder
grep -n "taeg\|TAEG\|newton\|IRR\|taux.*effectif" src/server/calculations/financement.ts
```

### 2.2 Formule du TAEG (Newton-Raphson)

Le TAEG est le taux `r` tel que :

```
Σ(k=1 à n) [ flux_k / (1 + r)^(t_k) ] = Montant_emprunté
```

Pour un crédit immobilier classique (mensualités constantes) :

```
Montant = Σ(k=1 à n) [ mensualite_k / (1 + TAEG_mensuel)^k ] + Coût_assurance_k + Frais_dossier_répartis
```

Le TAEG est annualisé : `TAEG = (1 + taux_mensuel)^12 - 1`

### 2.3 Référence implémentation recommandée

La librairie standard pour Newton-Raphson n'est pas nécessaire — une implémentation manuelle converge en ~20 itérations :

```typescript
function calculerTAEG(
  montantEmprunte: number,
  mensualite: number,
  dureesMois: number,
  fraisDossier: number,
  coutAssuranceMensuel: number
): number {
  const fluxMensuels = Array.from({ length: dureesMois }, (_, i) => i + 1).map(
    (k) => mensualite + coutAssuranceMensuel
  );

  let taegMensuel = 0.004; // guess initial : ~4.8% annuel
  for (let iter = 0; iter < 100; iter++) {
    const valeur = fluxMensuels.reduce(
      (acc, flux, idx) => acc + flux / Math.pow(1 + taegMensuel, idx + 1),
      0
    );
    const derivee = fluxMensuels.reduce(
      (acc, flux, idx) => acc - ((idx + 1) * flux) / Math.pow(1 + taegMensuel, idx + 2),
      0
    );
    const delta = (valeur - (montantEmprunte - fraisDossier)) / derivee;
    taegMensuel -= delta;
    if (Math.abs(delta) < 1e-10) break;
  }
  return (Math.pow(1 + taegMensuel, 12) - 1) * 100; // En %
}
```

---

## 3. Critères d'acceptation

### 3.1 Calcul du TAEG

- [x] La fonction de calcul du TAEG est présente dans `src/server/calculations/financement.ts`
- [x] Le TAEG tient compte de : taux nominal, frais de dossier, frais de garantie, assurance emprunteur CRD mensuelle
- [x] Le TAEG est exprimé en % avec une précision de 2 décimales (ex: `4.32`)
- [x] Le TAEG est retourné dans `FinancementResultat.taeg`
- [x] Si montant emprunté = 0, le TAEG retourné = `null` (ou `0`)

### 3.2 Cohérence avec TAEG approx (BE-01)

- [x] L'écart entre `taegApprox` (BE-01, client) et `taeg` (BE-04, serveur) est **≤ 0.5 point de %, soit 50 bps maximum**, pour un crédit standard
- [x] Un test de régression compare les deux valeurs pour un scénario de référence

### 3.3 Tests unitaires

- [x] TU dans `tests/unit/calculations/financement.test.ts` vérifient le TAEG pour des scénarios de référence connus :
  - Exemple : prêt 200 000€, 20 ans, 3.5%, assurance 0.1%/an → TAEG attendu ≈ 3.73%

---

## 4. Spécifications techniques

### 4.1 Fichiers impactés

| Fichier                                       | Action | Détail                                            |
| --------------------------------------------- | ------ | ------------------------------------------------- |
| `src/server/calculations/financement.ts`      | MODIFY | Ajouter/exposer le calcul TAEG                    |
| `tests/unit/calculations/financement.test.ts` | MODIFY | Ajouter assertions sur `FinancementResultat.taeg` |

### 4.2 Inputs disponibles pour le calcul TAEG

| Input             | Source dans le store                |
| ----------------- | ----------------------------------- |
| Montant emprunté  | `FinancementData.montant_emprunt`   |
| Durée (mois)      | `FinancementData.duree_credit_mois` |
| Taux nominal      | `FinancementData.taux_interet`      |
| Frais de dossier  | `FinancementData.frais_dossier`     |
| Frais de garantie | `FinancementData.frais_garantie`    |
| Assurance CRD     | `FinancementData.taux_assurance`    |

> ⚠️ Vérifier les noms exacts de champs dans `src/types/calculateur.ts`

---

## 5. Tests

```bash
# Cibler les tests financement
npx vitest run tests/unit/calculations/financement.test.ts

# Suite complète + régression
npm run test
npm run test:regression  # si configuré
npm run type-check
```

---

## 6. Definition of Done

- [x] TAEG calculé et retourné dans `FinancementResultat.taeg`
- [x] TU mis à jour avec valeurs de référence
- [x] `npm run test` : 530+ TU verts
- [x] `npm run type-check` : 0 erreur
- [x] PR mergée (même branche que BE-03 : `feature/verdant-taeg-financement`)

---

## Changelog

| Date       | Version | Description                       | Auteur    |
| ---------- | ------- | --------------------------------- | --------- |
| 2026-03-25 | 1.0     | Création — Plan technique Winston | John (PM) |
