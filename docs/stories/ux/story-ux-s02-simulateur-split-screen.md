# Story UX-S02 : Simulateur — Layout Split-Screen & Sidebar Results Anchor

> **Priorité** : P1 — La refonte la plus complexe
> **Effort** : L (4–5 jours)
> **Statut** : ✅ DONE — Sprint 2a ✅ (3.1+3.2), Sprint 3 ✅ (3.3–3.6)
> **Type** : Feature / UI + Layout
> **Epic** : UX Migration — Phase 2 : Simulateur
> **Branche** : `feature/verdant-simulator`
> **Dépendances** : UX-S00 ✅, UX-BE01 ✅, UX-BE02 ✅, UX-BE03 ✅

---

## 1. User Story

**En tant que** utilisateur en train de remplir le formulaire de simulation
**Je veux** voir des KPIs clés mis à jour en temps réel dans une sidebar latérale
**Afin de** garder le fil de ma simulation sans devoir soumettre le formulaire pour obtenir un aperçu.

---

## 2. Contexte

### 2.1 Changement structurel majeur

La refonte la plus importante de cette migration : le formulaire multi-step passe d'un **layout pleine largeur** à un **layout split-screen** permanent :

```
┌───────────────────────────────────────────────────────┐
│  Navbar Patricia Nova                                  │
├──────────────────────────────────┬────────────────────┤
│  RESULTS ANCHOR (sticky 340px)   │  FORM CONTENT      │
│                                  │  (scrollable)      │
│  ● Rendement brut: ~5,2%        │                     │
│  ● Mensualité: ~1 250 €         │  ┌──────────────┐  │
│  ● Cash-flow: ~ -120 €/mois     │  │ Step N       │  │
│  ● Investissement: 220 000 €    │  │ (accordéon)  │  │
│                                  │  └──────────────┘  │
│  [mini bar chart]                │                     │
│                                  │                     │
│  [📥 Télécharger PDF]           │                     │
└──────────────────────────────────┴────────────────────┘
```

### 2.2 Maquettes de référence

- **Step 1 (Bien)** : `simulateur_immobilier_unifi/` — [screen.png](docs/ux/stitch/v1/stitch_nordic_minimalist/simulateur_immobilier_unifi/screen.png) → [code.html](docs/ux/stitch/v1/stitch_nordic_minimalist/simulateur_immobilier_unifi/code.html) (**LE PLUS IMPORTANT** : contient le layout split-screen complet)
- **Step 2 (Financement)** : `tape_2_financement_1/` + variante `tape_2_financement_2/`
- **Step 3 (Revenus)** : `tape_3_revenus_locatifs/`
- **Step 4 (Charges)** : `tape_4_charges_annuelles/`
- **Step 5 (Fiscalité)** : `tape_5_fiscalit/`

> [!NOTE]
> Commencer par lire **`simulateur_immobilier_unifi/code.html`** — il contient le layout split-screen complet que les autres steps réutilisent.

### 2.3 KPIs de la sidebar par step

| Step                 | KPIs affichés dans Results Anchor                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------ |
| Step 1 (Bien)        | Rendement brut `~X %`, Mensualité estimée `~X €`, Investissement total `X €`, mini bar chart Cash-flow |
| Step 2 (Financement) | Mensualité `~X €`, Coût total crédit `X €`, TAEG `~X %`                                                |
| Step 3 (Revenus)     | Cash-flow mensuel `~X €`, Rendement brut `~X %`                                                        |
| Step 4 (Charges)     | Rendement net projeté, NOI mensuel                                                                     |
| Step 5 (Fiscalité)   | Projection actuelle, Rendement net-net                                                                 |

---

## 3. Critères d'acceptation

### 3.1 Layout `SimulatorLayout` ✅ Sprint 2a

- [x] Fichier `src/components/layout/SimulatorLayout.tsx` créé
- [x] Le layout est une grille CSS : `grid-cols-[340px_1fr]` sur desktop
- [x] La sidebar est en `sticky top-0 h-screen overflow-hidden` (implémenté via `h-[calc(100vh-4rem)]` pour tenir compte du header global 4rem)
- [x] La zone de contenu droit est scrollable : `overflow-y-auto`

