import { useState, useEffect } from 'react';

/**
 * Hook pour vérifier si le composant a été hydraté côté client.
 * Utile pour éviter les erreurs d'hydratation avec Zustand persist.
 */
export function useHasHydrated() {
    const [hasHydrated, setHasHydrated] = useState(false);

    useEffect(() => {
        setHasHydrated(true);
    }, []);

    return hasHydrated;
}
