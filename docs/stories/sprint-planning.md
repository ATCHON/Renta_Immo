# 🏃 Sprint Planning - Renta_Immo

> **Généré le** : 2026-02-04
> **Scrum Master** : Bob

---

## 📊 Résumé des Stories Analysées (TECH-010 à TECH-021)

| Story | Titre | Sprint Assigné | Points | Priorité |
|-------|-------|----------------|--------|----------|
| TECH-010 | Éliminer les types `any` | ❌ Aucun | 2 | P3 |
| TECH-011 | Warning ESLint StepAssocies | ❌ Aucun | 1 | P3 |
| TECH-012 | Benchmark performance API | ❌ Aucun | 2 | P4 |
| TECH-013 | Setup react-pdf | ✅ Sprint 1 | 2 | P2 |
| TECH-014 | Template rapport PDF | ✅ Sprint 1 | 5 | P2 |
| TECH-015 | Route /api/pdf | ✅ Sprint 1 | 3 | P2 |
| TECH-016 | Intégration UI PDF | ✅ Sprint 1 | 2 | P2 |
| TECH-017 | Setup Supabase | ✅ Sprint 2 | 1 | P2 |
| TECH-018 | Schéma BDD Simulations | ✅ Sprint 2 | 3 | P2 |
| TECH-019 | Client Supabase | ✅ Sprint 2 | 2 | P2 |
| TECH-020 | API CRUD Simulations | ✅ Sprint 2 | 5 | P2 |
| TECH-021 | Intégration UI Simulations | ✅ Sprint 2 | 8 | P2 |

---

## 🎯 Sprint 0 - Dette Technique (Backlog)

> Stories à faire "quand on a le temps" - pas de deadline fixe

| # | Story | Titre | Points | Type |
|---|-------|-------|--------|------|
| 1 | TECH-010 | Éliminer les types `any` | 2 | Dette |
| 2 | TECH-011 | Warning ESLint StepAssocies | 1 | Dette |
| 3 | TECH-012 | Benchmark performance API | 2 | Doc/QA |

**Total Sprint 0 : 5 points**

### 📝 Notes
- Ces stories n'ont pas de dépendances bloquantes
- Priorité faible (P3-P4) - à traiter en temps mort
- Peuvent être réalisées en parallèle du Sprint 1

---

## 🚀 Sprint 1 - Génération PDF

> **Objectif** : Permettre aux utilisateurs de télécharger un rapport PDF de leur simulation

| Ordre | Story | Titre | Points | Dépendances |
|-------|-------|-------|--------|-------------|
| 1 | TECH-013 | Setup react-pdf | 2 | - |
| 2 | TECH-014 | Template rapport PDF | 5 | TECH-013 |
| 3 | TECH-015 | Route /api/pdf | 3 | TECH-013, TECH-014 |
| 4 | TECH-016 | Intégration UI PDF | 2 | TECH-015 |

**Total Sprint 1 : 12 points**

### 🔗 Graphe de dépendances

```
TECH-013 (Setup react-pdf)
    │
    ├──► TECH-014 (Template PDF)
    │         │
    │         ▼
    └──► TECH-015 (Route /api/pdf)
              │
              ▼
         TECH-016 (UI PDF)
```

### ✅ Definition of Done Sprint 1
- [ ] Package `@react-pdf/renderer` installé et configuré
- [ ] Template PDF avec 4 pages (synthèse, bien, finance, HCSF)
- [ ] Endpoint `POST /api/pdf` fonctionnel
- [ ] Bouton "Télécharger PDF" sur page résultats
- [ ] PDF généré en < 2 secondes
- [ ] Tests manuels validés

---

## 📅 Sprint 2 - Persistance Supabase - 🏃 EN COURS

> **Objectif** : Permettre aux utilisateurs de sauvegarder et retrouver leurs simulations

| Ordre | Story | Titre | Points | Dépendances | Statut |
|-------|-------|-------|--------|-------------|--------|
| 1 | TECH-017 | Setup Supabase | 1 | - | ✅ Terminé |
| 2 | TECH-018 | Schéma BDD | 3 | TECH-017 | ✅ Terminé |
| 3 | TECH-019 | Client Supabase | 2 | TECH-017, TECH-018 | ✅ Terminé |
| 4 | TECH-020 | API CRUD Simulations | 5 | TECH-017, TECH-018, TECH-019 | ✅ Terminé |
| 5 | TECH-021 | Intégration UI Simulations | 8 | TECH-020 | ✅ Terminé |

**Total Sprint 2 : 19 points**

### 🔗 Graphe de dépendances

```
TECH-017 (Setup Supabase)
    │
    ├──► TECH-018 (Schéma BDD)
    │         │
    │         ├──► TECH-019 (Client Supabase)
    │         │         │
    │         └─────────┼──► TECH-020 (API CRUD)
    │                   │         │
    │                   │         ▼
    │                   └──► TECH-021 (UI Simulations)
    │
    └──► (optionnel) TECH-016 pour bouton PDF dans détail
```

---

## 📈 Vélocité Estimée

| Sprint | Points | Durée suggérée |
|--------|--------|----------------|
| Sprint 0 | 5 | Ongoing |
| Sprint 1 | 12 | 1 semaine |
| Sprint 2 | 19 | 2 semaines |

---

## ⚠️ Risques Identifiés

| Story | Risque | Mitigation |
|-------|--------|------------|
| TECH-013 | Compatibilité App Router | Tester early avec Server Components |
| TECH-015 | Performance génération PDF | Benchmark < 2s, optimiser si besoin |
| TECH-017 | Config Supabase | Suivre doc officielle Next.js |
| TECH-020 | RLS Supabase | Tester tous les cas d'accès |
| TECH-021 | Complexité UI (8 pts) | Découper si nécessaire |

---

## 🎬 Actions Recommandées

1. **Commencer Sprint 1** avec TECH-013 (setup react-pdf)
2. **Traiter Sprint 0 en parallèle** si temps disponible
3. **Planifier Sprint 2** après validation Sprint 1
