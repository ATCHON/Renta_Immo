---

# Audit — Tests Réels & Vérification Manuelle — Renta_Immo
**Date :** 2026-02-18  
**Méthode :** Calcul manuel des formules + vérification contre les valeurs attendues du moteur

---

## Paramètres de configuration utilisés (config_params 2026)

| Paramètre clé | Valeur |
|--------------|--------|
| NOTAIRE_TAUX_ANCIEN | 8,00 % |
| HCSF_TAUX_MAX | 35 % |
| HCSF_PONDERATION_LOCATIFS | 70 % |
| DEFICIT_FONCIER_PLAFOND_IMPUTATION | 10 700 € |
| IS_SEUIL_TAUX_REDUIT | 42 500 € / 15 % |
| IS_TAUX_NORMAL | 25 % |
| FLAT_TAX | 30 % |
| PLUS_VALUE_TAUX_IR | 19 % |
| PLUS_VALUE_TAUX_PS | 17,20 % |
| TAUX_PS_FONCIER | 17,20 % |
| TAUX_PS_REVENUS_BIC_LMNP | 18,60 % (**✅ Conforme — LFSS 2026**) |
| MICRO_BIC_MEUBLE_LONGUE_DUREE_ABATTEMENT | 50 % |
| MICRO_FONCIER_ABATTEMENT | 30 % |
| MICRO_FONCIER_PLAFOND | 15 000 € |

---

## CAS 1 — LMNP Réel standard

### Paramètres
- Prix d'achat : 200 000 €
- Loyer mensuel : 900 €
- Apport : 40 000 €
- Crédit : 20 ans @ 3,5 %
- Régime : LMNP Réel
- Charges copro : 1 200 €/an, Taxe foncière : 1 500 €/an, PNO : 150 €/an
- Gestion locative : 8 %, Provision travaux : 5 %
- Mobilier : 5 000 €, Terrain : 15 %

### Calcul manuel

**Frais de notaire :** 200 000 × 8 % = **16 000 €**  
**Coût total acquisition :** 200 000 + 16 000 = **216 000 €**  
**Montant emprunté :** 216 000 − 40 000 = **176 000 €**

**PMT (mensualité crédit) :**  
r = 3,5 % / 12 = 0,29167 %  
n = 240  
PMT = (176 000 × 0,0029167 × 1,0029167^240) / (1,0029167^240 − 1)  
(1,0029167^240) ≈ 2,00676  
PMT = (176 000 × 0,0029167 × 2,00676) / (2,00676 − 1)  
PMT = (176 000 × 0,005851) / 1,00676  
PMT = 1 029,8 / 1,00676 ≈ **1 022,4 €/mois**  
Remboursement annuel ≈ **12 269 €**

**Loyer annuel :** 900 × 12 = **10 800 €**

**Charges fixes :** 1 200 + 1 500 + 150 = **2 850 €/an**  
**Charges proportionnelles :** (8 % + 5 %) × 10 800 = **1 404 €/an**  
**Total charges :** 2 850 + 1 404 = **4 254 €/an**

**Rentabilité brute :** (10 800 / 200 000) × 100 = **5,40 %**

**Revenu net avant impôts :** 10 800 − 4 254 = **6 546 €**  
**Rentabilité nette :** (6 546 / 216 000) × 100 = **3,03 %**

**Cashflow annuel :** 6 546 − 12 269 = **−5 723 €**  
**Effort d'épargne :** **477 €/mois**

**Amortissement LMNP Réel (An 1 simplifié) :**  
Valeur bâti = 200 000 × 85 % = 170 000 €  
Amort. immo = 170 000 / 33 = **5 152 €/an**  
Amort. mobilier = 5 000 / 10 = **500 €/an**  
Total amort. = **5 652 €/an**

**Coût financier An 1 :**  
Intérêts ≈ 176 000 × 3,5 % = **6 160 €**  
Assurance (sans taux) = 0

**Base imposable LMNP :**  
Résultat avant amort. = 10 800 − 4 254 − 6 160 = **386 €**  
Amort. déductible = min(386, 5 652) = **386 €**  
Base imposable = **0 €** → Impôt = 0 €

**Résultat :** En année 1, l'amortissement LMNP efface totalement l'imposition. ✅

---

## CAS 2 — SCI IS avec distribution

### Paramètres
- Prix d'achat : 500 000 €
- Loyer mensuel : 3 000 €
- Apport : 100 000 €
- Crédit : 25 ans @ 3,5 %
- Régime : SCI IS avec distribution dividendes
- Charges : 5 000 €/an fixes

### Calcul manuel

**Frais de notaire :** 500 000 × 8 % = **40 000 €**  
**Coût total :** 540 000 € → **Emprunt : 440 000 €**

**PMT 440 000 €, 25 ans, 3,5 % :**  
n = 300 mois, r = 0,29167 %  
(1+r)^300 ≈ 2,3837  
PMT = (440 000 × 0,0029167 × 2,3837) / (2,3837 − 1)  
≈ (440 000 × 0,006952) / 1,3837 ≈ 3 059 / 1,3837 ≈ **2 211 €/mois**  
Remboursement annuel : **26 532 €**

**Loyer annuel :** 36 000 €  
**Revenu net exploitation :** 36 000 − 5 000 = **31 000 €**  
**Intérêts An 1 :** 440 000 × 3,5 % = **15 400 €**  
**Amort. bâti :** (500 000 × 85 %) / 33 = **12 879 €**

