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

import { ResolvedConfig } from '../config/config-types';
import type { FiscaliteCalculations, StructureData, RentabiliteCalculations, RegimeFiscal, BienData, ExploitationData, FinancementData, FiscaliteComparaison, DeficitFoncierDetail, PlusValueDetail, ModeAmortissement } from './types';
import {
  PART_TERRAIN_DEFAUT,
  DUREE_AMORTISSEMENT_BATI,
  DUREE_AMORTISSEMENT_MOBILIER,
  DUREE_AMORTISSEMENT_TRAVAUX,
  DATE_LOI_LE_MEUR,
} from './constants';



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
  tmi: number,
  config: ResolvedConfig
): FiscaliteDetail {
  const alertes: string[] = [];
  const PLAFOND = config.microFoncierPlafond;
  const ABATTEMENT = config.microFoncierAbattement;

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
  const prelevementsSociaux = baseImposable * config.tauxPsFoncier;
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
  config: ResolvedConfig,
  interetsAssurance: number = 0,
  deficitReportableEntrant: number = 0,
  renovationEnergetique: boolean = false,
  anneeTravaux?: number
): FiscaliteDetail {
  const alertes: string[] = [];
  let deficitFoncier: DeficitFoncierDetail | null = null;

  // Appliquer le déficit reportable des années précédentes
  let revenuApresReport = revenusBruts;
  let deficitConsomme = 0;
  if (deficitReportableEntrant > 0) {
    deficitConsomme = Math.min(deficitReportableEntrant, revenusBruts);
    revenuApresReport = revenusBruts - deficitConsomme;
    if (deficitConsomme > 0) {
      alertes.push(`Déficit foncier reporté consommé : ${round(deficitConsomme)}€`);
    }
  }

  // Calcul base imposable
  const baseImposable = Math.max(0, revenuApresReport - chargesDeductibles - interetsAssurance);

  // Calcul du déficit foncier (AUDIT-103)
  if (revenuApresReport < chargesDeductibles + interetsAssurance) {
    deficitFoncier = calculerDeficitFoncier(
      revenuApresReport,
      chargesDeductibles,
      interetsAssurance,
      tmi,
      config,
      renovationEnergetique,
      anneeTravaux
    );
    if (deficitFoncier) {
      alertes.push(
        `Déficit foncier : ${round(deficitFoncier.deficit_total)}€ (économie IR : ${round(deficitFoncier.economie_impot)}€, reportable : ${round(deficitFoncier.reportable)}€)`
      );
    }
  }

  // IR + Prélèvements sociaux (sur base imposable positive uniquement)
  const tauxTmi = tmi / 100;
  const impotRevenu = baseImposable * tauxTmi;
  const prelevementsSociaux = baseImposable * config.tauxPsFoncier;
  let impotTotal = impotRevenu + prelevementsSociaux;

  // L'économie du déficit foncier réduit uniquement l'IR (imputation sur revenu global, pas les PS)
  if (deficitFoncier) {
    const irReduit = Math.max(0, impotRevenu - deficitFoncier.economie_impot);
    impotTotal = irReduit + prelevementsSociaux;
  }

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
    deficit_foncier: deficitFoncier ?? undefined,
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
  config: ResolvedConfig,
  type_location: string = 'meublee_longue_duree'
): FiscaliteDetail {
  const alertes: string[] = [];

  // Détermination des seuils selon le type de location
  let plafond: number;
  let abattementRate: number;

  switch (type_location) {
    case 'meublee_tourisme_classe':
      plafond = config.microBicTourismeClassePlafond;
      abattementRate = config.microBicTourismeClasseAbattement;
      break;
    case 'meublee_tourisme_non_classe':
      plafond = config.microBicTourismeNonClassePlafond;
      abattementRate = config.microBicTourismeNonClasseAbattement;
      break;
    case 'meublee_longue_duree':
    default:
      plafond = config.microBicMeubleLongueDureePlafond;
      abattementRate = config.microBicMeubleLongueDureeAbattement;
      break;
  }

  const PLAFOND = plafond;
  const ABATTEMENT = abattementRate;

  // Vérification plafond
  if (revenusBruts > PLAFOND) {
    alertes.push(
      `Revenus (${round(revenusBruts)}€) > plafond micro-BIC (${PLAFOND}€). Le régime réel est obligatoire.`
    );
  }

  // Abattement
  const abattement = revenusBruts * ABATTEMENT;
  const baseImposable = revenusBruts - abattement;

  // IR + Prélèvements sociaux BIC LMNP (V2-S04 : 17.2% pour non-professionnels)
  const tauxTmi = tmi / 100;
  const impotRevenu = baseImposable * tauxTmi;
  const prelevementsSociaux = baseImposable * config.tauxPsRevenusBicLmnp;
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
  config: ResolvedConfig,
  montantTravaux: number = 0,
  valeurMobilier: number = 0,
  interetsAssurance: number = 0,
  partTerrain?: number,
  modeAmortissement: ModeAmortissement = 'simplifie',
  annee: number = 1,
  cfeAnnuelle: number = 0
): FiscaliteDetail {
  const alertes: string[] = [];

  // V2-S10 : Exonération CFE la 1ère année
  // Contrat : chargesDeductibles inclut la CFE théorique (hors exonération 1ère année).
  // cfeAnnuelle est la part de CFE incluse dans chargesDeductibles.
  // On utilise Math.min pour ne jamais retirer plus que ce qui est effectivement inclus,
  // évitant tout risque de double-exclusion si un appelant passe cfeAnnuelle > chargesDeductibles.
  let chargesRetenues = chargesDeductibles;
  if (annee === 1 && cfeAnnuelle > 0) {
    const cfeIncluseDansCharges = Math.min(cfeAnnuelle, chargesDeductibles);
    if (cfeIncluseDansCharges > 0) {
      chargesRetenues = chargesDeductibles - cfeIncluseDansCharges;
      alertes.push(`Exonération CFE 1ère année : -${Math.round(cfeIncluseDansCharges)}€ de charges déductibles`);
    }
  }

  const partTerrainEffective = partTerrain ?? PART_TERRAIN_DEFAUT; // Valeur par défaut si non spécifiée
  const valeurBati = prixAchat * (1 - partTerrainEffective);

  // 1. Amortissement immobilier selon le mode (AUDIT-104)
  let amortissementImmo: number;
  if (modeAmortissement === 'composants') {
    amortissementImmo = calculerAmortissementComposants(valeurBati, annee);
  } else {
    // Simplifié : linéaire sur 33 ans (standard)
    amortissementImmo = annee <= DUREE_AMORTISSEMENT_BATI
      ? valeurBati / DUREE_AMORTISSEMENT_BATI
      : 0;
  }

  // 2. Mobilier (durée fixe 10 ans)
  const amortissementMobilier = annee <= DUREE_AMORTISSEMENT_MOBILIER
    ? valeurMobilier / DUREE_AMORTISSEMENT_MOBILIER
    : 0;

  // 3. Travaux (durée fixe 15 ans)
  const amortissementTravaux = annee <= DUREE_AMORTISSEMENT_TRAVAUX
    ? montantTravaux / DUREE_AMORTISSEMENT_TRAVAUX
    : 0;

  const amortissementTotal = amortissementImmo + amortissementMobilier + amortissementTravaux;

  // Base imposable = revenus - charges - interets - amortissement
  // L'amortissement ne peut pas créer de déficit fiscal BIC
  const resultatAvantAmortissement = revenusBruts - chargesRetenues - interetsAssurance;
  const amortissementDeductible = Math.min(Math.max(0, resultatAvantAmortissement), amortissementTotal);
  const baseImposable = Math.max(0, resultatAvantAmortissement - amortissementDeductible);

  if (amortissementTotal > amortissementDeductible) {
    alertes.push(`Amortissement excédentaire reportable : ${round(amortissementTotal - amortissementDeductible)}€`);
  }

  const modeLabel = modeAmortissement === 'composants' ? ' (composants)' : '';
  alertes.push(
    `Amortissement annuel${modeLabel} : ${round(amortissementTotal)}€`
  );

  // IR + Prélèvements sociaux
  const tauxTmi = tmi / 100;
  const impotRevenu = baseImposable * tauxTmi;
  const prelevementsSociaux = baseImposable * config.tauxPsRevenusBicLmnp;
  const impotTotal = impotRevenu + prelevementsSociaux;

  const revenuNetApresImpot = revenusBruts - chargesRetenues - interetsAssurance - impotTotal;

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
  config: ResolvedConfig,
  interetsAssurance: number = 0,
  distribuerDividendes: boolean = false,
  partTerrain?: number,
  modeAmortissement: ModeAmortissement = 'simplifie',
  annee: number = 1
): FiscaliteDetail {
  const alertes: string[] = [];

  // Amortissement annuel (AUDIT-104 : mode simplifié ou composants)
  const partTerrainEffective = partTerrain ?? PART_TERRAIN_DEFAUT;
  const valeurBati = prixAchat * (1 - partTerrainEffective);

  let amortissementAnnuel: number;
  if (modeAmortissement === 'composants') {
    amortissementAnnuel = calculerAmortissementComposants(valeurBati, annee);
  } else {
    amortissementAnnuel = annee <= DUREE_AMORTISSEMENT_BATI
      ? valeurBati / DUREE_AMORTISSEMENT_BATI
      : 0;
  }

  // Base imposable = revenu net (exploitation) - intérêts/assurance - amortissement
  const baseImposable = Math.max(0, revenuNetAvantImpots - interetsAssurance - amortissementAnnuel);

  if (amortissementAnnuel + interetsAssurance > revenuNetAvantImpots) {
    alertes.push(
      `Déficit fiscal IS estimé : ${round(amortissementAnnuel + interetsAssurance - revenuNetAvantImpots)}€`
    );
  }

  // Calcul IS progressif
  let impotIs: number;
  const { isSeuilTauxReduit: SEUIL_TAUX_REDUIT, isTauxReduit: TAUX_REDUIT, isTauxNormal: TAUX_NORMAL } = config;

  if (baseImposable <= SEUIL_TAUX_REDUIT) {
    impotIs = baseImposable * TAUX_REDUIT;
  } else {
    impotIs =
      SEUIL_TAUX_REDUIT * TAUX_REDUIT +
      (baseImposable - SEUIL_TAUX_REDUIT) * TAUX_NORMAL;
  }

  const revenuNetApresIs = revenuNetAvantImpots - interetsAssurance - impotIs;

  // Gestion des dividendes et Flat Tax (S5.4)
  let dividendesBruts = 0;
  let flatTax = 0;
  let netEnPoche = revenuNetApresIs;

  if (distribuerDividendes && revenuNetApresIs > 0) {
    dividendesBruts = revenuNetApresIs;
    flatTax = dividendesBruts * (config.flatTax); // Flat tax dynamique
    netEnPoche = dividendesBruts - flatTax;
    alertes.push(`Distribution des dividendes activée (Flat Tax ${Math.round(config.flatTax * 100)}% : ${round(flatTax)}€)`);
  }

  return {
    regime: 'SCI à l\'IS',
    base_imposable: round(baseImposable),
    abattement: round(amortissementAnnuel),
    impot_revenu: round(impotIs),
    prelevements_sociaux: 0,
    impot_total: round(impotIs + flatTax),
    revenu_net_apres_impot: round(netEnPoche),
    dividendes_bruts: round(dividendesBruts),
    flat_tax: round(flatTax),
    net_en_poche: round(netEnPoche),
    rentabilite_nette_nette: 0,
    alertes,
  };
}

