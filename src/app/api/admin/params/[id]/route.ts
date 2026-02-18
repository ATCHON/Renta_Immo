// src/app/api/admin/params/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { z } from 'zod';
import { configService } from '@/server/config/config-service';

const UpdateParamSchema = z.object({
  valeur: z.number(),
  motif: z.string().min(5, 'Le motif doit faire au moins 5 caractères'),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { session, error: adminError } = await requireAdmin();
  if (adminError) return adminError;

  try {
    const body = await request.json();
    const validated = UpdateParamSchema.parse(body);
    const { id } = params;

    const supabase = await createAdminClient();

    // 1. Récupérer l'ancienne valeur pour l'audit
    const { data: oldParam, error: fetchError } = await supabase
      .from('config_params')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !oldParam) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Paramètre non trouvé' } },
        { status: 404 }
      );
    }

    // 2. Mise à jour atomique avec audit (via transaction ou série d'appels)
    // Ici on fait deux appels car RLS/Triggers gèrent déjà une partie, mais on veut l'audit explicite.

    // Note: Dans un environnement de production réel, on utiliserait une fonction RPC
    // pour garantir l'atomicité de l'update + insert audit.

    const { error: updateError } = await supabase
      .from('config_params')
      .update({ valeur: validated.valeur })
      .eq('id', id);

    if (updateError) throw updateError;

    // 3. Enregistrer l'audit
    const { error: auditError } = await supabase.from('config_params_audit').insert({
      config_id: id,
      annee_fiscale: oldParam.annee_fiscale,
      bloc: oldParam.bloc,
      cle: oldParam.cle,
      ancienne_valeur: oldParam.valeur,
      nouvelle_valeur: validated.valeur,
      modifie_par: session.user.id,
      motif: validated.motif,
    });

    if (auditError) console.error('Erreur audit ignoree:', auditError);

    // 4. Invalider le cache du ConfigService
    configService.invalidateCache(oldParam.annee_fiscale);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', details: error.flatten() } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Erreur lors de la mise à jour' } },
      { status: 500 }
    );
  }
}
