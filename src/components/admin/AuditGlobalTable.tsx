'use client';

import { useState, useCallback, useEffect } from 'react';
import { GlobalAuditLog } from '@/server/admin/audit-service';
import { toast } from 'react-hot-toast';

export default function AuditGlobalTable() {
  const [logs, setLogs] = useState<GlobalAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = useCallback(async (p: number, abortSignal?: AbortSignal) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/audit?page=${p}`, { signal: abortSignal });

      // Si la requête est annulée pendant le fetch, elle passera dans le catch(AbortError)
      const json = await res.json();

      if (json.success) {
        setLogs(json.data);
        setTotalPages(json.meta.totalPages);
        setTotal(json.meta.total);
      } else {
        toast.error(json.error || 'Erreur lors du chargement des logs');
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Ignorer l'erreur silencieusement car c'est une requête obsolète
        return;
      }
      toast.error('Erreur réseau lors du chargement des logs');
    } finally {
      // On s'assure qu'on ne clean le loading State que si le fetch n'a pas été annulé en plein vol ?
      // L'approche simple :
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchLogs(page, controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchLogs, page]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Historique des modifications</h2>
          <p className="text-sm text-slate-500 mt-1">
            {total} modification(s) enregistrée(s) au total
          </p>
        </div>
        <button
          onClick={() => fetchLogs(page)}
          className="p-2 text-slate-400 hover:text-forest transition-colors rounded-lg hover:bg-slate-100"
          title="Rafraîchir"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6">Administrateur</th>
              <th className="py-4 px-6">Paramètre</th>
              <th className="py-4 px-6">Modification</th>
              <th className="py-4 px-6">Motif</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="flex justify-center items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-forest border-t-transparent rounded-full animate-spin"></div>
                    <span>Chargement de l&apos;audit...</span>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                  Aucun historique de modification trouvé.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-4 px-6 whitespace-nowrap text-slate-600 font-mono text-xs">
                    {new Date(log.modifie_le).toLocaleString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                      {log.admin_email || log.modifie_par}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-800">{log.param_label}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{log.cle}</div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500 line-through decoration-slate-300">
                        {log.ancienne_valeur}
                      </span>
                      <svg
                        className="w-4 h-4 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                      <span className="font-bold text-forest">{log.nouvelle_valeur}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-slate-600 max-w-xs truncate" title={log.motif}>
                      {log.motif || <span className="text-slate-400 italic">Non renseigné</span>}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Précédent
          </button>
          <span className="text-sm text-slate-600">
            Page <span className="font-bold">{page}</span> sur {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
