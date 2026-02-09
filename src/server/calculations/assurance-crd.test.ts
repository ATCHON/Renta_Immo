import { describe, it, expect } from 'vitest';
import { genererTableauAmortissement } from './projection';

describe('AUDIT-109 : Assurance sur capital restant dû', () => {
  const montant = 200000;
  const taux = 0.035; // 3.5%
  const duree = 20;
  const tauxAssurance = 0.003; // 0.3%

  describe('Mode capital initial (non-régression)', () => {
    it('assurance mensuelle constante sur toute la durée', () => {
      const result = genererTableauAmortissement(montant, taux, duree, tauxAssurance, 'capital_initial');
      const mensuel = result.mensuel!;
      const premierMois = mensuel[0];
      const dernierMois = mensuel[mensuel.length - 1];
      expect(premierMois.assurance).toBe(dernierMois.assurance);
      expect(premierMois.assurance).toBeCloseTo(50, 0); // 200000 * 0.003 / 12 = 50
    });

    it('coût total assurance = 12000€ sur 20 ans', () => {
      const result = genererTableauAmortissement(montant, taux, duree, tauxAssurance, 'capital_initial');
      expect(result.totaux.totalAssurance).toBeCloseTo(12000, 0);
    });
  });

  describe('Mode capital restant dû', () => {
    it('assurance mois 1 proche du mode capital initial', () => {
      const result = genererTableauAmortissement(montant, taux, duree, tauxAssurance, 'capital_restant_du');
      const premierMois = result.mensuel![0];
      // Premier mois : capital restant = montant total, donc assurance ≈ 50€
      expect(premierMois.assurance).toBeCloseTo(50, 0);
    });

    it('assurance décroissante au fil du temps', () => {
      const result = genererTableauAmortissement(montant, taux, duree, tauxAssurance, 'capital_restant_du');
      const mensuel = result.mensuel!;
      const mois1 = mensuel[0].assurance;
      const mois120 = mensuel[119].assurance; // An 10
      const dernierMois = mensuel[mensuel.length - 1].assurance;
      expect(mois120).toBeLessThan(mois1);
      expect(dernierMois).toBeLessThan(mois120);
      expect(dernierMois).toBeLessThan(5); // Presque rien en fin de prêt
    });

    it('coût total inférieur au mode capital initial', () => {
      const ci = genererTableauAmortissement(montant, taux, duree, tauxAssurance, 'capital_initial');
      const crd = genererTableauAmortissement(montant, taux, duree, tauxAssurance, 'capital_restant_du');
      expect(crd.totaux.totalAssurance).toBeLessThan(ci.totaux.totalAssurance);
      // Économie attendue ~30-50%
      const economie = 1 - crd.totaux.totalAssurance / ci.totaux.totalAssurance;
      expect(economie).toBeGreaterThan(0.3);
      expect(economie).toBeLessThan(0.5);
    });

    it('mode par défaut = capital_initial', () => {
      const sansMode = genererTableauAmortissement(montant, taux, duree, tauxAssurance);
      const avecCI = genererTableauAmortissement(montant, taux, duree, tauxAssurance, 'capital_initial');
      expect(sansMode.totaux.totalAssurance).toBe(avecCI.totaux.totalAssurance);
    });
  });
});