// ========================================================================
// AUDIT-103 : Déficit foncier
// ========================================================================

/**
 * Calcule le déficit foncier avec séparation hors intérêts / intérêts
 *
 * @ref docs/core/specification-calculs.md#53-déficit-foncier
 * @param revenusBruts - Loyer annuel brut
 * @param chargesHorsInterets - Charges déductibles hors intérêts d'emprunt
 * @param interetsAssurance - Intérêts + assurance du crédit
 * @param tmi - Taux marginal d'imposition (%)
 */
export function calculerDeficitFoncier(
  revenusBruts: number,
  chargesHorsInterets: number,
  interetsAssurance: number,
  tmi: number,
  config: ResolvedConfig,
  renovationEnergetique: boolean = false,
  anneeTravaux?: number
): DeficitFoncierDetail | null {
  const totalCharges = chargesHorsInterets + interetsAssurance;
  if (revenusBruts >= totalCharges) {
    return null; // Pas de déficit
  }

  const deficitTotal = totalCharges - revenusBruts;

  // Séparation : déficit hors intérêts vs lié aux intérêts
  const deficitHorsInterets = Math.max(0, chargesHorsInterets - revenusBruts);
  const deficitInterets = deficitTotal - deficitHorsInterets;

  // Imputation sur revenu global (max 10 700€, hors intérêts uniquement)
  // AUDIT-110 & V2-S15 : Plafond majoré (21 400€) si travaux énergétique (2023-2025)
  let plafond: number = config.deficitFoncierPlafondImputation;

  if (renovationEnergetique && anneeTravaux && anneeTravaux >= 2023 && anneeTravaux <= 2025) {
    plafond = config.deficitFoncierPlafondEnergie;
  }

  const imputationRevenuGlobal = Math.min(deficitHorsInterets, plafond);

  // Économie d'impôt = imputation × TMI (l'imputation réduit le revenu global)
  const economieImpot = imputationRevenuGlobal * (tmi / 100);

  // Reportable = tout le reste (y compris l'excès hors intérêts au-delà du plafond + intérêts)
  const reportable = deficitTotal - imputationRevenuGlobal;

  return {
    deficit_total: round(deficitTotal),
    deficit_hors_interets: round(deficitHorsInterets),
    deficit_interets: round(deficitInterets),
    imputable_revenu_global: round(imputationRevenuGlobal),
    economie_impot: round(economieImpot),
    reportable: round(reportable),
    duree_report: config.deficitFoncierDureeReport,
  };
}

