/**
 * Schémas de validation Zod pour le calculateur
 */

import { z } from 'zod';

/**
 * Schéma de validation pour les informations du bien
 */
export const bienSchema = z.object({
  adresse: z
    .string()
    .min(5, "L'adresse doit contenir au moins 5 caractères"),
  prix_achat: z.coerce
    .number({ message: 'Veuillez saisir un nombre valide' })
    .positive('Le prix doit être positif')
    .min(10000, 'Le prix minimum est de 10 000 €'),
  surface: z.coerce
    .number({ message: 'Veuillez saisir un nombre valide' })
    .positive('La surface doit être positive')
    .optional(),
  type_bien: z.enum(['appartement', 'maison', 'immeuble'], {
    message: 'Veuillez sélectionner un type de bien',
  }),
  annee_construction: z.coerce
    .number({ message: 'Veuillez saisir une année valide' })
    .min(1800, 'Année de construction invalide')
    .max(new Date().getFullYear(), 'Année de construction invalide')
    .optional(),
  etat_bien: z.enum(['ancien', 'neuf'], {
    message: "Veuillez sélectionner l'état du bien",
  }).default('ancien'),
  montant_travaux: z.coerce.number({ message: 'Veuillez saisir un nombre valide' }).min(0).default(0),
  valeur_mobilier: z.coerce.number({ message: 'Veuillez saisir un nombre valide' }).min(0).default(0),
});

// Type d'entrée pour le formulaire (champs optionnels avec default)
export type BienFormDataInput = z.input<typeof bienSchema>;
// Type de sortie après parsing (avec les defaults appliqués)
export type BienFormData = z.output<typeof bienSchema>;

/**
 * Schéma de validation pour le financement
 */
export const financementSchema = z.object({
  apport: z.coerce
    .number({ message: 'Veuillez saisir un nombre valide' })
    .min(0, "L'apport ne peut pas être négatif"),
  taux_interet: z.coerce
    .number({ message: 'Veuillez saisir un nombre valide' })
    .min(0, 'Le taux ne peut pas être négatif')
    .max(20, 'Le taux semble trop élevé'),
  duree_emprunt: z.coerce
    .number({ message: 'Veuillez saisir un nombre valide' })
    .min(1, 'La durée minimum est de 1 an')
    .max(30, 'La durée maximum est de 30 ans'),
  assurance_pret: z.coerce
    .number({ message: 'Veuillez saisir un nombre valide' })
    .min(0, "L'assurance ne peut pas être négative")
    .max(2, "Le taux d'assurance semble trop élevé"),
  frais_dossier: z.coerce.number({ message: 'Veuillez saisir un nombre valide' }).min(0).default(0),
  frais_garantie: z.coerce.number({ message: 'Veuillez saisir un nombre valide' }).min(0).default(0),
});

// Type d'entrée pour le formulaire (champs optionnels avec default)
export type FinancementFormDataInput = z.input<typeof financementSchema>;
// Type de sortie après parsing (avec les defaults appliqués)
export type FinancementFormData = z.output<typeof financementSchema>;

/**
 * Schéma de validation pour l'exploitation
 */
export const exploitationSchema = z.object({
  loyer_mensuel: z.coerce
    .number({ message: 'Veuillez saisir un montant valide' })
    .positive('Le loyer doit être positif'),
  charges_copro: z.coerce
    .number({ message: 'Veuillez saisir un montant valide' })
    .min(0, 'Les charges ne peuvent pas être négatives'),
  taxe_fonciere: z.coerce
    .number({ message: 'Veuillez saisir un montant valide' })
    .min(0, 'La taxe foncière ne peut pas être négative'),
  assurance_pno: z.coerce
    .number({ message: 'Veuillez saisir un montant valide' })
    .min(0, "L'assurance PNO ne peut pas être négative"),
  gestion_locative: z.coerce
    .number({ message: 'Veuillez saisir un pourcentage valide' })
    .min(0, 'La gestion locative ne peut pas être négative')
    .max(20, 'Le taux de gestion semble trop élevé'),
  provision_travaux: z.coerce
    .number({ message: 'Veuillez saisir un pourcentage valide' })
    .min(0, 'La provision ne peut pas être négative'),
  provision_vacance: z.coerce
    .number({ message: 'Veuillez saisir un pourcentage valide' })
    .min(0, 'La provision vacance ne peut pas être négative')
    .max(50, 'Le taux de vacance semble trop élevé'),
  charges_copro_recuperables: z.coerce.number({ message: 'Veuillez saisir un montant valide' }).min(0).default(0),
  assurance_gli: z.coerce.number({ message: 'Veuillez saisir un pourcentage valide' }).min(0).default(0),
  cfe_estimee: z.coerce.number({ message: 'Veuillez saisir un montant valide' }).min(0).default(0),
  comptable_annuel: z.coerce.number({ message: 'Veuillez saisir un montant valide' }).min(0).default(0),
  type_location: z.enum(['nue', 'meublee_longue_duree', 'meublee_tourisme_classe', 'meublee_tourisme_non_classe']).default('nue'),
});

