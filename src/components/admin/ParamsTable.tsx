'use client';

import { ConfigParam } from '@/server/config/config-types';

interface ParamsTableProps {
  params: ConfigParam[];
  loading: boolean;
  onEdit: (param: ConfigParam) => void;
  onHistory: (param: ConfigParam) => void;
}

export default function ParamsTable({ params, loading, onEdit, onHistory }: ParamsTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Paramètre
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Clef
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">
                Valeur actuel
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Unité
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  Chargement...
                </td>
              </tr>
            ) : params.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  Aucun paramètre trouvé pour ce bloc.
                </td>
              </tr>
            ) : (
              params.map((param) => (
                <tr key={param.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">{param.label}</div>
                    {param.description && (
                      <div className="text-xs text-slate-500 max-w-xs">{param.description}</div>
                    )}
                    {param.isTemporary && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 mt-1">
                        Temporaire (Exp: {param.dateExpiration})
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">{param.cle}</td>
                  <td className="px-6 py-4 text-right font-semibold text-forest">
                    {param.unite === 'pourcentage'
                      ? `${(param.valeur * 100).toFixed(2)}%`
                      : param.valeur}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs px-2 py-1 bg-slate-100 rounded text-slate-600 uppercase font-medium">
                      {param.unite}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => onHistory(param)}
                        className="text-slate-500 hover:text-slate-700 font-medium text-sm"
                      >
                        Historique
                      </button>
                      <button
                        onClick={() => onEdit(param)}
                        className="text-forest hover:text-green-700 font-bold text-sm"
                      >
                        Modifier
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
