import { NextResponse } from 'next/server';
import { alertsService } from '@/server/admin/alerts-service';
import { requireAdmin } from '@/lib/auth-helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const alerts = await alertsService.getExpirationAlerts();
    return NextResponse.json({ success: true, data: alerts });
  } catch (error) {
    console.error('Erreur API Alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du chargement des alertes' },
      { status: 500 }
    );
  }
}
