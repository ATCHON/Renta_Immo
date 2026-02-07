-- Migration: Fix broken RLS policies after Better Auth migration
-- Date: 2026-02-07
-- Audit: Item 1.1 CRITIQUE - RLS policies reference auth.uid() which no longer works

-- 1. Drop old broken policies that reference auth.uid()
DROP POLICY IF EXISTS "Users can view own simulations" ON public.simulations;
DROP POLICY IF EXISTS "Users can insert own simulations" ON public.simulations;
DROP POLICY IF EXISTS "Users can update own simulations" ON public.simulations;
DROP POLICY IF EXISTS "Users can delete own simulations" ON public.simulations;

-- 2. Ensure RLS is still enabled (defense-in-depth)
-- INTENTIONAL: RLS enabled with NO policies = service-role only access.
-- All API routes use createAdminClient() which uses the service_role key (bypasses RLS).
-- No client-side Supabase calls exist that rely on anon/authenticated access.
-- This is the safest default until proper user-scoped policies are implemented in Phase 2.
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

-- 3. Also enable RLS on Better Auth tables to protect against anon key leaks
-- These tables are managed exclusively by Better Auth server-side via service_role key.
ALTER TABLE public."user" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."verification" ENABLE ROW LEVEL SECURITY;

-- 4. Add composite indexes for common query patterns (Audit 4.3)
CREATE INDEX IF NOT EXISTS idx_simulations_user_archived
  ON public.simulations(user_id, is_archived, created_at DESC);
