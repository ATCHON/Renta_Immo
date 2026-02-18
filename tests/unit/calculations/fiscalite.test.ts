import { describe, it, expect } from 'vitest';
import { calculerToutesFiscalites, calculerLmnpMicro, calculerLmnpReel } from '@/server/calculations/fiscalite';
import { BienData, FinancementData, ExploitationData, StructureData, RentabiliteCalculations, FinancementCalculations } from '@/server/calculations/types';
import { mockConfig } from '@/server/calculations/__tests__/mock-config';

describe('calculerToutesFiscalites', () => {
    const mockBien: BienData = {
        prix_achat: 200000,
        montant_travaux: 10000,
        valeur_mobilier: 5000,
        adresse: 'Test',
        surface: 50,
        type_bien: 'appartement',
        etat_bien: 'ancien',
    };

    const mockFinancement: FinancementData = {
        apport: 20000,
        taux_interet: 4,
        duree_emprunt: 20,
        assurance_pret: 0.1,
        frais_dossier: 0,
        frais_garantie: 0,
    };

    const mockExploitation: ExploitationData = {
        loyer_mensuel: 1200,
        charges_copro: 100,
        taxe_fonciere: 1000,
        assurance_pno: 120,
        gestion_locative: 0,
        provision_travaux: 0,
        provision_vacance: 0,
        assurance_gli: 0,
        cfe_estimee: 0,
        comptable_annuel: 0,
        type_location: 'meublee_longue_duree',
        charges_copro_recuperables: 0,
    };

    const mockStructure: StructureData = {
        type: 'nom_propre',
        tmi: 30,
        regime_fiscal: 'lmnp_reel',
        associes: [],
    };

    const mockFinancementCalculations: FinancementCalculations = {
        montant_emprunt: 180000,
        mensualite_credit: 1000,
        mensualite_assurance: 50,
        mensualite_totale: 1050,
        remboursement_annuel: 12600,
        cout_total_credit: 50000,
        cout_total_interets: 40000,
        cout_total_acquisition: 215000,
        taux_interet: 4,
        frais_notaire: 15000
    };

    const mockRentabilite: RentabiliteCalculations = {
        loyer_annuel: 14400,
        charges: {
            charges_fixes_annuelles: 2200,
            charges_proportionnelles_annuelles: 0,
            total_charges_annuelles: 2200,
        },
        financement: mockFinancementCalculations,
        rentabilite_brute: 7,
        rentabilite_nette: 5,
        revenu_net_avant_impots: 12200,
        cashflow_annuel: 2000,
        cashflow_mensuel: 166,
        effort_epargne_mensuel: 0,
        effet_levier: 1.5,
    };

    it('devrait retourner 6 régimes fiscaux', () => {
        const result = calculerToutesFiscalites(
            { bien: mockBien, financement: mockFinancement, exploitation: mockExploitation, structure: mockStructure },
            mockRentabilite,
            mockConfig
        );

        expect(result.items).toHaveLength(6);
        expect(result.items.map(i => i.regime)).toContain('Location Nue (Micro-foncier)');
        expect(result.items.map(i => i.regime)).toContain('Location Nue (Réel)');
        expect(result.items.map(i => i.regime)).toContain('LMNP (Micro-BIC)');
        expect(result.items.map(i => i.regime)).toContain('LMNP (Réel)');
        expect(result.items.map(i => i.regime)).toContain('SCI à l\'IS (Capitalisation)');
        expect(result.items.map(i => i.regime)).toContain('SCI à l\'IS (Distribution)');
    });

    it('devrait identifier un régime optimal', () => {
        const result = calculerToutesFiscalites(
            { bien: mockBien, financement: mockFinancement, exploitation: mockExploitation, structure: mockStructure },
            mockRentabilite as RentabiliteCalculations,
            mockConfig
        );

        const optimalItems = result.items.filter(i => i.isOptimal);
        expect(optimalItems).toHaveLength(1);
    });

    it('devrait respecter un TMI égal à 0', () => {
        const result = calculerToutesFiscalites(
            {
                bien: mockBien,
                financement: mockFinancement,
                exploitation: mockExploitation,
                structure: { ...mockStructure, tmi: 0 }
            },
            mockRentabilite as RentabiliteCalculations,
            mockConfig
        );

        // Si TMI = 0, l'impôt sur le revenu pour micro-foncier devrait être 0
        const microFoncier = result.items.find(i => i.regime === 'Location Nue (Micro-foncier)');
        // On ne peut pas facilement accéder aux détails internes depuis l'item de comparaison,
        // mais on peut vérifier que l'impôt total correspond uniquement aux prélèvements sociaux.
        // Base imposable = 14400 * 0.7 = 10080
        // PS = 10080 * 0.172 = 1733.76
        expect(microFoncier?.impotAnnuelMoyen).toBeCloseTo(1733.76, 1);
    });
});

