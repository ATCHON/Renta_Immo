/**
 * Module principal d'orchestration des calculs
 * Point d'entrée unique pour tous les calculs de rentabilité
 */

import { configService } from '../config/config-service';
import type { CalculResultats } from '@/types/calculateur';
import { logger } from '@/lib/logger';
import { validateAndNormalize, ValidationError } from './validation';
import { calculerRentabilite } from './rentabilite';
import { calculerFiscalite, calculerToutesFiscalites } from './fiscalite';
import { analyserHcsf } from './hcsf';
import { genererSynthese } from './synthese';
import {
  genererProjections,
  genererTableauAmortissement,
  genererTableauAmortissementFiscal,
} from './projection';
import { ResolvedConfig } from '../config/config-types';

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
export async function performCalculations(
  input: unknown,
  configOverride?: ResolvedConfig
): Promise<CalculationResult | CalculationError> {
  try {
    // Étape 1 : Validation et normalisation
    const { data, alertes } = validateAndNormalize(input);

    // Étape 1bis : Récupération de la configuration
    let config: ResolvedConfig;
    if (configOverride) {
      config = configOverride;
    } else {
      const anneeFiscale = new Date().getFullYear();
      config = await configService.getConfig(anneeFiscale);
    }

    // Étape 2 : Calculs de rentabilité (financement, charges, rendements)
    const rentabilite = calculerRentabilite(data.bien, data.financement, data.exploitation, config);

    // Étape 3 : Calculs de fiscalité
    const fiscalite = calculerFiscalite(
      data.structure,
      rentabilite,
      data.bien,
      data.exploitation,
      config
    );

    // Étape 4 : Analyse HCSF
    const hcsf = analyserHcsf(
      data,
      rentabilite.financement,
      data.exploitation.loyer_mensuel,
      config
    );

    // Étape 4bis : Comparaison fiscale complète
    const comparaisonFiscalite = calculerToutesFiscalites(data, rentabilite, config);

    // Étape 5 : Synthèse et scoring (AUDIT-106 : nouveau scoring avec DPE et ratio)
    // V2-S16 : Profil investisseur pour pondération du scoring
    const profilInvestisseur = (data.options as { profil_investisseur?: 'rentier' | 'patrimonial' })
      .profil_investisseur;
    const synthese = genererSynthese(
      rentabilite,
      hcsf,
      config,
      fiscalite,
      data.structure,
      data.bien,
      profilInvestisseur
    );

    // Étape 6 : Projections pluriannuelles
    const projections = genererProjections(data, config, data.options.horizon_projection);

    // REC-05 : Alerte TRI non significatif si apport = 0
    if (projections.alerteApportZero) {
      synthese.points_attention_detail.push({
        type: 'warning',
        categorie: 'rentabilite',
        message: 'TRI non significatif : aucun apport renseigné',
        conseil:
          'Le TRI mesure le rendement de votre apport. Sans apport, il ne peut pas être interprété.',
      });
    }

    // Étape 7 : Tableau d'amortissement détaillé
    const tauxCredit = (data.financement.taux_interet || 0) / 100;
    const dureeCredit = data.financement.duree_emprunt || 0;
    const tauxAssurance = (data.financement.assurance_pret || 0) / 100;

    const tableauAmortissement = genererTableauAmortissement(
      rentabilite.financement.montant_emprunt,
      tauxCredit,
      dureeCredit,
      tauxAssurance
    );

    // Assemblage du résultat final (format compatible avec le frontend existant)
    const resultats: CalculResultats = {
      rentabilite: {
        brute: rentabilite.rentabilite_brute,
        nette: rentabilite.rentabilite_nette,
        nette_nette: fiscalite.rentabilite_nette_nette,
        loyer_annuel: rentabilite.loyer_annuel,
        charges_mensuelles: Math.round(rentabilite.charges.total_charges_annuelles / 12),
      },
      cashflow: {
        mensuel: Math.round((rentabilite.cashflow_annuel - fiscalite.impot_total) / 12),
        annuel: Math.round(rentabilite.cashflow_annuel - fiscalite.impot_total),
        mensuel_brut: rentabilite.cashflow_mensuel,
        annuel_brut: rentabilite.cashflow_annuel,
      },
      financement: {
        montant_emprunt: rentabilite.financement.montant_emprunt,
        mensualite: rentabilite.financement.mensualite_totale,
        cout_total_credit: rentabilite.financement.cout_total_credit,
        frais_notaire: rentabilite.financement.frais_notaire,
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
      comparaisonFiscalite,
      synthese: {
        score_global: synthese.score_global,
        recommandation: synthese.recommandation,
        points_attention: synthese.points_attention,
        evaluation: synthese.evaluation,
        couleur: synthese.couleur as 'green' | 'blue' | 'orange' | 'red',
        score_detail: synthese.score_detail,
        points_attention_detail: synthese.points_attention_detail,
        recommandations_detail: synthese.recommandations_detail,
        scores_par_profil: synthese.scores_par_profil,
      },
      projections,
      tableauAmortissement,
      tableauAmortissementFiscal:
        genererTableauAmortissementFiscal(data, config, data.options.horizon_projection) ??
        undefined,
    };

    // Fusionner les alertes de validation avec celles des calculs (V2-S22)
    const toutesAlertes = [
      ...alertes,
      ...hcsf.alertes,
      ...(fiscalite.alertes ?? []),
      ...(synthese.points_attention_detail ?? [])
        .filter((p) => p.type === 'error' || p.type === 'warning')
        .map((p) => p.message),
    ];

    const uniqueAlertes = Array.from(new Set(toutesAlertes.filter(Boolean)));

    return {
      success: true,
      resultats,
      alertes: uniqueAlertes,
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
    logger.error('Erreur de calcul:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      code: 'CALCULATION_ERROR',
    };
  }
}
