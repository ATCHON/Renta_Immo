/**
 * Fonctions utilitaires
 */

import { type ClassValue, clsx } from 'clsx';

/**
 * Combine des classes CSS conditionnellement
 * Note: twMerge peut être ajouté si besoin de résolution de conflits Tailwind
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

/**
 * Formate un nombre en euros
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formate un nombre en pourcentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

/**
 * Formate un nombre avec séparateurs de milliers
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Parse une valeur en nombre, retourne 0 si invalide
 */
export function parseNumber(value: string | number | undefined): number {
  if (value === undefined || value === '') return 0;
  const parsed = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calcule la mensualité d'un prêt
 */
export function calculateMensualite(
  montant: number,
  tauxAnnuel: number,
  dureeAnnees: number
): number {
  if (montant <= 0 || dureeAnnees <= 0) return 0;
  if (tauxAnnuel === 0) return montant / (dureeAnnees * 12);

  const tauxMensuel = tauxAnnuel / 100 / 12;
  const nombreMois = dureeAnnees * 12;

  return (
    (montant * tauxMensuel * Math.pow(1 + tauxMensuel, nombreMois)) /
    (Math.pow(1 + tauxMensuel, nombreMois) - 1)
  );
}

/**
 * Calcule la rentabilité brute
 */
export function calculateRentabiliteBrute(loyerMensuel: number, prixAchat: number): number {
  if (prixAchat <= 0) return 0;
  return (loyerMensuel * 12 * 100) / prixAchat;
}

/**
 * Génère un identifiant unique
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Debounce une fonction
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Vérifie si on est côté client
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Délai asynchrone
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
