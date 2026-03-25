# Story UX-BE02 : Hook Zustand réactif `usePreviewKPIs`

> **Priorité** : P0 — 🔴 Bloquant (prérequis de la Phase 2)
> **Effort** : S (1 jour)
> **Statut** : Done ✅
> **Type** : Feature / Frontend Hook
> **Epic** : UX Migration — Prérequis Backend
> **Branche** : `feature/verdant-calculateur-preview`
> **Dépendances** : UX-BE01 (`calculateur-preview.ts` doit exister)

---

## 1. User Story

**En tant que** développeur frontend
**Je veux** un hook React `usePreviewKPIs` qui réagit aux changements du store Zustand
**Afin que** la sidebar « Results Anchor » se mette à jour automatiquement à chaque changement de champ dans le formulaire, sans logique métier dupliquée dans les composants.

---

## 2. Contexte

### 2.1 Architecture Zustand actuelle

Le store `useCalculateurStore` (Zustand) gère l'état du formulaire multi-step. Actuellement, il **ne fait aucun calcul** — il stocke uniquement les données saisies. Le calcul est déclenché côté serveur à la soumission.

Pour la sidebar Results Anchor, les KPIs doivent être recalculés à **chaque mutation du store** (chaque `updateBien`, `updateFinancement`, etc.). La solution la plus robuste en Zustand est un **hook dérivé** (computed selector) plutôt que de modifier le store.

### 2.2 Pattern recommandé par Winston

```typescript
// src/hooks/usePreviewKPIs.ts
export function usePreviewKPIs(): PreviewKPIs {
  const bien = useCalculateurStore((s) => s.getActiveScenario().bien);
  const financement = useCalculateurStore((s) => s.getActiveScenario().financement);
  const exploitation = useCalculateurStore((s) => s.getActiveScenario().exploitation);
  const charges = useCalculateurStore((s) => s.getActiveScenario().charges);

  return useMemo(
    () => computePreviewKPIs(bien, financement, exploitation, charges),
    [bien, financement, exploitation, charges]
  );
}
```

> [!NOTE]
> Utiliser `useMemo` est **essentiel** ici. Sans `useMemo`, `computePreviewKPIs` serait appelée à **chaque render React**, ce qui pourrait causer des recalculs inutiles même si les données n'ont pas changé.

### 2.3 Noms exacts du store

Avant d'implémenter, vérifier les noms exacts des selectors dans `src/store/calculateur.store.ts` ou le fichier équivalent. Les noms `getActiveScenario`, `bien`, `financement`, etc. sont indicatifs.

```bash
# Identifier la structure du store
grep -n "getActiveScenario\|updateBien\|updateFinancement" src/store/calculateur.store.ts
```

---

## 3. Critères d'acceptation

### 3.1 Hook `usePreviewKPIs`

- [ ] Fichier `src/hooks/usePreviewKPIs.ts` créé
- [ ] Le hook importé depuis `@/hooks/usePreviewKPIs` est immédiatement utilisable dans n'importe quel composant React (compatibilité App Router Next.js)
- [ ] Le hook retourne le type `PreviewKPIs` défini dans `src/types/calculateur.ts`
- [ ] `useMemo` est utilisé avec les bonnes dépendances pour éviter les recalculs inutiles
- [ ] Le hook est marqué `'use client'` si nécessaire (composant client Zustand)

### 3.2 Réactivité

- [ ] Si `bien.prix_achat` change → `rendementBrut` est recalculé
- [ ] Si `financement.taux_interet` change → `mensualiteEstimee` est recalculée
- [ ] Si `exploitation.loyer_mensuel` change → `cashflowMensuelEstime` est recalculé
- [ ] Les champs partiels (undefined) ne causent pas d'erreur → KPI correspondant = `null`

### 3.3 Typage strict

- [ ] Aucun `any` TypeScript
- [ ] Le hook est typé explicitement : `function usePreviewKPIs(): PreviewKPIs`
- [ ] Les selectors Zustand utilisés sont typés (pas de cast forcé)

---

## 4. Spécifications techniques

### 4.1 Fichiers impactés

| Fichier                       | Action       | Détail                            |
| ----------------------------- | ------------ | --------------------------------- |
| `src/hooks/usePreviewKPIs.ts` | NEW          | Hook Zustand réactif              |
| `src/types/calculateur.ts`    | ALREADY DONE | Interface `PreviewKPIs` (UX-BE01) |

### 4.2 Exemple d'implémentation

```typescript
// src/hooks/usePreviewKPIs.ts
'use client';

import { useMemo } from 'react';
import { useCalculateurStore } from '@/store/calculateur.store';
import { computePreviewKPIs } from '@/lib/calculateur-preview';
import type { PreviewKPIs } from '@/types/calculateur';

export function usePreviewKPIs(): PreviewKPIs {
  const scenario = useCalculateurStore((s) => s.getActiveScenario());
  const bien = scenario.bien;
  const financement = scenario.financement;
  const exploitation = scenario.exploitation;
  const charges = scenario.charges;

  return useMemo(
    () => computePreviewKPIs(bien, financement, exploitation, charges),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [bien, financement, exploitation, charges]
  );
}
```

> ⚠️ Adapter les noms de selectors (`getActiveScenario`, `bien`, etc.) aux vrais noms du store existant.

---

## 5. Tests

### 5.1 TU à créer

Fichier : `tests/unit/hooks/usePreviewKPIs.test.ts`

Utiliser `renderHook` de `@testing-library/react` pour tester le hook en isolation :

```typescript
import { renderHook } from '@testing-library/react';
import { usePreviewKPIs } from '@/hooks/usePreviewKPIs';
// Mocker useCalculateurStore avec un store de test

describe('usePreviewKPIs', () => {
  it('retourne les KPIs calculés quand les données sont complètes', () => {
    /* ... */
  });
  it('retourne null pour rendementBrut si prix_achat absent', () => {
    /* ... */
  });
  it("ne recalcule pas si les données n'ont pas changé (memoization)", () => {
    /* ... */
  });
});
```

### 5.2 Commandes

```bash
npx vitest run tests/unit/hooks/usePreviewKPIs.test.ts
npm run test
npm run type-check
```

---

## 6. Definition of Done

- [ ] `src/hooks/usePreviewKPIs.ts` créé et fonctionnel
- [ ] TU créés avec couverture de la réactivité et des cas limites
- [ ] `npm run test` : 530+ TU verts
- [ ] `npm run type-check` : 0 erreur
- [ ] Aucun `any` TypeScript
- [ ] PR mergée (même branche que BE-01 : `feature/verdant-calculateur-preview`)

---

## Changelog

| Date       | Version | Description                       | Auteur    |
| ---------- | ------- | --------------------------------- | --------- |
| 2026-03-25 | 1.0     | Création — Plan technique Winston | John (PM) |
