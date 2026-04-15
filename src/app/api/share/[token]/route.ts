import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { rateLimit, getClientIp, buildRateLimitHeaders } from '@/lib/rate-limit';

/**
 * GET /api/share/[token]
 * Accès public — aucune authentification requise.
 * Retourne les données d'une simulation partagée sans exposer user_id.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const ip = getClientIp(request);
  const rl = await rateLimit('share:read', ip);
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT', message: 'Trop de requêtes.' } },
      { status: 429, headers: buildRateLimitHeaders(rl) }
    );
  }

  const { token } = await params;

  // Validation basique du format UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(token)) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
  }

  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('simulations')
    .select('id, name, description, form_data, resultats, created_at')
    .eq('share_token', token)
    .eq('is_shared', true)
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}
