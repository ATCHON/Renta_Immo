# Spécification des Scénarios de Tests d'Intégration

> **Version :** 1.0 — 2026-02-23
> **Lien audit :** `docs/audit/fonctionnel/revue-audit.md` (revue indépendante 2026-02-23)
> **Config de référence :** `docs/tests/test-integration/01-config-reference.md`

Ce document spécifie chaque scénario de test d'intégration : règle testée, données d'entrée, calculs attendus et fichier de test associé.

---

## Groupe 1 — Revenus Fonciers (Location Nue)

**Fichier de test :** `tests/integration/scenarios/01-revenus-fonciers.test.ts`

### SC-01 — Micro-foncier : abattement 30 %

**Règle :** CGI Art.32 — Abattement forfaitaire 30 % sur revenus fonciers bruts si loyers annuels ≤ 15 000 €.

**Données d'entrée :**

- Loyer mensuel : 800 € (→ 9 600 €/an < 15 000 € → éligible micro-foncier)
- Régime fiscal : `micro_foncier`, Type location : `nue`, TMI : 30 %

**Calculs attendus :**

```
Base imposable = 9 600 × (1 − 0,30) = 6 720 €
IR = 6 720 × 30 % = 2 016 €
PS (foncier) = 6 720 × 17,2 % = 1 155,84 €
Total impôt ≈ 3 172 €
```

**Assertions :**

- `fiscalite.regime` = `'Location Nue (Micro-foncier)'`
- `fiscalite.impot_estime` ∈ [3 000, 3 350]

---

### SC-02 — Déficit foncier : économie IR plafonnée à 10 700 €

**Règle :** CGI Art.156 I-3° — Les charges foncières hors intérêts d'emprunt imputables sur le revenu global sont plafonnées à 10 700 €/an.

**Données d'entrée :**

- Loyer mensuel : 700 € (→ 8 400 €/an)
- Travaux : 15 000 €, Charges fixes ≈ 1 300 €/an
- Régime fiscal : `reel`, TMI : 30 %

**Calculs attendus :**

```
Charges hors intérêts = travaux (15 000) + charges fixes (1 300) = 16 300 €
Déficit hors intérêts = 16 300 − 8 400 = 7 900 €
Imputable sur revenu global = min(7 900, 10 700) = 7 900 € (< plafond)
Économie IR = 7 900 × 30 % = 2 370 €
→ impot_estime < 0 et > −4 000 (plafond économie = 10 700 × 30 % = 3 210 €)
```

**Assertions :**

- `fiscalite.regime` = `'Location Nue (Réel)'`
- `fiscalite.impot_estime` < 0
- `fiscalite.impot_estime` > −4 000

---

### SC-03 — Déficit majoré énergie : plafond 21 400 €

**Règle :** CGI Art.156 (LF 2023, période 2023-2025) — Plafond majoré à 21 400 € pour travaux de rénovation énergétique sur passoires thermiques.

**Données d'entrée :**

- Loyer mensuel : 700 €/mois, Travaux : 30 000 €
- `renovation_energetique = true`, `dpe = 'F'`
- Régime fiscal : `reel`, TMI : 30 %

**Calculs attendus :**

```
Déficit important (travaux 30 000 > loyers 8 400 + charges)
Plafond majoré 21 400 € appliqué (vs 10 700 € standard)
Économie max = 21 400 × 30 % = 6 420 €
→ impot_estime < 0 et > −7 500
```

**Assertions :**

- `fiscalite.impot_estime` < 0
- `fiscalite.impot_estime` > −7 500

---

### SC-04 — Foncier réel positif : IR + PS sur revenu net

**Règle :** CGI Art.28 — Le revenu net foncier (loyers − charges déductibles) est imposé à l'IR + PS 17,2 %.

**Données d'entrée :**

- Loyer mensuel : 1 200 € (→ 14 400 €/an), Charges : copro 80 €/mois, TF 1 200 €/an, PNO 150 €/an
- Régime fiscal : `reel`, TMI : 30 %

