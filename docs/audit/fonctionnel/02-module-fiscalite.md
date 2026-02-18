---

# Audit Module Fiscalité — Renta_Immo
**Date :** 2026-02-18  
**Référence source :** \  
**Références légales :** CGI Art. 32, 28, 156, 39C, 150 VC, 1609 nonies G, 200 A, 219 ; PCG Art. 214-9 ; Loi Le Meur (LF 2025, art. effectif 15/02/2025)

---

## 1. Prélèvements sociaux — Taux applicables

### Valeurs en base (config_params 2026)
| Paramètre | Valeur DB | Taux légal | Statut |
|-----------|-----------|------------|--------|
| TAUX_PS_FONCIER | 17,20 % | 17,20 % (revenus du patrimoine) | ✅ Conforme |
| TAUX_PS_REVENUS_BIC_LMNP | 18,60 % | **18,60 % (LFSS 2026)** | ✅ Conforme |

### Mise à jour réglementaire — LFSS 2026
La **Loi de Financement de la Sécurité Sociale 2026 (LFSS 2026)** a relevé la CSG de **9,20 % à 10,60 %** sur les revenus du patrimoine, portant le taux global des prélèvements sociaux à **18,60 %** (CSG 10,60 % + CRDS 0,50 % + prélèvement de solidarité 7,50 %).

Ce nouveau taux s'applique aux **revenus BIC des LMNP non-professionnels**, rétroactivement aux revenus 2025 déclarés au printemps 2026.

**Distinctions importantes :**
- Les **plus-values immobilières** restent soumises à 17,20 % (non impactées par la LFSS 2026)
- Les **revenus fonciers** (location nue) ne sont pas concernés par cette hausse

✅ **Conforme** — Le taux de 18,60 % en base est correct pour les revenus BIC LMNP non-professionnels en 2026 (LFSS 2026).

---

## 2. Régime Micro-Foncier (L.43–82)

### Formule
\n
### Conformité — CGI Art. 32
| Paramètre | DB | Loi | Statut |
|-----------|-----|-----|--------|
| Abattement | 30 % | 30 % | ✅ |
| Plafond | 15 000 € | 15 000 € | ✅ |
| PS foncier | 17,20 % | 17,20 % | ✅ |

✅ **Conforme** — Le simulateur vérifie le dépassement du plafond et génère une alerte.

---

## 3. Régime Foncier Réel (L.91–162)

### Formule
```
baseImposable = max(0, revenusBruts − chargesDeductibles − interetsAssurance)
IR = baseImposable × TMI
PS = baseImposable × 17,20 %
```

### Déficit foncier — Si revenusBruts < (charges + intérêts)
```
deficitTotal = (charges + interets) − revenusBruts
deficitHorsInterets = max(0, charges − revenusBruts)
imputationRevenuGlobal = min(deficitHorsInterets, plafond)
economieImpot = imputationRevenuGlobal × TMI
reportable = deficitTotal − imputationRevenuGlobal
```

### Conformité — CGI Art. 28 & 156
| Critère | DB | Loi | Statut |
|---------|-----|-----|--------|
| Charges réelles déductibles | Oui | Oui | ✅ |
| Intérêts non imputables revenu global | Séparés (L.445) | Oui | ✅ |
| Plafond imputation revenu global | 10 700 € | 10 700 € | ✅ |
| Plafond majoré réno énergétique | 21 400 € | 21 400 € (2023-2025) | ✅ |
| Durée de report | 10 ans | 10 ans | ✅ |

✅ **Conforme** — Le traitement du déficit foncier est complet et conforme à CGI Art. 156. La séparation intérêts/hors-intérêts est correctement implémentée.

---

## 4. LMNP Micro-BIC (L.171–232)

### Abattements et plafonds selon type de location

| Type | Abattement DB | Abattement Loi | Plafond DB | Plafond Loi | Statut |
|------|--------------|----------------|------------|-------------|--------|
| Longue durée | 50 % | 50 % | 77 700 € | 77 700 € | ✅ |
| Tourisme classé | 71 % | 71 % | 188 700 € | 188 700 € | ✅ |
| Tourisme non classé | 30 % | 30 % | 15 000 € | 15 000 € | ✅ |

### PS appliqués : 18,60 %
✅ **Conforme** — Taux de 18,60 % correct pour les revenus BIC LMNP non-professionnels en 2026 (LFSS 2026).

### Conformité — CGI Art. 50-0
✅ **Conforme** pour les seuils et abattements (LF 2024/2025).

---

## 5. LMNP Réel — Amortissements (L.241–331)

### Mode simplifié (par défaut)
\n
### Conformité — CGI Art. 39C
| Composante | Durée DB | Durée légale acceptée | Statut |
|-----------|----------|----------------------|--------|
| Bâti (immobilier) | 33 ans | 25–50 ans (pratique 30–40) | ✅ Acceptable |
| Mobilier | 10 ans | 7–15 ans (pratique 7–10) | ✅ Acceptable |
| Travaux | 15 ans | 10–20 ans (pratique 15) | ✅ Conforme |
| Terrain (non amortissable) | 15 % exclus | Non amortissable | ✅ Conforme |

### Règle plafonnement (L.300–301)
\n**L’amortissement ne peut pas créer de déficit BIC** (règle CGI Art. 39C) — ✅ Conforme.  
L’excédent est reportable sans limite de durée.

---

## 6. Amortissement par composants — AUDIT-104 (L.487–518)

### Répartition implémentée
| Composant | Part | Durée | Taux annuel |
|----------|------|-------|-------------|
| Gros œuvre | 40 % | 50 ans | 0,80 % |
| Façade/Toiture | 20 % | 25 ans | 0,80 % |
| Installations techniques | 20 % | 15 ans | 1,33 % |
| Agencements | 20 % | 10 ans | 2,00 % |
| **Total An 1–10** | | | **≈ 4,93 %** |

