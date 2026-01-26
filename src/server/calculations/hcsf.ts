/**
 * Module d'analyse HCSF
 * Calcule la conformité aux règles du Haut Conseil de Stabilité Financière
 *
 * Règles HCSF (2024) :
 * - Taux d'endettement maximum : 35%
 * - Durée de crédit maximum : 25 ans
 * - Calcul des revenus locatifs pondérés à 70%
 */

import type {
  StructureData,
  AssocieData,
  HCSFCalculations,
  HCSFAssocie,
  FinancementCalculations,
} from './types';
import { SEUILS } from './types';

/**
 * Coefficient de pondération des revenus locatifs
 */
const COEF_REVENUS_LOCATIFS = 0.7;

/**
 * Calcule le taux d'endettement HCSF pour un investisseur en nom propre
 *
 * Note: Dans cette version simplifiée, nous utilisons les données de l'associé
 * principal si disponibles, sinon une estimation basée sur le loyer.
 */
function calculerHCSFNomPropre(
  structure: StructureData,
  financement: FinancementCalculations,
  loyerMensuel: number
): HCSFCalculations {
  const alertes: string[] = [];

  // Si des associés sont définis (même en nom propre pour les données personnelles)
  // On prend le premier associé comme investisseur principal
  const investisseur = structure.associes[0];

  let revenus_mensuels: number;
  let charges_mensuelles: number;

  if (investisseur) {
    // Revenus = salaire + autres revenus + (loyers existants + nouveau loyer) * 70%
    const revenus_locatifs_ponderes = loyerMensuel * COEF_REVENUS_LOCATIFS;
    revenus_mensuels = investisseur.revenus + revenus_locatifs_ponderes;

    // Charges = mensualités existantes + nouvelle mensualité + autres charges
    charges_mensuelles =
      investisseur.mensualites +
      financement.mensualite_totale +
      investisseur.charges;
  } else {
    // Estimation par défaut si pas d'investisseur défini
    // Hypothèse : revenus = 3x la mensualité (ratio standard bancaire)
    revenus_mensuels = financement.mensualite_totale * 3 + loyerMensuel * COEF_REVENUS_LOCATIFS;
    charges_mensuelles = financement.mensualite_totale;
  }

  // Calcul du taux d'endettement
  const taux_endettement = revenus_mensuels > 0
    ? (charges_mensuelles / revenus_mensuels) * 100
    : 100;

  const conforme = taux_endettement <= SEUILS.TAUX_ENDETTEMENT_MAX;

  // Alertes
  if (taux_endettement > SEUILS.TAUX_ENDETTEMENT_MAX) {
    alertes.push(
      `Taux d'endettement HCSF : ${round(taux_endettement, 1)}% (> ${SEUILS.TAUX_ENDETTEMENT_MAX}%)`
    );
  } else if (taux_endettement > SEUILS.TAUX_ENDETTEMENT_ALERTE) {
    alertes.push(
      `Taux d'endettement proche du seuil : ${round(taux_endettement, 1)}%`
    );
  }

  // Détail de l'investisseur
  const details_associes: HCSFAssocie[] = investisseur
    ? [
        {
          nom: investisseur.nom || 'Investisseur principal',
          pourcentage_parts: 100,
          revenus_mensuels: round(revenus_mensuels),
          charges_mensuelles: round(charges_mensuelles),
          part_mensualite: round(financement.mensualite_totale),
          taux_endettement: round(taux_endettement, 1),
          conforme,
        },
      ]
    : [];

  return {
    structure: 'nom_propre',
    taux_endettement: round(taux_endettement, 1),
    conforme,
    details_associes,
    alertes,
  };
}

/**
 * Calcule le taux d'endettement HCSF pour une SCI IS
 *
 * Pour une SCI, le taux d'endettement est calculé pour chaque associé
 * en fonction de sa quote-part dans la SCI.
 */
function calculerHCSFSciIs(
  structure: StructureData,
  financement: FinancementCalculations,
  loyerMensuel: number
): HCSFCalculations {
  const alertes: string[] = [];
  const details_associes: HCSFAssocie[] = [];

  if (structure.associes.length === 0) {
    return {
      structure: 'sci_is',
      taux_endettement: 0,
      conforme: false,
      details_associes: [],
      alertes: ['ERREUR: SCI sans associés configurés'],
    };
  }

  let tous_conformes = true;
  let taux_max = 0;
  const associes_non_conformes: string[] = [];

  for (const associe of structure.associes) {
    const result = calculerHCSFAssocie(
      associe,
      financement.mensualite_totale,
      loyerMensuel
    );

    details_associes.push(result);

    if (!result.conforme) {
      tous_conformes = false;
      associes_non_conformes.push(result.nom);
    }

    if (result.taux_endettement > taux_max) {
      taux_max = result.taux_endettement;
    }
  }

  // Alertes
  if (!tous_conformes) {
    alertes.push(
      `Associés non conformes HCSF : ${associes_non_conformes.join(', ')}`
    );
  }

  // Ratio de couverture SCI (loyers / mensualité)
  const ratio_couverture = financement.mensualite_totale > 0
    ? (loyerMensuel / financement.mensualite_totale) * 100
    : 0;

  if (ratio_couverture < SEUILS.RATIO_COUVERTURE_SCI_MIN) {
    alertes.push(
      `Ratio de couverture SCI : ${round(ratio_couverture, 1)}% (< ${SEUILS.RATIO_COUVERTURE_SCI_MIN}%)`
    );
  }

  return {
    structure: 'sci_is',
    taux_endettement: round(taux_max, 1),
    conforme: tous_conformes,
    details_associes,
    alertes,
  };
}

/**
 * Calcule le taux d'endettement HCSF pour un associé SCI
 */
function calculerHCSFAssocie(
  associe: AssocieData,
  mensualiteTotale: number,
  loyerMensuel: number
): HCSFAssocie {
  // Quote-part de la mensualité selon les parts
  const part_mensualite = (associe.parts / 100) * mensualiteTotale;

  // Quote-part des revenus locatifs (pondérés à 70%)
  const revenus_locatifs_ponderes = (associe.parts / 100) * loyerMensuel * COEF_REVENUS_LOCATIFS;

  // Revenus totaux de l'associé
  const revenus_mensuels = associe.revenus + revenus_locatifs_ponderes;

  // Charges totales (mensualités existantes + quote-part nouvelle + autres charges)
  const charges_mensuelles =
    associe.mensualites + part_mensualite + associe.charges;

  // Taux d'endettement
  const taux_endettement = revenus_mensuels > 0
    ? (charges_mensuelles / revenus_mensuels) * 100
    : 100;

  const conforme = taux_endettement <= SEUILS.TAUX_ENDETTEMENT_MAX;

  return {
    nom: associe.nom,
    pourcentage_parts: associe.parts,
    revenus_mensuels: round(revenus_mensuels),
    charges_mensuelles: round(charges_mensuelles),
    part_mensualite: round(part_mensualite),
    taux_endettement: round(taux_endettement, 1),
    conforme,
  };
}

/**
 * Point d'entrée principal : calcule l'analyse HCSF selon la structure
 */
export function analyserHCSF(
  structure: StructureData,
  financement: FinancementCalculations,
  loyerMensuel: number
): HCSFCalculations {
  if (structure.type === 'sci_is') {
    return calculerHCSFSciIs(structure, financement, loyerMensuel);
  }

  return calculerHCSFNomPropre(structure, financement, loyerMensuel);
}

/**
 * Arrondit un nombre à un nombre de décimales
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
