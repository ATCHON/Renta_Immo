# Audit UX — Écarts Maquettes vs Implémentation (2026-03-26)

> **Type** : Audit / Backlog correctifs
> **Date** : 2026-03-26
> **Sprint cible** : À planifier (post Sprint 3)
> **Auteur** : Audit automatisé via Chrome MCP + analyse statique des composants
> **Maquettes de référence** : `docs/ux/stitch/v1/stitch_nordic_minimalist/`

---

## Méthode

Comparaison directe entre :

- Maquettes HTML ouvertes dans Chrome (screenshots live)
- Composants React implémentés (lecture statique du code)

Les écarts **D1/D2** (navigation sidebar/topbar dashboard) sont marqués **DÉCISION VALIDÉE** — ils ont été remplacés par des tabs `useState` selon la décision technique documentée en UX-S03 §2.2.

---

## Priorités

| Niveau    | Critère                                                                |
| --------- | ---------------------------------------------------------------------- |
| 🔴 HIGH   | Élément visuellement structurant, absent ou fondamentalement différent |
| 🟠 MEDIUM | Amélioration notable de l'expérience                                   |
| 🟡 LOW    | Polissage, détail visuel secondaire                                    |

---

## ZONE 1 — Landing Page (UX-S01)

**Maquette** : `landing_page_accueil_premium/code.html`

### L1 — Image hero : photo architecturale manquante 🟠 MEDIUM

**Fichier** : `src/components/landing/HeroSection.tsx`

**Maquette** : Photo réelle d'une maison moderne (paysage arboré, ciel lumineux, format 4:3, `rounded-[2.5rem]`, `shadow-[0_40px_80px_rgba(1,45,29,0.12)]`).

**Implémentation actuelle** : Silhouette CSS programmatique (immeubles générés par gradient + grille pointillée).

**Correction** :

1. Ajouter une image dans `public/images/hero-property.webp` (photo libre de droits)
2. Remplacer la div silhouette par `<Image src="/images/hero-property.webp" alt="..." fill className="object-cover rounded-[2.5rem]" />`
3. Conserver les overlays KPI (rendement brut + cash-flow) par-dessus

---

### L2 — Trust indicators : logos prestige 🟡 LOW

**Fichier** : `src/components/landing/HeroSection.tsx`

**Maquette** : Logos grayed `FORBES · DWELL · AD` (séparateurs `·`, `text-sm font-semibold tracking-widest text-primary/30`).

**Implémentation actuelle** : Indicateurs techniques `530+ Tests unitaires | 6 Régimes fiscaux | HCSF Conformité`.

**Note** : Ce choix est potentiellement intentionnel (différenciation B2C). À décider avec le PM si on revient aux logos prestige ou on garde les indicateurs techniques.

---

### L3 — Avatars témoignages 🟡 LOW

**Fichier** : `src/components/landing/TestimonialsSection.tsx`

**Maquette** : Photos `<img>` circulaires `w-12 h-12`.

**Implémentation actuelle** : Badge circulaire avec initiales sur `bg-secondary-container`.

**Correction** : Ajouter 2 images `public/images/testimonial-at.webp` + `testimonial-er.webp` et remplacer les badges par `<Image>`.

---

## ZONE 2 — Simulateur / Steps (UX-S02)

### S1 — Results Anchor : onglets verticaux 🔴 HIGH

**Fichier** : `src/components/simulator/ResultsAnchor.tsx` (à vérifier si existant)

**Maquette** (`tape_2_financement_1/code.html`) :

```
Results Anchor                    [sidebar fixe gauche]
WEALTH CURATION

○ Live Yield                      [tab inactif]
● Cash Flow                       [tab actif — bg-white/50]
○ Appreciation                    [tab inactif]
○ Tax Benefits                    [tab inactif]

─────────────────────────────────
ESTIMATED MONTHLY PAYMENT
€1,245/mo
Total Cost    €345,000
─────────────────────────────────
[Download Report]
```

**Implémentation actuelle** : À vérifier. Si `ResultsAnchor.tsx` n'a pas ces onglets, les ajouter.

**Correction** :

