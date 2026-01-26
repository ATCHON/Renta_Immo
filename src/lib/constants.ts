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
    label: 'SCI à l\'IS',
    description: 'Imposition à l\'impôt sur les sociétés',
  },
] as const;

/**
 * Seuils HCSF
 */
export const HCSF = {
  TAUX_ENDETTEMENT_MAX: 35,
  DUREE_MAX_ANNEES: 25,
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
