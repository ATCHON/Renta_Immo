// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CashflowCard } from '@/components/results/CashflowCard';
import type { CashflowResultat } from '@/types';

const cashflowBase: CashflowResultat = {
  mensuel: -1079.58,
  annuel: -12954.96,
  mensuel_brut: -1325,
  annuel_brut: -15900,
};

describe('CashflowCard', () => {
  it('affiche un libellé "avant impôts" sur la valeur mensuelle brute', () => {
    render(<CashflowCard cashflow={cashflowBase} />);
    expect(screen.getAllByText(/avant impôts/i).length).toBeGreaterThan(0);
  });

  it('affiche un libellé "après impôts" sur la valeur mensuelle nette', () => {
    render(<CashflowCard cashflow={cashflowBase} />);
    expect(screen.getAllByText(/après impôts/i).length).toBeGreaterThan(0);
  });

  it('affiche la valeur brute mensuelle quand mensuel_brut est défini', () => {
    render(<CashflowCard cashflow={cashflowBase} />);
    // formatCurrency rounds -1325 to -1 325 €
    expect(screen.getAllByText(/-1 325/).length).toBeGreaterThan(0);
  });

  it('affiche la valeur nette mensuelle', () => {
    render(<CashflowCard cashflow={cashflowBase} />);
    // formatCurrency rounds -1079.58 to -1 080 €
    expect(screen.getAllByText(/-1 080/).length).toBeGreaterThan(0);
  });

  it("n'affiche pas la valeur brute si mensuel_brut est absent", () => {
    const cashflowSansBrut: CashflowResultat = { mensuel: -500, annuel: -6000 };
    render(<CashflowCard cashflow={cashflowSansBrut} />);
    expect(screen.queryAllByText(/avant impôts/i)).toHaveLength(0);
  });
});
