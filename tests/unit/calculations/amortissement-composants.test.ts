import { describe, it, expect } from 'vitest';
import { calculerAmortissementComposants, calculerLmnpReel, calculerFiscaliteSciIs } from '@/server/calculations/fiscalite';
import { genererTableauAmortissementFiscal } from '@/server/calculations/projection';
import { mockConfig } from '@/server/calculations/__tests__/mock-config';
import type { CalculationInput } from '@/server/calculations/types';

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
      const result = calculerLmnpReel(14400, 2200, 200000, 30, mockConfig, 0, 0, 0, 0.15, 'simplifie', 1);
      expect(result.alertes.some(a => a.includes('5151') || a.includes('5 151'))).toBe(true);
    });

    it('mode composants : amortissement plus eleve', () => {
      const result = calculerLmnpReel(14400, 2200, 200000, 30, mockConfig, 0, 0, 0, 0.15, 'composants', 1);
      expect(result.alertes.some(a => a.includes('composants'))).toBe(true);
      // L'amortissement composants (8387) > simplifie (5152)
      expect(result.alertes.some(a => a.includes('8387') || a.includes('8 387') || a.includes('8386'))).toBe(true);
    });

    it('l\'amortissement ne cree pas de deficit BIC', () => {
      // Revenus faibles : amortissement > resultat avant amortissement
      const result = calculerLmnpReel(5000, 2000, 200000, 30, mockConfig, 0, 0, 0, 0.15, 'composants', 1);
      expect(result.base_imposable).toBe(0);
      expect(result.alertes.some(a => a.includes('excédentaire reportable'))).toBe(true);
    });
  });

  describe('Mode composants en SCI IS', () => {
    it('utilise l\'amortissement par composants en SCI IS', () => {
      // Revenu net 12200, prix 200000, interets 5000, terrain 15%
      const resultSimp = calculerFiscaliteSciIs(12200, 200000, mockConfig, 5000, false, 0.15, 'simplifie', 1);
      const resultComp = calculerFiscaliteSciIs(12200, 200000, mockConfig, 5000, false, 0.15, 'composants', 1);

      // L'amortissement composants (8387) > simplifie (5152)
      // Donc base imposable composants < base imposable simplifie
      expect(resultComp.base_imposable).toBeLessThan(resultSimp.base_imposable);
      // Et impot composants < impot simplifie
      expect(resultComp.impot_total).toBeLessThanOrEqual(resultSimp.impot_total);
    });
  });
});

// ============================================================================
// genererTableauAmortissementFiscal — tests de couverture
// ============================================================================
describe('genererTableauAmortissementFiscal', () => {
    const baseBien = {
        prix_achat: 200000,
        montant_travaux: 0,
        valeur_mobilier: 0,
        part_terrain: 0.15,
        adresse: 'Test',
        surface: 50,
        type_bien: 'appartement' as const,
        etat_bien: 'ancien' as const,
    };
    const baseFinancement = {
        apport: 20000,
        taux_interet: 4,
        duree_emprunt: 20,
        assurance_pret: 0.1,
        frais_dossier: 0,
        frais_garantie: 0,
    };
    const baseExploitation = {
        loyer_mensuel: 1000,
        taux_occupation: 1,
        charges_copro: 0,
        taxe_fonciere: 0,
        assurance_pno: 0,
        gestion_locative: 0,
        provision_travaux: 0,
        provision_vacance: 0,
        assurance_gli: 0,
        cfe_estimee: 0,
        comptable_annuel: 0,
        type_location: 'meublee_longue_duree' as const,
        charges_copro_recuperables: 0,
    };

    it('retourne null pour un régime sans amortissement (micro_foncier)', () => {
        const input = {
            bien: baseBien,
            financement: baseFinancement,
            exploitation: baseExploitation,
            structure: { type: 'nom_propre' as const, tmi: 30, regime_fiscal: 'micro_foncier' as const, associes: [] },
            options: {},
        } as unknown as CalculationInput;
        expect(genererTableauAmortissementFiscal(input, mockConfig, 5)).toBeNull();
    });

    it('retourne un tableau LMNP réel avec economieImpotEstimee basée sur TMI + PS', () => {
        // valeurBati = 200000 * 0.85 = 170000, amort annuel = 170000/33 ≈ 5151.52
        // loyer 12000, cap à 5151.52/an → totalDeductible = 5 * 5151.52 ≈ 25758
        // tauxImposition = 0.30 + 0.172 = 0.472
        // economieImpot ≈ 25758 * 0.472 ≈ 12158
        const input = {
            bien: baseBien,
            financement: baseFinancement,
            exploitation: baseExploitation,
            structure: { type: 'nom_propre' as const, tmi: 30, regime_fiscal: 'lmnp_reel' as const, associes: [] },
            options: {},
        } as unknown as CalculationInput;
        const result = genererTableauAmortissementFiscal(input, mockConfig, 5);
        expect(result).not.toBeNull();
        expect(result!.regime).toBe('LMNP Réel');
        // totalDeductible proche de 5 * 5152 = 25758
        expect(result!.totaux.totalDeductible).toBeCloseTo(25758, -2);
        // economieImpot = totalDeductible * (TMI + tauxPsRevenusBicLmnp) = * (0.30 + 0.186)
        expect(result!.totaux.economieImpotEstimee).toBeCloseTo(result!.totaux.totalDeductible * (0.30 + mockConfig.tauxPsRevenusBicLmnp), -2);
        // amortissementAReintegrer = totalDeductible - mobilier (0)
        expect(result!.totaux.amortissementAReintegrer).toBe(result!.totaux.totalDeductible);
    });

    it('retourne un tableau SCI IS avec economieImpotEstimee basée sur isTauxReduit (pas TMI)', () => {
        // tauxImposition SCI IS = config.isTauxReduit = 0.15
        const input = {
            bien: baseBien,
            financement: baseFinancement,
            exploitation: baseExploitation,
            structure: { type: 'sci_is' as const, tmi: 41, associes: [], distribution_dividendes: false },
            options: {},
        } as unknown as CalculationInput;
        const result = genererTableauAmortissementFiscal(input, mockConfig, 5);
        expect(result).not.toBeNull();
        expect(result!.regime).toBe('SCI IS');
        const economieAttendue = result!.totaux.totalDeductible * mockConfig.isTauxReduit;
        expect(result!.totaux.economieImpotEstimee).toBeCloseTo(economieAttendue, -1);
        // SCI IS: réintégration totale via VNC
        expect(result!.totaux.amortissementAReintegrer).toBe(result!.totaux.totalDeductible);
    });

    it('LMNP réel : l\'amortissement excédentaire est reporté (cap à 0 base imposable)', () => {
        // Loyer très faible : amortissement > base → report obligatoire
        const exploitation = { ...baseExploitation, loyer_mensuel: 200 }; // 2400/an < 5151
        const input = {
            bien: baseBien,
            financement: baseFinancement,
            exploitation,
            structure: { type: 'nom_propre' as const, tmi: 30, regime_fiscal: 'lmnp_reel' as const, associes: [] },
            options: {},
        } as unknown as CalculationInput;
        const result = genererTableauAmortissementFiscal(input, mockConfig, 3);
        expect(result).not.toBeNull();
        // Chaque année : base 2400 → déduit 2400, report = 5151 - 2400 = 2751
        // An 1: report = 2751
        expect(result!.lignes[0].amortissementReporteCumule).toBeGreaterThan(0);
        // amortissementDeductible < amortissementTotal (cap par les revenus)
        expect(result!.lignes[0].amortissementDeductible).toBeLessThan(result!.lignes[0].amortissementTotal);
    });
});
