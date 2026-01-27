/**
 * Module principal d'orchestration des calculs
 * Point d'entrée unique pour tous les calculs de rentabilité
 */

import type { CalculResultats } from '@/types/calculateur';
import { validateAndNormalize, ValidationError } from './validation';
import { calculerRentabilite } from './rentabilite';
import { calculerFiscalite } from './fiscalite';
import { analyserHcsf } from './hcsf';
import { genererSynthese } from './synthese';

// Re-export des types et erreurs pour usage externe
export { ValidationError } from './validation';
export type { ValidatedFormData } from './types';

/**
 * Résultat complet d'un calcul
 */
export interface CalculationResult {
  success: true;
  resultats: CalculResultats;
  alertes: string[];
  timestamp: string;
}

/**
 * Erreur de calcul
 */
export interface CalculationError {
  success: false;
  error: string;
  code: string;
  field?: string;
  details?: Record<string, unknown>;
}

/**
 * Effectue tous les calculs de rentabilité
 *
 * @param input - Données brutes du formulaire
 * @returns Résultat du calcul ou erreur
 */
export function performCalculations(
  input: unknown
): CalculationResult | CalculationError {
  try {
    // Étape 1 : Validation et normalisation
    const { data, alertes } = validateAndNormalize(input);

    // Étape 2 : Calculs de rentabilité (financement, charges, rendements)
    const rentabilite = calculerRentabilite(
      data.bien,
      data.financement,
      data.exploitation
    );

    // Étape 3 : Calculs de fiscalité
    const fiscalite = calculerFiscalite(
      data.structure,
      rentabilite,
      data.bien.prix_achat
    );

    // Étape 4 : Analyse HCSF
    const hcsf = analyserHcsf(
      data,
      rentabilite.financement,
      data.exploitation.loyer_mensuel
    );

    // Étape 5 : Synthèse et scoring
    const synthese = genererSynthese(rentabilite, hcsf);

    // Assemblage du résultat final (format compatible avec le frontend existant)
    const resultats: CalculResultats = {
      rentabilite: {
        brute: rentabilite.rentabilite_brute,
        nette: rentabilite.rentabilite_nette,
        nette_nette: fiscalite.rentabilite_nette_nette,
      },
      cashflow: {
        mensuel: rentabilite.cashflow_mensuel,
        annuel: rentabilite.cashflow_annuel,
      },
      financement: {
        montant_emprunt: rentabilite.financement.montant_emprunt,
        mensualite: rentabilite.financement.mensualite_totale,
        cout_total_credit: rentabilite.financement.cout_total_credit,
      },
      fiscalite: {
        regime: fiscalite.regime,
        impot_estime: fiscalite.impot_total,
        revenu_net_apres_impot: fiscalite.revenu_net_apres_impot,
      },
      hcsf: {
        taux_endettement: hcsf.taux_endettement,
        conforme: hcsf.conforme,
        details_associes: hcsf.details_associes.map((a) => ({
          nom: a.nom,
          taux_endettement: a.taux_endettement,
          conforme: a.conforme,
        })),
      },
      synthese: {
        score_global: synthese.score_global,
        recommandation: synthese.recommandation,
        points_attention: synthese.points_attention,
      },
    };

    // Fusionner les alertes de validation avec celles du HCSF
    const toutesAlertes = [...alertes, ...hcsf.alertes];

    return {
      success: true,
      resultats,
      alertes: toutesAlertes,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    // Gestion des erreurs de validation
    if (error instanceof ValidationError) {
      return {
        success: false,
        error: error.message,
        code: 'VALIDATION_ERROR',
        field: error.field,
        details: error.details,
      };
    }

    // Autres erreurs
    console.error('Erreur de calcul:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      code: 'CALCULATION_ERROR',
    };
  }
}
