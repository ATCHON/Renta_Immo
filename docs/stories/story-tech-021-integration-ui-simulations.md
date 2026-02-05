# Story TECH-021 : Intégration UI Simulations

> **Version** : 1.0
> **Date** : 2026-02-04
> **Auteur** : John (PM)
> **Statut** : ✅ Terminé
> **Type** : Feature
> **Epic** : Epic 1 - Infrastructure Backend (Phase 2)
> **Sprint** : Sprint 2

---

## 1. Description

**En tant qu'** utilisateur authentifié
**Je veux** sauvegarder et retrouver mes simulations
**Afin de** les comparer et les modifier plus tard

---

## 2. Contexte

Cette story finalise la fonctionnalité de persistance en intégrant l'API CRUD dans l'interface utilisateur. L'utilisateur pourra sauvegarder une simulation après calcul et accéder à sa liste de simulations.

---

## 3. Fonctionnalités

### 3.1 Bouton "Sauvegarder" (page résultats)

- Apparaît après un calcul réussi
- Ouvre une modale pour nommer la simulation
- Appelle `POST /api/simulations`
- Feedback : toast succès/erreur

### 3.2 Page "Mes Simulations" (`/simulations`)

- Liste des simulations de l'utilisateur
- Tri par date / score / nom
- Filtres : favoris, archivés
- Actions par simulation :
  - Voir détails
  - Modifier le nom
  - Marquer favori ⭐
  - Archiver 📦
  - Supprimer 🗑️

### 3.3 Détail simulation (`/simulations/[id]`)

- Affiche les résultats sauvegardés
- Bouton "Recalculer" (recharge le formulaire)
- Bouton "Télécharger PDF"
- Bouton "Modifier"

---

## 4. Composants à créer

```
src/components/simulations/
├── SaveSimulationButton.tsx    # Bouton sauvegarde
├── SaveSimulationModal.tsx     # Modale de nommage
├── SimulationsList.tsx         # Liste des simulations
├── SimulationCard.tsx          # Carte individuelle
├── SimulationFilters.tsx       # Filtres et tri
└── SimulationActions.tsx       # Menu actions (dropdown)

src/app/
├── simulations/
│   ├── page.tsx               # Liste simulations
│   └── [id]/
│       └── page.tsx           # Détail simulation
```

---

## 5. Hooks

```typescript
// src/hooks/useSimulations.ts
export function useSimulations(options?: QueryOptions) {
  // React Query pour liste avec pagination
}

// src/hooks/useSimulation.ts
export function useSimulation(id: string) {
  // React Query pour détail
}

// src/hooks/useSimulationMutations.ts
export function useSimulationMutations() {
  // create, update, delete mutations
}
```

---

## 6. États UI

### Liste simulations

| État | Affichage |
|------|-----------|
| Loading | Skeleton cards |
| Empty | "Aucune simulation. Créez-en une !" + CTA |
| Error | Message erreur + Retry |
| Data | Liste des SimulationCard |

### Sauvegarde

| État | Affichage |
|------|-----------|
| Idle | Bouton "💾 Sauvegarder" |
| Modal open | Champ nom + description |
| Saving | Spinner + "Sauvegarde..." |
| Success | Toast "Simulation sauvegardée" |
| Error | Toast erreur |

---

## 7. Critères d'acceptation

### Sauvegarde
- [x] Bouton "Sauvegarder" sur page résultats
- [x] Modale avec champ nom (obligatoire) et description (optionnel)
- [x] Sauvegarde appelle l'API
- [x] Feedback utilisateur (toast)

### Liste
- [x] Page `/simulations` accessible
- [x] Liste paginée (20 par page) (Réalisé via TECH-024)
- [x] Tri par date/score/nom (Réalisé via TECH-024)
- [x] Filtre favoris (Réalisé via TECH-024)
- [x] Filtre archivés (Réalisé via TECH-024)

### Actions
- [x] Marquer/démarquer favori (Réalisé via TECH-024)
- [x] Archiver/désarchiver (Réalisé via TECH-024)
- [x] Renommer (Réalisé via TECH-024)
- [x] Supprimer (avec confirmation)

### Détail
- [x] Page `/simulations/[id]` affiche les résultats
- [x] Bouton recalculer
- [x] Bouton PDF

### UX
- [ ] États loading/error/empty gérés
- [ ] Responsive mobile
- [ ] Accessible

---

## 8. Dépendances

| Type | Dépendance |
|------|------------|
| Dépend de | TECH-020 (API CRUD), TECH-016 (PDF - optionnel) |

---

## 9. Estimation

| Métrique | Valeur |
|----------|--------|
| Points | 8 |
| Priorité | P2 |
| Risque | Moyen |

---

## 10. Maquettes

### Liste simulations

```
┌─────────────────────────────────────────────┐
│  Mes Simulations                    [+ New] │
├─────────────────────────────────────────────┤
│  Tri: [Date ▼]  Filtres: [☐ Favoris]        │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐    │
│  │ ⭐ Appart Lyon 3ème                 │    │
│  │    Score: 82/100  |  Renta: 7.2%    │    │
│  │    Créé le 04/02/2026               │    │
│  │    [Voir] [⋮]                       │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │    Studio Paris 18                   │    │
│  │    Score: 65/100  |  Renta: 5.1%    │    │
│  │    Créé le 03/02/2026               │    │
│  │    [Voir] [⋮]                       │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-02-04 | 1.0 | Création initiale | John (PM) |
