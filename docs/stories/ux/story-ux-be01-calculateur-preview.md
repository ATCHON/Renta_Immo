# Story UX-BE01 : Moteur de calcul partiel côté client (`calculateur-preview.ts`)

> **Priorité** : P0 — 🔴 Bloquant (prérequis de la Phase 2)
> **Effort** : M (2–3 jours)
> **Statut** : Done ✅
> **Type** : Feature / Backend
> **Epic** : UX Migration — Prérequis Backend
> **Branche** : `feature/verdant-calculateur-preview`
> **Dépendances** : UX-S00 (Design tokens) — peut démarrer en parallèle

---

## 1. User Story

**En tant que** développeur frontend
**Je veux** un module de calcul partiel côté client (`calculateur-preview.ts`)
**Afin d'** alimenter la sidebar « Results Anchor » avec des KPIs en temps réel à chaque changement de champ, sans attendre la soumission complète du formulaire.

---

## 2. Contexte

### 2.1 Problème actuel

Le moteur de calcul de Renta_Immo est **exclusivement côté serveur** (API Route Next.js). Le calcul n'est déclenché qu'à la soumission complète du formulaire (Step 5 → bouton « Calculer »).

La nouvelle UX « Verdant Simulator » introduit une sidebar **« Results Anchor »** qui doit afficher des KPIs en temps réel à chaque step. Cela nécessite un moteur de calcul **partiel et client-side**, car appeler l'API serveur à chaque keystroke serait coûteux et trop lent.

### 2.2 Architecture de la solution (Winston)

