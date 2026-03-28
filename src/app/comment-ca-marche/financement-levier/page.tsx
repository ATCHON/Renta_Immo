import type { Metadata } from 'next';
import Link from 'next/link';
import { Calculator, ShieldCheck, TrendingUp, ArrowLeft } from 'lucide-react';
import { FormulaBox } from '@/components/education/FormulaBox';
import { ExpertTip } from '@/components/education/ExpertTip';
import { SectionHeader } from '@/components/education/SectionHeader';

export const metadata: Metadata = {
  title: 'Financement & Levier | Comment ça marche — Petra Nova',
  description:
    "Formule PMT d'annuité constante, assurance CRD, cash-flow brut/net/net-net et effort d'épargne.",
};

export default function FinancementLevierPage() {
  return (
    <main className="px-6 md:px-10 py-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <Link
        href="/comment-ca-marche"
        className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Vue d&apos;ensemble
      </Link>

      <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tighter mb-2">
        Financement & Levier
      </h1>
      <p className="text-on-surface-variant text-lg leading-relaxed mb-12 max-w-2xl">
        La formule PMT, les deux modes d&apos;assurance emprunteur, et les trois niveaux de
        cash-flow qui révèlent la vérité de votre compte en banque.
      </p>

      <div className="space-y-14">
        {/* ═══════════════════════════════════════════ */}
        {/* Section Crédit / Levier bancaire */}
        {/* ═══════════════════════════════════════════ */}
        <section id="credit" className="scroll-mt-4">
          <SectionHeader icon={Calculator} title="Levier Bancaire" />

          <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-1">
                Mensualité de Crédit
              </h3>
              <p className="text-sm text-on-surface-variant">
                Formule d&apos;annuité constante (type Excel PMT)
              </p>
            </div>

            <FormulaBox>M = C × t × (1+t)^n / ((1+t)^n - 1) + Assurance</FormulaBox>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs font-medium text-on-surface-variant">
              {[
                { key: 'M', def: 'Mensualité totale' },
                { key: 'C', def: 'Capital emprunté' },
                { key: 't', def: 'Taux mensuel (Annuel / 12)' },
                { key: 'n', def: 'Nombre de mensualités' },
                { key: 'Assurance', def: 'Capital × Taux / 12' },
              ].map((item) => (
                <div
                  key={item.key}
                  className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20"
                >
                  <strong className="text-on-surface">{item.key}</strong> : {item.def}
                </div>
              ))}
            </div>

            <ExpertTip variant="info">
              <strong>Exemple :</strong> Pour 200 000€ à 3.5% sur 20 ans (assurance 0.3%), la
              mensualité est d&apos;environ <span className="font-bold underline">1 210€</span> dont
              50€ d&apos;assurance. Le coût total du crédit est de ~90 000€ d&apos;intérêts + ~12
              000€ d&apos;assurance.
            </ExpertTip>

            <ExpertTip variant="success">
              <strong>L&apos;effet de levier :</strong> Emprunter à 3.5% pour investir dans un bien
              qui rapporte 6% net, c&apos;est gagner 2.5% sur de l&apos;argent que vous n&apos;avez
              pas. C&apos;est le principe fondamental de l&apos;investissement locatif.
            </ExpertTip>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* Section Assurance CRD */}
        {/* ═══════════════════════════════════════════ */}
        <section id="assurance-crd" className="scroll-mt-4">
          <SectionHeader icon={ShieldCheck} title="Assurance Emprunteur" />

          <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-1">
                Capital initial vs Capital restant dû
              </h3>
              <p className="text-sm text-on-surface-variant">
                Deux modes de calcul avec un impact significatif sur le coût total.
              </p>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              L&apos;assurance emprunteur peut être calculée de deux façons. Le choix du mode
              impacte le coût total du crédit, le cash-flow mensuel et le TRI de votre
              investissement.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Capital initial */}
              <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20 space-y-3">
                <h4 className="text-sm font-bold text-on-surface">Capital initial (classique)</h4>
                <FormulaBox>Assurance/mois = Capital emprunté × Taux / 12</FormulaBox>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Mensualité <strong>constante</strong> sur toute la durée du crédit. C&apos;est le
                  mode par défaut des contrats groupe bancaires.
                </p>
                <div className="bg-white p-3 rounded-xl text-center border border-outline-variant/20">
                  <p className="text-xs text-on-surface-variant">200 000€ à 0.3% sur 20 ans</p>
                  <p className="text-lg font-black text-on-surface">50€/mois fixe</p>
                  <p className="text-xs text-on-surface-variant">Total : 12 000€</p>
                </div>
              </div>

              {/* CRD */}
              <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 space-y-3">
                <h4 className="text-sm font-bold text-on-surface">Capital restant dû (CRD)</h4>
                <FormulaBox>Assurance mois N = Capital restant(N) × Taux / 12</FormulaBox>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Mensualité <strong>dégressive</strong> : élevée au début, quasi nulle à la fin.
                  Mode courant en délégation d&apos;assurance (loi Lemoine 2022).
                </p>
                <div className="bg-white/60 p-3 rounded-xl text-center">
                  <p className="text-xs text-on-surface-variant">200 000€ à 0.3% sur 20 ans</p>
                  <p className="text-lg font-black text-primary">50€ → 2.5€/mois</p>
                  <p className="text-xs text-primary font-bold">Total : ~7 200€ (-40%)</p>
                </div>
              </div>
            </div>

            <ExpertTip variant="success">
              <strong>Impact sur l&apos;investissement :</strong> En mode CRD, l&apos;économie de ~4
              800€ sur 20 ans améliore le cash-flow en fin de crédit et augmente le TRI de 0.1 à 0.2
              point. En LMNP réel / SCI IS, l&apos;assurance déductible diminue chaque année, ce qui
              augmente légèrement la base imposable en fin de crédit.
            </ExpertTip>

            <ExpertTip variant="warning">
              <strong>HCSF :</strong> Pour l&apos;analyse d&apos;endettement, la mensualité maximale
              (An 1) est retenue dans les deux modes. Le mode CRD n&apos;offre donc pas
              d&apos;avantage pour le taux d&apos;endettement.
            </ExpertTip>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* Section Cash-flow */}
        {/* ═══════════════════════════════════════════ */}
        <section id="cashflow" className="scroll-mt-4">
          <SectionHeader icon={TrendingUp} title="Trésorerie & Cash-flow" />

          <div className="space-y-6 mt-6">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              La rentabilité est un pourcentage théorique. Le <strong>cash-flow</strong> est la
              réalité de votre compte en banque à la fin du mois — la différence entre ce qui rentre
              (loyers) et ce qui sort (charges, crédit, impôts).
            </p>

            {/* 3 niveaux */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div className="bg-white rounded-3xl p-6 border border-outline-variant/15 shadow-sm space-y-3">
                <h4 className="font-headline font-bold text-on-surface">Cash-flow Brut</h4>
                <p className="text-xs text-on-surface-variant">Indicateur rapide banque</p>
                <FormulaBox>Loyer mensuel - Mensualité crédit</FormulaBox>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Ce qu&apos;il reste pour payer les charges et impôts. Si négatif dès ce stade,
                  l&apos;effort d&apos;épargne sera important.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-outline-variant/15 shadow-sm space-y-3">
                <h4 className="font-headline font-bold text-on-surface">Cash-flow Net</h4>
                <p className="text-xs text-on-surface-variant">
                  Avant impôts — Trésorerie courante
                </p>
                <FormulaBox>Loyer - Charges - Crédit</FormulaBox>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Votre trésorerie réelle mois après mois, avant la régularisation fiscale annuelle.
                </p>
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6 shadow-sm space-y-3">
                <h4 className="font-headline font-bold text-on-surface">Cash-flow Net-Net</h4>
                <p className="text-xs text-on-surface-variant">Après impôts — Le verdict final</p>
                <FormulaBox highlight>Cash-flow Net - (Impôts / 12)</FormulaBox>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Ce qui rentre <strong>réellement</strong> dans votre poche une fois tout payé. Les
                  « Impôts » incluent l&apos;IR (selon TMI) et les Prélèvements Sociaux (17.2% ou
                  18.6% BIC), ou l&apos;IS pour une SCI.
                </p>
              </div>
            </div>

            {/* Effort d'épargne */}
            <div className="bg-white rounded-3xl p-7 border-l-4 border-l-error border-r border-t border-b border-outline-variant/15 shadow-sm">
              <h4 className="font-headline font-bold text-on-surface mb-1">
                Effort d&apos;épargne
              </h4>
              <p className="text-sm text-on-surface-variant mb-4">
                Quand le cash-flow est négatif, c&apos;est vous qui payez.
              </p>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 space-y-4">
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    Si le Cash-flow Net-Net est négatif (ex: -150€/mois), on parle d&apos;
                    <strong>effort d&apos;épargne</strong>. Vous devez sortir 150€ de votre salaire
                    chaque mois pour combler le déficit.
                  </p>
                  <ExpertTip variant="warning">
                    <strong>Stratégie :</strong> Un effort d&apos;épargne n&apos;est pas forcément
                    mauvais s&apos;il permet d&apos;acquérir un patrimoine important (stratégie
                    patrimoniale). Mais il réduit votre capacité d&apos;emprunt future.
                  </ExpertTip>
                </div>
                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20 min-w-[200px] text-center shrink-0">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Formule
                  </p>
                  <p className="text-sm font-bold text-on-surface mt-2">
                    Valeur Absolue (Cash-flow négatif)
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    = Montant à injecter mensuellement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
