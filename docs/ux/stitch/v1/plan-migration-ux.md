# Plan de Migration UX — Nordic Minimalist "Verdant Simulator"

## 1. Contexte & Objectif

Migrer l'interface utilisateur de Renta_Immo vers le nouveau design system **"Verdant Simulator"** (Nordic Minimalist), défini par 14 maquettes Stitch et deux documents de référence ([DESIGN.md](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/DESIGN.md), [handoff_technique.md](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/handoff_technique.md)).

### Principes directeurs

- **Zéro régression de calculs** : Le moteur de calcul et les données affichées sont sacro-saints
- **Priorité aux données réelles** vs données fictives des maquettes
- **Préservation intégrale du contenu** de la page "Comment ça marche" (13 sections, 2093 lignes)
- **Interface en français** malgré les maquettes en anglais
- **Approche incrémentale** : chaque phase est livrée et testable de manière indépendante

---

## 2. Cartographie Maquettes ↔ Application Actuelle

| Maquette                                                                                                                                                      | Écran                                    | Page actuelle                               | Statut       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ------------------------------------------- | ------------ |
| [landing_page_accueil_premium](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/landing_page_accueil_premium/screen.png)                 | Accueil Premium                          | `src/app/page.tsx`                          | 🔄 Refonte   |
| [simulateur_immobilier_unifi](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/simulateur_immobilier_unifi/screen.png)                   | Step 1 — Bien                            | `src/components/forms/StepBien.tsx`         | 🔄 Refonte   |
| [tape_2_financement_1](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tape_2_financement_1/screen.png)                                 | Step 2 — Financement                     | `src/components/forms/StepFinancement.tsx`  | 🔄 Refonte   |
| [tape_3_revenus_locatifs](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tape_3_revenus_locatifs/screen.png)                           | Step 3 — Revenus                         | `src/components/forms/StepExploitation.tsx` | 🔄 Refonte   |
| [tape_4_charges_annuelles](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tape_4_charges_annuelles/screen.png)                         | Step 4 — Charges                         | `src/components/forms/StepAssocies.tsx`     | 🔄 Refonte   |
| [tape_5_fiscalit](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tape_5_fiscalit/screen.png)                                           | Step 5 — Fiscalité                       | `src/components/forms/StepStructure.tsx`    | 🔄 Refonte   |
| [tableau_de_bord_de_r_sultats_complet](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tableau_de_bord_de_r_sultats_complet/screen.png) | Dashboard résultats                      | `src/app/calculateur/resultats/page.tsx`    | 🔄 Refonte   |
| [20_year_financial_projections](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/20_year_financial_projections/screen.png)               | Projections 20 ans                       | Intégré dans résultats                      | 🔄 Refonte   |
| [comment_a_marche](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche/screen.png)                                         | Comment ça marche — Vue principale       | `src/app/en-savoir-plus/page.tsx`           | 🔄 Refonte   |
| [comment_a_marche_scoring_rendement](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_scoring_rendement/screen.png)     | Comment ça marche — Scoring & Rendement  | Fait partie de `en-savoir-plus`             | ⚠️ Sous-page |
| [comment_a_marche_financement_levier](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_financement_levier/screen.png)   | Comment ça marche — Financement & Levier | Fait partie de `en-savoir-plus`             | ⚠️ Sous-page |
| [comment_a_marche_fiscalit_normes](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_fiscalit_normes/screen.png)         | Comment ça marche — Fiscalité & Normes   | Fait partie de `en-savoir-plus`             | ⚠️ Sous-page |
| [comment_a_marche_projections_dpe](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_projections_dpe/screen.png)         | Comment ça marche — Projections & DPE    | Fait partie de `en-savoir-plus`             | ⚠️ Sous-page |
| [market_data_analysis](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/market_data_analysis/screen.png)                                 | Données de marché                        | ❌ N'existe pas                             | 🆕 V2        |
| [property_specifications](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/property_specifications/screen.png)                           | Fiche bien détaillée                     | ❌ N'existe pas                             | 🆕 V2        |

### Sources HTML des maquettes

> [!TIP]
> Chaque maquette dispose d'un fichier `code.html` contenant le **code source Tailwind complet** : configuration des tokens de couleurs (Material Design 3, 32+ couleurs sémantiques), imports Google Fonts (Manrope, Inter, Material Symbols), classes CSS exactes, et structure HTML pixel-perfect. Ces fichiers sont une **référence directe pour le développement** — le dev peut extraire les classes Tailwind, les patterns de composants et les tokens sans interprétation.

