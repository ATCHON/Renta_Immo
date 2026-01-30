/**
 * Types pour le calculateur de rentabilité immobilière
 */

// Types de bien immobilier
export type TypeBien = 'appartement' | 'maison' | 'immeuble';

// Types de structure juridique
export type TypeStructure = 'nom_propre' | 'sci_is';

// Types de régimes fiscaux
export type RegimeFiscal = 'micro_foncier' | 'reel' | 'lmnp_micro' | 'lmnp_reel';

// Statut du formulaire
export type FormStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Informations du bien immobilier
 */
export interface BienData {
  adresse: string;
  prix_achat: number;
  surface?: number;
  type_bien: TypeBien;
  annee_construction?: number;
  // Nouveaux champs 2025
  etat_bien: 'ancien' | 'neuf';
  montant_travaux: number;
  valeur_mobilier: number;
}

/**
 * Informations de financement
 */
export interface FinancementData {
  apport: number;
  taux_interet: number;
  duree_emprunt: number;
  assurance_pret: number;
  // Nouveaux champs 2025
  frais_dossier: number;
  frais_garantie: number;
}

/**
 * Informations d'exploitation
 */
export interface ExploitationData {
  loyer_mensuel: number;
  charges_copro: number;
  taxe_fonciere: number;
  assurance_pno: number;
  gestion_locative: number;
  provision_travaux: number;
  provision_vacance: number;
  // Nouveaux champs 2025
  type_location: 'nue' | 'meublee_longue_duree' | 'meublee_tourisme_classe' | 'meublee_tourisme_non_classe';
  charges_copro_recuperables: number;
  assurance_gli: number;
  cfe_estimee: number;
  comptable_annuel: number;
}

/**
 * Informations d'un associé (SCI)
 */
export interface AssocieData {
  nom: string;
  parts: number;
  revenus: number;
  mensualites: number;
  charges: number;
}

/**
 * Structure juridique
 */
export interface StructureData {
  type: TypeStructure;
  tmi: number;
  regime_fiscal?: RegimeFiscal;
  associes: AssocieData[];
  // Ajouts pour HCSF Nom Propre
  credits_immobiliers?: number;
  loyers_actuels?: number;
  revenus_activite?: number;
  distribution_dividendes?: boolean;
  autres_charges?: number;
}

/**
 * Options de génération
 */
export interface OptionsData {
  generer_pdf: boolean;
  envoyer_email: boolean;
  email?: string;
  horizon_projection?: number;
  taux_evolution_loyer?: number;
  taux_evolution_charges?: number; // Anticipating Story 2.3.4
}

/**
 * Données complètes du formulaire
 */
export interface CalculateurFormData {
  bien: BienData;
  financement: FinancementData;
  exploitation: ExploitationData;
  structure: StructureData;
  options: OptionsData;
}

/**
 * Résultats de rentabilité
 */
export interface RentabiliteResultat {
  brute: number;
  nette: number;
  nette_nette: number;
  effort_epargne_mensuel?: number;
  effet_levier?: number;
}

/**
 * Résultats de cashflow
 */
export interface CashflowResultat {
  mensuel: number;
  annuel: number;
  mensuel_brut?: number;
  annuel_brut?: number;
}

/**
 * Résultats de financement
 */
export interface FinancementResultat {
  montant_emprunt: number;
  mensualite: number;
  cout_total_credit: number;
}

/**
 * Ligne d'un tableau d'amortissement
 */
export interface LigneAmortissement {
  periode: number;
  echeance: number;
  capital: number;
  interets: number;
  assurance: number;
  capitalRestant: number;
}

/**
 * Tableau d'amortissement complet
 */
export interface TableauAmortissement {
  annuel: LigneAmortissement[];
  mensuel?: LigneAmortissement[];
  totaux: {
    totalInterets: number;
    totalAssurance: number;
    totalPaye: number;
  };
}

/**
 * Résultats de fiscalité
 */
export interface FiscaliteResultat {
  regime: string;
  impot_estime: number;
  revenu_net_apres_impot: number;
  dividendes_bruts?: number;
  flat_tax?: number;
  net_en_poche?: number;
}

/**
 * Item individuel d'une comparaison fiscale
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
 * Résultats de la comparaison fiscale entre plusieurs régimes
 */
export interface FiscaliteComparaison {
  items: FiscaliteComparaisonItem[];
  conseil: string;
}

/**
 * Détails HCSF par associé
 */
export interface HCSFDetailAssocie {
  nom: string;
  taux_endettement: number;
  conforme: boolean;
}

/**
 * Résultats HCSF
 */
export interface HCSFResultat {
  taux_endettement: number;
  conforme: boolean;
  details_associes: HCSFDetailAssocie[];
}

/**
 * Synthèse des résultats
 */
export interface SyntheseResultat {
  score_global: number;
  recommandation: string;
  points_attention: string[];
}

/**
 * Tous les résultats de calcul
 */
export interface CalculResultats {
  rentabilite: RentabiliteResultat;
  cashflow: CashflowResultat;
  financement: FinancementResultat;
  fiscalite: FiscaliteResultat;
  hcsf: HCSFResultat;
  synthese: SyntheseResultat;
  projections?: ProjectionData;
  tableauAmortissement?: TableauAmortissement;
  comparaisonFiscalite?: FiscaliteComparaison;
}

/**
 * Données d'une année de projection
 */
export interface ProjectionAnnuelle {
  annee: number;
  loyer: number;
  charges: number;
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
 * Étapes du formulaire
 */
export const FORM_STEPS = [
  { id: 'bien', label: 'Bien immobilier' },
  { id: 'financement', label: 'Financement' },
  { id: 'exploitation', label: 'Exploitation' },
  { id: 'structure', label: 'Structure juridique' },
  { id: 'associes', label: 'Associés' },
  { id: 'options', label: 'Options' },
] as const;

export type StepId = (typeof FORM_STEPS)[number]['id'];
