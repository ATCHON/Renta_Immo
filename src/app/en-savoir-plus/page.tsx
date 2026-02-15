'use client';

import Link from 'next/link';
import {
  ArrowLeft, Info, PieChart, TrendingUp, Calculator, ShieldCheck,
  Zap, Building2, Clock, BarChart3, Scale, Layers, AlertTriangle,
  BookOpen, ChevronRight, ChevronDown, Landmark
} from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

function FormulaBox({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <div className={cn(
      "p-4 rounded-xl font-mono text-sm font-bold shadow-sm",
      highlight
        ? "bg-forest/5 border border-forest/10 text-forest"
        : "bg-surface border border-sand text-forest"
    )}>
      {children}
    </div>
  );
}

function ExpertTip({ children, variant = 'info' }: { children: React.ReactNode; variant?: 'info' | 'warning' | 'success' }) {
  const styles = {
    info: "bg-sage/10 border-sage/20 text-forest",
    warning: "bg-amber/5 border-amber/10 text-charcoal",
    success: "bg-forest/5 border-forest/10 text-forest",
  };
  const icons = {
    info: <Zap className="h-5 w-5 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />,
    success: <BookOpen className="h-5 w-5 shrink-0 mt-0.5" />,
  };
  return (
    <div className={cn("p-5 rounded-xl border flex gap-4 items-start shadow-sm", styles[variant])}>
      {icons[variant]}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-surface border border-sand/50 p-3 rounded-xl text-center">
      <p className="text-[10px] font-bold text-pebble uppercase tracking-widest">{label}</p>
      <p className="text-xl font-black text-charcoal">{value}</p>
      {sub && <p className="text-[10px] text-pebble mt-1">{sub}</p>}
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-sand pb-4">
      <Icon className="h-6 w-6 text-forest" />
      <h2 className="text-2xl font-bold text-charcoal">{title}</h2>
    </div>
  );
}

const PIPELINE_STEPS = [
  { icon: ShieldCheck, label: "Validation", sub: "Normalisation des entrées", href: "#rentabilite" },
  { icon: TrendingUp, label: "Rentabilité", sub: "Crédit, charges, rendements", href: "#rentabilite" },
  { icon: Scale, label: "Fiscalité", sub: "6 régimes comparés", href: "#fiscalite" },
  { icon: Building2, label: "HCSF", sub: "Endettement, reste à vivre", href: "#hcsf" },
  { icon: PieChart, label: "Synthèse", sub: "Score 0-100, alertes", href: "#scoring" },
  { icon: Scale, label: "Profils", sub: "Rentier vs Patrimonial", href: "#profils" },
  { icon: BarChart3, label: "Projections", sub: "20 ans, TRI, plus-value", href: "#projections" },
];