// ========================================================================
// AUDIT-104 : Amortissement par composants
// ========================================================================

/**
 * Calcule l'amortissement par composants pour une année donnée
 * Chaque composant a sa propre durée : gros œuvre 50 ans, façade 25 ans, etc.
 *
 * @param valeurAmortissable - Valeur du bâti (hors terrain)
 * @param annee - Année courante (1-indexed)
 * @returns Amortissement total pour l'année
 */
export function calculerAmortissementComposants(
  valeurAmortissable: number,
  annee: number
): number {
  // Ces durées et parts sont fixes pour l'instant (normes comptables)
  const composants = {
    GROS_OEUVRE: { PART: 0.40, DUREE: 50 },
    FACADE_TOITURE: { PART: 0.20, DUREE: 25 },
    INSTALLATIONS: { PART: 0.20, DUREE: 15 },
    AGENCEMENTS: { PART: 0.20, DUREE: 10 },
  };
  let total = 0;

  // Gros œuvre
  if (annee <= composants.GROS_OEUVRE.DUREE) {
    total += valeurAmortissable * composants.GROS_OEUVRE.PART / composants.GROS_OEUVRE.DUREE;
  }
  // Façade / toiture
  if (annee <= composants.FACADE_TOITURE.DUREE) {
    total += valeurAmortissable * composants.FACADE_TOITURE.PART / composants.FACADE_TOITURE.DUREE;
  }
  // Installations techniques
  if (annee <= composants.INSTALLATIONS.DUREE) {
    total += valeurAmortissable * composants.INSTALLATIONS.PART / composants.INSTALLATIONS.DUREE;
  }
  // Agencements
  if (annee <= composants.AGENCEMENTS.DUREE) {
    total += valeurAmortissable * composants.AGENCEMENTS.PART / composants.AGENCEMENTS.DUREE;
  }

  return total;
}

