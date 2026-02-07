-- Migration: Setup Better Auth Tables and Update Simulations
-- Date: 2026-02-04

-- 1. Create Better Auth Tables
CREATE TABLE "user" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    "emailVerified" BOOLEAN NOT NULL,
    image TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL
);

CREATE TABLE "session" (
    id TEXT PRIMARY KEY,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    token TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE "account" (
    id TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMPTZ,
    "refreshTokenExpiresAt" TIMESTAMPTZ,
    scope TEXT,
    password TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL
);

CREATE TABLE "verification" (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL,
    "updatedAt" TIMESTAMPTZ NOT NULL
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
