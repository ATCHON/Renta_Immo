/**
 * PDF HCSF Analysis Component
 * Displays HCSF compliance analysis and details
 */
import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, colors } from '../styles';
import { formatPercent } from '../utils/formatters';
import type { HCSFResultat } from '@/types/calculateur';

interface HcsfAnalysisProps {
    hcsf: HCSFResultat;
}

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
                    Le taux d&apos;endettement ne doit pas dépasser 35% des revenus, assurance emprunteur incluse.
                    Le calcul prend en compte le différentiel de revenus fonciers (méthode non compensatoire).
                </Text>
            </View>
        </View>
    );
}
