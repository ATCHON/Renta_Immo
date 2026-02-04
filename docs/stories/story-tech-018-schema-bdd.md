# Story TECH-018 : Schéma BDD Simulations

> **Version** : 1.0
> **Date** : 2026-02-04
> **Auteur** : John (PM)
> **Statut** : 📋 Backlog
> **Type** : Infrastructure
> **Epic** : Epic 1 - Infrastructure Backend (Phase 2)
> **Sprint** : Sprint 2

---

## 1. Description

**En tant que** développeur
**Je veux** définir le schéma de la table `simulations`
**Afin de** persister les simulations des utilisateurs

---

## 2. Contexte

La table `simulations` stockera toutes les simulations effectuées par les utilisateurs, avec leurs paramètres d'entrée et résultats calculés.

---

## 3. Schéma de la table

### Table : `simulations`

```sql
CREATE TABLE simulations (
  -- Identifiants
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Métadonnées
  name VARCHAR(255) NOT NULL DEFAULT 'Simulation sans titre',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Données de simulation (JSONB pour flexibilité)
  form_data JSONB NOT NULL,
  resultats JSONB NOT NULL,

  -- Indicateurs clés (dénormalisés pour requêtes/filtres)
  rentabilite_brute DECIMAL(5,2),
  rentabilite_nette DECIMAL(5,2),
  cashflow_mensuel DECIMAL(10,2),
  score_global INTEGER,

  -- Statut
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,

  -- Contraintes
  CONSTRAINT valid_score CHECK (score_global >= 0 AND score_global <= 100)
);

-- Index pour performance
CREATE INDEX idx_simulations_user_id ON simulations(user_id);
CREATE INDEX idx_simulations_created_at ON simulations(created_at DESC);
CREATE INDEX idx_simulations_is_favorite ON simulations(user_id, is_favorite) WHERE is_favorite = TRUE;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER simulations_updated_at
  BEFORE UPDATE ON simulations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### Row Level Security (RLS)

```sql
-- Activer RLS
ALTER TABLE simulations ENABLE ROW LEVEL SECURITY;

-- Politique : users can only see their own simulations
CREATE POLICY "Users can view own simulations"
  ON simulations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulations"
  ON simulations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own simulations"
  ON simulations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulations"
  ON simulations FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 4. Types TypeScript

```typescript
// src/types/database.ts

export interface Simulation {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  form_data: CalculateurFormData;
  resultats: CalculResultats;
  rentabilite_brute: number | null;
  rentabilite_nette: number | null;
  cashflow_mensuel: number | null;
  score_global: number | null;
  is_favorite: boolean;
  is_archived: boolean;
}

export interface SimulationInsert {
  name?: string;
  description?: string;
  form_data: CalculateurFormData;
  resultats: CalculResultats;
  rentabilite_brute?: number;
  rentabilite_nette?: number;
  cashflow_mensuel?: number;
  score_global?: number;
  is_favorite?: boolean;
}

export interface SimulationUpdate {
  name?: string;
  description?: string;
  is_favorite?: boolean;
  is_archived?: boolean;
}
```

---

## 5. Migration Supabase

Créer le fichier de migration :

```
supabase/migrations/
└── 20260204_create_simulations_table.sql
```

---

## 6. Critères d'acceptation

- [ ] Table `simulations` créée dans Supabase
- [ ] Index créés pour performance
- [ ] RLS activé et politiques configurées
- [ ] Types TypeScript définis dans `src/types/database.ts`
- [ ] Migration documentée
- [ ] Test insertion/lecture via Supabase dashboard

---

## 7. Dépendances

| Type | Dépendance |
|------|------------|
| Dépend de | TECH-017 (Setup Supabase) |
| Bloque | TECH-019, TECH-020, TECH-021 |

---

## 8. Estimation

| Métrique | Valeur |
|----------|--------|
| Points | 3 |
| Priorité | P2 |
| Risque | Faible |

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-02-04 | 1.0 | Création initiale | John (PM) |
