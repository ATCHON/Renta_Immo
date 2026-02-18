/**
 * Configuration de test pour les calculs
 * Permet d'éviter l'appel à Supabase dans les tests unitaires
 */

import type { ResolvedConfig } from '@/server/config/config-types';

/**
 * Configuration par défaut pour les tests
 * Utilise les valeurs du fallback de ConfigService
 */
export const TEST_CONFIG: ResolvedConfig = {
  anneeFiscale: 2026,
  // A - Fiscalité
  tauxPsFoncier: 0.172,
  tauxPsRevenusBicLmnp: 0.172,
  microFoncierAbattement: 0.3,
  microFoncierPlafond: 15000,
  microBicMeubleLongueDureeAbattement: 0.5,
  microBicMeubleLongueDureePlafond: 77700,
  microBicTourismeClasseAbattement: 0.71,
  microBicTourismeClassePlafond: 188700,
  microBicTourismeNonClasseAbattement: 0.3,
  microBicTourismeNonClassePlafond: 15000,
  isTauxReduit: 0.15,
  isTauxNormal: 0.25,
  isSeuilTauxReduit: 42500,
  flatTax: 0.3,
  // B - Foncier
  deficitFoncierPlafondImputation: 10700,
  deficitFoncierPlafondEnergie: 21400,
  deficitFoncierDureeReport: 10,
  // C - Plus-value
  plusValueTauxIr: 0.19,
  plusValueTauxPs: 0.172,
  plusValueForfaitFraisAcquisition: 0.075,
  plusValueForfaitTravauxPv: 0.15,
  plusValueSeuilSurtaxe: 50000,
  // D - HCSF
  hcsfTauxMax: 0.35,
  hcsfDureeMaxAnnees: 25,
  hcsfPonderationLocatifs: 0.7,
  hcsfTauxReferenceCapacite: 0.035,
  hcsfDureeCapaciteResiduelleAnnees: 20,
  hcsfDureeMaxAnneesVefa: 27,
  // E - DPE
  decoteDpeFg: 0.15,
  decoteDpeE: 0.05,
  // F - Scoring / LMP
  lmpSeuilAlerte: 20000,
  lmpSeuilLmp: 23000,
  resteAVivreSeuilMin: 1000,
  resteAVivreSeuilConfort: 2500,
  // G - Charges
  defaultsAssurancePno: 150,
  defaultsChargesCoproM2: 30,
  defaultsTaxeFoncieresMois: 0.1,
  defaultsFraisDossierBanque: 500,
  defaultsFraisGarantieCredit: 0.012,
  defaultsComptableLmnp: 400,
  defaultsCfeMin: 150,
  cfeSeuilExoneration: 5000,
  fraisReventeTauxAgenceDefaut: 0.05,
  fraisReventeDiagnostics: 500,
  notaireTauxAncien: 0.08,
  notaireTauxNeuf: 0.025,
  notaireDmtoTauxStandard: 0.0580665,
  notaireCsiTaux: 0.001,
  notaireDeboursForfait: 800,
  // H - Projections
  projectionInflationLoyer: 0.015,
  projectionInflationCharges: 0.02,
  projectionRevalorisation: 0.01,
  projectionDecoteDpeFg: 0.15,
  projectionDecoteDpeE: 0.05,
};
