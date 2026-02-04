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
import type { CalculateurFormData, CalculResultats } from '@/types/calculateur';

interface RapportSimulationProps {
    formData: CalculateurFormData;
    resultats: CalculResultats;
    generatedAt?: Date;
}

const DISCLAIMER = "Ce document est fourni à titre informatif uniquement et ne constitue pas un conseil financier, fiscal ou juridique. Les résultats présentés sont des estimations basées sur les données saisies et ne garantissent pas les performances futures de l'investissement. Consultez un professionnel qualifié avant toute décision d'investissement.";

export function RapportSimulation({ formData, resultats, generatedAt = new Date() }: RapportSimulationProps) {
    const { bien, financement, exploitation, structure } = formData;
    const { rentabilite, cashflow, fiscalite, hcsf, synthese, projections, comparaisonFiscalite } = resultats;

    return (
        <Document>
            {/* Page 1: Synthèse */}
            <Page size="A4" style={styles.page}>
                <Header title="Rapport de Simulation" date={generatedAt} />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>{"Synthèse de l'investissement"}</Text>
                    {bien.adresse && (
                        <Text style={{ fontSize: 10, color: colors.stone, marginBottom: 10 }}>
                            {bien.adresse}
                        </Text>
                    )}
                </View>

                <ScoreGauge score={synthese.score_global} />

                <KeyMetrics
                    rentaBrute={rentabilite.brute}
                    rentaNette={rentabilite.nette}
                    cashflow={cashflow.mensuel}
                    tauxHCSF={hcsf.taux_endettement}
                    mensualite={resultats.financement.mensualite}
                />

                {/* Recommandation */}
                <View style={[styles.card, { backgroundColor: colors.surface }]}>
                    <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.forest, marginBottom: 5 }}>
                        Recommandation
                    </Text>
                    <Text style={{ fontSize: 9, color: colors.charcoal, lineHeight: 1.4 }}>
                        {synthese.recommandation}
                    </Text>
                </View>

                {/* Points d'attention */}
                {synthese.points_attention && synthese.points_attention.length > 0 && (
                    <View style={[styles.section, { marginTop: 10 }]}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: colors.amber, marginBottom: 5 }}>
                            {"Points d'attention"}
                        </Text>
                        {synthese.points_attention.map((point, index) => (
                            <Text key={index} style={{ fontSize: 9, color: colors.charcoal, marginBottom: 3 }}>
                                • {point}
                            </Text>
                        ))}
                    </View>
                )}

                <Footer pageNumber={1} totalPages={4} />
            </Page>

            {/* Page 2: Détail du bien */}
            <Page size="A4" style={styles.page}>
                <Header title="Détail du Bien & Financement" date={generatedAt} />

                <PropertyDetails
                    bien={bien}
                    financement={financement}
                    exploitation={exploitation}
                    montantEmprunt={resultats.financement.montant_emprunt}
                    mensualite={resultats.financement.mensualite}
                />

                <Footer pageNumber={2} totalPages={4} />
            </Page>

            {/* Page 3: Analyse financière */}
            <Page size="A4" style={styles.page}>
                <Header title="Analyse Financière" date={generatedAt} />

                <FinancialTable
                    rentabilite={rentabilite}
                    cashflow={cashflow}
                    fiscalite={fiscalite}
                    projections={projections}
                    comparaison={comparaisonFiscalite}
                />

                {/* Structure juridique */}
                <View style={[styles.section, { marginTop: 10 }]}>
                    <Text style={styles.sectionTitle}>Structure Juridique</Text>
                    <View style={styles.card}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ fontSize: 9, color: colors.stone }}>Type</Text>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.charcoal }}>
                                {structure.type === 'nom_propre' ? 'Nom Propre' : 'SCI IS'}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                            <Text style={{ fontSize: 9, color: colors.stone }}>TMI</Text>
                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.charcoal }}>
                                {structure.tmi}%
                            </Text>
                        </View>
                        {structure.regime_fiscal && (
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={{ fontSize: 9, color: colors.stone }}>Régime fiscal</Text>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.charcoal }}>
                                    {structure.regime_fiscal.replace('_', ' ').toUpperCase()}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                <Footer pageNumber={3} totalPages={4} />
            </Page>

            {/* Page 4: Conformité HCSF */}
            <Page size="A4" style={styles.page}>
                <Header title="Conformité HCSF" date={generatedAt} />

                <HcsfAnalysis hcsf={hcsf} />

                {/* Disclaimer - Flux normal */}
                <View style={{
                    marginTop: 20,
                    padding: 12,
                    backgroundColor: colors.surface,
                    borderRadius: 4,
                }}>
                    <Text style={{ fontSize: 8, fontWeight: 'bold', color: colors.stone, marginBottom: 4 }}>
                        AVERTISSEMENT
                    </Text>
                    <Text style={{ fontSize: 7, color: colors.stone, lineHeight: 1.4 }}>
                        {DISCLAIMER}
                    </Text>
                </View>

                <Footer pageNumber={4} totalPages={4} />
            </Page>
        </Document>
    );
}
