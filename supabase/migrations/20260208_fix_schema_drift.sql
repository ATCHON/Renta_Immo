-- Fix schema drift for simulations table
-- Ensure user_id is TEXT and references user(id)
-- Idempotent : safe to run even if already applied in production

-- 1. Drop dependencies (IF EXISTS = no-op if already clean)
DROP INDEX IF EXISTS idx_simulations_user_id CASCADE;
DROP INDEX IF EXISTS idx_simulations_favorites CASCADE;
ALTER TABLE public.simulations DROP CONSTRAINT IF EXISTS simulations_user_id_fkey;

-- 2. Alter column type only if not already TEXT
DO $$ BEGIN
  IF (
    SELECT data_type FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'simulations'
      AND column_name  = 'user_id'
  ) <> 'text' THEN
    ALTER TABLE public.simulations ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
  END IF;
END $$;

-- 3. Recreate indexes (IF NOT EXISTS = no-op if already present)
CREATE INDEX IF NOT EXISTS idx_simulations_user_id ON public.simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_simulations_favorites ON public.simulations(user_id, is_favorite) WHERE is_favorite = TRUE;

-- 4. Re-add FK only if not already present
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'simulations_user_id_fkey'
      AND conrelid = 'public.simulations'::regclass
  ) THEN
    ALTER TABLE public.simulations ADD CONSTRAINT simulations_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. Enable RLS (idempotent by nature)
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
