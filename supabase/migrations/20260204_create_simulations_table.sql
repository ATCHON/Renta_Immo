-- supabase/migrations/20260204_create_simulations_table.sql

-- Extension UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table simulations
CREATE TABLE public.simulations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL DEFAULT 'Simulation sans titre',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  form_data JSONB NOT NULL,
  resultats JSONB NOT NULL,
  rentabilite_brute DECIMAL(5,2),
  rentabilite_nette DECIMAL(5,2),
  cashflow_mensuel DECIMAL(10,2),
  score_global INTEGER CHECK (score_global >= 0 AND score_global <= 100),
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE
);

-- Index
CREATE INDEX idx_simulations_user_id ON public.simulations(user_id);
CREATE INDEX idx_simulations_created ON public.simulations(created_at DESC);
CREATE INDEX idx_simulations_favorites ON public.simulations(user_id, is_favorite)
  WHERE is_favorite = TRUE;

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER simulations_updated_at
  BEFORE UPDATE ON public.simulations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

-- Note: No public policies. Access via Service Role only (Better Auth).
