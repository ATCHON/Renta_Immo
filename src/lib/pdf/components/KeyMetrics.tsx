/**
 * PDF Key Metrics Component
 * Displays the main financial indicators in a grid
 */
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles';
import { formatCurrency, formatPercent, formatCurrencyWithSign } from '../utils/formatters';

interface KeyMetricsProps {
  rentaBrute: number;
  rentaNette: number;
  cashflow: number;
  tauxHCSF: number;
  mensualite?: number;
  effortEpargne?: number;
}

const localStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: '48%',
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderColor: colors.primary,
  },
  metricCardFull: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 10,
    color: colors.textLight,
    marginBottom: 6,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 20,
    fontWeight: 'extrabold',
    color: colors.textMain,
    marginBottom: 2,
  },
  subtext: {
    fontSize: 9,
    color: colors.textMuted,
  },
});

export function KeyMetrics({
  rentaBrute,
  rentaNette,
  cashflow,
  tauxHCSF,
  mensualite,
  effortEpargne,
}: KeyMetricsProps) {
  const isHcsfConform = tauxHCSF <= 35;
  const isCashflowPositive = cashflow >= 0;

  return (
    <View style={localStyles.container}>
      {/* Rentabilité Brute */}
      <View style={[localStyles.metricCard, { borderColor: colors.chart1 }]}>
        <Text style={localStyles.label}>Rentabilité Brute</Text>
        <Text style={[localStyles.value, { color: colors.chart1 }]}>
          {formatPercent(rentaBrute)}
        </Text>
        <Text style={localStyles.subtext}>Loyer / Prix achat</Text>
      </View>

      {/* Rentabilité Nette */}
      <View style={[localStyles.metricCard, { borderColor: colors.chart2 }]}>
        <Text style={localStyles.label}>Rentabilité Nette</Text>
        <Text style={[localStyles.value, { color: colors.chart2 }]}>
          {formatPercent(rentaNette)}
        </Text>
        <Text style={localStyles.subtext}>Après charges</Text>
      </View>

      {/* Cashflow */}
      <View
        style={[
          localStyles.metricCard,
          { borderColor: isCashflowPositive ? colors.success : colors.error },
        ]}
      >
        <Text style={localStyles.label}>Cashflow Mensuel</Text>
        <Text
          style={[localStyles.value, { color: isCashflowPositive ? colors.success : colors.error }]}
        >
          {formatCurrencyWithSign(cashflow)}
        </Text>
        <Text
          style={[
            localStyles.subtext,
            { color: isCashflowPositive ? colors.success : colors.textMuted },
          ]}
        >
          {isCashflowPositive
            ? 'Autofinancé'
            : effortEpargne !== undefined
              ? `Effort d'épargne : ${formatCurrency(effortEpargne)}/mois`
              : 'Net avant impôts'}
        </Text>
      </View>

      {/* Taux HCSF */}
      <View
        style={[
          localStyles.metricCard,
          { borderColor: isHcsfConform ? colors.success : colors.warning },
        ]}
      >
        <Text style={localStyles.label}>Taux HCSF</Text>
        <Text
          style={[localStyles.value, { color: isHcsfConform ? colors.success : colors.warning }]}
        >
          {formatPercent(tauxHCSF)}
        </Text>
        <Text style={localStyles.subtext}>
          {isHcsfConform ? 'Conforme (≤ 35%)' : 'Attention (> 35%)'}
        </Text>
      </View>

      {/* Mensualité si présente */}
      {mensualite !== undefined && (
        <View style={localStyles.metricCardFull}>
          <View>
            <Text style={localStyles.label}>Mensualité de Crédit</Text>
            <Text style={localStyles.subtext}>Assurance incluse</Text>
          </View>
          <Text style={[localStyles.value, { fontSize: 16, color: colors.primary }]}>
            {formatCurrency(mensualite)}/mois
          </Text>
        </View>
      )}
    </View>
  );
}
