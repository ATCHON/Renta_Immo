// src/app/api/admin/params/[id]/audit/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error: adminError } = await requireAdmin();
  if (adminError) return adminError;

  const { id } = await params;
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('config_params_audit')
    .select('*')
    .eq('config_id', id)
    .order('modifie_le', { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}
