/**
 * PDF Property Details Component
 * Displays property, financing, and exploitation information
 */
import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, colors } from '../styles';
import { formatCurrency, formatPercent } from '../utils/formatters';
import type { BienData, FinancementData, ExploitationData, TypeBien, TypeLocation } from '@/types/calculateur';

interface PropertyDetailsProps {
    bien: BienData;
    financement: FinancementData;
    exploitation: ExploitationData;
    montantEmprunt: number;
    mensualite: number;
}

function getTypeBienLabel(type: TypeBien): string {
    const labels: Record<TypeBien, string> = {
        appartement: 'Appartement',
        maison: 'Maison',
        immeuble: 'Immeuble',
    };
    return labels[type] || (type as string);
}

function getTypeLocationLabel(type: TypeLocation): string {
    const labels: Record<TypeLocation, string> = {
        nue: 'Location nue',
        meublee_longue_duree: 'Meublée longue durée',
        meublee_tourisme_classe: 'Meublée tourisme classé',
        meublee_tourisme_non_classe: 'Meublée tourisme non classé',
    };
    return labels[type] || (type as string);
}

export function PropertyDetails({ bien, financement, exploitation, montantEmprunt, mensualite }: PropertyDetailsProps) {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Détails du Projet</Text>
            </View>

            <View style={styles.col2}>
                {/* Colonne gauche : Le bien & Exploitation */}
                <View style={styles.flex1}>
                    <Text style={[styles.h3, { fontSize: 10, color: colors.textMuted }]}>Le Bien</Text>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Type</Text>
                        <Text style={styles.value}>{getTypeBienLabel(bien.type_bien)}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Surface</Text>
                        <Text style={styles.value}>{bien.surface ? `${bien.surface} m²` : 'N/C'}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Prix d&apos;achat</Text>
                        <Text style={styles.value}>{formatCurrency(bien.prix_achat)}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Travaux</Text>
                        <Text style={styles.value}>{formatCurrency(bien.montant_travaux)}</Text>
                    </View>

                    <Text style={[styles.h3, { fontSize: 10, color: colors.textMuted, marginTop: 12 }]}>Exploitation</Text>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Mode</Text>
                        <Text style={styles.value}>{getTypeLocationLabel(exploitation.type_location)}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Loyer Mensuel</Text>
                        <Text style={[styles.value, { color: colors.success }]}>{formatCurrency(exploitation.loyer_mensuel)}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Vacance</Text>
                        <Text style={styles.value}>{formatPercent(exploitation.provision_vacance)}</Text>
                    </View>
                </View>

                {/* Colonne droite : Financement & Charges */}
                <View style={styles.flex1}>
                    <Text style={[styles.h3, { fontSize: 10, color: colors.textMuted }]}>Financement</Text>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Montant emprunté</Text>
                        <Text style={styles.value}>{formatCurrency(montantEmprunt)}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Taux / Durée</Text>
                        <Text style={styles.value}>{formatPercent(financement.taux_interet)} / {financement.duree_emprunt} ans</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Mensualité</Text>
                        <Text style={styles.value}>{formatCurrency(mensualite)}</Text>
                    </View>

                    <Text style={[styles.h3, { fontSize: 10, color: colors.textMuted, marginTop: 12 }]}>Charges Mensuelles</Text>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Copro</Text>
                        <Text style={styles.value}>{formatCurrency(exploitation.charges_copro)}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Taxe Foncière</Text>
                        <Text style={styles.value}>{formatCurrency(exploitation.taxe_fonciere / 12)}/mois</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Autres (PNO, Gestion)</Text>
                        <Text style={styles.value}>
                            {formatCurrency(exploitation.assurance_pno / 12 + (exploitation.loyer_mensuel * exploitation.gestion_locative / 100))}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
