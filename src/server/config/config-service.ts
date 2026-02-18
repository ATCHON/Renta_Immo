// src/server/config/config-service.ts

import { createAdminClient } from '@/lib/supabase/server';
import type { ResolvedConfig, DbConfigParamRow } from './config-types';
import { CLE_TO_FIELD } from './config-types';

interface CacheEntry {
  data: ResolvedConfig;
  fetchedAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<number, CacheEntry>();

export class ConfigService {
  private static instance: ConfigService;

  static getInstance(): ConfigService {
    if (!ConfigService.instance) ConfigService.instance = new ConfigService();
    return ConfigService.instance;
  }

  async getConfig(anneeFiscale?: number): Promise<ResolvedConfig> {
    const year = anneeFiscale ?? new Date().getFullYear();
    const cached = cache.get(year);

    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.data;
    }

    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('config_params')
      .select('*')
      .eq('annee_fiscale', year);

    if (error || !data?.length) {
      // Fallback sur les constantes hardcodées si la DB est vide ou en cas d'erreur
      const fallbackConfig = this.getFallbackConfig(year);
      cache.set(year, { data: fallbackConfig, fetchedAt: Date.now() });
      return fallbackConfig;
    }

    const resolved = this.mapToResolvedConfig(year, data as DbConfigParamRow[]);
    cache.set(year, { data: resolved, fetchedAt: Date.now() });
    return resolved;
  }

  invalidateCache(year?: number): void {
    if (year) cache.delete(year);
    else cache.clear();
  }

  private mapToResolvedConfig(year: number, params: DbConfigParamRow[]): ResolvedConfig {
    const get = (cle: string): number => {
      const p = params.find((p) => p.cle === cle);
      if (!p) {
        // Si un paramètre manque en BDD, on tente de récupérer sa valeur par défaut
        console.warn(
          `Paramètre manquant en BDD : ${cle} (année ${year}). Utilisation du fallback.`
        );
        return this.getFallbackValue(cle, year);
      }
      return Number(p.valeur);
    };

    return {
      anneeFiscale: year,
      // A - Fiscalité
      tauxPsFoncier: get('TAUX_PS_FONCIER'),
      tauxPsRevenusBicLmnp: get('TAUX_PS_REVENUS_BIC_LMNP'),
      microFoncierAbattement: get('MICRO_FONCIER_ABATTEMENT'),
      microFoncierPlafond: get('MICRO_FONCIER_PLAFOND'),
      microBicMeubleLongueDureeAbattement: get('MICRO_BIC_MEUBLE_LONGUE_DUREE_ABATTEMENT'),
      microBicMeubleLongueDureePlafond: get('MICRO_BIC_MEUBLE_LONGUE_DUREE_PLAFOND'),
      microBicTourismeClasseAbattement: get('MICRO_BIC_TOURISME_CLASSE_ABATTEMENT'),
      microBicTourismeClassePlafond: get('MICRO_BIC_TOURISME_CLASSE_PLAFOND'),
      microBicTourismeNonClasseAbattement: get('MICRO_BIC_TOURISME_NON_CLASSE_ABATTEMENT'),
      microBicTourismeNonClassePlafond: get('MICRO_BIC_TOURISME_NON_CLASSE_PLAFOND'),
      isTauxReduit: get('IS_TAUX_REDUIT'),
      isTauxNormal: get('IS_TAUX_NORMAL'),
      isSeuilTauxReduit: get('IS_SEUIL_TAUX_REDUIT'),
      flatTax: get('FLAT_TAX'),
      // B - Foncier
      deficitFoncierPlafondImputation: get('DEFICIT_FONCIER_PLAFOND_IMPUTATION'),
      deficitFoncierPlafondEnergie: get('DEFICIT_FONCIER_PLAFOND_ENERGIE'),
      deficitFoncierDureeReport: get('DEFICIT_FONCIER_DUREE_REPORT'),
      // C - Plus-value
      plusValueTauxIr: get('PLUS_VALUE_TAUX_IR'),
      plusValueTauxPs: get('PLUS_VALUE_TAUX_PS'),
      plusValueForfaitFraisAcquisition: get('PLUS_VALUE_FORFAIT_FRAIS_ACQUISITION'),
      plusValueForfaitTravauxPv: get('PLUS_VALUE_FORFAIT_TRAVAUX_PV'),
      plusValueSeuilSurtaxe: get('PLUS_VALUE_SEUIL_SURTAXE'),
      // D - HCSF
      hcsfTauxMax: get('HCSF_TAUX_MAX'),
      hcsfDureeMaxAnnees: get('HCSF_DUREE_MAX_ANNEES'),
      hcsfPonderationLocatifs: get('HCSF_PONDERATION_LOCATIFS'),
      hcsfTauxReferenceCapacite: get('HCSF_TAUX_REFERENCE_CAPACITE'),
      hcsfDureeCapaciteResiduelleAnnees: get('HCSF_DUREE_CAPACITE_RESIDUELLE_ANNEES'),
      hcsfDureeMaxAnneesVefa: get('HCSF_DUREE_MAX_ANNEES_VEFA'),
      // E - DPE
      decoteDpeFg: get('DECOTE_DPE_FG'),
      decoteDpeE: get('DECOTE_DPE_E'),
      // F - Scoring / LMP
      lmpSeuilAlerte: get('LMP_SEUIL_ALERTE'),
      lmpSeuilLmp: get('LMP_SEUIL_LMP'),
      resteAVivreSeuilMin: get('RESTE_A_VIVRE_SEUIL_MIN'),
      resteAVivreSeuilConfort: get('RESTE_A_VIVRE_SEUIL_CONFORT'),
      // G - Charges
      defaultsAssurancePno: get('DEFAULTS_ASSURANCE_PNO'),
      defaultsChargesCoproM2: get('DEFAULTS_CHARGES_COPRO_M2'),
      defaultsTaxeFoncieresMois: get('DEFAULTS_TAXE_FONCIERES_MOIS'),
      defaultsFraisDossierBanque: get('DEFAULTS_FRAIS_DOSSIER_BANQUE'),
      defaultsFraisGarantieCredit: get('DEFAULTS_FRAIS_GARANTIE_CREDIT'),
      defaultsComptableLmnp: get('DEFAULTS_COMPTABLE_ANNUEL'),
      defaultsCfeMin: get('DEFAULTS_CFE_MIN'),
      cfeSeuilExoneration: get('CFE_SEUIL_EXONERATION'),
      fraisReventeTauxAgenceDefaut: get('FRAIS_REVENTE_TAUX_AGENCE_DEFAUT'),
      fraisReventeDiagnostics: get('FRAIS_REVENTE_DIAGNOSTICS'),
      notaireTauxAncien: get('NOTAIRE_TAUX_ANCIEN'),
      notaireTauxNeuf: get('NOTAIRE_TAUX_NEUF'),
      notaireDmtoTauxStandard: get('NOTAIRE_DMTO_TAUX_STANDARD'),
      notaireCsiTaux: get('NOTAIRE_CSI_TAUX'),
      notaireDeboursForfait: get('NOTAIRE_DEBOURS_FORFAIT'),
      // H - Projections
      projectionInflationLoyer: get('PROJECTION_INFLATION_LOYER'),
      projectionInflationCharges: get('PROJECTION_INFLATION_CHARGES'),
      projectionRevalorisation: get('PROJECTION_REVALORISATION_BIEN'),
      projectionDecoteDpeFg: get('DECOTE_DPE_FG'), // Réutilise la même clé pour les projections
      projectionDecoteDpeE: get('DECOTE_DPE_E'),
    };
  }