Créer `src/lib/calculateur-preview.ts` — module pur TypeScript, **sans dépendance serveur** (pas d'imports depuis `src/server/`). Ce module contient des **approximations rapides** (pas le calcul complet) :

| KPI                      | Formule approximation                              | Précision                         |
| ------------------------ | -------------------------------------------------- | --------------------------------- |
| Rendement brut           | `(loyer_annuel / prix_total) * 100`                | Exacte                            |
| Mensualité estimée       | PMT simple (`taux_mensuel`, `n_mois`, `montant`)   | Exacte                            |
| Investissement total     | `prix_achat + travaux + frais_notaire_estimé (8%)` | Approchée                         |
| Cash-flow mensuel estimé | `loyer - mensualite - charges_mensuelles`          | Approchée                         |
| TAEG approximatif        | `taux_nominal + amortissement_frais_dossier`       | **Approximation** (à marquer `~`) |
| Coût total crédit estimé | `mensualite * duree_mois - montant_emprunte`       | Approchée                         |

> [!NOTE]
> Le **TAEG exact** nécessite un calcul itératif Newton-Raphson réalisé côté serveur. Pour la sidebar, une approximation est suffisante et **doit être visuellement différenciée** (ex: tilde `~4,2%`) pour ne pas induire l'utilisateur en erreur.

### 2.3 Priorité dans le sprint

Cette story est **bloquante** pour UX-S02 (SimulatorLayout + ResultsAnchor). Elle peut démarrer en parallèle de UX-S00 et UX-BE03 car elle n'en dépend pas.

---

## 3. Critères d'acceptation

### 3.1 Interface TypeScript `PreviewKPIs`

- [x] L'interface `PreviewKPIs` est définie dans `src/types/calculateur.ts` (fichier de types partagés) :

```typescript
/** KPIs de preview pour la sidebar Results Anchor (calcul client partiel) */
export interface PreviewKPIs {
  rendementBrut: number | null;
  mensualiteEstimee: number | null;
  investissementTotal: number | null;
  cashflowMensuelEstime: number | null;
  taegApprox: number | null;
  coutTotalCreditEstime: number | null;
  isPartiel: true; // discriminant littéral — différencie des résultats complets
}
```

- [x] Aucun type `any` utilisé (règle stricte du projet)

### 3.2 Module `calculateur-preview.ts`

- [x] Fichier `src/lib/calculateur-preview.ts` créé avec la fonction principale :

```typescript
export function computePreviewKPIs(
  bien: Partial<BienData>,
  financement: Partial<FinancementData>,
  exploitation: Partial<ExploitationData>,
  charges: Partial<ChargesData>
): PreviewKPIs;
```

- [x] La fonction gère les champs partiels (valeurs `undefined` ou `null`) — retourner `null` pour les KPIs non calculables plutôt que crasher
- [x] La fonction n'importe **rien** depuis `src/server/` (module pur client)
- [x] La PMT est calculée avec la formule standard :
  ```typescript
  // PMT(r, n, PV) — r = taux mensuel, n = nb mensualités, PV = montant emprunté
  const pmt = (r: number, n: number, pv: number): number =>
    (pv * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  ```
- [x] Les frais de notaire estimés sont calculés à **8% du prix d'achat** pour l'approximation (valeur par défaut en l'absence d'une valeur exacte)
- [x] Le TAEG approximatif est calculé comme `taux_nominal + (frais_dossier + garantie) / duree_ans / montant * 100`

### 3.3 Cas limites gérés

- [x] `prix_achat = 0` ou `undefined` → `rendementBrut = null`
- [x] `taux_interet = 0` → `mensualiteEstimee = montant / duree_mois`
- [x] `loyer_mensuel = 0` ou `undefined` → `cashflowMensuelEstime = null`
- [x] `duree_credit_mois = 0` → `mensualiteEstimee = null`

---

## 4. Spécifications techniques

### 4.1 Fichiers impactés

| Fichier                          | Action | Détail                               |
| -------------------------------- | ------ | ------------------------------------ |
| `src/types/calculateur.ts`       | MODIFY | Ajouter l'interface `PreviewKPIs`    |
| `src/lib/calculateur-preview.ts` | NEW    | Module de calcul partiel client-side |

### 4.2 Exemple d'implémentation attendue

```typescript
// src/lib/calculateur-preview.ts
import type { BienData, FinancementData, ExploitationData, ChargesData, PreviewKPIs } from '@/types/calculateur';

function pmt(tauxMensuel: number, nMois: number, montant: number): number {
  if (tauxMensuel === 0) return montant / nMois;
  return (montant * tauxMensuel * Math.pow(1 + tauxMensuel, nMois)) / (Math.pow(1 + tauxMensuel, nMois) - 1);
}

export function computePreviewKPIs(
  bien: Partial<BienData>,
  financement: Partial<FinancementData>,
  exploitation: Partial<ExploitationData>,
  charges: Partial<ChargesData>
): PreviewKPIs {
  const prixAchat = bien.prix_achat ?? null;
  const travaux = bien.travaux ?? 0;
  const fraisNotaireEstimes = prixAchat ? prixAchat * 0.08 : 0;
  const investissementTotal = prixAchat ? prixAchat + travaux + fraisNotaireEstimes : null;

  const tauxMensuel = financement.taux_interet ? financement.taux_interet / 100 / 12 : null;
  const dureeMois = financement.duree_credit_mois ?? null;
  const apport = financement.apport ?? 0;
  const montantEmprunte = investissementTotal && apport !== null ? investissementTotal - apport : null;

  const mensualiteEstimee =
    tauxMensuel !== null && dureeMois && montantEmprunte
      ? pmt(tauxMensuel, dureeMois, montantEmprunte)
      : null;

  const loyerMensuel = exploitation.loyer_mensuel ?? null;
  const chargesMensuelles = charges ? (/* somme des charges mensuelles */) : 0;
  const cashflowMensuelEstime =
    loyerMensuel && mensualiteEstimee ? loyerMensuel - mensualiteEstimee - chargesMensuelles : null;

  const loyerAnnuel = loyerMensuel ? loyerMensuel * 12 : null;
  const rendementBrut =
    loyerAnnuel && investissementTotal && investissementTotal > 0
      ? (loyerAnnuel / investissementTotal) * 100
      : null;

  const coutTotalCreditEstime =
    mensualiteEstimee && dureeMois && montantEmprunte
      ? mensualiteEstimee * dureeMois - montantEmprunte
      : null;

  // TAEG approximation : taux nominal + frais amortis
  const taegApprox = financement.taux_interet ? financement.taux_interet * 1.05 : null; // approximation grossière

  return {
    rendementBrut,
    mensualiteEstimee,
    investissementTotal,
    cashflowMensuelEstime,
    taegApprox,
    coutTotalCreditEstime,
    isPartiel: true,
  };
}
```

> ⚠️ L'exemple ci-dessus est indicatif — le développeur adaptera les noms de champs aux types réels de `BienData`, `FinancementData`, etc. définis dans `src/types/calculateur.ts`.

### 4.3 Vérification des types existants

Avant d'implémenter, lire les types actuels dans `src/types/calculateur.ts` pour connaître les vrais noms de champs de `BienData`, `FinancementData`, `ExploitationData`.

```bash
# Lire les types existants
cat src/types/calculateur.ts | grep -A 20 "BienData\|FinancementData\|ExploitationData"
```

---

## 5. Tests

### 5.1 Tests unitaires à créer

Fichier : `tests/unit/lib/calculateur-preview.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { computePreviewKPIs } from '@/lib/calculateur-preview';

describe('computePreviewKPIs', () => {
  it('retourne null pour tout KPI si prix_achat est absent', () => {
    /* ... */
  });
  it('calcule correctement le rendement brut', () => {
    /* ... */
  });
  it('calcule correctement la mensualité PMT', () => {
    // PMT(0.001, 240, 200000) ≈ 1006.43 €
  });
  it('retourne null si loyer = 0', () => {
    /* ... */
  });
  it('gère taux_interet = 0 sans division par zéro', () => {
    /* ... */
  });
  it('marque isPartiel à true', () => {
    /* ... */
  });
});
```

### 5.2 Commandes

```bash
# Lancer uniquement les tests du nouveau module
npx vitest run tests/unit/lib/calculateur-preview.test.ts

# Suite complète (ne doit pas régresser)
npm run test
npm run type-check
```

---

## 6. Definition of Done

- [x] `src/lib/calculateur-preview.ts` créé et fonctionnel
- [x] Interface `PreviewKPIs` ajoutée dans `src/types/calculateur.ts`
- [x] TU `calculateur-preview.test.ts` créés avec couverture des cas limites
- [x] `npm run test` : 530+ TU verts (zéro régression)
- [x] `npm run type-check` : 0 erreur TypeScript
- [x] Aucun `any`, aucun import `src/server/`
- [x] PR mergée vers `master`

---

## Changelog

| Date       | Version | Description                       | Auteur    |
| ---------- | ------- | --------------------------------- | --------- |
| 2026-03-25 | 1.0     | Création — Plan technique Winston | John (PM) |
