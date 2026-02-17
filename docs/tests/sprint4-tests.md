# Plan de Tests Réels — Sprint 4 : Back-Office Config (S19-S24)

**Date :** 2026-02-16
**Branch :** `feature/sprint-4-backoffice`
**Sprint couvert :** V2-S19 à V2-S24

---

## Pré-requis

| Élément | Valeur |
|---------|--------|
| URL locale | `http://localhost:3000` |
| Compte test standard | `test-auth-script@example.com` / `Password123!` |
| Compte admin | À promouvoir via `node scripts/promote-admin.mjs` |
| Serveur dev | `npm run dev` actif |
| Migration BDD | `supabase/migrations/20260216_sprint4_config_params.sql` appliquée |

### Promotion admin préalable

```bash
# Promouvoir le compte test en admin avant les tests S19/S20/S21
node scripts/promote-admin.mjs test-auth-script@example.com
```

---

## Setup Chrome DevTools

```
1. mcp__chrome-devtools__new_page
2. mcp__chrome-devtools__navigate_page → http://localhost:3000
3. mcp__chrome-devtools__wait_for (networkidle)
4. Se connecter avec le compte admin
```

---

## Scénario S19 — Schéma config et protection de route /admin/params

**Objectif :** Vérifier que la route `/admin/params` est protégée (401 non-admin) et accessible aux admins.

### Sous-test S19-A : Accès non authentifié → redirection login

```
Action : navigate_page → http://localhost:3000/admin/params (sans être connecté)
Résultat attendu : redirection vers /auth/signin ou page 401/403
```

### Sous-test S19-B : Accès user standard → 403 Forbidden

```
Action : Se connecter en user NON admin, puis naviguer vers /admin/params
Résultat attendu : page 403 ou message "Accès refusé" ou redirection
```

### Sous-test S19-C : Accès admin → page visible

```
Action : Se connecter en admin, naviguer vers /admin/params
Résultat attendu : page admin visible avec les paramètres de configuration
```

### Étapes Chrome DevTools

```javascript
// S19-A : Sans connexion
navigate_page("http://localhost:3000/admin/params")
wait_for("networkidle")
evaluate_script(`
  return {
    url: window.location.href,
    statut: document.querySelector('[data-testid="error-403"]') ? '403'
            : window.location.pathname.includes('signin') ? 'redirect-login'
            : 'autre'
  }
`)
// Assertion : url contient 'signin' ou statut = '403'

// S19-B : User standard connecté
// (se connecter d'abord avec un compte NON admin)
navigate_page("http://localhost:3000/admin/params")
wait_for("networkidle")
evaluate_script(`
  return {
    status: document.querySelector('[data-testid="error-403"]')?.textContent
            || document.title,
    url: window.location.href
  }
`)
// Assertion : message d'erreur ou redirection

// S19-C : Admin connecté
// (se connecter avec le compte admin promu)
navigate_page("http://localhost:3000/admin/params")
wait_for("networkidle")
evaluate_script(`
  return {
    pageVisible: document.querySelector('[data-testid="admin-params-page"]') !== null,
    titre: document.querySelector('h1, [data-testid="page-title"]')?.textContent,
    nombreBlocs: document.querySelectorAll('[data-testid^="bloc-config-"]').length
  }
`)
// Assertion : pageVisible = true, nombreBlocs = 8 (blocs A à H)
```

---

## Scénario S21 — Interface admin : 8 blocs organisés

**Objectif :** Vérifier la présence et l'organisation des 8 blocs de configuration (A à H).

### Blocs attendus

| Bloc | Contenu |
|------|---------|
| A | Paramètres fiscaux (taux PS, taux IS, etc.) |
| B | Régimes micro (abattements, plafonds) |
| C | Frais d'acquisition (taux notaire) |
| D | Amortissement (durées, composants) |
| E | Hypothèses de projection (inflation, revalorisation) |
| F | HCSF (pondération loyers, seuils) |
| G | DPE (décotes, gel loyers) |
| H | Dispositifs temporaires (déficit foncier, seuils LMP) |

### Étapes Chrome DevTools

