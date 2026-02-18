// src/app/admin/page.tsx
import ExpirationBanner from '@/components/admin/ExpirationBanner';

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-forest">Dashboard Administrateur</h1>

            <ExpirationBanner />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-semibold mb-2">Paramètres Réglementaires</h2>
                    <p className="text-slate-600 mb-4">
                        Gérez les taux de fiscalité, plafonds de déficit foncier et hypothèses de projection.
                    </p>
                    <a href="/admin/params" className="text-forest font-medium hover:underline">
                        Gérer les paramètres →
                    </a>
                </div>
                {/* Futurs blocs admin ici */}
            </div>
        </div>
    );
}
