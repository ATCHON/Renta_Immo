/**
 * Tests unitaires : kpiFormat
 * Couvre les règles de formatage partagées entre les composants ResultsAnchorStep*.
 */

import { describe, it, expect } from 'vitest';
import { fmtEuro, fmtPercent } from '@/utils/kpiFormat';

describe('fmtEuro', () => {
  it('retourne "—" pour null', () => {
    expect(fmtEuro(null)).toBe('—');
  });

  it('formate < 1 000 en € sans unité compacte', () => {
    expect(fmtEuro(999)).toMatch(/~.*999.*€/);
    expect(fmtEuro(0)).toMatch(/~.*€/);
  });

  it('formate ≥ 1 000 en k€', () => {
    expect(fmtEuro(1_000)).toMatch(/~.*1.*k€/);
    expect(fmtEuro(50_000)).toMatch(/~.*k€/);
  });

  it('formate ≥ 1 000 000 en M€', () => {
    expect(fmtEuro(1_000_000)).toMatch(/~.*1.*M€/);
    expect(fmtEuro(2_500_000)).toMatch(/~.*M€/);
  });

  it('préfixe toujours avec ~', () => {
    expect(fmtEuro(500)).toMatch(/^~/);
    expect(fmtEuro(5_000)).toMatch(/^~/);
    expect(fmtEuro(5_000_000)).toMatch(/^~/);
  });
});

describe('fmtPercent', () => {
  it('retourne "—" pour null', () => {
    expect(fmtPercent(null)).toBe('—');
  });

  it('formate avec 1 décimale par défaut', () => {
    expect(fmtPercent(5.2)).toMatch(/~.*5[,.]2\s*%/);
  });

  it('formate avec 2 décimales quand fractionDigits=2', () => {
    expect(fmtPercent(4.23, 2)).toMatch(/~.*4[,.]23\s*%/);
  });

  it('préfixe toujours avec ~', () => {
    expect(fmtPercent(3.5)).toMatch(/^~/);
  });

  it('inclut le signe %', () => {
    expect(fmtPercent(10)).toMatch(/%/);
  });
});
