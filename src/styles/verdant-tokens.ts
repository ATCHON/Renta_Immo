/**
 * Verdant Simulator — Design Tokens TypeScript
 *
 * Export des couleurs Material Design 3 pour usage dans Recharts et autres
 * bibliothèques qui ne lisent pas les CSS custom properties nativement.
 *
 * Source : stitch_nordic_minimalist/simulateur_immobilier_unifi/code.html
 * Synchronisé avec globals.css @theme { ... }
 */

export const VerdantColors = {
  // Palette principale
  primary: '#012d1d',
  onPrimary: '#ffffff',
  primaryContainer: '#1b4332',
  onPrimaryContainer: '#86af99',
  primaryFixed: '#c1ecd4',
  primaryFixedDim: '#a5d0b9',
  onPrimaryFixed: '#002114',
  onPrimaryFixedVariant: '#274e3d',
  inversePrimary: '#a5d0b9',

  // Palette secondaire
  secondary: '#53625a',
  onSecondary: '#ffffff',
  secondaryContainer: '#ceded4',
  onSecondaryContainer: '#53625b',
  secondaryFixed: '#d6e6dd',
  secondaryFixedDim: '#bacac1',
  onSecondaryFixed: '#111e19',
  onSecondaryFixedVariant: '#3b4a43',

  // Palette tertiaire
  tertiary: '#401b1b',
  onTertiary: '#ffffff',
  tertiaryContainer: '#5a302f',
  onTertiaryContainer: '#d29895',
  tertiaryFixed: '#ffdad8',
  tertiaryFixedDim: '#f5b7b4',
  onTertiaryFixed: '#331111',
  onTertiaryFixedVariant: '#673a39',

  // Surfaces
  surface: '#f9f9f8',
  surfaceDim: '#d9dad9',
  surfaceBright: '#f9f9f8',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f3f4f3',
  surfaceContainer: '#edeeed',
  surfaceContainerHigh: '#e7e8e7',
  surfaceContainerHighest: '#e1e3e2',
  surfaceVariant: '#e1e3e2',
  surfaceTint: '#3f6653',
  background: '#f9f9f8',
  inverseOnSurface: '#f0f1f0',

  // On-colors
  onSurface: '#191c1c',
  onSurfaceVariant: '#414844',
  onBackground: '#191c1c',
  outline: '#717973',
  outlineVariant: '#c1c8c2',

  // Erreurs
  error: '#ba1a1a',
  onError: '#ffffff',
  errorContainer: '#ffdad6',
  onErrorContainer: '#93000a',
} as const;

export type VerdantColorKey = keyof typeof VerdantColors;

/**
 * Palette réduite pour Recharts (graphiques cashflow, patrimoine)
 */
export const VerdantChartPalette = {
  positive: VerdantColors.primaryContainer, // #1b4332 — cashflow positif
  negative: VerdantColors.error, // #ba1a1a — cashflow négatif
  neutral: VerdantColors.outline, // #717973 — ligne neutre
  surface: VerdantColors.surfaceContainerLow, // #f3f4f3 — fond de graphique
  gridLine: VerdantColors.outlineVariant, // #c1c8c2 — grille
  projection: VerdantColors.primaryFixed, // #c1ecd4 — aire de projection
  accent: VerdantColors.secondary, // #53625a — ligne secondaire
} as const;

export type VerdantChartKey = keyof typeof VerdantChartPalette;
