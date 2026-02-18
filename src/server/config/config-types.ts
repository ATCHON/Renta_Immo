// src/server/config/config-types.ts

export type ConfigBloc =
    | 'fiscalite'
    | 'foncier'
    | 'plus_value'
    | 'hcsf'
    | 'dpe'
    | 'lmp_scoring'
    | 'charges'
    | 'projections';

export interface ConfigParam {
    id: string;
    anneeFiscale: number;
    bloc: ConfigBloc;
    cle: string;
    valeur: number;
    unite: 'decimal' | 'euros' | 'annees' | 'pourcentage';
    label: string;
    description?: string;
    isTemporary: boolean;
    dateExpiration?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ConfigParamAudit {
    id: string;
    configId: string;
    anneeFiscale: number;
    bloc: string;
    cle: string;
    ancienneValeur: number;
    nouvelleValeur: number;
    modifiePar: string;
    modifieLe: string;
    motif?: string;
}

// Mapping des clés BDD (SCREAMING_SNAKE_CASE) vers les propriétés ResolvedConfig (camelCase)
export const CLE_TO_FIELD: Record<string, keyof ResolvedConfig> = {
    TAUX_PS_FONCIER: 'tauxPsFoncier',
    TAUX_PS_REVENUS_BIC_LMNP: 'tauxPsRevenusBicLmnp',
    MICRO_FONCIER_ABATTEMENT: 'microFoncierAbattement',
    MICRO_FONCIER_PLAFOND: 'microFoncierPlafond',
    MICRO_BIC_MEUBLE_LONGUE_DUREE_ABATTEMENT: 'microBicMeubleLongueDureeAbattement',
    MICRO_BIC_MEUBLE_LONGUE_DUREE_PLAFOND: 'microBicMeubleLongueDureePlafond',
    MICRO_BIC_TOURISME_CLASSE_ABATTEMENT: 'microBicTourismeClasseAbattement',
    MICRO_BIC_TOURISME_CLASSE_PLAFOND: 'microBicTourismeClassePlafond',
    MICRO_BIC_TOURISME_NON_CLASSE_ABATTEMENT: 'microBicTourismeNonClasseAbattement',
    MICRO_BIC_TOURISME_NON_CLASSE_PLAFOND: 'microBicTourismeNonClassePlafond',
    IS_TAUX_REDUIT: 'isTauxReduit',
    IS_TAUX_NORMAL: 'isTauxNormal',
    IS_SEUIL_TAUX_REDUIT: 'isSeuilTauxReduit',
    FLAT_TAX: 'flatTax',
    DEFICIT_FONCIER_PLAFOND_IMPUTATION: 'deficitFoncierPlafondImputation',
    DEFICIT_FONCIER_PLAFOND_ENERGIE: 'deficitFoncierPlafondEnergie',
    DEFICIT_FONCIER_DUREE_REPORT: 'deficitFoncierDureeReport',
    PLUS_VALUE_TAUX_IR: 'plusValueTauxIr',
    PLUS_VALUE_TAUX_PS: 'plusValueTauxPs',
    PLUS_VALUE_FORFAIT_FRAIS_ACQUISITION: 'plusValueForfaitFraisAcquisition',
    PLUS_VALUE_FORFAIT_TRAVAUX_PV: 'plusValueForfaitTravauxPv',
    PLUS_VALUE_SEUIL_SURTAXE: 'plusValueSeuilSurtaxe',
    HCSF_TAUX_MAX: 'hcsfTauxMax',
    HCSF_DUREE_MAX_ANNEES: 'hcsfDureeMaxAnnees',
    HCSF_PONDERATION_LOCATIFS: 'hcsfPonderationLocatifs',
    DECOTE_DPE_FG: 'decoteDpeFg',
    DECOTE_DPE_E: 'decoteDpeE',
    LMP_SEUIL_ALERTE: 'lmpSeuilAlerte',
    LMP_SEUIL_LMP: 'lmpSeuilLmp',
    RESTE_A_VIVRE_SEUIL_MIN: 'resteAVivreSeuilMin',
    RESTE_A_VIVRE_SEUIL_CONFORT: 'resteAVivreSeuilConfort',
    DEFAULTS_ASSURANCE_PNO: 'defaultsAssurancePno',
    DEFAULTS_CHARGES_COPRO_M2: 'defaultsChargesCoproM2',
    DEFAULTS_TAXE_FONCIERES_MOIS: 'defaultsTaxeFoncieresMois',
    DEFAULTS_FRAIS_DOSSIER_BANQUE: 'defaultsFraisDossierBanque',
    DEFAULTS_FRAIS_GARANTIE_CREDIT: 'defaultsFraisGarantieCredit',
    DEFAULTS_COMPTABLE_ANNUEL: 'defaultsComptableLmnp',
    DEFAULTS_CFE_MIN: 'defaultsCfeMin',
    CFE_SEUIL_EXONERATION: 'cfeSeuilExoneration',
    FRAIS_REVENTE_TAUX_AGENCE_DEFAUT: 'fraisReventeTauxAgenceDefaut',
    FRAIS_REVENTE_DIAGNOSTICS: 'fraisReventeDiagnostics',
    NOTAIRE_TAUX_ANCIEN: 'notaireTauxAncien',
    NOTAIRE_TAUX_NEUF: 'notaireTauxNeuf',
    PROJECTION_INFLATION_LOYER: 'projectionInflationLoyer',
    PROJECTION_INFLATION_CHARGES: 'projectionInflationCharges',
    PROJECTION_REVALORISATION_BIEN: 'projectionRevalorisation',
};

// Structure plate résultante pour le moteur de calcul
export interface ResolvedConfig {
    anneeFiscale: number;
    // Fiscalité
    tauxPsFoncier: number;
    tauxPsRevenusBicLmnp: number;
    microFoncierAbattement: number;
    microFoncierPlafond: number;
    microBicMeubleLongueDureeAbattement: number;
    microBicMeubleLongueDureePlafond: number;
    microBicTourismeClasseAbattement: number;
    microBicTourismeClassePlafond: number;
    microBicTourismeNonClasseAbattement: number;
    microBicTourismeNonClassePlafond: number;
    isTauxReduit: number;
    isTauxNormal: number;
    isSeuilTauxReduit: number;
    flatTax: number;
    // Foncier
    deficitFoncierPlafondImputation: number;
    deficitFoncierPlafondEnergie: number;
    deficitFoncierDureeReport: number;
    // Plus-value
    plusValueTauxIr: number;
    plusValueTauxPs: number;
    plusValueForfaitFraisAcquisition: number;
    plusValueForfaitTravauxPv: number;
    plusValueSeuilSurtaxe: number;
    // HCSF
    hcsfTauxMax: number;
    hcsfDureeMaxAnnees: number;
    hcsfPonderationLocatifs: number;
    // DPE
    decoteDpeFg: number;
    decoteDpeE: number;
    // LMP / Scoring
    lmpSeuilAlerte: number;
    lmpSeuilLmp: number;
    resteAVivreSeuilMin: number;
    resteAVivreSeuilConfort: number;
    // Charges
    defaultsAssurancePno: number;
    defaultsChargesCoproM2: number;
    defaultsTaxeFoncieresMois: number;
    defaultsFraisDossierBanque: number;
    defaultsFraisGarantieCredit: number;
    defaultsComptableLmnp: number;
    defaultsCfeMin: number;
    cfeSeuilExoneration: number;
    fraisReventeTauxAgenceDefaut: number;
    fraisReventeDiagnostics: number;
    notaireTauxAncien: number;
    notaireTauxNeuf: number;
    // Projections
    projectionInflationLoyer: number;
    projectionInflationCharges: number;
    projectionRevalorisation: number;
    projectionDecoteDpeFg: number;
    projectionDecoteDpeE: number;
}