// Type d'entrée pour le formulaire (champs optionnels avec default)
export type ExploitationFormDataInput = z.input<typeof exploitationSchema>;
// Type de sortie après parsing (avec les defaults appliqués)
export type ExploitationFormData = z.output<typeof exploitationSchema>;

/**
 * Schéma de validation pour un associé
 */
export const associeSchema = z.object({
  nom: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères'),
  parts: z.coerce
    .number({ message: 'Les parts doivent être un nombre' })
    .min(0, 'Les parts ne peuvent pas être négatives')
    .max(100, 'Les parts ne peuvent pas dépasser 100%'),
  revenus: z.coerce
    .number({ message: 'Les revenus doivent être un nombre' })
    .min(0, 'Le revenus ne peuvent pas être négatifs'),
  mensualites: z.coerce
    .number({ message: 'Les mensualités doivent être un nombre' })
    .min(0, 'Les mensualités ne peuvent pas être négatives'),
  charges: z.coerce
    .number({ message: 'Les charges doivent être un nombre' })
    .min(0, 'Les charges ne peuvent pas être négatives'),
});

/**
 * Schéma de validation pour la liste des associés
 */
export const associesSchema = z.array(associeSchema).refine(
  (items) => {
    if (items.length === 0) return true;
    const total = items.reduce((sum, item) => sum + item.parts, 0);
    return Math.abs(total - 100) < 0.01;
  },
  { message: 'Le total des parts doit être égal à 100%' }
);

/**
 * Schéma de validation pour la structure juridique
 */
export const structureSchema = z.object({
  type: z.enum(['nom_propre', 'sci_is'], {
    message: 'Veuillez sélectionner une structure',
  }),
  tmi: z.coerce
    .number({ message: 'Le TMI doit être un nombre' })
    .min(0, 'Le TMI ne peut pas être négatif')
    .max(50, 'Le TMI ne peut pas dépasser 50%'),
  associes: associesSchema,
  regime_fiscal: z.enum(['micro_foncier', 'reel', 'lmnp_micro', 'lmnp_reel']).optional(),
  credits_immobiliers: z.coerce.number({ message: 'Veuillez saisir un montant' }).min(0).default(0),
  loyers_actuels: z.coerce.number({ message: 'Veuillez saisir un montant' }).min(0).default(0),
});

/**
 * Schéma de validation pour les options
 */
export const optionsSchema = z.object({
  generer_pdf: z.boolean(),
  envoyer_email: z.boolean(),
  email: z
    .string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  horizon_projection: z.number().default(20),
  taux_evolution_loyer: z.number().min(0).max(10).default(2),
  taux_evolution_charges: z.number().min(0).max(10).default(2.5),
}).refine(
  (data) => {
    if (data.envoyer_email && !data.email) {
      return false;
    }
    return true;
  },
  {
    message: "L'email est requis pour l'envoi",
    path: ['email'],
  }
);

/**
 * Schéma complet du formulaire
 */
export const calculateurFormSchema = z.object({
  bien: bienSchema,
  financement: financementSchema,
  exploitation: exploitationSchema,
  structure: structureSchema,
  options: optionsSchema,
});

// Types inférés depuis les schémas Zod
export type AssocieFormData = z.infer<typeof associeSchema>;
export type StructureFormDataInput = z.input<typeof structureSchema>;
export type StructureFormData = z.infer<typeof structureSchema>;
export type OptionsFormData = z.infer<typeof optionsSchema>;
export type CalculateurFormSchema = z.infer<typeof calculateurFormSchema>;
