/**
 * Types pour le calculateur de rentabilité immobilière
 */

// Types de bien immobilier
export type TypeBien = 'appartement' | 'maison' | 'immeuble';

// Types d'état du bien
export type EtatBien = 'ancien' | 'neuf';

// Types de location
export type TypeLocation =
  | 'nue'
  | 'meublee_longue_duree'
  | 'meublee_tourisme_classe'
  | 'meublee_tourisme_non_classe';

// Types de structure juridique
export type TypeStructure = 'nom_propre' | 'sci_is';

// Types de régimes fiscaux
export type RegimeFiscal = 'micro_foncier' | 'reel' | 'lmnp_micro' | 'lmnp_reel';

// Diagnostic de Performance Énergétique (AUDIT-106)
export type DPE = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

// Mode d'amortissement (AUDIT-104)
export type ModeAmortissement = 'simplifie' | 'composants';

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
  etat_bien: EtatBien;
  montant_travaux: number;
  valeur_mobilier: number;
  // Audit 2026-02-07 : part terrain paramètrée
  part_terrain?: number;
  // Audit Phase 2 : DPE pour scoring (AUDIT-106)
  dpe?: DPE;
  // Audit Phase 2 : Déficit foncier majoré (AUDIT-110 & V2-S15)
  renovation_energetique?: boolean;
  annee_travaux?: number;
  // REC-04 : Vente en l'État Futur d'Achèvement (VEFA)
  is_vefa?: boolean;
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
  // AUDIT-109 : Mode d'assurance
  mode_assurance?: 'capital_initial' | 'capital_restant_du';
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
  type_location: TypeLocation;
  charges_copro_recuperables: number;
  assurance_gli: number;
  cfe_estimee: number;
  comptable_annuel: number;
  // V2-S06 : Taux d'occupation (vacance locative)
  taux_occupation?: number; // 0-1, défaut 0.92
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
  // Audit Phase 2 : mode amortissement (AUDIT-104)
  mode_amortissement?: ModeAmortissement;
}

/**
 * Profil d'investisseur pour le scoring (V2-S16)
 */
export type ProfilInvestisseur = 'rentier' | 'patrimonial';

/**
 * Options de génération
 */
export interface OptionsData {
  generer_pdf: boolean;
  envoyer_email: boolean;
  email?: string;
  horizon_projection?: number;
  taux_evolution_loyer?: number;
  taux_evolution_charges?: number;
  // AUDIT-108 : Frais de revente
  taux_agence_revente?: number;
  // V2-S16 : Profil investisseur pour le scoring
  profil_investisseur?: ProfilInvestisseur;
  // V2-S18 : Pondération des loyers pour HCSF (défaut 70, avec GLI → 80)
  ponderation_loyers?: number;
  // FEAT-PV : Prix de revente cible et durée de détention pour le calcul de plus-value
  prix_revente?: number;
  duree_detention?: number;
}

/**
 * Détail de la plus-value à la revente (FEAT-PV)
 */
export interface PlusValueResultat {
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
 * Un scénario complet de simulation
 */
export interface Scenario {
  id: string;
  name: string;
  bien: Partial<BienData>;
  financement: Partial<FinancementData>;
  exploitation: Partial<ExploitationData>;
  structure: Partial<StructureData>;
  options: OptionsData;
  resultats: CalculResultats | null;
  description?: string | null;
  dbId?: string;
  pdfUrl: string | null;
  currentStep: number;
  status: FormStatus;
}

/**
 * Résultats de rentabilité
 */
export interface RentabiliteResultat {
  brute: number;
  nette: number;
  nette_nette: number;
  loyer_annuel?: number;
  charges_mensuelles?: number;
  effort_epargne_mensuel?: number;
  effet_levier?: number | null;
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
  frais_notaire: number;
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
 * Ligne d'un tableau d'amortissement fiscal (LMNP réel / SCI IS)
 */
export interface LigneAmortissementFiscal {
  annee: number;
  amortissementImmo: number;
  amortissementTravaux: number;
  amortissementMobilier: number;
  amortissementTotal: number;
  amortissementDeductible: number;
  amortissementReporteCumule: number; // Excédent non déductible, reporté sans limite (LMNP réel)
  amortissementCumule: number;
  baseImposableAvant: number;
  baseImposableApres: number;
}

/**
 * Tableau d'amortissement fiscal complet
 */
export interface TableauAmortissementFiscal {
  regime: string;
  modeAmortissement: 'simplifie' | 'composants';
  lignes: LigneAmortissementFiscal[];
  totaux: {
    totalAmortissements: number;
    totalDeductible: number;
    totalMobilierDeduit: number;
    amortissementAReintegrer: number; // Sera ajouté à la PV imposable à la revente
    economieImpotEstimee: number;
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
  reste_a_vivre?: number;
}

/**
 * Détail du scoring (base 40 + ajustements par critère)
 */
export interface ScoreDetailResultat {
  base: number;
  ajustements: {
    cashflow: number;
    rentabilite: number;
    hcsf: number;
    dpe: number;
    ratio_prix_loyer: number;
    reste_a_vivre: number;
  };
  total: number;
}

/**
 * Point d'attention structuré
 */
export interface PointAttentionDetail {
  type: 'error' | 'warning' | 'info';
  categorie: string;
  message: string;
  conseil?: string;
}

/**
 * Recommandation structurée avec actions
 */
export interface RecommandationDetail {
  priorite: 'haute' | 'moyenne' | 'info';
  categorie: string;
  titre: string;
  description: string;
  actions: string[];
}

/**
 * Synthèse des résultats
 */
export interface SyntheseResultat {
  score_global: number;
  recommandation: string;
  points_attention: string[];
  evaluation?: 'Excellent' | 'Bon' | 'Moyen' | 'Faible';
  couleur?: 'green' | 'blue' | 'orange' | 'red';
  score_detail?: ScoreDetailResultat;
  points_attention_detail?: PointAttentionDetail[];
  recommandations_detail?: RecommandationDetail[];
  // V2-S16 : Scores pré-calculés pour les deux profils investisseur
  scores_par_profil?: {
    rentier: ScoreDetailResultat;
    patrimonial: ScoreDetailResultat;
  };
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
  tableauAmortissementFiscal?: TableauAmortissementFiscal;
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
    frais_revente?: number;
  };
  plusValue?: PlusValueResultat;
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
