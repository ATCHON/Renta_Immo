/**
 * PDF Financial Table Component
 * Displays financial recap and projections
 */
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles';
import { formatCurrency, formatPercent } from '../utils/formatters';
import type { RentabiliteResultat, CashflowResultat, FiscaliteResultat, ProjectionData, FiscaliteComparaison } from '@/types/calculateur';

interface FinancialTableProps {
    rentabilite: RentabiliteResultat;
    cashflow: CashflowResultat;
    fiscalite: FiscaliteResultat;
    projections?: ProjectionData;
    comparaison?: FiscaliteComparaison;
}

const tableStyles = StyleSheet.create({
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.forest,
        marginBottom: 8,
        paddingBottom: 4,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    table: {
        width: '100%',
        marginBottom: 15,
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
    tableCellBold: {
        fontWeight: 'bold',
    },
    tableCellPositive: {
        color: colors.sage,
    },
    tableCellNegative: {
        color: colors.terracotta,
    },
    grid: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 15,
    },
    card: {
        flex: 1,
        padding: 12,
        backgroundColor: colors.surface,
        borderRadius: 4,
    },
    cardTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.forest,
        marginBottom: 8,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    cardLabel: {
        fontSize: 9,
        color: colors.stone,
    },
    cardValue: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.charcoal,
    },
    fiscalCard: {
        padding: 12,
        borderRadius: 4,
        marginBottom: 8,
    },
    fiscalCardOptimal: {
        backgroundColor: '#E8F5E9',
        borderWidth: 1,
        borderColor: colors.sage,
    },
    fiscalCardNormal: {
        backgroundColor: colors.surface,
    },
    fiscalCardTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    fiscalCardOptimalLabel: {
        fontSize: 8,
        color: colors.sage,
        marginBottom: 4,
    },
});