| Maquette                | Source HTML                                                                                                                       | Lignes | Contenu clé                                                               |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------- |
| Landing Page            | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/landing_page_accueil_premium/code.html)         | 281    | Navbar, Hero split, Bento features, Testimonials, CTA, Footer             |
| Simulateur Step 1       | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/simulateur_immobilier_unifi/code.html)          | 300    | **Layout split-screen complet**, Results Anchor sidebar, accordéons steps |
| Step 2 Financement (v1) | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tape_2_financement_1/code.html)                 | —      | Inputs financement, slider durée, Pro Tip                                 |
| Step 2 Financement (v2) | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tape_2_financement_2/code.html)                 | —      | _Variante alternative du step financement_                                |
| Step 3 Revenus          | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tape_3_revenus_locatifs/code.html)              | —      | Loyer, taux occupation, vacancy reserve                                   |
| Step 4 Charges          | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tape_4_charges_annuelles/code.html)             | —      | Toggle fixe/%, stepper horizontal connecté                                |
| Step 5 Fiscalité        | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tape_5_fiscalit/code.html)                      | —      | Cartes visuelles régimes fiscaux, Tax Impact                              |
| Dashboard Résultats     | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tableau_de_bord_de_r_sultats_complet/code.html) | —      | Score panel, KPI cards, charts, sidebar nav                               |
| Projections 20 ans      | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/20_year_financial_projections/code.html)        | —      | Year-by-year table, Wealth Evolution chart                                |
| Comment ça marche (hub) | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche/code.html)                     | —      | Page hub, navigation catégories                                           |
| Scoring & Rendement     | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_scoring_rendement/code.html)   | —      | Score breakdown, yield formulas                                           |
| Financement & Levier    | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_financement_levier/code.html)  | —      | PMT formula, leverage logic                                               |
| Fiscalité & Normes      | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_fiscalit_normes/code.html)     | —      | Tax regime cards, HCSF indicators                                         |
| Projections & DPE       | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_projections_dpe/code.html)     | —      | Projection charts, DPE scale                                              |
| Market Data             | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/market_data_analysis/code.html)                 | —      | _V2 — Référence uniquement_                                               |
| Property Specs          | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/property_specifications/code.html)              | —      | _V2 — Référence uniquement_                                               |

### Extraction des tokens Tailwind depuis les HTML

Tous les `code.html` embarquent la **même configuration Tailwind** dans un `<script id="tailwind-config">`. Les tokens clés à extraire pour la Phase 0 :

```js
// Couleurs Material Design 3 (extrait de code.html)
"primary": "#012d1d",
"primary-container": "#1b4332",
"secondary-fixed": "#d6e6dd",  // Sage wash
"surface": "#f9f9f8",
"on-surface": "#191c1c",
"outline-variant": "#c1c8c2",
"error": "#ba1a1a",
// + 25 autres tokens sémantiques
```

```js
// Polices
fontFamily: { "headline": ["Manrope"], "body": ["Inter"], "label": ["Inter"] }
```

---

## 3. Analyse Critique des Maquettes

### ✅ Points forts à adopter

- **Split-screen layout** : La sidebar fixe "Results Anchor" avec les KPIs live est un game-changer UX — remplacement du formulaire pleine largeur actuel
- **Design tokens cohérents** : Palette emerald/sage + Manrope/Inter = identité premium
- **Règle du "No-Line"** : Séparation par tonalité au lieu de bordures — plus élégant
- **Sélecteur de régime fiscal en cartes visuelles** (Step 5) : Bien plus clair que notre dropdown actuel
- **Stepper horizontal connecté** (Step 4) : Meilleure progression visuelle
- **Glassmorphism** sur les résumés flottants : Premium feel

### ⚠️ Points d'attention critiques

#### 3.1 — Page "Comment ça marche" : Contenu manquant dans les maquettes

> [!CAUTION]
> Les 4 sous-écrans de "Comment ça marche" couvrent seulement ~40% du contenu actuellement sur notre page `en-savoir-plus`. Les sections **manquantes dans les maquettes** :
>
> - **Cash-flow** (3 niveaux : brut, net, net-net) avec formules
> - **Effort d'épargne** (concept et formule)
> - **Assurance emprunteur CRD** (capital initial vs CRD, impact sur TRI)
> - **Déficit foncier** (mécanisme complet, les deux composantes)
> - **Amortissement LMNP/SCI** (tableaux, durées, composants)
> - **Plus-value** (nom propre vs SCI IS, abattements par durée)
> - **Profils Investisseur** (Rentier vs Patrimonial, pondérations du scoring)

