// src/app/admin/params/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { ConfigBloc, ConfigParam } from '@/server/config/config-types';
import { toast } from 'react-hot-toast';
import ParamsTable from '@/components/admin/ParamsTable';
import EditParamModal from '@/components/admin/EditParamModal';
import AuditHistoryModal from '@/components/admin/AuditHistoryModal';

const BLOCS: { id: ConfigBloc; label: string }[] = [
  { id: 'fiscalite', label: 'Fiscalité' },
  { id: 'foncier', label: 'Foncier' },
  { id: 'plus_value', label: 'Plus-Value' },
  { id: 'hcsf', label: 'HCSF' },
  { id: 'dpe', label: 'DPE' },
  { id: 'lmp_scoring', label: 'Scoring' },
  { id: 'charges', label: 'Charges' },
  { id: 'projections', label: 'Projections' },
];

export default function ParamsManagement() {
  const [activeBloc, setActiveBloc] = useState<ConfigBloc>('fiscalite');
  const [anneeFiscale, setAnneeFiscale] = useState(new Date().getFullYear());
  const [params, setParams] = useState<ConfigParam[]>([]);
  const [loading, setLoading] = useState(true);

  // UI States
  const [editingParam, setEditingParam] = useState<ConfigParam | null>(null);
  const [viewingHistory, setViewingHistory] = useState<ConfigParam | null>(null);

  useEffect(() => {
    fetchParams();
  }, [activeBloc, anneeFiscale]);

  const fetchParams = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/params?anneeFiscale=${anneeFiscale}&bloc=${activeBloc}`);
      const json = await res.json();
      if (json.success) {
        setParams(json.data);
      }
    } catch (err) {
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-forest">Gestion des Paramètres</h1>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Année fiscale :</label>
          <select
            value={anneeFiscale}
            onChange={(e) => setAnneeFiscale(Number(e.target.value))}
            className="border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-forest/20"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
      </div>

      <div className="flex space-x-1 border-b border-slate-200 overflow-x-auto pb-px scrollbar-hide">
        {BLOCS.map((bloc) => (
          <button
            key={bloc.id}
            onClick={() => setActiveBloc(bloc.id)}
            className={`px-4 py-2 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
              activeBloc === bloc.id
                ? 'border-forest text-forest bg-forest/5'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            {bloc.label}
          </button>
        ))}
      </div>

      <ParamsTable
        params={params}
        loading={loading}
        onEdit={setEditingParam}
        onHistory={setViewingHistory}
      />

      {/* Modal Edition */}
      {editingParam && (
        <EditParamModal
          param={editingParam}
          onClose={() => setEditingParam(null)}
          onSuccess={() => {
            setEditingParam(null);
            fetchParams();
          }}
        />
      )}

      {/* Modal Historique */}
      {viewingHistory && (
        <AuditHistoryModal param={viewingHistory} onClose={() => setViewingHistory(null)} />
      )}
    </div>
  );
}
