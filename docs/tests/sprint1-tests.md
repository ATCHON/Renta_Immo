# Plan de Tests Réels — Sprint 1 : Plus-value & Vacance locative (S01-S08)

**Date :** 2026-02-16
**Branch :** `feature/sprint-4-backoffice`
**Sprint couvert :** V2-S01 à V2-S08

---

## Pré-requis

| Élément | Valeur |
|---------|--------|
| URL locale | `http://localhost:3000` |
| Compte test | `test-auth-script@example.com` / `Password123!` |
| Serveur dev | `npm run dev` actif |
| État BDD | Pas de simulation existante requise |

---

## Setup Chrome DevTools

```
1. mcp__chrome-devtools__new_page
2. mcp__chrome-devtools__navigate_page → http://localhost:3000
3. Attendre chargement complet : mcp__chrome-devtools__wait_for (networkidle)
4. Se connecter si nécessaire via /auth/signin
```

---

## Scénario S01 — Formule prix acquisition corrigé

**Objectif :** Vérifier que le prix d'acquisition corrigé intègre les frais de notaire et les travaux avec les bons coefficients.

### Entrées

| Champ | Valeur |
|-------|--------|
| Prix d'achat | 200 000 € |
| Travaux | 20 000 € |
| Prix de vente (revente) | 280 000 € |
| Durée de détention | 10 ans |
| Type de bien | Ancien |

### Formule métier (Section 6 regles_metier_explications_v2.md)

```
prixAcquisitionCorrigé = prixAchat × (1 + tauxNotaire) + travaux × (1 + tauxNotaireTravaux)
                       = 200 000 × 1.075 + 20 000 × 1.15
                       = 215 000 + 23 000
                       = 238 000 €

PV brute = prixVente - prixAcquisitionCorrigé
         = 280 000 - 238 000
         = 42 000 €
```

### Étapes Chrome DevTools

```javascript
// 1. Naviguer vers le calculateur
navigate_page("http://localhost:3000/calculateur")

// 2. Remplir les champs
fill("input[name='prixAchat']", "200000")
fill("input[name='travaux']", "20000")
fill("input[name='prixVente']", "280000")
fill("input[name='dureeDétention']", "10")

// 3. Déclencher le calcul
click("button[type='submit'], button:contains('Calculer')")
wait_for("networkidle")

// 4. Extraire la valeur du DOM
evaluate_script(`
  const el = document.querySelector('[data-testid="prix-acquisition-corrige"], .prix-acquisition-corrige');
  return el ? el.textContent.replace(/[^0-9]/g, '') : null;
`)
```

### Assertion

```
Valeur obtenue : "238000" (ou "238 000" avec formatage)
Valeur attendue : 238 000 €
Tolérance : 0 € (calcul exact)
```

---

## Scénario S02 — Barème abattements plus-value

**Objectif :** Vérifier les abattements progressifs IR et PS selon la durée de détention.

### Formule métier (barème légal)

| Détention | Abattement IR | Abattement PS |
|-----------|--------------|---------------|
| < 6 ans   | 0%           | 0%            |
| 6-21 ans  | +4%/an       | +1.65%/an     |
| 22e an    | 100% (IR exo)| +1.60%        |
| 23-29 ans | —            | +9%/an        |
| 30+ ans   | 100%         | 100%          |

### Sous-test S02-A : Détention 5 ans

```
Entrées : prixAchat=200 000€, prixVente=220 000€, détention=5 ans
Formule : abattementIR = 0%, abattementPS = 0%
PV nette imposable IR = PV brute × (1 - 0%) = 20 000 €
PV nette imposable PS = PV brute × (1 - 0%) = 20 000 €
Résultat attendu : abattementIR = 0%, abattementPS = 0%
```

### Sous-test S02-B : Détention 10 ans

```
Détention = 10 ans → années après la 5e = 5 années avec abattement
Abattement IR = 5 × 4% = 20%  (abattement à partir de l'année 6)
Abattement PS = 5 × 1.65% = 8.25%
Résultat attendu : abattementIR = 20%, abattementPS = 8.25%
```

### Sous-test S02-C : Détention 22 ans

```
Abattement IR = 100% → exonération totale IR
Abattement PS = (16 × 1.65%) + 1.60% = 26.4% + 1.60% = 28%
Résultat attendu : IR exonéré, PS = 28%
```

### Sous-test S02-D : Détention 30 ans

```
Abattement IR = 100%, Abattement PS = 100%
Résultat attendu : PV totalement exonérée (IR=0, PS=0)
```

### Étapes Chrome DevTools