**Assertions :**

- `fiscalite.regime` = `'Location Nue (Réel)'`
- `fiscalite.impot_estime` > 0

---

## Groupe 2 — LMNP (Loueur en Meublé Non Professionnel)

**Fichier de test :** `tests/integration/scenarios/02-lmnp.test.ts`

### SC-05 — LMNP Micro-BIC longue durée : abattement 50 %

**Règle :** CGI Art.50-0 — Abattement forfaitaire 50 % sur recettes BIC meublée longue durée si CA ≤ 77 700 €.

**Données d'entrée :**

- Loyer mensuel : 900 € (→ 10 800 €/an < 77 700 €)
- Régime fiscal : `lmnp_micro`, Type location : `meublee_longue_duree`, TMI : 30 %

**Calculs attendus :**

```
Base imposable = 10 800 × (1 − 0,50) = 5 400 €
IR = 5 400 × 30 % = 1 620 €
PS (BIC LMNP) = 5 400 × 18,6 % = 1 004,40 €  ← LFSS 2026
Total ≈ 2 624 €
```

**Assertions :**

- `fiscalite.regime` = `'LMNP (Micro-BIC)'`
- `fiscalite.impot_estime` ∈ [2 400, 2 900]

> **Note :** Le taux PS 18,6 % (LFSS 2026) s'applique aux revenus BIC LMNP, contre 17,2 % pour les revenus fonciers classiques.

---

### SC-06 — LMNP Micro-BIC tourisme classé : abattement 71 %

**Règle :** CGI Art.50-0 (modifié LF 2024) — Abattement 71 % sur meublé de tourisme classé si CA ≤ 188 700 €.

**Données d'entrée :**

- Loyer mensuel : 2 500 € (→ 30 000 €/an < 188 700 €)
- Type location : `meublee_tourisme_classe`, Régime : `lmnp_micro`, TMI : 30 %

**Calculs attendus :**

```
Base imposable = 30 000 × (1 − 0,71) = 8 700 €
IR = 8 700 × 30 % = 2 610 €
PS (BIC LMNP) = 8 700 × 18,6 % = 1 618,20 €
Total ≈ 4 228 €
```

**Assertions :**

- `fiscalite.impot_estime` ∈ [3 900, 4 600]

---

### SC-07 — LMNP Micro-BIC tourisme non classé : abattement 30 %

**Règle :** CGI Art.50-0 (modifié LF 2024) — Abattement réduit à 30 % pour meublés de tourisme non classés, plafond 15 000 €.

**Données d'entrée :**

- Loyer mensuel : 1 100 € (→ 13 200 €/an < 15 000 €)
- Type location : `meublee_tourisme_non_classe`, Régime : `lmnp_micro`, TMI : 30 %

**Calculs attendus :**

```
Base imposable = 13 200 × (1 − 0,30) = 9 240 €
IR = 9 240 × 30 % = 2 772 €
PS (BIC LMNP) = 9 240 × 18,6 % = 1 718,64 €
Total ≈ 4 491 €
```

**Assertions :**

- `fiscalite.impot_estime` ∈ [4 100, 4 900]

---

### SC-08 — LMNP Réel : base imposable nulle (Art.39C)

**Règle :** CGI Art.39C — Les amortissements déductibles sont plafonnés au bénéfice résiduel (après charges hors amortissements). L'amortissement ne peut pas créer ni aggraver un déficit BIC.

**Données d'entrée :**

- Prix achat : 200 000 €, Valeur mobilier : 5 000 €
- Loyer mensuel : 900 € (→ 10 800 €/an)
- Régime fiscal : `lmnp_reel`, TMI : 30 %

**Calculs attendus :**

```
Valeur bâti = 200 000 × 85 % = 170 000 €
Amort. annuel bâti = 170 000 / 33 ≈ 5 152 €
Amort. annuel mobilier = 5 000 / 10 = 500 €
Total amortissements = 5 652 €
Bénéfice résiduel (avant amort.) = loyers − charges − intérêts
→ Amort. déductible = min(bénéfice résiduel, 5 652)
→ Si bénéfice résiduel < 5 652 € : base imposable = 0, impôt = 0
```

