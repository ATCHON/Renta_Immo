import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Calculateur de Rentabilité Immobilière
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Analysez votre investissement locatif en quelques minutes.
          Calcul de rentabilité, cashflow, fiscalité et conformité HCSF.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/calculateur" className="btn-primary text-center">
            Commencer le calcul
          </Link>
          <Link href="/en-savoir-plus" className="btn-secondary text-center">
            En savoir plus
          </Link>
        </div>
      </div>

      <section id="features" className="mt-24 max-w-5xl w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Fonctionnalités
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard
            title="Rentabilité complète"
            description="Calcul de la rentabilité brute, nette et nette-nette de votre investissement."
          />
          <FeatureCard
            title="Analyse fiscale"
            description="Simulation de l'impact fiscal selon votre structure (nom propre ou SCI IS)."
          />
          <FeatureCard
            title="Conformité HCSF"
            description="Vérification du taux d'endettement pour chaque associé."
          />
        </div>
      </section>
    </main>
  );
}

interface FeatureCardProps {
  title: string;
  description: string;
}

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
