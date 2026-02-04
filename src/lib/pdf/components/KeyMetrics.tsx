/**
 * PDF Key Metrics Component
 * Displays the main financial indicators in a grid
 */
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles';

interface KeyMetricsProps {
    rentaBrute: number;
    rentaNette: number;
    cashflow: number;
    tauxHCSF: number;
    mensualite?: number;
}

import { formatCurrency, formatPercent, formatCurrencyWithSign } from '../utils/formatters';

const metricsStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 15,
    },
    metric: {
        width: '48%',
        padding: 12,
        backgroundColor: colors.surface,
        borderRadius: 4,
        marginBottom: 8,
    },
    metricFull: {
        width: '100%',
        padding: 12,
        backgroundColor: colors.surface,
        borderRadius: 4,
        marginBottom: 8,
    },
    label: {
        fontSize: 9,
        color: colors.stone,
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.charcoal,
    },
    valuePositive: {
        color: colors.sage,
    },
    valueNegative: {
        color: colors.terracotta,
    },
    valueWarning: {
        color: colors.amber,
    },
    subtext: {
        fontSize: 8,
        color: colors.stone,
        marginTop: 2,
    },
});



export function KeyMetrics({ rentaBrute, rentaNette, cashflow, tauxHCSF, mensualite }: KeyMetricsProps) {
    const isHcsfConform = tauxHCSF <= 35;
    const isCashflowPositive = cashflow >= 0;

    return (
        <View style={metricsStyles.container}>
            {/* Rentabilité Brute */}
            <View style={metricsStyles.metric}>
                <Text style={metricsStyles.label}>Rentabilité Brute</Text>
                <Text style={metricsStyles.value}>{formatPercent(rentaBrute)}</Text>
                <Text style={metricsStyles.subtext}>Loyer / Prix achat</Text>
            </View>

            {/* Rentabilité Nette */}
            <View style={metricsStyles.metric}>
                <Text style={metricsStyles.label}>Rentabilité Nette</Text>
                <Text style={[metricsStyles.value, rentaNette > 5 ? metricsStyles.valuePositive : {}]}>
                    {formatPercent(rentaNette)}
                </Text>
                <Text style={metricsStyles.subtext}>Après charges</Text>
            </View>

            {/* Cashflow */}
            <View style={metricsStyles.metric}>
                <Text style={metricsStyles.label}>Cashflow Mensuel</Text>
                <Text style={[
                    metricsStyles.value,
                    isCashflowPositive ? metricsStyles.valuePositive : metricsStyles.valueNegative
                ]}>
                    {formatCurrencyWithSign(cashflow)}
                </Text>
                <Text style={metricsStyles.subtext}>Par mois</Text>
            </View>

            {/* Taux HCSF */}
            <View style={metricsStyles.metric}>
                <Text style={metricsStyles.label}>Taux HCSF</Text>
                <Text style={[
                    metricsStyles.value,
                    isHcsfConform ? metricsStyles.valuePositive : metricsStyles.valueNegative
                ]}>
                    {formatPercent(tauxHCSF)}
                </Text>
                <Text style={metricsStyles.subtext}>
                    {isHcsfConform ? 'Conforme (≤ 35%)' : 'Non conforme (> 35%)'}
                </Text>
            </View>

            {/* Mensualité si présente */}
            {mensualite !== undefined && (
                <View style={metricsStyles.metricFull}>
                    <Text style={metricsStyles.label}>Mensualité Crédit</Text>
                    <Text style={metricsStyles.value}>{mensualite.toLocaleString('fr-FR')} €</Text>
                    <Text style={metricsStyles.subtext}>Capital + Intérêts + Assurance</Text>
                </View>
            )}
        </View>
    );
}
