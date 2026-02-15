import { describe, it, expect } from 'vitest';
import { calculerAmortissementComposants, calculerLmnpReel, calculerFiscaliteSciIs } from './fiscalite';

describe('AUDIT-104 : Amortissement par composants', () => {
  describe('calculerAmortissementComposants', () => {
    // Bien 200 000 EUR, terrain 15%, valeur amortissable = 170 000 EUR
    const valeurAmortissable = 170000;

    it('calcule correctement l\'amortissement annee 1 (tous composants actifs)', () => {
      const result = calculerAmortissementComposants(valeurAmortissable, 1);

      // Gros oeuvre : 170000 * 0.40 / 50 = 1360
      // Facade : 170000 * 0.20 / 25 = 1360
      // Installations : 170000 * 0.20 / 15 = 2266.67
      // Agencements : 170000 * 0.20 / 10 = 3400
      // Total = 8386.67
      expect(result).toBeCloseTo(8386.67, 0);
    });

    it('calcule correctement pour une annee intermediaire (ex: annee 5)', () => {
      const result = calculerAmortissementComposants(valeurAmortissable, 5);
      // Tous les composants sont encore actifs a l'annee 5
      expect(result).toBeCloseTo(8386.67, 0);
    });

    it('arrete les agencements apres 10 ans', () => {
      const an10 = calculerAmortissementComposants(valeurAmortissable, 10);
      const an11 = calculerAmortissementComposants(valeurAmortissable, 11);

      // An 10 : tous les composants actifs
      expect(an10).toBeCloseTo(8386.67, 0);

      // An 11 : agencements (3400) s'arretent
      // Reste : 1360 + 1360 + 2266.67 = 4986.67
      expect(an11).toBeCloseTo(4986.67, 0);
    });

    it('arrete les installations apres 15 ans', () => {
      const an15 = calculerAmortissementComposants(valeurAmortissable, 15);
      const an16 = calculerAmortissementComposants(valeurAmortissable, 16);

      // An 15 : agencements deja finis, installations encore actives
      expect(an15).toBeCloseTo(4986.67, 0);

      // An 16 : installations (2266.67) s'arretent aussi
      // Reste : 1360 + 1360 = 2720
      expect(an16).toBeCloseTo(2720, 0);
    });

    it('arrete facade/toiture apres 25 ans', () => {
      const an25 = calculerAmortissementComposants(valeurAmortissable, 25);
      const an26 = calculerAmortissementComposants(valeurAmortissable, 26);

      // An 25 : facade encore active
      expect(an25).toBeCloseTo(2720, 0);

      // An 26 : facade (1360) s'arrete
      // Reste : gros oeuvre seul = 1360
      expect(an26).toBeCloseTo(1360, 0);
    });

    it('arrete le gros oeuvre apres 50 ans', () => {
      const an50 = calculerAmortissementComposants(valeurAmortissable, 50);
      const an51 = calculerAmortissementComposants(valeurAmortissable, 51);

      // An 50 : dernier annee de gros oeuvre
      expect(an50).toBeCloseTo(1360, 0);

      // An 51 : plus rien
      expect(an51).toBe(0);
    });

    it('retourne 0 pour une valeur amortissable nulle', () => {
      expect(calculerAmortissementComposants(0, 1)).toBe(0);
    });

    it('verification avec valeurs de la story (bien 200k, terrain 15%)', () => {
      // Story : amort total an 1 = 8387 EUR
      const result = calculerAmortissementComposants(170000, 1);
      expect(Math.round(result)).toBeCloseTo(8387, -1);
    });

    it('verification cas story 2 (bien 200k, terrain 10%)', () => {
      // Valeur amortissable = 200000 * 0.9 = 180000
      const result = calculerAmortissementComposants(180000, 1);
      // 180000 * (0.40/50 + 0.20/25 + 0.20/15 + 0.20/10)
      // = 180000 * (0.008 + 0.008 + 0.01333 + 0.02) = 180000 * 0.04933 = 8880
      expect(result).toBeCloseTo(8880, 0);
    });
  });

  describe('Mode simplifie vs composants en LMNP Reel', () => {
    it('mode simplifie : amortissement lineaire sur 33 ans', () => {
      // Bien 200000, terrain 15%, valeur bati = 170000
      // Simplifie : 170000 / 33 = 5151.52
      const result = calculerLmnpReel(14400, 2200, 200000, 30, 0, 0, 0, 0.15, 'simplifie', 1);
      expect(result.alertes.some(a => a.includes('5151') || a.includes('5 151'))).toBe(true);
    });

    it('mode composants : amortissement plus eleve', () => {
      const result = calculerLmnpReel(14400, 2200, 200000, 30, 0, 0, 0, 0.15, 'composants', 1);
      expect(result.alertes.some(a => a.includes('composants'))).toBe(true);
      // L'amortissement composants (8387) > simplifie (5152)
      expect(result.alertes.some(a => a.includes('8387') || a.includes('8 387') || a.includes('8386'))).toBe(true);
    });

    it('l\'amortissement ne cree pas de deficit BIC', () => {
      // Revenus faibles : amortissement > resultat avant amortissement
      const result = calculerLmnpReel(5000, 2000, 200000, 30, 0, 0, 0, 0.15, 'composants', 1);
      expect(result.base_imposable).toBe(0);
      expect(result.alertes.some(a => a.includes('excédentaire reportable'))).toBe(true);
    });
  });

  describe('Mode composants en SCI IS', () => {
    it('utilise l\'amortissement par composants en SCI IS', () => {
      // Revenu net 12200, prix 200000, interets 5000, terrain 15%
      const resultSimp = calculerFiscaliteSciIs(12200, 200000, 5000, false, 0.15, 'simplifie', 1);
      const resultComp = calculerFiscaliteSciIs(12200, 200000, 5000, false, 0.15, 'composants', 1);

      // L'amortissement composants (8387) > simplifie (5152)
      // Donc base imposable composants < base imposable simplifie
      expect(resultComp.base_imposable).toBeLessThan(resultSimp.base_imposable);
      // Et impot composants < impot simplifie
      expect(resultComp.impot_total).toBeLessThanOrEqual(resultSimp.impot_total);
    });
  });
});
