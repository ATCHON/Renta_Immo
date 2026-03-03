-- Migration ARCH-S04 : Index PostgreSQL composites pour la table simulations
-- Objectif : accélérer les requêtes filtrées par user_id avec tri et statut
-- Note : CONCURRENTLY interdit dans une migration Supabase (transaction implicite)

-- ============================================================
-- Suppression des index obsolètes (supersédés par les composites)
-- ============================================================

-- idx_simulations_user_id : simple, supersédé par les composites
DROP INDEX IF EXISTS idx_simulations_user_id;

-- idx_simulations_created : sans user_id, inefficace pour les requêtes filtrées
DROP INDEX IF EXISTS idx_simulations_created;

-- idx_simulations_favorites : partiel OK mais incomplet, remplacé par idx_simulations_user_favorites
DROP INDEX IF EXISTS idx_simulations_favorites;

-- ============================================================
-- Création des index composites optimisés
-- ============================================================

-- Index principal : liste utilisateur triée par date de création (cas 90% des requêtes)
-- Pattern couvert : WHERE user_id = $1 AND is_archived = false ORDER BY created_at DESC
CREATE INDEX idx_simulations_user_created
  ON public.simulations (user_id, created_at DESC)
  WHERE is_archived = false;

-- Index pour tri par dernière modification
-- Pattern couvert : WHERE user_id = $1 AND is_archived = false ORDER BY updated_at DESC
CREATE INDEX idx_simulations_user_updated
  ON public.simulations (user_id, updated_at DESC)
  WHERE is_archived = false;

-- Index pour tri par score global
-- Pattern couvert : WHERE user_id = $1 AND is_archived = false ORDER BY score_global DESC
CREATE INDEX idx_simulations_user_score
  ON public.simulations (user_id, score_global DESC)
  WHERE is_archived = false;

-- Index favoris (remplace idx_simulations_favorites avec tri)
-- Pattern couvert : WHERE user_id = $1 AND is_favorite = true AND is_archived = false
CREATE INDEX idx_simulations_user_favorites
  ON public.simulations (user_id, updated_at DESC)
  WHERE is_favorite = true AND is_archived = false;