export function FinancialTable({ rentabilite, cashflow, fiscalite, projections, comparaison }: FinancialTableProps) {
    return (
        <View style={tableStyles.section}>
            {/* Récapitulatif Rentabilité */}
            <View style={tableStyles.grid}>
                <View style={tableStyles.card}>
                    <Text style={tableStyles.cardTitle}>Rentabilité</Text>
                    <View style={tableStyles.cardRow}>
                        <Text style={tableStyles.cardLabel}>Brute</Text>
                        <Text style={tableStyles.cardValue}>{formatPercent(rentabilite.brute)}</Text>
                    </View>
                    <View style={tableStyles.cardRow}>
                        <Text style={tableStyles.cardLabel}>Nette charges</Text>
                        <Text style={tableStyles.cardValue}>{formatPercent(rentabilite.nette)}</Text>
                    </View>
                    <View style={tableStyles.cardRow}>
                        <Text style={tableStyles.cardLabel}>Nette-nette (après impôts)</Text>
                        <Text style={tableStyles.cardValue}>{formatPercent(rentabilite.nette_nette)}</Text>
                    </View>
                    {rentabilite.effet_levier !== undefined && (
                        <View style={tableStyles.cardRow}>
                            <Text style={tableStyles.cardLabel}>Effet de levier</Text>
                            <Text style={tableStyles.cardValue}>x{rentabilite.effet_levier.toFixed(2)}</Text>
                        </View>
                    )}
                </View>

                <View style={tableStyles.card}>
                    <Text style={tableStyles.cardTitle}>Cashflow</Text>
                    <View style={tableStyles.cardRow}>
                        <Text style={tableStyles.cardLabel}>Mensuel</Text>
                        <Text style={[
                            tableStyles.cardValue,
                            cashflow.mensuel >= 0 ? tableStyles.tableCellPositive : tableStyles.tableCellNegative
                        ]}>
                            {formatCurrency(cashflow.mensuel)}
                        </Text>
                    </View>
                    <View style={tableStyles.cardRow}>
                        <Text style={tableStyles.cardLabel}>Annuel</Text>
                        <Text style={[
                            tableStyles.cardValue,
                            cashflow.annuel >= 0 ? tableStyles.tableCellPositive : tableStyles.tableCellNegative
                        ]}>
                            {formatCurrency(cashflow.annuel)}
                        </Text>
                    </View>
                    {rentabilite.effort_epargne_mensuel !== undefined && (
                        <View style={tableStyles.cardRow}>
                            <Text style={tableStyles.cardLabel}>Effort épargne</Text>
                            <Text style={tableStyles.cardValue}>{formatCurrency(rentabilite.effort_epargne_mensuel)}/mois</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Fiscalité */}
            <Text style={tableStyles.sectionTitle}>Fiscalité</Text>
            <View style={tableStyles.card}>
                <View style={tableStyles.cardRow}>
                    <Text style={tableStyles.cardLabel}>Régime</Text>
                    <Text style={tableStyles.cardValue}>{fiscalite.regime}</Text>
                </View>
                <View style={tableStyles.cardRow}>
                    <Text style={tableStyles.cardLabel}>Impôt estimé annuel</Text>
                    <Text style={tableStyles.cardValue}>{formatCurrency(fiscalite.impot_estime)}</Text>
                </View>
                <View style={tableStyles.cardRow}>
                    <Text style={tableStyles.cardLabel}>Revenu net après impôt</Text>
                    <Text style={[tableStyles.cardValue, tableStyles.tableCellPositive]}>
                        {formatCurrency(fiscalite.revenu_net_apres_impot)}
                    </Text>
                </View>
                {fiscalite.dividendes_bruts !== undefined && (
                    <>
                        <View style={tableStyles.cardRow}>
                            <Text style={tableStyles.cardLabel}>Dividendes bruts (SCI IS)</Text>
                            <Text style={tableStyles.cardValue}>{formatCurrency(fiscalite.dividendes_bruts)}</Text>
                        </View>
                        <View style={tableStyles.cardRow}>
                            <Text style={tableStyles.cardLabel}>Flat Tax (30%)</Text>
                            <Text style={tableStyles.cardValue}>{formatCurrency(fiscalite.flat_tax || 0)}</Text>
                        </View>
                    </>
                )}
            </View>

            {/* Comparaison Fiscale */}
            {comparaison && comparaison.items.length > 0 && (
                <>
                    <Text style={[tableStyles.sectionTitle, { marginTop: 15 }]}>Comparaison des régimes</Text>
                    {comparaison.items.map((item, index) => (
                        <View key={index} style={[
                            tableStyles.fiscalCard,
                            item.isOptimal ? tableStyles.fiscalCardOptimal : tableStyles.fiscalCardNormal
                        ]}>
                            {item.isOptimal && <Text style={tableStyles.fiscalCardOptimalLabel}>✓ RECOMMANDÉ</Text>}
                            <Text style={tableStyles.fiscalCardTitle}>{item.regime}</Text>
                            <View style={tableStyles.cardRow}>
                                <Text style={tableStyles.cardLabel}>Impôt annuel moyen</Text>
                                <Text style={tableStyles.cardValue}>{formatCurrency(item.impotAnnuelMoyen)}</Text>
                            </View>
                            <View style={tableStyles.cardRow}>
                                <Text style={tableStyles.cardLabel}>Cashflow net moyen</Text>
                                <Text style={tableStyles.cardValue}>{formatCurrency(item.cashflowNetMoyen)}</Text>
                            </View>
                            <View style={tableStyles.cardRow}>
                                <Text style={tableStyles.cardLabel}>Rentabilité nette-nette</Text>
                                <Text style={tableStyles.cardValue}>{formatPercent(item.rentabiliteNetteNette)}</Text>
                            </View>
                        </View>
                    ))}
                </>
            )}

            {/* Projections sur horizon */}
            {projections && projections.totaux && (
                <>
                    <Text style={[tableStyles.sectionTitle, { marginTop: 15 }]}>
                        Projections sur {projections.horizon} ans
                    </Text>
                    <View style={tableStyles.card}>
                        <View style={tableStyles.cardRow}>
                            <Text style={tableStyles.cardLabel}>Cashflow cumulé</Text>
                            <Text style={[
                                tableStyles.cardValue,
                                projections.totaux.cashflowCumule >= 0 ? tableStyles.tableCellPositive : tableStyles.tableCellNegative
                            ]}>
                                {formatCurrency(projections.totaux.cashflowCumule)}
                            </Text>
                        </View>
                        <View style={tableStyles.cardRow}>
                            <Text style={tableStyles.cardLabel}>Capital remboursé</Text>
                            <Text style={tableStyles.cardValue}>{formatCurrency(projections.totaux.capitalRembourse)}</Text>
                        </View>
                        <View style={tableStyles.cardRow}>
                            <Text style={tableStyles.cardLabel}>Impôt cumulé</Text>
                            <Text style={tableStyles.cardValue}>{formatCurrency(projections.totaux.impotCumule)}</Text>
                        </View>
                        <View style={tableStyles.cardRow}>
                            <Text style={tableStyles.cardLabel}>Enrichissement total</Text>
                            <Text style={[tableStyles.cardValue, tableStyles.tableCellPositive]}>
                                {formatCurrency(projections.totaux.enrichissementTotal)}
                            </Text>
                        </View>
                        <View style={tableStyles.cardRow}>
                            <Text style={tableStyles.cardLabel}>TRI (Taux de Rendement Interne)</Text>
                            <Text style={[tableStyles.cardValue, tableStyles.tableCellPositive]}>
                                {formatPercent(projections.totaux.tri)}
                            </Text>
                        </View>
                    </View>
                </>
            )}
        </View>
    );
}
