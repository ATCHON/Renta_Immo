'use client';

import React, { useState } from 'react';
import type { Simulation } from '@/types/database';
import { RenameSimulationModal } from './RenameSimulationModal';
import { Pencil, Archive, Trash2, Star, ArchiveRestore } from 'lucide-react';

interface SimulationActionsProps {
    simulation: Simulation;
    onDelete?: (id: string) => void;
    onToggleFavorite?: (id: string, isFavorite: boolean) => void;
    onRename?: (id: string, newName: string) => Promise<void>;
    onToggleArchive?: (id: string, isArchived: boolean) => Promise<void>;
}

export const SimulationActions: React.FC<SimulationActionsProps> = ({
    simulation,
    onDelete,
    onToggleFavorite,
    onRename,
    onToggleArchive,
}) => {
    const [isRenameOpen, setIsRenameOpen] = useState(false);

    const handleAction = (callback: () => void | Promise<void>) => async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        await callback();
    };

    const handleDelete = handleAction(() => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette simulation ?')) {
            onDelete?.(simulation.id);
        }
    });

    const handleFavorite = handleAction(() => {
        onToggleFavorite?.(simulation.id, !simulation.is_favorite);
    });

    const handleArchive = handleAction(async () => {
        await onToggleArchive?.(simulation.id, !simulation.is_archived);
    });

    const handleRenameClick = handleAction(() => {
        setIsRenameOpen(true);
    });

    const handleRenameSubmit = async (newName: string) => {
        if (onRename) {
            await onRename(simulation.id, newName);
        }
    };

    return (
        <div className="relative flex items-center gap-1">
            {/* Favorite */}
            <button
                onClick={handleFavorite}
                className={`p-2 rounded-lg transition-colors ${simulation.is_favorite
                    ? 'text-amber-400 bg-amber-50 hover:bg-amber-100'
                    : 'text-slate-300 hover:text-amber-400 hover:bg-slate-50'
                    }`}
                title={simulation.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
                <Star className={`w-5 h-5 ${simulation.is_favorite ? 'fill-current' : ''}`} />
            </button>

            {/* Rename */}
            <button
                onClick={handleRenameClick}
                className="p-2 hover:bg-forest/5 rounded-lg text-slate-300 hover:text-forest transition-colors"
                title="Renommer"
            >
                <Pencil className="w-5 h-5" />
            </button>

            {/* Archive */}
            <button
                onClick={handleArchive}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-300 hover:text-slate-600 transition-colors"
                title={simulation.is_archived ? "Désarchiver" : "Archiver"}
            >
                {simulation.is_archived ? <ArchiveRestore className="w-5 h-5" /> : <Archive className="w-5 h-5" />}
            </button>

            {/* Delete */}
            <button
                onClick={handleDelete}
                className="p-2 hover:bg-rose-50 rounded-lg text-slate-300 hover:text-rose-600 transition-colors"
                title="Supprimer"
            >
                <Trash2 className="w-5 h-5" />
            </button>

            <RenameSimulationModal
                isOpen={isRenameOpen}
                onClose={() => setIsRenameOpen(false)}
                onRename={handleRenameSubmit}
                currentName={simulation.name}
            />
        </div>
    );
};
