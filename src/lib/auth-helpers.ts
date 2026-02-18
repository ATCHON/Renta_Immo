// src/lib/auth-helpers.ts
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export type UserRole = 'user' | 'admin';

export interface SessionWithRole {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

/**
 * Récupère la session et le rôle de l'utilisateur.
 * Utile pour l'affichage conditionnel (ex: bouton admin).
 */
export async function getSessionWithRole(): Promise<SessionWithRole | null> {
  // BYPASS AUTH FOR DEV/TEST
  if (process.env.NODE_ENV === 'development') {
    const devId = process.env.DEV_ADMIN_ID;
    const devEmail = process.env.DEV_ADMIN_EMAIL;

    if (!devId || !devEmail) {
      console.warn(
        '⚠️ DEV_ADMIN_ID or DEV_ADMIN_EMAIL missing in .env.local. Dev auth bypass disabled.'
      );
      // Fallthrough to normal auth if config is missing, to avoid silent failure or security risk
    } else {
      return {
        user: {
          id: devId,
          email: devEmail,
          role: 'admin',
        },
      };
    }
  }

  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return null;
  }

  // Lire le rôle en base (pas dans le token JWT Better Auth par défaut)
  const supabase = await createAdminClient();
  const { data: userRow } = await supabase
    .from('user')
    .select('role')
    .eq('id', session.user.id)
    .single();

  const role = userRow?.role === 'admin' ? 'admin' : 'user';

  return {
    user: {
      ...session.user,
      role,
    },
  };
}

/**
 * Vérifie que la session est valide et que l'utilisateur est admin.
 * Retourne { session } ou { error: NextResponse } selon le cas.
 */
export async function requireAdmin(): Promise<
  { session: SessionWithRole; error: null } | { session: null; error: NextResponse }
> {
  const sessionWithRole = await getSessionWithRole();

  if (!sessionWithRole) {
    return {
      session: null,
      error: NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Non authentifié' } },
        { status: 401 }
      ),
    };
  }

  if (sessionWithRole.user.role !== 'admin') {
    return {
      session: null,
      error: NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Accès réservé aux administrateurs' },
        },
        { status: 403 }
      ),
    };
  }

  return {
    session: sessionWithRole,
    error: null,
  };
}
