# Story AUDIT-103 : Implementer le calcul du deficit foncier

> **Priorite** : P2 (Enrichissement metier)
> **Effort** : 1-2 jours
> **Statut** : A faire
> **Source** : Audit methodologies calculs 2026-02-07, Section 5.2 / Proposition P3
> **Dependance** : AUDIT-100 (pour l'integration dans les projections)

---

## 1. User Story

**En tant qu'** investisseur en regime foncier reel avec travaux importants
**Je veux** que le simulateur calcule l'economie fiscale reelle du deficit foncier
**Afin de** voir l'avantage reel du regime reel dans la comparaison des regimes

---

## 2. Contexte

### 2.1 Probleme

Le code actuel (`fiscalite.ts:101-106`) emet une alerte informative quand il y a deficit foncier, mais ne calcule pas :
1. La part du deficit imputable sur le revenu global (max 10 700 EUR hors interets)
2. La part reportable sur 10 ans sur revenus fonciers
3. L'economie d'impot reelle

### 2.2 Impact

Pour un investisseur avec gros travaux (ex : 50 000 EUR), le deficit foncier peut generer une economie d'impot de 3 000 a 5 000 EUR/an pendant plusieurs annees. Sans ce calcul, le regime reel foncier apparait moins interessant qu'il ne l'est dans la comparaison des regimes.

### 2.3 Regle fiscale

Le deficit foncier se decompose en deux parties :
1. **Deficit hors interets d'emprunt** : imputable sur le revenu global dans la limite de 10 700 EUR/an
2. **Deficit lie aux interets** : reportable uniquement sur les revenus fonciers des 10 annees suivantes

L'economie d'impot = `min(deficit_hors_interets, 10 700) * TMI`

---

## 3. Criteres d'acceptation

### 3.1 Calcul du deficit

- [ ] Detecter le deficit : `charges + interets > revenus fonciers`
- [ ] Separer le deficit en deux composantes :
  - Deficit hors interets = `max(0, charges_hors_interets - revenus)`
  - Deficit lie aux interets = `max(0, interets - (revenus - charges_hors_interets))` si revenus > charges_hors_interets, sinon = total interets
- [ ] Calculer la part imputable sur revenu global : `min(deficit_hors_interets, 10 700)`
- [ ] Calculer l'economie d'impot : `part_imputable * TMI`

### 3.2 Resultats affiches

- [ ] Montant du deficit foncier total
- [ ] Economie d'impot An 1 (imputation sur revenu global)
- [ ] Deficit reportable (montant et duree restante)
- [ ] L'economie est integree dans le cashflow net du regime foncier reel

### 3.3 Comparaison des regimes

- [ ] La comparaison des regimes (`fiscalite.ts:407-526`) prend en compte l'economie du deficit foncier
- [ ] Le regime foncier reel peut devenir le plus avantageux en cas de gros travaux

### 3.4 Projections (si AUDIT-100 fait)

- [ ] Le deficit reportable est consomme dans les annees suivantes
- [ ] Le report expire apres 10 ans
- [ ] L'impot des annees suivantes tient compte du report

---

## 4. Specifications techniques

### 4.1 Fichiers impactes

| Fichier | Modification |
|---------|-------------|
| `src/server/calculations/fiscalite.ts` | Fonction `calculerDeficitFoncier()`, modifier `calculerFoncierReel()` |
| `src/server/calculations/types.ts` | Nouveau type `DeficitFoncierDetail` |
| `src/server/calculations/projection.ts` | Gestion du report de deficit dans les projections |

### 4.2 Nouveau type

```typescript
interface DeficitFoncierDetail {
  deficit_total: number;
  deficit_hors_interets: number;
  deficit_interets: number;
  imputable_revenu_global: number;  // min(deficit_hors_interets, 10700)
  economie_impot: number;           // imputable * TMI
  reportable: number;               // deficit restant reportable
  duree_report: number;             // 10 ans
}
```

### 4.3 Pseudo-code

```
function calculerDeficitFoncier(revenus, charges, interets, tmi):
  if revenus >= charges + interets:
    return null  // Pas de deficit

  deficit_total = charges + interets - revenus

  // Separation hors interets / interets
  deficit_hors_interets = max(0, charges - revenus)
  deficit_interets = deficit_total - deficit_hors_interets

  // Imputation revenu global
  imputable = min(deficit_hors_interets, 10700)
  economie = imputable * (tmi / 100)

  // Report
  reportable = deficit_total - imputable

  return { deficit_total, imputable, economie, reportable, duree_report: 10 }
```

---

## 5. Cas de test

### 5.1 Deficit avec travaux

| Revenus | Charges | Interets | TMI | Deficit | Imputable | Economie IR |
|---------|---------|----------|-----|---------|-----------|------------|
| 10 800 | 18 000 | 5 000 | 30% | 12 200 | 7 200 | 2 160 |
| 10 800 | 25 000 | 5 000 | 30% | 19 200 | 10 700 | 3 210 |
| 10 800 | 8 000 | 5 000 | 30% | 2 200 | 0 | 0 |

Note : dans le 3e cas, charges (8 000) < revenus (10 800), le deficit est uniquement lie aux interets, donc non imputable sur revenu global.

### 5.2 Report sur annees suivantes

Verifier que le deficit reportable est bien consomme progressivement et expire apres 10 ans.

---

## 6. Definition of Done

- [ ] Calcul du deficit foncier correct (separation interets/hors interets)
- [ ] Economie d'impot integree dans la comparaison des regimes
- [ ] Deficit reportable gere dans les projections (si AUDIT-100 fait)
- [ ] Tests unitaires couvrant tous les cas
- [ ] TypeScript compile sans erreur
