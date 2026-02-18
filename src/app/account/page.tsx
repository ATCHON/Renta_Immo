import { getSessionWithRole } from '@/lib/auth-helpers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { User, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button'; // Assuming Button component existence
import { authClient } from '@/lib/auth-client'; // For client-side logout if needed, but we'll stick to server-side rendering for data and maybe a client component for interactive parts if complex. kept simple for now.

export default async function AccountPage() {
  const session = await getSessionWithRole();

  if (!session) {
    redirect('/auth/login?callbackUrl=/account');
  }

  const { user } = session;

  return (
    <div className="container mx-auto py-12 px-4 max-w-2xl">
      <h1 className="text-3xl font-bold text-forest mb-8">Mon Compte</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-sand overflow-hidden">
        <div className="bg-sand/30 p-6 flex items-center space-x-6">
          <div className="w-20 h-20 rounded-full bg-forest/10 flex items-center justify-center border-2 border-white shadow-sm">
            <User className="w-10 h-10 text-forest" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-charcoal">{user.email?.split('@')[0]}</h2>
            <p className="text-pebble">{user.email}</p>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sand text-charcoal capitalize">
              {user.role}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {user.role === 'admin' && (
            <div className="bg-forest/5 border border-forest/20 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-forest/10 rounded-lg">
                  <ShieldCheck className="w-6 h-6 text-forest" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-forest mb-2">Administration</h3>
                  <p className="text-pebble mb-4">
                    Accédez au tableau de bord d&apos;administration pour gérer les configurations,
                    les utilisateurs et l&apos;audit.
                  </p>
                  <Link href="/admin">
                    <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-forest hover:bg-forest/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-forest transition-colors">
                      Accéder au Back-Office
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