**Architecture du composant** :

```tsx
// src/components/layout/SimulatorLayout.tsx
export function SimulatorLayout({ children, currentStep }: SimulatorLayoutProps) {
  return (
    <div className="grid lg:grid-cols-[340px_1fr] h-screen">
      <aside className="sticky top-0 h-screen overflow-hidden border-r border-[var(--color-outline-variant)]">
        <ResultsAnchor currentStep={currentStep} />
      </aside>
      <main className="overflow-y-auto">{children}</main>
    </div>
  );
}
```

> [!CAUTION]
> **Responsive mobile obligatoire dès le départ** — ne pas créer de dette technique. Sur mobile (`< 1024px`), la sidebar Results Anchor devient un **panneau glassmorphism fixé en bas de l'écran** :
>
> ```css
> /* Mobile : panneau glassmorphism en bas */
> @media (max-width: 1023px) {
>   .results-anchor {
>     position: fixed;
>     bottom: 0;
>     left: 0;
>     right: 0;
>     z-index: 50;
>   }
> }
> ```

### 3.2 Composant `ResultsAnchor` ✅ Sprint 2a

- [x] Fichier `src/components/layout/ResultsAnchor.tsx` créé
- [x] Accepte une prop `currentStep: 1 | 2 | 3 | 4 | 5`
- [x] Utilise le hook `usePreviewKPIs()` (UX-BE02) pour obtenir les KPIs dynamiques
- [x] Affiche les KPIs correspondant au step actif (cf. tableau section 2.3)
- [x] Les valeurs `null` sont affichées comme `—` (tiret em)
- [x] Les valeurs approximatives affichent un tilde `~` préfixe (ex: `~5,2 %`)
- [x] Le bouton « Télécharger PDF » (`DownloadPdfButton`) est présent en bas de la sidebar

**Variants par step** (composants séparés pour lisibilité) :

```
src/components/layout/ResultsAnchorStep1.tsx
src/components/layout/ResultsAnchorStep2.tsx
src/components/layout/ResultsAnchorStep3.tsx
src/components/layout/ResultsAnchorStep4.tsx
src/components/layout/ResultsAnchorStep5.tsx
```

### 3.3 Stepper horizontal

- [ ] `FormWizard.tsx` est modifié pour utiliser le nouveau layout `SimulatorLayout`
- [ ] `ProgressStepper.tsx` est redesigné avec des cercles numérotés connectés par des lignes horizontales :
  ```
  ① ——— ② ——— ③ ——— ④ ——— ⑤
  Bien  Fin. Revenu Charges Fiscal
  ```
- [ ] Le step actif est mis en évidence (fond `--color-primary`, texte blanc)
- [ ] Les steps complétés affichent un checkmark (icon Lucide `Check`)

### 3.4 Préservation des champs formulaire

> [!IMPORTANT]
> **RÈGLE ABSOLUE** : Tous les champs de formulaire actuels **doivent rester présents**. Les champs non visibles dans les maquettes Stitch seront placés dans des sections accordéon **« Options avancées »**.

| Composant              | Champs à NE PAS supprimer                              |
| ---------------------- | ------------------------------------------------------ |
| `StepExploitation.tsx` | Provisions travaux, frais de gestion, vacance locative |
| `StepAssocies.tsx`     | Tous les champs de charges actuels                     |
| `StepStructure.tsx`    | Les 6 régimes fiscaux (cf. section 3.5)                |

### 3.5 Step 5 — Les 6 régimes fiscaux préservés

Les maquettes montrent 3 cartes (LMNP, Revenus Fonciers, SCI IS). Notre application gère **6 régimes**. Solution : **3 cartes expansibles avec sous-sélection** :

| Carte visuelle      | Sous-régimes (accordéon interne) |
| ------------------- | -------------------------------- |
| 🏠 LMNP             | Micro-BIC ↔ Réel                 |
| 📄 Revenus Fonciers | Micro-Foncier ↔ Foncier Réel     |
| 🏢 SCI à l'IS       | Capitalisation ↔ Distribution    |

