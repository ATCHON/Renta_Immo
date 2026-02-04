/**
 * PDF HCSF Analysis Component
 * Displays HCSF compliance analysis and details
 */
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles';
import type { HCSFResultat } from '@/types/calculateur';

interface HcsfAnalysisProps {
    hcsf: HCSFResultat;
}

const hcsfStyles = StyleSheet.create({
    container: {
        marginBottom: 15,
    },
    statusCard: {
        padding: 15,
        borderRadius: 4,
        marginBottom: 15,
        alignItems: 'center',
    },
    statusConforme: {
        backgroundColor: '#E8F5E9',
    },
    statusNonConforme: {
        backgroundColor: '#FFEBEE',
    },
    statusIcon: {
        fontSize: 24,
        marginBottom: 5,
    },
    statusTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    statusTitleConforme: {
        color: '#2E7D32',
    },
    statusTitleNonConforme: {
        color: '#C62828',
    },
    statusSubtitle: {
        fontSize: 10,
        color: colors.stone,
    },
    gaugeContainer: {
        width: '100%',
        marginTop: 10,
        marginBottom: 5,
    },
    gaugeLabel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    gaugeLabelText: {
        fontSize: 9,
        color: colors.stone,
    },
    gaugeTrack: {
        height: 12,
        backgroundColor: '#E0E0E0',
        borderRadius: 6,
        overflow: 'hidden',
        position: 'relative',
    },
    gaugeFill: {
        height: '100%',
        borderRadius: 6,
    },
    gaugeThreshold: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: colors.charcoal,
        left: '70%', // 35 is 70% of 50 (max gauge)
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.forest,
        marginBottom: 8,
        marginTop: 10,
    },
    table: {
        width: '100%',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.forest,
        padding: 8,
    },
    tableHeaderCell: {
        color: colors.white,
        fontSize: 9,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        padding: 6,
    },
    tableRowAlt: {
        backgroundColor: colors.surface,
    },
    tableCell: {
        fontSize: 9,
        color: colors.charcoal,
    },
    tableCellConforme: {
        color: colors.sage,
        fontWeight: 'bold',
    },
    tableCellNonConforme: {
        color: colors.terracotta,
        fontWeight: 'bold',
    },
    infoBox: {
        backgroundColor: colors.surface,
        padding: 12,
        borderRadius: 4,
        marginTop: 10,
    },
    infoTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.forest,
        marginBottom: 5,
    },
    infoText: {
        fontSize: 9,
        color: colors.stone,
        lineHeight: 1.4,
    },
});

import { formatPercent } from '../utils/formatters';

export function HcsfAnalysis({ hcsf }: HcsfAnalysisProps) {
    const { taux_endettement, conforme, details_associes } = hcsf;
    const fillWidth = Math.min(taux_endettement, 50);

    return (
        <View style={hcsfStyles.container}>
            {/* Status Card */}
            <View style={[
                hcsfStyles.statusCard,
                conforme ? hcsfStyles.statusConforme : hcsfStyles.statusNonConforme
            ]}>
                <Text style={hcsfStyles.statusIcon}>{conforme ? '✓' : '✗'}</Text>
                <Text style={[
                    hcsfStyles.statusTitle,
                    conforme ? hcsfStyles.statusTitleConforme : hcsfStyles.statusTitleNonConforme
                ]}>
                    {conforme ? 'CONFORME AUX NORMES HCSF' : 'NON CONFORME AUX NORMES HCSF'}
                </Text>
                <Text style={hcsfStyles.statusSubtitle}>
                    {"Taux d'endettement : "}{formatPercent(taux_endettement)}{" (seuil : 35%)"}
                </Text>

                {/* Gauge */}
                <View style={hcsfStyles.gaugeContainer}>
                    <View style={hcsfStyles.gaugeLabel}>
                        <Text style={hcsfStyles.gaugeLabelText}>0%</Text>
                        <Text style={hcsfStyles.gaugeLabelText}>35%</Text>
                        <Text style={hcsfStyles.gaugeLabelText}>50%</Text>
                    </View>
                    <View style={hcsfStyles.gaugeTrack}>
                        <View style={[
                            hcsfStyles.gaugeFill,
                            {
                                width: `${(fillWidth / 50) * 100}%`,
                                backgroundColor: conforme ? colors.sage : colors.terracotta,
                            }
                        ]} />
                        <View style={hcsfStyles.gaugeThreshold} />
                    </View>
                </View>
            </View>

            {/* Détails par associé */}
            {details_associes && details_associes.length > 0 && (
                <>
                    <Text style={hcsfStyles.sectionTitle}>Détail par associé</Text>
                    <View style={hcsfStyles.table}>
                        <View style={hcsfStyles.tableHeader}>
                            <View style={{ flex: 2 }}>
                                <Text style={hcsfStyles.tableHeaderCell}>Associé</Text>
                            </View>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Text style={hcsfStyles.tableHeaderCell}>Taux HCSF</Text>
                            </View>
                            <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                <Text style={hcsfStyles.tableHeaderCell}>Statut</Text>
                            </View>
                        </View>
                        {details_associes.map((associe, index) => (
                            <View key={index} style={[hcsfStyles.tableRow, index % 2 === 1 ? hcsfStyles.tableRowAlt : {}]}>
                                <View style={{ flex: 2 }}>
                                    <Text style={hcsfStyles.tableCell}>{associe.nom}</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                    <Text style={hcsfStyles.tableCell}>{formatPercent(associe.taux_endettement)}</Text>
                                </View>
                                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                                    <Text style={[
                                        hcsfStyles.tableCell,
                                        associe.conforme ? hcsfStyles.tableCellConforme : hcsfStyles.tableCellNonConforme
                                    ]}>
                                        {associe.conforme ? 'Conforme' : 'Non conforme'}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </>
            )}

            {/* Informations HCSF */}
            <View style={hcsfStyles.infoBox}>
                <Text style={hcsfStyles.infoTitle}>À propos du HCSF</Text>
                <Text style={hcsfStyles.infoText}>
                    {"Le Haut Conseil de Stabilité Financière (HCSF) limite le taux d'endettement des emprunteurs à 35% des revenus (assurance comprise). Cette règle s'applique depuis janvier 2022."}
                </Text>
            </View>
        </View>
    );
}
