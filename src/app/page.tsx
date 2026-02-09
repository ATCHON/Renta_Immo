import Link from 'next/link';
import { ArrowRight, Shield, Zap, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen selection:bg-forest/10 selection:text-forest">
      {/* Hero Section with subtle gradient and animation */}
      <section className="relative flex flex-col items-center justify-center px-4 py-32 md:py-48 overflow-hidden bg-gradient-to-b from-white to-surface">
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #2D5A45 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

        <div className="max-w-4xl text-center space-y-10 relative z-10 px-4">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-5xl md:text-7xl font-bold text-charcoal leading-[1.1] tracking-tight mb-6">
              L&apos;expertise immobilière <br />
              <span className="text-forest bg-gradient-to-r from-forest to-sage bg-clip-text text-transparent italic">en toute simplicité.</span>
            </h1>
            <p className="text-xl md:text-2xl text-stone max-w-2xl mx-auto font-medium">
              Analysez la rentabilité, le cashflow et la fiscalité de vos projets en quelques secondes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <Link
              href="/calculateur?reset=true"
              className="inline-flex items-center justify-center gap-2 font-semibold transition-colors duration-fast focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-forest text-white hover:bg-forest-dark focus:ring-forest rounded-full px-10 py-7 text-lg shadow-xl shadow-forest/20 group"
            >
              Lancer l&apos;analyse
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center gap-2 text-pebble font-medium px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-sand/50">
              <span className="flex h-2 w-2 rounded-full bg-forest animate-pulse"></span>
              75+ analyses aujourd&apos;hui
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-24 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-pebble">Pourquoi RentaImmo ?</h2>
          <p className="text-3xl font-bold text-charcoal">La puissance d&apos;Excel, la simplicité du web.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="h-6 w-6" />}
            title="Rapidité Totale"
            description="6 étapes seulement"
            details="Formulaire optimisé pour une saisie en moins de 2 minutes."
          />
          <FeatureCard
            icon={<TrendingUp className="h-6 w-6" />}
            title="Analyse Complète"
            description="15+ métriques clés"
            details="TRI, Cashflow, HCSF, Fiscalité et Projections patrimoniales."
          />
          <FeatureCard
            icon={<Shield className="h-6 w-6" />}
            title="Fiabilité Expert"
            description="Conformité Garantie"
            details="Algorithmes alignés sur les standards bancaires et fiscaux."
          />
        </div>
      </section>

      {/* Trust Banner / Social Proof */}
      <section className="py-20 bg-forest text-white rounded-[3rem] mx-4 md:mx-12 overflow-hidden relative">
        <div className="max-w-4xl mx-auto px-8 text-center space-y-8 animate-in zoom-in-95 duration-700">
          <h2 className="text-3xl md:text-5xl font-bold leading-tight">Prêt à sécuriser votre prochain investissement ?</h2>
          <p className="text-white/80 text-lg max-w-xl mx-auto font-medium">
            Rejoignez les investisseurs qui utilisent RentaImmo pour valider leurs opportunités.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-24 py-12 px-8">
        <div className="max-w-6xl mx-auto border-t border-sand/30 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-pebble">
          <div className="font-bold text-charcoal">
            Renta<span className="text-forest">Immo</span>
          </div>
          <div className="flex gap-8">
            <Link href="/" className="hover:text-forest transition-colors">Accueil</Link>
            <Link href="/calculateur?reset=true" className="hover:text-forest transition-colors">Calculateur</Link>
            <Link href="/en-savoir-plus" className="hover:text-forest transition-colors">Méthodologie</Link>
          </div>
          <div>
            © 2026 Renta Immo • Design Nordic Minimal
          </div>
        </div>
      </footer>
    </main>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string;
}

function FeatureCard({ icon, title, description, details }: FeatureCardProps) {
  return (
    <div className="group bg-white border border-sand/50 rounded-3xl p-10 hover:shadow-2xl hover:shadow-forest/5 hover:-translate-y-1 transition-all duration-normal">
      <div className="flex flex-col items-center text-center space-y-5">
        <div className="h-16 w-16 rounded-2xl bg-forest/5 flex items-center justify-center text-forest group-hover:scale-110 transition-transform duration-slow">
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-charcoal mb-1">{title}</h3>
          <p className="text-sm font-black text-pebble uppercase tracking-widest mb-4">{description}</p>
          <p className="text-stone leading-relaxed">{details}</p>
        </div>
      </div>
    </div>
  );
}

