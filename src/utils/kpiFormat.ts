/**
 * Utilitaires de formatage partagés pour les KPIs de la sidebar ResultsAnchor.
 * Centralise les règles de formatage (locale fr-FR, seuils k€/M€, préfixe ~)
 * afin d'éviter la duplication entre ResultsAnchorStep1–5.
 */

/**
 * Formate un montant en euros avec préfixe `~` et unités compactes.
 * - ≥ 1 000 000 → M€ (2 décimales)
 * - ≥ 1 000     → k€ (0 décimale)
 * - < 1 000     → €  (0 décimale)
 * - null        → '—'
 */
export function fmtEuro(value: number | null): string {
  if (value === null) return '—';
  if (value >= 1_000_000) {
    return `~${(value / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} M€`;
  }
  if (value >= 1_000) {
    return `~${(value / 1_000).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} k€`;
  }
  return `~${value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €`;
}

/**
 * Formate un pourcentage avec préfixe `~` et `fractionDigits` décimales (défaut : 1).
 * - null → '—'
 */
export function fmtPercent(value: number | null, fractionDigits = 1): string {
  if (value === null) return '—';
  return `~${value.toLocaleString('fr-FR', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })} %`;
}
