/**
 * Module de calcul de fiscalité
 * Calcule l'imposition selon le régime (IR nom propre ou IS pour SCI)
 *
 * Régimes supportés :
 * - Micro-foncier : abattement 30%, plafond 15 000€
 * - Foncier réel : charges réelles déductibles
 * - LMNP Micro-BIC : abattement 50%, plafond 77 700€
 * - LMNP Réel : charges + amortissement (simplifié)
 * - SCI IS : 15% puis 25% + amortissement
 */

import { CONSTANTS } from '@/config/constants';
import type { FiscaliteCalculations, StructureData, RentabiliteCalculations, RegimeFiscal, BienData, ExploitationData, FinancementData } from './types';

// Re-export pour compatibilité
export const PRELEVEMENTS_SOCIAUX = CONSTANTS.FISCALITE.PRELEVEMENTS_SOCIAUX_FONCIER;
export const TAUX_IS = {
  TAUX_REDUIT: CONSTANTS.FISCALITE.IS.TAUX_REDUIT,
  TAUX_NORMAL: CONSTANTS.FISCALITE.IS.TAUX_NORMAL,
  SEUIL: CONSTANTS.FISCALITE.IS.SEUIL_TAUX_REDUIT,
} as const;



/**
 * Détail du calcul fiscal étendu
 */
export interface FiscaliteDetail extends FiscaliteCalculations {
  /** Abattement appliqué */
  abattement: number;
  /** Alertes fiscales */
  alertes: string[];
}

/**
 * Calcule la fiscalité en régime micro-foncier
 * Abattement forfaitaire de 30% sur les revenus bruts
 *
 * @ref docs/core/specification-calculs.md#52-régime-micro-foncier-location-nue
 * @param revenusBruts - Loyer annuel brut
 * @param tmi - Taux marginal d'imposition
 */
export function calculerMicroFoncier(
  revenusBruts: number,
  tmi: number
): FiscaliteDetail {
  const alertes: string[] = [];
  const { PLAFOND, ABATTEMENT } = CONSTANTS.FISCALITE.MICRO_FONCIER;

  // Vérification plafond
  if (revenusBruts > PLAFOND) {
    alertes.push(
      `Revenus (${round(revenusBruts)}€) > plafond micro-foncier (${PLAFOND}€). Le régime réel est obligatoire.`
    );
  }

  // Abattement 30%
  const abattement = revenusBruts * ABATTEMENT;
  const baseImposable = revenusBruts - abattement;

  // IR + Prélèvements sociaux
  const tauxTmi = tmi / 100;
  const impotRevenu = baseImposable * tauxTmi;
  const prelevementsSociaux = baseImposable * CONSTANTS.FISCALITE.PRELEVEMENTS_SOCIAUX_FONCIER;
  const impotTotal = impotRevenu + prelevementsSociaux;

  const revenuNetApresImpot = revenusBruts - impotTotal;

  return {
    regime: `Micro-foncier (TMI ${tmi}%)`,
    base_imposable: round(baseImposable),
    abattement: round(abattement),
    impot_revenu: round(impotRevenu),
    prelevements_sociaux: round(prelevementsSociaux),
    impot_total: round(impotTotal),
    revenu_net_apres_impot: round(revenuNetApresImpot),
    rentabilite_nette_nette: 0,
    alertes,
  };
}

/**
 * Calcule la fiscalité en régime foncier réel
 * Déduction des charges réelles
 *
 * @ref docs/core/specification-calculs.md#53-régime-foncier-réel-location-nue
 * @param revenusBruts - Loyer annuel brut
 */
export function calculerFoncierReel(
  revenusBruts: number,
  chargesDeductibles: number,
  tmi: number,
  interetsAssurance: number = 0
): FiscaliteDetail {
  const alertes: string[] = [];

  // Calcul base imposable (incluant les frais financiers)
  const baseImposable = Math.max(0, revenusBruts - chargesDeductibles - interetsAssurance);

  // Déficit foncier (non géré en MVP)
  if (revenusBruts < chargesDeductibles + interetsAssurance) {
    alertes.push(
      `Déficit foncier de ${round(chargesDeductibles + interetsAssurance - revenusBruts)}€ (imputable sur le revenu global jusqu'à 10 700€/an)`
    );
  }

  // IR + Prélèvements sociaux
  const tauxTmi = tmi / 100;
  const impotRevenu = baseImposable * tauxTmi;
  const prelevementsSociaux = baseImposable * CONSTANTS.FISCALITE.PRELEVEMENTS_SOCIAUX_FONCIER;
  const impotTotal = impotRevenu + prelevementsSociaux;

  const revenuNetApresImpot = revenusBruts - chargesDeductibles - interetsAssurance - impotTotal;

  return {
    regime: `Foncier réel (TMI ${tmi}%)`,
    base_imposable: round(baseImposable),
    abattement: 0,
    impot_revenu: round(impotRevenu),
    prelevements_sociaux: round(prelevementsSociaux),
    impot_total: round(impotTotal),
    revenu_net_apres_impot: round(revenuNetApresImpot),
    rentabilite_nette_nette: 0,
    alertes,
  };
}