**Assertions :**

- `fiscalite.regime` = `'LMNP (Réel)'`
- `fiscalite.impot_estime` = 0

---

### SC-09 — LMNP Réel : bénéfice résiduel positif

**Règle :** CGI Art.39C — Si les revenus dépassent largement les amortissements disponibles, une base imposable résiduelle subsiste.

**Données d'entrée :**

- Mobilier : 1 000 € (amort. mobilier = 100 €/an seulement)
- Loyer mensuel : 2 000 € (→ 24 000 €/an — revenus élevés)
- Régime fiscal : `lmnp_reel`, TMI : 41 %

**Assertion :**

- `fiscalite.impot_estime` > 0

---

### SC-10 — Alerte seuil LMP : loyers > 20 000 €/an

**Règle :** CGI Art.155 IV — Seuil LMP à 23 000 €/an. Alerte interne dès 20 000 €/an.

**Données d'entrée :**

- Loyer mensuel : 1 800 € (→ 21 600 €/an > 20 000 € seuil alerte)
- Régime fiscal : `lmnp_reel`

**Assertions :**

- Message d'alerte présent dans `result.alertes` ou `synthese.points_attention`
- Match regex : `/lmp|loueur.*meublé.*professionnel/i`

---

## Groupe 3 — SCI à l'Impôt sur les Sociétés

**Fichier de test :** `tests/integration/scenarios/03-sci-is.test.ts`

### SC-11 — SCI IS capitalisation : IS calculé, pas de Flat Tax

**Règle :** CGI Art.219 — IS 15 % jusqu'à 42 500 € de bénéfice, 25 % au-delà. En capitalisation : aucun dividende distribué → pas de Flat Tax.

**Données d'entrée (base SCI) :**

- Prix achat : 250 000 €, Mobilier : 10 000 €, Loyer mensuel : 3 000 €
- Type : `sci_is`, `distribution_dividendes = false`

**Assertions :**

- `fiscalite.regime` match `/SCI.*IS.*Capitalisation/i`
- `fiscalite.impot_estime` > 0

---

### SC-12 — SCI IS distribution : IS + Flat Tax 30 %

**Règle :** CGI Art.200A — La Flat Tax (PFU 30 %) s'applique sur les **dividendes distribués** = résultat net comptable après IS.

**Note importante (revue-audit.md E-01) :** La base d'application de la Flat Tax est le résultat net **comptable** (après amortissements), pas la trésorerie disponible. Ces deux concepts sont distincts.

**Données d'entrée :**

- Mêmes données base SCI, `distribution_dividendes = true`

**Assertions :**

- `fiscalite.regime` match `/SCI.*IS.*Distribution/i`
- `fiscalite.impot_estime` (distribution) > `fiscalite.impot_estime` (capitalisation)

---

### SC-13 — SCI IS taux normal : bénéfice > 42 500 €

**Règle :** CGI Art.219 — Au-delà de 42 500 € de bénéfice imposable, le taux normal de 25 % s'applique sur la tranche excédentaire.

**Données d'entrée :**

- Loyer mensuel : 8 000 € (→ 96 000 €/an) pour générer un bénéfice > 42 500 €

**Assertions :**

- IS total > 42 500 × 15 % = 6 375 € (implique l'application du taux normal 25 % sur l'excédent)

---

## Groupe 4 — Analyse HCSF

**Fichier de test :** `tests/integration/scenarios/04-hcsf.test.ts`

### SC-14 — HCSF conforme : taux endettement < 35 %

**Règle :** Décision HCSF 2024 — Taux d'endettement = mensualités / revenus pondérés ≤ 35 %.

**Données d'entrée :**

- Revenus activité : 4 000 €/mois, Crédits existants : 0
- Loyer mensuel : 900 € (pondéré 70 % = 630 €)

