import { describe, it, expect } from 'vitest';
import { genererSynthese, genererAlertesLmp, calculerScoreGlobal } from './synthese';
import type { RentabiliteCalculations, HCSFCalculations } from './types';
import { mockConfig } from './__tests__/mock-config';

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
      cout_total_acquisition: 120000,
      taux_interet: 3.5,
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

    const synthese = genererSynthese(rentabilite, hcsf, mockConfig);

    expect(synthese.evaluation).toBe('Excellent');
    expect(synthese.score_global).toBeGreaterThanOrEqual(80);
    expect(synthese.points_attention).toHaveLength(0);
  });

  it('should return "Moyen" with points of attention for negative cashflow', () => {
    const rentabilite = mockRentabilite(-100, 7); // Cashflow -100, Renta 7%
    const hcsf = mockHCSF(true, 33); // Conforme mais proche limite

    const synthese = genererSynthese(rentabilite, hcsf, mockConfig);

    // Score avec poids profil rentier: 40 - 15(cashflow) + 24(renta) + 4(hcsf) + 5(ratio) = 58 → Moyen
    expect(synthese.evaluation).toBe('Moyen');
    expect(synthese.points_attention).toContainEqual(expect.stringContaining('Cash-flow négatif'));
  });

  it('should return "Faible" for non-compliant HCSF and poor returns', () => {
    const rentabilite = mockRentabilite(-300, 4);
    const hcsf = mockHCSF(false, 42);

    const synthese = genererSynthese(rentabilite, hcsf, mockConfig);

    expect(synthese.evaluation).toBe('Faible');
    expect(synthese.score_global).toBeLessThan(50);
    expect(synthese.points_attention).toContainEqual(expect.stringContaining('HCSF'));
  });

  it('should correctly calculate the 0-100 score global', () => {
    // Cas neutre
    const res1 = genererSynthese(mockRentabilite(0, 5), mockHCSF(true, 30), mockConfig);
    // Cas très positif
    const res2 = genererSynthese(mockRentabilite(500, 12), mockHCSF(true, 25), mockConfig);

    expect(res2.score_global).toBeGreaterThan(res1.score_global);
    expect(res2.score_global).toBeLessThanOrEqual(100);
    expect(res1.score_global).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================================
// V2-S16 : Scoring dual profil Rentier/Patrimonial
// ============================================================================
describe('V2-S16 : Scoring Rentier vs Patrimonial', () => {
  const baseParams = {
    cashflowMensuel: 100,        // Cashflow positif modeste
    rentabiliteNetteNette: 6,    // Rentabilité correct
    tauxEndettement: 30,
    hcsfConforme: true,
    prixAchat: 200000,
    loyerAnnuel: 12000,
  };

  it('même simulation → scores différents selon profil', () => {
    const scoreRentier = calculerScoreGlobal({ ...baseParams, config: mockConfig, profilInvestisseur: 'rentier' });
    const scorePatrimonial = calculerScoreGlobal({ ...baseParams, config: mockConfig, profilInvestisseur: 'patrimonial' });

    // Les scores doivent être différents
    expect(scoreRentier.total).not.toBe(scorePatrimonial.total);
  });

  it('profil patrimonial donne un cashflow ajustement plus faible (pondéré 0.5)', () => {
    // Cashflow très positif : avantage le Rentier
    const highCashflow = { ...baseParams, cashflowMensuel: 400 };
    const scoreRentier = calculerScoreGlobal({ ...highCashflow, config: mockConfig, profilInvestisseur: 'rentier' });
    const scorePatrimonial = calculerScoreGlobal({ ...highCashflow, config: mockConfig, profilInvestisseur: 'patrimonial' });

    // L'ajustement cashflow doit être plus faible en patrimonial
    expect(Math.abs(scorePatrimonial.ajustements.cashflow)).toBeLessThan(
      Math.abs(scoreRentier.ajustements.cashflow)
    );
  });

  it('profil rentier donne un ajustement rentabilite plus élevé que patrimonial (pondéré 1.2 vs 1.0)', () => {
    // Rentabilité excellente — rentier pondère plus fortement la rentabilité
    const highRenta = { ...baseParams, rentabiliteNetteNette: 8 };
    const scoreRentier = calculerScoreGlobal({ ...highRenta, config: mockConfig, profilInvestisseur: 'rentier' });
    const scorePatrimonial = calculerScoreGlobal({ ...highRenta, config: mockConfig, profilInvestisseur: 'patrimonial' });

    expect(scoreRentier.ajustements.rentabilite).toBeGreaterThan(scorePatrimonial.ajustements.rentabilite);
  });

  it('genererSynthese inclut les deux scores pré-calculés', () => {
    const mockRenta = {
      loyer_annuel: 12000,
      financement: { montant_emprunt: 100000, mensualite_credit: 500, mensualite_assurance: 30, mensualite_totale: 530, remboursement_annuel: 6360, cout_total_credit: 127200, cout_total_interets: 27200, cout_total_acquisition: 120000, taux_interet: 3.5 },
      charges: { charges_fixes_annuelles: 2000, charges_proportionnelles_annuelles: 500, total_charges_annuelles: 2500 },
      rentabilite_brute: 10, rentabilite_nette: 6, revenu_net_avant_impots: 8000, cashflow_annuel: 1200, cashflow_mensuel: 100, effort_epargne_mensuel: 0, effet_levier: 0,
    };
    const mockHCSF = {
      structure: 'nom_propre' as const, taux_endettement: 30, conforme: true, capacite_emprunt_residuelle: 50000, details_associes: [], alertes: [],
      revenus_detail: { salaires_estimatif_mensuels: 4000, locatifs_bruts_mensuels: 1000, locatifs_ponderes_mensuels: 700, total_mensuels: 4700 },
      charges_detail: { credits_existants_mensuels: 0, nouveau_credit_mensuel: 530, charges_fixes_mensuelles: 0, total_mensuelles: 530 },
    };

    const synthese = genererSynthese(mockRenta, mockHCSF, mockConfig);
    expect(synthese.scores_par_profil).toBeDefined();
    expect(synthese.scores_par_profil!.rentier.total).toBeGreaterThanOrEqual(0);
    expect(synthese.scores_par_profil!.patrimonial.total).toBeGreaterThanOrEqual(0);
    expect(synthese.scores_par_profil!.rentier.total).not.toBe(synthese.scores_par_profil!.patrimonial.total);
  });
});

// ============================================================================
// V2-S17 : Alertes LMP
// ============================================================================
describe('V2-S17 : Alertes seuil LMP', () => {
  it('pas d\'alerte pour recettes < 20 000 €', () => {
    const alertes = genererAlertesLmp(15000, mockConfig);
    expect(alertes).toHaveLength(0);
  });

  it('alerte orange pour recettes entre 20 001 et 23 000 €', () => {
    const alertes = genererAlertesLmp(21000, mockConfig);
    expect(alertes).toHaveLength(1);
    expect(alertes[0].type).toBe('warning');
  });

  it('alerte rouge pour recettes > 23 000 €', () => {
    const alertes = genererAlertesLmp(24000, mockConfig);
    expect(alertes).toHaveLength(1);
    expect(alertes[0].type).toBe('error');
  });
});