**Recommandation Sally** : Ne PAS supprimer ces sections. Les intégrer dans l'architecture de sous-pages proposée par les maquettes. Je recommande de créer des sous-pages additionnelles pour combler les manques tout en respectant la nouvelle hiérarchie visuelle.

#### 3.2 — Données fictives vs Données réelles

Les maquettes utilisent des données fictives qui ne correspondent pas à notre moteur de calcul :

- `Performance Score 100/100` → Notre score est sur 100, OK, mais avec un algorithme profilé
- `30.00%` comme rendement mis en avant → Valeur irréaliste, utiliser notre rendement brut réel
- `$4,820,500 Projected NPV` → Nous n'avons pas de calcul NPV actuellement
- `Market Intelligence` avec carte et ventes comparables → Fonctionnalité inexistante côté backend
- Devises en `$` → Tout doit rester en `€`
- `TAEG` affiché dans les maquettes financement → Notre moteur le calcule déjà ✅

#### 3.3 — Pages nouvelles (V2 aspirationnelles)

> [!IMPORTANT]
> Les maquettes **market_data_analysis** et **property_specifications** représentent des fonctionnalités V2 qui nécessitent du développement backend (API immobilière, données DVF, cartographie). Elles sont **exclues de ce plan de migration UI** mais documentées pour l'architecte.

#### 3.4 — Mapping des Steps formulaire

| Maquette Step         | Notre Step actuel        | Différences clés                                                                                                                                                   |
| --------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Step 1: Property Info | `StepBien`               | Maquette unifie bien + frais acquisition. Notre `StepBien` sépare ça. **À adapter visuellement** sans perdre les champs                                            |
| Step 2: Financing     | `StepFinancement`        | Maquette ajoute slider pour durée de prêt. Notre formulaire utilise un input numérique. Maquette montre "Pro Tip" = concept nouveau                                |
| Step 3: Revenue       | `StepExploitation`       | Maquette simplifie en loyer + taux d'occupation. Notre step a plus de champs (gestion, vacance, provision travaux) → **ne pas perdre ces champs**                  |
| Step 4: Charges       | `StepAssocies` (charges) | Maquette montre toggle fixe/pourcentage. Notre form a déjà une logique similaire                                                                                   |
| Step 5: Fiscalité     | `StepStructure`          | Maquette propose des cartes visuelles pour 3 régimes (LMNP, Foncier, SCI IS). Notre step contient 6 régimes + options (CRD, etc.) → **préserver tous les régimes** |

---

## 4. Notes pour l'Architecte Backend

> [!IMPORTANT]
> Les éléments ci-dessous nécessitent des ajustements côté données/API pour être compatibles avec les nouvelles maquettes.

### 4.1 — Données existantes à exposer différemment

| Donnée                       | État actuel                      | Besoin maquette                                   | Action requise                                                                         |
| ---------------------------- | -------------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------- |
| **TAEG**                     | Calculé mais non exposé au front | Affiché dans sidebar financement                  | Exposer dans `SimulationResult`                                                        |
| **Coût total du crédit**     | Calculé dans amortissement       | Affiché comme KPI dans sidebar                    | Ajouter comme champ dédié dans la réponse API                                          |
| **Effort d'épargne mensuel** | Calculé côté front               | Devrait être un KPI structuré                     | Déjà disponible via Cash-flow net-net négatif                                          |
| **Capacité d'endettement**   | HCSF le calcule                  | Affiché en % dans sidebar financement             | Exposer le taux exact dans `hcsfResult`                                                |
| **Cash-flow growth chart**   | Données de projection 20 ans     | Maquette montre un mini bar chart dans la sidebar | Les données existent dans `projectionTable`, les formatter en série pour un mini chart |

### 4.2 — Structure de la sidebar "Results Anchor"

La sidebar affiche des KPIs dynamiques qui changent selon le step actif :

| Step                 | KPIs sidebar                                                                     |
| -------------------- | -------------------------------------------------------------------------------- |
| Step 1 (Bien)        | Rendement temps réel, Mensualité estimée, Investissement total, Cash-flow growth |
| Step 2 (Financement) | Mensualité estimée, Coût total crédit, TAEG                                      |
| Step 3 (Revenus)     | Cash-flow mensuel, chart mini                                                    |
| Step 4 (Charges)     | Rendement net projeté, NOI mensuel                                               |
| Step 5 (Fiscalité)   | Projection actuelle, Rendement net-net                                           |

