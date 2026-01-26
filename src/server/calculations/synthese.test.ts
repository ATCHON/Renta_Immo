import { describe, it, expect } from 'vitest';
import { genererSynthese } from './synthese';
import type { RentabiliteCalculations, HCSFCalculations } from './types';

describe('Calculations Synthese', () => {
  const mockRentabilite = (cashflow: number, rentabiliteNette: number): RentabiliteCalculations => ({
    loyer_annuel: 12000,
    financement: {} as any,
    charges: {} as any,
    rentabilite_brute: 10,
    rentabilite_nette: rentabiliteNette,
    revenu_net_avant_impots: 8000,
    cashflow_annuel: cashflow * 12,
    cashflow_mensuel: cashflow,
  });

  const mockHCSF = (conforme: boolean, taux: number): HCSFCalculations => ({
    structure: 'nom_propre',
    taux_endettement: taux,
    conforme: conforme,
    details_associes: [],
    alertes: conforme ? [] : ['Taux trop élevé'],
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
    expect(synthese.points_attention).toContainEqual(expect.stringContaining('Non conforme HCSF'));
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
