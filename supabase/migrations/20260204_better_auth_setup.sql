-- Migration: Setup Better Auth Tables and Update Simulations
-- Date: 2026-02-04

-- 1. Create Better Auth Tables
CREATE TABLE "user" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified BOOLEAN NOT NULL,
    image TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE "session" (
    id TEXT PRIMARY KEY,
    expires_at TIMESTAMPTZ NOT NULL,
    token TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE "account" (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    access_token TEXT,
    refresh_token TEXT,
    id_token TEXT,
    access_token_expires_at TIMESTAMPTZ,
    refresh_token_expires_at TIMESTAMPTZ,
    scope TEXT,
    password TEXT,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE "verification" (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

-- 2. Update Simulations Table
-- On change le type de user_id pour correspondre aux IDs Better Auth (TEXT)
-- Et on supprime la référence à auth.users

-- On retire d'abord la contrainte existante si elle existe
ALTER TABLE public.simulations DROP CONSTRAINT IF EXISTS simulations_user_id_fkey;

-- On change le type de la colonne (nécessite une conversion)
ALTER TABLE public.simulations ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- On ajoute la nouvelle référence vers notre table user
ALTER TABLE public.simulations ADD CONSTRAINT simulations_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;

-- 3. Update RLS for Better Auth
-- Les politiques existantes utilisaient auth.uid() qui vient de Supabase Auth.
-- Puisque nous gérons maintenant l'auth via Better Auth, nous activons RLS sans politique publique
-- ce qui empêche tout accès direct via la clé anon.
-- L'accès se fera uniquement via le Serveur (API Routes) utilisant le Service Role.

ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
