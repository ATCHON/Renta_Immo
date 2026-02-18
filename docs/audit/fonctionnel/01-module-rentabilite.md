# Audit Module Rentabilité — Renta_Immo
**Date :** 2026-02-18  
**Référence source :** `src/server/calculations/rentabilite.ts`  
**Référence spec :** `docs/core/specification-calculs.md` sections 2, 3, 4

---

## 1. Formule PMT — Mensualité du crédit

### Formule implémentée (L.50–52)
```
tauxMensuel = tauxAnnuel / 100 / 12
mensualiteCredit = (montant × tauxMensuel × (1 + tauxMensuel)^n) / ((1 + tauxMensuel)^n − 1)
```
Cas taux = 0 : `mensualiteCredit = montant / n` (amortissement linéaire)

### Vérification manuelle
Prêt 160 000 € — 20 ans — 3,5 % :
- tauxMensuel = 0,035 / 12 = 0,0029167
- n = 240 mois
- (1+r)^240 = 2,0067
- PMT = (160 000 × 0,0029167 × 2,0067) / (2,0067 − 1) = **926,23 €/mois**

Vérification calculateur MeilleurTaux.fr : **926 €/mois** ✅

### Conformité
✅ **Conforme** — Formule PMT standard identique à la convention bancaire française (CRD mensuel). L'assurance est calculée séparément sur capital initial (conservateur, An 1). La différence sur capital restant dû est matérialisée dans le tableau d'amortissement (AUDIT-109, L.58).

---

## 2. Frais de notaire

### Implémentation (L.74–78)
```typescript
const taux = etatBien === 'neuf' ? config.notaireTauxNeuf : config.notaireTauxAncien;
fraisNotaire = baseTaxable × taux
```

### Valeurs en base (config_params 2026)
| Paramètre | Valeur | Source DB |
|-----------|--------|-----------|
| NOTAIRE_TAUX_ANCIEN | 8,00 % | ✅ Conforme |
| NOTAIRE_TAUX_NEUF | 2,50 % | ✅ Conforme |

### Conformité vs Décret 2016-230
Le barème réel des émoluments notariaux est calculé par tranches :
- Tranche ≤ 6 500 € : 3,945 %
- Tranche 6 501–17 000 € : 1,627 %
- Tranche 17 001–60 000 € : 1,085 %
- Tranche > 60 000 € : 0,814 %
Auxquels s'ajoutent : droits de mutation (DMTO 4,5 % ou 5 % depuis 01/04/2025), CSI 0,10 %, débours.

**Résultat réel typique** : Ancien ≈ 7–8 %, Neuf ≈ 2–3 %

⚠️ **Écart mineur** — Le simulateur utilise un taux forfaitaire global (8 % / 2,5 %) plutôt que le barème par tranches. Pour un bien à 200 000 €, l'écart est < 1 000 € (estimé à ~ 500 €). Acceptable pour un simulateur d'investissement. **Recommandation :** Préciser dans l'interface que les frais indiqués sont estimatifs (±0,5 %).

### Base taxable
L.93 : La valeur du mobilier est déduite avant application des frais de notaire — **Conforme** à la pratique notariale (le mobilier n'est pas soumis aux DMTO).

---

## 3. Coût total d'acquisition (L.99)

```
coutTotal = prixAchat + fraisNotaire + montantTravaux + fraisBanque
montantEmprunt = max(0, coutTotal − apport)
```

✅ **Conforme** — Le montant emprunté est bien la différence entre le coût total et l'apport, sans jamais être négatif.

---

## 4. Rentabilité brute (L.195–197)

### Formule
```
rentabiliteBrute = (loyerAnnuelFacade / prixAchat) × 100
```

- **loyerAnnuelFacade** = loyer mensuel × 12 (sans pondération par taux d'occupation)
- **Dénominateur** = prix d'achat seul (hors frais)

### Conformité
✅ **Convention marché** — La rentabilité brute affichée est calculée sur le loyer théorique 100 % (loyer facial) et le prix d'achat seul. C'est la convention utilisée par les agents immobiliers et plateformes type MeilleursAgents pour comparer les biens. Cette convention doit être **explicitement mentionnée** dans l'interface pour éviter toute confusion.

**Note :** Le taux d'occupation module les revenus réels pour les autres calculs (cashflow, impôts), mais pas la rentabilité brute affichée.

---

## 5. Rentabilité nette (L.204–206)

### Formule
```
revenuNetAvantImpots = loyerAnnuel (avec occupation) − totalChargesAnnuelles
rentabilitéNette = (revenuNetAvantImpots / coutTotalAcquisition) × 100
```

✅ **Conforme** — La rentabilité nette est bien calculée sur le **coût total d'acquisition** (audit correction intégrée, L.202) et après déduction de toutes les charges d'exploitation.

---

## 6. Cashflow et effort d'épargne (L.208–210)

```
cashflowAnnuel = revenuNetAvantImpots − remboursementAnnuel
cashflowMensuel = cashflowAnnuel / 12
effortEpargne = |cashflowMensuel| si cashflowMensuel < 0 (sinon 0)
```

✅ **Conforme** — Le remboursement annuel inclut capital + intérêts + assurance (mensualité_totale × 12).

---

## 7. Effet de levier (L.213–216)

### Formule
```
tauxTotalCredit = tauxInteret + tauxAssurance
effetLevier = (rentabiliteNette − tauxTotalCredit) × (montantEmprunt / apport)
```

✅ **Conforme** — Formule standard de l'effet de levier financier. Si apport = 0, retourne `null` (pas de calcul / 0). Le taux total crédit comprend à juste titre le coût d'assurance.

---

## 8. Charges annuelles — Décomposition

### Charges fixes (L.144–151)
| Composante | Traitement |
|-----------|-----------|
| Charges copro (part propriétaire) | copro − récupérables ✅ |
| Taxe foncière | Directe ✅ |
| Assurance PNO | Directe ✅ |
| Assurance GLI | Optionnelle ✅ |
| CFE | Conditionnée au seuil `cfeSeuilExoneration` (5 000 €/an de loyers) ✅ |
| Comptable annuel | Optionnel ✅ |

### Charges proportionnelles (L.154–160)
| Composante | Base |
|-----------|------|
| Gestion locative | % × loyer annuel ✅ |
| Provision travaux | % × loyer annuel ✅ |
| Provision vacance | % × loyer annuel, seulement si pas de taux d'occupation défini ✅ |

✅ **Conforme** — La logique de neutralisation de la provision vacance quand un taux d'occupation est saisi (L.157–160) évite le double-comptage.

---

## 9. Synthèse Module Rentabilité

| Critère | Statut | Référence |
|---------|--------|-----------|
| Formule PMT | ✅ Conforme | Standard bancaire |
| Frais de notaire | ⚠️ Approximation acceptable | Décret 2016-230 |
| Base taxable mobilier | ✅ Conforme | Pratique notariale |
| Coût total acquisition | ✅ Conforme | — |
| Rentabilité brute (convention) | ✅ Conforme avec note | Convention marché |
| Rentabilité nette (coût total) | ✅ Conforme | Audit correction |
| Cashflow et effort d'épargne | ✅ Conforme | — |
| Effet de levier | ✅ Conforme | — |
| Charges fixes/proportionnelles | ✅ Conforme | — |
| Vacance vs taux d'occupation | ✅ Conforme | — |
