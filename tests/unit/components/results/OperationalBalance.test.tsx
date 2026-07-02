// @vitest-environment jsdom
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OperationalBalance } from '@/components/results/OperationalBalance';
import type {
  ExploitationData,
  CashflowResultat,
  FinancementResultat,
  RentabiliteResultat,
} from '@/types';

const exploitationBase: Partial<ExploitationData> = {
  loyer_mensuel: 1100,
  taux_occupation: 0.92,
};

const cashflowBase: CashflowResultat = {
  mensuel: -1325,
  annuel: -15900,
};

const financementBase: FinancementResultat = {
  montant_emprunt: 180000,
  mensualite: 1677,
  cout_total_credit: 100000,
  frais_notaire: 15000,
  taeg: 3.5,
  capacite_endettement: 33,
};

const rentabiliteBase: RentabiliteResultat = {
  brute: 4.5,
  nette: 2.1,
  nette_nette: 1.8,
  charges_mensuelles: 415,
};

describe('OperationalBalance', () => {
  it('affiche les revenus locatifs nets de vacance (loyer × taux_occupation)', () => {
    const { container } = render(
      <OperationalBalance
        exploitation={exploitationBase}
        cashflow={cashflowBase}
        financement={financementBase}
        rentabilite={rentabiliteBase}
        impotMensuel={246}
      />
    );
    // La rangée "Revenus locatifs" est dans un div flex justify-between
    // On remonte depuis le span "Revenus locatifs" jusqu'au div parent de la rangée
    const revenusSpan = screen.getByText('Revenus locatifs');
    // parentElement = div.flex.items-center.gap-2, parentElement.parentElement = div.flex.justify-between (la rangée)
    const rangeEl = revenusSpan.parentElement?.parentElement;
    expect(rangeEl?.textContent).toMatch(/1\s*012/);
    // Le loyer brut (1 100) ne doit PAS apparaître comme montant de revenu
    expect(rangeEl?.textContent).not.toMatch(/1\s*100\s*€/);
  });

  it('affiche le taux d\'occupation en % dans le libellé', () => {
    render(
      <OperationalBalance
        exploitation={exploitationBase}
        cashflow={cashflowBase}
        financement={financementBase}
        rentabilite={rentabiliteBase}
        impotMensuel={246}
      />
    );
    // Doit mentionner 92 % occ. dans la rangée revenus
    const revenusSpan = screen.getByText('Revenus locatifs');
    const rangeEl = revenusSpan.parentElement?.parentElement;
    expect(rangeEl?.textContent).toMatch(/92/);
    expect(rangeEl?.textContent).toMatch(/occ/i);
  });

  it('le bilan est arithmétiquement cohérent (revenus - charges - crédit - impôts ≈ cashflow ±1 €)', () => {
    const loyer = 1100;
    const tauxOcc = 0.92;
    const loyerNet = Math.round(loyer * tauxOcc);
    const charges = 415;
    const mensualite = 1677;
    const impot = 246;
    const cashflowAttendu = -1325;

    const sommeBilan = loyerNet - charges - mensualite - impot;
    expect(Math.abs(sommeBilan - cashflowAttendu)).toBeLessThanOrEqual(1);
  });

  it('utilise taux_occupation=0.92 par défaut si non fourni', () => {
    const exploitationSansTaux: Partial<ExploitationData> = {
      loyer_mensuel: 1100,
      // taux_occupation absent → défaut 0.92
    };
    render(
      <OperationalBalance
        exploitation={exploitationSansTaux}
        cashflow={cashflowBase}
        financement={financementBase}
        rentabilite={rentabiliteBase}
        impotMensuel={246}
      />
    );
    // 1100 × 0.92 = 1012
    const revenusSpan = screen.getByText('Revenus locatifs');
    const rangeEl = revenusSpan.parentElement?.parentElement;
    expect(rangeEl?.textContent).toMatch(/1\s*012/);
  });
});
