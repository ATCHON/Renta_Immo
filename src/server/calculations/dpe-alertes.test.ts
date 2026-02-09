import { describe, it, expect } from 'vitest';
import { genererAlertesDpe } from './synthese';
import { genererProjections } from './projection';
import type { CalculationInput, DPE } from './types';

describe('AUDIT-110 : DPE et alertes passoires énergétiques', () => {
  describe('genererAlertesDpe', () => {
    it('DPE G : alerte critique (interdit depuis 2025)', () => {
      const alertes = genererAlertesDpe('G', 20);
      expect(alertes.length).toBeGreaterThanOrEqual(2); // interdiction + gel loyers
      expect(alertes.some(a => a.type === 'error')).toBe(true);
      expect(alertes.some(a => a.message.includes('Interdit'))).toBe(true);
      expect(alertes.some(a => a.message.includes('Gel des loyers'))).toBe(true);
    });

    it('DPE F avec horizon 5 ans : alerte interdiction imminente', () => {
      const alertes = genererAlertesDpe('F', 5);
      expect(alertes.some(a => a.type === 'warning' && a.message.includes('2028'))).toBe(true);
      expect(alertes.some(a => a.message.includes('Gel des loyers'))).toBe(true);
      // Horizon check: 2028 - 2026 = 2 ans < 5 ans => alerte
      expect(alertes.some(a => a.message.includes('horizon'))).toBe(true);
    });

    it('DPE E avec horizon 10 ans : alerte interdiction future', () => {
      const alertes = genererAlertesDpe('E', 10);
      expect(alertes.some(a => a.message.includes('2034'))).toBe(true);
      // Pas de gel des loyers pour E
      expect(alertes.some(a => a.message.includes('Gel des loyers'))).toBe(false);
      // 2034 - 2026 = 8 ans < 10 ans => alerte horizon
      expect(alertes.some(a => a.message.includes('horizon'))).toBe(true);
    });

    it('DPE C : aucune alerte', () => {
      const alertes = genererAlertesDpe('C', 20);
      expect(alertes).toHaveLength(0);
    });

    it('DPE non renseigné : aucune alerte', () => {
      const alertes = genererAlertesDpe(undefined, 20);
      expect(alertes).toHaveLength(0);
    });
  });

  describe('Gel des loyers dans les projections', () => {
    const baseInput: CalculationInput = {
      bien: {
        adresse: 'Test', prix_achat: 200000, type_bien: 'appartement',
        etat_bien: 'ancien', montant_travaux: 0, valeur_mobilier: 0,
      },
      financement: {
        apport: 20000, taux_interet: 3.5, duree_emprunt: 20,
        assurance_pret: 0.3, frais_dossier: 0, frais_garantie: 0,
      },
      exploitation: {
        loyer_mensuel: 900, charges_copro: 100, taxe_fonciere: 1000,
        assurance_pno: 150, gestion_locative: 7, provision_travaux: 5,
        provision_vacance: 5, type_location: 'nue',
        charges_copro_recuperables: 0, assurance_gli: 0,
        cfe_estimee: 0, comptable_annuel: 0,
      },
      structure: {
        type: 'nom_propre', tmi: 30, associes: [],
        regime_fiscal: 'reel',
      },
      options: {
        generer_pdf: false, envoyer_email: false,
        horizon_projection: 10, taux_evolution_loyer: 2,
      },
    };

    it('DPE F : loyer reste constant sur 10 ans (gel)', () => {
      const inputF: CalculationInput = {
        ...baseInput,
        bien: { ...baseInput.bien, dpe: 'F' as DPE },
      };
      const result = genererProjections(inputF, 10);
      const loyerAn1 = result.projections[0].loyer;
      const loyerAn10 = result.projections[9].loyer;
      expect(loyerAn10).toBe(loyerAn1);
    });

    it('DPE C : loyer augmente normalement', () => {
      const inputC: CalculationInput = {
        ...baseInput,
        bien: { ...baseInput.bien, dpe: 'C' as DPE },
      };
      const result = genererProjections(inputC, 10);
      const loyerAn1 = result.projections[0].loyer;
      const loyerAn10 = result.projections[9].loyer;
      expect(loyerAn10).toBeGreaterThan(loyerAn1);
    });

    it('DPE G : loyer gelé, impact significatif sur le cashflow cumulé', () => {
      const inputG: CalculationInput = {
        ...baseInput,
        bien: { ...baseInput.bien, dpe: 'G' as DPE },
      };
      const inputC: CalculationInput = {
        ...baseInput,
        bien: { ...baseInput.bien, dpe: 'C' as DPE },
      };
      const resultG = genererProjections(inputG, 10);
      const resultC = genererProjections(inputC, 10);
      expect(resultG.totaux.cashflowCumule).toBeLessThan(resultC.totaux.cashflowCumule);
    });
  });
});