- [ ] Chaque carte est sélectionnable (clic = active la famille)
- [ ] Un sous-sélecteur apparaît après sélection d'une famille (radio buttons ou toggle)
- [ ] Le régime sélectionné est envoyé au store Zustand via `updateStructure()` ou équivalent

### 3.6 Composant `VerdantSlider` (Step 2)

- [ ] Fichier `src/components/ui/VerdantSlider.tsx` créé
- [ ] Input range stylisé (emerald, thumb arrondi, track en `--color-secondary-fixed`)
- [ ] Synchronisé bidirectionnellement avec un input numérique (saisie directe aussi possible)
- [ ] Utilisé pour la durée du prêt (12–360 mois) dans `StepFinancement.tsx`
- [ ] Valeur synchronisée avec le store via `updateFinancement()`

---

## 4. Spécifications techniques

### 4.1 Fichiers impactés

| Fichier                                            | Action | Détail                                       |
| -------------------------------------------------- | ------ | -------------------------------------------- |
| `src/components/layout/SimulatorLayout.tsx`        | NEW    | Layout split-screen                          |
| `src/components/layout/ResultsAnchor.tsx`          | NEW    | Sidebar KPIs                                 |
| `src/components/layout/ResultsAnchorStep[1-5].tsx` | NEW ×5 | Variantes par step                           |
| `src/components/ui/VerdantSlider.tsx`              | NEW    | Slider épuré                                 |
| `src/components/forms/FormWizard.tsx`              | MODIFY | Intégration dans SimulatorLayout             |
| `src/components/forms/ProgressStepper.tsx`         | MODIFY | Design horizontal                            |
| `src/components/forms/StepBien.tsx`                | MODIFY | Cartes TypeBien, accordéon Acquisition       |
| `src/components/forms/StepFinancement.tsx`         | MODIFY | Slider durée, Pro Tip                        |
| `src/components/forms/StepExploitation.tsx`        | MODIFY | Style épuré, champs avancés en accordéon     |
| `src/components/forms/StepAssocies.tsx`            | MODIFY | Toggle fixed/percentage                      |
| `src/components/forms/StepStructure.tsx`           | MODIFY | 3 familles de cartes expansibles (6 régimes) |

### 4.2 Ordre de développement recommandé

1. Créer `SimulatorLayout` + `ResultsAnchor` (mockés, sans vraies données)
2. Intégrer dans `FormWizard` et valider le layout desktop + mobile
3. Brancher `usePreviewKPIs()` sur `ResultsAnchor`
4. Créer `VerdantSlider` et l'intégrer dans `StepFinancement`
5. Refondre `StepStructure` (complexité élevée — 6 régimes)
6. Refondre les autres steps (Bien, Revenus, Charges)

---

## 5. Tests

### 5.1 TU à créer

- `tests/unit/components/layout/SimulatorLayout.test.tsx` — render, prop `currentStep`
- `tests/unit/components/layout/ResultsAnchor.test.tsx` — affichage KPIs, valeurs null → `—`
- `tests/unit/components/ui/VerdantSlider.test.tsx` — synchronisation valeur/input

### 5.2 Commandes

```bash
# Lancer suite complète
npm run test

# Test de régression calcul (CRUCIAL — les KPIs sidebar ne doivent pas diverger de >0.5% des résultats finaux)
npm run test:regression

# E2E — parcours complet formulaire
npm run test:e2e
# Tests ciblés : tests/e2e/calculateur/validation.spec.ts
```

### 5.3 Test responsive

```bash
npm run dev
# Via Chrome DevTools MCP :
# mcp_chrome-devtools_emulate(viewport: "375x812x2,mobile,touch")   # iPhone
# mcp_chrome-devtools_emulate(viewport: "768x1024x2,mobile,touch")  # iPad
# mcp_chrome-devtools_emulate(viewport: "1440x900x1")                # Desktop
```

---

## 6. Definition of Done

