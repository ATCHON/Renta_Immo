# Plan de Tests Réels — Sprint 3 : Scoring dual profil + HCSF configurable (S16-S18)

**Date :** 2026-02-16
**Branch :** `feature/sprint-4-backoffice`
**Sprint couvert :** V2-S16 à V2-S18

---

## Pré-requis

| Élément | Valeur |
|---------|--------|
| URL locale | `http://localhost:3000` |
| Compte test | `test-auth-script@example.com` / `Password123!` |
| Serveur dev | `npm run dev` actif |
| État BDD | Une simulation existante recommandée pour S16 |

---

## Setup Chrome DevTools

```
1. mcp__chrome-devtools__new_page
2. mcp__chrome-devtools__navigate_page → http://localhost:3000
3. mcp__chrome-devtools__wait_for (networkidle)
4. Se connecter si nécessaire
5. Ouvrir le simulateur et effectuer un calcul de base pour avoir des résultats
```

---

## Scénario S16 — Scoring dual profil Rentier vs Patrimonial

**Objectif :** Vérifier que le même calcul produit 2 scores distincts selon le profil sélectionné, calculés en une seule passe (sans rechargement).

### Règles métier (pondérations par profil)

**Profil Rentier (défaut) :**
| Critère | Pondération |
|---------|------------|
| Rentabilité nette | 1.0× (standard) |
| Cashflow | 1.0× (standard) |
| DPE | 1.0× (standard) |

**Profil Patrimonial :**
| Critère | Pondération |
|---------|------------|
| Rentabilité nette | 1.5× |
| DPE | 1.5× |
| Cashflow | 0.5× |

### Données de test standard

```
Entrées communes :
  - prixAchat = 200 000 €
  - loyerMensuel = 900 €
  - tauxOccupation = 92%
  - tauxCredit = 3.5%
  - dureeCredit = 20 ans
  - DPE = C
  - Régime : LMNP Réel
```

### Sous-test S16-A : Présence des 2 scores

```
Résultat attendu : 2 scores visibles dans l'interface :
  - score_rentier : valeur numérique (0-100)
  - score_patrimonial : valeur numérique différente de score_rentier
```

### Sous-test S16-B : Toggle profil = changement de score affiché

```
Étape 1 : Profil Rentier sélectionné → note affichée = score_rentier
Étape 2 : Toggle vers Patrimonial → note affichée = score_patrimonial
Résultat attendu : note change SANS rechargement de la page (pas de nouvelle requête API)
```

### Sous-test S16-C : Impact pondérations sur score Patrimonial

```
Si rentabilité_nette > cashflow dans les critères :
  - score_patrimonial doit être > score_rentier (car rentabilité pondérée ×1.5)

Si cashflow très positif et rentabilité faible :
  - score_patrimonial peut être < score_rentier (cashflow pondéré ×0.5)
```

### Étapes Chrome DevTools

```javascript
// 1. Effectuer un calcul
fill("input[name='prixAchat']", "200000")
fill("input[name='loyerMensuel']", "900")
// ... autres champs
click("button:contains('Calculer')")
wait_for("networkidle")

// 2. Vérifier présence des 2 scores
evaluate_script(`
  return {
    scoreRentier: document.querySelector('[data-testid="score-rentier"]')?.textContent,
    scorePatrimonial: document.querySelector('[data-testid="score-patrimonial"]')?.textContent,
    scoreAffiche: document.querySelector('[data-testid="score-global"]')?.textContent
  }
`)
// Assertion : scoreRentier !== scorePatrimonial, les 2 sont présents

// 3. Toggle vers Patrimonial (surveiller qu'il n'y a pas de requête API)
evaluate_script(`window.__requestCount = 0; const origFetch = window.fetch; window.fetch = (...args) => { window.__requestCount++; return origFetch(...args); }`)
click("button[data-profile='patrimonial'], input[value='patrimonial']")
evaluate_script(`
  return {
    requestsMade: window.__requestCount,
    scoreAffiche: document.querySelector('[data-testid="score-global"]')?.textContent
  }
