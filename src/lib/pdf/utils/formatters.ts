/**
 * PDF Shared Formatters
 */

/**
 * Format a number as currency (EUR)
 */
export function formatCurrency(value: number): string {
  return `${value
    .toLocaleString('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true,
    })
    .replace(/\s/g, ' ')} €`;
}

/**
 * Format a number as percentage
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Format a currency with sign (+/-)
 */
export function formatCurrencyWithSign(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${formatCurrency(value)}`;
}
