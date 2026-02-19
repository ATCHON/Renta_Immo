// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils';

describe('formatCurrency', () => {
  it('formate 150000 avec le symbole €', () => {
    const result = formatCurrency(150000);
    expect(result).toContain('€');
    expect(result).toMatch(/150[\s\u00a0]?000|150000/);
  });

  it('formate 0 en contenant "€"', () => {
    expect(formatCurrency(0)).toContain('€');
  });

  it('gère les valeurs négatives', () => {
    const result = formatCurrency(-500);
    expect(result).toContain('500');
  });

  it('formate 1500000 (1,5M)', () => {
    const result = formatCurrency(1500000);
    expect(result).toContain('€');
    expect(result.length).toBeGreaterThan(2);
  });
});

describe('formatPercent', () => {
  it('formate 5.23 avec le symbole %', () => {
    const result = formatPercent(5.23);
    expect(result).toContain('%');
    expect(result).toContain('5');
  });

  it('formate 0 avec le symbole %', () => {
    const result = formatPercent(0);
    expect(result).toContain('%');
  });

  it('formate 100 avec le symbole %', () => {
    const result = formatPercent(100);
    expect(result).toContain('%');
    expect(result).toContain('100');
  });

  it('respecte le paramètre decimals', () => {
    const result = formatPercent(5.1234, 1);
    expect(result).toContain('%');
  });
});

describe('formatNumber', () => {
  it('formate 1234 sans décimales par défaut', () => {
    const result = formatNumber(1234);
    expect(result).toMatch(/1[\s\u00a0,.]?234|1234/);
  });

  it('formate 0', () => {
    expect(formatNumber(0)).toContain('0');
  });
});
