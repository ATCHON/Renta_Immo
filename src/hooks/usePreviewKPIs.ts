'use client';

/**
 * UX-BE02 — Hook Zustand réactif `usePreviewKPIs`
 *
 * Sélectionne les données du scénario actif et recalcule les KPIs de preview
 * à chaque mutation du store via `useMemo`.
 *
 * Pattern : hook dérivé (computed selector) — ne modifie pas le store.
 *
 * Note : `Scenario` n'expose pas de `charges` séparé ; les charges sont dans `ExploitationData`.
 * La signature de `computePreviewKPIs` est adaptée en conséquence (3 args, pas 4).
 */

import { useMemo } from 'react';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { computePreviewKPIs } from '@/lib/calculateur-preview';
import type { PreviewKPIs } from '@/types/calculateur';

/**
 * Retourne les KPIs approximatifs du scénario actif, recalculés à chaque changement de champ.
 *
 * `useMemo` est essentiel : évite les recalculs inutiles quand les références
 * de bien/financement/exploitation n'ont pas changé.
 *
 * @example
 * ```tsx
 * const kpis = usePreviewKPIs();
 * // kpis.rendementBrut → 5.2 | null
 * // kpis.mensualiteEstimee → 987.43 | null
 * // kpis.isPartiel → true (toujours)
 * ```
 */
export function usePreviewKPIs(): PreviewKPIs {
  const bien = useCalculateurStore((s) => s.getActiveScenario().bien);
  const financement = useCalculateurStore((s) => s.getActiveScenario().financement);
  const exploitation = useCalculateurStore((s) => s.getActiveScenario().exploitation);

  return useMemo(
    () => computePreviewKPIs(bien, financement, exploitation),

    [bien, financement, exploitation]
  );
}
