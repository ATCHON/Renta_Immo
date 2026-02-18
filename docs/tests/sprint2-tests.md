# Plan de Tests Réels — Sprint 2 : Conformité fiscale + DPE + Déficit foncier (S09-S15)

**Date :** 2026-02-16
**Branch :** `feature/sprint-4-backoffice`
**Sprint couvert :** V2-S09 à V2-S15

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
3. mcp__chrome-devtools__wait_for (networkidle)
4. Se connecter si nécessaire via /auth/signin
5. Naviguer vers le simulateur principal
```

---

## Scénario S09 — 3 catégories Micro-BIC (Loi Le Meur)

**Objectif :** Vérifier que les abattements Micro-BIC correspondent aux nouvelles règles post-Loi Le Meur (nov. 2024).

### Règles métier (MIS À JOUR LFI 2025 / LOI LE MEUR)

| Catégorie | Abattement | Plafond |
|-----------|------------|---------|
| LMNP Meublé longue durée | 50% | 77 700 € |
| Tourisme classé / Chambres d'hôtes | 50% | 77 700 € (⬇️ ex-71%) |
| Tourisme non classé | 30% | 15 000 € (⬇️ ex-50%, ex-77 700€) |

### Sous-test S09-A : LMNP meublée longue durée, recettes 50 000 €

```
Entrées :
  - Régime : Micro-BIC
  - Type : Longue durée (classique)
  - Recettes = 50 000 €

Revenu imposable = 50 000 × (1 - 50%) = 25 000 €
Résultat attendu : abattement = 50%, imposable = 25 000 €
```

### Sous-test S09-B : Tourisme classé, recettes 50 000 €

```
Recettes = 50 000 € (sous plafond 77 700 €)
Revenu imposable = 50 000 × (1 - 50%) = 25 000 €
⚠️ IMPORTANT : PAS 50 000 × (1 - 71%) = 14 500 € (ancienne règle, incorrecte)
Résultat attendu : abattement = 50%, imposable = 25 000 €
```

### Sous-test S09-C : Tourisme non classé, recettes 10 000 €

```
Recettes = 10 000 € (sous plafond 15 000 €)
Revenu imposable = 10 000 × (1 - 30%) = 7 000 €
⚠️ IMPORTANT : PAS 10 000 × (1 - 50%) = 5 000 € (ancienne règle)
Résultat attendu : abattement = 30%, imposable = 7 000 €
```

### Sous-test S09-D : Tourisme non classé, recettes > 15 000 € (basculement réel)

```
Recettes = 20 000 € (dépasse plafond 15 000 €)
Résultat attendu : alerte "Basculement automatique au régime réel" ou passage automatique
```

### Étapes Chrome DevTools

```javascript
// Sélectionner le régime Micro-BIC et le type de location
click("input[value='micro-bic']")
click("input[value='longue-duree']")  // S09-A
fill("input[name='recettes']", "50000")
click("button:contains('Calculer')")
wait_for("networkidle")

evaluate_script(`
  return {
    abattement: document.querySelector('[data-testid="abattement-micro"]')?.textContent,
    imposable: document.querySelector('[data-testid="revenu-imposable"]')?.textContent
  }
`)