**Action architecte** : S'assurer que le calcul intermédiaire (partiel) est possible à chaque step pour alimenter la sidebar en temps réel. Actuellement, le calcul n'est déclenché qu'à la soumission complète.

### 4.3 — Fonctionnalités V2 (hors scope migration UI)

Ces maquettes nécessitent du développement backend significatif :

1. **Market Data Analysis** (`market_data_analysis`) :
   - API données DVF (Demandes de Valeurs Foncières)
   - Cartographie avec indices de demande
   - Ventes comparables par secteur
   - Prix au m² historique sur 36 mois

2. **Property Specifications** (`property_specifications`) :
   - Galerie photos du bien
   - Fiche détaillée avec DPE, année de construction
   - Comparaison prix marché
   - Donut chart décomposition coûts d'acquisition

3. **"Save Draft" / "Save Simulation"** : Boutons présents dans les maquettes, nécessitent une persistance côté serveur (déjà partiellement implémenté via `simulations/[id]`)

4. **"Download Report" / "Download PDF"** : Déjà implémenté (`DownloadPdfButton.tsx`) ✅

### 4.4 — Structure de navigation

Les maquettes proposent une navigation post-résultats avec des onglets :

- **Analysis** (tableau de bord résultats)
- **Market Data** (V2)
- **Properties** (V2)
- **Projections** (projection 20 ans)

**Recommandation** : Implémenter Analysis + Projections dès la Phase 3, garder Market Data et Properties comme stubs "Coming Soon" pour le MVP.

---

## 5. Plan de Migration par Phases

### Phase 0 — Fondations Design System _(Branche : `feature/verdant-design-tokens`)_

**Objectif** : Mettre en place les nouveaux design tokens sans casser l'existant.

