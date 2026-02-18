---

# Audit Module Scoring & Projections — Renta_Immo
**Date :** 2026-02-18  
**Référence source :** `src/server/calculations/synthese.ts`, `src/server/calculations/projection.ts`

---

## 1. Système de Scoring (AUDIT-106)

### Architecture du score
```
scoreGlobal = SCORE_BASE (40) + Σ ajustements pondérés
borné entre 0 et 100
```

### Ajustements par critère

| Critère | Plage brute | Pondération Rentier | Pondération Patrimonial |
|---------|------------|--------------------|-----------------------|
| Cashflow mensuel net | −20 à +20 | ×1,5 | ×0,5 |
| Rentabilité nette-nette | −15 à +20 | ×1,2 | ×1,0 |
| HCSF (taux endettement) | −25 à +20 | ×1,0 | ×1,2 |
| DPE | −10 à +5 | ×0,8 | ×1,5 |
| Ratio prix/loyer | −5 à +10 | ×0,5 | ×1,0 |
| Reste à vivre | −10 à +5 | ×0,5 | ×1,2 |

**Max théorique profil Rentier :** 40 + (20×1,5) + (20×1,2) + (20×1,0) + (5×0,8) + (10×0,5) + (5×0,5) = 40 + 30 + 24 + 20 + 4 + 5 + 2,5 = **125,5 → borné à 100**
**Min théorique profil Rentier :** 40 + (−20×1,5) + (−15×1,2) + (−25×1,0) + (−10×0,8) + (−5×0,5) + (−10×0,5) = 40 − 30 − 18 − 25 − 8 − 2,5 − 5 = **−48,5 → borné à 0**

### Évaluations qualitatives
| Score | Évaluation | Couleur |
|-------|-----------|---------|
| ≥ 80 | Excellent | Vert |
| ≥ 60 | Bon | Bleu |
| ≥ 40 | Moyen | Orange |
| < 40 | Faible | Rouge |

### Cohérence du système
✅ **Système propriétaire** — Aucun standard réglementaire n'impose un système de scoring pour les simulateurs d'investissement. Ce scoring est un outil d'aide à la décision interne. Il est cohérent, bien documenté et différencié selon les profils investisseurs (V2-S16).

**Remarques :**
- La pondération DPE × 1,5 pour le profil Patrimonial est pertinente (préservation du patrimoine)
- Le cashflow × 1,5 pour le profil Rentier reflète correctement la priorité sur les revenus immédiats
- Pré-calcul des deux profils simultanément ✅ (V2-S16, synthese.ts L.623–624)

---

## 2. Interpolation linéaire (L.48–52)

```typescript
function interpoler(valeur, min, max, scoreMin, scoreMax):
  if valeur ≤ min: return scoreMin
  if valeur ≥ max: return scoreMax
  return scoreMin + (valeur - min) / (max - min) × (scoreMax - scoreMin)
```

✅ **Correct** — Interpolation linéaire standard. La zone de continuité évite les sauts de score brutaux.

---

## 3. Alertes DPE (AUDIT-110)

### Interdictions de location par classe
| DPE | Année interdiction | Implémentation |
|-----|--------------------|---------------|
| G | 1er janvier 2025 | ✅ (déjà interdit si annee >= 2025) |
| F | 1er janvier 2028 | ✅ |
| E | 1er janvier 2034 | ✅ |

### Gel des loyers
- F et G : gel immédiat ✅ (Loi Climat-Résilience 2021)
- E : gel à partir de 2034 ✅

### Conformité — Loi Climat-Résilience (L.2021-1104) & Loi ELAN
✅ **Conforme** — Les dates d'interdiction et les règles de gel des loyers sont correctement implémentées.

---

## 4. Alertes LMP — V2-S17

### Seuils (config_params 2026)
| Paramètre | DB | Loi (CGI Art. 155 IV) |
|-----------|-----|----------------------|
| LMP_SEUIL_LMP | 23 000 € | 23 000 € | ✅ |
| LMP_SEUIL_ALERTE | 20 000 € | Interne simulateur | ✅ |