`)
// Assertion : requestsMade === 0 (pas de rechargement API), scoreAffiche = score_patrimonial
```

### Vérification structure `scores_par_profil`

```javascript
// Vérifier la structure de données retournée par l'API
evaluate_script(`
  // Si les résultats sont dans window ou un store accessible
  const store = window.__zustand || window.__store;
  return store?.getState?.()?.resultats?.synthese?.scores_par_profil;
`)
// Assertion : { rentier: <number>, patrimonial: <number> }
```

---

## Scénario S17 — Alertes seuil LMP

**Objectif :** Vérifier que les alertes LMP s'affichent aux bons seuils de recettes annuelles.

### Règles métier (seuils LMP)

```
Recettes < 20 000 €/an : aucune alerte LMP
20 000 € ≤ Recettes < 23 000 €/an : alerte orange (approche du seuil LMP)
Recettes ≥ 23 000 €/an : alerte rouge (seuil LMP atteint ou dépassé)

Formule recettes : Loyer mensuel × 12 × tauxOccupation
```

### Sous-test S17-A : Recettes < 20 000 € → pas d'alerte

```
Entrées :
  - loyerMensuel = 1 500 €
  - tauxOccupation = 92%
  - Recettes = 1 500 × 12 × 0.92 = 16 560 €

Résultat attendu : aucune alerte LMP visible
```

### Sous-test S17-B : Recettes ≈ 21 000 € → alerte orange

```
Entrées :
  - loyerMensuel = 1 900 €
  - tauxOccupation = 92%
  - Recettes = 1 900 × 12 × 0.92 = 20 976 €

Résultat attendu : alerte orange LMP visible
```

### Sous-test S17-C : Recettes > 23 000 € → alerte rouge

```
Entrées :
  - loyerMensuel = 2 100 €
  - tauxOccupation = 92%
  - Recettes = 2 100 × 12 × 0.92 = 23 184 €

Résultat attendu : alerte rouge LMP visible
```

### Étapes Chrome DevTools

```javascript
// S17-A
fill("input[name='loyerMensuel']", "1500")
evaluate_script(`
  const slider = document.querySelector('input[type="range"][name="tauxOccupation"]');
  if (slider) { slider.value = 92; slider.dispatchEvent(new Event('input', {bubbles:true})); }
`)
click("button:contains('Calculer')")
wait_for("networkidle")

evaluate_script(`
  const alerteLMP = document.querySelector('[data-testid="alerte-lmp"]');
  return { visible: alerteLMP !== null, texte: alerteLMP?.textContent }
`)
// Assertion : visible === false

// S17-B
fill("input[name='loyerMensuel']", "1900")
click("button:contains('Calculer')")
wait_for("networkidle")
evaluate_script(`
  const alerteLMP = document.querySelector('[data-testid="alerte-lmp"]');
  return {
    visible: alerteLMP !== null,
    classe: alerteLMP?.className,
    texte: alerteLMP?.textContent
  }
`)
// Assertion : visible === true, classe contient 'orange' ou 'warning'

// S17-C
fill("input[name='loyerMensuel']", "2100")
click("button:contains('Calculer')")
wait_for("networkidle")
evaluate_script(`
  const alerteLMP = document.querySelector('[data-testid="alerte-lmp"]');
  return {
    visible: alerteLMP !== null,
    classe: alerteLMP?.className,
  }
`)
// Assertion : visible === true, classe contient 'red' ou 'danger' ou 'error'
```

### Calcul de vérification recettes

```javascript
// Vérifier que les recettes affichées correspondent bien à la formule
evaluate_script(`
  const recettes = document.querySelector('[data-testid="recettes-annuelles"]');
  return recettes ? parseFloat(recettes.textContent.replace(/[^0-9.]/g, '')) : null;
`)
// S17-C : assertion === 23184 (2100 × 12 × 0.92)
```

---

## Scénario S18 — Pondération HCSF configurable

**Objectif :** Vérifier que la pondération des loyers dans le calcul HCSF est configurable et que le bouton GLI modifie correctement le taux.

