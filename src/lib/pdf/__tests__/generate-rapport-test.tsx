/**
 * Test script for RapportSimulation template
 * Generates a full simulation report PDF
 */
import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { RapportSimulation } from '../templates/RapportSimulation';
import * as fs from 'fs';
import * as path from 'path';
import type { CalculateurFormData, CalculResultats } from '@/types/calculateur';

// Mock form data (aligned with actual types from calculateur.ts)
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

// Mock results (aligned with actual types from calculateur.ts)
const mockResultats: CalculResultats = {
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
        recommandation: "Cet investissement présente un profil équilibré avec une rentabilité correcte et un cashflow positif. La conformité HCSF est respectée.",
        points_attention: [
            "Fiscalité à optimiser via le choix du régime",
            "Prévoir une épargne de précaution pour les travaux",
        ],
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
        projections: [] // aligned with interface property name 'projections' not 'annees'
    },
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
                inconvenients: ['Comptabilité']
            },
            {
                regime: 'LMNP Micro',
                impotAnnuelMoyen: 1200,
                cashflowNetMoyen: 1100,
                rentabiliteNetteNette: 4.8,
                isOptimal: false,
                isSelected: false,
                description: 'Micro-bic',
                avantages: ['Simplicité'],
                inconvenients: ['Pas d\'amortissement']
            },
            {
                regime: 'SCI IS',
                impotAnnuelMoyen: 1500,
                cashflowNetMoyen: 800,
                rentabiliteNetteNette: 4.2,
                isOptimal: false,
                isSelected: false,
                description: 'SCI à l\'IS',
                avantages: ['Fiscalité société'],
                inconvenients: ['Complexité']
            }
        ],
        conseil: 'Le LMNP au réel est le plus avantageux.'
    }
};

async function generateTestReport() {
    console.log('Generating simulation report PDF...');

    const doc = React.createElement(RapportSimulation, {
        formData: mockFormData,
        resultats: mockResultats,
        generatedAt: new Date(),
    });

    const buffer = await renderToBuffer(doc as any);
    const outputPath = path.join(__dirname, 'rapport-simulation-test.pdf');
    fs.writeFileSync(outputPath, buffer);

    console.log(`✓ Report generated successfully: ${outputPath}`);
    console.log(`  File size: ${(buffer.length / 1024).toFixed(2)} KB`);
}

generateTestReport().catch(console.error);