```javascript
// Pour chaque sous-test, répéter le cycle :
fill("input[name='dureeDétention']", "5")  // ou 10, 22, 30
click("button:contains('Calculer')")
wait_for("networkidle")

evaluate_script(`
  return {
    abattIR: document.querySelector('[data-testid="abattement-ir"]')?.textContent,
    abattPS: document.querySelector('[data-testid="abattement-ps"]')?.textContent,
    pvImposable: document.querySelector('[data-testid="pv-nette-ir"]')?.textContent
  }
`)
```

---

## Scénario S03 — Surtaxe plus-value

**Objectif :** Vérifier le calcul progressif de la surtaxe sur PV nette > 50 000 €.

### Formule métier (barème surtaxe)

| Tranche PV nette | Taux |
|-----------------|------|
| ≤ 50 000 €      | 0%   |
| 50 001–100 000 € | 2%  |
| 100 001–150 000 € | 3% |
| 150 001–200 000 € | 4% |
| 200 001–250 000 € | 5% |
| > 250 000 €      | 6%  |

### Sous-test S03-A : PV nette 60 000 €

```
Surtaxe = (60 000 - 50 000) × 2% = 10 000 × 2% = 200 €
Résultat attendu : surtaxe = 200 €
```

### Sous-test S03-B : PV nette 200 000 €

```
Tranche 1 : (100 000 - 50 000) × 2% = 1 000 €
Tranche 2 : (150 000 - 100 000) × 3% = 1 500 €
Tranche 3 : (200 000 - 150 000) × 4% = 2 000 €
Total surtaxe = 1 000 + 1 500 + 2 000 = 4 500 €
Résultat attendu : surtaxe = 4 500 €
```

### Étapes Chrome DevTools

```javascript
evaluate_script(`
  const el = document.querySelector('[data-testid="surtaxe-pv"]');
  return el ? parseFloat(el.textContent.replace(/[^0-9.]/g, '')) : null;
`)
// Assertion : valeur === 200 (pour S03-A) ou 4500 (pour S03-B)
```

---

## Scénario S04 — Taux prélèvements sociaux distinction IR vs BIC

**Objectif :** Vérifier que les PS sur plus-values = 17.2% et non 18.6%.

### Règle métier

```
PS sur plus-values immobilières (particuliers + LMNP) = 17.2%
PS sur revenus locatifs BIC (LMNP) = 18.6% (LFSS 2026, revenus 2025)
Ces deux taux ne doivent PAS être confondus.
```

### Sous-test S04-A : PS sur PV immobilière

```
Entrées : PV nette imposable (après abattements) = 42 000 €
PS = 42 000 × 17.2% = 7 224 €
Résultat attendu : PS sur PV = 7 224 €
Vérification : PAS 42 000 × 18.6% = 7 812 € (valeur incorrecte)
```

### Sous-test S04-B : PS sur revenus LMNP BIC

```
Régime : LMNP réel
Revenus BIC nets = 10 000 €
PS BIC = 10 000 × 18.6% = 1 860 €
Résultat attendu : PS revenus = 1 860 €
```

### Étapes Chrome DevTools

```javascript
// Onglet Plus-Value
evaluate_script(`
  return document.querySelector('[data-testid="ps-pv"]')?.textContent
`)
// Assertion : "7 224 €" ou "7224"

// Onglet Revenus / Fiscalité
evaluate_script(`
  return document.querySelector('[data-testid="ps-revenus"]')?.textContent
`)
```

---

## Scénario S05 — Réintégration amortissements LMNP dans la PV

**Objectif :** Vérifier que les amortissements LMNP classiques sont réintégrés dans la base imposable PV, sauf pour les résidences de services.

### Règle métier

```
LMNP classique : PV imposable += cumul des amortissements déduits
EHPAD / Résidence services : pas de réintégration
Cession avant 15/02/2025 : ancienne règle (réintégration totale = toujours)
```

### Sous-test S05-A : LMNP classique

```
Entrées :
  - Prix vente = 300 000 €
  - Prix acquisition corrigé = 220 000 €
  - Amortissements cumulés = 40 000 €
  - Type : LMNP classique (longue durée)

PV brute = 300 000 - 220 000 = 80 000 €
Base imposable PV = 80 000 + 40 000 = 120 000 €
Résultat attendu : base imposable PV = 120 000 €
```

### Sous-test S05-B : EHPAD / Résidence de services

```
Mêmes données que S05-A mais type = EHPAD
Base imposable PV = 80 000 € (sans réintégration)
Résultat attendu : base imposable PV = 80 000 €
```

### Étapes Chrome DevTools

```javascript
// Sélectionner le type de bien
click("input[value='lmnp-classique']")  // ou 'ehpad' pour S05-B
fill("input[name='amortissementsCumules']", "40000")
click("button:contains('Calculer')")
wait_for("networkidle")

evaluate_script(`
  return document.querySelector('[data-testid="base-imposable-pv"]')?.textContent
`)
```

---

