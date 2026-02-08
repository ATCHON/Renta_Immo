/**
 * Rapport de Simulation PDF Template
 * Main template for generating the complete simulation report
 */
import React from 'react';
import { Document, Page, View, Text } from '@react-pdf/renderer';
import { styles, colors } from '../styles';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ScoreGauge } from '../components/ScoreGauge';
import { KeyMetrics } from '../components/KeyMetrics';
import { PropertyDetails } from '../components/PropertyDetails';
import { FinancialTable } from '../components/FinancialTable';
import { HcsfAnalysis } from '../components/HcsfAnalysis';
import { ProjectCost } from '../components/ProjectCost';
import { CashflowWaterfall } from '../components/CashflowWaterfall';
import { PointsAttention } from '../components/PointsAttention';
import type { CalculateurFormData, CalculResultats } from '@/types/calculateur';

interface RapportSimulationProps {
    formData: CalculateurFormData;
    resultats: CalculResultats;
    generatedAt?: Date;
}

const DISCLAIMER = "Ce document est fourni à titre informatif uniquement et ne constitue pas un conseil financier, fiscal ou juridique. Les résultats sont des estimations basées sur les données saisies. Consultez un professionnel avant toute décision d'investissement.";

export function RapportSimulation({ formData, resultats, generatedAt = new Date() }: RapportSimulationProps) {
    const { bien, financement, exploitation, structure } = formData;
    const { rentabilite, cashflow, fiscalite, hcsf, synthese, projections, comparaisonFiscalite } = resultats;

    return (
        <Document>
            {/* Page 1: Synthèse Exécutive */}
            <Page size="A4" style={styles.page}>
                <Header sectionTitle="Synthèse Exécutive" adresse={bien.adresse} date={generatedAt} />

                <ScoreGauge score={synthese.score_global} scoreDetail={synthese.score_detail} />

                <Text style={styles.h2}>Indicateurs Clés</Text>
                <KeyMetrics
                    rentaBrute={rentabilite.brute}
                    rentaNette={rentabilite.nette}
                    cashflow={cashflow.mensuel}
                    tauxHCSF={hcsf.taux_endettement}
                    mensualite={resultats.financement.mensualite}
                    effortEpargne={rentabilite.effort_epargne_mensuel}
                />

                <PointsAttention
                    points={synthese.points_attention}
                    pointsDetail={synthese.points_attention_detail}
                />

                <Footer pageNumber={1} totalPages={4} adresse={bien.adresse} />
            </Page>

            {/* Page 2: Le Projet & Financement */}
            <Page size="A4" style={styles.page}>
                <Header sectionTitle="Projet & Financement" date={generatedAt} />

                <ProjectCost
                    prixAchat={bien.prix_achat}
                    travaux={bien.montant_travaux}
                    mobilier={bien.valeur_mobilier}
                    fraisDossier={financement.frais_dossier || 0}
                    fraisGarantie={financement.frais_garantie || 0}
                    apport={financement.apport}
                    montantEmprunt={resultats.financement.montant_emprunt}
                />

                <Text style={styles.h2}>Détails du Bien & Emprunt</Text>
                <PropertyDetails
                    bien={bien}
                    financement={financement}
                    exploitation={exploitation}
                    montantEmprunt={resultats.financement.montant_emprunt}
                    mensualite={resultats.financement.mensualite}
                />

                <Text style={styles.h2}>Structure Juridique</Text>
                <View style={styles.card}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Type</Text>
                        <Text style={[styles.value, { textTransform: 'uppercase' }]}>
                            {structure.type === 'nom_propre' ? 'Nom Propre' : 'SCI à l\'IS'}
                        </Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>TMI de l&apos;investisseur</Text>
                        <Text style={styles.value}>{structure.tmi}%</Text>
                    </View>
                    {structure.regime_fiscal && (
                        <View style={styles.rowBetween}>
                            <Text style={styles.label}>Régime Fiscal</Text>
                            <Text style={[styles.value, { textTransform: 'uppercase', color: colors.primary }]}>
                                {structure.regime_fiscal.replace(/_/g, ' ')}
                            </Text>
                        </View>
                    )}
                </View>

                <Footer pageNumber={2} totalPages={4} adresse={bien.adresse} />
            </Page>

            {/* Page 3: Analyse d'Exploitation & Cashflow */}
            <Page size="A4" style={styles.page}>
                <Header sectionTitle="Performance Financière" date={generatedAt} />

                <Text style={styles.h2}>Analyse du Cashflow</Text>
                <CashflowWaterfall
                    loyerMensuel={exploitation.loyer_mensuel}
                    chargesMensuelles={
                        (exploitation.charges_copro) +
                        (exploitation.taxe_fonciere / 12) +
                        (exploitation.assurance_pno / 12) +
                        (exploitation.loyer_mensuel * (exploitation.gestion_locative / 100))
                    }
                    mensualite={resultats.financement.mensualite}
                    impotMensuel={fiscalite.impot_estime / 12}
                    cashflow={cashflow}
                />

                <Text style={styles.h2}>Détail de la Rentabilité & Fiscalité</Text>
                <FinancialTable
                    rentabilite={rentabilite}
                    cashflow={cashflow}
                    fiscalite={fiscalite}
                    comparaison={comparaisonFiscalite}
                    projections={undefined}
                />

                <Footer pageNumber={3} totalPages={4} adresse={bien.adresse} />
            </Page>

            {/* Page 4: Projections & Risques */}
            <Page size="A4" style={styles.page}>
                <Header sectionTitle="Projections Patrimoniales" date={generatedAt} />

                {projections && projections.totaux && (
                    <FinancialTable
                        rentabilite={rentabilite}
                        cashflow={cashflow}
                        fiscalite={fiscalite}
                        projections={projections}
                        comparaison={undefined}
                    />
                )}

                <Text style={[styles.h2, { color: colors.warning }]}>Analyse HCSF & Risques</Text>
                <HcsfAnalysis hcsf={hcsf} />

                {/* Recommandation & Avis Final */}
                <View wrap={false}>
                    <Text style={styles.h2}>Avis & Recommandations</Text>
                    <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.primary, marginBottom: 5 }}>
                            Avis de l&apos;analyste
                        </Text>
                        <Text style={{ fontSize: 10, color: colors.textMain, lineHeight: 1.5 }}>
                            {synthese.recommandation}
                        </Text>
                    </View>
                </View>

                <View style={{ marginTop: 20, padding: 15, backgroundColor: colors.surface, borderRadius: 4 }}>
                    <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.textMuted, marginBottom: 5 }}>
                        AVERTISSEMENT
                    </Text>
                    <Text style={{ fontSize: 8, color: colors.textMuted, textAlign: 'justify' }}>
                        {DISCLAIMER}
                    </Text>
                </View>

                <Footer pageNumber={4} totalPages={4} adresse={bien.adresse} />
            </Page>
        </Document>
    );
}
