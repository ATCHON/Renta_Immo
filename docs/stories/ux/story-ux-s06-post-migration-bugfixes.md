# Story UX-S06 : Corrections post-migration — Navbar, Modale, Sidebar, Partage

> **Priorité** : P1 (bloquant UX)
> **Effort** : M (2–3 jours)
> **Statut** : In Progress
> **Type** : Bug Fix / Feature
> **Epic** : UX Migration — Phase 6 : Stabilisation post-sprint 4
> **Branche** : `fix/post-migration-ui-bugs`
> **Dépendances** : UX-S01 ✅, UX-S02 ✅, UX-S03 ✅, UX-S04 ✅, UX-S05 ✅

---

## 1. User Stories

**Bug 1 (Navbar)**
**En tant qu'**utilisateur connecté
**Je veux** voir mon nom / avatar dans la navbar
**Afin de** savoir que je suis bien authentifié et pouvoir me déconnecter facilement.

**Bug 2 (Modale sauvegarde)**
**En tant qu'**utilisateur consultant ses résultats de simulation
**Je veux** que la modale de sauvegarde apparaisse au centre de l'écran
**Afin de** pouvoir cliquer sur les boutons "Sauvegarder" et "Annuler" sans qu'ils soient bloqués.

**Bug 3 (Sidebar estimations)**
**En tant qu'**utilisateur remplissant le formulaire étape par étape
**Je veux** que la barre latérale affiche des indicateurs **nouveaux et cohérents** à chaque étape
**Afin de** comprendre progressivement l'impact financier de mes saisies sans voir les mêmes chiffres répétés.

**Bug 4 (Partage de simulation)**
**En tant qu'**utilisateur souhaitant partager une simulation
**Je veux** générer un lien public fonctionnel
**Afin de** le partager avec un tiers (consultant, banquier, partenaire) qui pourra consulter les résultats sans créer de compte, et le cloner s'il est lui-même inscrit.

---

## 2. Contexte

Après le déploiement de la migration UX sprint 4 (`VerdantNavbar`, `SimulatorLayout`, `ResultsAnchor`, `DashboardFloatingFooter`), quatre régressions ont été identifiées :

1. L'ancien `Header.tsx` affichait l'utilisateur connecté ; `VerdantNavbar` récupère la session mais n'en fait aucun usage visuel.
2. `DashboardFloatingFooter` utilise `transform: translateX(-50%)` via `-translate-x-1/2`. Cette propriété CSS crée un nouveau _containing block_ pour les éléments `position: fixed` enfants — la `SaveSimulationModal` est donc positionnée relativement au footer, pas au viewport.
3. Les 5 composants `ResultsAnchorStep*.tsx` affichent les mêmes métriques (`rendementBrut`, `cashflowMensuelEstime`) dans plusieurs étapes consécutives, annulant l'effet de progression narrative.
4. Le bouton de partage copie `window.location.href` qui pointe vers `/simulations/[id]` — une route protégée par middleware, inaccessible sans compte.

---

## 3. Critères d'acceptation

### 3.1 Bug 1 — Indicateur utilisateur dans la navbar

- [ ] Lorsque l'utilisateur est connecté, la navbar desktop affiche ses **initiales dans un avatar** (cercle coloré) suivi de son **prénom tronqué** à 15 caractères.
- [ ] Un clic sur cet avatar ouvre un **menu déroulant** avec : nom complet, email, séparateur, bouton « Se déconnecter ».
- [ ] Le bouton « Connexion » disparaît quand l'utilisateur est connecté.
- [ ] Dans le menu mobile, le bas du menu affiche le nom, l'email et un bouton « Se déconnecter ».
- [ ] La déconnexion appelle `authClient.signOut()` et redirige vers `/`.

### 3.2 Bug 2 — Modale de sauvegarde

- [ ] Cliquer sur « Sauvegarder la simulation » dans le footer flottant ouvre la modale **au centre de l'écran** (pas dans la zone footer).
- [ ] Les boutons « Annuler », « Sauvegarder une copie » et « Mettre à jour » sont tous cliquables.
- [ ] La modale se ferme correctement sur backdrop-click et sur Annuler.
- [ ] Comportement inchangé sur mobile.

### 3.3 Bug 3 — Sidebar KPIs cohérents par étape

Chaque étape affiche **uniquement** les indicateurs listés ci-dessous, sans répétition inter-étapes :

| Étape                | KPIs affichés                                                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **1 — Bien**         | Prix au m² (`prix_achat / surface`), Investissement total (frais inclus), Frais notaire estimés (~8%)                               |
| **2 — Financement**  | Mensualité estimée, Part d'apport (%), Coût total du crédit, TAEG approximatif                                                      |
| **3 — Exploitation** | Cash-flow mensuel (couleur rouge/vert), Rendement brut, Ratio loyer/mensualité                                                      |
| **4 — Structure**    | NOI mensuel (revenus nets avant dette), Taux d'effort HCSF simplifié, Rendement net projeté (avec disclaimer)                       |
| **5 — Options**      | Carte de synthèse (Rendement brut + Cash-flow + Investissement total) + mini chart projection + note "Soumettez pour le score complet" |

- [ ] Aucune métrique n'apparaît dans deux étapes différentes sauf en étape 5 (synthèse explicite).
- [ ] Si une valeur requise n'est pas encore saisie, le KPI affiche `—` (tiret).
- [ ] Le prix au m² à l'étape 1 affiche `—` si `surface` est absent ou nul.

### 3.4 Bug 4 — Partage de simulation