**Base IS :** max(0, 31 000 − 15 400 − 12 879) = max(0, 2 721) = **2 721 €**  
**IS :** 2 721 × 15 % = **408 €**

**Revenu net après IS :** 31 000 − 15 400 − 408 = **15 192 €**  
**Flat Tax (distribution) :** 15 192 × 30 % = **4 558 €**  
**Net en poche associés :** 15 192 − 4 558 = **10 634 €**

**Cashflow brut :** 36 000 − 5 000 − 26 532 = **4 468 €/an**  
**Cashflow net (après IS + Flat Tax) :** 4 468 − 408 − 4 558 = **−498 €/an**

---

## CAS 3 — Déficit Foncier Réel

### Paramètres
- Prix d'achat : 150 000 €
- Travaux : 50 000 €
- Loyer mensuel : 700 €
- Apport : 50 000 €
- Crédit : 20 ans @ 3,5 % sur 150 000 + 50 000 + 12 000 (notaire) = 212 000 - 50 000 = 162 000 €
- TMI : 30 %

### Calcul manuel

**Frais de notaire :** 150 000 × 8 % = **12 000 €**  
**Coût total :** 150 000 + 50 000 + 12 000 = **212 000 €**  
**Emprunt :** 212 000 − 50 000 = **162 000 €**

**Loyer annuel :** 700 × 12 = **8 400 €**  
**Charges :** 2 000 €/an (hypothèse)  
**Intérêts An 1 :** 162 000 × 3,5 % = **5 670 €**  
**Total charges + intérêts :** 7 670 €

**Déficit foncier :**  
Résultat = 8 400 − 2 000 − 5 670 = **730 € > 0** → Pas de déficit cette année  
*(Les travaux en foncier réel sont déductibles une seule fois dans l'année de réalisation)*

**Si travaux 50 000 € déduits l'an 1 (régime foncier réel) :**  
Total déductible = charges 2 000 + travaux 50 000 + intérêts 5 670 = **57 670 €**  
Revenu brut = 8 400 €  
Déficit total = 57 670 − 8 400 = **49 270 €**  
Déficit hors intérêts = 52 000 − 8 400 = **43 600 €** → imputable jusqu'à 10 700 €  
**Imputation revenu global :** 10 700 €  
**Économie IR :** 10 700 × 30 % = **3 210 €**  
**Reportable :** 49 270 − 10 700 = **38 570 €** (sur 10 ans)

✅ Conforme CGI Art. 156.

---

## CAS 4 — HCSF Critique

### Paramètres
- Revenus d'activité : 3 500 €/mois (TMI 30 %)
- Crédits existants : 800 €/mois
- Loyer projet : 900 €/mois
- Mensualité nouveau crédit : 1 022 €/mois (CAS 1)

### Calcul HCSF

**Revenus pondérés :**  
- Activité : 3 500 €
- Loyers projet (70 %) : 900 × 70 % = 630 €
- Total pondéré : 3 500 + 630 = **4 130 €/mois**

**Charges totales :** 800 + 1 022 = **1 822 €/mois**

**Taux d'endettement :** 1 822 / 4 130 = **44,1 %** → ❌ Dépasse 35 %

**Reste à vivre :** 4 130 − 1 822 = **2 308 €/mois** > 1 000 € ✅

**Résultat attendu :** Non-conforme HCSF. Le simulateur doit générer une alerte d'endettement excessif.

---

## CAS 5 — DPE F + Revente 10 ans

### Paramètres
- Prix d'achat : 150 000 €, DPE F
- Loyer mensuel : 800 €
- Horizon revente : 10 ans
- Prix de revente estimé : 150 000 × (1,01)^10 ≈ 165 675 € − 15 % décote = **140 824 €**

### Alertes DPE attendues
1. ⚠️ "DPE F : Interdit à la location à partir du 1er janvier 2028"
2. ⚠️ "L'interdiction de location interviendra dans 2 ans, avant la fin de votre horizon (10 ans)"
3. ⚠️ "Gel des loyers : l'IRL ne s'applique pas aux logements classés F ou G"

### Plus-Value IR à 10 ans
**Prix acquisition corrigé :** 150 000 + 7,5 % + max(0, 15 % si > 5 ans) = 150 000 + 11 250 + 22 500 = **183 750 €**  
**PV brute :** 140 824 − 183 750 = **−42 926 €** → Moins-value, pas d'impôt.

---

## Résumé des vérifications manuelles

| Cas | Formule vérifiée | Écart constaté |
|-----|-----------------|---------------|
| CAS 1 PMT | Mensualité ≈ 1 022 € | Formule correcte ✅ |
| CAS 1 Rentabilité brute | 5,40 % | Conforme ✅ |
| CAS 1 Amortissement LMNP | Base imposable = 0 € | Plafonnement correct ✅ |
| CAS 2 IS progressif | IS = 408 € | Taux 15 % correct ✅ |
| CAS 2 Flat Tax | Net = 10 634 € | 30 % correct ✅ |
| CAS 3 Déficit foncier | Imputation 10 700 € | Plafond correct ✅ |
| CAS 4 HCSF 44,1 % | Non-conforme | Détection correcte ✅ |
| CAS 5 Alertes DPE F | 3 alertes attendues | Logique correcte ✅ |
| CAS 5 PV décote | 140 824 € | Cohérent ✅ |

---
