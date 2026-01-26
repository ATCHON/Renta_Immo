/**
 * Types internes pour les calculs de rentabilité
 */

import type {
  BienData,
  FinancementData,
  ExploitationData,
  StructureData,
  AssocieData,
} from '@/types/calculateur';

// Re-export des types du frontend pour usage serveur
export type {
  BienData,
  FinancementData,
  ExploitationData,
  StructureData,
  AssocieData,
};

/**
 * Données validées et normalisées
 */
export interface ValidatedFormData {
  bien: BienData;
  financement: FinancementData;
  exploitation: ExploitationData;
  structure: StructureData;
}

/**
 * Résultats des calculs de financement
 */
export interface FinancementCalculations {
  montant_emprunt: number;
  mensualite_credit: number;
  mensualite_assurance: number;
  mensualite_totale: number;
  remboursement_annuel: number;
  cout_total_credit: number;
  cout_total_interets: number;
}

/**
 * Résultats des calculs de charges
 */
export interface ChargesCalculations {
  charges_fixes_annuelles: number;
  charges_proportionnelles_annuelles: number;
  total_charges_annuelles: number;
}

/**
 * Résultats des calculs de rentabilité
 */
export interface RentabiliteCalculations {
  // Revenus
  loyer_annuel: number;
  // Financement
  financement: FinancementCalculations;
  // Charges
  charges: ChargesCalculations;
  // Rentabilités
  rentabilite_brute: number;
  rentabilite_nette: number;
  revenu_net_avant_impots: number;
  // Cash-flow
  cashflow_annuel: number;
  cashflow_mensuel: number;
}

/**
 * Résultats des calculs de fiscalité
 */
export interface FiscaliteCalculations {
  regime: string;
  base_imposable: number;
  impot_revenu: number;
  prelevements_sociaux: number;
  impot_total: number;
  revenu_net_apres_impot: number;
  rentabilite_nette_nette: number;
  alertes: string[];
}

/**
 * Résultats HCSF pour un associé
 */
export interface HCSFAssocie {
  nom: string;
  pourcentage_parts: number;
  revenus_mensuels: number;
  charges_mensuelles: number;
  part_mensualite: number;
  taux_endettement: number;
  conforme: boolean;
}

/**
 * Résultats HCSF global
 */
export interface HCSFCalculations {
  structure: 'nom_propre' | 'sci_is';
  taux_endettement: number;
  conforme: boolean;
  details_associes: HCSFAssocie[];
  alertes: string[];
}

/**
 * Résultats de la synthèse
 */
export interface SyntheseCalculations {
  score_global: number;
  evaluation: 'Excellent' | 'Bon' | 'Moyen' | 'Faible';
  recommandation: string;
  points_attention: string[];
  criteres: {
    autofinancement: { status: 'OK' | 'KO'; valeur: number };
    rentabilite: { status: 'OK' | 'KO'; valeur: number };
    hcsf: { status: 'OK' | 'KO'; valeur: number };
  };
}

/**
 * Seuils d'alerte pour l'analyse
 */
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

/**
 * Prélèvements sociaux (CSG-CRDS)
 */
export const PRELEVEMENTS_SOCIAUX = 0.172; // 17.2%

/**
 * Taux IS pour SCI
 */
export const TAUX_IS = {
  TAUX_REDUIT: 0.15, // 15% jusqu'à 42 500 €
  TAUX_NORMAL: 0.25, // 25% au-delà
  SEUIL: 42500,
} as const;