/**
 * Calcule la fiscalité en régime LMNP Micro-BIC
 * Abattement forfaitaire de 50% ou 30% selon le type de location
 *
 * @ref docs/core/specification-calculs.md#54-régime-lmnp-micro-bic-corrigé
 * @param revenusBruts - Loyer annuel brut
 */
export function calculerLmnpMicro(
  revenusBruts: number,
  tmi: number,
  type_location: string = 'meublee_longue_duree'
): FiscaliteDetail {
  const alertes: string[] = [];

  // Détermination des seuils selon le type de location
  const isNonClasse = type_location === 'meublee_tourisme_non_classe';
  const config = isNonClasse ? CONSTANTS.FISCALITE.MICRO_BIC.NON_CLASSE : CONSTANTS.FISCALITE.MICRO_BIC.STANDARD;
  const { PLAFOND, ABATTEMENT } = config;

  // Vérification plafond
  if (revenusBruts > PLAFOND) {
    alertes.push(
      `Revenus (${round(revenusBruts)}€) > plafond micro-BIC (${PLAFOND}€). Le régime réel est obligatoire.`
    );
  }

  // Abattement
  const abattement = revenusBruts * ABATTEMENT;
  const baseImposable = revenusBruts - abattement;

  // IR + Prélèvements sociaux (18.6% pour 2025)
  const tauxTmi = tmi / 100;
  const impotRevenu = baseImposable * tauxTmi;
  const prelevementsSociaux = baseImposable * CONSTANTS.FISCALITE.PRELEVEMENTS_SOCIAUX_LMNP;
  const impotTotal = impotRevenu + prelevementsSociaux;

  const revenuNetApresImpot = revenusBruts - impotTotal;

  return {
    regime: `LMNP Micro-BIC (${formatPourcent(ABATTEMENT)} abattement)`,
    base_imposable: round(baseImposable),
    abattement: round(abattement),
    impot_revenu: round(impotRevenu),
    prelevements_sociaux: round(prelevementsSociaux),
    impot_total: round(impotTotal),
    revenu_net_apres_impot: round(revenuNetApresImpot),
    rentabilite_nette_nette: 0,
    alertes,
  };
}

/**
 * Calcule la fiscalité en régime LMNP Réel simplifié
 * Déduction des charges + amortissement estimé
 *
 * @ref docs/core/specification-calculs.md#55-régime-lmnp-réel-enrichi
 * @param revenusBruts - Loyer annuel brut
 */
