import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  cn,
  parseNumber,
  calculateMensualite,
  calculateRentabiliteBrute,
  generateId,
  debounce,
  isClient,
  delay,
  formatCurrency,
  formatPercent,
  formatNumber,
} from '@/lib/utils';

// =============================================================================
// cn — combinaison classes CSS
// =============================================================================
describe('cn', () => {
  it('combine des classes simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('gère les valeurs falsy', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('retourne une chaîne vide sans arguments', () => {
    expect(cn()).toBe('');
  });

  it('gère les tableaux', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('gère les objets conditionnels', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });
});

// =============================================================================
// parseNumber
// =============================================================================
describe('parseNumber', () => {
  it('parse un nombre valide depuis une string', () => {
    expect(parseNumber('42')).toBe(42);
  });

  it('parse un nombre décimal depuis une string', () => {
    expect(parseNumber('3.14')).toBeCloseTo(3.14);
  });

  it('retourne 0 pour undefined', () => {
    expect(parseNumber(undefined)).toBe(0);
  });

  it('retourne 0 pour une chaîne vide', () => {
    expect(parseNumber('')).toBe(0);
  });

  it('retourne 0 pour une chaîne invalide', () => {
    expect(parseNumber('abc')).toBe(0);
  });

  it('retourne le nombre directement si type number', () => {
    expect(parseNumber(99)).toBe(99);
  });

  it('retourne 0 pour NaN', () => {
    expect(parseNumber(NaN)).toBe(0);
  });
});

// =============================================================================
// calculateMensualite
// =============================================================================
describe('calculateMensualite', () => {
  it('calcule la mensualité correctement avec taux > 0', () => {
    // 200 000€, 3.5%, 20 ans → ~1 159.92€/mois (formule standard)
    const result = calculateMensualite(200000, 3.5, 20);
    expect(result).toBeCloseTo(1159.92, 0);
  });

  it('retourne montant / (durée * 12) quand taux = 0', () => {
    const result = calculateMensualite(120000, 0, 10);
    expect(result).toBe(1000);
  });

  it('retourne 0 quand montant <= 0', () => {
    expect(calculateMensualite(0, 3.5, 20)).toBe(0);
    expect(calculateMensualite(-1000, 3.5, 20)).toBe(0);
  });

  it('retourne 0 quand durée <= 0', () => {
    expect(calculateMensualite(200000, 3.5, 0)).toBe(0);
    expect(calculateMensualite(200000, 3.5, -5)).toBe(0);
  });

  it('calcule correctement avec des petits montants', () => {
    const result = calculateMensualite(10000, 2, 5);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(200);
  });
});

// =============================================================================
// calculateRentabiliteBrute
// =============================================================================
describe('calculateRentabiliteBrute', () => {
  it('calcule la rentabilité brute correctement', () => {
    // 750€/mois, 150 000€ → (750 * 12 * 100) / 150000 = 6%
    expect(calculateRentabiliteBrute(750, 150000)).toBe(6);
  });

  it('retourne 0 si prix <= 0', () => {
    expect(calculateRentabiliteBrute(750, 0)).toBe(0);
    expect(calculateRentabiliteBrute(750, -100)).toBe(0);
  });

  it('gère les petits loyers', () => {
    expect(calculateRentabiliteBrute(1, 100000)).toBeCloseTo(0.012, 3);
  });
});

// =============================================================================
// generateId
// =============================================================================
describe('generateId', () => {
  it('génère une chaîne non vide', () => {
    const id = generateId();
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
  });

  it('génère des ids uniques', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

// =============================================================================
// debounce
// =============================================================================
describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("retarde l'exécution de la fonction", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("annule l'appel précédent si appelé à nouveau", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    debounced();
    debounced();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passe les arguments correctement', () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 50);

    debounced('arg1', 'arg2');
    vi.advanceTimersByTime(50);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });
});

// =============================================================================
// isClient
// =============================================================================
describe('isClient', () => {
  it('retourne un booléen', () => {
    expect(typeof isClient()).toBe('boolean');
  });
});

// =============================================================================
// delay
// =============================================================================
describe('delay', () => {
  it('résout après le délai spécifié', async () => {
    vi.useFakeTimers();

    const promise = delay(100);
    vi.advanceTimersByTime(100);
    await promise;

    vi.useRealTimers();
  });

  it('retourne une Promise', () => {
    vi.useFakeTimers();
    const result = delay(10);
    expect(result).toBeInstanceOf(Promise);
    vi.advanceTimersByTime(10);
    vi.useRealTimers();
  });
});

// =============================================================================
// formatCurrency (déjà couvert par format.test, mais ajout edge cases)
// =============================================================================
describe('formatCurrency', () => {
  it('formate les grands nombres avec séparateurs', () => {
    const result = formatCurrency(1500000);
    expect(result).toContain('1');
    expect(result).toContain('500');
    expect(result).toContain('000');
  });
});

// =============================================================================
// formatPercent
// =============================================================================
describe('formatPercent', () => {
  it('formate avec le nombre de décimales spécifié', () => {
    const result = formatPercent(5.5, 1);
    expect(result).toContain('5');
  });
});

// =============================================================================
// formatNumber
// =============================================================================
describe('formatNumber', () => {
  it('formate avec décimales', () => {
    const result = formatNumber(1234.567, 2);
    expect(result).toContain('1');
    expect(result).toContain('234');
  });
});
