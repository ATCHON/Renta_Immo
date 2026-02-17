'use client';

import { useState, useEffect } from 'react';
import { ConfigParam } from '@/server/config/config-types';
import { toast } from 'react-hot-toast';

interface AuditHistoryModalProps {
    param: ConfigParam;
    onClose: () => void;
}

export default function AuditHistoryModal({ param, onClose }: AuditHistoryModalProps) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, [param]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/params/${param.id}/audit`);
            const json = await res.json();
            if (json.success) {
                setHistory(json.data);
            }
        } catch (err) {
            toast.error("Erreur chargement historique");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-forest">Historique d&apos;audit</h2>
                        <p className="text-slate-500 text-sm">{param.label} ({param.cle})</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-slate-400">Chargement de l&apos;historique...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 italic">Aucun changement enregistré pour ce paramètre.</div>
                    ) : (
                        history.map((h, i) => (
                            <div key={i} className="flex space-x-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-sm font-semibold text-slate-900">
                                            Evolution : {h.ancienne_valeur} → <span className="text-forest">{h.nouvelle_valeur}</span>
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">
                                            {new Date(h.modifie_le).toLocaleString('fr-FR')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 bg-white p-2 rounded border border-slate-100 italic">
                                        &ldquo;{h.motif || 'Aucun motif renseigné'}&rdquo;
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        disabled={loading}
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
