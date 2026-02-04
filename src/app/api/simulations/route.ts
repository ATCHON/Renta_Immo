import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

const CreateSimulationSchema = z.object({
    name: z.string().max(255).optional(),
    description: z.string().optional(),
    form_data: z.any(),
    resultats: z.any(),
});

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json(
            { success: false, error: { code: 'UNAUTHORIZED', message: 'Non authentifié' } },
            { status: 401 }
        );
    }

    const { user } = session;
    const supabase = await createAdminClient();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') === 'asc';
    const favoriteOnly = searchParams.get('favorite') === 'true';
    const includeArchived = searchParams.get('archived') === 'true';

    let query = supabase
        .from('simulations')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order(sortBy, { ascending: order })
        .range(offset, offset + limit - 1);

    if (favoriteOnly) {
        query = query.eq('is_favorite', true);
    }
    if (!includeArchived) {
        query = query.eq('is_archived', false);
    }

    const { data, error, count } = await query;

    if (error) {
        return NextResponse.json(
            { success: false, error: { code: 'DB_ERROR', message: error.message } },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        data,
        meta: { total: count, limit, offset },
    });
}

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        return NextResponse.json(
            { success: false, error: { code: 'UNAUTHORIZED', message: 'Non authentifié' } },
            { status: 401 }
        );
    }

    const { user } = session;
    const supabase = await createAdminClient();

    try {
        const body = await request.json();
        const validated = CreateSimulationSchema.parse(body);

        const resultats = validated.resultats as any;

        const { data, error } = await supabase
            .from('simulations')
            .insert({
                user_id: user.id,
                name: validated.name || 'Simulation sans titre',
                description: validated.description,
                form_data: validated.form_data,
                resultats: validated.resultats,
                rentabilite_brute: resultats.rentabilite?.brute,
                rentabilite_nette: resultats.rentabilite?.nette,
                cashflow_mensuel: resultats.cashflow?.mensuel,
                score_global: resultats.synthese?.score_global,
            } as any)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, data }, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: { code: 'VALIDATION_ERROR', details: error.flatten() } },
                { status: 400 }
            );
        }
        console.error('API Error:', error);
        return NextResponse.json(
            { success: false, error: { code: 'SERVER_ERROR', message: 'Erreur serveur' } },
            { status: 500 }
        );
    }
}
