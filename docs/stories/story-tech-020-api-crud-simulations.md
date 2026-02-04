# Story TECH-020 : API CRUD Simulations

> **Version** : 1.0
> **Date** : 2026-02-04
> **Auteur** : John (PM)
> **Statut** : 📋 Backlog
> **Type** : API
> **Epic** : Epic 1 - Infrastructure Backend (Phase 2)
> **Sprint** : Sprint 2

---

## 1. Description

**En tant que** frontend
**Je veux** des endpoints API pour gérer les simulations
**Afin de** permettre la sauvegarde et la récupération des simulations

---

## 2. Contexte

L'API CRUD permettra aux utilisateurs authentifiés de créer, lire, mettre à jour et supprimer leurs simulations. Les routes utilisent le client Supabase server-side.

---

## 3. Spécification API

### Base URL

```
/api/simulations
```

### Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/simulations` | Liste des simulations de l'utilisateur |
| GET | `/api/simulations/[id]` | Détail d'une simulation |
| POST | `/api/simulations` | Créer une simulation |
| PATCH | `/api/simulations/[id]` | Mettre à jour une simulation |
| DELETE | `/api/simulations/[id]` | Supprimer une simulation |

---

## 4. Détail des endpoints

### GET /api/simulations

**Query params :**
```typescript
{
  limit?: number;      // Défaut: 20, Max: 100
  offset?: number;     // Défaut: 0
  sort?: 'created_at' | 'updated_at' | 'score_global';
  order?: 'asc' | 'desc';  // Défaut: desc
  favorite?: boolean;  // Filtrer favoris
  archived?: boolean;  // Inclure archivés (défaut: false)
}
```

**Response :**
```typescript
{
  success: true,
  data: Simulation[],
  meta: {
    total: number,
    limit: number,
    offset: number
  }
}
```

### GET /api/simulations/[id]

**Response :**
```typescript
{
  success: true,
  data: Simulation
}
```

### POST /api/simulations

**Body :**
```typescript
{
  name?: string,
  description?: string,
  form_data: CalculateurFormData,
  resultats: CalculResultats
}
```

**Response :**
```typescript
{
  success: true,
  data: Simulation
}
```

### PATCH /api/simulations/[id]

**Body :**
```typescript
{
  name?: string,
  description?: string,
  is_favorite?: boolean,
  is_archived?: boolean
}
```

### DELETE /api/simulations/[id]

**Response :**
```typescript
{
  success: true,
  message: "Simulation supprimée"
}
```

---

## 5. Structure fichiers

```
src/app/api/simulations/
├── route.ts              # GET (list), POST (create)
└── [id]/
    └── route.ts          # GET (detail), PATCH, DELETE
```

---

## 6. Gestion des erreurs

| Code | Cas |
|------|-----|
| 401 | Non authentifié |
| 403 | Accès interdit (pas propriétaire) |
| 404 | Simulation non trouvée |
| 400 | Données invalides |
| 500 | Erreur serveur |

---

## 7. Critères d'acceptation

- [ ] Route `GET /api/simulations` (liste avec pagination)
- [ ] Route `GET /api/simulations/[id]` (détail)
- [ ] Route `POST /api/simulations` (création)
- [ ] Route `PATCH /api/simulations/[id]` (mise à jour)
- [ ] Route `DELETE /api/simulations/[id]` (suppression)
- [ ] Validation des données avec Zod
- [ ] Authentification requise sur toutes les routes
- [ ] RLS Supabase respecté
- [ ] Tests unitaires pour chaque route

---

## 8. Dépendances

| Type | Dépendance |
|------|------------|
| Dépend de | TECH-017, TECH-018, TECH-019 |
| Bloque | TECH-021 (Intégration UI) |

---

## 9. Estimation

| Métrique | Valeur |
|----------|--------|
| Points | 5 |
| Priorité | P2 |
| Risque | Moyen |

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-02-04 | 1.0 | Création initiale | John (PM) |
