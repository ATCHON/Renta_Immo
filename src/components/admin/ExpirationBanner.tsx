'use client';

import { useEffect, useState } from 'react';

interface ParamAlert {
    id: string;
    label: string;
    cle: string;
    dateExpiration: string;
    daysRemaining: number;
    severity: 'critical' | 'warning' | 'info';
}

export default function ExpirationBanner() {
    const [alerts, setAlerts] = useState<ParamAlert[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const res = await fetch('/api/admin/alerts');
                const json = await res.json();
                if (json.success) {
                    setAlerts(json.data);
                }
            } catch (err) {
                console.error('Erreur chargement alertes', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, []);

    if (loading || alerts.length === 0) return null;

    const critical = alerts.filter(a => a.severity === 'critical');
    const warning = alerts.filter(a => a.severity === 'warning');

    return (
        <div className="space-y-4 mb-8">
            {critical.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <span className="text-xl">🚨</span>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-red-800 font-bold">Attention : Paramètres expirants ({critical.length})</h3>
                            <div className="mt-1 text-sm text-red-700">
                                <ul className="list-disc list-inside">
                                    {critical.map(alert => (
                                        <li key={alert.id}>
                                            <span className="font-medium">{alert.label}</span> expire dans {alert.daysRemaining} jours (le {new Date(alert.dateExpiration).toLocaleDateString()})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {warning.length > 0 && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <span className="text-xl">⚠️</span>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-amber-800 font-bold">Avertissement : Bientôt à échéance ({warning.length})</h3>
                            <div className="mt-1 text-sm text-amber-700">
                                <ul className="list-disc list-inside">
                                    {warning.map(alert => (
                                        <li key={alert.id}>
                                            <span className="font-medium">{alert.label}</span> expire dans {alert.daysRemaining} jours
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
