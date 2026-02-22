import { createAdminClient } from '@/lib/supabase/server';
import { ConfigBloc } from '../config/config-types';

export interface GlobalAuditFilters {
  bloc?: ConfigBloc;
  cle?: string;
  adminId?: string;
}

export interface GlobalAuditLog {
  id: string;
  config_id: string;
  annee_fiscale: number;
  bloc: ConfigBloc;
  cle: string;
  ancienne_valeur: number;
  nouvelle_valeur: number;
  modifie_par: string;
  modifie_le: string;
  motif?: string;
  admin_email?: string;
  param_label?: string;
}

export interface PaginatedAuditResult {
  data: GlobalAuditLog[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

const AUDIT_PAGE_SIZE = 50;

export async function getGlobalAuditLogs(
  page: number = 1,
  filters?: GlobalAuditFilters
): Promise<PaginatedAuditResult> {
  const supabase = await createAdminClient();

  // 1. First query to get total count
  let countQuery = supabase.from('config_params_audit').select('*', { count: 'exact', head: true });

  if (filters?.bloc) {
    countQuery = countQuery.eq('bloc', filters.bloc);
  }
  if (filters?.cle) {
    countQuery = countQuery.eq('cle', filters.cle);
  }
  if (filters?.adminId) {
    countQuery = countQuery.eq('modifie_par', filters.adminId);
  }

  const { count, error: countError } = await countQuery;

  if (countError) {
    console.error('Error fetching audit count:', countError);
    throw new Error("Erreur lors du comptage des logs d'audit");
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / AUDIT_PAGE_SIZE);
  const from = (page - 1) * AUDIT_PAGE_SIZE;
  const to = from + AUDIT_PAGE_SIZE - 1;

  // 2. Fetch data (no joins directly supported on 'user' from this raw service unless defined via view or RPC, let's just fetch the data)
  // We can fetch user emails separately if needed, but for now we fetch the raw rows.
  let dataQuery = supabase
    .from('config_params_audit')
    .select('*')
    .order('modifie_le', { ascending: false })
    .range(from, to);

  if (filters?.bloc) {
    dataQuery = dataQuery.eq('bloc', filters.bloc);
  }
  if (filters?.cle) {
    dataQuery = dataQuery.eq('cle', filters.cle);
  }
  if (filters?.adminId) {
    dataQuery = dataQuery.eq('modifie_par', filters.adminId);
  }

  const { data: auditData, error: dataError } = await dataQuery;

  if (dataError) {
    console.error('Error fetching audit data:', dataError);
    throw new Error("Erreur lors de la récupération des logs d'audit");
  }

  // To get user emails and config labels, we might do separate fetches if the list is up to 50 items.
  // 3. Enrich data with labels and admin emails
  const enrichedData: GlobalAuditLog[] = [];

  if (auditData && auditData.length > 0) {
    // Unique config IDs
    const configIds = Array.from(new Set(auditData.map((log) => log.config_id)));
    const userIds = Array.from(new Set(auditData.map((log) => log.modifie_par)));

    // Fetch config params
    const { data: configs } = await supabase
      .from('config_params')
      .select('id, label')
      .in('id', configIds);

    // Fetch users (auth.users is not accessible directly via public. We assume `user` table mapping exists)
    // Based on the SQL schema: modifie_par TEXT NOT NULL REFERENCES "user"(id)
    const { data: users } = await supabase.from('user').select('id, email').in('id', userIds);

    for (const log of auditData) {
      const config = configs?.find((c) => c.id === log.config_id);
      const user = users?.find((u) => u.id === log.modifie_par);

      enrichedData.push({
        ...log,
        bloc: log.bloc as ConfigBloc,
        param_label: config?.label || log.cle, // Fallback to key if not found
        admin_email: user?.email || log.modifie_par,
      } as GlobalAuditLog);
    }
  }

  return {
    data: enrichedData,
    meta: {
      total,
      page,
      pageSize: AUDIT_PAGE_SIZE,
      totalPages,
    },
  };
}
