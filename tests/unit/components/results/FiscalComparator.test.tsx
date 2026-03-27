// @vitest-environment jsdom
/**
 * UX-S03 — Tests unitaires : FiscalComparator
 *
 * Verifie :
 * - Rendu de chaque item fiscal
 * - Badge RECOMMANDE sur l'item optimal
 * - Badge VOTRE CHOIX sur l'item selectionne
 * - Affichage des KPIs (cashflow, rentabilite)
 * - data-testid corrects
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FiscalComparator } from '@/components/results/FiscalComparator';
import type { FiscaliteComparaison } from '@/types/calculateur';

const BASE_DATA: FiscaliteComparaison = {
  conseil: 'Optez pour LMNP Reel pour optimiser votre fiscalite.',
  items: [
    {
      regime: 'LMNP Reel',
      description: 'Amortissements deductibles',
      cashflowNetMoyen: 250,
      impotAnnuelMoyen: 0,
      rentabiliteNetteNette: 4.5,
      isOptimal: true,
      isSelected: false,
      avantages: [],
      inconvenients: [],
    },
    {
      regime: 'Micro-BIC',
      description: 'Abattement 50%',
      cashflowNetMoyen: -80,
      impotAnnuelMoyen: 0,
      rentabiliteNetteNette: 2.1,
      isOptimal: false,
      isSelected: true,
      avantages: [],
      inconvenients: [],
    },
    {
      regime: 'SCI IS',
      description: 'IS 15% puis 25%',
      cashflowNetMoyen: 100,
      impotAnnuelMoyen: 0,
      rentabiliteNetteNette: 3.0,
      isOptimal: false,
      isSelected: false,
      avantages: [],
      inconvenients: [],
    },
  ],
};

describe('FiscalComparator — rendu de base', () => {
  it('affiche les 3 regimes fiscaux', () => {
    render(<FiscalComparator data={BASE_DATA} />);
    expect(screen.getByText('LMNP Reel')).toBeDefined();
    expect(screen.getByText('Micro-BIC')).toBeDefined();
    expect(screen.getByText('SCI IS')).toBeDefined();
  });

  it('affiche les descriptions de chaque regime', () => {
    render(<FiscalComparator data={BASE_DATA} />);
    expect(screen.getByText('Amortissements deductibles')).toBeDefined();
    expect(screen.getByText('Abattement 50%')).toBeDefined();
  });

  it('retourne null quand data.items est vide', () => {
    const { container } = render(<FiscalComparator data={{ conseil: 'test', items: [] }} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('FiscalComparator — badge RECOMMANDE', () => {
  it('affiche le badge RECOMMANDE sur le regime optimal', () => {
    render(<FiscalComparator data={BASE_DATA} />);
    expect(screen.getByTestId('badge-recommande')).toBeDefined();
    expect(screen.getByTestId('badge-recommande').textContent).toMatch(/RECOMMAND/i);
  });

  it("le data-testid fiscal-item-recommended est sur l'item optimal", () => {
    render(<FiscalComparator data={BASE_DATA} />);
    const recommended = screen.getByTestId('fiscal-item-recommended');
    expect(recommended.textContent).toContain('LMNP Reel');
  });

  it("n'affiche qu'un seul badge RECOMMANDE", () => {
    render(<FiscalComparator data={BASE_DATA} />);
    expect(screen.getAllByTestId('badge-recommande').length).toBe(1);
  });
});

describe('FiscalComparator — badge VOTRE CHOIX', () => {
  it("affiche le badge VOTRE CHOIX sur l'item selectionne non optimal", () => {
    render(<FiscalComparator data={BASE_DATA} />);
    expect(screen.getByText('VOTRE CHOIX')).toBeDefined();
  });

  it("affiche VOTRE CHOIX et RECOMMANDE ensemble quand l'item est optimal ET selectionne", () => {
    const data: FiscaliteComparaison = {
      conseil: 'test conseil',
      items: [
        {
          regime: 'LMNP Reel',
          description: 'Amortissements deductibles',
          cashflowNetMoyen: 250,
          impotAnnuelMoyen: 0,
          rentabiliteNetteNette: 4.5,
          isOptimal: true,
          isSelected: true,
          avantages: [],
          inconvenients: [],
        },
      ],
    };
    render(<FiscalComparator data={data} />);
    expect(screen.getByText('VOTRE CHOIX')).toBeDefined();
    expect(screen.getByTestId('badge-recommande')).toBeDefined();
  });
});

describe('FiscalComparator — KPIs', () => {
  it('affiche le cashflow positif avec signe +', () => {
    render(<FiscalComparator data={BASE_DATA} />);
    expect(document.body.textContent).toContain('+250');
  });

  it('affiche le cashflow negatif sans signe +', () => {
    render(<FiscalComparator data={BASE_DATA} />);
    expect(document.body.textContent).toContain('-80');
  });

  it('affiche la rentabilite nette-nette', () => {
    render(<FiscalComparator data={BASE_DATA} />);
    expect(document.body.textContent).toContain('4.5% net-net');
  });
});
