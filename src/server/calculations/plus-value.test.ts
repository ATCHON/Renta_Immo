import { describe, it, expect } from 'vitest';
import { calculerPlusValueIR, calculerPlusValueSciIs, abattementIR, abattementPS } from './fiscalite';

describe('AUDIT-105 : Plus-value a la revente', () => {
  describe('abattementIR', () => {
    it('0% pour detention <= 5 ans', () => {
      expect(abattementIR(0)).toBe(0);
      expect(abattementIR(1)).toBe(0);
      expect(abattementIR(5)).toBe(0);
    });

    it('6% par an de la 6e a la 21e annee', () => {
      expect(abattementIR(6)).toBeCloseTo(0.06, 4);
      expect(abattementIR(10)).toBeCloseTo(0.30, 4);  // 5 * 6% = 30%
      expect(abattementIR(15)).toBeCloseTo(0.60, 4);  // 10 * 6% = 60%
      expect(abattementIR(21)).toBeCloseTo(0.96, 4);  // 16 * 6% = 96%
    });

    it('100% a partir de 22 ans (exoneration totale)', () => {
      expect(abattementIR(22)).toBe(1);
      expect(abattementIR(25)).toBe(1);
      expect(abattementIR(30)).toBe(1);
    });
  });

  describe('abattementPS', () => {
    it('0% pour detention <= 5 ans', () => {
      expect(abattementPS(0)).toBe(0);
      expect(abattementPS(5)).toBe(0);
    });

    it('1.65% par an de la 6e a la 21e annee', () => {
      expect(abattementPS(6)).toBeCloseTo(0.0165, 4);
      expect(abattementPS(10)).toBeCloseTo(0.0825, 4);  // 5 * 1.65% = 8.25%
      expect(abattementPS(21)).toBeCloseTo(0.264, 4);   // 16 * 1.65% = 26.4%
    });

    it('28% a la 22e annee', () => {
      expect(abattementPS(22)).toBeCloseTo(0.28, 4);
    });

    it('9% par an de la 23e a la 30e annee', () => {
      expect(abattementPS(23)).toBeCloseTo(0.37, 4);   // 28% + 9%
      expect(abattementPS(25)).toBeCloseTo(0.55, 4);   // 28% + 3*9%
      expect(abattementPS(30)).toBeCloseTo(1.00, 4);   // 28% + 8*9% = 100%
    });

    it('100% a partir de 30 ans (exoneration totale)', () => {
      expect(abattementPS(31)).toBe(1);
      expect(abattementPS(40)).toBe(1);
    });
  });

  describe('calculerPlusValueIR - Nom propre', () => {
    it('cas de test story : PV apres 10 ans de detention', () => {
      // Achat 200000, revente 230000, detention 10 ans
      const result = calculerPlusValueIR(230000, 200000, 10);

      expect(result.plus_value_brute).toBe(30000);

      // Abattement IR 10 ans : 5 * 6% = 30%
      expect(result.abattement_ir).toBeCloseTo(30, 1);
      // PV nette IR = 30000 * 0.70 = 21000
      expect(result.plus_value_nette_ir).toBe(21000);
      // IR = 21000 * 19% = 3990
      expect(result.impot_ir).toBe(3990);

      // Abattement PS 10 ans : 5 * 1.65% = 8.25%
      expect(result.abattement_ps).toBeCloseTo(8.3, 0); // arrondi a 0.1
      // PV nette PS = 30000 * (1 - 0.0825) = 27525
      expect(result.plus_value_nette_ps).toBe(27525);
      // PS = 27525 * 17.2% = 4734.30
      expect(result.impot_ps).toBeCloseTo(4734.30, 0);

      // Total = 3990 + 4734.30 = 8724.30
      expect(result.impot_total).toBeCloseTo(8724, 0);
    });

    it('pas de plus-value si prix de vente <= prix d\'achat', () => {
      const result = calculerPlusValueIR(180000, 200000, 10);
      expect(result.plus_value_brute).toBeLessThanOrEqual(0);
      expect(result.impot_total).toBe(0);
      expect(result.net_revente).toBe(180000);
    });

    it('exoneration totale IR apres 22 ans', () => {
      const result = calculerPlusValueIR(300000, 200000, 22);
      expect(result.abattement_ir).toBe(100);
      expect(result.impot_ir).toBe(0);
      // Mais PS pas encore exoneres
      expect(result.impot_ps).toBeGreaterThan(0);
    });

    it('exoneration totale IR et PS apres 30 ans', () => {
      const result = calculerPlusValueIR(300000, 200000, 31);
      expect(result.impot_ir).toBe(0);
      expect(result.impot_ps).toBe(0);
      expect(result.impot_total).toBe(0);
      expect(result.net_revente).toBe(300000);
    });

    it('reintegration amortissements LMNP (LF 2025)', () => {
      // Achat 200000, vente 230000, detention 10 ans, amortissements cumules 50000
      // PV brute = 230000 - 200000 + 50000 = 80000
      const result = calculerPlusValueIR(230000, 200000, 10, 50000);
      expect(result.plus_value_brute).toBe(80000);
      expect(result.amortissements_reintegres).toBe(50000);
      expect(result.impot_total).toBeGreaterThan(0);
    });

    it('surtaxe pour PV > 50000 EUR', () => {
      // PV nette IR doit depasser 50000 pour declencher la surtaxe
      // PV brute importante avec peu d'abattement (5 ans)
      const result = calculerPlusValueIR(400000, 200000, 3);
      // PV brute = 200000, abattement IR = 0% (<=5 ans)
      // PV nette IR = 200000 => surtaxe applicable
      expect(result.plus_value_brute).toBe(200000);
      expect(result.surtaxe).toBeGreaterThan(0);
    });

    it('pas de surtaxe pour PV nette IR <= 50000', () => {
      const result = calculerPlusValueIR(230000, 200000, 10);
      // PV nette IR = 21000 < 50000
      expect(result.surtaxe).toBe(0);
    });
  });

  describe('calculerPlusValueSciIs', () => {
    it('cas de test story : PV SCI IS apres 10 ans', () => {
      // Achat 200000, vente 230000, amortissements cumules 51510
      // VNC = 200000 - 51510 = 148490
      // PV = 230000 - 148490 = 81510
      const result = calculerPlusValueSciIs(230000, 200000, 51510, false);

      expect(result.plus_value_brute).toBe(81510);

      // IS : 42500 * 15% + (81510 - 42500) * 25% = 6375 + 9752.50 = 16127.50
      expect(result.impot_ir).toBeCloseTo(16127.50, 0);
      expect(result.impot_total).toBeCloseTo(16127.50, 0);
    });

    it('PV SCI IS avec distribution aux associes', () => {
      // Meme cas mais avec distribution
      const result = calculerPlusValueSciIs(230000, 200000, 51510, true);

      // IS : ~16127.50
      // Distribue = 81510 - 16127.50 = 65382.50
      // Flat tax = 65382.50 * 30% = 19614.75
      // Total = 16127.50 + 19614.75 = 35742.25
      expect(result.impot_total).toBeCloseTo(35742, 0);
    });

    it('pas d\'abattement pour duree de detention en SCI IS', () => {
      const result = calculerPlusValueSciIs(300000, 200000, 50000, false);
      expect(result.abattement_ir).toBe(0);
      expect(result.abattement_ps).toBe(0);
    });

    it('pas de PV si VNC > prix de vente', () => {
      // Peu d'amortissements : VNC > prix vente
      const result = calculerPlusValueSciIs(190000, 200000, 5000, false);
      // VNC = 200000 - 5000 = 195000, PV = 190000 - 195000 = -5000
      expect(result.plus_value_brute).toBeLessThanOrEqual(0);
      expect(result.impot_total).toBe(0);
    });

    it('IS au taux reduit seul si PV <= seuil', () => {
      // VNC = 200000 - 100000 = 100000, Vente = 130000
      // PV = 30000 < 42500
      const result = calculerPlusValueSciIs(130000, 200000, 100000, false);
      expect(result.plus_value_brute).toBe(30000);
      // IS = 30000 * 15% = 4500
      expect(result.impot_ir).toBe(4500);
    });

    it('pas de flat tax si pas de distribution', () => {
      const result = calculerPlusValueSciIs(230000, 200000, 51510, false);
      expect(result.impot_ps).toBe(0); // flat tax stockee dans impot_ps
    });
  });
});
