'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { useHasHydrated } from '@/hooks/useHasHydrated';
import { Button } from '@/components/ui';
import { Plus, X, Edit2, Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Composant ScenarioTabs
 * Gère l'affichage et les actions sur les scénarios (onglets)
 */
export const ScenarioTabs: React.FC = () => {
    const {
        scenarios,
        activeScenarioId,
        switchScenario,
        addScenario,
        duplicateScenario,
        removeScenario,
        renameScenario
    } = useCalculateurStore();

    const hasHydrated = useHasHydrated();
    const router = useRouter();
    const pathname = usePathname();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    const handleStartRename = (e: React.MouseEvent, id: string, currentName: string) => {
        e.stopPropagation();
        setEditingId(id);
        setEditValue(currentName);
    };

    const handleSaveRename = (id: string) => {
        if (editValue.trim()) {
            renameScenario(id, editValue.trim());
        }
        setEditingId(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
        if (e.key === 'Enter') handleSaveRename(id);
        if (e.key === 'Escape') setEditingId(null);
    };

    const handleSwitch = (id: string) => {
        const target = scenarios.find(s => s.id === id);
        if (!target) return;

        switchScenario(id);

        // Redirection intelligente si on n'est pas déjà sur la bonne page
        if (target.status === 'success') {
            if (pathname !== '/calculateur/resultats') {
                router.push('/calculateur/resultats');
            }
        } else {
            if (pathname !== '/calculateur') {
                router.push('/calculateur');
            }
        }
    };

    const handleAdd = () => {
        addScenario();
        router.push('/calculateur');
    };

    const handleDuplicate = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        duplicateScenario(id);
        // On reste sur la page actuelle car le duplicata a le même status
    };

    if (!hasHydrated) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-border pb-2">
            <div className="flex flex-wrap items-center gap-1">
                {scenarios.map((scenario) => {
                    const isActive = scenario.id === activeScenarioId;
                    const isEditing = editingId === scenario.id;

                    return (
                        <div
                            key={scenario.id}
                            onClick={() => !isEditing && handleSwitch(scenario.id)}
                            role="tab"
                            aria-selected={isActive}
                            className={cn(
                                "group relative flex items-center gap-2 h-10 px-4 rounded-t-lg border-x border-t transition-all cursor-pointer select-none",
                                isActive
                                    ? "bg-white border-border border-b-white -mb-[9px] z-10 text-forest font-medium shadow-sm"
                                    : "bg-surface/50 border-transparent text-muted-foreground hover:bg-surface hover:text-foreground"
                            )}
                        >
                            {isEditing ? (
                                <div className="flex items-center gap-1">
                                    <input
                                        autoFocus
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={() => handleSaveRename(scenario.id)}
                                        onKeyDown={(e) => handleKeyDown(e, scenario.id)}
                                        className="w-32 bg-transparent border-none outline-none focus:ring-0 p-0 text-sm font-medium"
                                    />
                                    <Check className="w-3 h-3 text-sage shrink-0" />
                                </div>
                            ) : (
                                <>
                                    <span className="text-sm truncate max-w-[120px]">{scenario.name}</span>
                                    <div className={cn(
                                        "flex items-center gap-0.5 transition-opacity",
                                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                    )}>
                                        <button
                                            onClick={(e) => handleStartRename(e, scenario.id, scenario.name)}
                                            className="p-1 hover:bg-surface rounded-full text-muted-foreground/50 hover:text-forest transition-colors"
                                            title="Renommer"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={(e) => handleDuplicate(e, scenario.id)}
                                            className="p-1 hover:bg-surface rounded-full text-muted-foreground/50 hover:text-forest transition-colors"
                                            title="Dupliquer"
                                        >
                                            <Copy className="w-3 h-3" />
                                        </button>
                                        {scenarios.length > 1 && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm('Supprimer ce scénario ?')) {
                                                        removeScenario(scenario.id);
                                                    }
                                                }}
                                                className="p-1 hover:bg-terracotta/10 rounded-full text-muted-foreground/50 hover:text-terracotta transition-colors"
                                                title="Supprimer"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {scenarios.length < 3 && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAdd}
                    className="h-8 w-8 p-0 rounded-full border border-dashed border-border hover:border-forest hover:text-forest"
                    title="Ajouter un scénario"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            )}
        </div>
    );
};
