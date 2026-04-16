-- Migration UX-S06 : Ajout du système de partage de simulation par token
-- Permet de partager une simulation via un lien public sans authentification

ALTER TABLE public.simulations
  ADD COLUMN IF NOT EXISTS share_token UUID UNIQUE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS is_shared BOOLEAN NOT NULL DEFAULT FALSE;

-- Index partiel sur share_token pour les lookups publics (uniquement les lignes partagées)
CREATE INDEX IF NOT EXISTS idx_simulations_share_token
  ON public.simulations(share_token)
  WHERE share_token IS NOT NULL;

COMMENT ON COLUMN public.simulations.share_token IS
  'Token UUID unique permettant un accès public en lecture seule. NULL si non partagé.';
COMMENT ON COLUMN public.simulations.is_shared IS
  'Indique si la simulation est activement partagée via son share_token.';
