# Document de Handoff Technique : Verdant Simulator (V2)

Ce document détaille les spécifications nécessaires pour l'implémentation fidèle des maquettes "Veridian Hearth".

---

## 1. Fondations Visuelles (Design System)

### Palette de Couleurs

- **Primaire (Deep Emerald):** `#1B4332`
- **Secondaire (Soft Sage):** `#D6E6DD`
- **Accents (Gold/Orange):** `#FFB347` / `#FF8C00`
- **Surface:** `#F9F9F8`
- **Texte:** `#012D1D` (Titres) / `#404944` (Corps)

### Typographie

- **Police Principale:** **Manrope**
- **Police de Données:** **Inter**

### Icônes (Nouveau)

- **Bibliothèque :** **Google Material Symbols** (Outlined).
- **Style :** Utiliser une épaisseur de trait (weight) de 300 ou 400 pour un look raffiné.
- **Couleur :** `#1B4332` pour les icônes actives ou d'accent, `#404944` pour les icônes secondaires.

---

## 2. Structure de Données & API (JSON)

---

## 3. Logique UX & États

- **Calcul Temps Réel :** KPIs recalculés localement à chaque modification de champ.
- **Accordéons Exclusifs :** L'ouverture d'une section réduit automatiquement la précédente.

---

## 4. Stack Recommandée

- **Front:** React / Next.js
- **Styles:** Tailwind CSS
- **Charts:** Recharts.js
- **Animations:** Framer Motion
