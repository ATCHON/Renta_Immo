/**
 * PDF HCSF Analysis Component
 * Displays HCSF compliance analysis and details
 */
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { styles, colors } from '../styles';
import { formatPercent } from '../utils/formatters';
import type { HCSFResultat } from '@/types/calculateur';

interface HcsfAnalysisProps {
    hcsf: HCSFResultat;
}

const hcsfStyles = StyleSheet.create({
    statusCard: {
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
        alignItems: 'center',
        borderWidth: 1,
    },
    statusConforme: {
        backgroundColor: '#F0FDF4', // Green 50
        borderColor: colors.success,
    },
    statusNonConforme: {
        backgroundColor: '#FEF2F2', // Red 50
        borderColor: colors.error,
    },
    statusTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    gaugeContainer: {
        width: '100%',
        marginTop: 15,
        marginBottom: 5,
    },
    gaugeTrack: {
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        marginTop: 5,
        overflow: 'hidden',
        position: 'relative',
    },
    gaugeFill: {
        height: '100%',
        borderRadius: 4,
    },
    gaugeThreshold: {
        position: 'absolute',
        top: -2,
        bottom: -2,
        width: 2,
        backgroundColor: colors.textMain,
        left: '70%', // 35% / 50% = 0.7
        zIndex: 10,
    },
});

export function HcsfAnalysis({ hcsf }: HcsfAnalysisProps) {
    const { details_associes } = hcsf;

    // Si pas d'associés (ou liste vide), on n'affiche rien car le taux global est en page 1
    if (!details_associes || details_associes.length === 0) {
        return null;
    }

    return (
        <View style={styles.section} wrap={false}>
            {/* Détails par associé */}
            <View>
                <Text style={styles.h3}>Détail par associé</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Associé</Text>
                        <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Taux</Text>
                        <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Statut</Text>
                    </View>
                    {details_associes.map((associe, index) => (
                        <View key={index} style={[
                            styles.tableRow,
                            index === details_associes.length - 1 ? styles.tableRowLast : {}
                        ]}>
                            <Text style={[styles.tableCell, { flex: 2 }]}>{associe.nom}</Text>
                            <Text style={[styles.tableCell, styles.textRight, { flex: 1 }]}>
                                {formatPercent(associe.taux_endettement)}
                            </Text>
                            <Text style={[
                                styles.tableCell,
                                styles.textRight,
                                { flex: 1, color: associe.conforme ? colors.success : colors.error, fontWeight: 'bold' }
                            ]}>
                                {associe.conforme ? 'OK' : 'KO'}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Informations HCSF */}
            <View style={[styles.card, { backgroundColor: colors.surfaceHighlight, marginTop: 5 }]}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: colors.primary, marginBottom: 4 }}>
                    Règle HCSF
                </Text>
                <Text style={{ fontSize: 9, color: colors.textLight, lineHeight: 1.4 }}>
                    Le taux d'endettement ne doit pas dépasser 35% des revenus, assurance emprunteur incluse.
                    Le calcul prend en compte le différentiel de revenus fonciers (méthode non compensatoire).
                </Text>
            </View>
        </View>
    );
}