### Règles métier

```
Formule taux endettement HCSF :
  Revenus pondérés = loyers × (ponderation / 100)
  Taux endettement = (mensualité crédit) / (revenus fixes + revenus pondérés) × 100

Pondération par défaut = 70%
Pondération avec GLI = 80% (Garantie Loyers Impayés)
```

### Sous-test S18-A : Pondération 70% par défaut

```
Entrées :
  - Mensualité crédit = 800 €/mois
  - Revenus fixes (salaire) = 3 000 €/mois
  - Loyers = 1 000 €/mois
  - Pondération = 70% (défaut)

Revenus pondérés = 1 000 × 0.70 = 700 €
Taux endettement = 800 / (3 000 + 700) × 100 = 800 / 3 700 × 100 = 21.62%
Résultat attendu : taux endettement ≈ 21.62%
```

### Sous-test S18-B : Pondération 80% avec GLI

```
Mêmes données, pondération = 80%

Revenus pondérés = 1 000 × 0.80 = 800 €
Taux endettement = 800 / (3 000 + 800) × 100 = 800 / 3 800 × 100 = 21.05%
Résultat attendu : taux endettement ≈ 21.05% (plus favorable)
```

### Sous-test S18-C : Impact visuel du toggle GLI

```
Résultat attendu :
  - Avant GLI : taux affiché = 21.62%
  - Après clic "GLI (80%)" : taux se met à jour → 21.05%
  - Pas de rechargement de page nécessaire
```

### Étapes Chrome DevTools

```javascript
// S18-A : vérifier valeur par défaut du slider
evaluate_script(`
  const slider = document.querySelector('input[type="range"][name="ponderationLoyers"], [data-testid="ponderation-hcsf"]');
  return slider ? slider.value : 'non trouvé';
`)
// Assertion : "70"

// Vérifier le taux d'endettement
fill("input[name='mensualiteCredit']", "800")
fill("input[name='revenusFixesMensuels']", "3000")
fill("input[name='loyerMensuel']", "1000")
click("button:contains('Calculer')")
wait_for("networkidle")

evaluate_script(`
  return document.querySelector('[data-testid="taux-endettement-hcsf"]')?.textContent
`)
// Assertion : "21.62%" ou "21,62%"

// S18-B : activer GLI
click("button[data-testid='btn-gli'], button:contains('GLI'), button:contains('80%')")
evaluate_script(`
  return {
    ponderation: document.querySelector('[data-testid="ponderation-hcsf"]')?.value,
    tauxEndettement: document.querySelector('[data-testid="taux-endettement-hcsf"]')?.textContent
  }
`)
// Assertion : ponderation = "80", tauxEndettement = "21.05%"
```

---

## Récapitulatif des assertions

| Scénario | Valeur attendue | Sélecteur DOM |
|----------|----------------|---------------|
| S16-A — Score rentier présent | valeur 0-100 | `[data-testid="score-rentier"]` |
| S16-A — Score patrimonial présent | valeur différente | `[data-testid="score-patrimonial"]` |
| S16-B — Toggle sans rechargement API | 0 requêtes | `window.__requestCount` |
| S16-C — Score patrimonial ≠ rentier | true | comparaison valeurs |
| S17-A — Pas d'alerte LMP (16 560 €) | absent | `[data-testid="alerte-lmp"]` |
| S17-B — Alerte orange LMP (20 976 €) | orange/visible | `[data-testid="alerte-lmp"]` |
| S17-C — Alerte rouge LMP (23 184 €) | rouge/visible | `[data-testid="alerte-lmp"]` |
| S18-A — Pondération défaut | 70% | `[data-testid="ponderation-hcsf"]` |
| S18-A — Taux endettement (70%) | 21.62% | `[data-testid="taux-endettement-hcsf"]` |
| S18-B — Taux endettement (80% GLI) | 21.05% | `[data-testid="taux-endettement-hcsf"]` |
| S18-C — Mise à jour sans rechargement | immédiate | comportement UI |
