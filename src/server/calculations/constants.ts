/**
 * Constantes techniques et réglementaires non configurables par l'admin
 */

import { DPE } from './types';

// ============================================================================
// FISCALITÉ
// ============================================================================

/** Durée d'amortissement de l'immeuble (bâti) en années */
export const DUREE_AMORTISSEMENT_BATI = 33;

/** Durée d'amortissement du mobilier en années */
export const DUREE_AMORTISSEMENT_MOBILIER = 10;

/** Durée d'amortissement des travaux en années */
export const DUREE_AMORTISSEMENT_TRAVAUX = 15;

/** Part du terrain par défaut (non amortissable) */
export const PART_TERRAIN_DEFAUT = 0.15;

/** Date charnière pour la réintégration des amortissements LMNP (Loi Le Meur) */
export const DATE_LOI_LE_MEUR = '2025-02-15';

/** Prélèvements sociaux (CSG-CRDS) */
export const PRELEVEMENTS_SOCIAUX = 0.172; // 17.2%

/** Taux IS pour SCI */
export const TAUX_IS = {
  TAUX_REDUIT: 0.15, // 15% jusqu'à 42 500 €
  TAUX_NORMAL: 0.25, // 25% au-delà
  SEUIL: 42500,
} as const;

// ============================================================================
// SCORING
// ============================================================================

/** Score de base */
export const SCORE_BASE = 40;

/** Poids des critères selon le profil investisseur */
export const SCORING_PROFIL_WEIGHTS = {
  rentier: {
    cashflow: 1.5,
    rentabilite: 1.2,
    hcsf: 1.0,
    dpe: 0.8,
    ratio_prix_loyer: 0.5,
    reste_a_vivre: 0.5,
  },
  patrimonial: {
    cashflow: 0.5,
    rentabilite: 1.0,
    hcsf: 1.2,
    dpe: 1.5,
    ratio_prix_loyer: 1.0,
    reste_a_vivre: 1.2,
  },
} as const;

/** Seuils de scoring pour les évaluations qualitatives */
export const EVALUATIONS_THRESHOLDS = {
  excellent: { min: 80, label: 'Excellent' as const, color: 'green' },
  bon: { min: 60, label: 'Bon' as const, color: 'blue' },
  moyen: { min: 40, label: 'Moyen' as const, color: 'orange' },
} as const;

/** Seuils d'alerte métier */
export const SEUILS = {
  // HCSF
  TAUX_ENDETTEMENT_MAX: 35,
  TAUX_ENDETTEMENT_ALERTE: 30,
  DUREE_EMPRUNT_MAX: 25,
  // Rentabilité
  RENTABILITE_BRUTE_MIN: 7,
  RENTABILITE_BRUTE_BONNE: 10,
  // Cash-flow
  CASHFLOW_CRITIQUE: -200,
  // Ratio prix/loyer
  RATIO_PRIX_LOYER_MAX: 250,
  // SCI
  RATIO_COUVERTURE_SCI_MIN: 110,
} as const;

/** Paramètres DPE */
export const DPE_CONFIG = {
  INTERDICTIONS: {
    G: { annee: 2025, libelle: 'Interdit à la location depuis le 1er janvier 2025' },
    F: { annee: 2028, libelle: 'Interdit à la location à partir du 1er janvier 2028' },
    E: { annee: 2034, libelle: 'Interdit à la location à partir du 1er janvier 2034' },
  },
  GEL_LOYER: ['F', 'G'] as DPE[],
  SCORES: {
    A: 5,
    B: 5,
    C: 0,
    D: 0,
    E: -3,
    F: -10,
    G: -10,
  } as Record<DPE, number>,
} as const;

// ============================================================================
// TECHNIQUE
// ============================================================================

/** Précision pour le calcul du TRI */
export const TRI_PRECISION = 0.00001;

/** Nombre maximum d'itérations pour le TRI (Newton) */
export const TRI_MAX_ITERATIONS = 100;