describe('calculerLmnpMicro', () => {
    // 50% abattement, plafond 77 700 €
    it('devrait appliquer 50% abattement pour meublee_longue_duree', () => {
        const result = calculerLmnpMicro(10000, 30, mockConfig, 'meublee_longue_duree');
        expect(result.abattement).toBe(5000);
        expect(result.base_imposable).toBe(5000);
    });

    // 71% abattement, plafond 188 700 €
    it('devrait appliquer 71% abattement pour meublee_tourisme_classe', () => {
        const result = calculerLmnpMicro(10000, 30, mockConfig, 'meublee_tourisme_classe');
        expect(result.abattement).toBe(7100);
        expect(result.base_imposable).toBe(2900);
    });

    // 30% abattement, plafond 15 000 € (post-Loi Le Meur nov. 2024)
    it('devrait appliquer 30% abattement pour meublee_tourisme_non_classe', () => {
        const result = calculerLmnpMicro(10000, 30, mockConfig, 'meublee_tourisme_non_classe');
        expect(result.abattement).toBe(3000);
        expect(result.base_imposable).toBe(7000);
    });

    // Test plafond dépassement tourisme classé
    it('devrait alerter si dépassement plafond tourisme classé (>188 700)', () => {
        const result = calculerLmnpMicro(190000, 30, mockConfig, 'meublee_tourisme_classe');
        expect(result.alertes.length).toBeGreaterThan(0);
        expect(result.alertes[0]).toContain('plafond micro-BIC');
    });

    // Tests bord plafond tourisme non classé 15 000 € (post-Loi Le Meur)
    it('ne devrait pas alerter si revenus juste en dessous du plafond tourisme non classé (14 900 €)', () => {
        const result = calculerLmnpMicro(14900, 30, mockConfig, 'meublee_tourisme_non_classe');
        expect(result.alertes.length).toBe(0);
    });

    it('devrait alerter si revenus juste au dessus du plafond tourisme non classé (15 100 €)', () => {
        const result = calculerLmnpMicro(15100, 30, mockConfig, 'meublee_tourisme_non_classe');
        expect(result.alertes.length).toBeGreaterThan(0);
        expect(result.alertes[0]).toContain('plafond micro-BIC');
    });

});

describe('calculerLmnpReel - CFE', () => {
    // Cas standard : CFE déduite
    it('devrait déduire la CFE (année > 1)', () => {
        // Revenus 10000, Charges 1000 (dont 200 CFE), CFE 200
        const result = calculerLmnpReel(10000, 1000, 100000, 30, mockConfig, 0, 0, 0, undefined, 'simplifie', 2, 200);

        // Charges retenues = 1000. Résultat avant amort = 9000.
        // On vérifie indirectement via la base imposable ou les alertes
        // Base imposable = 9000 - amortissement
        // Amortissement (33 ans, 15% terrain) = 85000 / 33 = 2575.75
        // Base = 9000 - 2575.75 = 6424.25
        expect(result.base_imposable).toBeCloseTo(6424, -1);
    });

    // Cas exonération 1ère année
    it('devrait exonérer la CFE la 1ère année', () => {
        // Revenus 10000, Charges 1000 (dont 200 CFE), CFE 200. Année 1.
        const result = calculerLmnpReel(10000, 1000, 100000, 30, mockConfig, 0, 0, 0, undefined, 'simplifie', 1, 200);

        // Charges retenues = 1000 - 200 = 800. Résultat = 9200.
        // Base = 9200 - 2833 = 6367
        expect(result.base_imposable).toBeGreaterThan(6200); // 6367 > 6167
        expect(result.alertes.some(a => a.includes('Exonération CFE'))).toBe(true);
    });

    // Cas Frais Compta (V2-S11)
    it('devrait déduire les frais de comptabilité (inclus dans charges)', () => {
        // chargesDeductibles = 1500 (dont 500 compta)
        const result = calculerLmnpReel(10000, 1500, 100000, 30, mockConfig, 0, 0, 0, undefined, 'simplifie', 2, 0);
        // Base = 10000 - 1500 = 8500 - amort (2575.75) = 5924.25
        expect(result.base_imposable).toBeCloseTo(5924, -1);
    });
});