> Référence : [DESIGN.md](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/DESIGN.md), [handoff_technique.md](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/handoff_technique.md)
> Source HTML de référence : **Tous les `code.html`** (la config Tailwind `<script id="tailwind-config">` est identique dans chaque fichier — extraire les tokens depuis n'importe lequel)

#### Fichiers impactés

- **[MODIFY]** [globals.css](file:///D:/Devs/Renta_Immo/src/app/globals.css)
  - Migrer les couleurs : `--color-forest: #2D5A45` → `--color-primary: #012D1D`, `--color-primary-container: #1B4332`
  - Ajouter `--color-secondary-fixed: #D6E6DD` (sage wash)
  - Ajouter `--color-surface: #F9F9F8`, `--color-surface-container-lowest: #FFFFFF`
  - Ajouter `--color-on-surface: #191C1C`, `--color-outline-variant: #C1C8C2`
  - Ajouter la police **Manrope** (`--font-display: 'Manrope'`)
  - Ajouter les tokens de border-radius : `--radius-xl: 1.5rem`, `--radius-full: 9999px`
  - Ajouter la shadow ambiante emerald : `--shadow-ambient: 0 20px 40px rgba(27, 67, 50, 0.06)`
  - Refondre les classes `.btn-primary` (pill-shaped, gradient), `.input-field` (blocs larges, radius 16px)
  - Ajouter les classes glassmorphism

- **[NEW]** `src/styles/verdant-tokens.ts` — Export TypeScript des tokens pour usage dans les composants (ex: couleurs Recharts)

- **[MODIFY]** [layout.tsx](file:///D:/Devs/Renta_Immo/src/app/layout.tsx) — Ajouter Google Fonts Manrope + Material Symbols

#### Stratégie de migration douce

Préfixer les nouveaux tokens par `verdant-` pendant la coexistence. Les anciens tokens (`forest`, `sage`, `sand`) restent fonctionnels, permettant une migration composant par composant.

---

### Phase 1 — Landing Page _(Branche : `feature/verdant-landing-page`)_

**Objectif** : Première impression — la page d'accueil est la vitrine.

> Référence : [landing_page_accueil_premium](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/landing_page_accueil_premium/screen.png)
> Source HTML : [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/landing_page_accueil_premium/code.html) — Contient : Navbar glassmorphism, Hero split grid 12 colonnes, Bento features (3 cartes), Testimonials, CTA pill + blur decoratif, Footer sage

#### Fichiers impactés

- **[MODIFY]** [page.tsx](file:///D:/Devs/Renta_Immo/src/app/page.tsx) (refonte complète)
  - Hero section avec split layout : slogan à gauche + image résidentielle avec overlay KPI à droite
  - Section "Engineered for Alpha" → en français : "Conçu pour la Performance" avec 3 cartes features (Real-time yield mapping, Tax optimization, Wealth projections)
  - Section testimonials (adaptée en français, données fictives autorisées pour social proof)
  - CTA final "Prêt à définir votre patrimoine ?" avec bouton pill
  - Navbar : `Simulateur | Patrimoine | Processus | Contact` (adapter les liens existants)
  - Footer : Liens légaux (Mentions Légales, Confidentialité, Aide)

#### Adaptation français

| Maquette (EN)                                    | Notre version (FR)                            |
| ------------------------------------------------ | --------------------------------------------- |
| "The power of Excel, the simplicity of the web." | "La puissance d'Excel, la simplicité du web." |
| "Start Simulation →"                             | "Lancer la simulation →"                      |
| "View Demo"                                      | "Voir un exemple"                             |
| "Get Started Now"                                | "Commencer maintenant"                        |
| "Engineered for Alpha"                           | "Conçu pour la Performance"                   |
| "Real-time yield mapping"                        | "Cartographie des rendements en temps réel"   |
| "Tax optimization"                               | "Optimisation fiscale"                        |
| "Wealth projections"                             | "Projections patrimoniales"                   |

---

### Phase 2 — Simulateur : Layout Split-Screen + Formulaire _(Branche : `feature/verdant-simulator`)_

**Objectif** : Le cœur de l'application — refonte complète du layout formulaire.

> Références visuelles & sources HTML :
>
> - Step 1 : [screen.png](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/simulateur_immobilier_unifi/screen.png) | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/simulateur_immobilier_unifi/code.html) — **Le plus important** : contient le layout split-screen complet (sidebar Results Anchor + formulaire scrollable)
> - Step 2 : [screen.png](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tape_2_financement_1/screen.png) | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tape_2_financement_1/code.html) + [variante v2](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tape_2_financement_2/code.html)
> - Step 3 : [screen.png](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tape_3_revenus_locatifs/screen.png) | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tape_3_revenus_locatifs/code.html)
> - Step 4 : [screen.png](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tape_4_charges_annuelles/screen.png) | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tape_4_charges_annuelles/code.html)
> - Step 5 : [screen.png](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tape_5_fiscalit/screen.png) | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tape_5_fiscalit/code.html)

#### Changement structurel majeur : Layout Split-Screen

```
┌───────────────────────────────────┐
│  Navbar (Simulateur | Processus)  │
├──────────┬────────────────────────┤
│          │                        │
│ RESULTS  │   FORM CONTENT         │
│ ANCHOR   │   (scrollable)         │
│ (sticky) │                        │
│          │   ┌─────────────────┐  │
│ • Yield  │   │ Step N Content  │  │
│ • Cashflow │ │ (accordion)     │  │
│ • Chart  │   └─────────────────┘  │
│          │                        │
│ [Download]│                       │
└──────────┴────────────────────────┘
```

#### Fichiers impactés

