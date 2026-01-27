/**
 * Types internes pour les calculs de rentabilité
 */

import type {
  BienData,
  FinancementData,
  ExploitationData,
  StructureData,
  AssocieData,
  RegimeFiscal,
  OptionsData,
  TableauAmortissement,
  LigneAmortissement,
} from '@/types/calculateur';

// Re-export des types du frontend pour usage serveur
export type {
  BienData,
  FinancementData,
  ExploitationData,
  StructureData,
  AssocieData,
  RegimeFiscal,
  OptionsData,
  TableauAmortissement,
  LigneAmortissement,
};

/**
 * Données validées et normalisées
 */
export interface ValidatedFormData {
  bien: BienData;
  financement: FinancementData;
  exploitation: ExploitationData;
  structure: StructureData;
  options: OptionsData;
}

/**
 * Alias pour les données validées (utilisé dans les calculs)
 */
export type CalculationInput = ValidatedFormData;

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
  effort_epargne_mensuel: number;
  effet_levier: number;
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
 * Type simplifié pour l'affichage des associés HCSF
 */
export interface HCSFAssocie {
  nom: string;
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
  capacite_emprunt_residuelle: number;
  details_associes: HCSFAssocie[];
  alertes: string[];

  // Détails ajoutés pour une vision globale (agrégée)
  revenus_detail: {
    salaires_estimatif_mensuels: number;
    locatifs_bruts_mensuels: number;
    locatifs_ponderes_mensuels: number;
    total_mensuels: number;
  };
  charges_detail: {
    credits_existants_mensuels: number;
    nouveau_credit_mensuel: number;
    charges_fixes_mensuelles: number;
    total_mensuelles: number;
  };
}

/**
 * Détail du scoring
 */
export interface ScoreDetail {
  autofinancement: number; // 0-30 points
  rentabilite: number; // 0-30 points
  hcsf: number; // 0-25 points
  bonus_rentabilite: number; // 0-15 points
  total: number; // 0-100 points
}

/**
 * Point d'attention détaillé
 */
export interface PointAttention {
  type: 'error' | 'warning' | 'info';
  categorie: 'cashflow' | 'rentabilite' | 'financement' | 'fiscalite' | 'general';
  message: string;
  conseil?: string;
}

/**
 * Recommandation détaillée
 */
export interface Recommandation {
  priorite: 'haute' | 'moyenne' | 'info';
  categorie: 'cashflow' | 'rentabilite' | 'financement' | 'fiscalite' | 'general';
  titre: string;
  description: string;
  actions: string[];
}



/**
 * Données d'une année de projection
 */
export interface ProjectionAnnuelle {
  annee: number;
  loyer: number;
  charges: number; // Total charges (exploitation + crédit)
  chargesExploitation: number;
  remboursementCredit: number;
  mensualite: number;
  cashflow: number;
  capitalRembourse: number;
  capitalRestant: number;
  valeurBien: number;
  patrimoineNet: number;
  impot: number;
  cashflowNetImpot: number;
}

/**
 * Résultat complet des projections
 */
export interface ProjectionData {
  horizon: number;
  projections: ProjectionAnnuelle[];
  totaux: {
    cashflowCumule: number;
    capitalRembourse: number;
    impotCumule: number;
    enrichissementTotal: number;
    tri: number;
  };
}

/**
 * Résultats de la synthèse
 */
export interface SyntheseCalculations {
  score_global: number;
  evaluation: 'Excellent' | 'Bon' | 'Moyen' | 'Faible';
  couleur: string;
  recommandation: string;
  points_attention: string[];
  score_detail: ScoreDetail;
  points_attention_detail: PointAttention[];
  recommandations_detail: Recommandation[];
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
