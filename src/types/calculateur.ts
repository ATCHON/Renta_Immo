/**
 * Types pour le calculateur de rentabilité immobilière
 */

// Types de bien immobilier
export type TypeBien = 'appartement' | 'maison' | 'immeuble';

// Types de structure juridique
export type TypeStructure = 'nom_propre' | 'sci_is';

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
}

/**
 * Informations de financement
 */
export interface FinancementData {
  apport: number;
  taux_interet: number;
  duree_emprunt: number;
  assurance_pret: number;
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
  associes: AssocieData[];
}

/**
 * Options de génération
 */
export interface OptionsData {
  generer_pdf: boolean;
  envoyer_email: boolean;
  email?: string;
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
}

/**
 * Résultats de cashflow
 */
export interface CashflowResultat {
  mensuel: number;
  annuel: number;
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
 * Résultats de fiscalité
 */
export interface FiscaliteResultat {
  regime: string;
  impot_estime: number;
  revenu_net_apres_impot: number;
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