- **[NEW]** `src/components/layout/SimulatorLayout.tsx` — Layout split-screen avec sidebar sticky
- **[NEW]** `src/components/layout/ResultsAnchor.tsx` — Sidebar KPIs dynamiques
- **[MODIFY]** [FormWizard.tsx](file:///D:/Devs/Renta_Immo/src/components/forms/FormWizard.tsx) — Intégrer dans le nouveau layout, remplacer le stepper vertical par le stepper horizontal connecté
- **[MODIFY]** [ProgressStepper.tsx](file:///D:/Devs/Renta_Immo/src/components/forms/ProgressStepper.tsx) — Design stepper horizontal avec cercles + lignes connectées
- **[MODIFY]** [StepBien.tsx](file:///D:/Devs/Renta_Immo/src/components/forms/StepBien.tsx) — Inputs larges (blocs soft), sélecteur type de bien en cartes avec icônes, section "Acquisition Costs" en accordéon
- **[MODIFY]** [StepFinancement.tsx](file:///D:/Devs/Renta_Immo/src/components/forms/StepFinancement.tsx) — Slider pour durée de prêt, hint "Recommended 20%", Pro Tip encadré
- **[MODIFY]** [StepExploitation.tsx](file:///D:/Devs/Renta_Immo/src/components/forms/StepExploitation.tsx) — Loyer + taux d'occupation en style large, encadré "Vacancy Reserve Logic"
- **[MODIFY]** [StepAssocies.tsx](file:///D:/Devs/Renta_Immo/src/components/forms/StepAssocies.tsx) — Toggle fixed/percentage pour taxe foncière + assurance, Management Fees avec pourcentage
- **[MODIFY]** [StepStructure.tsx](file:///D:/Devs/Renta_Immo/src/components/forms/StepStructure.tsx) — Cartes visuelles régime fiscal (LMNP, Revenus Fonciers, SCI IS), section "Tax Impact Simulation"

> [!IMPORTANT]
> **Préservation obligatoire** : Tous les champs de formulaire actuels doivent rester présents. Les champs non visibles dans les maquettes seront placés dans des sections accordéon "Options avancées" pour ne pas régresser la qualité des entrées.

#### Points critiques Step 5 — Fiscalité

Les maquettes montrent 3 régimes (LMNP, Foncier, SCI IS). Notre application en gère **6** :

1. Micro-foncier
2. Foncier réel
3. LMNP Micro-BIC
4. LMNP Réel
5. SCI à l'IS (capitalisation)
6. SCI à l'IS (distribution)

**Recommandation** : Garder l'UI en 3 "familles" de cartes comme les maquettes, puis chaque carte s'expande pour montrer les sous-régimes (ex: LMNP → Micro-BIC | Réel).

---

### Phase 3 — Dashboard Résultats & Projections _(Branche : `feature/verdant-results`)_

**Objectif** : Refonte du tableau de bord des résultats.

> Références visuelles & sources HTML :
>
> - Dashboard : [screen.png](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tableau_de_bord_de_r_sultats_complet/screen.png) | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/tableau_de_bord_de_r_sultats_complet/code.html) — Score panel, KPI cards, sidebar navigation, charts
> - Projections : [screen.png](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/20_year_financial_projections/screen.png) | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/20_year_financial_projections/code.html) — Year-by-year table, Wealth Evolution chart

#### Nouveau layout résultats

La maquette propose un dashboard avec navigation latérale et onglets supérieurs (Analysis, Market Data, Properties, Projections).

#### Fichiers impactés

- **[MODIFY]** [Dashboard.tsx](file:///D:/Devs/Renta_Immo/src/components/results/Dashboard.tsx) — Refonte layout avec sidebar navigation (Overview, Performance, Projections, Taxation, Credit)
- **[MODIFY]** [ScorePanel.tsx](file:///D:/Devs/Renta_Immo/src/components/results/ScorePanel.tsx) — Score circulaire grand format avec badge "EXCELLENT"
- **[MODIFY]** [MetricCard.tsx](file:///D:/Devs/Renta_Immo/src/components/results/MetricCard.tsx) — Style tonal (fond sage/blanc, pas de bordures)
- **[MODIFY]** [CashflowChart.tsx](file:///D:/Devs/Renta_Immo/src/components/results/CashflowChart.tsx) — Bar chart avec couleurs emerald, style éditorial
- **[MODIFY]** [PatrimoineChart.tsx](file:///D:/Devs/Renta_Immo/src/components/results/PatrimoineChart.tsx) — Line chart avec gradient fill (Primary → Transparent)
- **[MODIFY]** [FiscalComparator.tsx](file:///D:/Devs/Renta_Immo/src/components/results/FiscalComparator.tsx) — Liste verticale avec badge "RECOMMENDED" au lieu du tableau actuel
- **[MODIFY]** [AmortizationTable.tsx](file:///D:/Devs/Renta_Immo/src/components/results/AmortizationTable.tsx) — Style accordéon, "View Full 20-Year Schedule" comme lien
- **[MODIFY]** [ProjectionTable.tsx](file:///D:/Devs/Renta_Immo/src/components/results/ProjectionTable.tsx) — Year-by-Year Breakdown avec toggle Annual/Quarterly, KPIs charts juxtaposés
- **[MODIFY]** [DownloadPdfButton.tsx](file:///D:/Devs/Renta_Immo/src/components/results/DownloadPdfButton.tsx) — Bouton pill emerald + bouton "Save Draft" secondaire

#### Onglets de navigation post-résultats

| Onglet         | Contenu                                                                            | État             |
| -------------- | ---------------------------------------------------------------------------------- | ---------------- |
| Analyse        | Dashboard complet (KPIs, score, charts, cash-flow, fiscal comparator)              | ✅ À implémenter |
| Projections    | Projection 20 ans (Wealth Evolution, Cumulative Cash-Flow, Year-by-Year Breakdown) | ✅ À implémenter |
| Données marché | Coming Soon placeholder                                                            | 🔒 V2            |
| Propriétés     | Coming Soon placeholder                                                            | 🔒 V2            |

---

### Phase 4 — Page "Comment ça marche" _(Branche : `feature/verdant-how-it-works`)_

**Objectif** : Restructurer en sous-pages tout en **PRÉSERVANT 100% du contenu**.

> [!CAUTION]
> C'est la phase la plus critique en termes de conservation d'information. Les maquettes ne couvrent que 4 sous-thèmes. Notre page actuelle en couvre 13. **Aucune section ne doit être supprimée.**

> Références visuelles & sources HTML :
>
> - Hub : [screen.png](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche/screen.png) | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche/code.html) — Layout hub, navigation catégories
> - Scoring : [screen.png](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_scoring_rendement/screen.png) | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_scoring_rendement/code.html)
> - Financement : [screen.png](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_financement_levier/screen.png) | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_financement_levier/code.html)
> - Fiscalité : [screen.png](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_fiscalit_normes/screen.png) | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_fiscalit_normes/code.html)
> - Projections : [screen.png](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_projections_dpe/screen.png) | [code.html](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_projections_dpe/code.html)

#### Architecture proposée

Passer de 1 page monolithique (2093 lignes) à 5 sous-pages thématiques :

| Sous-page                               | Sections incluses                                                      | Référence maquette                                                                                                                                          |
| --------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/comment-ca-marche`                    | Vue hub — Pipeline, liens vers sous-pages                              | [comment_a_marche](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche/screen.png)                                       |
| `/comment-ca-marche/scoring-rendement`  | Rentabilité (brute, nette, nette-nette), Scoring, Profils investisseur | [comment_a_marche_scoring_rendement](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_scoring_rendement/screen.png)   |
| `/comment-ca-marche/financement-levier` | Crédit (PMT), Assurance CRD, Cash-flow (3 niveaux), Effort d'épargne   | [comment_a_marche_financement_levier](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_financement_levier/screen.png) |
| `/comment-ca-marche/fiscalite-normes`   | 6 régimes fiscaux, Déficit foncier, Amortissement, HCSF                | [comment_a_marche_fiscalit_normes](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_fiscalit_normes/screen.png)       |
| `/comment-ca-marche/projections-dpe`    | Plus-value, Projections 20 ans, DPE                                    | [comment_a_marche_projections_dpe](file:///D:/Devs/Renta_Immo/docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_projections_dpe/screen.png)       |

#### Fichiers impactés

- **[MODIFY]** [page.tsx](file:///D:/Devs/Renta_Immo/src/app/en-savoir-plus/page.tsx) — Transformer en page hub avec navigation latérale par catégorie + les liens vers les sous-pages
- **[NEW]** `src/app/comment-ca-marche/page.tsx` — Nouveau hub (redirect depuis `/en-savoir-plus` pour rétro-compat)
- **[NEW]** `src/app/comment-ca-marche/layout.tsx` — Layout avec sidebar Property/Finance/Tax/Projection
- **[NEW]** `src/app/comment-ca-marche/scoring-rendement/page.tsx`
- **[NEW]** `src/app/comment-ca-marche/financement-levier/page.tsx`
- **[NEW]** `src/app/comment-ca-marche/projections-dpe/page.tsx`
- **[NEW]** `src/app/comment-ca-marche/fiscalite-normes/page.tsx`

#### Contenu qui MANQUE dans les maquettes mais DOIT être dans les sous-pages

| Section actuelle               | Sous-page cible       | Notes                              |
| ------------------------------ | --------------------- | ---------------------------------- |
| Cash-flow (brut, net, net-net) | `/financement-levier` | 3 formules + ExpertTips            |
| Effort d'épargne               | `/financement-levier` | Formule + contexte stratégique     |
| Assurance CRD                  | `/financement-levier` | Capital initial vs CRD, impact TRI |
| Déficit foncier                | `/fiscalite-normes`   | Mécanisme complet, 2 composantes   |
| Amortissement LMNP             | `/fiscalite-normes`   | Tableau, durées, composants        |
| Plus-value                     | `/projections-dpe`    | Nom propre vs SCI IS, abattements  |
| Profils Investisseur           | `/scoring-rendement`  | Rentier vs Patrimonial             |
| HCSF détaillé                  | `/fiscalite-normes`   | Seuils 2025, reste à vivre         |

---

### Phase 5 — Navbar, Footer & Navigation Globale _(Branche : `feature/verdant-navigation`)_

**Objectif** : Unifier la navigation à travers toute l'application.

#### Fichiers impactés

- **[MODIFY]** [layout.tsx](file:///D:/Devs/Renta_Immo/src/app/layout.tsx) — Nouvelle navbar verdant (logo "Verdant Simulator" ou "RentaImmo" selon le choix), liens mis à jour
- **[NEW]** `src/components/layout/VerdantNavbar.tsx` — Navbar avec items : Simulateur, Comment ça marche, Login/Sign In, bouton CTA "New Calc"
- **[NEW]** `src/components/layout/VerdantFooter.tsx` — Footer avec liens légaux, copyright

---

## 6. Éléments Structurants Transversaux pour l'Architecte

### 6.1 — Calcul partiel en temps réel (Results Anchor)

Le design split-screen implique que les KPIs soient recalculés à **chaque changement de champ**. Actuellement, le calcul ne se fait qu'à la soumission.

**Options** :

1. **Calcul côté client** (recommandé pour MVP) : Dupliquer les formules simples (rendement brut, mensualité PMT) côté frontend pour la sidebar. Garder le calcul complet serveur pour les résultats finaux.
2. **Calcul serveur en streaming** (V2) : API WebSocket ou Server-Sent Events pour calcul temps réel.

### 6.2 — Polices & Performance

L'ajout de Manrope (display) en plus d'Inter (body) ajoute ~50-80 Ko. Utiliser `font-display: swap` et préchargement via `next/font`.

### 6.3 — Bibliothèque d'icônes

Les maquettes utilisent **Google Material Symbols (Outlined, weight 300-400)**. L'application utilise actuellement **Lucide React**.

**Recommandation** : Migrer vers Material Symbols progressivement, ou utiliser Lucide en adaptant le style (trait fin = `strokeWidth={1.5}`).

### 6.4 — Responsive & Mobile

Les maquettes sont desktop-only. La sidebar Results Anchor doit se transformer en un panneau flottant glassmorphism en bas de l'écran sur mobile (comme suggéré dans DESIGN.md).

### 6.5 — Tailwind CSS vs Vanilla CSS

Le handoff technique recommande Tailwind CSS. Notre application utilise **déjà Tailwind** ✅. Continuer avec Tailwind pour la migration.

---

## 7. Ordre d'Exécution Recommandé & Estimation

| Phase | Nom                      | Dépendance                        | Estimation  |
| ----- | ------------------------ | --------------------------------- | ----------- |
| **0** | Fondations Design System | Aucune                            | 1-2 stories |
| **1** | Landing Page             | Phase 0                           | 1-2 stories |
| **2** | Simulateur Split-Screen  | Phase 0, backend (calcul partiel) | 3-5 stories |
| **3** | Dashboard Résultats      | Phase 0                           | 2-3 stories |
| **4** | Comment ça marche        | Phase 0                           | 2-3 stories |
| **5** | Navigation Globale       | Phases 1-4                        | 1 story     |

**Total estimé** : 10-16 stories, réparties sur 3-4 sprints.

---

## 8. Verification Plan

### Tests automatisés

- Après chaque phase, lancer la suite de tests existante : `npx vitest run` pour s'assurer de zéro régression
- Tests E2E existants via Chrome DevTools / Playwright pour les parcours critiques (formulaire → résultats)

### Vérification visuelle

- Comparaison écran par écran entre maquettes et implémentation via screenshots Chrome DevTools
- Vérification responsive : viewport mobile 375px, tablet 768px, desktop 1440px (utiliser `mcp_chrome-devtools_emulate`)

### Vérification contenu "Comment ça marche"

- Audit de contenu : vérifier que chaque section de la page actuelle (13 sections TOC_ITEMS) est présente dans une des sous-pages
- Grep pour chaque formule (PMT, Cash-flow, Rentabilité) pour confirmer qu'aucune n'a été supprimée

### Vérification données

- Lancer une simulation de référence avant et après migration
- Comparer les KPIs affichés : score, rendement brut/net/net-net, cash-flow, HCSF
- S'assurer que les valeurs sont **identiques** avant/après