// ========================================================================
// AUDIT-105 : Plus-value à la revente
// ========================================================================

/**
 * Calcule l'abattement IR pour durée de détention (plus-value immobilière)
 * Exonération totale après 22 ans
 */
export function abattementIR(dureeDetention: number): number {
  if (dureeDetention <= 5) return 0;
  if (dureeDetention <= 21) return (dureeDetention - 5) * 0.06;
  return 1; // Exonéré à partir de 22 ans
}

/**
 * Calcule l'abattement PS pour durée de détention (plus-value immobilière)
 * Exonération totale après 30 ans
 */
export function abattementPS(dureeDetention: number): number {
  if (dureeDetention <= 5) return 0;
  if (dureeDetention <= 21) return (dureeDetention - 5) * 0.0165;
  if (dureeDetention === 22) return 0.264 + 0.016; // = 28%
  if (dureeDetention <= 30) return 0.28 + (dureeDetention - 22) * 0.09;
  return 1; // Exonéré à partir de 30 ans
}

/**
 * Calcule la surtaxe sur plus-value > 50 000€ (V2-S03)
 * Barème progressif par tranches conformes BOFiP
 */
function calculerSurtaxePV(pvNetteIR: number, config: ResolvedConfig): number {
  if (pvNetteIR <= config.plusValueSeuilSurtaxe) return 0;

  let surtaxe = 0;
  // Le barème de surtaxe reste fixe dans le code car complexe (tranches)
  // Mais le seuil de déclenchement est dynamique.
  const BAREME_SURTAXE = [
    { MIN: 50001, MAX: 100000, TAUX: 0.02 },
    { MIN: 100001, MAX: 150000, TAUX: 0.03 },
    { MIN: 150001, MAX: 200000, TAUX: 0.04 },
    { MIN: 200001, MAX: 250000, TAUX: 0.06 },
    { MIN: 250001, MAX: Infinity, TAUX: 0.06 },
  ];

  for (const tranche of BAREME_SURTAXE) {
    if (pvNetteIR >= tranche.MIN) {
      const montantDansTranche = Math.max(0, Math.min(pvNetteIR, tranche.MAX) - tranche.MIN);
      surtaxe += montantDansTranche * tranche.TAUX;
    }
  }
  return surtaxe;
}