```javascript
navigate_page("http://localhost:3000/admin/params")
wait_for("networkidle")

// Vérifier présence des 8 blocs
evaluate_script(`
  const blocs = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  return blocs.map(b => ({
    bloc: b,
    present: document.querySelector(
      \`[data-testid="bloc-config-\${b}"], [data-bloc="\${b}"], #bloc-\${b}\`
    ) !== null
  }));
`)
// Assertion : tous les 8 blocs présents (present = true)

// Vérifier qu'au moins un paramètre est listé par bloc
evaluate_script(`
  return Array.from(document.querySelectorAll('[data-testid="param-row"]')).length
`)
// Assertion : >= 8 (au moins 1 paramètre par bloc)

// Vérifier la présence d'un champ modifiable
evaluate_script(`
  const firstInput = document.querySelector('[data-testid="param-input"]');
  return {
    present: firstInput !== null,
    type: firstInput?.type,
    value: firstInput?.value
  }
`)
// Assertion : present = true
```

---

## Scénario S20 — API CRUD paramètres admin

**Objectif :** Vérifier les endpoints API admin (GET liste, PUT mise à jour, audit log).

### Sous-test S20-A : GET /api/admin/params → liste des paramètres

```
Action : Requête GET sur /api/admin/params (avec token admin)
Résultat attendu : tableau JSON de paramètres avec id, key, value, description
```

### Sous-test S20-B : PUT /api/admin/params/:id → mise à jour

```
Action : Modifier la valeur d'un paramètre via PUT
Résultat attendu :
  - Code HTTP 200
  - Valeur mise à jour en BDD
  - Audit log créé (table config_params_audit ou similaire)
```

### Étapes Chrome DevTools

```javascript
// S20-A : Requête GET via l'interface admin
navigate_page("http://localhost:3000/admin/params")
wait_for("networkidle")

// Intercepter la réponse API via les network requests
list_network_requests()
// Chercher la requête GET /api/admin/params dans la liste
// Assertion : status = 200, response est un tableau JSON

// Alternative : tester directement via evaluate_script
evaluate_script(`
  return fetch('/api/admin/params', {
    headers: { 'Content-Type': 'application/json' }
  }).then(r => r.json()).then(data => ({
    isArray: Array.isArray(data),
    count: Array.isArray(data) ? data.length : 0,
    firstItem: Array.isArray(data) ? data[0] : data
  }));
`)
// Assertion : isArray = true, count > 0, firstItem a les propriétés id/key/value

// S20-B : Modification d'un paramètre
evaluate_script(`
  // Récupérer l'id du premier paramètre
  return fetch('/api/admin/params').then(r => r.json()).then(params => params[0]?.id);
`)
// → stocker l'id

evaluate_script(`
  const paramId = 'ID_RECUPERE';  // remplacer par l'id réel
  return fetch(\`/api/admin/params/\${paramId}\`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: '999', comment: 'Test Chrome DevTools' })
  }).then(r => ({ status: r.status, ok: r.ok }));
`)
// Assertion : status = 200, ok = true
```

### Vérification audit log

```javascript
// Vérifier la création d'un audit log
evaluate_script(`
  return fetch('/api/admin/params/audit', {
    headers: { 'Content-Type': 'application/json' }
  }).then(r => r.json()).then(logs => ({
    hasLogs: logs.length > 0,
    lastLog: logs[0]
  }));
`)
// Assertion : hasLogs = true, lastLog.action = 'update'
```

---

## Scénario S22 — Migration constantes en BDD (fallback)

**Objectif :** Vérifier que les calculs utilisent les valeurs BDD et que le fallback sur `constants.ts` fonctionne en cas d'erreur BDD.

### Sous-test S22-A : Calcul avec paramètre BDD modifié

```
Précondition : Modifier le taux de PS (prélèvements sociaux) de 17.2% à 15% en BDD

Action : Lancer un calcul de plus-value
Résultat attendu : PS calculé à 15% (valeur BDD), pas à 17.2% (valeur constants.ts)

Formule de vérification :
  PV nette = 50 000 €
  PS attendu = 50 000 × 15% = 7 500 €
  PS incorrect = 50 000 × 17.2% = 8 600 €
```

### Sous-test S22-B : Fallback en cas d'erreur BDD

```
Précondition : Simuler une erreur BDD (couper la connexion ou utiliser un ID invalide)
Action : Lancer un calcul
Résultat attendu :
  - Pas d'erreur 500 côté utilisateur
  - Calcul effectué avec les valeurs de constants.ts
  - Log d'erreur en console serveur
```

### Étapes Chrome DevTools

```javascript
// S22-A : Modifier la valeur en BDD via l'interface admin
navigate_page("http://localhost:3000/admin/params")
wait_for("networkidle")

// Trouver le paramètre taux PS et le modifier
evaluate_script(`
  const inputs = Array.from(document.querySelectorAll('[data-param-key="tauxPS"], [data-key="TAUX_PS"]'));
  return inputs.map(i => ({ el: i.tagName, value: i.value }));
`)

// Modifier la valeur (si input trouvé)
fill("[data-param-key='tauxPS'] input, input[data-key='TAUX_PS']", "15")
click("button:contains('Sauvegarder'), button[data-testid='save-param']")
wait_for("networkidle")

// Aller calculer une simulation
navigate_page("http://localhost:3000")
fill("input[name='prixAchat']", "200000")
fill("input[name='prixVente']", "250000")
fill("input[name='dureeDétention']", "5")
click("button:contains('Calculer')")
wait_for("networkidle")

evaluate_script(`
  const psPV = document.querySelector('[data-testid="ps-pv"]');
  return psPV ? parseFloat(psPV.textContent.replace(/[^0-9.]/g, '')) : null;
`)
// Assertion : valeur ≈ 7 500 (15% de 50 000) pas 8 600 (17.2%)

// Remettre la valeur correcte après le test
navigate_page("http://localhost:3000/admin/params")
fill("[data-param-key='tauxPS'] input", "17.2")
click("button:contains('Sauvegarder')")
```

---

## Scénario S23 — Alertes dispositifs temporaires

**Objectif :** Vérifier que les paramètres à date d'expiration affichent une bannière d'alerte.

### Règles métier

```
Paramètre avec date d'expiration :
  - date_expiration - aujourd'hui ≤ 90 jours → bannière orange "expire bientôt"
  - date_expiration < aujourd'hui → bannière rouge "dispositif expiré"
  - Pas de date d'expiration → pas de bannière
```

### Sous-test S23-A : Paramètre avec date d'expiration proche (≤ 90j)

```
Précondition : Paramètre "déficit_foncier_majore" avec date_expiration = 2026-03-31
Aujourd'hui = 2026-02-16 → délai = 43 jours (< 90j) → bannière orange

Résultat attendu : ExpirationBanner orange visible sur ce paramètre
```

### Sous-test S23-B : Paramètre expiré

```
Précondition : Paramètre avec date_expiration = 2025-12-31 (passée)
Résultat attendu : bannière rouge "dispositif expiré"
```

### Sous-test S23-C : Paramètre sans expiration

```
Résultat attendu : aucune bannière d'expiration
```

### Étapes Chrome DevTools

```javascript
navigate_page("http://localhost:3000/admin/params")
wait_for("networkidle")

// S23-A : chercher les bannières d'expiration orange
evaluate_script(`
  const banners = document.querySelectorAll('[data-testid="expiration-banner"], .expiration-banner');
  return Array.from(banners).map(b => ({
    texte: b.textContent.trim(),
    classe: b.className,
    type: b.dataset.type || (b.className.includes('orange') ? 'warning' :
          b.className.includes('red') ? 'error' : 'unknown')
  }));
`)
// Assertion : au moins 1 bannière de type 'warning' ou 'error'

// S23-B : vérifier les bannières rouges (expirées)
evaluate_script(`
  return Array.from(document.querySelectorAll('[data-testid="expiration-banner"]'))
    .filter(b => b.className.includes('red') || b.dataset.expired === 'true')
    .map(b => ({ texte: b.textContent.trim(), parametre: b.dataset.paramKey }));
`)

// S23-C : vérifier qu'un paramètre sans expiration n'a pas de bannière
evaluate_script(`
  const paramSansExpiration = document.querySelector('[data-has-expiration="false"]');
  if (!paramSansExpiration) return 'selector-non-trouve';
  const banner = paramSansExpiration.querySelector('[data-testid="expiration-banner"]');
  return banner ? 'FAIL - bannière trouvée' : 'PASS - pas de bannière';
`)
```

---

## Scénario S24 — Mode Dry Run

**Objectif :** Vérifier que le mode Dry Run affiche une prévisualisation avant/après sans sauvegarder en BDD.

### Règles métier

```
Dry Run :
  1. Utilisateur modifie un ou plusieurs paramètres
  2. Clic "Dry Run" → simulation des changements sur N cas de test (N=5 par défaut)
  3. Affichage tableau avant/après pour chaque cas
  4. Paramètres PAS encore sauvegardés en BDD
  5. Bouton "Valider" pour sauvegarder réellement
```

### Sous-test S24-A : Dry Run affiche le tableau avant/après

```
Action :
  1. Modifier tauxPS de 17.2% → 15%
  2. Cliquer "Dry Run"
  3. Attendre le calcul

Résultat attendu :
  - Tableau visible avec 5 cas de simulation
  - Colonne "Avant" et colonne "Après"
  - Valeurs PS dans "Avant" = calculées à 17.2%
  - Valeurs PS dans "Après" = calculées à 15%
```

### Sous-test S24-B : Modification non sauvegardée avant validation

```
Action :
  1. Modifier un paramètre
  2. Clic "Dry Run" → prévisualisation visible
  3. Recharger la page (F5)

Résultat attendu :
  - La valeur en BDD est toujours l'ancienne valeur
  - Le paramètre affiche toujours l'ancienne valeur dans l'interface
```

### Étapes Chrome DevTools

```javascript
navigate_page("http://localhost:3000/admin/params")
wait_for("networkidle")

// S24-A : Modifier un paramètre et lancer Dry Run
fill("[data-param-key='tauxPS'] input", "15")
click("button[data-testid='dry-run-btn'], button:contains('Dry Run')")
wait_for("networkidle")

evaluate_script(`
  const dryRunPanel = document.querySelector('[data-testid="dry-run-results"]');
  if (!dryRunPanel) return 'panel non trouvé';

  const rows = dryRunPanel.querySelectorAll('[data-testid="dry-run-row"], tr');
  return {
    panelVisible: true,
    nombreCas: rows.length,
    colonnes: Array.from(dryRunPanel.querySelectorAll('th')).map(th => th.textContent.trim())
  };
`)
// Assertion : panelVisible = true, nombreCas >= 5, colonnes contient 'Avant' et 'Après'

// Vérifier les valeurs
evaluate_script(`
  const rows = document.querySelectorAll('[data-testid="dry-run-row"]');
  return Array.from(rows).slice(0, 3).map(row => ({
    cas: row.querySelector('[data-col="cas"]')?.textContent,
    avant: row.querySelector('[data-col="avant"]')?.textContent,
    apres: row.querySelector('[data-col="apres"]')?.textContent
  }));
`)
// Assertion : avant ≠ après pour les lignes impactées par le changement de taux

// S24-B : Vérifier non-sauvegarde
evaluate_script(`
  // Intercepter les requêtes PUT avant la validation
  let putMade = false;
  const origFetch = window.fetch;
  window.fetch = (url, opts) => {
    if (opts?.method === 'PUT') putMade = true;
    return origFetch(url, opts);
  };
  window.__putMade = false;
`)
// (après clic Dry Run mais AVANT clic Valider)
evaluate_script(`return window.__putMade`)
// Assertion : false (aucune requête PUT envoyée)

// Valider explicitement
click("button[data-testid='confirm-save'], button:contains('Valider et sauvegarder')")
wait_for("networkidle")
evaluate_script(`return window.__putMade`)
// Assertion : true (PUT envoyé uniquement après validation)
```

---

## Récapitulatif des assertions

| Scénario | Valeur attendue | Sélecteur DOM / Critère |
|----------|----------------|------------------------|
| S19-A — Non connecté → redirection | URL contient 'signin' | `window.location.href` |
| S19-B — User non-admin → 403 | Message d'erreur ou redirection | `[data-testid="error-403"]` |
| S19-C — Admin → page visible | true | `[data-testid="admin-params-page"]` |
| S21 — 8 blocs présents | 8 blocs A-H | `[data-testid^="bloc-config-"]` |
| S21 — Paramètres listés | ≥ 8 rows | `[data-testid="param-row"]` |
| S20-A — GET /api/admin/params | isArray = true, count > 0 | Fetch API |
| S20-B — PUT mise à jour | status = 200 | Fetch API |
| S20-B — Audit log créé | hasLogs = true | `/api/admin/params/audit` |
| S22-A — Calcul avec valeur BDD | 7 500 € (15%) pas 8 600 € | `[data-testid="ps-pv"]` |
| S22-B — Fallback en cas d'erreur | Calcul OK (constants.ts) | Pas d'erreur 500 |
| S23-A — Bannière orange (< 90j) | Bannière warning visible | `[data-testid="expiration-banner"]` |
| S23-B — Bannière rouge (expiré) | Bannière error visible | `[data-testid="expiration-banner"]` |
| S23-C — Sans expiration | Aucune bannière | Absence de bannière |
| S24-A — Dry Run tableau | 5 cas, colonnes Avant/Après | `[data-testid="dry-run-results"]` |
| S24-B — Non-sauvegarde sans validation | PUT = false avant validation | `window.__putMade` |
| S24-B — Sauvegarde après validation | PUT = true après validation | `window.__putMade` |
