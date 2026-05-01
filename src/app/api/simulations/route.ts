import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { CalculResultats } from '@/types/calculateur';
import type { Json } from '@/types/database.types';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { logger } from '@/lib/logger';
import { rateLimit, getClientIp, buildRateLimitHeaders } from '@/lib/rate-limit';
import {
  encodeCursor,
  decodeCursor,
  type SimulationSort,
  type CursorPaginationMeta,
} from '@/types/simulations';

const CreateSimulationSchema = z.object({
  name: z.string().max(255).optional(),
  description: z.string().optional(),
  form_data: z.record(z.string(), z.unknown()),
  resultats: z.record(z.string(), z.unknown()),
});

// Whitelist colonnes de tri autorisées (Audit 1.2)
const ALLOWED_SORTS: SimulationSort[] = ['created_at', 'updated_at', 'score_global'];

// Safe integer parsing with bounds (Audit 1.8)
function safeInt(val: string | null, def: number, min: number, max: number): number {
  const num = parseInt(val || '', 10);
  return isNaN(num) || num < min ? def : Math.min(num, max);
}

export async function GET(request: NextRequest) {
  // Rate limiting: 60 req/60s par IP (CRUD léger)
  const ip = getClientIp(request);
  const rl = await rateLimit('simulations:get', ip);
  if (!rl.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT',
          message: 'Trop de requêtes. Réessayez dans quelques instants.',
        },
      },
      { status: 429, headers: buildRateLimitHeaders(rl) }
    );
  }

  const requestHeaders = await headers();
  const [session, supabase] = await Promise.all([
    auth.api.getSession({ headers: requestHeaders }),
    createAdminClient(),
  ]);

  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Non authentifié' } },
      { status: 401 }
    );
  }

  const { user } = session;

  const { searchParams } = new URL(request.url);

  const limit = safeInt(searchParams.get('limit'), 20, 1, 100);
  const cursorParam = searchParams.get('cursor');

  const rawSort = searchParams.get('sort') || '';
  const sort: SimulationSort = (ALLOWED_SORTS as string[]).includes(rawSort)
    ? (rawSort as SimulationSort)
    : 'created_at';

  const favoriteOnly = searchParams.get('favorite') === 'true';
  const showArchived = searchParams.get('archived') === 'true';

  // Escape LIKE wildcards (Audit 1.3)
  const rawSearch = searchParams.get('search');
  const search = rawSearch?.trim() ? rawSearch.trim().replace(/[%_\\]/g, '\\$&') : null;

  const listColumns =
    'id, name, description, created_at, updated_at, rentabilite_brute, rentabilite_nette, cashflow_mensuel, score_global, is_favorite, is_archived';

  let query = supabase.from('simulations').select(listColumns).eq('user_id', user.id);

  // Filtres stables (restent dans l'URL)
  if (showArchived) {
    query = query.eq('is_archived', true);
  } else {
    query = query.eq('is_archived', false);
  }

  if (favoriteOnly) {
    query = query.eq('is_favorite', true);
  }

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  // Keyset condition si cursor fourni
  if (cursorParam) {
    const cursor = decodeCursor(cursorParam);
    if (!cursor) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CURSOR', message: 'Curseur invalide' } },
        { status: 400 }
      );
    }

    // Appliquer la keyset condition selon le champ de tri
    if (sort === 'score_global') {
      if (cursor.value === null) {
        // cursor pointe sur une ligne avec score_global NULL → filtrer les NULLs restants par id
        // ORDER BY score_global DESC NULLS LAST, id DESC → parmi les NULLs, tri par id DESC
        query = query.is('score_global', null).lt('id', cursor.id);
      } else {
        // cursor pointe sur une ligne non-NULL → inclure également les lignes NULL (NULLS LAST)
        // sans ce branch, les lignes NULL seraient inaccessibles depuis la page suivante
        query = query.or(
          `score_global.lt.${cursor.value},and(score_global.eq.${cursor.value},id.lt.${cursor.id}),score_global.is.null`
        );
      }
    } else {
      // Colonnes timestamp (created_at, updated_at)
      query = query.or(
        `${sort}.lt.${cursor.value},and(${sort}.eq.${cursor.value},id.lt.${cursor.id})`
      );
    }
  }

  // Tri + limit+1 pour détecter has_more
  query = query
    .order(sort, { ascending: false, nullsFirst: false })
    .order('id', { ascending: false })
    .limit(limit + 1);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 }
    );
  }

  const rows = data ?? [];
  const has_more = rows.length > limit;
  const pageRows = has_more ? rows.slice(0, limit) : rows;

  // Construire le cursor de la page suivante à partir du dernier élément
  let next_cursor: string | null = null;
  if (has_more && pageRows.length > 0) {
    const last = pageRows[pageRows.length - 1];
    const rawValue =
      sort === 'score_global' ? last.score_global : last[sort as 'created_at' | 'updated_at'];
    // Encoder null explicitement pour score_global NULL (NULLS LAST) — sinon la page suivante est inaccessible
    const value = rawValue != null ? String(rawValue) : null;
    next_cursor = encodeCursor({ value, id: last.id, sort });
  }

  const meta: CursorPaginationMeta = {
    next_cursor,
    limit,
    has_more,
  };

  return NextResponse.json({
    success: true,
    data: pageRows,
    meta,
  });
}

export async function POST(request: NextRequest) {
  // Rate limiting: 20 req/60s par IP (écriture DB)
  const ip = getClientIp(request);
  const rl = await rateLimit('simulations:post', ip);
  if (!rl.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT',
          message: 'Trop de requêtes. Réessayez dans quelques instants.',
        },
      },
      { status: 429, headers: buildRateLimitHeaders(rl) }
    );
  }

  const requestHeaders = await headers();
  const [session, supabase] = await Promise.all([
    auth.api.getSession({ headers: requestHeaders }),
    createAdminClient(),
  ]);

  if (!session) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Non authentifié' } },
      { status: 401 }
    );
  }

  const { user } = session;

  try {
    const body = await request.json();
    const validated = CreateSimulationSchema.parse(body);

    const res = validated.resultats as unknown as Partial<CalculResultats>;

    const { data, error } = await supabase
      .from('simulations')
      .insert({
        user_id: user.id,
        name: validated.name || 'Simulation sans titre',
        description: validated.description,
        form_data: validated.form_data as unknown as Json,
        resultats: validated.resultats as unknown as Json,
        rentabilite_brute: res.rentabilite?.brute,
        rentabilite_nette: res.rentabilite?.nette,
        cashflow_mensuel: res.cashflow?.mensuel,
        score_global:
          res.synthese?.score_global != null ? Math.round(res.synthese.score_global) : null,
      })
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
    logger.error('API Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Erreur serveur' } },
      { status: 500 }
    );
  }
}