/**
 * Options LMNP pour le calcul de plus-value (V2-S05)
 */
export interface PlusValueLmnpOptions {
  /** Type de résidence : 'classique' ou 'services' */
  typeResidence?: 'classique' | 'services';
  /** Amortissements mobilier cumulés (exclus de la réintégration) */
  amortissementMobilierCumule?: number;
  /** Date de cession (pour application Loi Le Meur) */
  dateCession?: string; // Format ISO 'YYYY-MM-DD'
}

/**
 * Calcule la plus-value en nom propre (IR)
 * Applicable à la location nue et LMNP
 *
 * V2-S01 : Prix d'acquisition corrigé = prix × (1 + 7.5%) + travaux × (1 + 15%)
 * V2-S05 : Réintégration amortissements LMNP hors mobilier, exemption résidences de services
 *
 * @param prixVente - Prix de revente (valeur revalorisée)
 * @param prixAchat - Prix d'achat initial
 * @param dureeDetention - Durée de détention en années
 * @param amortissementsCumules - Amortissements immo cumulés (LMNP réintégration LF 2025)
 * @param montantTravaux - Montant des travaux (pour forfait 15%)
 * @param lmnpOptions - Options LMNP (V2-S05 : type résidence, mobilier, date cession)
 */
export function calculerPlusValueIR(
  prixVente: number,
  prixAchat: number,
  dureeDetention: number,
  config: ResolvedConfig,
  amortissementsCumules: number = 0,
  montantTravaux: number = 0,
  lmnpOptions?: PlusValueLmnpOptions
): PlusValueDetail {
  // V2-S01 : Prix d'acquisition corrigé avec forfaits
  const forfaitAcquisition = prixAchat * config.plusValueForfaitFraisAcquisition;
  // Règle PV : retenir le plus favorable entre montant réel et forfait 15% du prix d'achat (si détention > 5 ans)
  const travauxRetenus = dureeDetention > 5
    ? Math.max(montantTravaux, prixAchat * config.plusValueForfaitTravauxPv)
    : montantTravaux;

  const prixAcquisitionCorrige = prixAchat + forfaitAcquisition + travauxRetenus;

  // V2-S05 : Réintégration amortissements LMNP
  let amortissementsReintegres = amortissementsCumules;
  if (lmnpOptions) {
    const dateCession = lmnpOptions.dateCession ? new Date(lmnpOptions.dateCession) : new Date();
    const dateLoiLeMeur = new Date(DATE_LOI_LE_MEUR);

    // Résidences de services : exemptées si cession après date Loi Le Meur
    if (lmnpOptions.typeResidence === 'services' && dateCession >= dateLoiLeMeur) {
      amortissementsReintegres = 0;
    } else if (dateCession >= dateLoiLeMeur) {
      // Exclure amortissements mobilier de la réintégration
      amortissementsReintegres = Math.max(0, amortissementsCumules - (lmnpOptions.amortissementMobilierCumule || 0));
    }
  }

  // Plus-value brute
  const pvBrute = prixVente - prixAcquisitionCorrige + amortissementsReintegres;

  if (pvBrute <= 0) {
    return {
      prix_vente: round(prixVente),
      prix_achat: round(prixAchat),
      plus_value_brute: round(pvBrute),
      amortissements_reintegres: round(amortissementsReintegres),
      duree_detention: dureeDetention,
      abattement_ir: 0, abattement_ps: 0,
      plus_value_nette_ir: 0, plus_value_nette_ps: 0,
      impot_ir: 0, impot_ps: 0, surtaxe: 0, impot_total: 0,
      net_revente: round(prixVente),
    };
  }

  // Abattements pour durée de détention
  const abIR = abattementIR(dureeDetention);
  const abPS = abattementPS(dureeDetention);

  const pvNetteIR = pvBrute * (1 - abIR);
  const pvNettePS = pvBrute * (1 - abPS);

  const impotIR = pvNetteIR * config.plusValueTauxIr;
  const impotPS = pvNettePS * config.plusValueTauxPs;
  const surtaxe = calculerSurtaxePV(pvNetteIR, config);
  const impotTotal = impotIR + impotPS + surtaxe;

  return {
    prix_vente: round(prixVente),
    prix_achat: round(prixAchat),
    plus_value_brute: round(pvBrute),
    amortissements_reintegres: round(amortissementsReintegres),
    duree_detention: dureeDetention,
    abattement_ir: round(abIR * 100, 1),
    abattement_ps: round(abPS * 100, 1),
    plus_value_nette_ir: round(pvNetteIR),
    plus_value_nette_ps: round(pvNettePS),
    impot_ir: round(impotIR),
    impot_ps: round(impotPS),
    surtaxe: round(surtaxe),
    impot_total: round(impotTotal),
    net_revente: round(prixVente - impotTotal),
  };
}

