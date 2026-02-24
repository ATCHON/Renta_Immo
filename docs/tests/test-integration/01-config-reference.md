# Configuration de Référence — Paramètres Fiscaux 2026

> **Source DB :** `SELECT bloc, cle, valeur, label FROM config_params WHERE annee_fiscale = 2026 ORDER BY bloc, cle;`
> **Dernière synchronisation :** 2026-02-23
> **Snapshot utilisé dans :** `tests/integration/config/integration-config.ts`

## Bloc : fiscalite

| Clé DB                                   | Valeur         | Label                          | Référence légale                               |
| ---------------------------------------- | -------------- | ------------------------------ | ---------------------------------------------- |
| TAUX_PS_FONCIER                          | 0.172 (17,2 %) | PS sur revenus fonciers        | Historique — non modifié LFSS 2026             |
| TAUX_PS_REVENUS_BIC_LMNP                 | 0.186 (18,6 %) | PS sur revenus BIC LMNP        | **LFSS 2026** — CSG patrimoine +1,4 pt sur BIC |
| MICRO_FONCIER_ABATTEMENT                 | 0.30 (30 %)    | Abattement Micro-Foncier       | CGI Art.32                                     |
| MICRO_FONCIER_PLAFOND                    | 15 000 €       | Plafond Micro-Foncier          | CGI Art.32                                     |
| MICRO_BIC_MEUBLE_LONGUE_DUREE_ABATTEMENT | 0.50 (50 %)    | Abattement BIC Classique       | CGI Art.50-0                                   |
| MICRO_BIC_MEUBLE_LONGUE_DUREE_PLAFOND    | 77 700 €       | Plafond BIC Classique          | CGI Art.50-0                                   |
| MICRO_BIC_TOURISME_CLASSE_ABATTEMENT     | 0.71 (71 %)    | Abattement Tourisme Classé     | CGI Art.50-0 (LF 2024)                         |
| MICRO_BIC_TOURISME_CLASSE_PLAFOND        | 188 700 €      | Plafond Tourisme Classé        | CGI Art.50-0 (LF 2024)                         |
| MICRO_BIC_TOURISME_NON_CLASSE_ABATTEMENT | 0.30 (30 %)    | Abattement Tourisme Non Classé | CGI Art.50-0 (LF 2024)                         |
| MICRO_BIC_TOURISME_NON_CLASSE_PLAFOND    | 15 000 €       | Plafond Tourisme Non Classé    | CGI Art.50-0 (LF 2024)                         |
| IS_TAUX_REDUIT                           | 0.15 (15 %)    | Taux réduit IS                 | CGI Art.219 (LF 2023)                          |
| IS_TAUX_NORMAL                           | 0.25 (25 %)    | Taux normal IS                 | CGI Art.219                                    |
| IS_SEUIL_TAUX_REDUIT                     | 42 500 €       | Seuil taux réduit IS           | CGI Art.219 (LF 2023)                          |
| FLAT_TAX                                 | 0.30 (30 %)    | Flat Tax (PFU)                 | CGI Art.200A                                   |

## Bloc : foncier

| Clé DB                             | Valeur   | Label                                  | Référence légale                         |
| ---------------------------------- | -------- | -------------------------------------- | ---------------------------------------- |
| DEFICIT_FONCIER_PLAFOND_IMPUTATION | 10 700 € | Plafond imputation déficit foncier     | CGI Art.156 I-3°                         |
| DEFICIT_FONCIER_PLAFOND_ENERGIE    | 21 400 € | Plafond majoré déficit foncier énergie | CGI Art.156 (LF 2023, période 2023-2025) |
| DEFICIT_FONCIER_DUREE_REPORT       | 10 ans   | Durée report déficit foncier           | CGI Art.156 I-3°                         |

## Bloc : plus_value

| Clé DB                               | Valeur         | Label                                | Référence légale             |
| ------------------------------------ | -------------- | ------------------------------------ | ---------------------------- |
| PLUS_VALUE_TAUX_IR                   | 0.19 (19 %)    | Taux IR Plus-Value                   | CGI Art.150VC                |
| PLUS_VALUE_TAUX_PS                   | 0.172 (17,2 %) | Taux PS Plus-Value                   | CGI Art.150VC                |
| PLUS_VALUE_FORFAIT_FRAIS_ACQUISITION | 0.075 (7,5 %)  | Forfait frais acquisition            | BOFiP — forfait légal        |
| PLUS_VALUE_FORFAIT_TRAVAUX_PV        | 0.15 (15 %)    | Forfait travaux plus-value           | BOFiP — si détention > 5 ans |
| PLUS_VALUE_SEUIL_SURTAXE             | 50 000 €       | Seuil surtaxe plus-value immobilière | CGI Art.1609 nonies G        |

### Barème surtaxe PV (CGI Art.1609 nonies G)

| Tranche PV nette IR     | Taux    | Note                                               |
| ----------------------- | ------- | -------------------------------------------------- |
| 50 001 – 100 000 €      | 2 %     |                                                    |
| 100 001 – 150 000 €     | 3 %     |                                                    |
| 150 001 – 200 000 €     | 4 %     |                                                    |
| **200 001 – 250 000 €** | **5 %** | **NC-02 corrigée** (était 6 %, corrigé 2026-02-18) |
| > 250 000 €             | 6 %     |                                                    |

> **Impact correction NC-02 (revue-audit.md) :** L'écart maximal est de 500 € (1 % × 50 000 €) pour une PV nette exactement dans cette tranche — et non « jusqu'à 2 500 € » comme indiqué dans l'audit initial.