**Calculs attendus :**

```
Mensualité nouveau crédit ≈ 800 €/mois
Revenus pondérés = 4 000 + 630 = 4 630 €/mois
Taux endettement = 800 / 4 630 = 17,3 % < 35 % → CONFORME
```

**Assertions :**

- `hcsf.conforme` = `true`
- `hcsf.taux_endettement` < 0,35

---

### SC-15 — HCSF non conforme : taux > 35 %

**Règle :** Décision HCSF 2024 — Taux > 35 % → non finançable aux conditions standard.

**Données d'entrée :**

- Revenus activité : 2 000 €/mois, Crédits existants : 600 €/mois
- Gros emprunt : apport 10 000 €, durée 25 ans

**Assertions :**

- `hcsf.conforme` = `false`
- `hcsf.taux_endettement` > 0,35

---

### SC-16 — HCSF VEFA : durée 26 ans acceptée (dérogation 27 ans)

**Règle :** Décision HCSF 2024 — Dérogation VEFA : durée max 27 ans (vs 25 ans pour biens existants). Correction REC-04.

**Données d'entrée :**

- `is_vefa = true`, `etat_bien = 'neuf'`
- Durée emprunt : 26 ans (> 25 ans standard, ≤ 27 ans VEFA)
- Revenus activité : 5 000 €/mois

**Assertions :**

- `hcsf.conforme` = `true` (26 ans < max VEFA 27 ans)

---

### SC-17 — GLI pondération 80 % : taux endettement amélioré

**Règle :** V2-S18 — Avec GLI souscrite, la pondération des loyers peut passer à 80 % (vs 70 % par défaut), réduisant le taux d'endettement calculé.

**Données d'entrée :**

- Revenus activité : 3 000 €/mois, `assurance_gli` > 0
- Comparaison : 70 % vs `ponderation_loyers = 80`

**Assertions :**

- `hcsf.taux_endettement` (80 %) ≤ `hcsf.taux_endettement` (70 %)

---

## Groupe 5 — Plus-Value et DPE

**Fichier de test :** `tests/integration/scenarios/05-plus-value-dpe.test.ts`

### SC-18 — PV sans abattement (< 5 ans) : IR 19 % + PS 17,2 %

**Règle :** CGI Art.150VC — Aucun abattement IR ni PS pour détention < 5 ans.

**Données d'entrée :**

- Prix achat : 100 000 €, Prix revente : 150 000 €, Durée : 3 ans, Apport = 100 000 € (cash)

**Calculs attendus :**

```
Prix acquisition corrigé (BOFiP) = 100 000 × (1 + 7,5 %) = 107 500 €
PV brute = 150 000 − 107 500 = 42 500 €
Abattement IR = 0 % (< 5 ans)
PV nette IR = 42 500 € < 50 000 € → pas de surtaxe
Impôt IR = 42 500 × 19 % = 8 075 €
Impôt PS = 42 500 × 17,2 % = 7 310 €
Total ≈ 15 385 €
```

**Assertions :**

- `pv.plus_value_brute` ≈ 42 500 € (±100 €)
- `pv.abattement_ir` = 0, `pv.surtaxe` = 0
- `pv.impot_ir` ≈ 8 075 € (±100 €)
- `pv.impot_ps` ≈ 7 310 € (±100 €)

---

### SC-19 — Surtaxe PV tranche 200–250k : taux 5 % (NC-02 corrigée)

**Règle :** CGI Art.1609 nonies G — Barème surtaxe PV > 50 000 €. La tranche 200–250k est à 5 % (correction NC-02 du 2026-02-18).

**Données d'entrée :**

- Prix achat : 100 000 €, Prix revente : 400 000 €, Durée : 3 ans

**Assertions :**

- `pv.surtaxe` > 0
- Si `pv.plus_value_nette_ir` ∈ [200 001, 250 000] : surtaxe = cumul tranches précédentes + (PV − 200 000) × 5 % (et non 6 %)

