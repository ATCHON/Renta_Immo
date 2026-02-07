# Audit des Methodologies de Calcul - Simulateur Renta Immo

**Date :** 7 Fevrier 2026
**Version :** 3.0
**Perimetre :** Moteur de calcul complet (`src/server/calculations/`), API routes, donnees retournees
**Documents de reference :**
- `docs/core/specification-calculs.md` (v2.0)
- `docs/audit/audit-calculs-rentabilite.md` (28 Janvier 2026)
- Code source : `src/server/calculations/`, `src/config/constants.ts`

---

## Table des matieres

1. [Synthese executive](#1-synthese-executive)
2. [Etat des corrections depuis l'audit precedent](#2-etat-des-corrections-depuis-laudit-precedent)
3. [Audit des constantes reglementaires](#3-audit-des-constantes-reglementaires)
4. [Audit des formules de calcul](#4-audit-des-formules-de-calcul)
5. [Audit de la fiscalite](#5-audit-de-la-fiscalite)
6. [Audit de l'analyse HCSF](#6-audit-de-lanalyse-hcsf)
7. [Audit des projections et du TRI](#7-audit-des-projections-et-du-tri)
8. [Audit du scoring et de la synthese](#8-audit-du-scoring-et-de-la-synthese)
9. [Ecarts avec la specification metier](#9-ecarts-avec-la-specification-metier)
10. [Problemes de precision numerique](#10-problemes-de-precision-numerique)
11. [Propositions d'amelioration](#11-propositions-damelioration)
12. [Matrice de risque](#12-matrice-de-risque)
13. [Plan d'action recommande](#13-plan-daction-recommande)

---

## 1. Synthese executive

### Verdict global : 7/10 - Solide mais des axes d'amelioration significatifs

Le moteur de calcul est **architecturalement bien concu** avec une separation modulaire claire (rentabilite, fiscalite, HCSF, projections, synthese). Les corrections de l'audit du 28 janvier ont ete appliquees (rentabilite nette sur cout total, frais de notaire baremes, deduction des interets en fiscalite, charges recuperables).

**Points forts :**
- Constantes fiscales 2025 a jour
- Frais de notaire calcules selon le bareme officiel
- 6 regimes fiscaux compares automatiquement
- Analyse HCSF conforme aux recommandations 2024
- Code TypeScript strict et bien type

**Points critiques restants :**
- Projections pluriannuelles sans impots (TRI surevalue)
- Pas de gestion du deficit foncier / report d'amortissement dans le temps
- Part terrain fixe a 15% quel que soit le type de bien
- Plus-value a la revente non calculee
- Scoring divergent de la specification metier

---

## 2. Etat des corrections depuis l'audit precedent

### Ecarts identifies le 28 janvier 2026 et leur statut actuel

| Ecart | Severite | Statut | Detail |
|-------|----------|--------|--------|
| Rentabilite nette sur prix d'achat au lieu du cout total | Critique | CORRIGE | `rentabilite.ts:210-213` calcule desormais sur `cout_total_acquisition` |
| Frais de notaire forfaitaires | Critique | CORRIGE | `rentabilite.ts:71-102` implemente le bareme par tranches avec DMTO, CSI, emoluments |
| Interets non deduits en fiscalite | Critique | CORRIGE | `fiscalite.ts:329-333` calcule et passe `coutFinancierAn1` a chaque regime |
| Charges copro 100% au lieu du net | Moyen | CORRIGE | `rentabilite.ts:161` soustrait `charges_copro_recuperables` |
| SCI IS assiette trop large | Moyen | CORRIGE | `fiscalite.ts:266` deduit interets + assurance + amortissement |

**Conclusion** : Tous les ecarts critiques du precedent audit ont ete corriges.

---

## 3. Audit des constantes reglementaires

### 3.1 Fiscalite - Prelevements sociaux

| Constante | Valeur code | Valeur legale 2025 | Statut | Ref. code |
|-----------|-------------|---------------------|--------|-----------|
| PS revenus fonciers | 17.2% | 17.2% | OK | `constants.ts:13` |
| PS LMNP | 18.6% | 18.6% (hausse CSG 2025) | OK | `constants.ts:14` |

**Point d'attention metier** : La hausse a 18.6% pour les LMNP est recente (LF 2025). Verifier si elle se maintient en LF 2026. Le taux de 17.2% pour le foncier est inchange.

### 3.2 Micro-Foncier

| Constante | Valeur code | Valeur legale | Statut | Ref. code |
|-----------|-------------|---------------|--------|-----------|
| Abattement | 30% | 30% | OK | `constants.ts:18` |
| Plafond | 15 000 EUR | 15 000 EUR | OK | `constants.ts:19` |

### 3.3 Micro-BIC (LMNP)

| Constante | Valeur code | Valeur legale | Statut | Ref. code |
|-----------|-------------|---------------|--------|-----------|
| Abattement standard | 50% | 50% | OK | `constants.ts:26` |
| Plafond standard | 77 700 EUR | 77 700 EUR | OK | `constants.ts:27` |
| Abattement non classe | 30% | 30% | OK | `constants.ts:31` |
| Plafond non classe | 15 000 EUR | 15 000 EUR | OK | `constants.ts:32` |

### 3.4 Impot sur les Societes

| Constante | Valeur code | Valeur legale | Statut | Ref. code |
|-----------|-------------|---------------|--------|-----------|
| Taux reduit | 15% | 15% | OK | `constants.ts:38` |
| Taux normal | 25% | 25% | OK | `constants.ts:39` |
| Seuil taux reduit | 42 500 EUR | 42 500 EUR | OK | `constants.ts:40` |
| Flat Tax dividendes | 30% | 30% | OK | `constants.ts:44` |

**Point metier** : Le taux reduit de 15% est soumis a condition (CA < 10 M EUR, capital detenu a 75% par des personnes physiques). Le simulateur ne verifie pas ces conditions. Acceptable pour un MVP mais a documenter.

### 3.5 Frais de notaire

| Constante | Valeur code | Valeur legale | Statut | Ref. code |
|-----------|-------------|---------------|--------|-----------|
| DMTO standard | 4.5% | 4.5% | OK | `constants.ts:66` |
| DMTO majore | 5.0% | 5.0% (depuis 04/2025) | OK | `constants.ts:67` |
| Taxe communale | 1.2% | 1.2% | OK | `constants.ts:68` |
| CSI | 0.1% | 0.1% | OK | `constants.ts:73` |
| Bareme emoluments | 4 tranches | 4 tranches (decret 2016-230) | OK | `constants.ts:56-61` |

**Ecart constate** : Le code utilise systematiquement le DMTO majore a 5% (`rentabilite.ts:79` utilise `TAUX_DEPARTEMENTAL_MAJOR`). En realite, tous les departements n'ont pas adopte cette hausse.

**Proposition** : Ajouter un parametre `departement` ou un booleen `dmto_majore` pour laisser l'utilisateur choisir. A defaut, appliquer 5% est conservateur (l'utilisateur ne sera pas desagreablement surpris).

### 3.6 HCSF

| Constante | Valeur code | Valeur reglementaire | Statut | Ref. code |
|-----------|-------------|----------------------|--------|-----------|
| Taux max endettement | 35% | 35% | OK | `constants.ts:80` |
| Duree max | 25 ans | 25 ans | OK | `constants.ts:81` |
| Ponderation locatifs | 70% | 70% (pratique bancaire) | OK | `constants.ts:82` |

**Point metier** : La ponderation a 70% est une recommandation, pas un texte de loi. Certaines banques appliquent 60%, d'autres 80%. Documenter cette variabilite.

### 3.7 Amortissement

| Constante | Valeur code | Valeur usuelle | Statut | Ref. code |
|-----------|-------------|----------------|--------|-----------|
| Part terrain | 15% | 10-20% selon bien | APPROXIMATIF | `constants.ts:99` |
| Duree bati | 33 ans | 25-50 ans | APPROXIMATIF | `constants.ts:103` |
| Duree mobilier | 10 ans | 5-10 ans | OK | `constants.ts:104` |
| Duree travaux | 15 ans | 10-15 ans | OK | `constants.ts:105` |

**Ecart important** - voir section 4.4.

### 3.8 Projections

| Constante | Valeur code | Hypothese source | Statut | Ref. code |
|-----------|-------------|------------------|--------|-----------|
| Inflation loyer | 2%/an | IRL moyen 2010-2024 | RAISONNABLE | `constants.ts:133` |
| Inflation charges | 2.5%/an | Moyenne constatee | RAISONNABLE | `constants.ts:134` |
| Revalorisation bien | 1.5%/an | Moyenne nationale | RAISONNABLE | `constants.ts:135` |

**Point metier** : Ces taux sont des moyennes nationales. La revalorisation peut etre de -2% a +5% selon la zone. L'inflation IRL est couplee a l'IPC hors tabac, actuellement autour de 2%. Le simulateur permet a l'utilisateur de personnaliser les taux d'evolution loyer/charges via `options` mais pas la revalorisation du bien.

---

## 4. Audit des formules de calcul

### 4.1 Mensualite de credit (PMT) - CONFORME

**Fichier** : `rentabilite.ts:33-62`

```
Mensualite = (M * r * (1+r)^n) / ((1+r)^n - 1)
ou r = taux_annuel/100/12, n = duree*12
```

**Verification** : 200 000 EUR a 3.5% sur 20 ans
- Attendu : 1 159.92 EUR (calculatrice financiere)
- Code : `(200000 * 0.002917 * 1.002917^240) / (1.002917^240 - 1)` = 1 159.92 EUR
- **Resultat : CORRECT**

Cas limites geres :
- Taux = 0 : division simple `montant / nb_mois` (OK)
- Montant <= 0 ou duree <= 0 : retourne 0 (OK)

**Assurance** : Calculee sur capital initial (fixe). C'est le mode le plus courant en France. Le mode "capital restant du" prevu dans la specification n'est pas implemente.

### 4.2 Frais de notaire - CONFORME (bareme officiel)

**Fichier** : `rentabilite.ts:71-102`

Le calcul suit le bareme officiel :
1. DMTO (5%) + Taxe communale (1.2%) + Frais assiette (2.37% du DMTO) + CSI (0.1%)
2. Emoluments par tranches progressives + TVA 20%
3. Debours forfaitaires : 1 200 EUR

**Verification** : Bien ancien a 200 000 EUR
- DMTO : 10 000 EUR
- Taxe communale : 2 400 EUR
- Frais assiette : 237 EUR
- CSI : 200 EUR
- Emoluments HT : 6500*0.0387 + 10500*0.01596 + 43000*0.01064 + 140000*0.00799 = 251.55 + 167.58 + 457.52 + 1118.60 = 1 995.25 EUR
- Emoluments TTC : 2 394.30 EUR
- Debours : 1 200 EUR
- **Total : 16 431 EUR (8.2%)**
- Estimation usuelle 7.5-8.5% : COHERENT

**Points mineurs** :
- Debours forfaitaires fixes a 1 200 EUR (reel : 500-3 000 EUR) - acceptable
- Deduction du mobilier de l'assiette : implementee (`rentabilite.ts:115`)
- Bien neuf : taux forfaitaire 2.5% (code) vs 0.715% DMTO + emoluments (spec). Simplification acceptable pour un simulateur.

### 4.3 Cout total d'acquisition - CONFORME

**Fichier** : `rentabilite.ts:107-146`

```
cout_total = prix_achat + frais_notaire + travaux + frais_dossier + frais_garantie
montant_emprunt = max(0, cout_total - apport)
```

**Ecart avec specification** : Les frais d'agence ne sont pas inclus dans le cout total (la spec prevoit un champ `frais_agence`). A discuter avec le metier : les frais d'agence sont souvent inclus dans le prix affiche (FAI).

### 4.4 Part terrain / Amortissement - ECART SIGNIFICATIF 

**Fichier** : `constants.ts:99`, `fiscalite.ts:200-209`

Le code applique une part terrain fixe de 15% quel que soit le type de bien.

**Realite** :
| Type de bien | Part terrain reelle |
|-------------|---------------------|
| Appartement centre-ville | 5-15% |
| Appartement peripherie | 10-20% |
| Maison individuelle | 15-30% |
| Immeuble de rapport | 10-20% |

**Impact** : Pour un appartement en centre-ville, la part terrain est souvent estimee a 5-10% par les experts-comptables. Appliquer 15% reduit l'amortissement deductible et donc surestime l'impot.

**Calcul d'impact** : Bien a 200 000 EUR, amortissement sur 33 ans
- Part terrain 10% : amortissement = 180 000 / 33 = 5 454 EUR/an
- Part terrain 15% : amortissement = 170 000 / 33 = 5 151 EUR/an
- **Ecart : 303 EUR/an d'amortissement en moins**
- A TMI 30% + PS 18.6% : ecart d'impot de ~147 EUR/an

De plus, l'amortissement simplifie (1 seule duree de 33 ans) est conservateur par rapport a l'amortissement par composants prevu dans la specification :

| Methode | Amortissement annuel (bien 200 000 EUR, terrain 15%) |
|---------|------------------------------------------------------|
| Simplifie 33 ans | 5 151 EUR/an |
| Par composants (spec) | ~6 800 EUR/an (estime) |

**Proposition** : Voir section 11.

### 4.5 Charges annuelles - CONFORME

**Fichier** : `rentabilite.ts:156-183`

La separation charges fixes / proportionnelles est correcte :
- Charges fixes : copro (net recuperable) + TF + PNO + GLI + CFE + comptable
- Charges proportionnelles : gestion + provision travaux + provision vacance (% du loyer)

### 4.6 Rentabilite brute et nette - CONFORME

**Fichier** : `rentabilite.ts:193-237`

```
Renta brute = (loyer_annuel / prix_achat) * 100
Renta nette = (revenu_net_avant_impots / cout_total_acquisition) * 100
```

**Point de vigilance metier** : La rentabilite brute est calculee sur le prix d'achat seul (convention usuelle) tandis que la nette est sur le cout total. Cette difference de base rend la comparaison directe peu intuitive. La specification prevoit aussi une `Rentabilite_Brute_Totale` sur le cout total qui n'est pas implementee.

### 4.7 Cash-flow - CONFORME

**Fichier** : `rentabilite.ts:216-218`

```
cashflow_annuel = revenu_net - remboursement_annuel
```

Le cashflow affiche a l'utilisateur integre bien l'impot (calcule dans `index.ts:106-109`) :
```
cashflow_mensuel = (cashflow_annuel_brut - impot_total) / 12
```

### 4.8 Effet de levier - ECART MINEUR - A FAIRE 

**Fichier** : `rentabilite.ts:220-223`

```
effet_levier = (renta_nette - taux_credit) * (emprunt / apport)
```

**Probleme** : Si apport = 0, le code utilise `apport || 1` (1 EUR) ce qui donne un levier astronomique et non significatif.

**Proposition** : Retourner `null` ou un label "Levier maximum (pas d'apport)" au lieu d'une valeur numerique trompeuse.

---

## 5. Audit de la fiscalite

### 5.1 Micro-Foncier - CONFORME

**Fichier** : `fiscalite.ts:44-81`

Formule correcte : abattement 30%, IR + PS 17.2% sur base imposable.

**Verification** : Loyer 12 000 EUR, TMI 30%
- Base imposable : 12 000 * 0.70 = 8 400 EUR
- IR : 8 400 * 30% = 2 520 EUR
- PS : 8 400 * 17.2% = 1 444.80 EUR
- **Total : 3 964.80 EUR** - CORRECT

**Ecart avec specification** : La CSG deductible (6.8%) n'est pas prise en compte. C'est un effet de second ordre applicable l'annee suivante (reduction d'impot minime). Acceptable pour un simulateur.

Alerte correctement emise si revenus > 15 000 EUR.

### 5.2 Foncier Reel - PARTIELLEMENT CONFORME - A FAIRE 

**Fichier** : `fiscalite.ts:90-127`

**Ce qui est correct** :
- Deduction charges + interets/assurance
- PS a 17.2%
- Base imposable planchee a 0

**Ecart constate : Deficit foncier non gere dans les calculs**

Le code emet bien une alerte informative (`fiscalite.ts:102-106`) mais ne calcule pas :
1. La part du deficit imputable sur le revenu global (max 10 700 EUR hors interets)
2. La part reportable sur 10 ans sur revenus fonciers
3. L'economie d'impot reelle

**Impact** : Pour un investisseur en deficit foncier (typiquement : gros travaux), l'avantage fiscal reel n'apparait pas dans la comparaison des regimes. Le foncier reel peut apparaitre moins intéressant qu'il ne l'est.

**Proposition** : Implementer le calcul du deficit foncier avec :
- Deficit hors interets : imputable sur revenu global (plafond 10 700 EUR)
- Economie IR : deficit_imputable * TMI
- Deficit restant : reportable 10 ans sur revenus fonciers

### 5.3 LMNP Micro-BIC - CONFORME

**Fichier** : `fiscalite.ts:136-178`

Formule correcte avec distinction meuble classe/non classe.

**Verification** : Loyer 20 000 EUR, TMI 30%, meuble longue duree
- Abattement 50% : 10 000 EUR
- Base : 10 000 EUR
- IR : 3 000 EUR
- PS 18.6% : 1 860 EUR
- **Total : 4 860 EUR** - CORRECT

### 5.4 LMNP Reel - CONFORME avec reserves - A FAIRE 

**Fichier** : `fiscalite.ts:187-245`

**Ce qui est correct** :
- Amortissement = bati + mobilier + travaux
- L'amortissement ne peut pas creer de deficit BIC (regle respectee : `fiscalite.ts:215`)
- Amortissement excedentaire signale (reportable sans limite)
- PS a 18.6%

**Reserves** :
1. **Amortissement simplifie** : 1 seule duree (33 ans pour le bati) au lieu de l'amortissement par composants (spec : gros oeuvre 50 ans, toiture 25 ans, agencements 15 ans, etc.)
   - Impact : sous-estimation de l'amortissement annuel de ~25%

2. **Report d'amortissement non gere dans le temps** : L'alerte est emise mais le montant reportable n'est pas cumule d'annee en annee dans les projections.

3. **Reintegration a la revente (depuis 02/2025)** : Non implementee. Les amortissements cumules doivent etre reintegres dans la plus-value lors de la cession. C'est un changement majeur qui reduit l'avantage reel du LMNP reel.

### 5.5 SCI a l'IS - CONFORME avec reserves - A FAIRE 

**Fichier** : `fiscalite.ts:253-314`

**Ce qui est correct** :
- IS progressif 15% / 25% avec seuil a 42 500 EUR
- Deduction interets + assurance + amortissement
- Flat Tax 30% sur dividendes distribues
- Distinction capitalisation vs distribution

**Reserves** :
1. **Pas de gestion du deficit IS** : Le code emet une alerte mais ne calcule pas le report du deficit sur les exercices suivants (reportable sans limite de duree, plafonne a 1 M EUR + 50% au-dela).

2. **Plus-value SCI IS non calculee** : En SCI IS, la plus-value est calculee sur la valeur nette comptable (prix - amortissements cumules), pas sur le prix d'achat. L'impot de plus-value est donc beaucoup plus eleve qu'en nom propre.

3. **Conditions du taux reduit** : Le taux IS 15% est soumis a conditions (CA < 10 M EUR, capital detenu a 75% minimum par personnes physiques). Non verifie par le simulateur.

### 5.6 Comparaison des regimes - BON - A FAIRE (sur des tranches de 5 ans jusqu'à 25 ans max)

**Fichier** : `fiscalite.ts:407-526`

L'implementation compare 6 regimes (micro-foncier, foncier reel, LMNP micro, LMNP reel, SCI IS capitalisation, SCI IS distribution) et identifie le plus avantageux sur la base du cashflow net annuel.

**Reserve** : La comparaison est faite sur l'annee 1 uniquement. Or certains regimes sont plus avantageux au debut (LMNP reel grace a l'amortissement) et moins sur le long terme. Une comparaison sur l'horizon de projection serait plus pertinente.

### 5.7 Calcul des interets deductibles An 1 - APPROXIMATION

**Fichier** : `fiscalite.ts:330-333`

```typescript
const interetsAnnuels = montant_emprunt * tauxInteret;  // Approximation
const assuranceAnnuelle = mensualite_assurance * 12;
```

Les interets de l'annee 1 sont approximes par `capital * taux` au lieu d'utiliser le tableau d'amortissement. En realite les interets An 1 sont legerement inferieurs car du capital est rembourse chaque mois.

**Impact** : Surestimation des interets deductibles de ~2-5% selon le taux et la duree. Cela avantage legerement les regimes reels dans la comparaison. Impact faible.

---

## 6. Audit de l'analyse HCSF

### 6.1 Taux d'endettement - CONFORME

**Fichier** : `hcsf.ts:68-76`

```
taux = charges_mensuelles / revenus_mensuels
```

### 6.2 Ponderation des revenus locatifs - CONFORME

**Fichier** : `hcsf.ts:81-94`

Les revenus locatifs sont ponderes a 70% conformement a la recommandation HCSF.

### 6.3 Mode nom propre - CONFORME avec reserves - A FAIRE 

**Fichier** : `hcsf.ts:130-204`

**Ce qui est correct** :
- Revenus d'activite + loyers ponderes a 70%
- Charges = credits existants + autres charges + nouveau credit
- Alerte si revenus estimes par TMI

**Reserves** :
1. **Estimation revenus par TMI** : Tres approximative. Un TMI 30% peut correspondre a un revenu imposable de 28 797 EUR (celibataire) ou 57 594 EUR (couple). L'estimation a 4 000 EUR/mois est une moyenne raisonnable mais peut etre tres eloignee de la realite.

2. **Pas de "reste a vivre"** prevu dans la specification mais non implemente. Les banques l'utilisent systematiquement en complement du taux d'endettement.

### 6.4 Mode SCI IS - CONFORME

**Fichier** : `hcsf.ts:214-333`

Le calcul par associe est correct :
- Quote-part de la mensualite au prorata des parts
- Revenus locatifs ponderes a 70%
- Conformite globale = TOUS les associes conformes

### 6.5 Capacite d'emprunt residuelle - CONFORME

**Fichier** : `hcsf.ts:99-118`

Calcul correct de la marge disponible convertie en capital empruntable.

**Reserve** : L'hypothese est fixee a 20 ans / 3.5%. Ces parametres devraient etre alignes sur les conditions saisies par l'utilisateur.

---

## 7. Audit des projections et du TRI

### 7.1 Projections pluriannuelles - ECART CRITIQUE - A FAIRE 

**Fichier** : `projection.ts:157-289`

**Ce qui fonctionne correctement** :
- Inflation des loyers et charges
- Revalorisation du bien
- Tableau d'amortissement du credit
- Patrimoine net = valeur bien - capital restant

**ECART CRITIQUE : Impots = 0 dans les projections**

```typescript
// projection.ts ligne 241
const impot = 0;  // Simplifie en MVP
```

**Impact** :
- Le cashflow projete est **surestime** de l'equivalent de l'impot annuel
- Le cashflow cumule sur 20 ans peut etre **faux de 30 000 a 80 000 EUR** selon le regime fiscal
- Le **TRI est surevalue** de 1 a 3 points de pourcentage
- L'**enrichissement total** affiche est incorrect

**Calcul d'impact concret** :
- Bien 200 000 EUR, loyer 10 000 EUR/an, TMI 30%, micro-foncier
- Impot annuel An 1 : ~3 300 EUR
- Sur 20 ans (avec inflation) : ~75 000 EUR cumules d'impots
- **Le cashflow cumule affiche est donc surevalue de ~75 000 EUR**

C'est le defaut le plus impactant du simulateur en termes de fiabilite des resultats presentes a l'utilisateur.

### 7.2 Tableau d'amortissement - CONFORME

**Fichier** : `projection.ts:63-150`

Le tableau d'amortissement du credit est mathematiquement correct (verification par recoupement des totaux). L'assurance est calculee sur capital initial (mode le plus courant).

### 7.3 Calcul du TRI - METHODOLOGIQUEMENT CORRECT, DONNEES FAUSSES -  A FAIRE 

**Fichier** : `projection.ts:16-54`

L'algorithme de Newton-Raphson est correctement implemente pour resoudre VAN = 0. Les cas limites sont geres (pas de convergence, TRI qui diverge).

**Mais** : Comme les flux de tresorerie ne tiennent pas compte des impots, le TRI calcule est le TRI avant impots, pas le TRI investisseur reel.

De plus, le TRI suppose une revente au patrimoine net (valeur bien - capital restant du) sans frais de cession, ni impot de plus-value, ni frais d'agence de revente (~5%).

### 7.4 Inflation des charges - PARTIELLEMENT CORRECT

Les charges fixes sont inflatees correctement. Cependant, les charges proportionnelles (gestion, provision travaux, vacance) sont calculees en % du loyer courant, ce qui les fait naturellement augmenter avec le loyer. C'est un comportement correct.

**Reserve** : La taxe fonciere est inflatee au meme taux que les autres charges (2.5%/an). En realite, la taxe fonciere peut augmenter beaucoup plus rapidement (revisions de valeurs locatives cadastrales + votes communes). Certaines villes ont connu des hausses de 10-15% en une annee.

---

## 8. Audit du scoring et de la synthese

### 8.1 Scoring sur 100 points - DIVERGENCE AVEC SPECIFICATION - A FAIRE 

**Fichier** : `synthese.ts:28-47`

**Implementation actuelle** :
| Critere | Points max | Base |
|---------|-----------|------|
| Autofinancement | 30 | Cashflow mensuel [-200, +200] EUR |
| Rentabilite | 30 | Renta nette [0, 10%] |
| HCSF | 25 | Conformite + confort |
| Bonus rentabilite | 15 | Si renta >= 10% |
| **Total** | **100** | |

**Specification metier** (section 7.3 de specification-calculs.md) :
| Critere | Methode |
|---------|---------|
| Score base | 40 points |
| Cashflow net impot | -20 a +20 |
| Rentabilite nette-nette | -15 a +20 |
| HCSF | -25 a +20 |
| DPE | -10 a +5 |
| Ratio prix/loyer | -5 a +10 |
| Reste a vivre | -10 a +5 |

**Ecarts** :
1. Le scoring actuel n'utilise pas le systeme a "base 40 + ajustements" de la spec
2. Criteres manquants : DPE, ratio prix/loyer, reste a vivre
3. La spec utilise la rentabilite nette-nette (apres impots), le code utilise la nette (avant impots)
4. La spec peut donner des malus (score negatif par critere), le code ne descend jamais en dessous de 0 par critere

**Impact** : Le score actuel est plus simple et plus "genereux" que la spec. Un investissement mediocre peut obtenir un score plus eleve que prevu.

### 8.2 Score interne (0-4) - COHERENT

**Fichier** : `synthese.ts:428-462`

Le score interne binaire (cashflow >= 0, renta >= 7%, HCSF conforme, bonus si renta >= 10%) est pertinent comme indicateur rapide. La recommandation textuelle generee est claire et utile.

### 8.3 Recommandations - BON

**Fichier** : `synthese.ts:257-384`

Les recommandations generees sont pertinentes et contextuelles :
- Recommandations cashflow negatif
- Optimisation rentabilite
- Optimisation fiscale (detection micro > reel potentiel)
- Solutions HCSF non conforme

---

## 9. Ecarts avec la specification metier

### Tableau recapitulatif des ecarts specification vs implementation

| Fonctionnalite (spec) | Statut implementation | Impact | Decision
|------------------------|----------------------|--------|----------
| Frais de notaire baremes | IMPLEMENTE | - | - 
| Deduction mobilier assiette notaire | IMPLEMENTE | - | - 
| Assurance sur capital restant du | NON IMPLEMENTE | Faible (peu utilise) | - 
| Deficit foncier (imputation + report) | NON IMPLEMENTE | Moyen | A faire 
| Amortissement par composants | NON IMPLEMENTE (simplifie) | Moyen | A faire 
| Reintegration amortissements revente LMNP | NON IMPLEMENTE | Eleve | A faire 
| Plus-value a la revente | NON IMPLEMENTE | Eleve | A faire 
| Reste a vivre HCSF | NON IMPLEMENTE | Moyen | A faire 
| DPE et alertes passoires energetiques | NON IMPLEMENTE | Moyen | A faire 
| Scoring avec DPE + ratio prix/loyer | NON IMPLEMENTE | Moyen | A faire 
| CSG deductible | NON IMPLEMENTE | Faible | - 
| Frais d'agence dans cout acquisition | NON IMPLEMENTE | Faible | A faire 
| Taux DMTO par departement | NON IMPLEMENTE (fixe 5%) | Faible | - 
| Impots dans les projections | NON IMPLEMENTE | CRITIQUE | A faire 
| Report deficit IS / amortissement differe | NON IMPLEMENTE | Moyen | A faire 
| VAN (Valeur Actuelle Nette) | NON IMPLEMENTE | Faible | - 
| Multiple sur capital investi | NON IMPLEMENTE | Faible | - 
| Rendement sur fonds propres | NON IMPLEMENTE | Faible | - 

---

## 10. Problemes de precision numerique

### 10.1 Double arrondi sur le cashflow mensuel

**Fichier** : `index.ts:106`

```typescript
mensuel: Math.round((rentabilite.cashflow_annuel - fiscalite.impot_total) / 12)
```

`cashflow_annuel` est deja arrondi a 2 decimales. La division par 12 puis l'arrondi a l'euro entier cree une perte :
- Annuel : 7 345.67 EUR
- Mensuel affiche : 612 EUR (7 345.67 / 12 = 612.14 arrondi)
- **Ecart cumule** : 612 * 12 = 7 344 EUR vs 7 345.67 EUR = 1.67 EUR/an

Sur 20 ans, l'ecart cumule peut atteindre ~30 EUR. Non significatif mais peut creer une incoherence visible entre le cashflow mensuel * 12 et le cashflow annuel affiche.

### 10.2 Chaine d'arrondis intermediaires

Chaque module arrondit ses sorties a 2 decimales. Les erreurs d'arrondi sont generalement < 1 EUR par calcul. Sur l'ensemble de la chaine, l'ecart maximal constate est de ~5 EUR sur un resultat final. Acceptable pour un simulateur.

### 10.3 Metriques denormalisees en BDD

Les simulations sauvegardees stockent des valeurs deja arrondies. Si les constantes fiscales changent, les anciennes simulations ne sont pas recalculees. Non critique si un versionning des constantes est ajoute.

---

## 11. Propositions d'amelioration

### P1 - CRITIQUE : Integrer la fiscalite dans les projections

**Effort estime** : 2-3 jours
**Impact** : Majeur - corrige le TRI et le cashflow cumule

Le module `fiscalite.ts` sait deja calculer l'impot annuel. Il suffit de l'appeler pour chaque annee de projection en tenant compte de :
- L'evolution des revenus (inflation loyer)
- L'evolution des charges (inflation charges)
- La degressivite des interets (tableau d'amortissement)
- L'amortissement (duree limitee)

```
Pour chaque annee n :
  impot(n) = calculerFiscalite(revenus(n), charges(n), interets(n), amortissement(n))
  cashflow_net(n) = cashflow_brut(n) - impot(n)
```

### P2 - IMPORTANT : Part terrain parametre

**Effort estime** : 0.5 jour
**Impact** : Ameliore la precision de l'amortissement

Options :
- **Option A** (simple) : Ajouter un champ `part_terrain` dans le formulaire avec valeur par defaut selon `type_bien` :
  - Appartement : 10%
  - Maison : 20%
  - Immeuble : 10%
- **Option B** (rapide) : Garder 15% mais adapter la valeur par defaut dans `validation.ts` selon le type de bien

### P3 - IMPORTANT : Deficit foncier

**Effort estime** : 1-2 jours
**Impact** : Moyen - ameliore la fiabilite du regime reel foncier

Implementer :
1. Calcul du deficit (charges + interets > revenus)
2. Separation : deficit hors interets (imputable sur revenu global, max 10 700 EUR) et deficit lie aux interets (reportable sur revenus fonciers)
3. Calcul de l'economie d'impot reelle : `min(deficit, 10 700) * TMI`
4. Report sur 10 ans dans les projections

### P4 - IMPORTANT : Calcul de plus-value a la revente

**Effort estime** : 2 jours
**Impact** : Moyen - necessaire pour les projections fiables

Implementer pour chaque horizon de projection :
1. **Nom propre** : Plus-value = prix_vente - prix_achat, avec abattements pour duree de detention (IR : 6%/an de la 6e a la 21e annee, 4% la 22e. PS : 1.65%/an de la 6e a la 21e, 1.6% la 22e, 9%/an au-dela)
2. **LMNP** : Depuis 02/2025, reintegration des amortissements deduits dans la plus-value
3. **SCI IS** : Plus-value = prix_vente - valeur_nette_comptable (prix - amortissements cumules). Imposition a l'IS puis flat tax si distribution.

### P5 - MOYEN : Amortissement par composants

**Effort estime** : 1 jour
**Impact** : Ameliore la precision pour le LMNP reel

Les constantes sont deja presentes dans `constants.ts:108-113` :
```typescript
COMPOSANTS: {
    GROS_OEUVRE: { PART: 0.40, DUREE: 50 },
    FACADE_TOITURE: { PART: 0.20, DUREE: 25 },
    INSTALLATIONS: { PART: 0.20, DUREE: 15 },
    AGENCEMENTS: { PART: 0.20, DUREE: 10 },
}
```

Il suffit de :
1. Ajouter une option "amortissement par composants" (vs simplifie)
2. Calculer la somme des amortissements par composant :
   `amort_total = sum(part_composant * valeur_amortissable / duree_composant)`

### P6 - MOYEN : Alignement du scoring avec la specification

**Effort estime** : 1 jour
**Impact** : Coherence metier

Modifier `synthese.ts` pour implementer le systeme "base 40 + ajustements" de la specification avec les criteres manquants (DPE, ratio prix/loyer, reste a vivre).

### P7 - FAIBLE : Reste a vivre dans l'analyse HCSF

**Effort estime** : 0.5 jour
**Impact** : Information supplementaire utile

```
reste_a_vivre = revenus_totaux - charges_totales
seuil = 700 EUR (celibataire) / 1 000 EUR (couple) + 300 EUR par enfant
```

### P8 - FAIBLE : Effet de levier avec apport = 0 - RETIRER L'EFFET DE LEVIER DE LA SIMULATION

**Effort estime** : 0.5 heure
**Impact** : Fiabilite de l'affichage

Retourner `null` ou un message specifique au lieu d'un nombre artificiel.

### P9 - EVOLUTION : Assurance sur capital restant du - A FAIRE 

**Effort estime** : 1 jour
**Impact** : Precision du calcul d'assurance (economies en fin de credit)

Ajouter le mode `capital_restant_du` en calculant l'assurance mois par mois sur le capital restant. L'economie peut etre significative (30-40% sur le cout total de l'assurance).

### P10 - EVOLUTION : Frais de revente dans le TRI - A FAIRE 

**Effort estime** : 0.5 jour
**Impact** : TRI plus realiste

Deduire du dernier flux :
- Frais d'agence de revente (~5% du prix de vente)
- Impot de plus-value (cf. P4)
- Diagnostics obligatoires (~500 EUR)

---

## 12. Matrice de risque

### Risque de presentation de resultats faux a l'utilisateur

| Element | Ampleur de l'ecart | Frequence | Risque global | Retour Metier |
|---------|-------------------|-----------|---------------|---------------|
| TRI sans impots | 1-3 points de % | Systematique | CRITIQUE | A faire |
| Cashflow cumule sans impots | 30 000-80 000 EUR sur 20 ans | Systematique | CRITIQUE | A faire |
| Amortissement simplifie | ~25% en moins | Regimes reels | MOYEN | A faire |
| Part terrain fixe 15% | 0-300 EUR/an sur amort. | Regimes reels | MOYEN | A faire |
| Deficit foncier non gere | Economie d'impot non montree | Regime reel foncier | MOYEN | A faire |
| Plus-value non calculee | Indicateur absent | Projections long terme | MOYEN | A faire |
| DMTO fixe a 5% | 0-0.5% du prix | Dpts non majores | FAIBLE | - |
| Effet de levier apport=0 | Valeur aberrante | Cas rare | FAIBLE | - |
| Interets An1 approximes | 2-5% d'ecart sur interets | Systematique | FAIBLE | - |
| Double arrondi cashflow | ~30 EUR sur 20 ans | Systematique | NEGLIGEABLE | - |

---

## 13. Plan d'action recommande

### Phase 1 - Corrections prioritaires (fiabilite des resultats)

| # | Action | Priorite | Effort | Impact |
|---|--------|----------|--------|--------|
| 1 | Integrer impots dans projections | P0 | 2-3j | Corrige TRI et cashflow |
| 2 | Part terrain parametree par type de bien | P1 | 0.5j | Ameliore amortissement |
| 3 | Corriger effet de levier apport=0 | P1 | 0.5h | Evite affichage aberrant |

### Phase 2 - Enrichissements metier (precision)

| # | Action | Priorite | Effort | Impact |
|---|--------|----------|--------|--------|
| 4 | Implementer deficit foncier | P2 | 1-2j | Fiabilise regime reel |
| 5 | Amortissement par composants | P2 | 1j | Fiabilise LMNP reel |
| 6 | Calcul de plus-value a la revente | P2 | 2j | Complete les projections |
| 7 | Aligner scoring avec specification | P2 | 1j | Coherence metier |

### Phase 3 - Evolutions (completude)

| # | Action | Priorite | Effort | Impact |
|---|--------|----------|--------|--------|
| 8 | Reste a vivre HCSF | P3 | 0.5j | Info complementaire |
| 9 | Frais de revente dans TRI | P3 | 0.5j | TRI realiste |
| 10 | Assurance capital restant du | P3 | 1j | Option avancee |
| 11 | DPE et alertes passoires | P3 | 1j | Conformite reglementaire |
| 12 | Reintegration amortissements LMNP | P3 | 1j | LF 2025 |

### Questions a trancher avec le metier

1. **Amortissement simplifie ou par composants ?** Le simplifie est plus facile a comprendre pour l'utilisateur mais moins precis. L'amortissement par composants est ce que fait un expert-comptable en reel. => On conserve la version simplifiée.

2. **Part terrain par defaut** : 10% (appartement), 15% (immeuble), 20% (maison) - ces valeurs sont-elles acceptables ou faut-il que l'utilisateur puisse les saisir ? => On conserve les valeurs par defaut.

3. **DMTO** : Faut-il ajouter un selecteur de departement pour appliquer le bon taux (4.5% vs 5%), ou garder 5% par defaut ? => On garde 5% par defaut.

4. **Scoring** : Doit-on implementer le scoring de la specification (avec DPE, ratio prix/loyer) ou garder le systeme actuel plus simple ? => On garde le systeme actuel plus simple.

5. **Projections avec impots** : Faut-il calculer les impots chaque annee (plus precis mais complexe) ou appliquer l'impot An 1 a chaque annee (approximation acceptable) ? => On conserve l'approximation acceptable.

6. **Assurance pret** : Le mode "capital restant du" est-il une priorite pour les utilisateurs ? => On conserve le mode actuel.

7. **Plus-value** : Faut-il la calculer pour chaque horizon (5, 10, 15, 20, 25 ans) ou seulement a l'horizon choisi ? => On conserve l'horizon choisi.

---

## Annexe A : Fichiers audites

| Fichier | Lignes | Role |
|---------|--------|------|
| `src/config/constants.ts` | 139 | Constantes reglementaires |
| `src/server/calculations/index.ts` | 170 | Orchestrateur principal |
| `src/server/calculations/types.ts` | 288 | Types TypeScript |
| `src/server/calculations/validation.ts` | 167 | Validation + normalisation |
| `src/server/calculations/rentabilite.ts` | 247 | Financement + charges + rendements |
| `src/server/calculations/fiscalite.ts` | 527 | Tous regimes fiscaux |
| `src/server/calculations/hcsf.ts` | 440 | Analyse HCSF |
| `src/server/calculations/projection.ts` | 290 | Projections + TRI + amortissement |
| `src/server/calculations/synthese.ts` | 515 | Scoring + recommandations |
| `src/app/api/calculate/route.ts` | ~250 | API de calcul |
| `src/app/api/pdf/route.ts` | ~200 | Generation PDF |
| `src/app/api/simulations/route.ts` | ~200 | CRUD simulations |
| `src/stores/calculateur.store.ts` | ~400 | Store Zustand |
| `docs/core/specification-calculs.md` | 1187 | Specification metier |

## Annexe B : Verification croisee - Simulation de reference

### Donnees d'entree

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

### Resultats attendus (calcul manuel)

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

Ce scenario de reference peut servir de test de non-regression pour valider les corrections futures.