- Ajouter `useState<'yield' | 'cashflow' | 'appreciation' | 'taxbenefits'>` dans `ResultsAnchor`
- Afficher la KPI card correspondante selon l'onglet actif
- La KPI mensualité (`FinancementResultat.mensualite`) doit être accessible via `usePreviewKPIs`

---

### S2 — Results Anchor : card KPI mensualité 🔴 HIGH

**Fichier** : `src/components/simulator/ResultsAnchor.tsx`

**Maquette** : Card permanente en bas de sidebar avec `ESTIMATED MONTHLY PAYMENT` en label `text-[10px]` + valeur `text-3xl font-extrabold` + ligne `Total Cost €345,000`.

**Source de données** : `usePreviewKPIs()` hook → `mensualite` + `montantTotal`

---

### S4 — Badge "STEP 01" dans le header de chaque step 🔴 HIGH

**Fichiers** :

- `src/components/forms/StepBien.tsx` L74–78
- `src/components/forms/StepFinancement.tsx`
- `src/components/forms/StepExploitation.tsx`
- `src/components/forms/StepStructure.tsx`

**Maquette** (`simulateur_immobilier_unifi/code.html`) :

```html
<span
  class="px-3 py-1 bg-secondary-container text-on-secondary-container
             text-[10px] font-bold uppercase tracking-wider rounded-full"
>
  STEP 01
</span>
```

Positionné au-dessus du titre H2 de chaque step.

**Implémentation actuelle** :

```tsx
// StepBien.tsx L75-78 — pas de badge
<div className="mb-6">
  <h2 className="text-2xl font-bold text-charcoal">Informations du bien</h2>
  <p className="text-pebble mt-1">...</p>
</div>
```

**Correction** : Ajouter avant le `<h2>` dans chaque step :

```tsx
<span
  className="inline-flex px-3 py-1 bg-secondary-container text-on-secondary-container
                 text-[10px] font-bold uppercase tracking-wider rounded-full mb-2"
>
  STEP 01
</span>
```

Numérotation : STEP 01 (Bien), STEP 02 (Financement), STEP 03 (Exploitation), STEP 04 (Fiscalité).

---

### S5 — Icône de section dans le header 🟠 MEDIUM

**Fichier** : Chaque `Step*.tsx`

**Maquette** : Icône Material Symbols `home_work` (ou équivalent) `w-6 h-6` alignée à droite du titre.

**Correction** : Utiliser les icônes Lucide déjà importées dans le projet :

- Bien → `Home` (lucide)
- Financement → `Calculator`
- Exploitation → `TrendingUp`
- Fiscalité → `ReceiptText`

Ajouter dans le header div : `<Icon className="h-6 w-6 text-primary/60" />`

---

### S6 — Property Type : 3 cards radio visuels 🔴 HIGH

**Fichier** : `src/components/forms/StepBien.tsx` + `src/lib/constants.ts`

**Maquette** (`simulateur_immobilier_unifi/code.html`) :

```
[████████████████] [ Apartment ] [ House ] [ Building ]
   (dark, selected)  (icon + label)  (icon + label)
```

3 boutons cards côte à côte avec :

- Fond `bg-primary text-on-primary` si sélectionné, `bg-surface border` sinon
- Icône MD3 (`apartment`, `home`, `domain`) + label sous
- `hover:border-primary/50` sur non-sélectionné

**Implémentation actuelle** (`StepBien.tsx`) :

```tsx
// Ligne ~84 — Select dropdown
<Select
  label="Type de bien"
  {...register('type_bien')}
  options={TYPE_BIEN_OPTIONS}
  error={errors.type_bien?.message}
/>
```

**Constants** (`src/lib/constants.ts` L19-22) :

```ts
export const TYPE_BIEN_OPTIONS = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'maison', label: 'Maison' },
  { value: 'immeuble', label: 'Immeuble' },
```

**Correction** : Remplacer le `<Select>` par 3 boutons cards radio. Utiliser `setValue('type_bien', value)` de react-hook-form + `watch('type_bien')` pour l'état sélectionné. Icônes Lucide : `Building2` (appartement), `Home` (maison), `Building` (immeuble).