---

### SC-20 — DPE F : décote 15 % valeur terminale + alerte passoire

**Règle :** Loi Climat-Résilience L.2021-1104 — Décote de valeur de 15 % appliquée à la valeur terminale projetée pour les DPE F/G.

**Données d'entrée :**

- Prix achat : 150 000 €, DPE : `'F'`, Horizon : 10 ans

**Calculs attendus :**

```
Valeur revalorisée (avant décote) = 150 000 × (1 + 1 %)^10 = 165 675 €
Valeur terminale avec décote = 165 675 × (1 − 15 %) = 140 824 € < 150 000 €
```

**Assertions :**

- `projections.projections[9].valeurBien` < 150 000 €
- Message d'alerte DPE présent (regex `/dpe|passoire|énergi/i`)

---

### SC-21 — Loi Le Meur : amortissements réintégrés dans la PV

**Règle :** LF 2025 (Loi Le Meur, entrée en vigueur 15/02/2025) — Pour les LMNP réel (hors résidences de services), les amortissements immobiliers déduits sont réintégrés dans la base de calcul de la plus-value à la revente.

**Données d'entrée :**

- Prix achat : 200 000 €, Mobilier : 5 000 €, LMNP réel
- Horizon : 10 ans, Prix revente : 250 000 €

**Assertions :**

- `pv.amortissements_reintegres` > 0
- `pv.plus_value_brute` > prix_vente − prix_achat × (1 + 7,5 %) (augmentée par la réintégration)

---

## Groupe 6 — Scoring et Projections

**Fichier de test :** `tests/integration/scenarios/06-scoring-projections.test.ts`

### SC-22 — Scoring dual profil Rentier/Patrimonial

**Règle :** V2-S16 — Le simulateur calcule deux scores distincts selon le profil d'investisseur, avec des pondérations différentes (cashflow × 1,5 pour Rentier, DPE × 1,5 pour Patrimonial).

**Données d'entrée :**

- Bien DPE E (impact différencié selon le profil)
- Deux runs : `profil_investisseur = 'rentier'` et `profil_investisseur = 'patrimonial'`

**Assertions :**

- `synthese.scores_par_profil.rentier` est défini
- `synthese.scores_par_profil.patrimonial` est défini
- `synthese.score_global` ∈ [0, 100]

---

### SC-23 — Apport = 0 : alerte TRI non significatif

**Règle :** REC-05 (correction audit 2026-02-18) — Un TRI calculé sans apport est mathématiquement non significatif. Une alerte explicite doit être générée.

**Données d'entrée :** `apport = 0` (financement 110 %)

**Assertions :**

- Message d'alerte présent dans alertes ou points_attention, match `/tri|apport/i`

---

### SC-24 — Reste à vivre < 1 000 €/mois : alerte danger

**Règle :** Décision HCSF / pratique bancaire — Un reste à vivre inférieur à 1 000 €/mois déclenche une alerte de fragilité financière.

**Données d'entrée :**

- Revenus activité : 1 500 €/mois, Crédits existants : 300 €/mois
- Gros emprunt (apport 5 000 €, durée 25 ans)

**Assertions :**

- Soit `hcsf.conforme` = `false`, soit message d'alerte reste-à-vivre présent (`/reste|vivre/i`)

---

### SC-25 — Projections 20 ans : hypothèses inflation exposées

**Règle :** REC-03 (correction audit 2026-02-18) — Les hypothèses d'inflation utilisées dans les projections doivent être exposées dans le résultat pour transparence.

**Données d'entrée :** `horizon_projection = 20`

**Assertions :**

- `projections.hypotheses.inflationLoyer` = 0,015 (1,5 %/an)
- `projections.hypotheses.inflationCharges` = 0,02 (2 %/an)
- `projections.hypotheses.revalorisationBien` = 0,01 (1 %/an)
- `projections.projections.length` = 20

---

## Groupe 7 — Conformité Fiscale 2026