✅ **Conforme** — Le seuil légal LMP (23 000 € de recettes ET recettes > 50 % revenus d'activité) est bien représenté. L'alerte à 20 000 € est un indicateur de vigilance pertinent.

**Note :** Le simulateur n'applique que le critère des 23 000 € de recettes, sans vérifier le critère des 50 % des revenus d'activité (qui nécessiterait la saisie des revenus globaux du foyer). C'est une limitation acceptable, documentée.

---

## 5. TRI — Taux de Rendement Interne (L.37–74)

### Algorithme Newton-Raphson
```
flux[0] = -apport
flux[t] = cashflowNetImpot_t    (t = 1 à horizon-1)
flux[horizon] = cashflowNetImpot_horizon + patrimoineNet − impotPV − fraisRevente

Pour chaque itération i:
  NPV = Σ flux[t] / (1+tri)^t
  dNPV = −Σ t × flux[t] / ((1+tri)^(t+1))
  tri_new = tri − NPV / dNPV
  Si |tri_new − tri| < 0.00001 → convergé
```

### Paramètres
| Paramètre | DB | Valeur |
|-----------|-----|--------|
| TRI_PRECISION | constants.ts | 0,00001 |
| TRI_MAX_ITERATIONS | constants.ts | 100 |
| Guess initial | hardcodé | 10 % |

✅ **Correct** — L'algorithme de Newton-Raphson est la méthode standard pour le calcul du TRI. La précision de 0,00001 est suffisante (5 décimales). 100 itérations est plus que suffisant pour la convergence habituelle (< 30 itérations).

### Flux TRI — Composition correcte
- Flux 0 : −apport (investissement initial) ✅
- Flux 1 à n−1 : cashflow net d'impôts ✅
- Flux final : cashflow + patrimoine net − impôt PV − frais revente ✅ (AUDIT-108)

**Note :** Si apport = 0, le simulateur substitue 1 € (L.547) pour éviter la division par zéro. Résultat non significatif dans ce cas — ⚠️ L'interface devrait filtrer ce cas.

---

## 6. Projections pluriannuelles (L.297–571)

### Paramètres d'inflation (config_params 2026)
| Paramètre | DB | Spec initiale | Note |
|-----------|-----|--------------|------|
| PROJECTION_INFLATION_LOYER | 1,50 % | 2,00 % (plan audit) | ⚠️ Prudent |
| PROJECTION_INFLATION_CHARGES | 2,00 % | 2,50 % (plan audit) | ⚠️ Prudent |
| PROJECTION_REVALORISATION_BIEN | 1,00 % | Variable | Conservateur |

**Note :** Les taux d'inflation utilisés (1,5 % loyers, 2 % charges, 1 % bien) sont inférieurs aux valeurs moyennes historiques (IRL ≈ 2–3 %, inflation ≈ 2–3 %). Ces valeurs **prudentes** génèrent des projections conservatrices, ce qui est acceptable pour un outil de simulation. L'utilisateur peut les personnaliser.

### Gel des loyers DPE (L.358–365)
```
Si DPE F ou G → gelLoyer = true (toujours)
Si DPE E et projectionYear >= 2034 → gelLoyer = true
```
✅ **Conforme** — Loi Climat-Résilience.

### Décote DPE sur valeur du bien (L.380–388)
| DPE | Décote | DB |
|-----|--------|-----|
| F, G | −15 % | DECOTE_DPE_FG = 0,15 ✅ |
| E (à partir 2034) | −5 % | DECOTE_DPE_E = 0,05 ✅ |

✅ **Cohérent** avec les études de marché (Notaires de France 2024).

### Tableau d'amortissement crédit (L.83–177)
```
mensualiteCredit = (montant × r/12) / (1 − (1+r/12)^−n)
interetsMois = capitalRestant × r/12
capitalMois = mensualiteCredit − interetsMois
```
✅ **Conforme** — Méthode française standard du tableau d'amortissement.

### Gestion déficit foncier FIFO — Projection (L.434–479)
Les buckets de déficit sont gérés en FIFO avec expiration à 10 ans ✅ — Conforme CGI Art. 156.

---

## 7. Frais de revente — AUDIT-108

### Composition
```
fraisRevente = prixRevente × tauxAgence + fraisDiagnostics
```
| Paramètre | DB | Note |
|-----------|-----|------|
| FRAIS_REVENTE_TAUX_AGENCE_DEFAUT | 5 % | Marché : 3–8 % ✅ |
| FRAIS_REVENTE_DIAGNOSTICS | 500 € | Approximation réaliste ✅ |

✅ **Cohérent** avec le marché immobilier français.

---

## 8. Synthèse Module Scoring & Projections

| Critère | Statut | Référence |
|---------|--------|-----------|
| Scoring base 40 + ajustements | ✅ Système propriétaire cohérent | — |
| Profils Rentier/Patrimonial | ✅ Conforme V2-S16 | — |
| Alertes DPE (dates) | ✅ Conforme | Loi Climat-Résilience |
| Gel loyers F/G | ✅ Conforme | Loi Climat-Résilience |
| Alertes LMP 23 000 € | ✅ Conforme | CGI Art. 155 IV |
| TRI Newton-Raphson | ✅ Correct | — |
| Flux TRI complets | ✅ Conforme | AUDIT-108 |
| Inflation loyers/charges | ⚠️ Prudent (1,5 %/2 %) | Paramétrable |
| Décote DPE | ✅ Cohérent | Notaires de France 2024 |
| Déficit FIFO projection | ✅ Conforme | CGI Art. 156 |
| Frais revente | ✅ Cohérent marché | — |