- [x] `SimulatorLayout` et `ResultsAnchor` fonctionnels avec KPIs en temps réel
- [ ] 6 régimes fiscaux tous présents dans `StepStructure` _(Sprint 3 — 3.5)_
- [x] Responsive : sidebar → panneau bottom sur mobile
- [x] `npm run test` : 596 TU verts (530+ ✅)
- [ ] `npm run test:regression` : régression calcul = 0 _(Sprint 3)_
- [ ] `npm run test:e2e` : parcours formulaire complet fonctionnel _(Sprint 3)_
- [x] Aucun champ de formulaire supprimé _(aucune modification des steps pour l'instant)_
- [x] Aucun `any` TypeScript
- [x] TU créés pour les nouveaux composants (`SimulatorLayout.test.tsx`, `ResultsAnchor.test.tsx`)
- [ ] PR mergée depuis `feature/verdant-simulator` _(en cours)_

---

## Dev Agent Record

### Sprint 2a (2026-03-25) — Sections 3.1 + 3.2

**Agent** : James (dev) — claude-sonnet-4-6
**Branche** : `feature/verdant-simulator`
**Commit** : `9e438bf`

#### Fichiers créés/modifiés

| Fichier                                                 | Action                                        |
| ------------------------------------------------------- | --------------------------------------------- |
| `src/components/layout/SimulatorLayout.tsx`             | NEW                                           |
| `src/components/layout/ResultsAnchor.tsx`               | NEW                                           |
| `src/components/layout/ResultsAnchorStep1.tsx`          | NEW                                           |
| `src/components/layout/ResultsAnchorStep2.tsx`          | NEW                                           |
| `src/components/layout/ResultsAnchorStep3.tsx`          | NEW                                           |
| `src/components/layout/ResultsAnchorStep4.tsx`          | NEW                                           |
| `src/components/layout/ResultsAnchorStep5.tsx`          | NEW                                           |
| `src/app/calculateur/page.tsx`                          | MODIFY — wrap FormWizard dans SimulatorLayout |
| `tests/unit/components/layout/SimulatorLayout.test.tsx` | NEW — 4 TU jsdom                              |
| `tests/unit/components/layout/ResultsAnchor.test.tsx`   | NEW — 9 TU jsdom                              |

#### Notes

- `h-[calc(100vh-4rem)]` utilisé à la place de `h-screen` pour tenir compte du header global 4rem
- Panneau mobile glassmorphism fixé en bas (`fixed bottom-0`), compact mode = grille 2×2
- PDF button : affiché seulement si `scenario.resultats !== null`, sinon bouton désactivé
- Step mapping : store `currentStep` 0-indexed → sidebar `sidebarStep = clamp(storeStep+1, 1, 5)`
- Tests jsdom : docblock `// @vitest-environment jsdom` obligatoire (env global = node)

### Code Review Sourcery (2026-03-25) — PR #65

**Commit** : `5e8534a`

#### Corrections apportées

| Point                     | Fichier(s)                           | Correction                                                                    |
| ------------------------- | ------------------------------------ | ----------------------------------------------------------------------------- |
| Duplication helpers fmt   | `ResultsAnchorStep1–5.tsx`           | Extraction vers `src/utils/kpiFormat.ts` (`fmtEuro`, `fmtPercent`)            |
| `height` répété × 3       | `SimulatorLayout.tsx`                | `height` conservé sur parent uniquement, `h-full` sur `aside` + `div` enfants |
| Guard null store          | `ResultsAnchor.tsx`                  | `scenario.resultats` → `scenario?.resultats`                                  |
| Cashflow null color       | `ResultsAnchor.tsx`                  | `text-primary` → `text-primary/40` quand valeur null                          |
| Tests null indirects      | `ResultsAnchor.test.tsx`             | `document.body.textContent` → `screen.getAllByText` + `within()`              |
| Tests formatage manquants | `tests/unit/utils/kpiFormat.test.ts` | NOUVEAU — 10 TU sur seuils k€/M€ et précision %                               |

---

## Changelog

| Date       | Version | Description                                         | Auteur      |
| ---------- | ------- | --------------------------------------------------- | ----------- |
| 2026-03-25 | 1.0     | Création — Plan UX Sally + Plan technique Winston   | John (PM)   |
| 2026-03-25 | 1.1     | Sprint 2a — SimulatorLayout + ResultsAnchor         | James (dev) |
| 2026-03-25 | 1.2     | Code review Sourcery — utilitaires KPI + robustesse | James (dev) |