```tsx
{
  /* Remplace le <Select type_bien> */
}
<div>
  <label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2 block">
    Type de bien
  </label>
  <div className="grid grid-cols-3 gap-3">
    {TYPE_BIEN_OPTIONS.map(({ value, label, icon: Icon }) => (
      <button
        key={value}
        type="button"
        onClick={() => setValue('type_bien', value)}
        className={cn(
          'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
          watch('type_bien') === value
            ? 'bg-primary text-on-primary border-primary'
            : 'bg-surface border-outline-variant hover:border-primary/50 text-on-surface'
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="text-xs font-medium">{label}</span>
      </button>
    ))}
  </div>
  {errors.type_bien && <p className="text-error text-xs mt-1">{errors.type_bien.message}</p>}
</div>;
```

**Test** : Mettre à jour `tests/unit/components/forms/StepBien.test.tsx` si existant.

---

### S7 — Header contextuel "Refine Your Strategy" 🔴 HIGH

**Fichier** : `src/components/forms/StepFinancement.tsx`

**Maquette** (`tape_2_financement_1/code.html`) : En dehors de la card formulaire, un titre H1 + sous-titre :

```html
<h1 class="text-4xl font-extrabold text-primary">Refine Your Strategy</h1>
<p class="text-on-surface/60 mt-2 max-w-xl">
  Adjust your financing parameters to see the immediate impact on your long-term wealth projections.
</p>
```

**Correction** : Ajouter un bloc header avant le `<form>` dans `StepFinancement` (hors `<Card>`) :

```tsx
<div className="mb-6">
  <span className="...badge STEP 02...">STEP 02</span>
  <h1 className="text-3xl font-extrabold text-primary mt-2">Affinez votre stratégie</h1>
  <p className="text-on-surface/60 mt-1 text-sm">
    Ajustez les paramètres de financement pour mesurer leur impact sur vos projections
    patrimoniales.
  </p>
</div>
```

---

### S8 — Résumé step précédent (collapsed row) 🟠 MEDIUM

**Fichier** : `src/components/forms/StepFinancement.tsx`

**Maquette** : Ligne compressed avec `✓` badge vert, adresse + prix + surface + bouton `Edit` à droite — `bg-surface rounded-2xl p-4 border border-outline-variant/30`.

**Implémentation actuelle** : Un résumé du bien existe déjà (`bg-surface rounded-xl p-4 mb-6 border border-sand`). Il faut aligner son style sur la maquette (icône check circle, Edit link).

---

### S9 — Badge numéro de section "2" 🔴 HIGH

**Fichier** : `src/components/forms/StepFinancement.tsx`

**Maquette** : Cercle `w-8 h-8 bg-primary text-on-primary rounded-full` avec le chiffre `2` centré, avant le titre "Financing Details".

**Correction** : Ajouter avant le titre de la section formulaire :

```tsx
<div className="flex items-center gap-3 mb-4">
  <span className="w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
    2
  </span>
  <h2 className="text-xl font-bold text-on-surface">Détails du financement</h2>
</div>
```

---

### S10 — Loan Duration : valeur large + slider 🔴 HIGH

**Fichier** : `src/components/forms/StepFinancement.tsx`

**Maquette** (`tape_2_financement_1/code.html`) :

```
LOAN DURATION                              25 Years
[━━━━━━━━━━━━━━━━━━━●━━━━━━━━━]
5 YEARS                             30 YEARS
```

- Label `LOAN DURATION` en `text-[10px] font-bold uppercase tracking-wider`
- Valeur `25` en `text-3xl font-extrabold text-primary` + `Years` en `text-lg`
- Slider 5-30 ans avec `VerdantSlider`

**Implémentation actuelle** : `<Input label="Durée de l'emprunt" type="number" />` (champ texte standard).

**Correction** : Remplacer par un bloc combiné :

```tsx
<div>
  <div className="flex items-center justify-between mb-2">
    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
      Durée de l&apos;emprunt
    </span>
    <span className="text-3xl font-extrabold text-primary">
      {watch('duree_emprunt')}
      <span className="text-lg font-medium ml-1">ans</span>
    </span>
  </div>
  <VerdantSlider
    value={watch('duree_emprunt') ?? 20}
    onChange={(v) => setValue('duree_emprunt', v)}
    min={5}
    max={30}
    step={1}
    unit="ans"
  />
</div>
```

