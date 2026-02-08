'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SaveSimulationModal } from './SaveSimulationModal';
import { authClient } from '@/lib/auth-client';
import type { CalculateurFormData, CalculResultats } from '@/types/calculateur';

interface SaveSimulationButtonProps {
    formData: CalculateurFormData;
    resultats: CalculResultats;
}

export const SaveSimulationButton: React.FC<SaveSimulationButtonProps> = ({
    formData,
    resultats,
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: session, isPending } = authClient.useSession();

    if (isPending) return null;

    if (!session) {
        return (
            <Link
                href="/auth/login?redirect=/calculateur/resultats"
                className="flex items-center gap-2 px-6 py-2.5 bg-forest text-white font-semibold rounded-xl shadow-lg hover:bg-forest-dark hover:shadow-forest/20 active:transform active:scale-95 transition-all text-sm sm:text-base"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Se connecter pour sauvegarder
            </Link>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 bg-forest text-white font-semibold rounded-xl shadow-lg hover:bg-forest-dark hover:shadow-forest/20 active:transform active:scale-95 transition-all text-sm sm:text-base"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Sauvegarder la simulation
            </button>

            <SaveSimulationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formData={formData}
                resultats={resultats}
            />
        </>
    );
};
