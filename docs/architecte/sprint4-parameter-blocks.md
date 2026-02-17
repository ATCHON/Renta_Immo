# Documentation des Blocs de Paramètres (Sprint 4)

Cette section documente les 8 blocs thématiques de paramètres configurables en base de données.

## Bloc A : Fiscalité (`fiscalite`)
Regroupe les taux et plafonds liés aux régimes fiscaux (LMNP, Micro-Foncier, IS).
- `TAUX_PS_FONCIER`
- `TAUX_PS_REVENUS_BIC_LMNP`
- `MICRO_FONCIER_ABATTEMENT` / `PLAFOND`
- `MICRO_BIC_MEUBLE_LONGUE_DUREE_ABATTEMENT` / `PLAFOND`
- `MICRO_BIC_TOURISME_CLASSE_ABATTEMENT` / `PLAFOND`
- `MICRO_BIC_TOURISME_NON_CLASSE_ABATTEMENT` / `PLAFOND`
- `IS_TAUX_REDUIT` / `NORMAL` / `SEUIL`
- `FLAT_TAX`

## Bloc B : Foncier (`foncier`)
Paramètres liés au déficit foncier.
- `DEFICIT_FONCIER_PLAFOND_IMPUTATION`
- `DEFICIT_FONCIER_PLAFOND_ENERGIE` (Temporaire)
- `DEFICIT_FONCIER_DUREE_REPORT`

## Bloc C : Plus-Value (`plus_value`)
Taux et abattements forfaitaires pour le calcul de la plus-value immobilière.
- `PLUS_VALUE_TAUX_IR`
- `PLUS_VALUE_TAUX_PS`
- `PLUS_VALUE_FORFAIT_FRAIS_ACQUISITION`
- `PLUS_VALUE_FORFAIT_TRAVAUX_PV`
- `PLUS_VALUE_SEUIL_SURTAXE`

## Bloc D : HCSF (`hcsf`)
Normes bancaires du Haut Conseil de Stabilité Financière.
- `HCSF_TAUX_MAX`
- `HCSF_DUREE_MAX_ANNEES`
- `HCSF_PONDERATION_LOCATIFS`

## Bloc E : DPE (`dpe`)
Impact de la performance énergétique sur la valeur du bien.
- `DECOTE_DPE_FG`
- `DECOTE_DPE_E`

## Bloc F : Scoring / LMP (`lmp_scoring`)
Seuils liés au statut LMP et indicateurs de confort (Reste-à-vivre).
- `LMP_SEUIL_ALERTE`
- `LMP_SEUIL_LMP`
- `RESTE_A_VIVRE_SEUIL_MIN`
- `RESTE_A_VIVRE_SEUIL_CONFORT`

## Bloc G : Charges (`charges`)
Valeurs par défaut pour les frais d'acquisition et d'exploitation.
- `DEFAULTS_ASSURANCE_PNO`
- `DEFAULTS_CHARGES_COPRO_M2`
- `DEFAULTS_TAXE_FONCIERES_MOIS`
- `DEFAULTS_FRAIS_DOSSIER_BANQUE`
- `DEFAULTS_FRAIS_GARANTIE_CREDIT`
- `DEFAULTS_COMPTABLE_ANNUEL`
- `DEFAULTS_CFE_MIN`
- `CFE_SEUIL_EXONERATION`
- `FRAIS_REVENTE_TAUX_AGENCE_DEFAUT`
- `FRAIS_REVENTE_DIAGNOSTICS`
- `NOTAIRE_TAUX_ANCIEN`
- `NOTAIRE_TAUX_NEUF`

## Bloc H : Projections (`projections`)
Hypothèses d'inflation et de revalorisation capitaliste.
- `PROJECTION_INFLATION_LOYER`
- `PROJECTION_INFLATION_CHARGES`
- `PROJECTION_REVALORISATION_BIEN`
