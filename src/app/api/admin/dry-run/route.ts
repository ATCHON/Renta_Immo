import { NextResponse } from 'next/server';
import { dryRunService } from '@/server/admin/dry-run-service';
import { requireAdmin } from '@/lib/auth-helpers';

export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    const { cle, valeur } = body;

    if (!cle || valeur === undefined) {
      return NextResponse.json(
        { success: false, error: 'Paramètres manquants (cle, valeur)' },
        { status: 400 }
      );
    }

    const results = await dryRunService.simulateChange(cle, Number(valeur));

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error('Erreur API DryRun:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la simulation' },
      { status: 500 }
    );
  }
}