Supprimer l'`<Input>` existant pour `duree_emprunt`. Mettre à jour les tests.

---

### S11 — Hints contextuels sous les inputs 🟠 MEDIUM

**Fichier** : `src/components/forms/StepFinancement.tsx`

**Maquette** :

- Sous apport : `Recommended: 20% (€69,000)` (calculé dynamiquement selon prix_achat)
- Sous taux : `Current market average: 3.92%`

**Correction** : Ajouter des `<p className="text-[11px] text-on-surface/50 mt-1">` sous les inputs concernés. Le hint apport est calculé : `prix_achat * 0.2`.

---

### S12 — "Pro Tip" insight card 🟡 LOW

**Fichier** : `src/components/forms/StepFinancement.tsx`

**Maquette** : En bas du formulaire, card `bg-surface border border-outline-variant rounded-2xl p-6` avec icône ampoule + titre + texte pédagogique sur l'effet levier.

**Correction** : Ajouter après les champs principaux (avant le bouton de navigation) :

```tsx
<div className="rounded-2xl border border-outline-variant bg-surface p-5 flex gap-3">
  <Lightbulb className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
  <div>
    <p className="text-sm font-semibold text-on-surface">Astuce : Levier vs. Apport</p>
    <p className="text-xs text-on-surface/60 mt-1">
      Augmenter la durée de 20 à 25 ans réduit la mensualité d&apos;environ €142/mo, améliorant
      l&apos;effort d&apos;épargne. Simulez l&apos;impact sur le TRI.
    </p>
  </div>
</div>
```

---

### S15 — Fiscal cards : grid 3 colonnes 🔴 HIGH

**Fichier** : `src/components/forms/StepStructure.tsx`

**Maquette** (`tape_5_fiscalit/code.html`) : Les 3 familles côte à côte en `grid md:grid-cols-3 gap-4`.

**Implémentation actuelle** (`StepStructure.tsx` L28-78) : Stack verticale `space-y-3`.

**Correction** : Changer le container des familles :

```tsx
// Avant
<div className="space-y-3">
  {FAMILLES.map(...)}
</div>

// Après
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  {FAMILLES.map(...)}
</div>
```

Les cards doivent avoir une hauteur uniforme (`h-full`) et un layout column (`flex flex-col`).

**Attention** : La card sélectionnée s'expand pour afficher les sous-options. En grid 3 cols, l'expansion doit passer sous toute la grille (`col-span-3`) via un élément sibling — ou afficher les sous-options dans une zone séparée sous la grille.

---

### S16 — Badges familles fiscales 🔴 HIGH

**Fichier** : `src/components/forms/StepStructure.tsx` — array `FAMILLES` L28

**Maquette** :

- LMNP : `BEST FOR CASHFLOW`
- Revenus Fonciers : `STANDARD APPROACH`
- SCI IS : `LEGACY BUILDING`

Style : `text-[10px] font-bold uppercase tracking-wider text-primary/60`

**Correction** : Ajouter `badge` dans l'array `FAMILLES` :

```ts
const FAMILLES = [
  {
    id: 'lmnp',
    emoji: '🏠',
    label: 'LMNP',
    badge: 'BEST FOR CASHFLOW',   // ← ajouter
    ...
  },
  {
    id: 'rf',
    emoji: '📄',
    label: 'Revenus Fonciers',
    badge: 'STANDARD APPROACH',   // ← ajouter
    ...
  },
  {
    id: 'sci',
    emoji: '🏢',
    label: "SCI à l'IS",
    badge: 'LEGACY BUILDING',     // ← ajouter
    ...
  },
];
```

Et dans le rendu, en bas de chaque card :

```tsx
<span className="text-[10px] font-bold uppercase tracking-wider text-primary/60">
  {famille.badge}
</span>
```

---

### S17 — Icônes familles fiscales (MD3 → Lucide) 🟠 MEDIUM

**Fichier** : `src/components/forms/StepStructure.tsx`

**Maquette** : Icônes dans un cercle `w-12 h-12 bg-secondary-fixed rounded-full` :

