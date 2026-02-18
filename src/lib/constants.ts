/**
 * Constantes de l'application
 */

/**
 * Tranches marginales d'imposition (TMI)
 */
export const TMI_OPTIONS = [
  { value: 0, label: '0%' },
  { value: 11, label: '11%' },
  { value: 30, label: '30%' },
  { value: 41, label: '41%' },
  { value: 45, label: '45%' },
] as const;

/**
 * Types de biens
 */
export const TYPE_BIEN_OPTIONS = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'maison', label: 'Maison' },
  { value: 'immeuble', label: 'Immeuble' },
] as const;

/**
 * Types de location
 */
export const TYPE_LOCATION_OPTIONS = [
  { value: 'nue', label: 'Location nue' },
  { value: 'meublee_longue_duree', label: 'Meublé longue durée' },
  { value: 'meublee_tourisme_classe', label: 'Meublé de tourisme classé' },
  { value: 'meublee_tourisme_non_classe', label: 'Meublé de tourisme non classé' },
] as const;

/**
 * Types de structures juridiques
 */
export const STRUCTURE_OPTIONS = [
  {
    value: 'nom_propre',
    label: 'Nom propre',
    description: 'Revenus fonciers imposés à votre TMI',
  },
  {
    value: 'sci_is',
    label: "SCI à l'IS",
    description: "Imposition à l'impôt sur les sociétés",
  },
] as const;

/**
 * Régimes fiscaux pour nom propre
 */
export const REGIME_FISCAL_OPTIONS = [
  {
    value: 'micro_foncier',
    label: 'Micro-foncier',
    description: 'Abattement forfaitaire de 30% (plafond 15 000€/an)',
  },
  {
    value: 'reel',
    label: 'Foncier réel',
    description: 'Déduction des charges réelles',
  },
  {
    value: 'lmnp_micro',
    label: 'LMNP Micro-BIC',
    description: 'Abattement forfaitaire de 50% (plafond 77 700€/an)',
  },
  {
    value: 'lmnp_reel',
    label: 'LMNP Réel',
    description: 'Déduction des charges + amortissement',
  },
] as const;

/**
 * Seuils HCSF (Haut Conseil de Stabilité Financière)
 */
export const HCSF = {
  TAUX_ENDETTEMENT_MAX: 35,
  TAUX_ENDETTEMENT_ALERTE: 33,
  DUREE_MAX_ANNEES: 25,
  PONDERATION_REVENUS_LOCATIFS: 0.7,
} as const;

/**
 * Constantes fiscales réglementaires
 */
export const FISCALITE = {
  // Prélèvements sociaux (CSG-CRDS)
  PRELEVEMENTS_SOCIAUX: 0.172, // 17.2%

  // Micro-foncier
  MICRO_FONCIER_ABATTEMENT: 0.3, // 30%
  MICRO_FONCIER_PLAFOND: 15000, // 15 000€/an

  // LMNP Micro-BIC
  MICRO_BIC_ABATTEMENT: 0.5, // 50%
  MICRO_BIC_PLAFOND: 77700, // 77 700€/an

  // Impôt sur les sociétés (IS)
  IS_TAUX_REDUIT: 0.15, // 15%
  IS_TAUX_NORMAL: 0.25, // 25%
  IS_SEUIL_TAUX_REDUIT: 42500, // 42 500€

  // Amortissement SCI IS
  TAUX_AMORTISSEMENT_BATI: 0.02, // 2% par an
  PART_TERRAIN: 0.15, // 15% du prix = terrain (non amortissable)

  // Flat tax sur dividendes
  FLAT_TAX: 0.3, // 30%
} as const;

/**
 * Valeurs par défaut
 */
export const DEFAULT_VALUES = {
  TAUX_INTERET: 3.5,
  DUREE_EMPRUNT: 20,
  ASSURANCE_PRET: 0.3,
  GESTION_LOCATIVE: 8,
  PROVISION_TRAVAUX: 5,
  PROVISION_VACANCE: 5,
} as const;

/**
 * Limites de validation
 */
export const LIMITS = {
  PRIX_MIN: 10000,
  PRIX_MAX: 100000000,
  SURFACE_MIN: 1,
  SURFACE_MAX: 10000,
  TAUX_MAX: 20,
  DUREE_MIN: 1,
  DUREE_MAX: 30,
} as const;

/**
 * Messages d'erreur
 */
export const ERROR_MESSAGES = {
  REQUIRED: 'Ce champ est requis',
  INVALID_NUMBER: 'Veuillez entrer un nombre valide',
  POSITIVE_NUMBER: 'La valeur doit être positive',
  EMAIL_INVALID: 'Adresse email invalide',
  PARTS_TOTAL: 'Le total des parts doit être égal à 100%',
} as const;

/**
 * Labels des étapes
 */
export const STEP_LABELS = [
  'Bien immobilier',
  'Financement',
  'Exploitation',
  'Structure juridique',
  'Associés',
  'Options',
] as const;
