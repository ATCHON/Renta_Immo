import { describe, it, expect } from 'vitest';
import { genererSynthese } from './synthese';
import type { RentabiliteCalculations, HCSFCalculations } from './types';

describe('Calculations Synthese', () => {
  const mockRentabilite = (cashflow: number, rentabiliteNette: number): RentabiliteCalculations => ({
    loyer_annuel: 12000,
    financement: {
      montant_emprunt: 100000,
      mensualite_credit: 500,
      mensualite_assurance: 30,
      mensualite_totale: 530,
      remboursement_annuel: 6360,
      cout_total_credit: 127200,
      cout_total_interets: 27200,
    },
    charges: {
      charges_fixes_annuelles: 2000,
      charges_proportionnelles_annuelles: 500,
      total_charges_annuelles: 2500,
    },
    rentabilite_brute: 10,
    rentabilite_nette: rentabiliteNette,
    revenu_net_avant_impots: 8000,
    cashflow_annuel: cashflow * 12,
    cashflow_mensuel: cashflow,
    effort_epargne_mensuel: 0,
    effet_levier: 0,
  });

  const mockHCSF = (conforme: boolean, taux: number): HCSFCalculations => ({
    structure: 'nom_propre',
    taux_endettement: taux,
    conforme: conforme,
    capacite_emprunt_residuelle: conforme ? 50000 : 0,
    details_associes: [],
    alertes: conforme ? [] : ['Taux d\'endettement trop élevé (HCSF)'],
    revenus_detail: {
      salaires_estimatif_mensuels: 3000,
      locatifs_bruts_mensuels: 1000,
      locatifs_ponderes_mensuels: 700,
      total_mensuels: 3700,
    },
    charges_detail: {
      credits_existants_mensuels: 200,
      nouveau_credit_mensuel: 530,
      charges_fixes_mensuelles: 100,
      total_mensuelles: 830,
    },
  });

  it('should return "Excellent" for a very good project', () => {
    const rentabilite = mockRentabilite(200, 11); // Cashflow +200, Renta 11%
    const hcsf = mockHCSF(true, 30); // Conforme

    const synthese = genererSynthese(rentabilite, hcsf);

    expect(synthese.evaluation).toBe('Excellent');
    expect(synthese.score_global).toBeGreaterThanOrEqual(80);
    expect(synthese.points_attention).toHaveLength(0);
  });

  it('should return "Moyen" and points of attention for negative cashflow', () => {
    const rentabilite = mockRentabilite(-100, 7); // Cashflow -100, Renta 7%
    const hcsf = mockHCSF(true, 33); // Conforme mais proche limite

    const synthese = genererSynthese(rentabilite, hcsf);

    expect(synthese.evaluation).toBe('Moyen');
    expect(synthese.points_attention).toContainEqual(expect.stringContaining('Cash-flow négatif'));
  });

  it('should return "Faible" for non-compliant HCSF and poor returns', () => {
    const rentabilite = mockRentabilite(-300, 4);
    const hcsf = mockHCSF(false, 42);

    const synthese = genererSynthese(rentabilite, hcsf);

    expect(synthese.evaluation).toBe('Faible');
    expect(synthese.score_global).toBeLessThan(50);
    expect(synthese.points_attention).toContainEqual(expect.stringContaining('HCSF'));
  });

  it('should correctly calculate the 0-100 score global', () => {
    // Cas neutre
    const res1 = genererSynthese(mockRentabilite(0, 5), mockHCSF(true, 30));
    // Cas très positif
    const res2 = genererSynthese(mockRentabilite(500, 12), mockHCSF(true, 25));

    expect(res2.score_global).toBeGreaterThan(res1.score_global);
    expect(res2.score_global).toBeLessThanOrEqual(100);
    expect(res1.score_global).toBeGreaterThanOrEqual(0);
  });
});
