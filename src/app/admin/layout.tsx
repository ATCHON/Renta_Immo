// src/app/admin/layout.tsx
import { requireAdmin } from '@/lib/auth-helpers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { session, error } = await requireAdmin();

    if (error || !session) {
        redirect('/'); // Rediriger si non admin
    }

    return (
        <div className="flex flex-col min-h-screen">
            <div className="bg-forest text-white py-4 px-6 flex justify-between items-center shadow-lg">
                <div className="flex items-center space-x-4">
                    <Link href="/admin" className="text-xl font-bold tracking-tight">
                        Administration
                    </Link>
                    <nav className="flex space-x-6 ml-10">
                        <Link href="/admin/params" className="hover:text-mint transition-colors">
                            Paramètres
                        </Link>
                        <Link href="/admin/audit" className="hover:text-mint transition-colors opacity-50 cursor-not-allowed">
                            Audit Global
                        </Link>
                    </nav>
                </div>
                <div className="text-sm">
                    Connecté en tant que <span className="font-semibold">{session.user.email}</span>
                </div>
            </div>
            <div className="flex-1 container mx-auto py-8 px-4">
                {children}
            </div>
        </div>
    );
}
