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
        // Prélèvements sociaux
        PRELEVEMENTS_SOCIAUX_FONCIER: 0.172, // 17.2% pour revenus fonciers
        PRELEVEMENTS_SOCIAUX_LMNP: 0.186, // 18.6% pour LMNP (hausse 2025)

        // Micro-Foncier (Location nue)
        MICRO_FONCIER: {
            ABATTEMENT: 0.30, // 30%
            PLAFOND: 15000, // 15 000 €
        },

        // Micro-BIC (LMNP)
        MICRO_BIC: {
            // Meublé longue durée & Tourisme classé
            STANDARD: {
                ABATTEMENT: 0.50, // 50%
                PLAFOND: 77700, // 77 700 €
            },
            // Meublé tourisme non classé (Zone tendue/général)
            NON_CLASSE: {
                ABATTEMENT: 0.30, // 30%
                PLAFOND: 15000, // 15 000 €
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
        PART_TERRAIN: 0.15, // 15% (non amortissable)
        PART_BATI: 0.85,    // 85%

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
    // VALEURS PAR DÉFAUT (INTERFACE)
    // ========================================================================
    DEFAULTS: {
        ASSURANCE_PNO: 150, // €/an
        CHARGES_COPRO_M2: 25, // €/m²/an (estimatif)
        TAXE_FONCIERE_MOIS: 1, // Mois de loyer (estimatif)
        FRAIS_DOSSIER_BANQUE: 0, // €
        FRAIS_GARANTIE_CREDIT: 2000, // € (estimatif)
        COMPTABLE_LMNP: 400, // €/an (adhésion CGA incluse)
        CFE_MIN: 200, // €/an
    }
} as const;
