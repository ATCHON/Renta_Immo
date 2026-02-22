import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { getGlobalAuditLogs, GlobalAuditFilters } from '@/server/admin/audit-service';
import { ConfigBloc } from '@/server/config/config-types';

export async function GET(request: NextRequest) {
  const { error: adminError } = await requireAdmin();
  if (adminError) return adminError;

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const bloc = searchParams.get('bloc') as ConfigBloc | null;
  const cle = searchParams.get('cle');
  const adminId = searchParams.get('adminId');

  const filters: GlobalAuditFilters = {};
  if (bloc) filters.bloc = bloc;
  if (cle) filters.cle = cle;
  if (adminId) filters.adminId = adminId;

  try {
    const result = await getGlobalAuditLogs(page, filters);
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('API Audit Error:', error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des logs d'audit" },
      { status: 500 }
    );
  }
}