// Pour S09-B : click("input[value='tourisme-classe']")
// Pour S09-C : click("input[value='tourisme-non-classe']"), fill("50000" → "10000")
// Pour S09-D : fill("input[name='recettes']", "20000") avec type='tourisme-non-classe'
```

### Assertions

```
S09-A : abattement=50%, imposable=25 000 €
S09-B : abattement=50%, imposable=25 000 € (PAS 71%)
S09-C : abattement=30%, imposable=7 000 € (PAS 50%)
S09-D : alerte visible "basculement réel"
```

---

## Scénario S10 — CFE (Cotisation Foncière des Entreprises)

**Objectif :** Vérifier les règles d'exonération et de calcul de la CFE.

### Règles métier

```
Recettes < 5 000 €/an → pas de CFE (exonération permanente)
Recettes ≥ 5 000 €/an → CFE = 300 € par défaut
1ère année d'activité → exonérée (quelle que soit les recettes)
```

### Sous-test S10-A : Recettes < 5 000 €

```
Recettes = 3 000 €/an
Résultat attendu : CFE = 0 € (exonéré)
```

### Sous-test S10-B : Recettes ≥ 5 000 €

```
Recettes = 12 000 €/an
Résultat attendu : CFE = 300 €/an (soit 25 €/mois dans le cashflow)
```

### Sous-test S10-C : 1ère année

```
Recettes = 20 000 €, Année = 1
Résultat attendu : CFE = 0 € (exonération 1ère année)
```

### Étapes Chrome DevTools

```javascript
// S10-A
fill("input[name='recettes']", "3000")
click("button:contains('Calculer')")
wait_for("networkidle")
evaluate_script(`
  return document.querySelector('[data-testid="cfe-annuel"]')?.textContent
`)
// Assertion : "0" ou "0 €"

// S10-B
fill("input[name='recettes']", "12000")
click("button:contains('Calculer')")
wait_for("networkidle")
evaluate_script(`
  return document.querySelector('[data-testid="cfe-annuel"]')?.textContent
`)
// Assertion : "300" ou "300 €"

// S10-C : cocher "1ère année" si case à cocher disponible
click("input[name='premiereAnnee']")
evaluate_script(`
  return document.querySelector('[data-testid="cfe-annuel"]')?.textContent
`)
// Assertion : "0"
```

---

## Scénario S11 — Frais de comptabilité LMNP Réel

**Objectif :** Vérifier la visibilité et la déductibilité des frais de comptabilité.

### Règles métier

```
Frais comptabilité :
  - Visibles UNIQUEMENT en régime LMNP Réel
  - Valeur par défaut = 500 €/an
  - Déductibles à 100% (aucune réduction OGA/CGA)
```

### Sous-test S11-A : Visibilité (LMNP Réel vs Micro)

```
Régime Micro-BIC → champ "frais comptabilité" doit être ABSENT
Régime LMNP Réel → champ "frais comptabilité" doit être VISIBLE avec valeur 500 €
```

### Sous-test S11-B : Déductibilité

```
Régime LMNP Réel, frais compta = 600 €
Charges déductibles += 600 € (100%, pas de réduction)
Résultat attendu : frais compta = 600 € dans le détail des charges
```

### Étapes Chrome DevTools

```javascript
// S11-A : en Micro-BIC
click("input[value='micro-bic']")
evaluate_script(`
  const el = document.querySelector('[data-testid="frais-comptabilite"], input[name="fraisCompta"]');
  return el ? 'visible' : 'absent';
`)
// Assertion : 'absent'

// S11-A : en LMNP Réel
click("input[value='lmnp-reel']")
evaluate_script(`
  const el = document.querySelector('[data-testid="frais-comptabilite"], input[name="fraisCompta"]');
  return el ? { visible: true, value: el.value } : 'absent';
`)
// Assertion : { visible: true, value: "500" }

// S11-B : modifier la valeur
fill("input[name='fraisCompta']", "600")
click("button:contains('Calculer')")
wait_for("networkidle")
evaluate_script(`
  return document.querySelector('[data-testid="charges-deductibles-detail"]')?.textContent
`)
// Assertion : contient "600" ou "frais comptabilité : 600 €"
```

---

## Scénario S12 — Absence de mention OGA/CGA

**Objectif :** Vérifier qu'aucune mention OGA/CGA n'apparaît dans l'interface (suppression post-audit).

### Règle métier

```
Les organismes de gestion agréés (OGA/CGA) ne sont plus des paramètres actifs.
Aucune mention OGA ou CGA ne doit apparaître dans le formulaire ou les résultats.
```

### Étapes Chrome DevTools

```javascript
// Recherche de tout texte OGA/CGA dans le DOM
evaluate_script(`
  const bodyText = document.body.innerText.toLowerCase();
  const hasOGA = bodyText.includes('oga') || bodyText.includes('cga')
                 || bodyText.includes('organisme de gestion');
  return { hasOGA, relevant: hasOGA ? 'FAIL - mention trouvée' : 'PASS - aucune mention' };
`)
// Assertion : hasOGA === false