/**
 * Calcule la plus-value en SCI à l'IS
 * PV = prix_vente - valeur_nette_comptable (VNC = prix_achat - amortissements_cumules)
 * Imposée à l'IS puis flat tax si distribution
 *
 * @param prixVente - Prix de revente
 * @param prixAchat - Prix d'achat initial
 * @param amortissementsCumules - Amortissements comptables cumulés
 * @param distribuer - Si les associés distribuent le produit de cession
 */
export function calculerPlusValueSciIs(
  prixVente: number,
  prixAchat: number,
  amortissementsCumules: number,
  config: ResolvedConfig,
  distribuer: boolean = false
): PlusValueDetail {
  const vnc = prixAchat - amortissementsCumules;
  const pvBrute = prixVente - vnc;

  if (pvBrute <= 0) {
    return {
      prix_vente: round(prixVente),
      prix_achat: round(prixAchat),
      plus_value_brute: round(pvBrute),
      amortissements_reintegres: round(amortissementsCumules),
      duree_detention: 0,
      abattement_ir: 0, abattement_ps: 0,
      plus_value_nette_ir: 0, plus_value_nette_ps: 0,
      impot_ir: 0, impot_ps: 0, surtaxe: 0, impot_total: 0,
      net_revente: round(prixVente),
    };
  }

  // IS progressif sur la PV
  const { isSeuilTauxReduit: SEUIL_TAUX_REDUIT, isTauxReduit: TAUX_REDUIT, isTauxNormal: TAUX_NORMAL } = config;
  let impotIS: number;
  if (pvBrute <= SEUIL_TAUX_REDUIT) {
    impotIS = pvBrute * TAUX_REDUIT;
  } else {
    impotIS = SEUIL_TAUX_REDUIT * TAUX_REDUIT + (pvBrute - SEUIL_TAUX_REDUIT) * TAUX_NORMAL;
  }

  // Flat tax si distribution aux associés
  let flatTax = 0;
  if (distribuer && pvBrute - impotIS > 0) {
    flatTax = (pvBrute - impotIS) * config.flatTax;
  }

  const impotTotal = impotIS + flatTax;

  return {
    prix_vente: round(prixVente),
    prix_achat: round(prixAchat),
    plus_value_brute: round(pvBrute),
    amortissements_reintegres: round(amortissementsCumules),
    duree_detention: 0,
    abattement_ir: 0,
    abattement_ps: 0,
    plus_value_nette_ir: round(pvBrute),
    plus_value_nette_ps: 0,
    impot_ir: round(impotIS),
    impot_ps: round(flatTax),
    surtaxe: 0,
    impot_total: round(impotTotal),
    net_revente: round(prixVente - impotTotal),
  };
}

/**
 * Calcule la fiscalité selon la structure et le régime choisi
 */
