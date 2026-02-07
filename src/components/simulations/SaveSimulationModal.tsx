'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSimulationMutations } from '@/hooks/useSimulationMutations';
import { logger } from '@/lib/logger';
import type { CalculateurFormData, CalculResultats } from '@/types/calculateur';

interface SaveSimulationModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: CalculateurFormData;
    resultats: CalculResultats;
}

export const SaveSimulationModal: React.FC<SaveSimulationModalProps> = ({
    isOpen,
    onClose,
    formData,
    resultats,
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const { createSimulation } = useSimulationMutations();
    const router = useRouter();

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!name.trim()) return;

        try {
            await createSimulation.mutateAsync({
                user_id: '',
                name: name.trim(),
                description: description.trim(),
                form_data: formData,
                resultats: resultats,
            });
            onClose();
            router.push('/simulations');
        } catch (error) {
            logger.error('Failed to save simulation:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Sauvegarder la simulation</h2>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="sim-name" className="block text-sm font-medium text-slate-700 mb-1">
                                Nom de la simulation *
                            </label>
                            <input
                                id="sim-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="ex: Appartement Lyon 3 - T2"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                autoFocus
                            />
                        </div>

                        <div>
                            <label htmlFor="sim-desc" className="block text-sm font-medium text-slate-700 mb-1">
                                Description (optionnel)
                            </label>
                            <textarea
                                id="sim-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Détails additionnels..."
                                rows={3}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!name.trim() || createSimulation.isPending}
                        className={`px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 active:transform active:scale-95 transition-all flex items-center gap-2 ${(!name.trim() || createSimulation.isPending) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {createSimulation.isPending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Sauvegarde...
                            </>
                        ) : (
                            'Sauvegarder'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