// Recherche dans les labels et placeholders
evaluate_script(`
  const inputs = Array.from(document.querySelectorAll('label, input, select, option'));
  return inputs.filter(el =>
    el.textContent?.toLowerCase().includes('oga') ||
    el.textContent?.toLowerCase().includes('cga') ||
    el.placeholder?.toLowerCase().includes('oga')
  ).map(el => el.outerHTML);
`)
// Assertion : tableau vide []
```

---

## Scénario S13/S14 — Alertes DPE et gel des loyers

**Objectif :** Vérifier le comportement selon la classe DPE (inflation loyers et décote valeur).

### Règles métier (DPE)

```
DPE F ou G :
  - Taux inflation loyers = 0% (gel légal)
  - Décote valeur bien = -15%
  - Alerte rouge "passoire thermique"

DPE E :
  - Taux inflation loyers = 0% à partir de 2034
  - Alerte orange "bien à risque"

DPE A/B/C/D :
  - Comportement normal (inflation loyers +2%/an)
```

### Sous-test S13-A : DPE G → gel loyers et décote

```
Entrées : DPE = G, loyerMensuel = 1 000 €, prixAchat = 200 000 €
Résultat attendu :
  - Inflation loyers en projection = 0% (pas +2%/an)
  - Valeur bien dans projection = 200 000 × (1 + 1.5% - 15%) = ajusté
  - Alerte "passoire thermique" visible
```

### Sous-test S13-B : DPE A → comportement normal

```
Entrées : DPE = A, loyerMensuel = 1 000 €
Résultat attendu :
  - Inflation loyers = +2%/an en projection
  - Pas d'alerte DPE
  - Pas de décote valeur
```

### Sous-test S14-A : DPE E → alerte orange

```
Entrées : DPE = E
Résultat attendu : alerte orange visible, pas d'alerte rouge
```

### Étapes Chrome DevTools

```javascript
// S13-A : DPE G
click("select[name='dpe'] option[value='G']")
// ou : fill("select[name='dpe']", "G")
click("button:contains('Calculer')")
wait_for("networkidle")

evaluate_script(`
  return {
    alerte: document.querySelector('[data-testid="alerte-dpe"]')?.textContent,
    alerteClasse: document.querySelector('[data-testid="alerte-dpe"]')?.className,
    inflationLoyers: document.querySelector('[data-testid="inflation-loyers"]')?.textContent
  }
`)
// Assertion : alerte visible, inflationLoyers = "0%" ou "0.00%"

// S13-B : DPE A
click("select[name='dpe'] option[value='A']")
click("button:contains('Calculer')")
evaluate_script(`
  return {
    alerte: document.querySelector('[data-testid="alerte-dpe"]')?.textContent,
    inflationLoyers: document.querySelector('[data-testid="inflation-loyers"]')?.textContent
  }
`)
// Assertion : pas d'alerte DPE, inflationLoyers = "2%" ou "2.00%"
```

---

## Scénario S15 — Déficit foncier majoré (rénovation énergétique)

**Objectif :** Vérifier les plafonds de déduction du déficit foncier selon la présence ou non d'une rénovation énergétique.

### Règles métier

```
Sans rénovation énergétique :
  - Plafond déficit foncier = 10 700 €/an

Avec rénovation énergétique éligible (travaux ≤ 2025) :
  - Plafond déficit foncier majoré = 21 400 €/an

Avec rénovation ≥ 2026 (dispositif expiré) :
  - Alerte "dispositif temporaire expiré"
  - Plafond revient à 10 700 €
```

### Sous-test S15-A : Sans rénovation

```
Entrées :
  - Régime : Location nue (Foncier réel)
  - Charges = 15 000 €, Revenus = 8 000 €
  - Déficit brut = 7 000 € (< 10 700 €)
  - Rénovation : Non