- LMNP → `bed` (Lucide : `BedDouble`)
- Revenus Fonciers → `foundation` (Lucide : `Landmark`)
- SCI IS → `corporate_fare` (Lucide : `Building2`)

**Implémentation actuelle** : Emojis `🏠 📄 🏢`.

**Correction** : Ajouter `icon: LucideIcon` dans `FAMILLES` et afficher :

```tsx
<div className="w-10 h-10 bg-secondary-fixed rounded-full flex items-center justify-center">
  <famille.icon className="h-5 w-5 text-primary" />
</div>
```

---

### S19 — "Tax Impact Simulation" card 🟠 MEDIUM

**Fichier** : `src/components/forms/StepStructure.tsx`

**Maquette** : Card contextuelle apparaissant sous la grille quand une famille est sélectionnée :

```
Tax Impact Simulation
By choosing LMNP, you are expected to save approximately €4,200
in taxes during the first 5 years of operation.

YEAR 1 PROJECTION
Income Tax Avoided     €840
DEPRECIATION BENEFIT
Real Estate Value      €12,500
```

**Source de données** : Calculer depuis `usePreviewKPIs()` si disponible, ou afficher les données d'impôt estimées de la simulation en cours.

**Correction** : Ajouter un bloc conditionnel sous la grille des familles, visible uniquement quand une famille est sélectionnée.

---

## ZONE 3 — Dashboard Résultats (UX-S03)

### D3/D14 — Footer floating glassmorphic 🔴 HIGH

**Fichier** : `src/components/results/Dashboard.tsx`

**Maquette** (`tableau_de_bord_de_r_sultats_complet/code.html`) :

```
[fixed bottom-8 left-1/2 -translate-x-1/2 z-50]
┌─────────────────────────────────────────────────────┐
│  [⬇ Download PDF]  │  [💾 Save Draft]  │  [↗ Share] │
└─────────────────────────────────────────────────────┘
bg-white/80 backdrop-blur-xl shadow-[0_20px_40px_rgba(1,45,29,0.15)]
rounded-full px-8 py-4 flex items-center gap-4
```

**Implémentation actuelle** (`Dashboard.tsx`) : Les boutons `<DownloadPdfButton>` + `<SaveSimulationButton>` sont dans le header inline de la page.

**Correction** : Créer un composant `DashboardFloatingFooter` :

```tsx
// src/components/results/DashboardFloatingFooter.tsx
export function DashboardFloatingFooter({ formData, resultats }) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
      <div
        className="flex items-center gap-3 bg-white/80 backdrop-blur-xl
                      shadow-[0_20px_40px_rgba(1,45,29,0.15)]
                      rounded-full px-6 py-3"
      >
        <DownloadPdfButton formData={formData} resultats={resultats} />
        <div className="w-px h-6 bg-outline-variant/40" />
        <SaveSimulationButton />
        <div className="w-px h-6 bg-outline-variant/40" />
        <button className="p-2 text-on-surface/50 hover:text-on-surface transition-colors">
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
```

Et ajouter dans `Dashboard.tsx` : `<DashboardFloatingFooter ... />` après le contenu principal. Retirer les boutons du header. Ajouter `pb-24` au container principal pour que le contenu ne soit pas masqué.

---

### D4 — Score Panel : jauge SVG circulaire 🔴 HIGH

**Fichier** : `src/components/results/ScorePanel.tsx`

**Maquette** (`tableau_de_bord_de_r_sultats_complet/code.html`) :

```
┌─────────────────────────┐
│   PERFORMANCE SCORE     │
│                         │
│      ╭───────╮          │
│     │   100  │          │
│     │  / 100 │          │
│      ╰───────╯          │
│    [  EXCELLENT  ]      │
│  This project exceeds   │
│  all benchmark...       │
└─────────────────────────┘
bg-secondary-fixed rounded-3xl p-8
```

SVG circle technique :

```html
<circle
  cx="100"
  cy="100"
  r="80"
  stroke-dasharray="502"
  stroke-dashoffset="502 * (1 - score/100)"
  stroke="#012D1D"
  stroke-width="8"
  fill="none"
  stroke-linecap="round"
/>
```

