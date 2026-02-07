/**
 * PDF Financial Table Component
 * Displays financial recap and projections
 */
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { styles, colors } from '../styles';
import { formatCurrency, formatPercent } from '../utils/formatters';
import type { RentabiliteResultat, CashflowResultat, FiscaliteResultat, ProjectionData, FiscaliteComparaison } from '@/types/calculateur';

interface FinancialTableProps {
    rentabilite: RentabiliteResultat;
    cashflow: CashflowResultat;
    fiscalite: FiscaliteResultat;
    projections?: ProjectionData;
    comparaison?: FiscaliteComparaison;
}

export function FinancialTable({ rentabilite, cashflow, fiscalite, projections, comparaison }: FinancialTableProps) {
    return (
        <View style={styles.section}>
            {/* Récapitulatif Rentabilité */}
            <View style={styles.card} wrap={false}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Indicateurs de Performance</Text>
                </View>

                <View style={[styles.col2, { marginBottom: 10 }]}>
                    <View style={styles.flex1}>
                        <Text style={[styles.h3, { fontSize: 10, color: colors.textMuted }]}>Rentabilité</Text>
                        <View style={styles.rowBetween}>
                            <Text style={styles.label}>Brute</Text>
                            <Text style={styles.value}>{formatPercent(rentabilite.brute)}</Text>
                        </View>
                        <View style={styles.rowBetween}>
                            <Text style={styles.label}>Nette (charges)</Text>
                            <Text style={styles.value}>{formatPercent(rentabilite.nette)}</Text>
                        </View>
                        <View style={styles.rowBetween}>
                            <Text style={styles.label}>Nette-Nette (impôts)</Text>
                            <Text style={[styles.value, { color: colors.primary }]}>{formatPercent(rentabilite.nette_nette)}</Text>
                        </View>
                    </View>

                    <View style={styles.flex1}>
                        <Text style={[styles.h3, { fontSize: 10, color: colors.textMuted }]}>Cashflow</Text>
                        <View style={styles.rowBetween}>
                            <Text style={styles.label}>Mensuel Net</Text>
                            <Text style={[styles.value, cashflow.mensuel >= 0 ? styles.textSuccess : styles.textError]}>
                                {formatCurrency(cashflow.mensuel)}
                            </Text>
                        </View>
                        <View style={styles.rowBetween}>
                            <Text style={styles.label}>Annuel Net</Text>
                            <Text style={[styles.value, cashflow.annuel >= 0 ? styles.textSuccess : styles.textError]}>
                                {formatCurrency(cashflow.annuel)}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Fiscalité */}
            <View wrap={false}>
                <Text style={styles.h2}>Fiscalité ({fiscalite.regime})</Text>
                <View style={styles.card}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Impôt annuel estimé (lissé)</Text>
                        <Text style={[styles.value, styles.textError]}>{formatCurrency(fiscalite.impot_estime)}</Text>
                    </View>
                    {fiscalite.dividendes_bruts !== undefined && (
                        <View style={styles.rowBetween}>
                            <Text style={styles.label}>Flat Tax (30%)</Text>
                            <Text style={[styles.value, styles.textError]}>{formatCurrency(fiscalite.flat_tax || 0)}</Text>
                        </View>
                    )}
                    <View style={[styles.rowBetween, { marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: colors.border }]}>
                        <Text style={[styles.label, styles.textBold]}>Revenu Net après impôt</Text>
                        <Text style={[styles.valueLarge, styles.textSuccess]}>
                            {formatCurrency(fiscalite.revenu_net_apres_impot)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Comparaison Fiscale */}
            {comparaison && comparaison.items.length > 0 && (
                <View wrap={false}>
                    <Text style={styles.h3}>Comparaison des régimes fiscaux</Text>
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Régime</Text>
                            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Impôt/an</Text>
                            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Cashflow</Text>
                            <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: 'right' }]}>Renta</Text>
                        </View>
                        {comparaison.items.map((item, index) => (
                            <View key={index} style={[
                                styles.tableRow,
                                index === comparaison.items.length - 1 ? styles.tableRowLast : {},
                                item.isOptimal ? { backgroundColor: '#ECFDF5' } : {}
                            ]}>
                                <Text style={[styles.tableCell, { flex: 2, fontWeight: item.isOptimal ? 'bold' : 'normal' }]}>
                                    {item.regime} {item.isOptimal && "(Recommandé)"}
                                </Text>
                                <Text style={[styles.tableCell, styles.textRight, { flex: 1 }]}>{formatCurrency(item.impotAnnuelMoyen)}</Text>
                                <Text style={[styles.tableCell, styles.textRight, { flex: 1, fontWeight: 'bold' }]}>{formatCurrency(item.cashflowNetMoyen)}</Text>
                                <Text style={[styles.tableCell, styles.textRight, { flex: 1 }]}>{formatPercent(item.rentabiliteNetteNette)}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Projections sur horizon */}
            {projections && projections.totaux && (
                <View style={{ marginTop: 10 }} wrap={false}>
                    <Text style={styles.h2}>Projections sur {projections.horizon} ans</Text>
                    <View style={styles.card}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.label}>Enrichissement Total (Patrimoine + Cashflow)</Text>
                            <Text style={[styles.valueLarge, styles.textSuccess]}>
                                {formatCurrency(projections.totaux.enrichissementTotal)}
                            </Text>
                        </View>

                        <View style={{ marginVertical: 8, height: 1, backgroundColor: colors.border }} />

                        <View style={styles.col2}>
                            <View style={styles.flex1}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.label}>Cashflow cumulé</Text>
                                    <Text style={[styles.value, projections.totaux.cashflowCumule >= 0 ? styles.textSuccess : styles.textError]}>
                                        {formatCurrency(projections.totaux.cashflowCumule)}
                                    </Text>
                                </View>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.label}>Capital remboursé</Text>
                                    <Text style={styles.value}>{formatCurrency(projections.totaux.capitalRembourse)}</Text>
                                </View>
                            </View>
                            <View style={styles.flex1}>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.label}>Impôt cumulé</Text>
                                    <Text style={[styles.value, styles.textError]}>{formatCurrency(projections.totaux.impotCumule)}</Text>
                                </View>
                                <View style={styles.rowBetween}>
                                    <Text style={styles.label}>TRI annuel</Text>
                                    <Text style={[styles.value, styles.textBold, { color: colors.chart3 }]}>
                                        {formatPercent(projections.totaux.tri)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
}