**Fichier de test :** `tests/integration/fiscal-conformity.test.ts`

### CF-01 — PS BIC LMNP = 18,6 % (LFSS 2026)

**Règle :** LFSS 2026 — CSG sur les revenus BIC LMNP portée à 10,60 %, total PS = 18,60 %.

**Note (revue-audit.md E-04) :** La distinction 18,6 % BIC / 17,2 % foncier a été confirmée par l'utilisateur le 2026-02-23. Une vérification sur Légifrance est recommandée si cette distinction est remise en question.

**Calcul :** Base = 5 400 € (micro-BIC 50 %) → PS = 5 400 × 18,6 % = 1 004,40 €

**Assertion :** `fiscalite.impot_estime` ≈ 1 004 € (±5 €) avec TMI = 0 %

---

### CF-02 — PS revenus fonciers = 17,2 %

**Calcul :** Base = 6 720 € (micro-foncier 30 %) → PS = 6 720 × 17,2 % = 1 155,84 €

**Assertion :** `fiscalite.impot_estime` ≈ 1 156 € (±5 €) avec TMI = 0 %

---

### CF-03 — Flat Tax SCI distribution = 30 %

**Règle :** CGI Art.200A — PFU 30 % = 12,8 % IR + 17,2 % PS sur dividendes distribués.

**Assertion :** `fiscalite.regime` match `/Distribution/i`

---

### CF-04 — IS taux réduit 15 % sur tranche ≤ 42 500 €

**Règle :** CGI Art.219 (LF 2023) — Taux réduit 15 % pour PME/SCI sur tranche ≤ 42 500 €.

**Assertion :** Entrée SCI capitalisation présente dans `comparaisonFiscalite.items`

---

### CF-05 — Barème surtaxe PV tranche 200–250k à 5 % (NC-02)

**Règle :** CGI Art.1609 nonies G — Vérification du taux 5 % (correction NC-02).

**Formule vérification pour PV nette ∈ [200 001, 250 000] :**

```
Surtaxe = 50 000×2 % + 50 000×3 % + 50 000×4 % + (PV−200 000)×5 %
        = 1 000 + 1 500 + 2 000 + (PV−200 000)×5 %
```

**Assertion :** `pv.surtaxe` ≈ surtaxe attendue (±10 €)

---

### CF-06 — Exonération IR totale à 22 ans de détention

