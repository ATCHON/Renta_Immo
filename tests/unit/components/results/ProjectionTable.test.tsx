// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProjectionTable } from '@/components/results/ProjectionTable';
import type { ProjectionData } from '@/types/calculateur';

const mockData = {
  horizon: 2,
  hypotheses: {
    inflationLoyer: 0.01,
    inflationCharges: 0.01,
    revalorisationBien: 0.01,
    defiscalisationActive: false,
    impotSocieteActive: false,
  },
  totaux: {
    loyersCumules: 20000,
    chargesCumulees: 2000,
    mensualitesCumulees: 10000,
    cashflowBrutCumule: 8000,
    impotCumule: 1000,
    cashflowCumule: 7000,
    gainCapitalCumule: 5000,
    plusValueCumulee: 2000,
    enrichissementTotal: 14000,
  },
  projections: [
    {
      annee: 1,
      loyer: 10000,
      charges: 1000,
      mensualite: 5000,
      taxes: 0,
      cashflow: 4000,
      impot: 500,
      cashflowNetImpot: 3500,
      capitalRestant: 90000,
      valeurBien: 101000,
      patrimoineNet: 11000,
      revFoncierImposable: 0,
      defiscalisationLoi: 0,
      capitalRembourse: 5000,
      interets: 0,
    },
    {
      annee: 2,
      loyer: 10100,
      charges: 1010,
      mensualite: 5000,
      taxes: 0,
      cashflow: 4090,
      impot: 500,
      cashflowNetImpot: 3590,
      capitalRestant: 85000,
      valeurBien: 102010,
      patrimoineNet: 17010,
      revFoncierImposable: 0,
      defiscalisationLoi: 0,
      capitalRembourse: 5000,
      interets: 0,
    },
  ],
} as any;

describe('ProjectionTable — Toggle Annuel/Trimestriel (D18)', () => {
  it('renders annual rows by default', () => {
    const { container } = render(<ProjectionTable data={mockData} />);
    // current year
    const yr = new Date().getFullYear();
    expect(screen.getByText(String(yr))).toBeDefined();
    expect(screen.getByText(String(yr + 1))).toBeDefined();

    // There shouldn't be quarterly labels like "T1 "
    expect(screen.queryByText(`T1 ${yr}`)).toBeNull();
  });

  it('switches to trimestriel rows when toggled', () => {
    render(<ProjectionTable data={mockData} />);
    const quarterlyToggle = screen.getByRole('button', { name: /Trimestriel/i });
    fireEvent.click(quarterlyToggle);

    const yr = new Date().getFullYear();
    expect(screen.getAllByText(`T1 ${yr}`).length).toBeGreaterThan(0);
    expect(screen.getAllByText(`T2 ${yr}`).length).toBeGreaterThan(0);
  });
});
