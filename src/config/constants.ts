/**
 * Constantes de configuration pour l'application Renta Immo.
 * Centralise les taux fiscaux, seuils, et constantes de calcul.
 * Valeurs à jour pour 2025.
 */

export const CONSTANTS = {
    // ========================================================================
    // FISCALITÉ
    // ========================================================================
    FISCALITE: {
        // Prélèvements sociaux (PS)
        // PS sur plus-values immobilières et revenus fonciers = 17.2% (CGI art. 200 A)
        TAUX_PS_FONCIER: 0.172,
        // PS sur revenus BIC LMNP = 17.2% pour non-professionnels
        // Note: PS revenus LMNP ≠ PS plus-values (distinction V2-S04)
        TAUX_PS_REVENUS_BIC_LMNP: 0.172,

        // Micro-Foncier (Location nue)
        MICRO_FONCIER: {
            ABATTEMENT: 0.30, // 30%
            PLAFOND: 15000, // 15 000 €
        },

        // Micro-BIC (LMNP)
        MICRO_BIC: {
            // Meublé longue durée (Classique)
            MEUBLE_LONGUE_DUREE: {
                ABATTEMENT: 0.50, // 50%
                PLAFOND: 77700,   // 77 700 €
            },
            // Meublé tourisme classé (Gîtes de France, étoiles...)
            MEUBLE_TOURISME_CLASSE: {
                ABATTEMENT: 0.71, // 71%
                PLAFOND: 188700,  // 188 700 €
            },
            // Meublé tourisme non classé (Airbnb classique)
            // Alignement 2024/2025 : 50% / 77 700€ (Loi Finances 2025 revirement)
            // Note: Le "coup de rabot" à 30% / 15k€ n'a pas été retenu dans la version finale pour 2025 standard
            MEUBLE_TOURISME_NON_CLASSE: {
                ABATTEMENT: 0.50, // 50%
                PLAFOND: 77700,   // 77 700 €
            },
            // Garder pour compatibilité si besoin, mais déprécié
            STANDARD: {
                ABATTEMENT: 0.50,
                PLAFOND: 77700,
            },
            NON_CLASSE: {
                ABATTEMENT: 0.50,
                PLAFOND: 77700,
            },
        },

        // Impôt sur les Sociétés (SCI IS)
        IS: {
            TAUX_REDUIT: 0.15, // 15%
            TAUX_NORMAL: 0.25, // 25%
            SEUIL_TAUX_REDUIT: 42500, // 42 500 €
        },

        // Flat Tax (Dividendes)
        FLAT_TAX: 0.30, // 30%
    },

    // ========================================================================
    // FRAIS D'ACQUISITION (NOTAIRE)
    // ========================================================================
    NOTAIRE: {
        // Taux estimatifs globaux
        TAUX_ANCIEN: 0.08, // ~8%
        TAUX_NEUF: 0.025, // ~2.5%

        // Détail pour calcul précis (Barème)
        BAREME_EMOLUMENTS: [
            { SEUIL: 6500, TAUX: 0.03870 },
            { SEUIL: 17000, TAUX: 0.01596 },
            { SEUIL: 60000, TAUX: 0.01064 },
            { SEUIL: Infinity, TAUX: 0.00799 },
        ],
        TVA_EMOLUMENTS: 0.20, // 20%

        // Droits de mutation (DMTO)
        DMTO: {
            TAUX_DEPARTEMENTAL_STANDARD: 0.0450, // 4.5%
            TAUX_DEPARTEMENTAL_MAJOR: 0.0500, // 5.0% (Hausse 2025 possible)
            TAUX_COMMUNAL: 0.0120, // 1.2%
            FRAIS_ASSIETTE_TAXE: 0.0237, // 2.37% du DMTO
        },

        // Sécurité immobilière
        CSI_TAUX: 0.001, // 0.1%
    },

    // ========================================================================
    // HCSF (Haut Conseil de Stabilité Financière)
    // ========================================================================
    HCSF: {
        TAUX_MAX: 0.35, // 35%
        DUREE_MAX_ANNEES: 25,
        PONDERATION_LOCATIFS: 0.70, // 70%

        // Estimation des revenus nets mensuels selon TMI (si non saisis)
        REVENUS_ESTIMES: {
            TMI_0: 1200,
            TMI_11: 2000,
            TMI_30: 4000,
            TMI_41: 7000,
            TMI_45: 16000,
        }
    },

    // ========================================================================
    // AMORTISSEMENT (LMNP RÉEL / SCI IS)
    // ========================================================================
    AMORTISSEMENT: {
        // Ventilation par défaut
        PART_TERRAIN: 0.15, // 15% (non amortissable) - fallback
        PART_BATI: 0.85,    // 85%

        // Part terrain par défaut selon type de bien (Audit 2026-02-07)
        PART_TERRAIN_DEFAUT: {
            APPARTEMENT: 0.10,
            MAISON: 0.20,
            IMMEUBLE: 0.10,
        } as Record<string, number>,

        // Durées d'amortissement par défaut (linéaire)
        DUREE_BATI: 33,      // ~3% / an (simplifié)
        DUREE_MOBILIER: 10,  // 10% / an
        DUREE_TRAVAUX: 15,   // ~6.67% / an

        // Taux précis par composant (pour calcul avancé futur)
        COMPOSANTS: {
            GROS_OEUVRE: { PART: 0.40, DUREE: 50 },
            FACADE_TOITURE: { PART: 0.20, DUREE: 25 },
            INSTALLATIONS: { PART: 0.20, DUREE: 15 },
            AGENCEMENTS: { PART: 0.20, DUREE: 10 },
        }
    },

    // ========================================================================
    // DÉFICIT FONCIER (AUDIT-103)
    // ========================================================================
    DEFICIT_FONCIER: {
        PLAFOND_IMPUTATION: 10700,  // Max imputable sur revenu global
        // AUDIT-110 & V2-S15 : Plafond majoré pour rénovation énergétique (2023-2025)
        PLAFOND_ENERGIE: 21400,
        DUREE_REPORT: 10,           // 10 ans de report
    },

    // ========================================================================
    // PLUS-VALUE IMMOBILIÈRE (AUDIT-105)
    // ========================================================================
    PLUS_VALUE: {
        // Taux d'imposition
        TAUX_IR: 0.19,        // 19%
        TAUX_PS: 0.172,       // 17.2%

        // Forfaits pour calcul prix d'acquisition corrigé (V2-S01)
        FORFAIT_FRAIS_ACQUISITION: 0.075,  // 7.5% forfait frais d'acquisition
        FORFAIT_TRAVAUX_PV: 0.15,          // 15% forfait travaux (si > 5 ans détention)

        // Seuil surtaxe
        SEUIL_SURTAXE: 50000, // €

        // Barème surtaxe PV > 50 000€ (V2-S03 — 5 tranches conformes)
        BAREME_SURTAXE: [
            { MIN: 50001, MAX: 100000, TAUX: 0.02 },
            { MIN: 100001, MAX: 150000, TAUX: 0.03 },
            { MIN: 150001, MAX: 200000, TAUX: 0.04 },
            { MIN: 200001, MAX: 250000, TAUX: 0.06 },
            { MIN: 250001, MAX: Infinity, TAUX: 0.06 },
        ],

        // Loi Le Meur — date d'application pour réintégration amortissements (V2-S05)
        DATE_LOI_LE_MEUR: '2025-02-15',
    },

    // ========================================================================
    // VALEURS PAR DÉFAUT (INTERFACE)
    // ========================================================================
    DEFAULTS: {
        ASSURANCE_PNO: 150, // €/an
        CHARGES_COPRO_M2: 25, // €/m²/an (estimatif)
        TAXE_FONCIERE_MOIS: 1, // Mois de loyer (estimatif)
        FRAIS_DOSSIER_BANQUE: 0, // €
        FRAIS_GARANTIE_CREDIT: 2000, // € (estimatif)
        COMPTABLE_LMNP: 500, // €/an
        CFE_MIN: 200, // €/an
    },

    // ========================================================================
    // PROJECTIONS (SIMULATION PLURIANNUELLE)
    // ========================================================================
    PROJECTION: {
        INFLATION_LOYER: 0.02, // 2%
        INFLATION_CHARGES: 0.025, // 2.5%
        REVALORISATION_BIEN: 0.015, // 1.5%
        HORIZONS: [5, 10, 15, 20, 25], // Années
        // AUDIT-110 & V2-S14 : Décote de valeur pour passoires thermiques
        DECOTE_DPE: {
            F_G: 0.15, // -15%
            E: 0.10,   // -10% (dès 2034)
        },
    },

    // ========================================================================
    // RESTE À VIVRE (AUDIT-107)
    // ========================================================================
    RESTE_A_VIVRE: {
        SEUIL_MIN: 700,       // €/mois - seuil minimum bancaire
        SEUIL_CONFORT: 1500,  // €/mois - seuil confort
    },

    // ========================================================================
    // CFE (Cotisation Foncière des Entreprises) (V2-S10)
    // ========================================================================
    CFE: {
        SEUIL_EXONERATION: 5000, // € de recettes annuelles
    },

    // ========================================================================
    // FRAIS DE REVENTE (AUDIT-108)
    // ========================================================================
    FRAIS_REVENTE: {
        TAUX_AGENCE_DEFAUT: 5,   // % du prix de vente
        DIAGNOSTICS: 500,         // € forfaitaire
    },
} as const;