**Règle :** CGI Art.150VC — Abattement IR = 100 % à 22 ans (96 % à 21 ans + 4 % l'an 22).

**Assertions :**

- `pv.abattement_ir` = 1 (100 %)
- `pv.impot_ir` = 0

---

### CF-07 — Abattement PS progressif : 1,65 %/an (ans 6 à 21)

**Règle :** CGI Art.150VD.

**Calcul pour 10 ans :** (10 − 5) × 1,65 % = 8,25 %

**Assertion :** `pv.abattement_ps` ≈ 0,0825 (±0,001)

---

### CF-08 — Formule PMT : mensualité crédit standard

**Règle :** Convention PMT taux proportionnel — standard français pour les crédits immobiliers.

**Formule :** `M = K × i / (1 − (1 + i)^−n)` avec `i = taux_annuel / 12`

**Assertion :** `financement.mensualite` ≈ PMT calculé (±1 €)

---

## Tableau Récapitulatif

| Code  | Groupe      | Règle                                          | Fichier                          |
| ----- | ----------- | ---------------------------------------------- | -------------------------------- |
| SC-01 | Foncier     | CGI Art.32 — Micro-foncier 30 %                | `01-revenus-fonciers.test.ts`    |
| SC-02 | Foncier     | CGI Art.156 — Déficit foncier 10 700 €         | `01-revenus-fonciers.test.ts`    |
| SC-03 | Foncier     | CGI Art.156 LF2023 — Déficit majoré 21 400 €   | `01-revenus-fonciers.test.ts`    |
| SC-04 | Foncier     | CGI Art.28 — Foncier réel IR+PS                | `01-revenus-fonciers.test.ts`    |
| SC-05 | LMNP        | CGI Art.50-0 — Micro-BIC longue durée 50 %     | `02-lmnp.test.ts`                |
| SC-06 | LMNP        | CGI Art.50-0 LF2024 — Tourisme classé 71 %     | `02-lmnp.test.ts`                |
| SC-07 | LMNP        | CGI Art.50-0 LF2024 — Tourisme non classé 30 % | `02-lmnp.test.ts`                |
| SC-08 | LMNP        | CGI Art.39C — Amortissements plafonnés         | `02-lmnp.test.ts`                |
| SC-09 | LMNP        | CGI Art.39C — Bénéfice résiduel positif        | `02-lmnp.test.ts`                |
| SC-10 | LMNP        | CGI Art.155 IV — Alerte seuil LMP              | `02-lmnp.test.ts`                |
| SC-11 | SCI IS      | CGI Art.219 — IS capitalisation                | `03-sci-is.test.ts`              |
| SC-12 | SCI IS      | CGI Art.200A — IS + Flat Tax distribution      | `03-sci-is.test.ts`              |
| SC-13 | SCI IS      | CGI Art.219 — Taux normal 25 %                 | `03-sci-is.test.ts`              |
| SC-14 | HCSF        | HCSF 2024 — Taux < 35 % conforme               | `04-hcsf.test.ts`                |
| SC-15 | HCSF        | HCSF 2024 — Taux > 35 % non conforme           | `04-hcsf.test.ts`                |
| SC-16 | HCSF        | HCSF 2024 — VEFA 27 ans (REC-04)               | `04-hcsf.test.ts`                |
| SC-17 | HCSF        | V2-S18 — GLI pondération 80 %                  | `04-hcsf.test.ts`                |
| SC-18 | PV          | CGI Art.150VC — PV sans abattement < 5 ans     | `05-plus-value-dpe.test.ts`      |
| SC-19 | PV          | CGI Art.1609 nonies G — Surtaxe 5 % NC-02      | `05-plus-value-dpe.test.ts`      |
| SC-20 | DPE         | Loi Climat-Résilience — DPE F décote 15 %      | `05-plus-value-dpe.test.ts`      |
| SC-21 | PV          | LF 2025 Loi Le Meur — Réintégration amort.     | `05-plus-value-dpe.test.ts`      |
| SC-22 | Scoring     | V2-S16 — Dual profil Rentier/Patrimonial       | `06-scoring-projections.test.ts` |
| SC-23 | Scoring     | REC-05 — Alerte TRI apport = 0                 | `06-scoring-projections.test.ts` |
| SC-24 | HCSF        | HCSF — Reste à vivre < 1 000 €/mois            | `06-scoring-projections.test.ts` |
| SC-25 | Projections | REC-03 — Hypothèses inflation transparentes    | `06-scoring-projections.test.ts` |
| CF-01 | Conformité  | LFSS 2026 — PS BIC LMNP 18,6 %                 | `fiscal-conformity.test.ts`      |
| CF-02 | Conformité  | Historique — PS foncier 17,2 %                 | `fiscal-conformity.test.ts`      |
| CF-03 | Conformité  | CGI Art.200A — Flat Tax 30 %                   | `fiscal-conformity.test.ts`      |
| CF-04 | Conformité  | CGI Art.219 — IS taux réduit 15 %              | `fiscal-conformity.test.ts`      |
| CF-05 | Conformité  | CGI Art.1609 nonies G — Surtaxe 5 % NC-02      | `fiscal-conformity.test.ts`      |
| CF-06 | Conformité  | CGI Art.150VC — Exonération IR 22 ans          | `fiscal-conformity.test.ts`      |
| CF-07 | Conformité  | CGI Art.150VD — Abattement PS 1,65 %/an        | `fiscal-conformity.test.ts`      |
| CF-08 | Conformité  | PMT standard — Mensualité crédit               | `fiscal-conformity.test.ts`      |
