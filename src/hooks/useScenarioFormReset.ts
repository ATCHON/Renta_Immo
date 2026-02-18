import { useEffect } from 'react';
import type { UseFormReset, FieldValues } from 'react-hook-form';

/**
 * Réinitialise un formulaire react-hook-form quand le scénario actif change.
 * Centralise le pattern dupliqué dans les 6 composants Step*.
 *
 * @param reset - La fonction reset de react-hook-form
 * @param defaultValues - Valeurs par défaut à appliquer
 * @param activeScenarioId - ID du scénario actif (déclenche le reset)
 * @param onReset - Callback optionnel exécuté après le reset (ex: reset d'état local)
 */
export function useScenarioFormReset<T extends FieldValues>(
  reset: UseFormReset<T>,
  defaultValues: T,
  activeScenarioId: string,
  onReset?: () => void
) {
  useEffect(() => {
    reset(defaultValues);
    onReset?.();
    // Only reset on scenario change — defaultValues/onReset intentionally excluded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeScenarioId, reset]);
}