## Scénario S06/S07 — Taux d'occupation (vacance locative)

**Objectif :** Vérifier que les revenus annuels intègrent le taux d'occupation.

### Formule métier

```
Revenus Bruts Annuels = Loyer Mensuel × (12 × Taux_Occupation)
                     = 1 000 × (12 × 0.92)
                     = 1 000 × 11.04
                     = 11 040 €/an (≠ 12 000 €)

Rentabilité brute = (Loyer Mensuel × 12 / Prix Achat) × 100
                  = (1 000 × 12 / 200 000) × 100
                  = 6.00%   ← utilise loyer facial sans vacance (convention marché)
```

### Entrées

| Champ | Valeur |
|-------|--------|
| Loyer mensuel | 1 000 € |
| Taux d'occupation | 92% |
| Prix d'achat | 200 000 € |

### Étapes Chrome DevTools

```javascript
// 1. Régler le slider taux d'occupation à 92%
fill("input[name='tauxOccupation']", "92")
// OU via le slider :
evaluate_script(`
  const slider = document.querySelector('input[type="range"][name="tauxOccupation"]');
  if (slider) {
    slider.value = 92;
    slider.dispatchEvent(new Event('input', { bubbles: true }));
    slider.dispatchEvent(new Event('change', { bubbles: true }));
  }
`)

fill("input[name='loyerMensuel']", "1000")
fill("input[name='prixAchat']", "200000")
click("button:contains('Calculer')")
wait_for("networkidle")

// 2. Vérifier les revenus annuels
evaluate_script(`
  const rev = document.querySelector('[data-testid="revenus-annuels"]');
  return rev ? parseFloat(rev.textContent.replace(/[^0-9.]/g, '')) : null;
`)
// Assertion : 11040 (pas 12000)

// 3. Vérifier la rentabilité brute
evaluate_script(`
  const rb = document.querySelector('[data-testid="rentabilite-brute"]');
  return rb ? rb.textContent : null;
`)
// Assertion : "6.00%" ou "6%"
```

### Assertions

```
Revenus annuels attendus : 11 040 € (1 000 × 12 × 0.92)
Rentabilité brute attendue : 6.00% (loyer facial / prix achat)
```

---

## Scénario S08 — Régression taux occupation 100%

**Objectif :** Vérifier qu'avec tauxOccupation=100%, les résultats sont identiques aux calculs sans vacance.

### Formule

```
Revenus Bruts Annuels = 1 000 × (12 × 1.00) = 12 000 €
Résultat attendu : 12 000 € (identique à l'ancien calcul sans vacance)
```

### Étapes Chrome DevTools

```javascript
evaluate_script(`
  const slider = document.querySelector('input[type="range"][name="tauxOccupation"]');
  if (slider) {
    slider.value = 100;
    slider.dispatchEvent(new Event('input', { bubbles: true }));
  }
`)
click("button:contains('Calculer')")
wait_for("networkidle")

evaluate_script(`
  return document.querySelector('[data-testid="revenus-annuels"]')?.textContent
`)
// Assertion : "12 000" ou "12000"
```

---

## Récapitulatif des assertions

| Scénario | Valeur attendue | Sélecteur DOM |
|----------|----------------|---------------|
| S01 — Prix acquisition corrigé | 238 000 € | `[data-testid="prix-acquisition-corrige"]` |
| S01 — PV brute | 42 000 € | `[data-testid="pv-brute"]` |
| S02-A — Abattement IR (5 ans) | 0% | `[data-testid="abattement-ir"]` |
| S02-B — Abattement IR (10 ans) | 20% | `[data-testid="abattement-ir"]` |
| S02-C — Abattement IR (22 ans) | 100% | `[data-testid="abattement-ir"]` |
| S02-D — PV exonérée (30 ans) | 0 € | `[data-testid="impot-pv-total"]` |
| S03-A — Surtaxe (60k€) | 200 € | `[data-testid="surtaxe-pv"]` |
| S03-B — Surtaxe (200k€) | 4 500 € | `[data-testid="surtaxe-pv"]` |
| S04-A — PS sur PV | 17.2% affiché | `[data-testid="taux-ps-pv"]` |
| S04-B — PS revenus LMNP | 18.6% affiché | `[data-testid="taux-ps-bic"]` |
| S05-A — Base PV avec réintégration | 120 000 € | `[data-testid="base-imposable-pv"]` |
| S05-B — Base PV sans réintégration | 80 000 € | `[data-testid="base-imposable-pv"]` |
| S06 — Revenus annuels (92%) | 11 040 € | `[data-testid="revenus-annuels"]` |
| S07 — Rentabilité brute | 6.00% | `[data-testid="rentabilite-brute"]` |
| S08 — Revenus annuels (100%) | 12 000 € | `[data-testid="revenus-annuels"]` |
