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
 * Vérifie que la session est valide et que l'utilisateur est admin.
 * Retourne { session } ou { error: NextResponse } selon le cas.
 */
export async function requireAdmin(): Promise<
    { session: SessionWithRole; error: null } | { session: null; error: NextResponse }
> {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        return {
            session: null,
            error: NextResponse.json(
                { success: false, error: { code: 'UNAUTHORIZED', message: 'Non authentifié' } },
                { status: 401 }
            ),
        };
    }

    // Lire le rôle en base (pas dans le token JWT Better Auth par défaut)
    const supabase = await createAdminClient();
    const { data: userRow } = await supabase
        .from('user')
        .select('role')
        .eq('id', session.user.id)
        .single();

    if (userRow?.role !== 'admin') {
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
        session: { user: { ...session.user, role: 'admin' } },
        error: null,
    };
}
