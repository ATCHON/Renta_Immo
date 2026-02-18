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
  DPE,
  ProfilInvestisseur,
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
  DPE,
  ProfilInvestisseur,
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
  cout_total_acquisition: number;
  taux_interet: number;
  frais_notaire: number;
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
  effet_levier: number | null;
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
  dividendes_bruts?: number;
  flat_tax?: number;
  net_en_poche?: number;
  deficit_foncier?: DeficitFoncierDetail;
}

/**
 * Item de comparaison fiscale
 */
export interface FiscaliteComparaisonItem {
  regime: string;
  impotAnnuelMoyen: number;
  cashflowNetMoyen: number;
  rentabiliteNetteNette: number;
  isOptimal: boolean;
  isSelected: boolean;
  description: string;
  avantages: string[];
  inconvenients: string[];
  dividendes_bruts?: number;
  flat_tax?: number;
}

/**
 * Résultat complet de la comparaison fiscale
 */
export interface FiscaliteComparaison {
  items: FiscaliteComparaisonItem[];
  conseil: string;
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
  reste_a_vivre?: number;

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
    autres_charges_mensuelles?: number;
    charges_fixes_mensuelles: number;
    total_mensuelles: number;
  };
}

/**
 * Détail du déficit foncier (AUDIT-103)
 */
export interface DeficitFoncierDetail {
  deficit_total: number;
  deficit_hors_interets: number;
  deficit_interets: number;
  imputable_revenu_global: number; // min(deficit_hors_interets, 10700)
  economie_impot: number; // imputable * TMI
  reportable: number; // deficit restant reportable
  duree_report: number; // 10 ans
}

/**
 * Mode d'amortissement (AUDIT-104)
 */
export type ModeAmortissement = 'simplifie' | 'composants';

/**
 * Détail de la plus-value à la revente (AUDIT-105)
 */
export interface PlusValueDetail {
  prix_vente: number;
  prix_achat: number;
  plus_value_brute: number;
  amortissements_reintegres: number;
  duree_detention: number;
  abattement_ir: number;
  abattement_ps: number;
  plus_value_nette_ir: number;
  plus_value_nette_ps: number;
  impot_ir: number;
  impot_ps: number;
  surtaxe: number;
  impot_total: number;
  net_revente: number;
}

/**
 * Détail du scoring (AUDIT-106 : base 40 + ajustements)
 */
export interface ScoreDetail {
  base: number; // 40
  ajustements: {
    cashflow: number; // -20 à +20
    rentabilite: number; // -15 à +20
    hcsf: number; // -25 à +20
    dpe: number; // -10 à +5
    ratio_prix_loyer: number; // -5 à +10
    reste_a_vivre: number; // -10 à +5
  };
  total: number; // 0 à 100
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
    frais_revente?: number;
  };
  plusValue?: PlusValueDetail;
  /** REC-05 : TRI non significatif quand l'apport est nul */
  alerteApportZero?: boolean;
  /** REC-03 : Hypothèses utilisées pour les projections */
  hypotheses?: {
    inflationLoyer: number;
    inflationCharges: number;
    revalorisationBien: number;
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
  // V2-S16 : Scores pré-calculés pour les deux profils investisseur
  scores_par_profil?: {
    rentier: ScoreDetail;
    patrimonial: ScoreDetail;
  };
}

/**
 * Seuils d'alerte pour l'analyse (Désormais dans constants.ts)
 */

/**
 * Prélèvements sociaux (Désormais dans constants.ts)
 */

/**
 * Taux IS pour SCI (Désormais dans constants.ts)
 */
