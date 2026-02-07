import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, colors } from '../styles'; // Assuming styles are exported from a parent directory
import { formatCurrency } from '../utils/formatters';

interface ProjectCostProps {
    prixAchat: number;
    fraisNotaire?: number; // Estimated usually around 7-8%
    travaux: number;
    mobilier: number;
    fraisDossier: number;
    fraisGarantie: number;
    apport: number;
    montantEmprunt: number;
}

export function ProjectCost({
    prixAchat,
    fraisNotaire = prixAchat * 0.075,
    travaux,
    mobilier,
    fraisDossier,
    fraisGarantie,
    apport,
    montantEmprunt
}: ProjectCostProps) {

    const totalProjet = prixAchat + fraisNotaire + travaux + mobilier + fraisDossier + fraisGarantie;


    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Plan de Financement</Text>
                <Text style={styles.valueLarge}>{formatCurrency(totalProjet)}</Text>
            </View>

            <View style={styles.col2}>
                {/* Emplois (Besoins) */}
                <View style={styles.flex1}>
                    <Text style={[styles.h3, { color: colors.textMuted, fontSize: 10, marginBottom: 8 }]}>EMPLOIS</Text>

                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Prix Net Vendeur</Text>
                        <Text style={styles.value}>{formatCurrency(prixAchat)}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Frais de notaire (est.)</Text>
                        <Text style={styles.value}>{formatCurrency(fraisNotaire)}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Travaux</Text>
                        <Text style={styles.value}>{formatCurrency(travaux)}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Mobilier</Text>
                        <Text style={styles.value}>{formatCurrency(mobilier)}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Frais Bancaires</Text>
                        <Text style={styles.value}>{formatCurrency(fraisDossier + fraisGarantie)}</Text>
                    </View>
                </View>

                {/* Séparateur vertical */}
                <View style={{ width: 1, backgroundColor: colors.border }} />

                {/* Ressources (Financement) */}
                <View style={styles.flex1}>
                    <Text style={[styles.h3, { color: colors.textMuted, fontSize: 10, marginBottom: 8 }]}>RESSOURCES</Text>

                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Apport Personnel</Text>
                        <Text style={[styles.value, { color: colors.success }]}>{formatCurrency(apport)}</Text>
                    </View>
                    <View style={styles.rowBetween}>
                        <Text style={styles.label}>Emprunt Bancaire</Text>
                        <Text style={[styles.value, { color: colors.primary }]}>{formatCurrency(montantEmprunt)}</Text>
                    </View>

                    <View style={[styles.mt10, { padding: 8, backgroundColor: colors.surfaceHighlight, borderRadius: 4 }]}>
                        <Text style={[styles.small, { textAlign: 'center', color: colors.textLight }]}>
                            L&apos;emprunt couvre {((montantEmprunt / totalProjet) * 100).toFixed(0)}% du projet
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
