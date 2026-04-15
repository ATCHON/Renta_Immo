import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { rateLimit, getClientIp, buildRateLimitHeaders } from '@/lib/rate-limit';

/**
 * POST /api/simulations/[id]/share
 * Génère (ou retourne) le token de partage de la simulation.
 * Auth requise + vérification ownership.
 *
 * DELETE /api/simulations/[id]/share
 * Révoque le partage (supprime le token).
 */

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(request);
  const rl = await rateLimit('simulations:share', ip);
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT', message: 'Trop de requêtes.' } },
      { status: 429, headers: buildRateLimitHeaders(rl) }
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createAdminClient();

  // Vérifier l'ownership
  const { data: simulation, error: fetchError } = await supabase
    .from('simulations')
    .select('id, share_token, is_shared')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .single();

  if (fetchError || !simulation) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
  }

  // Générer un token si absent, sinon réutiliser l'existant
  const shareToken: string = simulation.share_token ?? crypto.randomUUID();

  const { error: updateError } = await supabase
    .from('simulations')
    .update({ share_token: shareToken, is_shared: true })
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (updateError) {
    return NextResponse.json({ success: false, error: { code: 'DB_ERROR' } }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    data: { shareToken, sharePath: `/share/${shareToken}` },
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from('simulations')
    .update({ share_token: null, is_shared: false })
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'DB_ERROR' } }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