export function calculerLmnpReel(
  revenusBruts: number,
  chargesDeductibles: number,
  prixAchat: number,
  tmi: number,
  montantTravaux: number = 0,
  valeurMobilier: number = 0,
  interetsAssurance: number = 0
): FiscaliteDetail {
  const alertes: string[] = [];

  // Amortissement simplifié
  // 1. Immobilier
  const valeurBati = prixAchat * CONSTANTS.AMORTISSEMENT.PART_BATI;
  const amortissementImmo = valeurBati / CONSTANTS.AMORTISSEMENT.DUREE_BATI;

  // 2. Mobilier
  const amortissementMobilier = valeurMobilier / CONSTANTS.AMORTISSEMENT.DUREE_MOBILIER;

  // 3. Travaux
  const amortissementTravaux = montantTravaux / CONSTANTS.AMORTISSEMENT.DUREE_TRAVAUX;

  const amortissementTotal = amortissementImmo + amortissementMobilier + amortissementTravaux;

  // Base imposable = revenus - charges - interets - amortissement
  // L'amortissement ne peut pas créer de déficit fiscal BIC
  // Mais les charges et intérêts peuvent créer un déficit BIC reportable
  const resultatAvantAmortissement = revenusBruts - chargesDeductibles - interetsAssurance;
  const amortissementDeductible = Math.min(Math.max(0, resultatAvantAmortissement), amortissementTotal);
  const baseImposable = Math.max(0, resultatAvantAmortissement - amortissementDeductible);

  if (amortissementTotal > amortissementDeductible) {
    alertes.push(`Amortissement excédentaire reportable : ${round(amortissementTotal - amortissementDeductible)}€`);
  }

  alertes.push(
    `Amortissement annuel : ${round(amortissementTotal)}€`
  );

  // IR + Prélèvements sociaux
  const tauxTmi = tmi / 100;
  const impotRevenu = baseImposable * tauxTmi;
  const prelevementsSociaux = baseImposable * CONSTANTS.FISCALITE.PRELEVEMENTS_SOCIAUX_LMNP;
  const impotTotal = impotRevenu + prelevementsSociaux;

  const revenuNetApresImpot = revenusBruts - chargesDeductibles - interetsAssurance - impotTotal;

  return {
    regime: `LMNP Réel (TMI ${tmi}%)`,
    base_imposable: round(baseImposable),
    abattement: round(amortissementDeductible),
    impot_revenu: round(impotRevenu),
    prelevements_sociaux: round(prelevementsSociaux),
    impot_total: round(impotTotal),
    revenu_net_apres_impot: round(revenuNetApresImpot),
    rentabilite_nette_nette: 0,
    alertes,
  };
}

/**
 * Calcule l'impôt pour le régime SCI à l'IS
 *
 * @ref docs/core/specification-calculs.md#56-régime-sci-à-lis-enrichi
 * @param revenuNetAvantImpots - Revenu net avant impôts (loyers - charges d'exploitation)
 */
export function calculerFiscaliteSciIs(
  revenuNetAvantImpots: number,
  prixAchat: number,
  interetsAssurance: number = 0
): FiscaliteDetail {
  const alertes: string[] = [];

  // Amortissement annuel (linéaire simplifié)
  const valeurBati = prixAchat * CONSTANTS.AMORTISSEMENT.PART_BATI;
  const amortissementAnnuel = valeurBati / CONSTANTS.AMORTISSEMENT.DUREE_BATI;

  // Base imposable = revenu net (exploitation) - intérêts/assurance - amortissement
  // Ici revenuNetAvantImpots contient déjà (Loyers - Charges Exploitation)
  const baseImposable = Math.max(0, revenuNetAvantImpots - interetsAssurance - amortissementAnnuel);

  if (amortissementAnnuel + interetsAssurance > revenuNetAvantImpots) {
    alertes.push(
      `Déficit fiscal IS estimé : ${round(amortissementAnnuel + interetsAssurance - revenuNetAvantImpots)}€`
    );
  }

  // Calcul IS progressif
  let impotIs: number;
  const { SEUIL_TAUX_REDUIT, TAUX_REDUIT, TAUX_NORMAL } = CONSTANTS.FISCALITE.IS;

  if (baseImposable <= SEUIL_TAUX_REDUIT) {
    impotIs = baseImposable * TAUX_REDUIT;
  } else {
    impotIs =
      SEUIL_TAUX_REDUIT * TAUX_REDUIT +
      (baseImposable - SEUIL_TAUX_REDUIT) * TAUX_NORMAL;
  }

  const revenuNetApresImpot = revenuNetAvantImpots - interetsAssurance - impotIs;

  return {
    regime: 'SCI à l\'IS',
    base_imposable: round(baseImposable),
    abattement: round(amortissementAnnuel),
    impot_revenu: round(impotIs),
    prelevements_sociaux: 0,
    impot_total: round(impotIs),
    revenu_net_apres_impot: round(revenuNetApresImpot),
    rentabilite_nette_nette: 0,
    alertes,
  };
}

/**
 * Calcule la fiscalité selon la structure et le régime choisi
 */