### Abattements PV pour durée de détention

**IR (CGI Art.150VC) :**

- 0 % pour les années 1 à 5
- 6 %/an pour les années 6 à 21 (soit 96 % à 21 ans)
- 4 % pour l'année 22 → **exonération totale IR à 22 ans**

**Prélèvements Sociaux (CGI Art.150VD) :**

- 0 % pour les années 1 à 5
- 1,65 %/an pour les années 6 à 21
- 1,60 % pour l'année 22
- 9 %/an pour les années 23 à 30
- **Exonération totale PS à 30 ans**

## Bloc : hcsf

| Clé DB                                | Valeur        | Label                                     | Référence légale                              |
| ------------------------------------- | ------------- | ----------------------------------------- | --------------------------------------------- |
| HCSF_TAUX_MAX                         | 0.35 (35 %)   | Taux endettement max HCSF                 | Décision HCSF 2024                            |
| HCSF_DUREE_MAX_ANNEES                 | 25 ans        | Durée max emprunt HCSF                    | Décision HCSF 2024                            |
| HCSF_DUREE_MAX_ANNEES_VEFA            | 27 ans        | Durée max crédit HCSF - VEFA              | Décision HCSF 2024 — dérogation VEFA (REC-04) |
| HCSF_PONDERATION_LOCATIFS             | 0.70 (70 %)   | Pondération revenus locatifs HCSF         | Décision HCSF 2024                            |
| HCSF_TAUX_REFERENCE_CAPACITE          | 0.035 (3,5 %) | Taux référence calcul capacité résiduelle | Paramètre interne REC-02                      |
| HCSF_DUREE_CAPACITE_RESIDUELLE_ANNEES | 20 ans        | Durée calcul capacité résiduelle          | Paramètre interne REC-02                      |

## Bloc : lmp_scoring

| Clé DB                      | Valeur       | Label                       | Référence légale                  |
| --------------------------- | ------------ | --------------------------- | --------------------------------- |
| LMP_SEUIL_ALERTE            | 20 000 €/an  | Seuil alerte LMP            | Paramètre interne                 |
| LMP_SEUIL_LMP               | 23 000 €/an  | Seuil passage statut LMP    | CGI Art.155 IV                    |
| RESTE_A_VIVRE_SEUIL_MIN     | 1 000 €/mois | Seuil reste-à-vivre minimal | Décision HCSF / pratique bancaire |
| RESTE_A_VIVRE_SEUIL_CONFORT | 2 500 €/mois | Seuil reste-à-vivre confort | Paramètre interne                 |

## Bloc : dpe

| Clé DB        | Valeur       | Label                 | Référence légale                  |
| ------------- | ------------ | --------------------- | --------------------------------- |
| DECOTE_DPE_FG | 0.15 (−15 %) | Décote valeur DPE F/G | Loi Climat-Résilience L.2021-1104 |
| DECOTE_DPE_E  | 0.05 (−5 %)  | Décote valeur DPE E   | Loi Climat-Résilience L.2021-1104 |

## Bloc : projections

| Clé DB                         | Valeur           | Label                          |
| ------------------------------ | ---------------- | ------------------------------ |
| PROJECTION_INFLATION_LOYER     | 0.015 (1,5 %/an) | Inflation loyers par défaut    |
| PROJECTION_INFLATION_CHARGES   | 0.02 (2 %/an)    | Inflation charges par défaut   |
| PROJECTION_REVALORISATION_BIEN | 0.01 (1 %/an)    | Revalorisation bien par défaut |

## Bloc : charges

| Clé DB                           | Valeur                | Label                             |
| -------------------------------- | --------------------- | --------------------------------- |
| DEFAULTS_ASSURANCE_PNO           | 150 €                 | Défaut assurance PNO annuel       |
| DEFAULTS_CHARGES_COPRO_M2        | 30 €/m²/an            | Défaut charges copro / m² / an    |
| DEFAULTS_TAXE_FONCIERES_MOIS     | 0.10 (10 % loyer)     | Défaut taxe foncière (% loyer)    |
| DEFAULTS_FRAIS_DOSSIER_BANQUE    | 500 €                 | Défaut frais dossier banque       |
| DEFAULTS_FRAIS_GARANTIE_CREDIT   | 0.012 (1,2 %)         | Défaut frais garantie crédit      |
| DEFAULTS_COMPTABLE_ANNUEL        | 400 €                 | Défaut frais comptable annuel     |
| DEFAULTS_CFE_MIN                 | 150 €                 | Défaut CFE minimum                |
| CFE_SEUIL_EXONERATION            | 5 000 €/an            | Seuil exonération CFE (CA)        |
| NOTAIRE_TAUX_ANCIEN              | 0.08 (8 %)            | Frais notaire estimatifs ancien   |
| NOTAIRE_TAUX_NEUF                | 0.025 (2,5 %)         | Frais notaire estimatifs neuf     |
| NOTAIRE_DMTO_TAUX_STANDARD       | 0.0580665 (5,80665 %) | DMTO taux standard                |
| NOTAIRE_CSI_TAUX                 | 0.001 (0,1 %)         | Contribution sécurité immobilière |
| NOTAIRE_DEBOURS_FORFAIT          | 800 €                 | Débours forfaitaires notaire      |
| FRAIS_REVENTE_TAUX_AGENCE_DEFAUT | 0.05 (5 %)            | Défaut frais agence à la revente  |
| FRAIS_REVENTE_DIAGNOSTICS        | 500 €                 | Défaut frais diagnostics revente  |
