/**
 * Module de validation des entrées
 * Valide et normalise les données du formulaire
 */

import { calculateurFormSchema } from '@/lib/validators';
import type { CalculateurFormData } from '@/types/calculateur';
import type { ValidatedFormData } from './types';

/**
 * Erreur de validation personnalisée
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Valeurs par défaut pour les champs optionnels
 */
const DEFAULTS = {
  financement: {
    taux_interet: 3.5,
    duree_emprunt: 20,
    assurance_pret: 0.3,
  },
  exploitation: {
    gestion_locative: 8,
    provision_travaux: 5,
    provision_vacance: 5,
  },
  structure: {
    tmi: 30,
  },
};

/**
 * Valide les données du formulaire avec Zod
 */
export function validateFormData(input: unknown): CalculateurFormData {
  const result = calculateurFormSchema.safeParse(input);

  if (!result.success) {
    const flatErrors = result.error.flatten();
    const firstFieldError = Object.entries(flatErrors.fieldErrors)[0];
    const errorMessage = firstFieldError
      ? `${firstFieldError[0]}: ${firstFieldError[1]?.[0] || 'Invalide'}`
      : flatErrors.formErrors[0] || 'Données invalides';

    throw new ValidationError(
      errorMessage,
      firstFieldError?.[0],
      { errors: flatErrors }
    );
  }

  return result.data;
}

/**
 * Applique les valeurs par défaut et normalise les données
 */
export function normalizeFormData(data: CalculateurFormData): ValidatedFormData {
  // Appliquer les valeurs par défaut si nécessaire
  const financement = {
    ...data.financement,
    taux_interet: data.financement.taux_interet || DEFAULTS.financement.taux_interet,
    duree_emprunt: data.financement.duree_emprunt || DEFAULTS.financement.duree_emprunt,
    assurance_pret: data.financement.assurance_pret ?? DEFAULTS.financement.assurance_pret,
  };

  const exploitation = {
    ...data.exploitation,
    gestion_locative: data.exploitation.gestion_locative ?? DEFAULTS.exploitation.gestion_locative,
    provision_travaux: data.exploitation.provision_travaux ?? DEFAULTS.exploitation.provision_travaux,
    provision_vacance: data.exploitation.provision_vacance ?? DEFAULTS.exploitation.provision_vacance,
  };

  const structure = {
    ...data.structure,
    tmi: data.structure.tmi || DEFAULTS.structure.tmi,
    // S'assurer que les associés existent même en nom propre (tableau vide)
    associes: data.structure.type === 'sci_is' ? data.structure.associes : [],
  };

  return {
    bien: data.bien,
    financement,
    exploitation,
    structure,
  };
}

/**
 * Validations métier supplémentaires
 */
export function validateBusinessRules(data: ValidatedFormData): string[] {
  const alertes: string[] = [];

  // Vérifier que l'apport ne dépasse pas le prix d'achat
  if (data.financement.apport > data.bien.prix_achat) {
    throw new ValidationError(
      "L'apport ne peut pas être supérieur au prix d'achat",
      'financement.apport'
    );
  }

  // Alertes (non bloquantes)
  if (data.financement.duree_emprunt > 25) {
    alertes.push('La durée de crédit dépasse 25 ans (limite HCSF recommandée)');
  }

  if (data.financement.apport === 0) {
    alertes.push('Financement à 110% : les banques exigent souvent un apport');
  }

  // SCI : vérifier que les parts totalisent 100%
  if (data.structure.type === 'sci_is') {
    const totalParts = data.structure.associes.reduce((sum, a) => sum + a.parts, 0);
    if (Math.abs(totalParts - 100) > 0.01) {
      throw new ValidationError(
        `Le total des parts doit être égal à 100% (actuellement ${totalParts}%)`,
        'structure.associes'
      );
    }

    // Vérifier qu'il y a au moins un associé
    if (data.structure.associes.length === 0) {
      throw new ValidationError(
        'Une SCI doit avoir au moins un associé',
        'structure.associes'
      );
    }
  }

  return alertes;
}

/**
 * Point d'entrée principal : valide et normalise les données
 */
export function validateAndNormalize(input: unknown): {
  data: ValidatedFormData;
  alertes: string[];
} {
  // Étape 1 : Validation Zod
  const validatedData = validateFormData(input);

  // Étape 2 : Normalisation
  const normalizedData = normalizeFormData(validatedData);

  // Étape 3 : Validations métier
  const alertes = validateBusinessRules(normalizedData);

  return {
    data: normalizedData,
    alertes,
  };
}