- [ ] L'icône du bouton de partage est visible.
- [ ] Cliquer le bouton partage ouvre un **dialog** (pas d'action immédiate).
- [ ] Dans le dialog : bouton « Générer le lien de partage » appelle `POST /api/simulations/[id]/share`.
- [ ] L'URL générée est de la forme `https://[domaine]/share/[token]` — copiable en un clic.
- [ ] Le lien `/share/[token]` est accessible **sans authentification** (navigation privée).
- [ ] La page `/share/[token]` affiche les résultats de simulation en lecture seule.
- [ ] Un utilisateur **non connecté** voit une bannière « Créez un compte pour sauvegarder cette simulation ».
- [ ] Un utilisateur **connecté** voit un bouton « Cloner cette simulation » qui la duplique dans ses simulations.
- [ ] Un token révoqué ou invalide retourne une page d'erreur 404 explicite.

---

## 4. Analyse technique

### 4.1 Bug 2 — Cause racine : CSS `transform` et `position: fixed`

```
DashboardFloatingFooter   →  transform: translateX(-50%)   ← crée un containing block
  └─ SaveSimulationButton
       └─ SaveSimulationModal   →  position: fixed inset-0   ← positionné DANS le footer
```

**Fix** : `createPortal(content, document.body)` dans `SaveSimulationModal.tsx`.

### 4.2 Bug 3 — Métriques disponibles par étape

Le hook `usePreviewKPIs` calcule tous les KPIs depuis `bien + financement + exploitation`. Les métriques ne sont significatives qu'à partir de l'étape où leurs données source sont saisies :

| Métrique                        | Dépend de                           | Significatif dès |
| ------------------------------- | ----------------------------------- | ---------------- |
| `investissementTotal`           | `bien.prix_achat`                   | Étape 1          |
| `mensualiteEstimee`             | `financement.*`                     | Étape 2          |
| `coutTotalCredit`, `taegApprox` | `financement.*`                     | Étape 2          |
| `rendementBrut`                 | `bien + exploitation`               | Étape 3          |
| `cashflowMensuelEstime`         | `bien + financement + exploitation` | Étape 3          |

L'étape 1 nécessite un accès direct au store (`bien.prix_achat`, `bien.surface`) via `useCalculateurStore` car `prix_au_m2` et `fraisNotaire` ne sont pas dans `PreviewKPIs`.

### 4.3 Bug 4 — Architecture partage

```
POST /api/simulations/[id]/share   →  génère share_token (UUID)  [auth requise]
GET  /api/share/[token]            →  retourne simulation publique [no auth]
GET  /share/[token]                →  page publique read-only      [no auth]
POST /api/simulations              →  clone (utilisateur connecté) [auth requise]
```

Migration DB requise (2 nouvelles colonnes sur `simulations`) :

```sql
share_token UUID UNIQUE DEFAULT NULL
is_shared   BOOLEAN NOT NULL DEFAULT FALSE
```

---

## 5. Fichiers impactés

### Bug 1

- `src/components/layout/VerdantNavbar.tsx`

### Bug 2

- `src/components/simulations/SaveSimulationModal.tsx`

### Bug 3

- `src/components/layout/ResultsAnchorStep1.tsx`
- `src/components/layout/ResultsAnchorStep2.tsx`
- `src/components/layout/ResultsAnchorStep3.tsx`
- `src/components/layout/ResultsAnchorStep4.tsx`
- `src/components/layout/ResultsAnchorStep5.tsx`

### Bug 4

- `supabase/migrations/20260415_add_simulation_share_token.sql` _(nouveau)_
- `src/app/api/simulations/[id]/share/route.ts` _(nouveau)_
- `src/app/api/share/[token]/route.ts` _(nouveau)_
- `src/app/share/[token]/page.tsx` _(nouveau)_
- `src/components/results/DashboardFloatingFooter.tsx`
- `src/hooks/useSimulationMutations.ts`

---

## 6. Tests

| Fichier test                                                        | Scénarios couverts                                                                 |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/components/simulations/__tests__/SaveSimulationModal.test.tsx` | Modal rendue dans `document.body` (portal), fermeture backdrop, boutons cliquables |
| `src/components/layout/__tests__/VerdantNavbar.test.tsx`            | Avatar affiché quand session active, menu déroulant, déconnexion                   |
| `src/app/api/share/[token]/__tests__/route.test.ts`                 | Accès public OK, token invalide → 404, is_shared=false → 404                       |
| `src/app/api/simulations/[id]/share/__tests__/route.test.ts`        | Génération token (auth requise), révocation, accès non-owner → 403                 |

---

## 7. Ordre d'implémentation

1. **Bug 2** — `createPortal` dans `SaveSimulationModal` (isolé, faible risque, impact UX immédiat)
2. **Bug 1** — Indicateur utilisateur dans `VerdantNavbar` (fichier unique)
3. **Bug 3** — Refonte sidebar KPIs (5 fichiers, logique pure front, sans DB)
4. **Bug 4** — Fonctionnalité de partage complète (migration DB + APIs + page)

---

## 8. Notes

- Les tokens de partage ne sont pas mis en cache côté client — chaque génération vérifie l'ownership en DB.
- La page `/share/[token]` utilise `fetch` côté serveur (RSC) pour le premier rendu (SEO/prévisualisation), puis l'action de clone est client-side.
- Le middleware actuel (`matcher: ['/simulations', '/simulations/:path*', '/auth/:path*']`) ne couvre pas `/share/` — aucune modification nécessaire pour autoriser l'accès public.
