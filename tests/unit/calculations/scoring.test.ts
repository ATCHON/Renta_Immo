import { describe, it, expect } from 'vitest';
import {
  ajustementCashflow,
  ajustementRentabilite,
  ajustementHcsf,
  ajustementDpe,
  ajustementRatioPrixLoyer,
  ajustementResteAVivre,
  calculerScoreGlobal,
  genererEvaluation,
} from './synthese';

describe('AUDIT-106 : Scoring specification', () => {
  describe('ajustementCashflow (-20 / +20)', () => {
    it('+20 pour cashflow >= 200 EUR/mois', () => {
      expect(ajustementCashflow(200)).toBe(20);
      expect(ajustementCashflow(500)).toBe(20);
    });

    it('interpolation 0 a +20 pour 0 a 200', () => {
      expect(ajustementCashflow(0)).toBe(0);
      expect(ajustementCashflow(100)).toBe(10);
      expect(ajustementCashflow(50)).toBe(5);
    });

    it('interpolation -20 a 0 pour -200 a 0', () => {
      expect(ajustementCashflow(-100)).toBe(-10);
      expect(ajustementCashflow(-200)).toBe(-20);
    });

    it('-20 pour cashflow < -200', () => {
      expect(ajustementCashflow(-300)).toBe(-20);
      expect(ajustementCashflow(-500)).toBe(-20);
    });
  });

  describe('ajustementRentabilite (-15 / +20)', () => {
    it('+20 pour rentabilite >= 7%', () => {
      expect(ajustementRentabilite(7)).toBe(20);
      expect(ajustementRentabilite(10)).toBe(20);
    });

    it('interpolation 0 a +20 pour 3% a 7%', () => {
      expect(ajustementRentabilite(3)).toBe(0);
      expect(ajustementRentabilite(5)).toBe(10);
    });

    it('interpolation -15 a 0 pour 0% a 3%', () => {
      expect(ajustementRentabilite(0)).toBe(-15);
      expect(ajustementRentabilite(1.5)).toBe(-7.5);
    });

    it('-15 pour rentabilite < 0%', () => {
      expect(ajustementRentabilite(-1)).toBe(-15);
      expect(ajustementRentabilite(-5)).toBe(-15);
    });
  });

  describe('ajustementHcsf (-25 / +20)', () => {
    it('+20 pour taux <= 25%', () => {
      expect(ajustementHcsf(20, true)).toBe(20);
      expect(ajustementHcsf(25, true)).toBe(20);
    });

    it('interpolation 0 a +20 pour 25% a 35%', () => {
      expect(ajustementHcsf(30, true)).toBe(10);
      expect(ajustementHcsf(35, true)).toBe(0);
    });

    it('interpolation -15 a 0 pour 35% a 50%', () => {
      expect(ajustementHcsf(42.5, true)).toBe(-7.5);
      expect(ajustementHcsf(50, true)).toBe(-15);
    });

    it('-25 pour non conforme et taux > 50%', () => {
      expect(ajustementHcsf(55, false)).toBe(-25);
      expect(ajustementHcsf(60, false)).toBe(-25);
    });
  });

  describe('ajustementDpe (-10 / +5)', () => {
    it('+5 pour DPE A ou B', () => {
      expect(ajustementDpe('A')).toBe(5);
      expect(ajustementDpe('B')).toBe(5);
    });

    it('0 pour DPE C ou D', () => {
      expect(ajustementDpe('C')).toBe(0);
      expect(ajustementDpe('D')).toBe(0);
    });

    it('-3 pour DPE E', () => {
      expect(ajustementDpe('E')).toBe(-3);
    });

    it('-10 pour DPE F ou G (passoire)', () => {
      expect(ajustementDpe('F')).toBe(-10);
      expect(ajustementDpe('G')).toBe(-10);
    });

    it('0 si DPE non renseigne', () => {
      expect(ajustementDpe(undefined)).toBe(0);
    });
  });

  describe('ajustementRatioPrixLoyer (-5 / +10)', () => {
    it('+10 pour ratio <= 15', () => {
      // Prix 150000, loyer annuel 12000 => ratio 12.5
      expect(ajustementRatioPrixLoyer(150000, 12000)).toBe(10);
    });

    it('interpolation 0 a +10 pour ratio 15-20', () => {
      // Ratio = 17.5 (milieu)
      expect(ajustementRatioPrixLoyer(175000, 10000)).toBe(5);
    });

    it('interpolation -5 a 0 pour ratio 20-25', () => {
      // Ratio = 22.5
      expect(ajustementRatioPrixLoyer(225000, 10000)).toBe(-2.5);
    });

    it('-5 pour ratio > 25', () => {
      // Ratio = 30
      expect(ajustementRatioPrixLoyer(300000, 10000)).toBe(-5);
    });

    it('-5 si loyer annuel = 0', () => {
      expect(ajustementRatioPrixLoyer(200000, 0)).toBe(-5);
    });
  });

  describe('ajustementResteAVivre (-10 / +5)', () => {
    it('+5 si reste a vivre >= 1500 EUR', () => {
      expect(ajustementResteAVivre(3000, 1000)).toBe(5);
    });

    it('0 si reste a vivre entre 800 et 1500', () => {
      expect(ajustementResteAVivre(2000, 1000)).toBe(0); // RAV = 1000
    });

    it('-10 si reste a vivre < 800', () => {
      expect(ajustementResteAVivre(1200, 500)).toBe(-10);  // RAV = 1200 - 500 = 700 < 800 => -10
    });

    it('0 si revenus non renseignes', () => {
      expect(ajustementResteAVivre(undefined, 1000)).toBe(0);
      expect(ajustementResteAVivre(0, 1000)).toBe(0);
    });
  });

  describe('calculerScoreGlobal', () => {
    it('investissement excellent : score plafonne a 100', () => {
      const result = calculerScoreGlobal({
        cashflowMensuel: 300,
        rentabiliteNetteNette: 8,
        tauxEndettement: 20,
        hcsfConforme: true,
        dpe: 'B',
        prixAchat: 120000,
        loyerAnnuel: 12000, // ratio = 10
        revenusActivite: 5000,
        totalChargesMensuelles: 2000, // RAV = 3000
      });

      // Base 40 + cashflow 20 + renta 20 + hcsf 20 + dpe 5 + ratio 10 + rav 5 = 120 -> plafonne a 100
      expect(result.base).toBe(40);
      expect(result.total).toBe(100);
    });

    it('investissement mediocre : score borne a 0', () => {
      const result = calculerScoreGlobal({
        cashflowMensuel: -300,
        rentabiliteNetteNette: -1,
        tauxEndettement: 55,
        hcsfConforme: false,
        dpe: 'G',
        prixAchat: 300000,
        loyerAnnuel: 10000, // ratio = 30
        revenusActivite: 1200,
        totalChargesMensuelles: 500, // RAV = 700 < 800
      });

      // Base 40 + (-20) + (-15) + (-25) + (-10) + (-5) + (-10) = -45 -> borne a 0
      expect(result.total).toBe(0);
    });

    it('investissement moyen : score autour de 60-65', () => {
      const result = calculerScoreGlobal({
        cashflowMensuel: 50,
        rentabiliteNetteNette: 4,
        tauxEndettement: 30,
        hcsfConforme: true,
        dpe: 'D',
        prixAchat: 180000,
        loyerAnnuel: 10000, // ratio = 18
      });

      // Base 40 + cashflow ~5 + renta ~5 + hcsf ~10 + dpe 0 + ratio ~4 = ~64
      expect(result.total).toBeGreaterThan(55);
      expect(result.total).toBeLessThan(75);
    });

    it('le score detail contient tous les ajustements', () => {
      const result = calculerScoreGlobal({
        cashflowMensuel: 100,
        rentabiliteNetteNette: 5,
        tauxEndettement: 30,
        hcsfConforme: true,
        prixAchat: 200000,
        loyerAnnuel: 12000,
      });

      expect(result.ajustements).toHaveProperty('cashflow');
      expect(result.ajustements).toHaveProperty('rentabilite');
      expect(result.ajustements).toHaveProperty('hcsf');
      expect(result.ajustements).toHaveProperty('dpe');
      expect(result.ajustements).toHaveProperty('ratio_prix_loyer');
      expect(result.ajustements).toHaveProperty('reste_a_vivre');
    });
  });

  describe('genererEvaluation', () => {
    it('Excellent pour score >= 80', () => {
      expect(genererEvaluation(80).evaluation).toBe('Excellent');
      expect(genererEvaluation(100).evaluation).toBe('Excellent');
      expect(genererEvaluation(80).couleur).toBe('green');
    });

    it('Bon pour score 60-79', () => {
      expect(genererEvaluation(60).evaluation).toBe('Bon');
      expect(genererEvaluation(79).evaluation).toBe('Bon');
      expect(genererEvaluation(65).couleur).toBe('blue');
    });

    it('Moyen pour score 40-59', () => {
      expect(genererEvaluation(40).evaluation).toBe('Moyen');
      expect(genererEvaluation(59).evaluation).toBe('Moyen');
      expect(genererEvaluation(50).couleur).toBe('orange');
    });

    it('Faible pour score < 40', () => {
      expect(genererEvaluation(0).evaluation).toBe('Faible');
      expect(genererEvaluation(39).evaluation).toBe('Faible');
      expect(genererEvaluation(20).couleur).toBe('red');
    });
  });
});
