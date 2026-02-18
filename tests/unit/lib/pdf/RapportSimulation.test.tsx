
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { RapportSimulation } from '@/lib/pdf/templates/RapportSimulation';
import type { CalculateurFormData, CalculResultats } from '@/types/calculateur';

// Mock form data (minimal required fields)
const mockFormData: CalculateurFormData = {
    bien: {
        type_bien: 'appartement',
        prix_achat: 200000,
        montant_travaux: 15000,
        valeur_mobilier: 5000,
        surface: 45,
        adresse: '15 rue de la République, 69001 Lyon',
        etat_bien: 'ancien',
    },
    financement: {
        apport: 30000,
        taux_interet: 3.5,
        duree_emprunt: 20,
        assurance_pret: 0.34,
        frais_dossier: 500,
        frais_garantie: 1000,
    },
    exploitation: {
        loyer_mensuel: 850,
        charges_copro: 100,
        taxe_fonciere: 1200,
        assurance_pno: 180,
        gestion_locative: 8,
        provision_vacance: 5,
        provision_travaux: 3,
        type_location: 'meublee_longue_duree',
        charges_copro_recuperables: 50,
        assurance_gli: 200,
        cfe_estimee: 300,
        comptable_annuel: 600,
    },
    structure: {
        type: 'nom_propre',
        tmi: 30,
        regime_fiscal: 'reel',
        associes: [
            { nom: 'Jean Dupont', parts: 100, revenus: 45000, mensualites: 500, charges: 200 },
        ],
    },
    options: {
        generer_pdf: true,
        envoyer_email: false,
        horizon_projection: 10,
    },
};

// Base mock results
const baseMockResultats: CalculResultats = {
    rentabilite: {
        brute: 5.1,
        nette: 4.2,
        nette_nette: 3.5,
    },
    cashflow: {
        mensuel: 125,
        annuel: 1500,
    },
    financement: {
        montant_emprunt: 206500,
        mensualite: 1195,
        cout_total_credit: 80300,
        frais_notaire: 15300,
    },
    fiscalite: {
        regime: 'reel',
        impot_estime: 2556,
        revenu_net_apres_impot: 7644,
    },
    hcsf: {
        taux_endettement: 28.5,
        conforme: true,
        details_associes: [
            { nom: 'Jean Dupont', taux_endettement: 28.5, conforme: true },
        ],
    },
    synthese: {
        score_global: 72,
        recommandation: "Cet investissement présente un profil équilibré.",
        points_attention: [],
    },
    projections: {
        horizon: 20,
        totaux: {
            cashflowCumule: 35000,
            enrichissementTotal: 250000,
            capitalRembourse: 180000,
            impotCumule: 50000,
            tri: 4.5
        },
        // Note: 'projections' property is correct, distinct from 'annees'
        projections: []
    },
    comparaisonFiscalite: {
        items: [],
        conseil: ''
    }
};

describe('RapportSimulation PDF Generation', () => {
    it('renders correctly with empty projections using the correct property name', async () => {
        const mockResultatsWithProjections = {
            ...baseMockResultats,
            projections: {
                ...baseMockResultats.projections,
                projections: [], // Specifically checking this field exists and doesn't crash component
                horizon: 20,
                totaux: baseMockResultats.projections!.totaux
            }
        };

        const doc = (
            <RapportSimulation
                formData={mockFormData}
                resultats={mockResultatsWithProjections}
                generatedAt={new Date()}
            />
        );

        // If this throws, the test fails. renderToBuffer exercises the rendering logic.
        await expect(renderToBuffer(doc)).resolves.toBeDefined();
    }, 30000);

    it('renders comparisons table when comparaisonFiscalite is present', async () => {
        const mockResultatsWithComparaison = {
            ...baseMockResultats,
            comparaisonFiscalite: {
                items: [
                    {
                        regime: 'LMNP Réel',
                        impotAnnuelMoyen: 800,
                        cashflowNetMoyen: 1500,
                        rentabiliteNetteNette: 5.5,
                        isOptimal: true,
                        isSelected: true,
                        description: 'Régime réel',
                        avantages: ['Amortissement'],
                        inconvenients: [],
                    },
                    {
                        regime: 'Micro-BIC',
                        impotAnnuelMoyen: 1200,
                        cashflowNetMoyen: 1100,
                        rentabiliteNetteNette: 4.2,
                        isOptimal: false,
                        isSelected: false,
                        description: 'Régime micro',
                        avantages: ['Simplicité'],
                        inconvenients: [],
                    },
                ],
                conseil: 'Le régime LMNP Réel est recommandé.'
            }
        };

        const doc = (
            <RapportSimulation
                formData={mockFormData}
                resultats={mockResultatsWithComparaison}
                generatedAt={new Date()}
            />
        );

        // Verifies that including this data does not crash the PDF renderer
        // (React-pdf doesn't support DOM testing of the output easily in this environment, 
        // so we assume if it renders without error, the components are handling the data)
        await expect(renderToBuffer(doc)).resolves.toBeDefined();
    }, 30000);
});
