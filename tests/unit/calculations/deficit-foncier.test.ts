import { describe, it, expect } from 'vitest';
import { calculerDeficitFoncier, calculerFoncierReel } from '@/server/calculations/fiscalite';
import { mockConfig } from '@/server/calculations/__tests__/mock-config';

describe('AUDIT-103 : Deficit foncier', () => {
  describe('calculerDeficitFoncier', () => {
    it('retourne null quand il n\'y a pas de deficit (revenus >= charges)', () => {
      const result = calculerDeficitFoncier(15000, 8000, 5000, 30, mockConfig);
      expect(result).toBeNull();
    });

    it('retourne null quand revenus = charges exactement', () => {
      const result = calculerDeficitFoncier(13000, 8000, 5000, 30, mockConfig);
      expect(result).toBeNull();
    });

    it('calcule correctement un deficit avec travaux (cas 1 story)', () => {
      // Revenus 10800, Charges 18000, Interets 5000, TMI 30%
      // Deficit total = 18000 + 5000 - 10800 = 12200
      // Deficit hors interets = max(0, 18000 - 10800) = 7200
      // Deficit interets = 12200 - 7200 = 5000
      // Imputable = min(7200, 10700) = 7200
      // Economie = 7200 * 0.30 = 2160
      // Reportable = 12200 - 7200 = 5000
      const result = calculerDeficitFoncier(10800, 18000, 5000, 30, mockConfig);
      expect(result).not.toBeNull();
      expect(result!.deficit_total).toBe(12200);
      expect(result!.deficit_hors_interets).toBe(7200);
      expect(result!.deficit_interets).toBe(5000);
      expect(result!.imputable_revenu_global).toBe(7200);
      expect(result!.economie_impot).toBe(2160);
      expect(result!.reportable).toBe(5000);
      expect(result!.duree_report).toBe(10);
    });

    it('plafonne l\'imputation a 10700 EUR (cas 2 story)', () => {
      // Revenus 10800, Charges 25000, Interets 5000, TMI 30%
      // Deficit total = 25000 + 5000 - 10800 = 19200
      // Deficit hors interets = max(0, 25000 - 10800) = 14200
      // Imputable = min(14200, 10700) = 10700
      // Economie = 10700 * 0.30 = 3210
      // Reportable = 19200 - 10700 = 8500
      const result = calculerDeficitFoncier(10800, 25000, 5000, 30, mockConfig);
      expect(result).not.toBeNull();
      expect(result!.deficit_total).toBe(19200);
      expect(result!.deficit_hors_interets).toBe(14200);
      expect(result!.imputable_revenu_global).toBe(10700);
      expect(result!.economie_impot).toBe(3210);
      expect(result!.reportable).toBe(8500);
    });

    it('deficit uniquement lie aux interets => pas d\'imputation sur revenu global (cas 3 story)', () => {
      // Revenus 10800, Charges 8000, Interets 5000, TMI 30%
      // Deficit total = 8000 + 5000 - 10800 = 2200
      // Deficit hors interets = max(0, 8000 - 10800) = 0
      // Deficit interets = 2200 - 0 = 2200
      // Imputable = min(0, 10700) = 0
      // Economie = 0
      // Reportable = 2200 - 0 = 2200
      const result = calculerDeficitFoncier(10800, 8000, 5000, 30, mockConfig);
      expect(result).not.toBeNull();
      expect(result!.deficit_total).toBe(2200);
      expect(result!.deficit_hors_interets).toBe(0);
      expect(result!.deficit_interets).toBe(2200);
      expect(result!.imputable_revenu_global).toBe(0);
      expect(result!.economie_impot).toBe(0);
      expect(result!.reportable).toBe(2200);
    });

    it('respecte le TMI dans le calcul de l\'economie', () => {
      // Meme cas 1 mais TMI 41%
      const result = calculerDeficitFoncier(10800, 18000, 5000, 41, mockConfig);
      expect(result).not.toBeNull();
      expect(result!.economie_impot).toBeCloseTo(7200 * 0.41, 1);
    });

    it('gere un TMI a 0%', () => {
      const result = calculerDeficitFoncier(10800, 18000, 5000, 0, mockConfig);
      expect(result).not.toBeNull();
      expect(result!.economie_impot).toBe(0);
      expect(result!.imputable_revenu_global).toBe(7200);
    });

    it('gere des revenus a 0', () => {
      const result = calculerDeficitFoncier(0, 18000, 5000, 30, mockConfig);
      expect(result).not.toBeNull();
      expect(result!.deficit_total).toBe(23000);
      expect(result!.deficit_hors_interets).toBe(18000);
      expect(result!.deficit_interets).toBe(5000);
      expect(result!.imputable_revenu_global).toBe(10700);
    });

    describe('AUDIT-110 : Plafond majoré rénovation énergétique', () => {
      // Cas standard : 25000 charges, 10800 revenus => déficit hors intérêts 14200.
      // Plafond std : 10700.
      // Plafond majoré : 21400.

      it('plafond standard (10700) si pas de rénovation énergétique', () => {
        const result = calculerDeficitFoncier(10800, 25000, 5000, 30, mockConfig, false);
        expect(result!.imputable_revenu_global).toBe(10700);
      });

      it('plafond majoré (21400) si rénovation énergétique en 2024', () => {
        const result = calculerDeficitFoncier(10800, 25000, 5000, 30, mockConfig, true, 2024);
        // Déficit hors intérêts = 14200. Plafond = 21400.
        // Donc imputable = 14200 (tout le déficit hors intérêt passe)
        expect(result!.imputable_revenu_global).toBe(14200);
      });

      it('plafond majoré (21400) saturé si très gros travaux en 2025', () => {
        // Déficit hors intérêts = 40000 - 10000 = 30000.
        // Plafond = 21400.
        // Imputable = 21400.
        const result = calculerDeficitFoncier(10000, 40000, 0, 30, mockConfig, true, 2025);
        expect(result!.imputable_revenu_global).toBe(21400);
      });

      it('plafond standard si rénovation énergétique hors délai (2026)', () => {
        const result = calculerDeficitFoncier(10800, 25000, 5000, 30, mockConfig, true, 2026);
        expect(result!.imputable_revenu_global).toBe(10700);
      });

      it('plafond standard si rénovation énergétique hors délai (2022)', () => {
        const result = calculerDeficitFoncier(10800, 25000, 5000, 30, mockConfig, true, 2022);
        expect(result!.imputable_revenu_global).toBe(10700);
      });
    });
  });

  describe('calculerFoncierReel avec deficit foncier', () => {
    it('integre le deficit foncier dans le resultat fiscal', () => {
      // Cas avec deficit : revenus 10800, charges 18000, interets 5000
      const result = calculerFoncierReel(10800, 18000, 30, mockConfig, 5000);
      expect(result.deficit_foncier).toBeDefined();
      expect(result.deficit_foncier!.deficit_total).toBe(12200);
      expect(result.base_imposable).toBe(0); // Pas de base imposable en deficit
      expect(result.alertes.some(a => a.includes('Deficit foncier') || a.includes('Déficit foncier'))).toBe(true);
    });

    it('pas de deficit foncier quand charges < revenus', () => {
      const result = calculerFoncierReel(14400, 2200, 30, mockConfig, 3000);
      expect(result.deficit_foncier).toBeUndefined();
    });

    it('consomme le deficit reportable entrant', () => {
      // Revenus 14400, deficit reportable 5000
      // Revenu apres report = 14400 - 5000 = 9400
      const result = calculerFoncierReel(14400, 2200, 30, mockConfig, 3000, 5000);
      expect(result.alertes.some(a => a.includes('reporté consommé'))).toBe(true);
    });

    it('consomme le deficit reportable partiellement si revenus < report', () => {
      // Revenus 3000, deficit reportable 5000
      // Seuls 3000 sont consommes
      const result = calculerFoncierReel(3000, 500, 30, mockConfig, 200, 5000);
      expect(result.alertes.some(a => a.includes('reporté consommé'))).toBe(true);
    });
  });
});