function CalculationPipeline() {
  return (
    <Card>
      <CardHeader
        title="Comment fonctionne le moteur de calcul"
        description="Les 6 modules s'exécutent en séquence pour analyser votre investissement."
      />
      <CardContent>
        <div className="flex flex-col md:flex-row items-center md:items-stretch gap-2 md:gap-0">
          {PIPELINE_STEPS.map((step, index) => (
            <div key={step.label} className="flex flex-col md:flex-row items-center">
              <a
                href={step.href}
                className="group flex flex-col items-center text-center gap-2 px-4 py-3 rounded-xl hover:bg-forest/10 transition-colors w-full md:w-auto"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-forest/5 group-hover:bg-forest/15 transition-colors">
                  <step.icon className="h-5 w-5 text-forest" />
                </div>
                <span className="text-sm font-bold text-charcoal">{step.label}</span>
                <span className="text-[11px] text-pebble leading-tight">{step.sub}</span>
              </a>
              {index < PIPELINE_STEPS.length - 1 && (
                <>
                  <ChevronRight className="hidden md:block h-5 w-5 text-pebble/40 shrink-0 mx-1" />
                  <ChevronDown className="block md:hidden h-5 w-5 text-pebble/40 shrink-0" />
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

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
            Valeurs à jour pour <strong>2026</strong>.
          </p>

          {/* Sommaire */}
          <nav className="mt-6 flex flex-wrap gap-2">
            {[
              { label: "Rentabilité", href: "#rentabilite" },
              { label: "Crédit", href: "#credit" },
              { label: "Assurance CRD", href: "#assurance-crd" },
              { label: "Fiscalité", href: "#fiscalite" },
              { label: "Déficit foncier", href: "#deficit-foncier" },
              { label: "Amortissement", href: "#amortissement" },
              { label: "Plus-value", href: "#plus-value" },
              { label: "HCSF", href: "#hcsf" },
              { label: "DPE", href: "#dpe" },
              { label: "Scoring", href: "#scoring" },
              { label: "Profils Investisseur", href: "#profils" },
              { label: "Projections", href: "#projections" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-1 text-xs font-medium text-forest bg-forest/5 hover:bg-forest/10 border border-forest/10 px-3 py-1.5 rounded-full transition-colors"
              >
                {item.label}
                <ChevronRight className="h-3 w-3" />
              </a>
            ))}
          </nav>
        </header>

        <CalculationPipeline />

        <div className="space-y-10">

          {/* ================================================================ */}
          {/* Section Rentabilité */}
          {/* ================================================================ */}
          <section id="rentabilite" className="space-y-6 scroll-mt-8">
            <SectionHeader icon={TrendingUp} title="Indicateurs de Performance" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader
                  title="Rentabilité Brute"
                  description="Le ratio fondamental pour une première sélection rapide."
                />
                <CardContent className="space-y-4">
                  <FormulaBox>(Loyer annuel / Coût total acquisition) x 100</FormulaBox>
                  <p className="text-sm text-pebble leading-relaxed">
                    Le ratio le plus simple. Il ne prend pas en compte les charges ni les impôts.
                    Un investissement à 6% brut génère 6€ de loyer par an pour 100€ investis.
                  </p>
                  <ExpertTip variant="info">
                    <strong>Repère :</strong> En province, visez 8-10%. En grande métropole, 5-7% est déjà correct. En dessous de 4%, l&apos;investissement repose essentiellement sur la plus-value.
                  </ExpertTip>
                </CardContent>
              </Card>

              <Card>
                <CardHeader
                  title="Rentabilité Nette"
                  description="La réalité opérationnelle de votre projet."
                />
                <CardContent className="space-y-4">
                  <FormulaBox>(Loyer annuel - Charges) / Coût total x 100</FormulaBox>
                  <p className="text-sm text-pebble leading-relaxed">
                    Prend en compte toutes les charges : taxe foncière, copropriété, assurance PNO,
                    frais de gestion, provision travaux et vacance locative.
                  </p>
                  <p className="text-sm text-pebble leading-relaxed">
                    En moyenne, les charges représentent 25 à 35% du loyer brut. La rentabilité nette
                    est donc généralement 2 à 3 points inférieure à la brute.
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader
                  title="Rentabilité Nette-Nette (Après Impôts)"
                  description="Votre performance réelle nette de toute fiscalité — l'indicateur ultime."
                />
                <CardContent className="space-y-4">
                  <FormulaBox highlight>
                    <span className="flex flex-col md:flex-row justify-between items-center gap-4">
                      <span>(Loyer - Charges - Impôts) / Coût total x 100</span>
                      <span className="text-xs bg-forest text-white px-3 py-1 rounded-full not-italic font-bold">Le plus précis</span>
                    </span>
                  </FormulaBox>
                  <p className="text-sm text-pebble leading-relaxed">
                    C&apos;est la rentabilité réelle après paiement de tous les impôts et prélèvements sociaux.
                    Elle varie considérablement selon votre régime fiscal et votre TMI. C&apos;est cet indicateur qui compte
                    vraiment pour comparer deux investissements entre eux.
                  </p>
                  <ExpertTip variant="success">
                    <strong>Notre simulateur calcule cette rentabilité pour les 6 régimes fiscaux</strong> et vous recommande le plus avantageux. Un même bien peut passer de -2% nette-nette en micro-foncier à +3% en LMNP réel.
                  </ExpertTip>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ================================================================ */}
          {/* Section Crédit */}
          {/* ================================================================ */}
          <section id="credit" className="space-y-6 scroll-mt-8">
            <SectionHeader icon={Calculator} title="Levier Bancaire" />

            <Card>
              <CardHeader
                title="Mensualité de Crédit"
                description="Formule d'annuité constante (type Excel PMT)"
              />
              <CardContent>
                <div className="space-y-6">
                  <FormulaBox>M = C x t x (1+t)^n / ((1+t)^n - 1) + Assurance</FormulaBox>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-medium text-pebble">
                    <div className="bg-sand/10 p-3 rounded-lg border border-sand/30"><strong className="text-charcoal">M</strong> : Mensualité totale</div>
                    <div className="bg-sand/10 p-3 rounded-lg border border-sand/30"><strong className="text-charcoal">C</strong> : Capital emprunté</div>
                    <div className="bg-sand/10 p-3 rounded-lg border border-sand/30"><strong className="text-charcoal">t</strong> : Taux mensuel (Annuel / 12)</div>
                    <div className="bg-sand/10 p-3 rounded-lg border border-sand/30"><strong className="text-charcoal">n</strong> : Nombre de mensualités</div>
                    <div className="bg-sand/10 p-3 rounded-lg border border-sand/30"><strong className="text-charcoal">Assurance</strong> : Capital x Taux / 12</div>
                  </div>
                  <ExpertTip>
                    <strong>Exemple :</strong> Pour 200 000€ à 3.5% sur 20 ans (assurance 0.3%),
                    la mensualité est d&apos;environ <span className="font-bold underline">1 210€</span> dont 50€ d&apos;assurance.
                    Le coût total du crédit est de ~90 000€ d&apos;intérêts + ~12 000€ d&apos;assurance.
                  </ExpertTip>
                  <ExpertTip variant="success">
                    <strong>L&apos;effet de levier :</strong> Emprunter à 3.5% pour investir dans un bien qui rapporte 6% net,
                    c&apos;est gagner 2.5% sur de l&apos;argent que vous n&apos;avez pas. C&apos;est le principe fondamental de
                    l&apos;investissement locatif.
                  </ExpertTip>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ================================================================ */}
          {/* Section Assurance CRD */}
          {/* ================================================================ */}
          <section id="assurance-crd" className="space-y-6 scroll-mt-8">
            <SectionHeader icon={ShieldCheck} title="Assurance Emprunteur" />

            <Card>
              <CardHeader
                title="Capital initial vs Capital restant dû"
                description="Deux modes de calcul avec un impact significatif sur le coût total."
              />
              <CardContent className="space-y-6">
                <p className="text-sm text-pebble leading-relaxed">
                  L&apos;assurance emprunteur peut être calculée de deux façons. Le choix du mode impacte
                  le coût total du crédit, le cash-flow mensuel et le TRI de votre investissement.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface p-5 rounded-xl border border-sand">
                    <h4 className="text-sm font-bold text-charcoal mb-3">Capital initial (classique)</h4>
                    <FormulaBox>Assurance/mois = Capital emprunté x Taux / 12</FormulaBox>
                    <p className="text-sm text-pebble leading-relaxed mt-3">
                      Mensualité <strong>constante</strong> sur toute la durée du crédit.
                      C&apos;est le mode par défaut des contrats groupe bancaires.
                    </p>
                    <div className="bg-sand/20 p-3 rounded-lg text-center mt-3">
                      <p className="text-xs text-pebble">200 000€ à 0.3% sur 20 ans</p>
                      <p className="text-lg font-black text-charcoal">50€/mois fixe</p>
                      <p className="text-xs text-pebble">Total : 12 000€</p>
                    </div>
                  </div>

                  <div className="bg-forest/5 p-5 rounded-xl border border-forest/10">
                    <h4 className="text-sm font-bold text-charcoal mb-3">Capital restant dû (CRD)</h4>
                    <FormulaBox>Assurance mois N = Capital restant(N) x Taux / 12</FormulaBox>
                    <p className="text-sm text-pebble leading-relaxed mt-3">
                      Mensualité <strong>dégressive</strong> : élevée au début, quasi nulle à la fin.
                      Mode courant en délégation d&apos;assurance (loi Lemoine 2022).
                    </p>
                    <div className="bg-white/60 p-3 rounded-lg text-center mt-3">
                      <p className="text-xs text-pebble">200 000€ à 0.3% sur 20 ans</p>
                      <p className="text-lg font-black text-forest">50€ → 2.5€/mois</p>
                      <p className="text-xs text-forest font-bold">Total : ~7 200€ (-40%)</p>
                    </div>
                  </div>
                </div>

                <ExpertTip variant="success">
                  <strong>Impact sur l&apos;investissement :</strong> En mode CRD, l&apos;économie de ~4 800€ sur 20 ans
                  améliore le cash-flow en fin de crédit et augmente le TRI de 0.1 à 0.2 point.
                  En LMNP réel / SCI IS, l&apos;assurance déductible diminue chaque année,
                  ce qui augmente légèrement la base imposable en fin de crédit.
                </ExpertTip>

                <ExpertTip variant="warning">
                  <strong>HCSF :</strong> Pour l&apos;analyse d&apos;endettement, la mensualité maximale (An 1) est retenue
                  dans les deux modes. Le mode CRD n&apos;offre donc pas d&apos;avantage pour le taux d&apos;endettement.
                </ExpertTip>
              </CardContent>
            </Card>
          </section>

          {/* ================================================================ */}
          {/* Section Fiscalité */}
          {/* ================================================================ */}
          <section id="fiscalite" className="space-y-6 scroll-mt-8">
            <SectionHeader icon={ShieldCheck} title="Optimisation Fiscale" />

            <p className="text-sm text-pebble leading-relaxed">
              Le choix du régime fiscal est déterminant : il peut faire basculer un investissement de déficitaire à rentable.
              Notre simulateur compare <strong>6 régimes</strong> pour trouver celui qui maximise votre cash-flow net.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader title="Micro-foncier" description="Location nue — Le plus simple" />
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <StatBox label="Abattement" value="30%" />
                    <StatBox label="Plafond" value="15 k€" />
                  </div>
                  <p className="text-sm text-pebble leading-relaxed">
                    Abattement forfaitaire de 30% sur les revenus fonciers.
                    Base imposable = 70% des loyers, soumise au barème IR + prélèvements sociaux (17.2%).
                  </p>
                  <ExpertTip variant="warning">
                    <strong>Pour qui ?</strong> Investisseurs avec peu de charges (&lt;30% des loyers) et revenus fonciers &lt;15 000€/an.
                    Si vos charges dépassent 30%, le régime réel est plus avantageux.
                  </ExpertTip>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Foncier Réel" description="Location nue — Le plus puissant" />
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <StatBox label="Déduction" value="100%" />
                    <StatBox label="Déficit max" value="10.7 k€" sub="Sur revenu global" />
                  </div>
                  <p className="text-sm text-pebble leading-relaxed">
                    Déduction de toutes les charges réelles : intérêts d&apos;emprunt, travaux, assurance,
                    taxe foncière, frais de gestion, etc. Permet de créer un <strong>déficit foncier</strong>.
                  </p>
                  <p className="text-sm text-pebble leading-relaxed">
                    Idéal en cas de gros travaux : le déficit foncier peut effacer l&apos;impôt pendant plusieurs années.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="LMNP Micro-BIC" description="Meublé — Le compromis" />
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <StatBox label="Abattement" value="50%" />
                    <StatBox label="Plafond" value="77.7 k€" />
                  </div>
                  <p className="text-sm text-pebble leading-relaxed">
                    Abattement forfaitaire de 50% sur les recettes locatives meublées.
                    Simple et souvent avantageux pour les petites surfaces meublées.
                  </p>
                  <ExpertTip variant="warning">
                    <strong>Attention LF 2025 :</strong> Pour les meublés de tourisme non classés,
                    l&apos;abattement est réduit à 30% avec un plafond de 15 000€.
                  </ExpertTip>
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="LMNP Réel" description="Meublé — Le roi de la défiscalisation" />
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <StatBox label="Amortissement" value="Oui" sub="Bâti + mobilier" />
                    <StatBox label="Impôt" value="~0€*" sub="Pendant 8-15 ans" />
                  </div>
                  <p className="text-sm text-pebble leading-relaxed">
                    Le régime le plus avantageux fiscalement. L&apos;amortissement comptable du bâti, du mobilier
                    et des travaux permet souvent de ramener l&apos;impôt à zéro pendant de nombreuses années.
                  </p>
                  <p className="text-sm text-pebble leading-relaxed">
                    <strong>Important :</strong> L&apos;amortissement ne peut pas créer de déficit BIC.
                    L&apos;excédent est reporté indéfiniment sur les exercices suivants.
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 bg-gradient-to-br from-surface to-cream border-sand shadow-sm">
                <CardHeader
                  title="SCI à l'IS"
                  description="La structure de capitalisation et de transmission par excellence."
                />
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-sand/30">
                      <p className="text-xs font-bold text-pebble uppercase tracking-wider mb-2">IS Taux Réduit</p>
                      <p className="text-2xl font-black text-charcoal">15% <span className="text-xs font-normal text-pebble">(jusqu&apos;à 42 500€)</span></p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-sand/30">
                      <p className="text-xs font-bold text-pebble uppercase tracking-wider mb-2">IS Taux Normal</p>
                      <p className="text-2xl font-black text-charcoal">25% <span className="text-xs font-normal text-pebble">(au-delà)</span></p>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-sand/30">
                      <p className="text-xs font-bold text-pebble uppercase tracking-wider mb-2">Flat Tax (distribution)</p>
                      <p className="text-2xl font-black text-charcoal">30% <span className="text-xs font-normal text-pebble">(sur dividendes)</span></p>
                    </div>
                  </div>
                  <p className="text-sm text-pebble leading-relaxed">
                    Imposition au niveau de la société avec amortissement comptable.
                    Deux modes de fonctionnement : <strong>capitalisation</strong> (les bénéfices restent dans la SCI)
                    ou <strong>distribution</strong> (dividendes soumis à la flat tax de 30%).
                  </p>
                  <ExpertTip variant="warning">
                    <strong>Attention à la revente :</strong> En SCI IS, la plus-value est calculée sur la valeur nette comptable
                    (après amortissements). L&apos;impôt de plus-value est donc beaucoup plus élevé qu&apos;en nom propre.
                    Voir la section <a href="#plus-value" className="underline font-bold">Plus-value</a> ci-dessous.
                  </ExpertTip>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ================================================================ */}
          {/* Section Déficit Foncier */}
          {/* ================================================================ */}
          <section id="deficit-foncier" className="space-y-6 scroll-mt-8">
            <SectionHeader icon={Scale} title="Déficit Foncier" />

            <Card>
              <CardHeader
                title="Mécanisme du déficit foncier"
                description="Un levier fiscal puissant en location nue avec travaux."
              />
              <CardContent className="space-y-6">
                <p className="text-sm text-pebble leading-relaxed">
                  Quand vos charges déductibles (travaux, intérêts, assurance...) dépassent vos revenus fonciers,
                  vous êtes en <strong>déficit foncier</strong>. Ce déficit se décompose en deux parties distinctes :
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-forest/5 p-5 rounded-xl border border-forest/10">
                    <h4 className="text-sm font-bold text-charcoal mb-2">Déficit hors intérêts d&apos;emprunt</h4>
                    <p className="text-sm text-pebble leading-relaxed">
                      Imputable sur votre <strong>revenu global</strong> (salaires, etc.)
                      dans la limite de <strong className="text-forest">10 700€/an</strong>.
                    </p>
                    <p className="text-sm text-pebble leading-relaxed mt-2">
                      C&apos;est la partie la plus intéressante : elle réduit directement votre impôt sur le revenu.
                    </p>
                  </div>
                  <div className="bg-surface p-5 rounded-xl border border-sand">
                    <h4 className="text-sm font-bold text-charcoal mb-2">Déficit lié aux intérêts</h4>
                    <p className="text-sm text-pebble leading-relaxed">
                      Reportable uniquement sur les <strong>revenus fonciers</strong> des
                      <strong className="text-forest"> 10 années suivantes</strong>.
                    </p>
                    <p className="text-sm text-pebble leading-relaxed mt-2">
                      Il ne peut pas venir réduire vos autres revenus (salaires, etc.).
                    </p>
                  </div>
                </div>

                <FormulaBox>
                  Économie d&apos;impôt = min(Déficit hors intérêts, 10 700€) x TMI
                </FormulaBox>

                <ExpertTip>
                  <strong>Exemple concret :</strong> Revenus fonciers 10 800€, charges (travaux) 18 000€, intérêts 5 000€.
                  Déficit total = 12 200€. Dont 7 200€ hors intérêts imputable sur revenu global.
                  À TMI 30%, l&apos;économie d&apos;impôt est de <strong>2 160€</strong>.
                </ExpertTip>
                <ExpertTip variant="warning">
                  <strong>Condition :</strong> En contrepartie de l&apos;imputation sur le revenu global,
                  vous devez conserver le bien en location pendant <strong>3 ans minimum</strong> après l&apos;imputation.
                </ExpertTip>
              </CardContent>
            </Card>
          </section>

          {/* ================================================================ */}
          {/* Section Amortissement */}
          {/* ================================================================ */}
          <section id="amortissement" className="space-y-6 scroll-mt-8">
            <SectionHeader icon={Layers} title="Amortissement Comptable" />

            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader
                  title="Amortissement simplifié vs par composants"
                  description="Deux méthodes de calcul pour LMNP réel et SCI IS."
                />
                <CardContent className="space-y-6">
                  <p className="text-sm text-pebble leading-relaxed">
                    L&apos;amortissement permet de déduire chaque année une fraction de la valeur du bien de vos revenus imposables.
                    Seule la partie <strong>bâti</strong> est amortissable — le terrain ne l&apos;est pas.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-surface p-5 rounded-xl border border-sand">
                      <h4 className="text-sm font-bold text-charcoal mb-3">Mode simplifié</h4>
                      <p className="text-sm text-pebble leading-relaxed mb-3">
                        Amortissement linéaire sur <strong>33 ans</strong> (~3%/an) pour l&apos;ensemble du bâti.
                        Simple mais sous-estime l&apos;amortissement réel.
                      </p>
                      <div className="bg-sand/20 p-3 rounded-lg text-center">
                        <p className="text-xs text-pebble">Bien 200k€ (terrain 15%)</p>
                        <p className="text-lg font-black text-charcoal">5 151€/an</p>
                      </div>
                    </div>

                    <div className="bg-forest/5 p-5 rounded-xl border border-forest/10">
                      <h4 className="text-sm font-bold text-charcoal mb-3">Mode par composants</h4>
                      <p className="text-sm text-pebble leading-relaxed mb-3">
                        Décomposition du bâti en composants avec des durées différentes.
                        Plus précis et plus avantageux les premières années.
                      </p>
                      <div className="bg-white/60 p-3 rounded-lg text-center">
                        <p className="text-xs text-pebble">Bien 200k€ (terrain 15%)</p>
                        <p className="text-lg font-black text-forest">8 387€/an</p>
                        <p className="text-[10px] text-forest font-bold">+63% vs simplifié</p>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-charcoal uppercase tracking-widest px-3 border-l-4 border-forest">
                    Ventilation par composants
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-sand">
                          <th className="text-left py-2 text-pebble font-bold text-xs uppercase">Composant</th>
                          <th className="text-center py-2 text-pebble font-bold text-xs uppercase">Part</th>
                          <th className="text-center py-2 text-pebble font-bold text-xs uppercase">Durée</th>
                          <th className="text-right py-2 text-pebble font-bold text-xs uppercase">Amort./an*</th>
                        </tr>
                      </thead>
                      <tbody className="text-charcoal">
                        {[
                          { name: "Gros oeuvre", part: "40%", duree: "50 ans", amort: "1 360€" },
                          { name: "Façade & toiture", part: "20%", duree: "25 ans", amort: "1 360€" },
                          { name: "Installations techniques", part: "20%", duree: "15 ans", amort: "2 267€" },
                          { name: "Agencements intérieurs", part: "20%", duree: "10 ans", amort: "3 400€" },
                        ].map((row, id) => (
                          <tr key={id} className="border-b border-sand/50">
                            <td className="py-2 font-medium">{row.name}</td>
                            <td className="py-2 text-center">{row.part}</td>
                            <td className="py-2 text-center">{row.duree}</td>
                            <td className="py-2 text-right font-bold">{row.amort}</td>
                          </tr>
                        ))}
                        <tr className="border-t-2 border-forest/20">
                          <td className="py-2 font-black text-forest" colSpan={3}>Total</td>
                          <td className="py-2 text-right font-black text-forest">8 387€</td>
                        </tr>
                      </tbody>
                    </table>
                    <p className="text-[10px] text-pebble mt-2">*Exemple : bien 200 000€, terrain 15%, valeur amortissable 170 000€</p>
                  </div>

                  <ExpertTip variant="info">
                    <strong>Arrêt progressif :</strong> L&apos;amortissement diminue au fil du temps.
                    Les agencements s&apos;arrêtent après <strong>10 ans</strong>, les installations après <strong>15 ans</strong>,
                    la façade après <strong>25 ans</strong>. Seul le gros oeuvre continue jusqu&apos;à <strong>50 ans</strong>.
                  </ExpertTip>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-surface p-4 rounded-xl border border-sand">
                      <p className="text-xs font-bold text-pebble uppercase tracking-wider mb-1">Mobilier</p>
                      <p className="text-sm text-charcoal">Amorti sur <strong>10 ans</strong> (10%/an)</p>
                    </div>
                    <div className="bg-surface p-4 rounded-xl border border-sand">
                      <p className="text-xs font-bold text-pebble uppercase tracking-wider mb-1">Travaux</p>
                      <p className="text-sm text-charcoal">Amortis sur <strong>15 ans</strong> (~6.7%/an)</p>
                    </div>
                  </div>

                  <ExpertTip variant="warning">
                    <strong>Règle fondamentale :</strong> L&apos;amortissement ne peut pas créer de <strong>déficit BIC</strong>.
                    Si l&apos;amortissement dépasse le bénéfice, l&apos;excédent est reporté sans limite de durée
                    sur les exercices suivants. Il n&apos;est jamais perdu.
                  </ExpertTip>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ================================================================ */}
          {/* Section Plus-value */}
          {/* ================================================================ */}
          <section id="plus-value" className="space-y-6 scroll-mt-8">
            <SectionHeader icon={Clock} title="Plus-Value à la Revente" />

            <p className="text-sm text-pebble leading-relaxed">
              Lors de la revente, l&apos;impôt de plus-value peut représenter un montant significatif.
              Son calcul diffère radicalement selon votre structure de détention.
            </p>

            <div className="grid grid-cols-1 gap-6">
              {/* Nom propre */}
              <Card>
                <CardHeader
                  title="En nom propre (IR)"
                  description="Location nue et LMNP — Abattements progressifs pour durée de détention."
                />
                <CardContent className="space-y-6">
                  <FormulaBox>
                    Plus-value brute = Prix de vente - Prix d&apos;achat
                  </FormulaBox>

                  <p className="text-sm text-pebble leading-relaxed">
                    La plus-value est soumise à deux impôts distincts avec des abattements différents :
                    <strong> IR (19%)</strong> et <strong>Prélèvements Sociaux (17.2%)</strong>.
                  </p>

                  <h4 className="text-sm font-bold text-charcoal uppercase tracking-widest px-3 border-l-4 border-forest">
                    Barème des abattements
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-sand">
                          <th className="text-left py-2 text-pebble font-bold text-xs uppercase">Durée de détention</th>
                          <th className="text-center py-2 text-pebble font-bold text-xs uppercase">Abattement IR</th>
                          <th className="text-center py-2 text-pebble font-bold text-xs uppercase">Abattement PS</th>
                        </tr>
                      </thead>
                      <tbody className="text-charcoal">
                        {[
                          { duree: "0 à 5 ans", ir: "0%", ps: "0%" },
                          { duree: "6 à 21 ans", ir: "6%/an", ps: "1.65%/an" },
                          { duree: "22e année", ir: "+4% → 100%", ps: "+1.6% → 28%" },
                          { duree: "23 à 30 ans", ir: "Exonéré", ps: "9%/an" },
                          { duree: "Au-delà de 30 ans", ir: "Exonéré", ps: "Exonéré" },
                        ].map((row, id) => (
                          <tr key={id} className="border-b border-sand/50">
                            <td className="py-2 font-medium">{row.duree}</td>
                            <td className="py-2 text-center">{row.ir}</td>
                            <td className="py-2 text-center">{row.ps}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <ExpertTip>
                    <strong>Exemple :</strong> Achat 200 000€, revente 230 000€ après 10 ans.
                    PV brute = 30 000€. Abattement IR 30% → IR = 21 000€ x 19% = <strong>3 990€</strong>.
                    Abattement PS 8.25% → PS = 27 525€ x 17.2% = <strong>4 734€</strong>.
                    Total = <strong>8 724€</strong>.
                  </ExpertTip>

                  <ExpertTip variant="warning">
                    <strong>Surtaxe :</strong> Pour une plus-value nette IR supérieure à <strong>50 000€</strong>,
                    une surtaxe de 2% à 7% s&apos;applique (barème progressif).
                  </ExpertTip>
                </CardContent>
              </Card>

              {/* LMNP - réintégration */}
              <Card>
                <CardHeader
                  title="LMNP — Réintégration des amortissements (LF 2025)"
                  description="Nouveauté : les amortissements déduits augmentent la plus-value imposable."
                />
                <CardContent className="space-y-4">
                  <FormulaBox highlight>
                    PV brute = Prix de vente - (Prix d&apos;achat - Amortissements cumulés)
                  </FormulaBox>
                  <p className="text-sm text-pebble leading-relaxed">
                    Depuis la <strong>loi de finances 2025</strong>, les amortissements déduits en LMNP sont
                    réintégrés dans le calcul de la plus-value lors de la revente.
                    Les abattements pour durée de détention s&apos;appliquent ensuite normalement.
                  </p>
                  <ExpertTip variant="warning">
                    <strong>Impact concret :</strong> Si vous avez amorti 50 000€ sur 10 ans, votre plus-value brute
                    augmente de 50 000€. C&apos;est le prix à payer pour des années d&apos;impôt zéro.
                    À long terme (&gt;22 ans), l&apos;exonération IR compense largement.
                  </ExpertTip>
                </CardContent>
              </Card>

              {/* SCI IS */}
              <Card>
                <CardHeader
                  title="SCI à l'IS — Plus-value professionnelle"
                  description="Pas d'abattement pour durée de détention."
                />
                <CardContent className="space-y-6">
                  <FormulaBox>
                    PV = Prix de vente - Valeur Nette Comptable (Prix - Amortissements cumulés)
                  </FormulaBox>
                  <p className="text-sm text-pebble leading-relaxed">
                    En SCI IS, la plus-value est calculée sur la <strong>valeur nette comptable</strong>.
                    Après des années d&apos;amortissement, la VNC peut être très faible, ce qui génère
                    une plus-value imposable importante. <strong>Aucun abattement</strong> pour durée de détention.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-surface p-4 rounded-xl border border-sand">
                      <p className="text-xs font-bold text-pebble uppercase tracking-wider mb-1">Sans distribution</p>
                      <p className="text-sm text-charcoal">IS seul (15%/25%)</p>
                      <p className="text-xs text-pebble mt-1">Le profit reste dans la SCI</p>
                    </div>
                    <div className="bg-terracotta/5 p-4 rounded-xl border border-terracotta/10">
                      <p className="text-xs font-bold text-pebble uppercase tracking-wider mb-1">Avec distribution</p>
                      <p className="text-sm text-charcoal">IS + Flat Tax 30%</p>
                      <p className="text-xs text-pebble mt-1">Double imposition</p>
                    </div>
                  </div>

                  <ExpertTip variant="warning">
                    <strong>Exemple frappant :</strong> Achat 200 000€, revente 230 000€ après 10 ans (amortissements 51 510€).
                    En <strong>nom propre : 8 724€</strong> d&apos;impôt PV.
                    En <strong>SCI IS avec distribution : 35 742€</strong>. Soit <strong>4x plus</strong>.
                    La SCI IS est un outil de capitalisation long terme, pas de revente rapide.
                  </ExpertTip>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ================================================================ */}
          {/* Section HCSF */}
          {/* ================================================================ */}
          <section id="hcsf" className="space-y-6 scroll-mt-8">
            <SectionHeader icon={ShieldCheck} title="Normes HCSF 2026" />

            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-bold text-pebble uppercase tracking-widest">Endettement Max</p>
                    <p className="text-4xl font-black text-terracotta tracking-tighter">35%</p>
                    <p className="text-xs text-pebble">Assurance comprise</p>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-bold text-pebble uppercase tracking-widest">Durée Crédit Max</p>
                    <p className="text-4xl font-black text-charcoal tracking-tighter">25 ans</p>
                    <p className="text-xs text-pebble">27 ans avec différé travaux</p>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-bold text-pebble uppercase tracking-widest">Pondération Loyers</p>
                    <p className="text-4xl font-black text-forest tracking-tighter">70%</p>
                    <p className="text-xs text-pebble">Des revenus locatifs bruts</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-charcoal uppercase tracking-widest px-3 border-l-4 border-forest">Le calcul bancaire</h4>
                  <FormulaBox>
                    Taux endettement = Total charges mensuelles / Total revenus mensuels
                  </FormulaBox>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-surface p-4 rounded-xl border border-sand">
                      <p className="font-bold text-charcoal mb-2">Revenus pris en compte</p>
                      <ul className="text-pebble space-y-1 list-disc list-inside">
                        <li>Salaires et revenus professionnels</li>
                        <li>Revenus locatifs existants x 70%</li>
                        <li>Nouveaux loyers prévisionnels x 70%</li>
                      </ul>
                    </div>
                    <div className="bg-surface p-4 rounded-xl border border-sand">
                      <p className="font-bold text-charcoal mb-2">Charges prises en compte</p>
                      <ul className="text-pebble space-y-1 list-disc list-inside">
                        <li>Crédits existants (mensualités)</li>
                        <li>Nouveau crédit (mensualité + assurance)</li>
                        <li>Charges fixes récurrentes</li>
                      </ul>
                    </div>
                  </div>
                  <ExpertTip>
                    <strong>Marge de flexibilité :</strong> Les banques disposent d&apos;une dérogation de <strong>20%</strong> sur
                    leurs dossiers. Cette marge est souvent réservée aux profils à haut reste à vivre (&gt;1 500€/mois après charges)
                    ou aux primo-accédants résidence principale. Les investisseurs locatifs y ont rarement accès.
                  </ExpertTip>
                  <h4 className="text-sm font-bold text-charcoal uppercase tracking-widest px-3 border-l-4 border-forest mt-6">Reste à vivre</h4>
                  <p className="text-sm text-pebble leading-relaxed">
                    Le reste à vivre est le montant qui reste chaque mois après paiement de toutes vos charges et crédits.
                    Les banques l&apos;utilisent systématiquement <strong>en complément du taux d&apos;endettement</strong> pour évaluer
                    la faisabilité d&apos;un prêt.
                  </p>
                  <FormulaBox>
                    Reste à vivre = Revenus totaux mensuels - Charges totales mensuelles
                  </FormulaBox>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-terracotta/5 p-4 rounded-xl border border-terracotta/10 text-center">
                      <p className="text-xs font-bold text-pebble uppercase tracking-wider">Insuffisant</p>
                      <p className="text-2xl font-black text-terracotta">&lt; 700€</p>
                      <p className="text-xs text-pebble mt-1">Refus de prêt probable</p>
                    </div>
                    <div className="bg-surface p-4 rounded-xl border border-sand text-center">
                      <p className="text-xs font-bold text-pebble uppercase tracking-wider">Correct</p>
                      <p className="text-2xl font-black text-charcoal">700 - 1 500€</p>
                      <p className="text-xs text-pebble mt-1">Acceptable, marge limitée</p>
                    </div>
                    <div className="bg-forest/5 p-4 rounded-xl border border-forest/10 text-center">
                      <p className="text-xs font-bold text-pebble uppercase tracking-wider">Confortable</p>
                      <p className="text-2xl font-black text-forest">&gt; 1 500€</p>
                      <p className="text-xs text-pebble mt-1">Profil premium bancaire</p>
                    </div>
                  </div>
                  <ExpertTip variant="success">
                    <strong>Scoring :</strong> Le reste à vivre impacte directement votre score d&apos;investissement :
                    <strong> +5 points</strong> au-dessus de 1 500€, <strong>0 point</strong> entre 700 et 1 500€,
                    et <strong>-10 points</strong> en dessous de 700€. Un investisseur peut être sous le seuil de 35%
                    d&apos;endettement mais avoir un reste à vivre insuffisant, ce qui entraînerait un refus de prêt.
                  </ExpertTip>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ================================================================ */}
          {/* Section DPE */}
          {/* ================================================================ */}
          <section id="dpe" className="space-y-6 scroll-mt-8">
            <SectionHeader icon={Building2} title="Diagnostic de Performance Énergétique (DPE)" />

            <Card>
              <CardHeader
                title="Impact du DPE sur votre investissement"
                description="Un critère devenu incontournable depuis la loi Climat 2021."
              />
              <CardContent className="space-y-6">
                <p className="text-sm text-pebble leading-relaxed">
                  Le DPE classe les logements de <strong>A</strong> (très performant) à <strong>G</strong> (passoire thermique).
                  Il a un impact direct sur la <strong>valeur du bien</strong>, la <strong>capacité à louer</strong>
                  et le <strong>score</strong> de votre investissement.
                </p>

                <div className="grid grid-cols-7 gap-2">
                  {[
                    { label: "A", color: "bg-green-600", text: "text-white" },
                    { label: "B", color: "bg-green-400", text: "text-charcoal" },
                    { label: "C", color: "bg-yellow-300", text: "text-charcoal" },
                    { label: "D", color: "bg-yellow-500", text: "text-charcoal" },
                    { label: "E", color: "bg-orange-400", text: "text-white" },
                    { label: "F", color: "bg-red-500", text: "text-white" },
                    { label: "G", color: "bg-red-700", text: "text-white" },
                  ].map((dpe) => (
                    <div key={dpe.label} className={cn("rounded-lg p-3 text-center font-black text-lg", dpe.color, dpe.text)}>
                      {dpe.label}
                    </div>
                  ))}
                </div>

                <h4 className="text-sm font-bold text-charcoal uppercase tracking-widest px-3 border-l-4 border-forest">
                  Calendrier d&apos;interdiction de location
                </h4>
                <div className="space-y-3">
                  {[
                    { date: "Depuis 2023", label: "DPE G+ (>450 kWh)", desc: "Interdit à la location", color: "bg-red-700" },
                    { date: "1er janvier 2025", label: "DPE G", desc: "Interdit à la location", color: "bg-red-500" },
                    { date: "1er janvier 2028", label: "DPE F", desc: "Interdit à la location", color: "bg-orange-400" },
                    { date: "1er janvier 2034", label: "DPE E", desc: "Interdit à la location", color: "bg-yellow-500" },
                  ].map((item, id) => (
                    <div key={id} className="flex items-center gap-4 text-sm">
                      <div className={cn("w-3 h-3 rounded-full shrink-0", item.color)}></div>
                      <span className="font-bold text-charcoal w-36">{item.date}</span>
                      <span className="text-pebble">{item.label} — {item.desc}</span>
                    </div>
                  ))}
                </div>

                <h4 className="text-sm font-bold text-charcoal uppercase tracking-widest px-3 border-l-4 border-terracotta mt-2">
                  Gel des loyers (DPE F et G)
                </h4>
                <p className="text-sm text-pebble leading-relaxed">
                  Les logements classés <strong>F ou G</strong> ne peuvent plus faire l&apos;objet d&apos;une augmentation
                  de loyer : l&apos;IRL (Indice de Référence des Loyers) est <strong>inapplicable</strong>.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface p-4 rounded-xl border border-sand">
                    <p className="text-xs font-bold text-pebble uppercase tracking-wider mb-1">DPE A à E</p>
                    <p className="text-sm text-charcoal">Loyer revalorisé selon l&apos;IRL chaque année (<strong>+2%/an</strong> en moyenne)</p>
                  </div>
                  <div className="bg-terracotta/5 p-4 rounded-xl border border-terracotta/10">
                    <p className="text-xs font-bold text-pebble uppercase tracking-wider mb-1">DPE F ou G</p>
                    <p className="text-sm text-charcoal">Loyer <strong>gelé</strong> — inflation forcée à 0% dans les projections</p>
                  </div>
                </div>
                <ExpertTip variant="warning">
                  <strong>Impact concret :</strong> Pour un loyer de 900€/mois, le gel représente un manque à gagner
                  de <strong>~175€/mois à l&apos;horizon 10 ans</strong> par rapport à un DPE C avec inflation de 2%.
                  Notre simulateur applique automatiquement le gel pour les DPE F et G.
                </ExpertTip>

                <h4 className="text-sm font-bold text-charcoal uppercase tracking-widest px-3 border-l-4 border-forest mt-2">
                  Alertes et recommandations
                </h4>
                <ExpertTip variant="warning">
                  <strong>Impact sur le score :</strong> Un DPE A ou B apporte un bonus de <strong>+5 points</strong>,
                  un DPE E un malus de <strong>-3 points</strong>, et un DPE F ou G (passoire)
                  un malus de <strong>-10 points</strong>. Le simulateur émet des alertes spécifiques si l&apos;interdiction
                  de location tombe avant la fin de votre horizon de projection.
                </ExpertTip>
                <ExpertTip variant="success">
                  <strong>Opportunité :</strong> Un bien en DPE F ou G acheté avec décote + travaux de rénovation énergétique
                  peut être une excellente opération : vous bénéficiez du <strong>déficit foncier</strong> sur les travaux
                  tout en augmentant la valeur et la performance du bien.
                  Vérifiez votre éligibilité à <strong>MaPrimeRénov&apos;</strong> pour réduire le coût des travaux.
                </ExpertTip>
              </CardContent>
            </Card>
          </section>

          {/* ================================================================ */}
          {/* Section Scoring */}
          {/* ================================================================ */}
          <section id="scoring" className="space-y-6 scroll-mt-8">
            <SectionHeader icon={PieChart} title="Système de Scoring" />

            <Card>
              <CardHeader
                title="Score d'investissement (0-100)"
                description="Une évaluation multicritères pour qualifier la qualité globale de votre projet."
              />
              <CardContent className="space-y-8">
                <p className="text-sm text-pebble leading-relaxed">
                  Le score part d&apos;une <strong>base de 40 points</strong> (investissement neutre),
                  puis chaque critère apporte un <strong>bonus ou malus</strong> selon la qualité du projet.
                  Le résultat est borné entre 0 et 100.
                </p>

                <FormulaBox highlight>
                  Score = 40 (base) + Cashflow + Rentabilité + HCSF + DPE + Ratio prix/loyer + Reste à vivre
                </FormulaBox>

                {/* Détail des 6 critères */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-charcoal uppercase tracking-widest px-3 border-l-4 border-forest">
                    Les 6 critères d&apos;ajustement
                  </h4>

                  {[
                    {
                      title: "Cash-flow net mensuel",
                      range: "-20 à +20 pts",
                      details: [
                        { cond: "≥ +200€/mois", pts: "+20", color: "text-forest" },
                        { cond: "0 à +200€", pts: "Interpolation 0 → +20", color: "text-charcoal" },
                        { cond: "-200€ à 0", pts: "Interpolation -20 → 0", color: "text-charcoal" },
                        { cond: "≤ -200€/mois", pts: "-20", color: "text-terracotta" },
                      ]
                    },
                    {
                      title: "Rentabilité nette-nette",
                      range: "-15 à +20 pts",
                      details: [
                        { cond: "≥ 7%", pts: "+20", color: "text-forest" },
                        { cond: "3% à 7%", pts: "Interpolation 0 → +20", color: "text-charcoal" },
                        { cond: "0% à 3%", pts: "Interpolation -15 → 0", color: "text-charcoal" },
                        { cond: "≤ 0%", pts: "-15", color: "text-terracotta" },
                      ]
                    },
                    {
                      title: "Taux d'endettement (HCSF)",
                      range: "-25 à +20 pts",
                      details: [
                        { cond: "≤ 25%", pts: "+20", color: "text-forest" },
                        { cond: "25% à 35%", pts: "Interpolation +20 → 0", color: "text-charcoal" },
                        { cond: "35% à 50%", pts: "Interpolation 0 → -15", color: "text-charcoal" },
                        { cond: "> 50% ou non conforme", pts: "-25", color: "text-terracotta" },
                      ]
                    },
                    {
                      title: "DPE (Performance énergétique)",
                      range: "-10 à +5 pts",
                      details: [
                        { cond: "DPE A ou B", pts: "+5", color: "text-forest" },
                        { cond: "DPE C ou D", pts: "0", color: "text-charcoal" },
                        { cond: "DPE E", pts: "-3", color: "text-amber-600" },
                        { cond: "DPE F ou G (passoire)", pts: "-10", color: "text-terracotta" },
                      ]
                    },
                    {
                      title: "Ratio prix/loyer annuel",
                      range: "-5 à +10 pts",
                      details: [
                        { cond: "≤ 15 (excellent)", pts: "+10", color: "text-forest" },
                        { cond: "15 à 20", pts: "Interpolation +10 → 0", color: "text-charcoal" },
                        { cond: "20 à 25", pts: "Interpolation 0 → -5", color: "text-charcoal" },
                        { cond: "> 25 (cher)", pts: "-5", color: "text-terracotta" },
                      ]
                    },
                    {
                      title: "Reste à vivre mensuel",
                      range: "-10 à +5 pts",
                      details: [
                        { cond: "≥ 1 500€", pts: "+5", color: "text-forest" },
                        { cond: "800€ à 1 500€", pts: "0", color: "text-charcoal" },
                        { cond: "< 800€", pts: "-10", color: "text-terracotta" },
                      ]
                    },
                  ].map((critere, id) => (
                    <div key={id} className="bg-surface p-4 rounded-xl border border-sand">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-bold text-charcoal">{critere.title}</h5>
                        <span className="text-xs font-bold text-forest bg-forest/10 px-2 py-1 rounded-full">{critere.range}</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {critere.details.map((d, did) => (
                          <div key={did} className="text-xs">
                            <p className="text-pebble">{d.cond}</p>
                            <p className={cn("font-bold", d.color)}>{d.pts}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Labels */}
                <h4 className="text-sm font-bold text-charcoal uppercase tracking-widest px-3 border-l-4 border-forest">
                  Interprétation du score
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-surface/30 p-6 rounded-2xl border border-sand/20 shadow-sm">
                  {[
                    { range: "80 - 100", label: "Excellent", sub: "Opportunité rare, foncez", color: "bg-forest" },
                    { range: "60 - 79", label: "Bon", sub: "Dossier solide à optimiser", color: "bg-sage" },
                    { range: "40 - 59", label: "Moyen", sub: "Points bloquants à résoudre", color: "bg-amber" },
                    { range: "0 - 39", label: "Faible", sub: "Risque élevé, revoir le projet", color: "bg-terracotta" }
                  ].map((level, id) => (
                    <div key={id} className="flex flex-col items-center text-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-3 h-3 rounded-full shadow-sm", level.color)}></div>
                        <span className="font-bold text-charcoal tabular-nums text-lg">{level.range}</span>
                      </div>
                      <div>
                        <p className="font-bold text-charcoal text-sm">{level.label}</p>
                        <p className="text-pebble text-xs leading-tight">{level.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ================================================================ */}
          {/* Section Profils Investisseur */}
          {/* ================================================================ */}
          <section id="profils" className="space-y-6 scroll-mt-8">
            <SectionHeader icon={Scale} title="Profils Investisseur" />

            <Card>
              <CardHeader
                title="Rentier vs Patrimonial — deux lectures du même projet"
                description="Le score de votre simulation est calculé selon deux profils aux objectifs différents. Basculez entre les deux en un clic sur les résultats."
              />
              <CardContent className="space-y-6">
                <p className="text-sm text-pebble leading-relaxed">
                  Un même bien peut être <strong>excellent pour un rentier</strong> (cashflow positif immédiat) et
                  {' '}<strong>moyen pour un patrimonial</strong> (TRI insuffisant sur 20 ans), ou vice-versa.
                  Les deux scores sont calculés simultanément côté serveur et affichés sans recalcul.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Profil Rentier */}
                  <div className="bg-surface border border-sand rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-forest" />
                      <h4 className="text-sm font-bold text-charcoal">Profil Rentier</h4>
                    </div>
                    <p className="text-xs text-pebble leading-relaxed">
                      Priorité au <strong>cashflow mensuel positif</strong> et à la rentabilité immédiate.
                      Idéal pour générer des revenus complémentaires rapidement.
                    </p>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-pebble uppercase tracking-widest">Multiplicateurs de score</p>
                      {[
                        { label: 'Cash-flow net', mult: '×1.0', note: 'déterminant' },
                        { label: 'Rentabilité nette', mult: '×1.0', note: 'standard' },
                        { label: 'HCSF endettement', mult: '×1.0', note: 'standard' },
                        { label: 'DPE', mult: '×1.0', note: 'standard' },
                        { label: 'Ratio prix/loyer', mult: '×1.0', note: 'standard' },
                        { label: 'Reste à vivre', mult: '×1.0', note: 'standard' },
                      ].map((r, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-charcoal">{r.label}</span>
                          <span className="font-mono font-bold text-forest">{r.mult}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Profil Patrimonial */}
                  <div className="bg-surface border border-sand rounded-xl p-5 space-y-3">
                    <div className="flex items-center gap-2">
                      <Landmark className="h-5 w-5 text-forest" />
                      <h4 className="text-sm font-bold text-charcoal">Profil Patrimonial</h4>
                    </div>
                    <p className="text-xs text-pebble leading-relaxed">
                      Priorité au <strong>TRI sur 20 ans</strong> et à la valorisation du bien.
                      Idéal pour constituer un patrimoine durable.
                    </p>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-pebble uppercase tracking-widest">Multiplicateurs de score</p>
                      {[
                        { label: 'Cash-flow net', mult: '×0.5', note: 'atténué', color: 'text-amber-600' },
                        { label: 'Rentabilité nette', mult: '×1.5', note: 'renforcé', color: 'text-forest' },
                        { label: 'HCSF endettement', mult: '×1.0', note: 'standard', color: 'text-forest' },
                        { label: 'DPE', mult: '×1.5', note: 'renforcé', color: 'text-forest' },
                        { label: 'Ratio prix/loyer', mult: '×1.5', note: 'renforcé', color: 'text-forest' },
                        { label: 'Reste à vivre', mult: '×0.75', note: 'atténué', color: 'text-amber-600' },
                      ].map((r, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-charcoal">{r.label}</span>
                          <span className={cn('font-mono font-bold', r.color)}>{r.mult}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <FormulaBox>
                  Score_profil = 40 + Σ (ajustement_critère × multiplicateur_profil)
                </FormulaBox>

                <ExpertTip variant="info">
                  <strong>Exemple concret :</strong> Un bien avec un cashflow de +1€/mois et une rentabilité de 3,85%
                  obtient <strong>79.3 en Rentier</strong> (cashflow déterminant) et <strong>85.3 en Patrimonial</strong>
                  (rentabilité et ratio prix/loyer valorisés ×1.5). Même bien, lecture différente selon votre objectif.
                </ExpertTip>

                <ExpertTip variant="warning">
                  <strong>Alerte LMP :</strong> En régime LMNP, si vos recettes annuelles dépassent
                  {' '}<strong>20 000€</strong> (approche du seuil) ou <strong>23 000€</strong> (seuil LMP),
                  un bandeau d&apos;alerte s&apos;affiche automatiquement dans les résultats.
                  Au-delà de 23 000€, vous basculez en LMP (Loueur Meublé Professionnel) avec des
                  obligations sociales et fiscales spécifiques.
                </ExpertTip>
              </CardContent>
            </Card>
          </section>

          {/* ================================================================ */}
          {/* Section Projections */}
          {/* ================================================================ */}
          <section id="projections" className="space-y-6 scroll-mt-8">
            <SectionHeader icon={BarChart3} title="Projections Patrimoniales" />

            <Card>
              <CardHeader
                title="Simulation pluriannuelle"
                description="Projections sur 20 ans intégrant inflation, fiscalité et crédit."
              />
              <CardContent className="space-y-6">
                <p className="text-sm text-pebble leading-relaxed">
                  Notre moteur projette votre investissement sur <strong>20 ans</strong> en intégrant toutes les variables
                  qui évoluent dans le temps : inflation des loyers, hausse des charges, remboursement du crédit et fiscalité réelle.
                </p>

                <h4 className="text-sm font-bold text-charcoal uppercase tracking-widest px-3 border-l-4 border-forest">
                  Hypothèses de projection
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-surface p-4 rounded-xl border border-sand text-center">
                    <p className="text-xs font-bold text-pebble uppercase tracking-wider">Inflation loyers</p>
                    <p className="text-2xl font-black text-charcoal">+2%<span className="text-xs font-normal text-pebble">/an</span></p>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-sand text-center">
                    <p className="text-xs font-bold text-pebble uppercase tracking-wider">Inflation charges</p>
                    <p className="text-2xl font-black text-charcoal">+2.5%<span className="text-xs font-normal text-pebble">/an</span></p>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-sand text-center">
                    <p className="text-xs font-bold text-pebble uppercase tracking-wider">Revalorisation bien</p>
                    <p className="text-2xl font-black text-charcoal">+1.5%<span className="text-xs font-normal text-pebble">/an</span></p>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-charcoal uppercase tracking-widest px-3 border-l-4 border-forest">
                  Indicateurs clés
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface p-5 rounded-xl border border-sand">
                    <h5 className="text-sm font-bold text-charcoal mb-2">TRI (Taux de Rendement Interne)</h5>
                    <p className="text-sm text-pebble leading-relaxed">
                      Le TRI mesure la rentabilité annualisée de votre investissement en prenant en compte
                      <strong> tous les flux</strong> : apport initial, cash-flows annuels nets d&apos;impôt,
                      et valeur de revente nette de plus-value <strong>et de frais de cession</strong>.
                    </p>
                    <FormulaBox>
                      Flux final = Cash-flow net + Patrimoine net - Impôt PV - Frais de revente
                    </FormulaBox>
                    <p className="text-sm text-pebble leading-relaxed mt-2">
                      C&apos;est l&apos;indicateur le plus complet pour comparer un investissement immobilier
                      avec un placement financier (assurance-vie, bourse, etc.).
                    </p>
                  </div>
                  <div className="bg-surface p-5 rounded-xl border border-sand">
                    <h5 className="text-sm font-bold text-charcoal mb-2">Patrimoine net à l&apos;horizon</h5>
                    <p className="text-sm text-pebble leading-relaxed">
                      C&apos;est la mesure réaliste de votre enrichissement, intégrant les flux de trésorerie cumulés :
                    </p>
                    <FormulaBox>
                      Patrimoine net = Valeur du bien - Capital restant dû + Cash-flow net cumulé
                    </FormulaBox>
                    <p className="text-sm text-pebble leading-relaxed mt-2">
                      Contrairement à la simple équité immobilière (valeur − dette), cette formule
                      tient compte de <strong>tout l&apos;argent investi ou perdu</strong> via le cash-flow
                      mensuel. Un investissement avec un fort effort d&apos;épargne aura un patrimoine net
                      bien inférieur à la valeur du bien.
                    </p>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-charcoal uppercase tracking-widest px-3 border-l-4 border-forest">
                  Frais de revente
                </h4>
                <p className="text-sm text-pebble leading-relaxed">
                  Le simulateur intègre les frais réels de cession pour un TRI et un enrichissement total réalistes.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-surface p-4 rounded-xl border border-sand text-center">
                    <p className="text-xs font-bold text-pebble uppercase tracking-wider">Frais d&apos;agence</p>
                    <p className="text-2xl font-black text-charcoal">5%<span className="text-xs font-normal text-pebble"> du prix de vente</span></p>
                    <p className="text-xs text-pebble mt-1">Modifiable (0% si PAP)</p>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-sand text-center">
                    <p className="text-xs font-bold text-pebble uppercase tracking-wider">Diagnostics</p>
                    <p className="text-2xl font-black text-charcoal">500€<span className="text-xs font-normal text-pebble"> forfait</span></p>
                    <p className="text-xs text-pebble mt-1">DPE, amiante, plomb, etc.</p>
                  </div>
                  <div className="bg-terracotta/5 p-4 rounded-xl border border-terracotta/10 text-center">
                    <p className="text-xs font-bold text-pebble uppercase tracking-wider">Exemple 230k€</p>
                    <p className="text-2xl font-black text-terracotta">12 000€</p>
                    <p className="text-xs text-pebble mt-1">Impact TRI : -0.3 à -0.5 pt</p>
                  </div>
                </div>

                <ExpertTip variant="success">
                  <strong>Cash-flow net :</strong> Le tableau de projection montre année par année le cash-flow net
                  d&apos;impôt (loyers − charges − crédit − impôts). Un cash-flow négatif signifie un effort d&apos;épargne mensuel.
                  Suivez l&apos;évolution : avec l&apos;inflation des loyers et la fin du crédit, le cash-flow s&apos;améliore
                  naturellement avec le temps.
                </ExpertTip>

                <h4 className="text-sm font-bold text-charcoal uppercase tracking-widest px-3 border-l-4 border-forest">
                  Lecture des graphiques
                </h4>
                <p className="text-sm text-pebble leading-relaxed">
                  Survolez les légendes des graphiques pour voir le détail de chaque calcul.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface p-5 rounded-xl border border-sand space-y-3">
                    <h5 className="text-sm font-bold text-charcoal">Graphe Cash-flow (Net d&apos;impôt)</h5>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="h-3 w-3 rounded-full bg-[#2D5A45] mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-charcoal">Barres : Cash-flow net annuel</p>
                        <p className="text-pebble text-xs">Loyer − Charges − Crédit − Impôts. Vert si positif, rouge si négatif.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="h-3 w-3 rounded-full bg-[#60A5FA] mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-charcoal">Ligne pointillée : Cumulé</p>
                        <p className="text-pebble text-xs">Somme de tous les cash-flows nets depuis l&apos;année 1.</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-surface p-5 rounded-xl border border-sand space-y-3">
                    <h5 className="text-sm font-bold text-charcoal">Graphe Évolution du Patrimoine</h5>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="h-3 w-3 rounded-full bg-[#2D5A45] mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-charcoal">Valeur du bien (estimée)</p>
                        <p className="text-pebble text-xs">Prix d&apos;achat + revalorisation annuelle (+1,5%/an par défaut).</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="h-3 w-3 rounded-full bg-[#DC2626] mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-charcoal">Capital restant dû</p>
                        <p className="text-pebble text-xs">Montant d&apos;emprunt restant à rembourser. Atteint 0 à la fin du crédit.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <span className="h-3 w-3 rounded-full bg-[#2563EB] mt-0.5 shrink-0" />
                      <div>
                        <p className="font-bold text-charcoal">Patrimoine net</p>
                        <p className="text-pebble text-xs">Valeur du bien − Capital restant + Cash-flow net cumulé. Inclut l&apos;effort d&apos;épargne réel.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* ================================================================ */}
          {/* Avertissement Final */}
          {/* ================================================================ */}
          <div className="bg-charcoal text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <Info className="h-6 w-6 text-forest-light" />
                <h3 className="text-xl font-bold">Clause de Non-Responsabilité</h3>
              </div>
              <p className="text-stone-light/70 text-sm leading-relaxed max-w-3xl">
                Ce simulateur fournit des estimations basées sur les informations renseignées et les valeurs réglementaires en vigueur.
                Les calculs fiscaux sont conformes à la législation 2025-2026, mais des particularités liées à votre situation personnelle
                peuvent modifier les résultats.
              </p>
              <p className="text-stone-light/70 text-sm leading-relaxed max-w-3xl">
                Pour un conseil personnalisé, consultez un expert-comptable ou un conseiller en gestion de patrimoine (CGP).
                Les prélèvements sociaux, barèmes d&apos;abattement et seuils fiscaux sont ceux en vigueur au 1er janvier 2026.
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