export function calculerFiscalite(
  structure: StructureData,
  rentabilite: RentabiliteCalculations,
  bien: BienData,
  exploitation: ExploitationData
): FiscaliteCalculations {
  const revenusBruts = rentabilite.loyer_annuel;
  const chargesDeductibles = rentabilite.charges.total_charges_annuelles;
  const prixAchat = bien.prix_achat;

  // Extraction des frais financiers depuis le module rentabilité
  const interetsAssurance = (rentabilite.financement.mensualite_totale * 12) - (rentabilite.loyer_annuel - rentabilite.cashflow_annuel - rentabilite.charges.total_charges_annuelles);
  // Plus simple : Mensualité Totale * 12 - (Remboursement Principal Annuel)
  // Mais ici on n'a pas encore le tableau d'amortissement dans l'objet rentabilite de base.
  // Cependant, on sait que Revenu_Net_Avant_Impôts - Remboursement_Annuel = Cashflow_Annuel
  // Donc Remboursement_Annuel = Revenu_Net_Avant_Impôts - Cashflow_Annuel.
  const remboursement_annuel = rentabilite.revenu_net_avant_impots - rentabilite.cashflow_annuel;

  // SCI à l'IS
  if (structure.type === 'sci_is') {
    const result = calculerFiscaliteSciIs(
      rentabilite.revenu_net_avant_impots,
      prixAchat,
      remboursement_annuel // On déduit le remboursement annuel total (intérêts + assurance, le principal n'est pas déductible en IS mais l'amortissement l'est)
    );
    // Note Correction Audit : En réalité, seul les intérêts et assurances sont déductibles.
    // Mais ici 'remboursement_annuel' contient (Intérêts + Assurances + Principal).
    // Or dans SCI IS, on déduit Intérêts + Assurances + AMORTISSEMENT.
    // Pour être exact, il nous faut le détail. Utilisons une estimation simple pour l'audit.
    // @ts-ignore
    const coutTotalInteretsAnnuels = rentabilite.financement.mensualite_totale * 12 * 0.7; // Estimation 70% d'intérêts en début de prêt

    // Simplifions en utilisant les données de rentabilite.financement
    const resultCorrige = calculerFiscaliteSciIs(
      rentabilite.revenu_net_avant_impots,
      prixAchat,
      rentabilite.financement.mensualite_assurance * 12 + rentabilite.financement.mensualite_credit * 12 * 0.6 // Estimation
    );

    resultCorrige.rentabilite_nette_nette = prixAchat > 0
      ? (resultCorrige.revenu_net_apres_impot / prixAchat) * 100
      : 0;
    return resultCorrige;
  }

  // Nom propre - selon le régime fiscal
  const regime: RegimeFiscal = structure.regime_fiscal ?? 'micro_foncier';
  const tmi = structure.tmi ?? 30;
  const coutFinancier = rentabilite.financement.mensualite_assurance * 12 + rentabilite.financement.mensualite_credit * 12 * 0.6; // Estimation

  let result: FiscaliteDetail;

  switch (regime) {
    case 'micro_foncier':
      result = calculerMicroFoncier(revenusBruts, tmi);
      break;
    case 'reel':
      result = calculerFoncierReel(revenusBruts, chargesDeductibles, tmi, coutFinancier);
      break;
    case 'lmnp_micro':
      result = calculerLmnpMicro(revenusBruts, tmi, exploitation.type_location);
      break;
    case 'lmnp_reel':
      result = calculerLmnpReel(
        revenusBruts,
        chargesDeductibles,
        prixAchat,
        tmi,
        bien.montant_travaux,
        bien.valeur_mobilier,
        coutFinancier
      );
      break;
    default:
      result = calculerMicroFoncier(revenusBruts, tmi);
  }

  // Calcul rentabilité nette-nette
  result.rentabilite_nette_nette = prixAchat > 0
    ? (result.revenu_net_apres_impot / prixAchat) * 100
    : 0;

  return result;
}

/**
 * Arrondit un nombre à un nombre de décimales
 */
