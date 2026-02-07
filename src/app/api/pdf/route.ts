/**
 * PDF Generation API Route
 * POST /api/pdf - Generates a simulation report PDF
 */
import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { z, ZodError } from 'zod';
import { RapportSimulation } from '@/lib/pdf/templates/RapportSimulation';
import { logger } from '@/lib/logger';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import type { CalculateurFormData, CalculResultats } from '@/types/calculateur';

// Validation schemas
const BienDataSchema = z.object({
    adresse: z.string(),
    prix_achat: z.number(),
    surface: z.number().optional(),
    type_bien: z.enum(['appartement', 'maison', 'immeuble']),
    annee_construction: z.number().optional(),
    etat_bien: z.enum(['ancien', 'neuf']),
    montant_travaux: z.number(),
    valeur_mobilier: z.number(),
});

const FinancementDataSchema = z.object({
    apport: z.number(),
    taux_interet: z.number(),
    duree_emprunt: z.number(),
    assurance_pret: z.number(),
    frais_dossier: z.number(),
    frais_garantie: z.number(),
});

const ExploitationDataSchema = z.object({
    loyer_mensuel: z.number(),
    charges_copro: z.number(),
    taxe_fonciere: z.number(),
    assurance_pno: z.number(),
    gestion_locative: z.number(),
    provision_travaux: z.number(),
    provision_vacance: z.number(),
    type_location: z.enum(['nue', 'meublee_longue_duree', 'meublee_tourisme_classe', 'meublee_tourisme_non_classe']),
    charges_copro_recuperables: z.number(),
    assurance_gli: z.number(),
    cfe_estimee: z.number(),
    comptable_annuel: z.number(),
});

const AssocieDataSchema = z.object({
    nom: z.string(),
    parts: z.number(),
    revenus: z.number(),
    mensualites: z.number(),
    charges: z.number(),
});

const StructureDataSchema = z.object({
    type: z.enum(['nom_propre', 'sci_is']),
    tmi: z.number(),
    regime_fiscal: z.enum(['micro_foncier', 'reel', 'lmnp_micro', 'lmnp_reel']).optional(),
    associes: z.array(AssocieDataSchema),
    credits_immobiliers: z.number().optional(),
    loyers_actuels: z.number().optional(),
    revenus_activite: z.number().optional(),
    distribution_dividendes: z.boolean().optional(),
    autres_charges: z.number().optional(),
});

const OptionsDataSchema = z.object({
    generer_pdf: z.boolean(),
    envoyer_email: z.boolean(),
    email: z.string().optional(),
    horizon_projection: z.number().optional(),
    taux_evolution_loyer: z.number().optional(),
    taux_evolution_charges: z.number().optional(),
});

const FormDataSchema = z.object({
    bien: BienDataSchema,
    financement: FinancementDataSchema,
    exploitation: ExploitationDataSchema,
    structure: StructureDataSchema,
    options: OptionsDataSchema,
});

// Results schema (passthrough for flexibility)
const ResultatsSchema = z.object({
    rentabilite: z.object({
        brute: z.number(),
        nette: z.number(),
        nette_nette: z.number(),
    }).passthrough(),
    cashflow: z.object({
        mensuel: z.number(),
        annuel: z.number(),
    }).passthrough(),
    financement: z.object({
        montant_emprunt: z.number(),
        mensualite: z.number(),
        cout_total_credit: z.number(),
    }),
    fiscalite: z.object({
        regime: z.string(),
        impot_estime: z.number(),
        revenu_net_apres_impot: z.number(),
    }).passthrough(),
    hcsf: z.object({
        taux_endettement: z.number(),
        conforme: z.boolean(),
        details_associes: z.array(z.object({
            nom: z.string(),
            taux_endettement: z.number(),
            conforme: z.boolean(),
        })),
    }),
    synthese: z.object({
        score_global: z.number(),
        recommandation: z.string(),
        points_attention: z.array(z.string()),
    }),
    projections: z.any().optional(),
    tableauAmortissement: z.any().optional(),
    comparaisonFiscalite: z.any().optional(),
});

const PdfRequestSchema = z.object({
    formData: FormDataSchema,
    resultats: ResultatsSchema,
    options: z.object({
        includeGraphs: z.boolean().default(true),
        language: z.enum(['fr', 'en']).default('fr'),
    }).optional(),
});

export async function POST(request: NextRequest) {
    // Rate limiting: 5 requests per minute per IP (heavy PDF generation)
    const ip = getClientIp(request);
    const rl = rateLimit(`pdf:${ip}`, { limit: 5, window: 60_000 });
    if (!rl.success) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'RATE_LIMIT',
                    message: 'Trop de requêtes PDF. Réessayez dans quelques instants.',
                },
            },
            {
                status: 429,
                headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
            }
        );
    }

    try {
        // 1. Parse and validate body
        const body = await request.json();
        const validated = PdfRequestSchema.parse(body);

        // 2. Create the React element for PDF
        const pdfElement = React.createElement(RapportSimulation, {
            formData: validated.formData as CalculateurFormData,
            resultats: validated.resultats as CalculResultats,
        });

        // 3. Generate PDF buffer - cast element to satisfy react-pdf types
        const pdfBuffer = await renderToBuffer(pdfElement as unknown as React.ReactElement);

        // 4. Convert Buffer to Uint8Array for NextResponse compatibility
        const uint8Array = new Uint8Array(pdfBuffer);

        // 5. Generate filename with date
        const today = new Date().toISOString().split('T')[0];
        const filename = `simulation-renta-immo-${today}.pdf`;

        // 6. Return PDF with proper headers
        return new NextResponse(uint8Array, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Cache-Control': 'no-store',
            },
        });
    } catch (error) {
        // Handle validation errors
        if (error instanceof ZodError) {
            logger.error('PDF validation error:', error.issues);
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Données de simulation invalides',
                        details: error.issues,
                    },
                },
                { status: 400 }
            );
        }

        // Handle generation errors
        logger.error('PDF generation error:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'PDF_GENERATION_ERROR',
                    message: 'Erreur lors de la génération du PDF',
                },
            },
            { status: 500 }
        );
    }
}
