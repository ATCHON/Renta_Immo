-- Migration PERF-2026-04-26 : Optimisation index pour pagination keyset + ILIKE
--
-- Problèmes des index ARCH-S04 :
--   - Pas de colonne `id` dans les composites → tri secondaire keyset non couvert
--   - Pas de couverture pour is_archived = true
--   - Pas d'index sur `name` pour ILIKE search
--
-- Note : CONCURRENTLY interdit dans une migration Supabase (transaction implicite)

-- ============================================================
-- Remplacement des index partiels (sans id) par des composites keyset-compatibles
-- ============================================================

DROP INDEX IF EXISTS idx_simulations_user_created;
DROP INDEX IF EXISTS idx_simulations_user_updated;
DROP INDEX IF EXISTS idx_simulations_user_score;
DROP INDEX IF EXISTS idx_simulations_user_favorites;

-- Index principal : liste non-archivée triée par date de création
-- Couvre : WHERE user_id = $1 AND is_archived = false ORDER BY created_at DESC, id DESC
CREATE INDEX idx_simulations_list_created
  ON public.simulations (user_id, created_at DESC, id DESC)
  WHERE is_archived = false;

-- Index tri par score (non-archivé)
-- Couvre : WHERE user_id = $1 AND is_archived = false ORDER BY score_global DESC NULLS LAST, id DESC
CREATE INDEX idx_simulations_list_score
  ON public.simulations (user_id, score_global DESC NULLS LAST, id DESC)
  WHERE is_archived = false;

-- Index favoris (non-archivés)
-- Couvre : WHERE user_id = $1 AND is_favorite = true AND is_archived = false ORDER BY created_at DESC, id DESC
CREATE INDEX idx_simulations_list_favorites
  ON public.simulations (user_id, created_at DESC, id DESC)
  WHERE is_favorite = true AND is_archived = false;

-- Index archives
-- Couvre : WHERE user_id = $1 AND is_archived = true ORDER BY created_at DESC, id DESC
CREATE INDEX idx_simulations_list_archived
  ON public.simulations (user_id, created_at DESC, id DESC)
  WHERE is_archived = true;

-- ============================================================
-- Index trigram pour ILIKE search sur name
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_simulations_name_trgm
  ON public.simulations USING gin (name gin_trgm_ops);
