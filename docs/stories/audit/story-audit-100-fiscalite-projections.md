# Story AUDIT-100 : Integrer la fiscalite dans les projections pluriannuelles

> **Priorite** : P0 (Critique)
> **Effort** : 2-3 jours
> **Statut** : A faire
> **Source** : Audit methodologies calculs 2026-02-07, Section 7.1 / Proposition P1
> **Dependance** : Aucune

---

## 1. User Story

**En tant qu'** investisseur
**Je veux** que les projections pluriannuelles integrent l'impot annuel reel
**Afin d'** obtenir un TRI, un cashflow cumule et un enrichissement total fiables

---

## 2. Contexte

### 2.1 Probleme

Actuellement, les projections (`projection.ts:241`) fixent l'impot a 0 :

```typescript
const impot = 0;  // Simplifie en MVP
```

**Impact mesure** :
- Cashflow cumule **surestime de 30 000 a 80 000 EUR** sur 20 ans
- TRI **surevalue de 1 a 3 points** de pourcentage
- Enrichissement total affiche **incorrect**

C'est l'ecart le plus impactant du simulateur en termes de fiabilite.

### 2.2 Solution

Le module `fiscalite.ts` sait deja calculer l'impot annuel pour chaque regime. Il faut l'appeler pour chaque annee de projection en tenant compte de :
- L'evolution des revenus (inflation loyer)
- L'evolution des charges (inflation charges)
- La degressivite des interets (tableau d'amortissement du credit)
- L'amortissement (duree limitee pour LMNP reel / SCI IS)

### 2.3 Donnees de reference (annexe B audit)

Bien 200 000 EUR, loyer 10 800 EUR/an, TMI 30%, micro-foncier :
- Impot annuel An 1 : ~3 566 EUR
- Impots cumules 20 ans : ~75 000 EUR
- Le cashflow cumule est donc surestime de ~75 000 EUR actuellement

---

## 3. Criteres d'acceptation

### 3.1 Calcul fiscal annuel dans les projections

- [ ] Pour chaque annee n, calculer `impot(n)` en appelant le module fiscal existant
- [ ] Les revenus passes au calcul fiscal evoluent avec l'inflation loyer
- [ ] Les charges passees au calcul fiscal evoluent avec l'inflation charges
- [ ] Les interets deductibles correspondent au tableau d'amortissement (et non a l'approximation `capital * taux`)
- [ ] L'amortissement (LMNP reel / SCI IS) s'arrete quand la duree est ecoulee (33 ans bati, 10 ans mobilier, 15 ans travaux)

### 3.2 Coherence des resultats

- [ ] `cashflowNetImpot(n) = cashflowBrut(n) - impot(n)` pour chaque annee
- [ ] `cashflowCumule` = somme des `cashflowNetImpot(n)`
- [ ] `enrichissementTotal` = `capitalRembourse` + `cashflowCumule`
- [ ] Le TRI utilise les flux nets d'impots
- [ ] Le champ `impot` de chaque projection est rempli (plus de 0)
- [ ] `impotCumule` dans les totaux correspond a la somme reelle

### 3.3 Regime fiscal respecte

- [ ] Micro-foncier : abattement 30% chaque annee
- [ ] Foncier reel : charges reelles deduites chaque annee
- [ ] LMNP micro-BIC : abattement 50% chaque annee
- [ ] LMNP reel : amortissement deduit (plafonné au résultat avant amortissement)
- [ ] SCI IS capitalisation : IS progressif chaque annee
- [ ] SCI IS distribution : IS + flat tax chaque annee

### 3.4 Non-regression

- [ ] Les resultats An 1 (rentabilite, fiscalite, HCSF) ne changent pas
- [ ] Le test de reference (annexe B audit) donne un cashflow net mensuel de ~-873 EUR
- [ ] Les projections avec `impot = 0` ne sont plus possibles

---

## 4. Specifications techniques

### 4.1 Fichiers impactes

| Fichier | Modification |
|---------|-------------|
| `src/server/calculations/projection.ts` | Integration du calcul fiscal annuel dans la boucle de projection (lignes 200-260) |
| `src/server/calculations/fiscalite.ts` | Potentielle extraction d'une fonction `calculerImpotAnnuel(params)` reutilisable |
| `src/server/calculations/types.ts` | Ajout des parametres fiscaux dans les types de projection |
| `src/server/calculations/index.ts` | Passage des informations fiscales au module de projection |

### 4.2 Pseudo-code

```
function genererProjections(input, regime, tmi, ...) {
  for annee = 1 to horizon {
    loyerAnnuel = loyer * (1 + inflation_loyer)^annee
    chargesAnnuelles = charges * (1 + inflation_charges)^annee
    interetsAnnuels = tableauAmortissement[annee].interets
    amortissement = calculerAmortissementAnnuel(annee, prixAchat, mobilier, travaux)

    impot = calculerFiscaliteAnnuelle(regime, tmi, loyerAnnuel, chargesAnnuelles, interetsAnnuels, amortissement)

    cashflowNet = loyerAnnuel - chargesAnnuelles - remboursementCredit - impot
  }
}
```

### 4.3 Points d'attention

- Les interets deductibles doivent venir du tableau d'amortissement (deja calcule dans `projection.ts:63-150`) et non de l'approximation `capital * taux`
- L'amortissement LMNP reel ne peut pas creer de deficit BIC (regle deja respectee dans `fiscalite.ts:215`)
- Le report d'amortissement excedentaire est hors scope de cette story (voir AUDIT-104)

---

## 5. Cas de test

### 5.1 Test micro-foncier

| Annee | Loyer | Charges | Credit | Impot | Cashflow net |
|-------|-------|---------|--------|-------|-------------|
| 1 | 10 800 | 3 494 | 14 220 | ~3 566 | ~-10 480 |
| 5 | ~11 700 | ~3 860 | 14 220 | ~3 860 | ~-10 240 |
| 10 | ~12 940 | ~4 390 | 14 220 | ~4 270 | ~-9 940 |

### 5.2 Test LMNP reel (amortissement)

Verifier que l'amortissement s'arrete apres 33 ans (bati) / 10 ans (mobilier) / 15 ans (travaux) et que l'impot augmente en consequence.

### 5.3 Test TRI

Comparer le TRI avant/apres integration fiscale :
- TRI avant correction (sans impots) : ~X%
- TRI apres correction (avec impots) : X - 1 a 3 points

---

## 6. Definition of Done

- [ ] Les projections incluent l'impot annuel calcule pour chaque annee
- [ ] Le TRI utilise des flux nets d'impots
- [ ] Le cashflow cumule et l'enrichissement total sont corrects
- [ ] Tests unitaires ajoutés/mis a jour
- [ ] TypeScript compile sans erreur
- [ ] Le test de reference de l'annexe B de l'audit est conforme