Déficit déductible = 7 000 € (sous plafond)
Report sur 10 ans : 0 € (pas de report)
Résultat attendu : déficit foncier = 7 000 €
```

### Sous-test S15-B : Avec rénovation éligible ≤ 2025

```
Entrées :
  - Déficit brut = 18 000 €
  - Rénovation énergétique : Oui, année = 2024

Déficit déductible = 18 000 € (sous plafond majoré 21 400 €)
Résultat attendu : déficit foncier = 18 000 € (PASS)
```

### Sous-test S15-C : Rénovation après 2025

```
Entrées : Rénovation énergétique : Oui, année = 2026
Résultat attendu : alerte "dispositif temporaire expiré" visible
Plafond appliqué = 10 700 €
```

### Étapes Chrome DevTools

```javascript
// S15-A
click("input[value='foncier-reel']")
fill("input[name='chargesAnnuelles']", "15000")
fill("input[name='revenusLocatifs']", "8000")
// désactiver rénovation si elle est cochée
click("button:contains('Calculer')")
wait_for("networkidle")

evaluate_script(`
  return {
    deficit: document.querySelector('[data-testid="deficit-foncier"]')?.textContent,
    plafond: document.querySelector('[data-testid="plafond-deficit"]')?.textContent
  }
`)
// Assertion : déficit = "7 000", plafond = "10 700"

// S15-B
click("input[name='renovationEnergetique']")  // cocher
fill("input[name='anneeRenovation']", "2024")
click("button:contains('Calculer')")
evaluate_script(`
  return document.querySelector('[data-testid="plafond-deficit"]')?.textContent
`)
// Assertion : "21 400"

// S15-C
fill("input[name='anneeRenovation']", "2026")
click("button:contains('Calculer')")
evaluate_script(`
  return {
    alerte: document.querySelector('[data-testid="alerte-dispositif-expire"]')?.textContent,
    plafond: document.querySelector('[data-testid="plafond-deficit"]')?.textContent
  }
`)
// Assertion : alerte visible, plafond = "10 700"
```

---

## Récapitulatif des assertions

| Scénario | Valeur attendue | Sélecteur DOM |
|----------|----------------|---------------|
| S09-A — Abattement longue durée | 50% | `[data-testid="abattement-micro"]` |
| S09-B — Abattement tourisme classé | 50% (pas 71%) | `[data-testid="abattement-micro"]` |
| S09-C — Abattement tourisme non classé | 30% (pas 50%) | `[data-testid="abattement-micro"]` |
| S09-D — Dépassement plafond 15k€ | Alerte basculement | `[data-testid="alerte-regime-reel"]` |
| S10-A — CFE < 5k€ recettes | 0 € | `[data-testid="cfe-annuel"]` |
| S10-B — CFE ≥ 5k€ recettes | 300 € | `[data-testid="cfe-annuel"]` |
| S10-C — CFE 1ère année | 0 € | `[data-testid="cfe-annuel"]` |
| S11-A — Frais compta absent (Micro) | absent | `input[name="fraisCompta"]` |
| S11-A — Frais compta visible (Réel) | 500 € | `input[name="fraisCompta"]` |
| S11-B — Frais compta déductibles | 600 € dans charges | `[data-testid="charges-deductibles-detail"]` |
| S12 — Aucune mention OGA/CGA | false | `document.body.innerText` |
| S13-A — DPE G inflation loyers | 0% | `[data-testid="inflation-loyers"]` |
| S13-A — DPE G alerte | Rouge/visible | `[data-testid="alerte-dpe"]` |
| S13-B — DPE A inflation loyers | 2% | `[data-testid="inflation-loyers"]` |
| S14-A — DPE E alerte | Orange/visible | `[data-testid="alerte-dpe"]` |
| S15-A — Déficit foncier plafond | 10 700 € | `[data-testid="plafond-deficit"]` |
| S15-B — Plafond majoré avec réno | 21 400 € | `[data-testid="plafond-deficit"]` |
| S15-C — Alerte dispositif expiré | visible | `[data-testid="alerte-dispositif-expire"]` |