  private getFallbackConfig(year: number): ResolvedConfig {
    return {
      anneeFiscale: year,
      // Utilisation des valeurs codées en dur pour le fallback global
      tauxPsFoncier: 0.172,
      tauxPsRevenusBicLmnp: 0.186,
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
      deficitFoncierPlafondImputation: 10700,
      deficitFoncierPlafondEnergie: 21400,
      deficitFoncierDureeReport: 10,
      plusValueTauxIr: 0.19,
      plusValueTauxPs: 0.172,
      plusValueForfaitFraisAcquisition: 0.075,
      plusValueForfaitTravauxPv: 0.15,
      plusValueSeuilSurtaxe: 50000,
      hcsfTauxMax: 0.35,
      hcsfDureeMaxAnnees: 25,
      hcsfPonderationLocatifs: 0.7,
      hcsfTauxReferenceCapacite: 0.035,
      hcsfDureeCapaciteResiduelleAnnees: 20,
      hcsfDureeMaxAnneesVefa: 27,
      decoteDpeFg: 0.15,
      decoteDpeE: 0.05,
      lmpSeuilAlerte: 20000,
      lmpSeuilLmp: 23000,
      resteAVivreSeuilMin: 1000,
      resteAVivreSeuilConfort: 2500,
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
      projectionInflationLoyer: 0.015,
      projectionInflationCharges: 0.02,
      projectionRevalorisation: 0.01,
      projectionDecoteDpeFg: 0.15,
      projectionDecoteDpeE: 0.05,
    };
  }

  private getFallbackValue(cle: string, year: number): number {
    const config = this.getFallbackConfig(year);
    const field = CLE_TO_FIELD[cle];
    return field ? (config[field] as number) : 0;
  }
}

export const configService = ConfigService.getInstance();
