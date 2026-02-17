import { describe, it, expect } from 'vitest';
import { calculerHcsfNomPropre, calculerHcsfSciIs } from './hcsf';
import type { CalculationInput } from './types';
import { mockConfig } from './__tests__/mock-config';

describe('AUDIT-107 : Reste à vivre HCSF', () => {
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
      revenus_activite: 3500, credits_immobiliers: 500,
      autres_charges: 200,
    },
    options: {
      generer_pdf: false, envoyer_email: false,
      horizon_projection: 20,
    },
  };

  describe('Mode nom propre', () => {
    it('calcule un reste à vivre confortable (>= 1500€)', () => {
      const result = calculerHcsfNomPropre(baseInput, 800, 900, mockConfig);
      // Revenus pondérés = 3500 + 900*0.70 = 4130
      // Charges = 500 + 200 + 800 = 1500
      // RAV = 4130 - 1500 = 2630
      expect(result.reste_a_vivre).toBeDefined();
      expect(result.reste_a_vivre!).toBeGreaterThanOrEqual(1500);
      expect(result.alertes.some(a => a.includes('Reste à vivre'))).toBe(false);
    });

    it('génère une alerte pour reste à vivre insuffisant (< 700€)', () => {
      const inputFaible: CalculationInput = {
        ...baseInput,
        structure: {
          ...baseInput.structure,
          revenus_activite: 1800,
          credits_immobiliers: 300,
          autres_charges: 200,
        },
      };
      const result = calculerHcsfNomPropre(inputFaible, 1100, 600, mockConfig);
      // Revenus pondérés = 1800 + 600*0.70 = 2220
      // Charges = 300 + 200 + 1100 = 1600
      // RAV = 2220 - 1600 = 620
      expect(result.reste_a_vivre).toBeDefined();
      expect(result.reste_a_vivre!).toBeLessThan(700);
      expect(result.alertes.some(a => a.includes('Reste à vivre'))).toBe(true);
    });

    it('calcule un reste à vivre intermédiaire sans alerte', () => {
      const inputMoyen: CalculationInput = {
        ...baseInput,
        structure: {
          ...baseInput.structure,
          revenus_activite: 2500,
          credits_immobiliers: 400,
          autres_charges: 100,
        },
      };
      const result = calculerHcsfNomPropre(inputMoyen, 900, 800, mockConfig);
      // Revenus pondérés = 2500 + 800*0.70 = 3060
      // Charges = 400 + 100 + 900 = 1400
      // RAV = 3060 - 1400 = 1660
      expect(result.reste_a_vivre).toBeDefined();
      expect(result.reste_a_vivre!).toBeGreaterThanOrEqual(700);
      expect(result.alertes.some(a => a.includes('Reste à vivre'))).toBe(false);
    });
  });

  describe('Mode SCI IS', () => {
    it('calcule le reste à vivre global pour les associés', () => {
      const inputSci: CalculationInput = {
        ...baseInput,
        structure: {
          type: 'sci_is', tmi: 30,
          associes: [
            { nom: 'Associé 1', parts: 60, revenus: 3000, mensualites: 300, charges: 100 },
            { nom: 'Associé 2', parts: 40, revenus: 2000, mensualites: 200, charges: 50 },
          ],
        },
      };
      const result = calculerHcsfSciIs(inputSci, 800, 900, mockConfig);
      expect(result.reste_a_vivre).toBeDefined();
      expect(typeof result.reste_a_vivre).toBe('number');
    });
  });
});
