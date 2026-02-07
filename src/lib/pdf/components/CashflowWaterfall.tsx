import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, colors } from '../styles';
import { formatCurrency } from '../utils/formatters';
import type { CashflowResultat, ExploitationData, FinancementResultat, FiscaliteResultat } from '@/types/calculateur';

interface CashflowWaterfallProps {
    loyerMensuel: number;
    chargesMensuelles: number; // Copro + PNO + ...
    mensualite: number;
    impotMensuel: number;
    cashflow: CashflowResultat;
}

export function CashflowWaterfall({
    loyerMensuel,
    chargesMensuelles,
    mensualite,
    impotMensuel,
    cashflow
}: CashflowWaterfallProps) {

    const Row = ({ label, value, isNegative = false, isResult = false, isLast = false }: any) => (
        <View style={[
            styles.rowBetween,
            { paddingVertical: 4 },
            isResult && { borderTopWidth: 1, borderTopColor: colors.border, marginTop: 4, paddingTop: 6 },
            isLast && { backgroundColor: value >= 0 ? '#ECFDF5' : '#FEF2F2', padding: 8, borderRadius: 4, marginTop: 8 }
        ]}>
            <Text style={[
                isResult ? styles.textBold : styles.label,
                isLast && { color: value >= 0 ? colors.success : colors.error, fontSize: 10, textTransform: 'uppercase' }
            ]}>
                {label}
            </Text>
            <Text style={[
                isResult ? styles.value : styles.text,
                isNegative && { color: colors.error },
                isLast && { color: value >= 0 ? colors.success : colors.error, fontSize: 12, fontWeight: 'bold' }
            ]}>
                {isNegative && value > 0 ? '-' : ''}{formatCurrency(value)}
            </Text>
        </View>
    );

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Analyse du Cashflow Mensuel</Text>
            </View>

            <View style={{ padding: 4 }}>
                <Row label="Loyer cc" value={loyerMensuel} />
                <Row label="Charges & Taxe foncière (lisée)" value={chargesMensuelles} isNegative />

                <Row label="Cashflow Brut" value={loyerMensuel - chargesMensuelles} isResult />

                <Row label="Mensualité de Crédit" value={mensualite} isNegative />

                <Row label="Cashflow Net" value={cashflow.mensuel_brut || (loyerMensuel - chargesMensuelles - mensualite)} isResult />

                <Row label="Impôts (estimé lissé)" value={impotMensuel} isNegative />

                <Row label="CASHFLOW NET-NET" value={cashflow.mensuel} isResult isLast />
            </View>
        </View>
    );
}
