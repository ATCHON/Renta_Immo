'use client';

import { useState } from 'react';
import { ConfigParam } from '@/server/config/config-types';
import { toast } from 'react-hot-toast';
import DryRunPanel from './DryRunPanel';

interface EditParamModalProps {
  param: ConfigParam;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditParamModal({ param, onClose, onSuccess }: EditParamModalProps) {
  const [newValue, setNewValue] = useState<number>(param.valeur);
  const [motif, setMotif] = useState('');
  const [saving, setSaving] = useState(false);

  const handleUpdate = async () => {
    if (motif.length < 5) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/params/${param.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valeur: newValue, motif }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Paramètre mis à jour');
        onSuccess();
      } else {
        toast.error(json.error.message || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      toast.error('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-forest mb-2">Modifier le paramètre</h2>
        <p className="text-slate-500 text-sm mb-6">{param.label}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nouvelle valeur ({param.unite})
            </label>
            <input
              type="number"
              step="0.0001"
              value={newValue}
              onChange={(e) => setNewValue(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Motif du changement (obligatoire)
            </label>
            <textarea
              value={motif}
              onChange={(e) => setMotif(e.target.value)}
              placeholder="Ex: Mise à jour annuelle Loi de Finances..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-forest/20 transition-all"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Min. 5 caractères. Ce motif sera enregistré dans l&apos;historique d&apos;audit.
            </p>
          </div>

          <DryRunPanel param={param} newValue={newValue} />
        </div>

        <div className="flex space-x-3 mt-8 pt-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-slate-200 rounded-xl font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            disabled={saving}
          >
            Annuler
          </button>
          <button
            onClick={handleUpdate}
            disabled={saving || motif.length < 5}
            className="flex-1 py-3 bg-forest text-white rounded-xl font-bold hover:bg-green-700 shadow-md shadow-forest/20 disabled:opacity-50 transition-all"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