### Conformité — PCG Art. 214-9
La décomposition par composants selon le Plan Comptable Général est correcte. Les durées et répartitions sont conformes aux pratiques comptables reconnues pour l’immobilier résidentiel.

✅ **Conforme** — PCG Art. 214-9. Les parts (40/20/20/20) et durées (50/25/15/10 ans) sont cohérentes avec les normes IFRS et la doctrine comptable française.

---

## 7. SCI à l’IS (L.339–413)

### Formule IS progressif
\n
### Distribution — Flat Tax
\n
### Conformité — CGI Art. 219 & 200 A
| Paramètre | DB | Loi | Statut |
|-----------|-----|-----|--------|
| Seuil taux réduit IS | 42 500 € | 42 500 € (LF 2023) | ✅ |
| Taux réduit IS | 15 % | 15 % | ✅ |
| Taux normal IS | 25 % | 25 % | ✅ |
| Flat Tax (PFU) | 30 % | 30 % | ✅ |

✅ **Conforme** — CGI Art. 219 et 200 A. Le seuil 42 500 € est correct depuis la LF 2023.

---

## 8. Plus-Value IR — AUDIT-105 (L.528–677)

### Abattements pour durée de détention

| Durée | Abattement IR | Abattement PS |
|-------|--------------|---------------|
| ≤ 5 ans | 0 % | 0 % |
| 6–21 ans | (n−5) × 6 % | (n−5) × 1,65 % |
| 22 ans | 100 % | 28 % |
| 23–30 ans | 100 % | 28 % + (n−22) × 9 % |
| ≥ 30 ans | 100 % | 100 % |

### Conformité — CGI Art. 150 VC & VD
✅ **Conforme** — Les barèmes sont corrects (Art. 150 VC pour IR, Art. 150 VD pour PS).

### Taux d’imposition PV
| Taux | DB | Loi | Statut |
|------|-----|-----|--------|
| IR PV | 19 % | 19 % | ✅ |
| PS PV | 17,20 % | 17,20 % | ✅ |

### Forfaits d’acquisition (V2-S01)
\n✅ Conforme (BOFiP : 7,5 % frais d’acquisition, 15 % forfait travaux après 5 ans).

---

## 9. Surtaxe Plus-Value > 50 000 € (L.550–571)

### Barème implémenté vs barème légal (CGI Art. 1609 nonies G)
| Tranche PV nette IR | Taux DB | Taux Légal | Statut |
|--------------------|---------|-----------|--------|
| 50 001 – 100 000 € | 2 % | 2 % | ✅ |
| 100 001 – 150 000 € | 3 % | 3 % | ✅ |
| 150 001 – 200 000 € | 4 % | 4 % | ✅ |
| **200 001 – 250 000 €** | **6 %** | **5 %** | ❌ |
| > 250 000 € | 6 % | 6 % | ✅ |

❌ **Écart identifié** — La tranche 200 001–250 000 € applique 6 % au lieu de 5 % (source : CGI Art. 1609 nonies G tel que modifié par la LFR 2012). Cette erreur **surestime** la surtaxe d’environ 2 500 € max pour une PV nette entre 200k et 250k €. **Correction requise :** Modifier la tranche \ en \.

---

## 10. Réintégration Amortissements LMNP — Loi Le Meur

### Implémentation (L.617–629)
```typescript
const dateLoiLeMeur = new Date('2025-02-15');
if (typeResidence === 'services' && dateCession >= dateLoiLeMeur) {
  amortissementsReintegres = 0;  // Exemption résidences de services
} else if (dateCession >= dateLoiLeMeur) {
  amortissementsReintegres = cumule − amortissementMobilier;  // Hors mobilier
}
```

### Conformité — Loi Le Meur (art. du LF 2025, effectif 15/02/2025)
✅ **Conforme** — La date d’entrée en vigueur est correcte. L’exemption des résidences de services est implémentée. L’exclusion du mobilier de la réintégration est conforme à la doctrine fiscale.

---

## 11. Synthèse Module Fiscalité

| Critère | Statut | Référence |
|---------|--------|----------|
| PS foncier 17,20 % | ✅ Conforme | Revenus du patrimoine |
| PS LMNP 18,60 % | ✅ Conforme | LFSS 2026 : CSG relevée à 10,60 % |
| Micro-foncier 30 %/15k€ | ✅ Conforme | CGI Art. 32 |
| Foncier réel charges | ✅ Conforme | CGI Art. 28 |
| Déficit foncier 10 700 €/21 400 € | ✅ Conforme | CGI Art. 156 |
| Report déficit 10 ans | ✅ Conforme | CGI Art. 156 |
| LMNP Micro seuils 2025 | ✅ Conforme | CGI Art. 50-0 |
| LMNP Réel amortissements | ✅ Conforme | CGI Art. 39C |
| Amortissement composants | ✅ Conforme | PCG Art. 214-9 |
| SCI IS 15 %/25 % (42 500 €) | ✅ Conforme | CGI Art. 219 |
| Flat Tax 30 % | ✅ Conforme | CGI Art. 200 A |
| PV IR abattements temporels | ✅ Conforme | CGI Art. 150 VC |
| PV taux 19 %/17,20 % | ✅ Conforme | CGI Art. 150 VC |
| Surtaxe PV tranche 200k-250k | ❌ 6 % au lieu de 5 % | CGI Art. 1609 nonies G |
| Loi Le Meur réintégration | ✅ Conforme | LF 2025 |