export function calculerFiscalite(
  structure: StructureData,
  rentabilite: RentabiliteCalculations,
  bien: BienData,
  exploitation: ExploitationData,
  config: ResolvedConfig
): FiscaliteCalculations {
  const revenusBruts = rentabilite.loyer_annuel;
  const chargesDeductibles = rentabilite.charges.total_charges_annuelles;
  const prixAchat = bien.prix_achat;

  // Estimation plus précise des intérêts Année 1 (Payer assurance + Intérêts calculés sur capital initial)
  const tauxInteret = (rentabilite.financement.taux_interet || 3.5) / 100;
  const interetsAnnuels = rentabilite.financement.montant_emprunt * tauxInteret;
  const assuranceAnnuelle = rentabilite.financement.mensualite_assurance * 12;
  const coutFinancierAn1 = interetsAnnuels + assuranceAnnuelle;

  const partTerrain = bien.part_terrain;

  const modeAmortissement = structure.mode_amortissement ?? 'simplifie';

  // SCI à l'IS
  if (structure.type === 'sci_is') {
    const result = calculerFiscaliteSciIs(
      rentabilite.revenu_net_avant_impots,
      prixAchat,
      config,
      coutFinancierAn1,
      structure.distribution_dividendes || false,
      partTerrain,
      modeAmortissement
    );

    const coutTotalAcquisition = rentabilite.financement.cout_total_acquisition;
    result.rentabilite_nette_nette = coutTotalAcquisition > 0
      ? ((rentabilite.revenu_net_avant_impots - result.impot_total) / coutTotalAcquisition) * 100
      : 0;
    return result;
  }

  // Nom propre - selon le régime fiscal
  const regime: RegimeFiscal = structure.regime_fiscal ?? 'micro_foncier';
  const tmi = structure.tmi ?? 30;

  let result: FiscaliteDetail;

  switch (regime) {
    case 'micro_foncier':
      result = calculerMicroFoncier(revenusBruts, tmi, config);
      break;
    case 'reel':
      result = calculerFoncierReel(
        revenusBruts,
        chargesDeductibles,
        tmi,
        config,
        coutFinancierAn1,
        0, // reportable
        bien.renovation_energetique,
        bien.annee_travaux
      );
      break;
    case 'lmnp_micro':
      result = calculerLmnpMicro(revenusBruts, tmi, config, exploitation.type_location);
      break;
    case 'lmnp_reel':
      // V2-S10 : Calcul CFE effective pour savoir quoi déduire (ou pas)
      const cfeEffective = (revenusBruts < config.cfeSeuilExoneration) ? 0 : (exploitation.cfe_estimee || 0);

      result = calculerLmnpReel(
        revenusBruts,
        chargesDeductibles,
        prixAchat,
        tmi,
        config,
        bien.montant_travaux,
        bien.valeur_mobilier,
        coutFinancierAn1,
        partTerrain,
        modeAmortissement,
        1, // annee = 1 par défaut dans calculerFiscalite simple
        cfeEffective
      );
      break;
    default:
      result = calculerMicroFoncier(revenusBruts, tmi, config);
  }

  // Calcul rentabilité nette-nette : (Revenus - Charges opex - Impôts) / Coût total acquisition
  const coutTotalAcquisition = rentabilite.financement.cout_total_acquisition;
  result.rentabilite_nette_nette = coutTotalAcquisition > 0
    ? ((rentabilite.revenu_net_avant_impots - result.impot_total) / coutTotalAcquisition) * 100
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
  rentabilite: RentabiliteCalculations,
  config: ResolvedConfig
): FiscaliteComparaison {
  const revenusBruts = rentabilite.loyer_annuel;
  const chargesDeductibles = rentabilite.charges.total_charges_annuelles;
  const prixAchat = input.bien.prix_achat;
  const tmi = input.structure.tmi ?? 30;

  // Estimation plus précise des intérêts Année 1
  const tauxInteret = (input.financement.taux_interet || 3.5) / 100;
  const interetsAnnuels = rentabilite.financement.montant_emprunt * tauxInteret;
  const assuranceAnnuelle = rentabilite.financement.mensualite_assurance * 12;
  const coutFinancierAn1 = interetsAnnuels + assuranceAnnuelle;

  const partTerrain = input.bien.part_terrain;
  const modeAmortissement = input.structure.mode_amortissement ?? 'simplifie';

  const resultatsRaw = [
    {
      id: 'micro_foncier',
      label: 'Location Nue (Micro-foncier)',
      calc: calculerMicroFoncier(revenusBruts, tmi, config),
      desc: 'Abattement forfaitaire de 30%. Idéal si vos charges sont faibles.',
      avantages: ['Simplicité administrative', 'Abattement de 30%'],
      inconvenients: ['Plafond de 15 000€', 'Pas de déduction des intérêts'],
    },
    {
      id: 'foncier_reel',
      label: 'Location Nue (Réel)',
      calc: calculerFoncierReel(revenusBruts, chargesDeductibles, tmi, config, coutFinancierAn1),
      desc: 'Déduction de toutes les charges réelles. Intéressant pour les gros travaux.',
      avantages: ['Déduction intégrale des charges', 'Gestion des déficits fonciers'],
      inconvenients: ['Complexité comptable', 'Pas d\'amortissement du bâti'],
    },
    {
      id: 'lmnp_micro',
      label: 'LMNP (Micro-BIC)',
      calc: calculerLmnpMicro(revenusBruts, tmi, config, input.exploitation.type_location),
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
        config,
        input.bien.montant_travaux,
        input.bien.valeur_mobilier,
        coutFinancierAn1,
        partTerrain,
        modeAmortissement
      ),
      desc: 'Le régime "ROI" grâce à l\'amortissement. Souvent zéro impôt pendant 10 ans.',
      avantages: ['Amortissement du bien', 'Gommer l\'imposition sur des années'],
      inconvenients: ['Obligation de bilan comptable', 'Spécificités LMNP/LMP'],
    },
    {
      id: 'sci_is',
      label: 'SCI à l\'IS (Capitalisation)',
      calc: calculerFiscaliteSciIs(
        rentabilite.revenu_net_avant_impots,
        prixAchat,
        config,
        coutFinancierAn1,
        false,
        partTerrain,
        modeAmortissement
      ),
      desc: 'Fiscalité de l\'entreprise. Idéal pour capitaliser et transmettre.',
      avantages: ['Taux IS réduit (15%)', 'Pas d\'IR immédiat sur les bénéfices'],
      inconvenients: ['Double imposition si sortie', 'Trésorerie bloquée dans la SCI'],
    },
    {
      id: 'sci_is_dividendes',
      label: 'SCI à l\'IS (Distribution)',
      calc: calculerFiscaliteSciIs(
        rentabilite.revenu_net_avant_impots,
        prixAchat,
        config,
        coutFinancierAn1,
        true,
        partTerrain,
        modeAmortissement
      ),
      desc: 'Distribution des bénéfices via Flat Tax. Pour générer des revenus immédiats.',
      avantages: ['Revenus disponibles immédiatement', 'Flat Tax de 30% libératoire'],
      inconvenients: ['Poids de la Flat Tax', 'Moins d\'effet de levier sur le capital'],
    },
  ];

  // Post-traitement pour calculer la rentabilité nette-nette de chaque régime
  const coutTotalAcquisitionComp = rentabilite.financement.cout_total_acquisition;
  const items = resultatsRaw.map(r => {
    const rentabiliteNetteNette = coutTotalAcquisitionComp > 0
      ? ((rentabilite.revenu_net_avant_impots - r.calc.impot_total) / coutTotalAcquisitionComp) * 100
      : 0;
    return {
      regime: r.label,
      impotAnnuelMoyen: r.calc.impot_total,
      cashflowNetMoyen: Math.round(rentabilite.cashflow_annuel - r.calc.impot_total),
      rentabiliteNetteNette: Math.round(rentabiliteNetteNette * 100) / 100,
      isOptimal: false,
      isSelected: r.id === input.structure.regime_fiscal || (r.id === 'sci_is' && input.structure.type === 'sci_is') || (r.id === 'foncier_reel' && input.structure.regime_fiscal === 'reel'),
      description: r.desc,
      avantages: r.avantages,
      inconvenients: r.inconvenients,
      dividendes_bruts: r.calc.dividendes_bruts,
      flat_tax: r.calc.flat_tax,
    };
  });

  // Trouver le meilleur cashflow net
  let bestIdx = 0;
  for (let i = 1; i < items.length; i++) {
    if (items[i].cashflowNetMoyen > items[bestIdx].cashflowNetMoyen) {
      bestIdx = i;
    }
  }
  items[bestIdx].isOptimal = true;

  const conseil = `Le régime ${items[bestIdx].regime} semble être le plus avantageux pour votre situation actuelle, avec un gain de cash-flow net optimisé.`;

  return { items, conseil };
}
