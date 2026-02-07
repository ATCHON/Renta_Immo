'use client';

import Link from 'next/link';
import { ArrowLeft, Info, PieChart, TrendingUp, Calculator, ShieldCheck, Zap } from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function EnSavoirPlusPage() {
  return (
    <main className="min-h-screen py-8 px-4 animate-in fade-in duration-700">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <header>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-pebble hover:text-forest transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l&apos;accueil
          </Link>
          <h1 className="text-4xl font-bold text-charcoal tracking-tight">Expertise & Méthodologie</h1>
          <p className="text-pebble mt-3 text-lg leading-relaxed max-w-2xl">
            Comprendre les calculs, formules et valeurs réglementaires utilisés par notre moteur d&apos;analyse immobilière.
          </p>
        </header>

        <div className="space-y-10">
          {/* Section Rentabilité */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-sand pb-4">
              <TrendingUp className="h-6 w-6 text-forest" />
              <h2 className="text-2xl font-bold text-charcoal">Indicateurs de Performance</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader
                  title="Rentabilité Brute"
                  description="Le ratio fondamental pour une première sélection."
                />
                <CardContent className="space-y-4">
                  <div className="bg-surface border border-sand p-4 rounded-xl font-mono text-sm text-forest font-bold shadow-sm">
                    (Loyer annuel / Prix d&apos;achat) x 100
                  </div>
                  <p className="text-sm text-pebble leading-relaxed">
                    C&apos;est le ratio le plus simple. Il ne prend pas en compte les charges ni les impôts.
                    Un investissement avec une rentabilité brute de 6% génère 6€ de loyer par an pour 100€ investis.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader
                  title="Rentabilité Nette"
                  description="La réalité opérationnelle de votre projet."
                />
                <CardContent className="space-y-4">
                  <div className="bg-surface border border-sand p-4 rounded-xl font-mono text-sm text-forest font-bold shadow-sm">
                    (Loyer annuel - Charges) / Prix d&apos;achat x 100
                  </div>
                  <p className="text-sm text-pebble leading-relaxed">
                    Prend en compte toutes les charges : taxe foncière, copropriété, assurance PNO, gestion, travaux et vacance locative.
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader
                  title="Rentabilité Nette-Nette (Après Impôts)"
                  description="Votre performance réelle nette de toute fiscalité."
                />
                <CardContent className="space-y-4">
                  <div className="bg-forest/5 border border-forest/10 p-5 rounded-xl font-mono text-sm text-forest font-black shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <span>(Loyer - Charges - Impôts) / Prix d&apos;achat x 100</span>
                    <span className="text-xs bg-forest text-white px-3 py-1 rounded-full not-italic font-bold">Le plus précis</span>
                  </div>
                  <p className="text-sm text-pebble leading-relaxed">
                    C&apos;est la rentabilité réelle après paiement de tous les impôts.
                    Elle varie selon votre régime fiscal et votre tranche marginale d&apos;imposition (TMI).
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section Crédit */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-sand pb-4">
              <Calculator className="h-6 w-6 text-forest" />
              <h2 className="text-2xl font-bold text-charcoal">Levier Bancaire</h2>
            </div>

            <Card>
              <CardHeader
                title="Mensualité de Crédit"
                description="La formule de calcul standard (type Excel PMT)"
              />
              <CardContent>
                <div className="space-y-6">
                  <div className="bg-surface border border-sand p-6 rounded-xl font-mono text-sm text-charcoal shadow-sm overflow-x-auto">
                    M = C x t x (1+t)^n / ((1+t)^n - 1) + Assurance
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-medium text-pebble">
                    <div className="bg-sand/10 p-3 rounded-lg border border-sand/30"><strong className="text-charcoal">M</strong> : Mensualité totale</div>
                    <div className="bg-sand/10 p-3 rounded-lg border border-sand/30"><strong className="text-charcoal">C</strong> : Capital emprunté</div>
                    <div className="bg-sand/10 p-3 rounded-lg border border-sand/30"><strong className="text-charcoal">t</strong> : Taux mensuel (Annuel / 12)</div>
                    <div className="bg-sand/10 p-3 rounded-lg border border-sand/30"><strong className="text-charcoal">n</strong> : Nombre de mensualités</div>
                    <div className="bg-sand/10 p-3 rounded-lg border border-sand/30 font-bold"><strong className="text-charcoal">Assurance</strong> : Protection prêt</div>
                  </div>
                  <div className="bg-sage/10 p-5 rounded-xl border border-sage/20 flex gap-4 items-start shadow-sm">
                    <Zap className="h-5 w-5 text-forest shrink-0 mt-0.5" />
                    <p className="text-sm text-forest leading-relaxed">
                      <strong>Exemple expert :</strong> Pour 200 000€ à 3.5% sur 20 ans (assurance 0.3%),
                      la mensualité est d&apos;environ <span className="font-bold underline">1 210€</span>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section Fiscalité */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-sand pb-4">
              <ShieldCheck className="h-6 w-6 text-forest" />
              <h2 className="text-2xl font-bold text-charcoal">Optimisation Fiscale</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "Micro-foncier",
                  stats: [{ label: "Abattement", val: "30%" }, { label: "Plafond", val: "15 k€" }],
                  desc: "Simple mais rigide. Base imposable = 70% des revenus. TMI + 17.2% PS."
                },
                {
                  title: "Foncier Réel",
                  stats: [{ label: "Déduction", val: "100%" }, { label: "Déficit", val: "10.7 k€" }],
                  desc: "Déduction des charges réelles. Permet de créer un déficit foncier imputable."
                },
                {
                  title: "LMNP Micro-BIC",
                  stats: [{ label: "Abattement", val: "50%" }, { label: "Plafond", val: "77.7 k€" }],
                  desc: "Avantageux pour le meublé. Abattement forfaitaire élevé (50%)."
                },
                {
                  title: "LMNP Réel",
                  stats: [{ label: "Amortissement", val: "~2%" }, { label: "Fiscalité", val: "Nulle*" }],
                  desc: "Le Graal fiscal. L'amortissement bati peut ramener l'impôt à zéro pendant des années."
                }
              ].map((item, id) => (
                <Card key={id} className="flex flex-col">
                  <CardHeader title={item.title} />
                  <CardContent className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {item.stats.map((s, sid) => (
                        <div key={sid} className="bg-surface border border-sand/50 p-3 rounded-xl text-center">
                          <p className="text-[10px] font-bold text-pebble uppercase tracking-widest">{s.label}</p>
                          <p className="text-xl font-black text-charcoal">{s.val}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-pebble leading-relaxed">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}

              <Card className="md:col-span-2 bg-gradient-to-br from-surface to-cream border-sand shadow-sm">
                <CardHeader
                  title="SCI à l'IS"
                  description="La structure de capitalisation par excellence."
                />
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-sand/30">
                      <p className="text-xs font-bold text-pebble uppercase tracking-wider mb-2">IS Taux Réduit</p>
                      <p className="text-2xl font-black text-charcoal">15% <span className="text-xs font-normal text-pebble">(jusqu&apos;à 42.5k€)</span></p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-sand/30">
                      <p className="text-xs font-bold text-pebble uppercase tracking-wider mb-2">IS Taux Normal</p>
                      <p className="text-2xl font-black text-charcoal">25% <span className="text-xs font-normal text-pebble">(au-delà)</span></p>
                    </div>
                  </div>
                  <p className="text-sm text-pebble leading-relaxed">
                    Imposition au niveau de la société. Permet l&apos;amortissement comptable. Les dividendes distribués sont soumis à la Flat Tax (30%). Attention à la plus-value lors de la revente.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section Normes HCSF */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-sand pb-4">
              <ShieldCheck className="h-6 w-6 text-forest" />
              <h2 className="text-2xl font-bold text-charcoal">Normes HCSF 2024</h2>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-bold text-pebble uppercase tracking-widest">Endettement Max</p>
                    <p className="text-4xl font-black text-terracotta tracking-tighter">35%</p>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-bold text-pebble uppercase tracking-widest">Durée Crédit Max</p>
                    <p className="text-4xl font-black text-charcoal tracking-tighter">25 ans</p>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-bold text-pebble uppercase tracking-widest">Pondération Loyers</p>
                    <p className="text-4xl font-black text-forest tracking-tighter">70-90%</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-charcoal uppercase tracking-widest px-3 border-l-4 border-forest">Le calcul bancaire</h4>
                  <div className="bg-surface border border-sand p-4 rounded-xl font-mono text-sm shadow-inner italic">
                    Ratio = Total Charges / (Revenus + (Loyers x Période))
                  </div>
                  <p className="text-sm text-pebble leading-relaxed bg-amber/5 p-4 rounded-xl border border-amber/10">
                    <strong>Note de l&apos;expert :</strong> Bien que le HCSF impose 35%, les banques disposent d&apos;une marge de flexibilité de 20% sur leurs dossiers, souvent réservée aux profils à haut reste à vivre.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section Scoring */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-sand pb-4">
              <PieChart className="h-6 w-6 text-forest" />
              <h2 className="text-2xl font-bold text-charcoal">Système de Scoring</h2>
            </div>

            <Card>
              <CardContent className="pt-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Cashflow", val: "30 pts", sub: "Autofinancement" },
                    { label: "Renta", val: "30 pts", sub: "Cible 7%+" },
                    { label: "HCSF", val: "25 pts", sub: "< 35%" },
                    { label: "Bonus", val: "15 pts", sub: "Renta 10%+" }
                  ].map((s, id) => (
                    <div key={id} className="bg-surface p-4 rounded-2xl border border-sand/50 text-center">
                      <p className="text-[10px] font-bold text-pebble uppercase tracking-widest mb-1">{s.label}</p>
                      <p className="text-xl font-black text-charcoal">{s.val}</p>
                      <p className="text-[10px] text-pebble mt-1">{s.sub}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 max-w-lg mx-auto bg-surface/30 p-6 rounded-2xl border border-sand/20 shadow-sm">
                  {[
                    { range: "80-100", label: "Excellent - Opportunité rare", color: "bg-forest" },
                    { range: "60-79", label: "Bon - Dossier solide", color: "bg-sage" },
                    { range: "40-59", label: "Moyen - À optimiser", color: "bg-amber" },
                    { range: "0-39", label: "Faible - Risqué", color: "bg-terracotta" }
                  ].map((level, id) => (
                    <div key={id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-3 h-3 rounded-full shadow-sm", level.color)}></div>
                        <span className="font-bold text-charcoal w-16 tabular-nums">{level.range}</span>
                      </div>
                      <span className="text-pebble font-medium">{level.label}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Avertissement Final */}
          <div className="bg-charcoal text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <Info className="h-6 w-6 text-forest-light" />
                <h3 className="text-xl font-bold">Clause de Non-Responsabilité</h3>
              </div>
              <p className="text-stone-light/70 text-sm leading-relaxed max-w-3xl">
                Ce simulateur fournit des estimations basées sur les informations renseignées. Les calculs fiscaux sont simplifiés et peuvent varier selon votre situation réelle.
                <span className="block mt-2">Pour un conseil personnalisé, consultez un expert-comptable ou un CGP. Les valeurs réglementaires (HCSF, fiscalité) sont celles en vigueur en 2024.</span>
              </p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-forest/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="text-center pt-8">
          <Link href="/calculateur">
            <Button variant="primary" size="lg" className="rounded-full px-12 py-6 text-lg shadow-xl shadow-forest/20">
              Lancer une simulation
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

