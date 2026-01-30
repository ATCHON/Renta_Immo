import { describe, it, expect } from 'vitest';
import { calculerToutesFiscalites } from './fiscalite';
import { BienData, FinancementData, ExploitationData, StructureData, RentabiliteCalculations } from './types';

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

    const mockRentabilite: any = {
        loyer_annuel: 14400,
        charges: {
            total_charges_annuelles: 2200, // 100*12 + 1000
        },
        financement: mockFinancement,
        cashflow_annuel: 2000,
        revenu_net_avant_impots: 12200,
    };

    it('devrait retourner 6 régimes fiscaux', () => {
        const result = calculerToutesFiscalites(
            { bien: mockBien, financement: mockFinancement, exploitation: mockExploitation, structure: mockStructure },
            mockRentabilite as RentabiliteCalculations
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
            mockRentabilite as RentabiliteCalculations
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
            mockRentabilite as RentabiliteCalculations
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
