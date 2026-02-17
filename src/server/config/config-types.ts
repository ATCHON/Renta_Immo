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
