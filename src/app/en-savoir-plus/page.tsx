'use client';

import Link from 'next/link';
import { Card, CardHeader, CardContent } from '@/components/ui';

export default function EnSavoirPlusPage() {
  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">En savoir plus</h1>
          <p className="text-gray-600 mt-2">
            Comprendre les calculs, formules et valeurs reglementaires utilisees dans le simulateur
          </p>
        </header>

        <div className="space-y-8">
          {/* Section Rentabilite */}
          <Card>
            <CardHeader
              title="Calculs de rentabilite"
              description="Comment sont calcules les indicateurs de rendement"
            />
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Rentabilite brute</h4>
                  <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm mb-2">
                    Rentabilite brute = (Loyer annuel / Prix d&apos;achat) x 100
                  </div>
                  <p className="text-sm text-gray-600">
                    C&apos;est le ratio le plus simple. Il ne prend pas en compte les charges ni les impots.
                    Un investissement avec une rentabilite brute de 6% genere 6 euros de loyer par an pour 100 euros investis.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Rentabilite nette</h4>
                  <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm mb-2">
                    Rentabilite nette = (Loyer annuel - Charges) / Prix d&apos;achat x 100
                  </div>
                  <p className="text-sm text-gray-600">
                    Prend en compte toutes les charges : taxe fonciere, charges de copropriete, assurance PNO,
                    frais de gestion, provision pour travaux et vacance locative.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Rentabilite nette-nette</h4>
                  <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm mb-2">
                    Rentabilite nette-nette = (Loyer - Charges - Impots) / Prix d&apos;achat x 100
                  </div>
                  <p className="text-sm text-gray-600">
                    C&apos;est la rentabilite reelle apres paiement de tous les impots.
                    Elle varie selon votre regime fiscal et votre tranche marginale d&apos;imposition.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Cash-flow</h4>
                  <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm mb-2">
                    Cash-flow = Loyer mensuel - (Charges/12) - Mensualite credit
                  </div>
                  <p className="text-sm text-gray-600">
                    C&apos;est ce qui reste dans votre poche chaque mois. Un cash-flow positif signifie
                    que l&apos;investissement s&apos;autofinance. Un cash-flow negatif necessite un effort d&apos;epargne.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Mensualite Credit */}
          <Card>
            <CardHeader
              title="Calcul de la mensualite de credit"
              description="Formule PMT (Payment)"
            />
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                  M = C x t x (1+t)^n / ((1+t)^n - 1) + Assurance
                </div>
                <div className="text-sm text-gray-600 space-y-2">
                  <p><strong>M</strong> = Mensualite totale</p>
                  <p><strong>C</strong> = Capital emprunte</p>
                  <p><strong>t</strong> = Taux d&apos;interet mensuel (taux annuel / 12)</p>
                  <p><strong>n</strong> = Nombre de mensualites (duree en annees x 12)</p>
                  <p><strong>Assurance</strong> = Capital x taux assurance / 12</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Exemple :</strong> Pour un emprunt de 200 000 euros a 3.5% sur 20 ans avec assurance 0.3%,
                    la mensualite est d&apos;environ 1 210 euros (1 160 euros de credit + 50 euros d&apos;assurance).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Fiscalite */}
          <Card>
            <CardHeader
              title="Regimes fiscaux"
              description="Comment sont calcules les impots selon le regime choisi"
            />
            <CardContent>
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Micro-foncier</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-500">Abattement forfaitaire</p>
                      <p className="font-bold text-lg">30%</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-500">Plafond de revenus</p>
                      <p className="font-bold text-lg">15 000 euros/an</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Base imposable = Revenus x 70%. Impot = Base x TMI + Base x 17.2% (prelevements sociaux).
                    Simple mais pas toujours optimal si vous avez beaucoup de charges.
                  </p>
                </div>

                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Foncier reel</h4>
                  <p className="text-sm text-gray-600">
                    Vous deduisez toutes vos charges reelles : interets d&apos;emprunt, travaux, taxe fonciere,
                    frais de gestion, assurances... Obligatoire si revenus fonciers &gt; 15 000 euros/an ou si plus avantageux.
                    Possibilite de creer un deficit foncier imputable sur le revenu global (jusqu&apos;a 10 700 euros/an).
                  </p>
                </div>

                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">LMNP Micro-BIC</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-500">Abattement forfaitaire</p>
                      <p className="font-bold text-lg">50%</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-500">Plafond de recettes</p>
                      <p className="font-bold text-lg">77 700 euros/an</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Pour la location meublee. Abattement plus avantageux que le micro-foncier (50% vs 30%).
                    Base imposable = Revenus x 50%.
                  </p>
                </div>

                <div className="border-b pb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">LMNP Reel</h4>
                  <p className="text-sm text-gray-600">
                    Le regime le plus optimise fiscalement. En plus des charges reelles, vous pouvez
                    amortir le bien (environ 2% par an sur le bati). L&apos;amortissement n&apos;est pas imputable
                    sur le revenu global mais peut etre reporte.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">SCI a l&apos;IS</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-500">Taux reduit (jusqu&apos;a 42 500 euros)</p>
                      <p className="font-bold text-lg">15%</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-500">Taux normal (au-dela)</p>
                      <p className="font-bold text-lg">25%</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Imposition au niveau de la societe. Permet l&apos;amortissement du bien.
                    Les dividendes distribues sont soumis a la flat tax (30%).
                    Attention a la plus-value lors de la revente (pas d&apos;abattement pour duree de detention).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Prelevements Sociaux */}
          <Card>
            <CardHeader
              title="Prelevements sociaux"
              description="CSG, CRDS et autres contributions sociales"
            />
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900 mb-2">17.2%</p>
                  <p className="text-sm text-gray-600">Taux global des prelevements sociaux sur les revenus fonciers</p>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Composition : CSG 9.2% + CRDS 0.5% + Prelevement de solidarite 7.5%</p>
                  <p>Appliques sur la base imposable (apres abattement le cas echeant).</p>
                  <p>Non applicables pour la SCI a l&apos;IS (appliques uniquement sur les dividendes distribues).</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section HCSF */}
          <Card>
            <CardHeader
              title="Regles HCSF"
              description="Normes du Haut Conseil de Stabilite Financiere pour l'octroi de credits"
            />
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-500 text-sm">Taux d&apos;endettement max</p>
                    <p className="text-3xl font-bold text-primary-600">35%</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-500 text-sm">Duree max du credit</p>
                    <p className="text-3xl font-bold text-primary-600">25 ans</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg text-center">
                    <p className="text-gray-500 text-sm">Ponderation revenus locatifs</p>
                    <p className="text-3xl font-bold text-primary-600">70%</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Calcul du taux d&apos;endettement</h4>
                  <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm mb-2">
                    Taux = Charges mensuelles / Revenus mensuels x 100
                  </div>
                  <p className="text-sm text-gray-600">
                    Les revenus locatifs sont ponderes a 70% pour tenir compte des aleas (vacance, impayes).
                    Les charges incluent tous les credits en cours + le nouveau credit.
                  </p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <p className="text-sm text-amber-700">
                    <strong>Important :</strong> Ces regles s&apos;appliquent depuis janvier 2022.
                    Les banques peuvent deroger pour 20% de leurs dossiers (principalement pour les primo-accedants residence principale).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Scoring */}
          <Card>
            <CardHeader
              title="Systeme de scoring"
              description="Comment est calcule le score global de votre investissement"
            />
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Autofinancement</p>
                    <p className="text-xl font-bold text-gray-900">30 pts</p>
                    <p className="text-xs text-gray-400">Cash-flow positif</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Rentabilite</p>
                    <p className="text-xl font-bold text-gray-900">30 pts</p>
                    <p className="text-xs text-gray-400">Cible : 7-10%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">HCSF</p>
                    <p className="text-xl font-bold text-gray-900">25 pts</p>
                    <p className="text-xs text-gray-400">Endettement &lt; 35%</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Bonus</p>
                    <p className="text-xl font-bold text-gray-900">15 pts</p>
                    <p className="text-xs text-gray-400">Renta &ge; 10%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm"><strong>80-100 :</strong> Excellent - Tous les voyants sont au vert</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <span className="text-sm"><strong>60-79 :</strong> Bon - Investissement viable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="text-sm"><strong>40-59 :</strong> Moyen - A optimiser</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm"><strong>0-39 :</strong> Faible - A reconsiderer</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Charges */}
          <Card>
            <CardHeader
              title="Detail des charges"
              description="Les differentes charges prises en compte dans le calcul"
            />
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Charges fixes annuelles</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>- Taxe fonciere</li>
                      <li>- Charges de copropriete (x12 si mensuelles)</li>
                      <li>- Assurance PNO (Proprietaire Non Occupant)</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Charges proportionnelles</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>- Frais de gestion locative (% du loyer)</li>
                      <li>- Provision pour travaux (% du loyer)</li>
                      <li>- Provision pour vacance locative (% du loyer)</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Valeurs par defaut :</strong> Gestion locative 8%, Provision travaux 5%, Vacance 5%.
                    Ces valeurs sont personnalisables selon votre situation.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Avertissement */}
          <div className="bg-gray-100 rounded-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Avertissement</h3>
            <p className="text-sm text-gray-600">
              Ce simulateur fournit des estimations basees sur les informations que vous renseignez.
              Les calculs fiscaux sont simplifies et peuvent ne pas refleter exactement votre situation personnelle.
              Pour un conseil personnalise, consultez un expert-comptable ou un conseiller en gestion de patrimoine.
              Les valeurs reglementaires (HCSF, fiscalite) sont celles en vigueur en 2024 et peuvent evoluer.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
