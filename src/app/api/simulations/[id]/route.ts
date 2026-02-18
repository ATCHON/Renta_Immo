import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { CalculResultats } from '@/types/calculateur';
import type { Json, TablesUpdate } from '@/types/database.types';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

const UpdateSimulationSchema = z.object({
  name: z.string().max(255).optional(),
  description: z.string().optional(),
  is_favorite: z.boolean().optional(),
  is_archived: z.boolean().optional(),
  form_data: z.record(z.string(), z.unknown()).optional(),
  resultats: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const ip = getClientIp(request);
  const rl = rateLimit(`simulations:${ip}`, { limit: 30, window: 60_000 });
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT', message: 'Trop de requêtes.' } },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
      }
    );
  }

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const { user } = session;
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('simulations')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND' } }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: { code: 'DB_ERROR' } }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const { user } = session;
  const supabase = await createAdminClient();

  try {
    const body = await request.json();
    const validated = UpdateSimulationSchema.parse(body);

    const updateData: TablesUpdate<'simulations'> = {
      name: validated.name,
      description: validated.description,
      is_favorite: validated.is_favorite,
      is_archived: validated.is_archived,
      form_data: validated.form_data as unknown as Json,
      resultats: validated.resultats as unknown as Json,
    };

    // Update denormalized fields if resultats is provided
    if (validated.resultats) {
      const res = validated.resultats as unknown as Partial<CalculResultats>;
      updateData.rentabilite_brute = res.rentabilite?.brute;
      updateData.rentabilite_nette = res.rentabilite?.nette;
      updateData.cashflow_mensuel = res.cashflow?.mensuel;
      updateData.score_global = res.synthese?.score_global;
    }

    const { data, error } = await supabase
      .from('simulations')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR' } },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR' } }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 });
  }

  const { user } = session;
  const supabase = await createAdminClient();

  const { error } = await supabase
    .from('simulations')
    .delete()
    .eq('id', params.id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ success: false, error: { code: 'DB_ERROR' } }, { status: 500 });
  }

  return NextResponse.json({ success: true, message: 'Simulation supprimée' });
}
