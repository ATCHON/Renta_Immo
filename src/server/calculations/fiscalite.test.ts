import { describe, it, expect } from 'vitest';
import { calculerToutesFiscalites } from './fiscalite';
import { BienData, FinancementData, ExploitationData, StructureData, RentabiliteCalculations } from './types';

describe('calculerToutesFiscalites', () => {
    const mockBien: BienData = {
        prix_achat: 200000,
        frais_notaire: 15000,
        montant_travaux: 10000,
        valeur_mobilier: 5000,
        adresse: 'Test',
        frais_agence: 0,
        surface: 50,
    };

    const mockFinancement: FinancementData = {
        apport_personnel: 20000,
        duree_emprunt: 20,
        taux_interet: 4,
        assurance_pret: 0.1,
        frais_dossier: 0,
        frais_garantie: 0,
        mensualite_credit: 1000,
        mensualite_assurance: 20,
        mensualite_totale: 1020,
        montant_emprunt: 200000,
        taux_endettement_avant: 0,
    };

    const mockExploitation: ExploitationData = {
        loyer_mensuel: 1200,
        charges_copro_mensuelles: 100,
        taxe_fonciere_annuelle: 1000,
        frais_gestion_pourcentage: 0,
        vacance_locative_pourcentage: 0,
        type_location: 'meublee_longue_duree',
        loyer_annuel: 14400,
    };

    const mockStructure: StructureData = {
        type: 'nom_propre',
        tmi: 30,
        regime_fiscal: 'lmnp_reel',
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

    it('devrait retourner 5 régimes fiscaux', () => {
        const result = calculerToutesFiscalites(
            { bien: mockBien, financement: mockFinancement, exploitation: mockExploitation, structure: mockStructure },
            mockRentabilite as RentabiliteCalculations
        );

        expect(result.items).toHaveLength(5);
        expect(result.items.map(i => i.regime)).toContain('Location Nue (Micro-foncier)');
        expect(result.items.map(i => i.regime)).toContain('Location Nue (Réel)');
        expect(result.items.map(i => i.regime)).toContain('LMNP (Micro-BIC)');
        expect(result.items.map(i => i.regime)).toContain('LMNP (Réel)');
        expect(result.items.map(i => i.regime)).toContain('SCI à l\'IS');
    });

    it('devrait identifier un régime optimal', () => {
        const result = calculerToutesFiscalites(
            { bien: mockBien, financement: mockFinancement, exploitation: mockExploitation, structure: mockStructure },
            mockRentabilite as RentabiliteCalculations
        );

        const optimalItems = result.items.filter(i => i.isOptimal);
        expect(optimalItems).toHaveLength(1);
    });
});