**Implémentation actuelle** (`ScorePanel.tsx`) : Legend bar colorée linéaire + décomposition des ajustements.

**Correction** : Ajouter une vue "compact" avec la jauge SVG. La décomposition des ajustements reste accessible (toggle ou accordéon "Voir le détail"). Conserver la logique `deriveEvaluation` et `deriveColorKey` existante.

Structure JSX suggérée :

```tsx
<div className="bg-secondary-fixed rounded-3xl p-8 flex flex-col items-center">
  {/* SVG Circle */}
  <svg width="180" height="180" viewBox="0 0 200 200">
    {/* Track */}
    <circle
      cx="100"
      cy="100"
      r="80"
      fill="none"
      stroke="currentColor"
      className="text-outline-variant/20"
      strokeWidth="8"
    />
    {/* Progress */}
    <circle
      cx="100"
      cy="100"
      r="80"
      fill="none"
      stroke="currentColor"
      className={scoreColors.text}
      strokeWidth="8"
      strokeLinecap="round"
      strokeDasharray={`${2 * Math.PI * 80}`}
      strokeDashoffset={`${2 * Math.PI * 80 * (1 - score / 100)}`}
      transform="rotate(-90 100 100)"
      style={{ transition: 'stroke-dashoffset 1s ease' }}
    />
    {/* Score text */}
    <text
      x="100"
      y="95"
      textAnchor="middle"
      className="fill-primary"
      style={{ fontSize: 40, fontWeight: 800 }}
    >
      {score}
    </text>
    <text
      x="100"
      y="118"
      textAnchor="middle"
      className="fill-on-surface/40"
      style={{ fontSize: 14 }}
    >
      / 100
    </text>
  </svg>

  {/* Badge évaluation */}
  <span
    className="mt-3 px-5 py-1.5 bg-primary text-on-primary rounded-full
                   text-sm font-bold uppercase tracking-wide"
  >
    {evaluation}
  </span>

  {/* Description narrative */}
  <p className="mt-3 text-center text-sm text-on-surface/60 max-w-[200px]">
    {evaluationDescription}
  </p>
</div>
```

Ajouter `evaluationDescription` par niveau :

- Excellent (≥80) : "Ce projet dépasse tous les critères de rentabilité durable."
- Bon (60-79) : "Bon équilibre rendement/risque avec un potentiel de progression."
- Moyen (40-59) : "Rentabilité correcte, des optimisations sont possibles."
- Faible (<40) : "Rentabilité insuffisante — revoir les paramètres du projet."

**Tests à mettre à jour** : `tests/unit/components/results/Dashboard.test.tsx` — vérifier que le SVG `<circle>` est rendu avec le bon `strokeDashoffset`.

---

### D5 — ScorePanel : décomposition accessible mais secondaire 🟠 MEDIUM

**Fichier** : `src/components/results/ScorePanel.tsx`

**Maquette** : La décomposition (barres ajustements) n'est pas dans la maquette principale — elle est spécifique à l'implémentation V2. La conserver mais la passer en accordéon "Voir le détail des sous-scores" sous la jauge.

---

### D7 — MetricCard : padding généreux 🟠 MEDIUM

**Fichier** : `src/components/results/MetricCard.tsx`

**Maquette** : `p-8` + `shadow-[0_20px_40px_rgba(1,45,29,0.06)]` + `border border-outline-variant/10`.

**Implémentation actuelle** : `p-4 sm:p-6`, shadow minimal, pas de border.

**Correction** :

```tsx
// MetricCard.tsx — classes container
className={cn(
  'bg-surface-container-lowest rounded-2xl',
  'p-5 sm:p-7',                                          // ← de p-4 à p-5/p-7
  'border border-outline-variant/10',                     // ← ajouter
  'shadow-[0_8px_24px_rgba(1,45,29,0.06)]',             // ← renforcer l'ombre
  'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
  className
)}
```

---

### D11 — PatrimoineChart : supprimer CartesianGrid 🟠 MEDIUM

**Fichier** : `src/components/results/PatrimoineChart.tsx`

**Maquette** : Graphique area avec courbes épurées, fond blanc, **pas de grille** visible, axes minimalistes.

**Correction** :

