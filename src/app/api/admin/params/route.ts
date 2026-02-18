// src/app/api/admin/params/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { z } from 'zod';

const QuerySchema = z.object({
  anneeFiscale: z.coerce.number().optional(),
  bloc: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const { error: adminError } = await requireAdmin();
  if (adminError) return adminError;

  const { searchParams } = new URL(request.url);
  const validated = QuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!validated.success) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID_QUERY', details: validated.error.flatten() } },
      { status: 400 }
    );
  }

  const { anneeFiscale, bloc } = validated.data;
  const year = anneeFiscale ?? new Date().getFullYear();

  const supabase = await createAdminClient();
  let query = supabase
    .from('config_params')
    .select('*')
    .eq('annee_fiscale', year)
    .order('bloc', { ascending: true })
    .order('cle', { ascending: true });

  if (bloc) {
    query = query.eq('bloc', bloc);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 }
    );
  }

  const formattedData = (data || []).map((row: any) => ({
    ...row,
    isTemporary: row.is_temporary,
    dateExpiration: row.date_expiration,
  }));

  return NextResponse.json({ success: true, data: formattedData });
}