function round(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Formate un nombre en pourcentage
 */
function formatPourcent(valeur: number): string {
  return `${Math.round(valeur * 100)}%`;
}

/**
 * Orchestre la comparaison entre les 5 régimes fiscaux principaux
 */
export function calculerToutesFiscalites(
  input: {
    bien: BienData;
    financement: FinancementData;
    exploitation: ExploitationData;
    structure: StructureData;
  },
  rentabilite: RentabiliteCalculations
): { items: any[]; conseil: string } {
  const revenusBruts = rentabilite.loyer_annuel;
  const chargesDeductibles = rentabilite.charges.total_charges_annuelles;
  const prixAchat = input.bien.prix_achat;
  const tmi = input.structure.tmi || 30;

  // Estimation simplifiée intérêts + assurance (Année 1)
  const coutFinancier = (rentabilite.financement.mensualite_assurance + (rentabilite.financement.mensualite_credit * 0.7)) * 12;

  const resultatsRaw = [
    {
      id: 'micro_foncier',
      label: 'Location Nue (Micro-foncier)',
      calc: calculerMicroFoncier(revenusBruts, tmi),
      desc: 'Abattement forfaitaire de 30%. Idéal si vos charges sont faibles.',
      avantages: ['Simplicité administrative', 'Abattement de 30%'],
      inconvenients: ['Plafond de 15 000€', 'Pas de déduction des intérêts'],
    },
    {
      id: 'foncier_reel',
      label: 'Location Nue (Réel)',
      calc: calculerFoncierReel(revenusBruts, chargesDeductibles, tmi, coutFinancier),
      desc: 'Déduction de toutes les charges réelles. Intéressant pour les gros travaux.',
      avantages: ['Déduction intégrale des charges', 'Gestion des déficits fonciers'],
      inconvenients: ['Complexité comptable', 'Pas d\'amortissement du bâti'],
    },
    {
      id: 'lmnp_micro',
      label: 'LMNP (Micro-BIC)',
      calc: calculerLmnpMicro(revenusBruts, tmi, input.exploitation.type_location),
      desc: 'Abattement de 50%. Très avantageux pour les petites surfaces.',
      avantages: ['Abattement de 50%', 'Gestion simplifiée'],
      inconvenients: ['Plafond de 77 700€', 'Soumis aux prélèvements sociaux'],
    },
    {
      id: 'lmnp_reel',
      label: 'LMNP (Réel)',
      calc: calculerLmnpReel(
        revenusBruts,
        chargesDeductibles,
        prixAchat,
        tmi,
        input.bien.montant_travaux,
        input.bien.valeur_mobilier,
        coutFinancier
      ),
      desc: 'Le régime "ROI" grâce à l\'amortissement. Souvent zéro impôt pendant 10 ans.',
      avantages: ['Amortissement du bien', 'Gommer l\'imposition sur des années'],
      inconvenients: ['Obligation de bilan comptable', 'Spécificités LMNP/LMP'],
    },
    {
      id: 'sci_is',
      label: 'SCI à l\'IS',
      calc: calculerFiscaliteSciIs(
        rentabilite.revenu_net_avant_impots,
        prixAchat,
        coutFinancier
      ),
      desc: 'Fiscalité de l\'entreprise. Idéal pour capitaliser et transmettre.',
      avantages: ['Taux IS réduit (15%)', 'Pilotage de la fiscalité (dividendes)'],
      inconvenients: ['Double imposition si sortie', 'Plus-value calculée sur VNC'],
    },
  ];

  // Post-traitement pour calculer la rentabilité nette-nette de chaque régime
  const items = resultatsRaw.map(r => {
    const rentabiliteNetteNette = prixAchat > 0 ? (r.calc.revenu_net_apres_impot / prixAchat) * 100 : 0;
    return {
      regime: r.label,
      impotAnnuelMoyen: r.calc.impot_total,
      cashflowNetMoyen: r.calc.revenu_net_apres_impot - (rentabilite.financement.mensualite_totale * 12) + r.calc.impot_total, // On recalcule le cashflow net réel
      // Note : revenu_net_apres_impot dans fiscalite.ts est (Revenus - Charges - Impots). 
      // Pour le cashflow net, il faut faire (Revenus - Charges - Mensualités - Impots).
      cashflowNetReel: r.calc.revenu_net_apres_impot - (rentabilite.financement.mensualite_totale * 12 - coutFinancier),
      // En fait simplifions : Cashflow Brut (connu) - Impôt régime spécifique
      cashflowNetSimple: rentabilite.cashflow_annuel - r.calc.impot_total,
      rentabiliteNetteNette: Math.round(rentabiliteNetteNette * 100) / 100,
      isOptimal: false,
      isSelected: r.id === input.structure.regime_fiscal || (r.id === 'sci_is' && input.structure.type === 'sci_is') || (r.id === 'foncier_reel' && input.structure.regime_fiscal === 'reel'),
      description: r.desc,
      avantages: r.avantages,
      inconvenients: r.inconvenients,
    };
  });

  // Trouver le meilleur cashflow net
  let bestIdx = 0;
  for (let i = 1; i < items.length; i++) {
    if (items[i].cashflowNetSimple > items[bestIdx].cashflowNetSimple) {
      bestIdx = i;
    }
  }
  items[bestIdx].isOptimal = true;

  const conseil = `Le régime ${items[bestIdx].regime} semble être le plus avantageux pour votre situation actuelle, avec un gain de cash-flow net optimisé.`;

  return { items, conseil };
}
