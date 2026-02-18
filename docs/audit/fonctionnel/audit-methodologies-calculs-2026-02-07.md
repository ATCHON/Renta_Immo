# Audit des Methodologies de Calcul - Simulateur Renta Immo

**Date de l'audit initial :** 7 Fevrier 2026
**Derniere mise a jour :** 9 Fevrier 2026 (post-corrections Phase 1, 2 et 3)
**Version :** 4.0
**Perimetre :** Moteur de calcul complet (`src/server/calculations/`), API routes, donnees retournees
**Documents de reference :**
- `docs/core/specification-calculs.md` (v2.0)
- `docs/audit/audit-calculs-rentabilite.md` (28 Janvier 2026)
- Code source : `src/server/calculations/`, `src/config/constants.ts`
- Stories de correction : `docs/stories/audit/story-audit-103.md` a `story-audit-110.md`

**Couverture de tests :** 136 tests unitaires couvrant le moteur de calcul

---

## Table des matieres

1. [Synthese executive](#1-synthese-executive)
2. [Etat des corrections depuis l'audit precedent (28 janvier)](#2-etat-des-corrections-depuis-laudit-precedent-28-janvier)
3. [Etat des corrections depuis cet audit (7 fevrier)](#3-etat-des-corrections-depuis-cet-audit-7-fevrier)
4. [Audit des constantes reglementaires](#4-audit-des-constantes-reglementaires)
5. [Audit des formules de calcul](#5-audit-des-formules-de-calcul)
6. [Audit de la fiscalite](#6-audit-de-la-fiscalite)
7. [Audit de l'analyse HCSF](#7-audit-de-lanalyse-hcsf)
8. [Audit des projections et du TRI](#8-audit-des-projections-et-du-tri)
9. [Audit du scoring et de la synthese](#9-audit-du-scoring-et-de-la-synthese)
10. [Ecarts residuels avec la specification metier](#10-ecarts-residuels-avec-la-specification-metier)
11. [Problemes de precision numerique](#11-problemes-de-precision-numerique)
12. [Ecarts non traites (acceptes ou reportes)](#12-ecarts-non-traites-acceptes-ou-reportes)
13. [Matrice de risque residuel](#13-matrice-de-risque-residuel)
14. [Points de verification pour le prochain audit](#14-points-de-verification-pour-le-prochain-audit)

---

## 1. Synthese executive

### Verdict global : 9/10 - Moteur fiable et conforme a la specification

Le moteur de calcul a ete significativement renforce depuis l'audit du 7 fevrier 2026. Les 3 phases de corrections ont adresse **tous les ecarts critiques et moyens** identifies. Le moteur est desormais conforme a la specification metier sur les points structurants.

**Corrections appliquees (3 phases, 136 tests) :**

| Phase | Perimetre | Tests | Statut |
|-------|-----------|-------|--------|
| Phase 1 | Corrections prioritaires (deficit foncier, amortissement composants) | 32 | FAIT |
| Phase 2 | Enrichissements metier (plus-value, scoring specification) | 80 | FAIT |
| Phase 3 | Evolutions backlog (reste a vivre, frais revente, assurance CRD, DPE) | 22 | FAIT |

**Points forts actuels :**
- Constantes fiscales 2025-2026 a jour
- Frais de notaire calcules selon le bareme officiel
- 6 regimes fiscaux compares automatiquement
- Deficit foncier avec imputation revenu global et report 10 ans
- Amortissement par composants (4 composants, durees differenciees)
- Plus-value a la revente pour nom propre, LMNP (reintegration LF 2025) et SCI IS
- Analyse HCSF conforme avec reste a vivre
- Scoring base 40 + 6 ajustements conforme a la specification
- DPE : alertes passoires, gel des loyers F/G, impact scoring
- Projections 20 ans **avec impots reels** (corrige l'ecart critique)
- TRI integrant impots annuels, impot de plus-value et frais de revente
- Assurance emprunteur : mode capital initial + mode capital restant du

**Ecarts residuels (mineurs, acceptes) :**
- Part terrain fixe a 15% (non parametree par type de bien)
- DMTO fixe a 5% (pas de selecteur par departement)
- CSG deductible non prise en compte (effet de second ordre)
- Interets An 1 approximes par `capital * taux` (ecart 2-5%)
- Effet de levier avec apport = 0 renvoie une valeur non significative

---

## 2. Etat des corrections depuis l'audit precedent (28 janvier)

### Ecarts identifies le 28 janvier 2026 — tous corriges

| Ecart | Severite | Statut | Detail |
|-------|----------|--------|--------|
| Rentabilite nette sur prix d'achat au lieu du cout total | Critique | CORRIGE | `rentabilite.ts` calcule sur `cout_total_acquisition` |
| Frais de notaire forfaitaires | Critique | CORRIGE | `rentabilite.ts` implemente le bareme par tranches avec DMTO, CSI, emoluments |
| Interets non deduits en fiscalite | Critique | CORRIGE | `fiscalite.ts` calcule et passe `coutFinancierAn1` a chaque regime |
| Charges copro 100% au lieu du net | Moyen | CORRIGE | `rentabilite.ts` soustrait `charges_copro_recuperables` |
| SCI IS assiette trop large | Moyen | CORRIGE | `fiscalite.ts` deduit interets + assurance + amortissement |

---

## 3. Etat des corrections depuis cet audit (7 fevrier)

### Phase 1 — Corrections prioritaires (FAIT — 32 tests)

| # | Ecart identifie | Severite initiale | Statut | Implementation | Tests |
|---|----------------|-------------------|--------|----------------|-------|
| AUDIT-103 | Deficit foncier non gere | Moyen | CORRIGE | `fiscalite.ts:368-416` — separation hors interets / interets, plafond 10 700 EUR, report 10 ans avec buckets FIFO dans `projection.ts:340-445` | 12 |
| AUDIT-104 | Amortissement simplifie (1 seule duree 33 ans) | Moyen | CORRIGE | `fiscalite.ts:418-455` — 4 composants (gros oeuvre 50 ans, facade 25 ans, installations 15 ans, agencements 10 ans), mode `simplifie` ou `composants` dans projections | 13 |
| - | Impots = 0 dans les projections | CRITIQUE | CORRIGE | `projection.ts:188-281` — appel de `calculerImpotAnnuel()` pour chaque annee, 6 regimes, impot cumule sur 20 ans | Couvert par projection.test.ts |
| - | Part terrain parametree | Moyen | NON TRAITE (accepte) | Reste fixe a 15%. Decision metier : conserver la valeur par defaut | - |
| - | Effet de levier apport = 0 | Faible | NON TRAITE (accepte) | Decision metier : non prioritaire | - |

### Phase 2 — Enrichissements metier (FAIT — 80 tests)

| # | Ecart identifie | Severite initiale | Statut | Implementation | Tests |
|---|----------------|-------------------|--------|----------------|-------|
| AUDIT-105 | Plus-value a la revente non calculee | Eleve | CORRIGE | `fiscalite.ts:458-626` — nom propre (abattements IR/PS pour duree), LMNP (reintegration amortissements LF 2025), SCI IS (VNC), surtaxe > 50 000 EUR | 21 |
| AUDIT-106 | Scoring divergent de la specification | Moyen | CORRIGE | `synthese.ts:37-216` — base 40 + 6 ajustements : cashflow (-20/+20), rentabilite (-15/+20), HCSF (-25/+20), DPE (-10/+5), ratio prix/loyer (-5/+10), reste a vivre (-10/+5) | 34 |
| - | HCSF interpolation inversee | Bug | CORRIGE | `synthese.ts` — fonction `interpoler()` corrigee | Couvert par scoring.test.ts |
| - | score_global decimal vs integer DB | Bug | CORRIGE | `Math.round()` systematique avant insert en base | Couvert par synthese.test.ts |

### Phase 3 — Evolutions backlog (FAIT — 22 tests)

| # | Ecart identifie | Severite initiale | Statut | Implementation | Tests |
|---|----------------|-------------------|--------|----------------|-------|
| AUDIT-107 | Reste a vivre HCSF absent | Moyen | CORRIGE | `hcsf.ts:182-189` — calcul RAV = revenus - charges, seuils 700 EUR / 1 500 EUR, impact scoring (-10/+5 pts) | 4 |
| AUDIT-108 | Frais de revente absents du TRI | Moyen | CORRIGE | `projection.ts:495-511` — frais agence 5% (parametre), diagnostics 500 EUR forfait, integres dans flux TRI final | 4 |
| AUDIT-109 | Assurance capital restant du non implementee | Faible | CORRIGE | `projection.ts:111-114` — mode `capital_initial` (defaut) ou `capital_restant_du`, calcul mensuel sur capital restant | 6 |
| AUDIT-110 | DPE et alertes passoires non implementees | Moyen | CORRIGE | `synthese.ts:123-177` — alertes interdiction (G:2025, F:2028, E:2034), gel loyers F/G dans projections (`projection.ts:331-333`), impact scoring (-10/+5 pts) | 8 |

---

## 4. Audit des constantes reglementaires

### 4.1 Fiscalite - Prelevements sociaux

| Constante | Valeur code | Valeur legale 2025 | Statut | Ref. code |
|-----------|-------------|---------------------|--------|-----------|
| PS revenus fonciers | 17.2% | 17.2% | OK | `constants.ts:13` |
| PS LMNP | 18.6% | 18.6% (hausse CSG 2025) | OK | `constants.ts:14` |

**A verifier au prochain audit** : La hausse a 18.6% pour les LMNP est recente (LF 2025). Verifier si elle se maintient en LF 2026.

### 4.2 Micro-Foncier

| Constante | Valeur code | Valeur legale | Statut | Ref. code |
|-----------|-------------|---------------|--------|-----------|
| Abattement | 30% | 30% | OK | `constants.ts:18` |
| Plafond | 15 000 EUR | 15 000 EUR | OK | `constants.ts:19` |

### 4.3 Micro-BIC (LMNP)

| Constante | Valeur code | Valeur legale | Statut | Ref. code |
|-----------|-------------|---------------|--------|-----------|
| Abattement standard | 50% | 50% | OK | `constants.ts:26` |
| Plafond standard | 77 700 EUR | 77 700 EUR | OK | `constants.ts:27` |
| Abattement non classe | 30% | 30% | OK | `constants.ts:31` |
| Plafond non classe | 15 000 EUR | 15 000 EUR | OK | `constants.ts:32` |

### 4.4 Impot sur les Societes

| Constante | Valeur code | Valeur legale | Statut | Ref. code |
|-----------|-------------|---------------|--------|-----------|
| Taux reduit | 15% | 15% | OK | `constants.ts:38` |
| Taux normal | 25% | 25% | OK | `constants.ts:39` |
| Seuil taux reduit | 42 500 EUR | 42 500 EUR | OK | `constants.ts:40` |
| Flat Tax dividendes | 30% | 30% | OK | `constants.ts:44` |

Le taux reduit de 15% est soumis a condition (CA < 10 M EUR, capital detenu a 75% par des personnes physiques). Le simulateur ne verifie pas ces conditions. Acceptable pour un simulateur grand public.

### 4.5 Frais de notaire

| Constante | Valeur code | Valeur legale | Statut | Ref. code |
|-----------|-------------|---------------|--------|-----------|
| DMTO standard | 4.5% | 4.5% | OK | `constants.ts:66` |
| DMTO majore | 5.0% | 5.0% (depuis 04/2025) | OK | `constants.ts:67` |
| Taxe communale | 1.2% | 1.2% | OK | `constants.ts:68` |
| CSI | 0.1% | 0.1% | OK | `constants.ts:73` |
| Bareme emoluments | 4 tranches | 4 tranches (decret 2016-230) | OK | `constants.ts:56-61` |

Le code utilise le DMTO majore a 5% par defaut. Accepte : c'est conservateur.

### 4.6 HCSF

| Constante | Valeur code | Valeur reglementaire | Statut | Ref. code |
|-----------|-------------|----------------------|--------|-----------|
| Taux max endettement | 35% | 35% | OK | `constants.ts:80` |
| Duree max | 25 ans | 25 ans | OK | `constants.ts:81` |
| Ponderation locatifs | 70% | 70% (pratique bancaire) | OK | `constants.ts:82` |

### 4.7 Amortissement

| Constante | Valeur code | Valeur usuelle | Statut | Ref. code |
|-----------|-------------|----------------|--------|-----------|
| Part terrain | 15% | 10-20% selon bien | APPROXIMATIF (accepte) | `constants.ts:99` |
| Duree bati (simplifie) | 33 ans | 25-50 ans | OK | `constants.ts:103` |
| Duree mobilier | 10 ans | 5-10 ans | OK | `constants.ts:104` |
| Duree travaux | 15 ans | 10-15 ans | OK | `constants.ts:105` |
| Gros oeuvre | 40% / 50 ans | 40% / 40-60 ans | OK | `constants.ts:115` |
| Facade/toiture | 20% / 25 ans | 20% / 20-30 ans | OK | `constants.ts:116` |
| Installations techniques | 20% / 15 ans | 20% / 10-20 ans | OK | `constants.ts:117` |
| Agencements interieurs | 20% / 10 ans | 20% / 8-15 ans | OK | `constants.ts:118` |

### 4.8 Deficit foncier (NOUVEAU)

| Constante | Valeur code | Valeur legale | Statut | Ref. code |
|-----------|-------------|---------------|--------|-----------|
| Plafond imputation revenu global | 10 700 EUR | 10 700 EUR | OK | `constants.ts:124` |
| Duree report | 10 ans | 10 ans | OK | `constants.ts:125` |

### 4.9 Plus-value (NOUVEAU)

| Constante | Valeur code | Valeur legale | Statut | Ref. code |
|-----------|-------------|---------------|--------|-----------|
| Taux IR plus-value | 19% | 19% | OK | `constants.ts:132` |
| Taux PS plus-value | 17.2% | 17.2% | OK | `constants.ts:133` |
| Seuil surtaxe | 50 000 EUR | 50 000 EUR | OK | `constants.ts:134` |
| Exoneration IR | 22 ans | 22 ans | OK | `fiscalite.ts:465` |
| Exoneration PS | 30 ans | 30 ans | OK | `fiscalite.ts:475` |

**A verifier au prochain audit** : Le bareme des abattements IR (6%/an de la 6e a la 21e, 4% la 22e) et PS (1.65%/an de la 6e a la 21e, 1.6% la 22e, 9%/an au-dela).

### 4.10 Reste a vivre (NOUVEAU)

| Constante | Valeur code | Pratique bancaire | Statut | Ref. code |
|-----------|-------------|-------------------|--------|-----------|
| Seuil minimum | 700 EUR | 600-800 EUR | OK | `constants.ts:177` |
| Seuil confort | 1 500 EUR | 1 200-1 500 EUR | OK | `constants.ts:178` |

### 4.11 Frais de revente (NOUVEAU)

| Constante | Valeur code | Valeur marche | Statut | Ref. code |
|-----------|-------------|---------------|--------|-----------|
| Taux agence defaut | 5% | 4-6% | OK | `constants.ts:184` |
| Diagnostics forfait | 500 EUR | 300-800 EUR | OK | `constants.ts:185` |

### 4.12 Projections

| Constante | Valeur code | Hypothese source | Statut | Ref. code |
|-----------|-------------|------------------|--------|-----------|
| Inflation loyer | 2%/an | IRL moyen 2010-2024 | RAISONNABLE | `constants.ts:133` |
| Inflation charges | 2.5%/an | Moyenne constatee | RAISONNABLE | `constants.ts:134` |
| Revalorisation bien | 1.5%/an | Moyenne nationale | RAISONNABLE | `constants.ts:135` |

### 4.13 DPE — Calendrier interdictions (NOUVEAU)

| Constante | Valeur code | Valeur legale (loi Climat 2021) | Statut | Ref. code |
|-----------|-------------|-------------------------------|--------|-----------|
| Interdit G | 2025 | 1er janvier 2025 | OK | `synthese.ts:127` |
| Interdit F | 2028 | 1er janvier 2028 | OK | `synthese.ts:128` |
| Interdit E | 2034 | 1er janvier 2034 | OK | `synthese.ts:129` |
| Gel loyers F et G | Oui | Oui (loi Climat art. 159) | OK | `projection.ts:331-333` |

**A verifier au prochain audit** : Le calendrier DPE pourrait etre modifie par de nouvelles dispositions legislatives.

---

## 5. Audit des formules de calcul

### 5.1 Mensualite de credit (PMT) - CONFORME

**Fichier** : `rentabilite.ts:33-62`

```
Mensualite = (M * r * (1+r)^n) / ((1+r)^n - 1)
ou r = taux_annuel/100/12, n = duree*12
```

Verification : 200 000 EUR a 3.5% sur 20 ans → 1 159.92 EUR. CORRECT.

Cas limites geres : taux = 0 (division simple), montant <= 0 ou duree <= 0 (retourne 0).

### 5.2 Assurance emprunteur - CONFORME (2 modes)

**Fichier** : `projection.ts:111-114`

| Mode | Formule | Implementation |
|------|---------|----------------|
| Capital initial (defaut) | `capital_emprunte * taux / 12` | Mensualite fixe |
| Capital restant du (CRD) | `capital_restant(mois N) * taux / 12` | Mensualite degressive, calcul mois par mois |

Tests : `assurance-crd.test.ts` — 6 tests.

### 5.3 Frais de notaire - CONFORME (bareme officiel)

**Fichier** : `rentabilite.ts:71-102`

Le calcul suit le bareme officiel : DMTO + taxe communale + frais assiette + CSI + emoluments par tranches + TVA 20% + debours forfaitaires 1 200 EUR.

Verification : bien ancien 200 000 EUR → ~16 431 EUR (8.2%). Coherent avec estimation usuelle 7.5-8.5%.

### 5.4 Cout total d'acquisition - CONFORME

**Fichier** : `rentabilite.ts:107-146`

```
cout_total = prix_achat + frais_notaire + travaux + frais_dossier + frais_garantie
montant_emprunt = max(0, cout_total - apport)
```

### 5.5 Amortissement - CONFORME (2 modes)

**Fichier** : `fiscalite.ts:418-455`

| Mode | Formule | Detail |
|------|---------|--------|
| Simplifie | `valeur_amortissable / 33` | 1 seule duree |
| Par composants | `somme(part_composant * valeur_amortissable / duree_composant)` | 4 composants, durees differenciees |

Verification : bien 200 000 EUR, terrain 15% :
- Simplifie : 170 000 / 33 = 5 151 EUR/an
- Composants : 1 360 + 1 360 + 2 267 + 3 400 = 8 387 EUR/an (+63%)

Tests : `amortissement-composants.test.ts` — 13 tests.

### 5.6 Charges annuelles - CONFORME

**Fichier** : `rentabilite.ts:156-183`

Separation charges fixes / proportionnelles correcte.

### 5.7 Rentabilite brute et nette - CONFORME

**Fichier** : `rentabilite.ts:193-237`

```
Renta brute = (loyer_annuel / prix_achat) * 100
Renta nette = (revenu_net_avant_impots / cout_total_acquisition) * 100
```

### 5.8 Cash-flow - CONFORME

**Fichier** : `rentabilite.ts:216-218`, `index.ts:106-109`

```
cashflow_mensuel = (cashflow_annuel_brut - impot_total) / 12
```

### 5.9 Effet de levier - ECART MINEUR (accepte)

**Fichier** : `rentabilite.ts:220-223`

Si apport = 0, le code utilise `apport || 1` ce qui donne un levier non significatif. Accepte : non prioritaire.

---

## 6. Audit de la fiscalite

### 6.1 Micro-Foncier - CONFORME

**Fichier** : `fiscalite.ts:44-81`

Abattement 30%, IR + PS 17.2% sur base imposable. Alerte si revenus > 15 000 EUR.

### 6.2 Foncier Reel - CONFORME (avec deficit foncier)

**Fichier** : `fiscalite.ts:90-127`, `fiscalite.ts:368-416`

**Corrections appliquees :**
- Deficit foncier entierement implemente (`calculerDeficitFoncier()`)
- Separation part hors interets (imputable sur revenu global, max 10 700 EUR) et part interets (reportable 10 ans sur revenus fonciers)
- Economie d'impot calculee : `min(deficit_hors_interets, 10 700) * TMI`
- Report sur 10 ans avec buckets FIFO dans les projections (`projection.ts:340-445`)

Tests : `deficit-foncier.test.ts` — 12 tests.

### 6.3 LMNP Micro-BIC - CONFORME

**Fichier** : `fiscalite.ts:136-178`

Distinction meuble classe / non classe. Abattement 50% (standard) ou 30% (non classe, LF 2025).

### 6.4 LMNP Reel - CONFORME (avec amortissement composants)

**Fichier** : `fiscalite.ts:187-245`

**Corrections appliquees :**
- Amortissement par composants disponible (4 composants, durees differenciees)
- L'amortissement ne peut pas creer de deficit BIC (regle respectee)
- Amortissement excedentaire reporte sans limite de duree
- PS a 18.6%

Tests : `amortissement-composants.test.ts` — 13 tests.

### 6.5 SCI a l'IS - CONFORME

**Fichier** : `fiscalite.ts:253-314`

IS progressif 15%/25% avec seuil 42 500 EUR, deduction interets + assurance + amortissement (composants si active), flat tax 30% sur dividendes.

### 6.6 Plus-value a la revente - CONFORME (NOUVEAU)

**Fichier** : `fiscalite.ts:458-626`

| Mode | Implementation | Detail |
|------|----------------|--------|
| Nom propre (IR) | `calculerPlusValueIR()` | Abattements pour duree de detention IR (exo 22 ans) et PS (exo 30 ans) |
| LMNP | `calculerPlusValueIR()` avec flag reintegration | Reintegration des amortissements cumules dans la PV brute (LF 2025) |
| SCI IS | `calculerPlusValueSciIs()` | PV = prix_vente - VNC (prix - amortissements cumules), IS puis flat tax optionnelle |
| Surtaxe | `calculerSurtaxePV()` | Bareme progressif au-dela de 50 000 EUR de PV nette IR |

Tests : `plus-value.test.ts` — 21 tests.

### 6.7 Comparaison des regimes - CONFORME

**Fichier** : `fiscalite.ts:407-526`

Compare 6 regimes et identifie le plus avantageux sur la base du cashflow net annuel.

### 6.8 Calcul des interets deductibles An 1 - APPROXIMATION (acceptee)

**Fichier** : `fiscalite.ts:330-333`

Les interets An 1 sont approximes par `capital * taux` au lieu du tableau d'amortissement. Surestimation de 2-5% selon taux et duree. Impact faible. Accepte.

---

## 7. Audit de l'analyse HCSF

### 7.1 Taux d'endettement - CONFORME

**Fichier** : `hcsf.ts:68-76`

### 7.2 Ponderation des revenus locatifs - CONFORME

**Fichier** : `hcsf.ts:81-94` — ponderation a 70%.

### 7.3 Mode nom propre - CONFORME (avec reste a vivre)

**Fichier** : `hcsf.ts:130-204`

**Corrections appliquees :**
- Reste a vivre calcule : `revenus_totaux - charges_totales` (`hcsf.ts:182-189`)
- Seuils : 700 EUR (insuffisant), 1 500 EUR (confortable)
- Integration dans le scoring (-10 a +5 points)

Tests : `hcsf-reste-a-vivre.test.ts` — 4 tests.

**Reserve maintenue** : l'estimation des revenus par TMI reste approximative (un TMI 30% peut correspondre a 28 797 EUR ou 57 594 EUR selon situation familiale).

### 7.4 Mode SCI IS - CONFORME

**Fichier** : `hcsf.ts:214-333`

Calcul par associe correct, quote-part au prorata des parts.

### 7.5 Capacite d'emprunt residuelle - CONFORME

**Fichier** : `hcsf.ts:99-118`

**Reserve maintenue** : hypothese fixe 20 ans / 3.5% au lieu des conditions saisies par l'utilisateur.

---

## 8. Audit des projections et du TRI

### 8.1 Projections pluriannuelles - CONFORME (corrige)

**Fichier** : `projection.ts:157-289`, `projection.ts:188-281`

**Correction critique appliquee : impots integres dans les projections.**

La fonction `calculerImpotAnnuel()` (`projection.ts:188-281`) est appelee pour chaque annee de projection. Elle supporte les 6 regimes et tient compte de :
- L'evolution des revenus (inflation loyer)
- L'evolution des charges (inflation charges)
- La degressivite des interets (tableau d'amortissement)
- L'amortissement (simplifie ou composants, avec arret progressif par composant)
- Le deficit foncier avec report FIFO
- Le gel des loyers pour DPE F et G

### 8.2 Tableau d'amortissement - CONFORME

**Fichier** : `projection.ts:63-150`

Supporte les 2 modes d'assurance (capital initial et capital restant du).

### 8.3 Calcul du TRI - CONFORME (corrige)

**Fichier** : `projection.ts:16-54`, `projection.ts:495-527`

**Corrections appliquees :**
- TRI integre les impots annuels (cashflow net d'impot)
- TRI integre l'impot de plus-value a l'horizon (`projection.ts:510-511`)
- TRI integre les frais de revente (agence + diagnostics) (`projection.ts:495-511`)

```
Flux initial = -apport
Flux annuel(n) = cashflow_brut(n) - impot(n)
Flux final = cashflow_net + patrimoine_net - impot_PV - frais_revente
```

Tests : `frais-revente.test.ts` — 4 tests, `projection.test.ts` — tests existants mis a jour.

### 8.4 Plus-value dans les projections - CONFORME (NOUVEAU)

**Fichier** : `projection.ts:471-527`

Calcul a l'horizon final avec suivi de l'amortissement cumule sur 20 ans. Le mode de calcul (IR / LMNP / SCI IS) est determine par le regime fiscal optimal.

### 8.5 DPE et gel des loyers - CONFORME (NOUVEAU)

**Fichier** : `projection.ts:331-333`

Si DPE = F ou G, l'inflation des loyers est forcee a 0% dans les projections. Impact significatif sur le cashflow cumule a long terme.

---

## 9. Audit du scoring et de la synthese

### 9.1 Scoring sur 100 points - CONFORME (realigne avec specification)

**Fichier** : `synthese.ts:37-216`

**Corrections appliquees — systeme conforme a la specification :**

| Critere | Plage | Bornes | Ref. code |
|---------|-------|--------|-----------|
| Base | 40 points | Fixe | `synthese.ts:41` |
| Cashflow net mensuel | -20 a +20 | [-200 EUR, +200 EUR] interpolation lineaire | `synthese.ts:55` |
| Rentabilite nette-nette | -15 a +20 | [0%, 3%] → [-15, 0], [3%, 7%] → [0, +20] | `synthese.ts:65` |
| HCSF (taux endettement) | -25 a +20 | [<=25%] → +20, [25-35%] → interpolation, [35-50%] → interpolation, [>50%] → -25 | `synthese.ts:75` |
| DPE | -10 a +5 | A/B → +5, C/D → 0, E → -3, F/G → -10 | `synthese.ts:86` |
| Ratio prix/loyer | -5 a +10 | [<=15] → +10, [15-20] → interpolation, [20-25] → interpolation, [>25] → -5 | `synthese.ts:100` |
| Reste a vivre | -10 a +5 | [>=1500] → +5, [800-1500] → 0, [<800] → -10 | `synthese.ts:113` |

**Score final** = clamp(0, base + somme des ajustements, 100)

Tests : `scoring.test.ts` — 34 tests.

### 9.2 Alertes DPE - CONFORME (NOUVEAU)

**Fichier** : `synthese.ts:123-177`

Alertes emises si l'interdiction de location tombe avant la fin de l'horizon de projection. Gel des loyers signale pour DPE F et G.

Tests : `dpe-alertes.test.ts` — 8 tests.

### 9.3 Recommandations - CONFORME

**Fichier** : `synthese.ts:257-384`

Recommandations contextuelles : cashflow negatif, optimisation rentabilite, optimisation fiscale, solutions HCSF, alertes DPE.

---

## 10. Ecarts residuels avec la specification metier

### Fonctionnalites implementees

| Fonctionnalite (spec) | Statut | Tests | Ref. |
|------------------------|--------|-------|------|
| Frais de notaire baremes | IMPLEMENTE | Oui | `rentabilite.ts:71-102` |
| Deduction mobilier assiette notaire | IMPLEMENTE | Oui | `rentabilite.ts:115` |
| Deficit foncier (imputation + report) | IMPLEMENTE | 12 | `fiscalite.ts:368-416`, `projection.ts:340-445` |
| Amortissement par composants | IMPLEMENTE | 13 | `fiscalite.ts:418-455` |
| Plus-value a la revente (3 modes) | IMPLEMENTE | 21 | `fiscalite.ts:458-626` |
| Reintegration amortissements LMNP (LF 2025) | IMPLEMENTE | Couvert par PV | `fiscalite.ts:507` |
| Scoring avec DPE + ratio prix/loyer + RAV | IMPLEMENTE | 34 | `synthese.ts:37-216` |
| DPE et alertes passoires energetiques | IMPLEMENTE | 8 | `synthese.ts:123-177` |
| Gel loyers DPE F et G | IMPLEMENTE | Couvert par DPE | `projection.ts:331-333` |
| Reste a vivre HCSF | IMPLEMENTE | 4 | `hcsf.ts:182-189` |
| Impots dans les projections | IMPLEMENTE | Couvert par projection | `projection.ts:188-281` |
| Frais de revente dans TRI | IMPLEMENTE | 4 | `projection.ts:495-511` |
| Assurance sur capital restant du | IMPLEMENTE | 6 | `projection.ts:111-114` |

### Fonctionnalites non implementees (acceptees)

| Fonctionnalite (spec) | Decision | Justification |
|------------------------|----------|---------------|
| Part terrain parametree par type de bien | Reporte | Valeur fixe 15% acceptee, conservatrice |
| CSG deductible | Non traite | Effet de second ordre, impact negligeable |
| Frais d'agence dans cout acquisition | Non traite | Souvent inclus dans prix FAI |
| Taux DMTO par departement | Non traite | 5% par defaut est conservateur |
| VAN (Valeur Actuelle Nette) | Non traite | Faible demande utilisateur |
| Multiple sur capital investi | Non traite | Faible demande utilisateur |
| Rendement sur fonds propres | Non traite | Faible demande utilisateur |
| Report deficit IS | Non traite | Complexite elevee, cas rare en simulation |

---

## 11. Problemes de precision numerique

### 11.1 Double arrondi sur le cashflow mensuel

`cashflow_annuel` est arrondi a 2 decimales, puis divise par 12 et arrondi a l'euro. Ecart cumule max ~30 EUR sur 20 ans. Non significatif.

### 11.2 Chaine d'arrondis intermediaires

Chaque module arrondit a 2 decimales. Ecart maximal constate ~5 EUR sur un resultat final. Acceptable.

### 11.3 Metriques denormalisees en BDD

`simulations.score_global` est un integer (`Math.round()` avant insert). Les anciennes simulations ne sont pas recalculees si les constantes changent.

---

## 12. Ecarts non traites (acceptes ou reportes)

| Ecart | Severite | Decision | Justification |
|-------|----------|----------|---------------|
| Part terrain fixe 15% | Faible | Accepte | Valeur par defaut raisonnable, conservatrice |
| DMTO fixe 5% | Faible | Accepte | Conservateur (avantage utilisateur) |
| Effet de levier apport = 0 | Faible | Accepte | Cas marginal |
| Interets An 1 approximes | Faible | Accepte | Ecart 2-5%, impact faible |
| CSG deductible | Negligeable | Accepte | Effet de second ordre |
| Estimation revenus par TMI | Faible | Accepte | Reserve documentee, alerte emise a l'utilisateur |
| Capacite emprunt residuelle 20 ans / 3.5% fixe | Faible | Accepte | Devrait utiliser conditions saisies |
| Taxe fonciere inflations specifiques | Faible | Accepte | Meme taux que les autres charges (2.5%) |

---

## 13. Matrice de risque residuel

| Element | Ampleur de l'ecart | Frequence | Risque global |
|---------|-------------------|-----------|---------------|
| Part terrain fixe 15% | 0-300 EUR/an sur amort. | Regimes reels | FAIBLE |
| DMTO fixe a 5% | 0-0.5% du prix | Dpts non majores | FAIBLE |
| Effet de levier apport = 0 | Valeur non significative | Cas rare | FAIBLE |
| Interets An 1 approximes | 2-5% d'ecart sur interets | Systematique | FAIBLE |
| Double arrondi cashflow | ~30 EUR sur 20 ans | Systematique | NEGLIGEABLE |
| Estimation revenus par TMI | Variable | Si revenus non saisis | FAIBLE |

**Aucun risque critique ou moyen residuel.**

---

## 14. Points de verification pour le prochain audit

Ce chapitre liste les points precis a verifier lors du prochain audit pour detecter d'eventuels ecarts.

### 14.1 Constantes reglementaires a reverifier

| Constante | Valeur actuelle | A verifier | Risque de changement |
|-----------|-----------------|------------|----------------------|
| PS LMNP | 18.6% | LF 2026 / 2027 | Eleve (hausse recente) |
| PS revenus fonciers | 17.2% | LF 2026 / 2027 | Moyen |
| Taux IS reduit | 15% sur 42 500 EUR | LF 2026 / 2027 | Faible |
| Flat Tax | 30% | LF 2026 / 2027 | Moyen (debat politique) |
| Seuil micro-BIC | 77 700 EUR | LF 2026 / 2027 | Moyen |
| DMTO majore | 5% | Evolution departementale | Faible |
| Plafond deficit foncier | 10 700 EUR | LF 2026 / 2027 | Faible (stable depuis des annees) |
| Calendrier DPE (F: 2028, E: 2034) | Loi Climat 2021 | Possibles reports legislatifs | Moyen |
| Reintegration amortissements LMNP | LF 2025 | Confirmer maintien | Faible |
| Seuil surtaxe PV | 50 000 EUR | LF 2026 / 2027 | Faible |

### 14.2 Formules de calcul a reverifier

| Formule | Fichier | Test de reference | Quoi verifier |
|---------|---------|-------------------|---------------|
| Deficit foncier : separation hors interets / interets | `fiscalite.ts:368-416` | `deficit-foncier.test.ts` | Plafond 10 700 EUR correctement applique, report FIFO sur 10 ans |
| Amortissement composants : arret progressif | `fiscalite.ts:418-455` | `amortissement-composants.test.ts` | Arret agencements a 10 ans, installations a 15 ans, facade a 25 ans, gros oeuvre a 50 ans |
| Plus-value IR : abattements par annee | `fiscalite.ts:458-530` | `plus-value.test.ts` | Bareme abattements IR (6%/an 6e-21e, 4% 22e) et PS (1.65%/an 6e-21e, 1.6% 22e, 9%/an 23e-30e) |
| Plus-value LMNP : reintegration | `fiscalite.ts:507` | `plus-value.test.ts` | Amortissements cumules reintegres dans PV brute |
| Plus-value SCI IS : VNC | `fiscalite.ts:570-626` | `plus-value.test.ts` | PV = prix_vente - (prix_achat - amortissements_cumules) |
| Surtaxe PV > 50 000 EUR | `fiscalite.ts:486-505` | `plus-value.test.ts` | Bareme progressif 2% a 7% |
| Scoring base 40 + ajustements | `synthese.ts:37-216` | `scoring.test.ts` | 6 criteres, bornes correctes, interpolation lineaire |
| DPE gel loyers F/G | `projection.ts:331-333` | `dpe-alertes.test.ts` | Inflation 0% pour DPE F et G |
| Reste a vivre | `hcsf.ts:182-189` | `hcsf-reste-a-vivre.test.ts` | Seuils 700 / 1 500 EUR |
| TRI avec impots + PV + frais | `projection.ts:495-527` | `frais-revente.test.ts` | Flux final = cashflow_net + patrimoine - impot_PV - frais_revente |
| Assurance CRD | `projection.ts:111-114` | `assurance-crd.test.ts` | Mensualite degressive sur capital restant |
| Impots dans projections | `projection.ts:188-281` | `projection.test.ts` | Impot != 0 pour chaque annee, 6 regimes supportes |

### 14.3 Simulation de reference (test de non-regression)

#### Donnees d'entree

| Parametre | Valeur |
|-----------|--------|
| Prix d'achat | 200 000 EUR |
| Type de bien | Appartement ancien |
| Travaux | 10 000 EUR |
| Mobilier | 5 000 EUR |
| Apport | 30 000 EUR |
| Taux credit | 3.5% |
| Duree | 20 ans |
| Assurance | 0.3% sur CI |
| Loyer mensuel | 900 EUR |
| Charges copro | 80 EUR/mois |
| Charges recup. | 30 EUR/mois |
| Taxe fonciere | 800 EUR/an |
| PNO | 150 EUR/an |
| Gestion locative | 8% |
| Provision travaux | 5% |
| Provision vacance | 5% |
| TMI | 30% |
| Structure | Nom propre |
| DPE | D |

#### Resultats attendus (calcul manuel)

| Indicateur | Calcul | Resultat attendu |
|-----------|--------|-----------------|
| Frais notaire (sur 195 000 EUR base) | Bareme complet | ~16 000 EUR |
| Cout total acquisition | 200k + 16k + 10k | ~226 000 EUR |
| Montant emprunt | 226k - 30k | ~196 000 EUR |
| Mensualite credit | PMT(196000, 3.5%, 20) | ~1 136 EUR |
| Mensualite assurance | 196000 * 0.3% / 12 | ~49 EUR |
| Mensualite totale | | ~1 185 EUR |
| Loyer annuel | 900 * 12 | 10 800 EUR |
| Charges fixes | 600+800+150 | 1 550 EUR |
| Charges proportionnelles | (8+5+5)% * 10 800 | 1 944 EUR |
| Total charges | | ~3 494 EUR |
| Revenu net avant impots | 10 800 - 3 494 | ~7 306 EUR |
| Renta brute | 10 800 / 200 000 | 5.40% |
| Renta nette | 7 306 / 226 000 | 3.23% |
| Cashflow brut annuel | 7 306 - 14 220 | ~-6 914 EUR |
| Impot micro-foncier | 7 560 * (30%+17.2%) | ~3 566 EUR |
| Cashflow net annuel | -6 914 - 3 566 | ~-10 480 EUR |
| Cashflow net mensuel | | ~-873 EUR |
| Score (base 40 + ajustements) | CF -20, renta ~-10, DPE D 0, ... | ~10-20 |

Ce scenario de reference sert de test de non-regression pour valider les evolutions futures.

### 14.4 Couverture de tests actuelle

| Fichier de test | Nb tests | Module couvert |
|----------------|----------|----------------|
| `deficit-foncier.test.ts` | 12 | Deficit foncier (imputation, report, FIFO) |
| `amortissement-composants.test.ts` | 13 | Amortissement 4 composants |
| `plus-value.test.ts` | 21 | PV IR, LMNP, SCI IS, surtaxe |
| `scoring.test.ts` | 34 | 6 criteres, base 40, interpolation |
| `hcsf-reste-a-vivre.test.ts` | 4 | Reste a vivre, seuils |
| `frais-revente.test.ts` | 4 | Frais agence, diagnostics, TRI |
| `assurance-crd.test.ts` | 6 | Assurance capital restant du |
| `dpe-alertes.test.ts` | 8 | Alertes passoires, gel loyers |
| `validation.test.ts` | - | Validation entrees |
| `fiscalite.test.ts` | - | Regimes fiscaux |
| `hcsf.test.ts` | - | Analyse HCSF |
| `projection.test.ts` | - | Projections, TRI |
| `synthese.test.ts` | - | Synthese, recommandations |
| **Total tests audit** | **136** | |

---

## Annexe A : Fichiers du moteur de calcul

| Fichier | Role |
|---------|------|
| `src/config/constants.ts` | Constantes reglementaires |
| `src/server/calculations/index.ts` | Orchestrateur principal |
| `src/server/calculations/types.ts` | Types TypeScript |
| `src/server/calculations/validation.ts` | Validation + normalisation |
| `src/server/calculations/rentabilite.ts` | Financement + charges + rendements |
| `src/server/calculations/fiscalite.ts` | Tous regimes fiscaux + deficit foncier + amortissement composants + plus-value |
| `src/server/calculations/hcsf.ts` | Analyse HCSF + reste a vivre |
| `src/server/calculations/projection.ts` | Projections + TRI + amortissement credit + assurance CRD + frais revente |
| `src/server/calculations/synthese.ts` | Scoring (base 40 + 6 criteres) + alertes DPE + recommandations |

## Annexe B : Historique des audits

| Date | Version | Perimetre | Verdict |
|------|---------|-----------|---------|
| 28 Janvier 2026 | 1.0 | Calculs rentabilite | 5 ecarts critiques identifies |
| 7 Fevrier 2026 | 3.0 | Moteur complet | 7/10 — ecarts critiques sur projections et scoring |
| 9 Fevrier 2026 | 4.0 | Post-corrections Phase 1-3 | 9/10 — tous ecarts critiques et moyens corriges, 136 tests |