- Supprimer `<CartesianGrid strokeDasharray="3 3" />` (ou mettre `stroke="transparent"`)
- Réduire les `<XAxis>` / `<YAxis>` à `tick={{ fontSize: 11 }}` + `axisLine={false}` + `tickLine={false}`
- Passer `fillOpacity` du gradient à 0.15 (plus subtil)

---

### D13 — Containers charts : spacing + border radius 🟡 LOW

**Fichiers** : `src/components/results/PatrimoineChart.tsx`, `CashflowChart.tsx`

**Maquette** : `p-10 rounded-3xl bg-surface-container-lowest`.

**Implémentation actuelle** : `p-8 rounded-[2rem]`.

**Correction** : Passer à `p-8 md:p-10` et `rounded-3xl` sur les containers parents.

---

### D18 — ProjectionTable : toggle Annuel / Trimestriel 🔴 HIGH

**Fichier** : `src/components/results/ProjectionTable.tsx`

**Maquette** (`20_year_financial_projections/code.html`) : Boutons toggle au-dessus du tableau :

```
[ Annuel ] [ Trimestriel ]    ← state local
```

**Implémentation actuelle** : Absent. Ce point est dans le **DoD de UX-S03 §3.7** — c'est une régression de livraison.

**Correction** : Ajouter `useState<'annuel' | 'trimestriel'>('annuel')` et filtrer/grouper les données de projection :

- Annuel : afficher 1 ligne par an (données déjà disponibles dans `projections[]`)
- Trimestriel : calculer des valeurs interpolées par trimestre (diviser les delta annuels par 4)

```tsx
const [granularite, setGranularite] = useState<'annuel' | 'trimestriel'>('annuel');

// Dans le JSX, avant le tableau :
<div className="flex gap-2 mb-4">
  {(['annuel', 'trimestriel'] as const).map((g) => (
    <button
      key={g}
      onClick={() => setGranularite(g)}
      className={cn(
        'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
        granularite === g
          ? 'bg-primary text-on-primary'
          : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
      )}
    >
      {g === 'annuel' ? 'Annuel' : 'Trimestriel'}
    </button>
  ))}
</div>;
```

**Test à créer** : `tests/unit/components/results/ProjectionTable.test.tsx` — vérifier le switch de granularité.

---

## Récapitulatif des fichiers à modifier

| Fichier                                              | IDs                        |
| ---------------------------------------------------- | -------------------------- |
| `src/components/forms/StepBien.tsx`                  | S4, S5, S6                 |
| `src/components/forms/StepFinancement.tsx`           | S7, S8, S9, S10, S11, S12  |
| `src/components/forms/StepStructure.tsx`             | S15, S16, S17, S18, S19    |
| `src/components/results/ScorePanel.tsx`              | D4, D5                     |
| `src/components/results/MetricCard.tsx`              | D7, D8                     |
| `src/components/results/Dashboard.tsx`               | D3, D14, D15, D16          |
| `src/components/results/PatrimoineChart.tsx`         | D11, D13                   |
| `src/components/results/ProjectionTable.tsx`         | D18                        |
| `src/components/simulator/ResultsAnchor.tsx`         | S1, S2                     |
| `src/components/landing/HeroSection.tsx`             | L1, L2                     |
| `src/components/landing/TestimonialsSection.tsx`     | L3                         |
| `src/components/results/DashboardFloatingFooter.tsx` | D3 — **nouveau composant** |

---

## Règles de développement applicables

1. **Zéro `any` TypeScript** — toutes les props doivent être typées
2. **Zéro régression calcul** — ne pas toucher aux stores Zustand ni aux fichiers `src/server/calculations/`
3. **Tests obligatoires** — tout nouveau comportement interactif (toggle, cards radio) doit avoir un TU
4. **Commande de vérification** :

```bash
npm run test            # ≥ 640 TU verts
npm run type-check      # 0 erreur
npm run lint            # 0 warning
```

---

## Changelog

| Date       | Version | Description                                    | Auteur           |
| ---------- | ------- | ---------------------------------------------- | ---------------- |
| 2026-03-26 | 1.0     | Création — audit Chrome MCP + analyse statique | Audit automatisé |
