/**
 * PDF Property Details Component
 * Displays property, financing, and exploitation information
 */
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles';
import type { BienData, FinancementData, ExploitationData } from '@/types/calculateur';

interface PropertyDetailsProps {
    bien: BienData;
    financement: FinancementData;
    exploitation: ExploitationData;
    montantEmprunt: number;
    mensualite: number;
}

const detailStyles = StyleSheet.create({
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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    rowAlt: {
        backgroundColor: colors.surface,
    },
    label: {
        fontSize: 9,
        color: colors.stone,
        flex: 1,
    },
    value: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.charcoal,
        textAlign: 'right',
    },
    grid: {
        flexDirection: 'row',
        gap: 15,
    },
    column: {
        flex: 1,
    },
});

function formatCurrency(value: number): string {
    return `${value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`;
}

function formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
}

function getTypeBienLabel(type: string): string {
    const labels: Record<string, string> = {
        appartement: 'Appartement',
        maison: 'Maison',
        immeuble: 'Immeuble',
    };
    return labels[type] || type;
}

function getTypeLocationLabel(type: string): string {
    const labels: Record<string, string> = {
        nue: 'Location nue',
        meublee_longue_duree: 'Meublée longue durée',
        meublee_tourisme_classe: 'Meublée tourisme classé',
        meublee_tourisme_non_classe: 'Meublée tourisme non classé',
    };
    return labels[type] || type;
}

export function PropertyDetails({ bien, financement, exploitation, montantEmprunt, mensualite }: PropertyDetailsProps) {
    return (
        <View style={detailStyles.grid}>
            {/* Colonne gauche : Le bien */}
            <View style={detailStyles.column}>
                <Text style={detailStyles.sectionTitle}>Le Bien</Text>

                <View style={detailStyles.row}>
                    <Text style={detailStyles.label}>Type</Text>
                    <Text style={detailStyles.value}>{getTypeBienLabel(bien.type_bien)}</Text>
                </View>
                <View style={[detailStyles.row, detailStyles.rowAlt]}>
                    <Text style={detailStyles.label}>{"Prix d'achat"}</Text>
                    <Text style={detailStyles.value}>{formatCurrency(bien.prix_achat)}</Text>
                </View>
                {bien.surface && (
                    <View style={detailStyles.row}>
                        <Text style={detailStyles.label}>Surface</Text>
                        <Text style={detailStyles.value}>{bien.surface} m²</Text>
                    </View>
                )}
                <View style={[detailStyles.row, detailStyles.rowAlt]}>
                    <Text style={detailStyles.label}>Travaux</Text>
                    <Text style={detailStyles.value}>{formatCurrency(bien.montant_travaux)}</Text>
                </View>
                <View style={detailStyles.row}>
                    <Text style={detailStyles.label}>Mobilier</Text>
                    <Text style={detailStyles.value}>{formatCurrency(bien.valeur_mobilier)}</Text>
                </View>

                <Text style={[detailStyles.sectionTitle, { marginTop: 15 }]}>Exploitation</Text>

                <View style={detailStyles.row}>
                    <Text style={detailStyles.label}>Type location</Text>
                    <Text style={detailStyles.value}>{getTypeLocationLabel(exploitation.type_location)}</Text>
                </View>
                <View style={[detailStyles.row, detailStyles.rowAlt]}>
                    <Text style={detailStyles.label}>Loyer mensuel</Text>
                    <Text style={detailStyles.value}>{formatCurrency(exploitation.loyer_mensuel)}</Text>
                </View>
                <View style={detailStyles.row}>
                    <Text style={detailStyles.label}>Vacance locative</Text>
                    <Text style={detailStyles.value}>{formatPercent(exploitation.provision_vacance)}</Text>
                </View>
            </View>

            {/* Colonne droite : Financement */}
            <View style={detailStyles.column}>
                <Text style={detailStyles.sectionTitle}>Financement</Text>

                <View style={detailStyles.row}>
                    <Text style={detailStyles.label}>Apport</Text>
                    <Text style={detailStyles.value}>{formatCurrency(financement.apport)}</Text>
                </View>
                <View style={[detailStyles.row, detailStyles.rowAlt]}>
                    <Text style={detailStyles.label}>{"Montant emprunté"}</Text>
                    <Text style={detailStyles.value}>{formatCurrency(montantEmprunt)}</Text>
                </View>
                <View style={detailStyles.row}>
                    <Text style={detailStyles.label}>{"Taux d'intérêt"}</Text>
                    <Text style={detailStyles.value}>{formatPercent(financement.taux_interet)}</Text>
                </View>
                <View style={[detailStyles.row, detailStyles.rowAlt]}>
                    <Text style={detailStyles.label}>Durée</Text>
                    <Text style={detailStyles.value}>{financement.duree_emprunt} ans</Text>
                </View>
                <View style={detailStyles.row}>
                    <Text style={detailStyles.label}>{"Mensualité"}</Text>
                    <Text style={detailStyles.value}>{formatCurrency(mensualite)}</Text>
                </View>

                <Text style={[detailStyles.sectionTitle, { marginTop: 15 }]}>Charges</Text>

                <View style={detailStyles.row}>
                    <Text style={detailStyles.label}>Charges copro</Text>
                    <Text style={detailStyles.value}>{formatCurrency(exploitation.charges_copro)}</Text>
                </View>
                <View style={[detailStyles.row, detailStyles.rowAlt]}>
                    <Text style={detailStyles.label}>{"Taxe foncière"}</Text>
                    <Text style={detailStyles.value}>{formatCurrency(exploitation.taxe_fonciere)}</Text>
                </View>
                <View style={detailStyles.row}>
                    <Text style={detailStyles.label}>Assurance PNO</Text>
                    <Text style={detailStyles.value}>{formatCurrency(exploitation.assurance_pno)}</Text>
                </View>
                <View style={[detailStyles.row, detailStyles.rowAlt]}>
                    <Text style={detailStyles.label}>Gestion locative</Text>
                    <Text style={detailStyles.value}>{formatPercent(exploitation.gestion_locative)}</Text>
                </View>
            </View>
        </View>
    );
}
