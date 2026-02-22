import { Metadata } from 'next';
import AuditGlobalTable from '@/components/admin/AuditGlobalTable';

export const metadata: Metadata = {
  title: 'Audit Global | Administration | Renta Immo',
};

export default function AuditGlobalPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Audit Global</h1>
        <p className="text-slate-600 text-lg max-w-2xl">
          Consultez l&apos;historique de toutes les modifications apportées aux paramètres du
          simulateur.
        </p>
      </header>

      <section>
        <AuditGlobalTable />
      </section>
    </div>
  );
}
