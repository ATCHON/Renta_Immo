/**
 * Test PDF Generation Script
 * Run with: npx tsx src/lib/pdf/__tests__/generate-test.tsx
 */
import React from 'react';
import { Document, Page, View, Text, renderToFile } from '@react-pdf/renderer';
import path from 'path';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Table } from '../components/Table';
import { styles } from '../styles';

// Test Document
function TestDocument() {
    const testData = [
        { label: 'Rentabilité Brute', value: '8.5%' },
        { label: 'Rentabilité Nette', value: '6.2%' },
        { label: 'Cashflow Mensuel', value: '+350 €' },
        { label: 'Score Global', value: '78/100' },
    ];

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Header title="Renta Immo - Test PDF" date={new Date()} />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Test de Génération PDF</Text>
                    <Text style={{ marginBottom: 10 }}>
                        {"Ce document valide l'installation de @react-pdf/renderer."}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Indicateurs de Test</Text>
                    <View style={styles.card}>
                        {testData.map((item, index) => (
                            <View key={index} style={styles.metricRow}>
                                <Text style={styles.metricLabel}>{item.label}</Text>
                                <Text style={styles.metricValue}>{item.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Table de Test</Text>
                    <Table
                        data={[
                            { annee: '1', cashflow: '4 200 €', cumul: '4 200 €' },
                            { annee: '2', cashflow: '4 350 €', cumul: '8 550 €' },
                            { annee: '3', cashflow: '4 500 €', cumul: '13 050 €' },
                        ]}
                        columns={[
                            { key: 'annee', header: 'Année', width: '20%' },
                            { key: 'cashflow', header: 'Cashflow', width: '40%', align: 'right' },
                            { key: 'cumul', header: 'Cumulé', width: '40%', align: 'right' },
                        ]}
                    />
                </View>

                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreValue}>78</Text>
                    <Text style={styles.scoreLabel}>Score Global</Text>
                </View>

                <Footer pageNumber={1} totalPages={1} />
            </Page>
        </Document>
    );
}

// Generate test PDF
async function generateTestPdf() {
    const outputPath = path.join(process.cwd(), 'test-output.pdf');

    console.log('🔄 Generating test PDF...');

    try {
        await renderToFile(<TestDocument />, outputPath);
        console.log(`✅ PDF generated successfully: ${outputPath}`);
        return true;
    } catch (error) {
        console.error('❌ PDF generation failed:', error);
        return false;
    }
}

generateTestPdf();
