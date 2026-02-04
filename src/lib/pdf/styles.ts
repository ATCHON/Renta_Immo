/**
 * Styles partagés pour la génération PDF
 * Design System: Nordic Minimal
 */
import { StyleSheet, Font } from '@react-pdf/renderer';

// Couleurs du design system (Nordic Minimal)
export const colors = {
    background: '#FAFAF8',
    surface: '#F5F3EF',
    border: '#E8E4DD',
    forest: '#2D5A45',
    forestLight: '#4A7B5F',
    charcoal: '#1A1A1A',
    stone: '#6B6B6B',
    sage: '#7CB082',
    amber: '#D4A574',
    terracotta: '#C17B6C',
    white: '#FFFFFF',
} as const;

// Styles de base réutilisables
export const styles = StyleSheet.create({
    // Page
    page: {
        padding: 40,
        backgroundColor: colors.white,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: colors.charcoal,
    },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.forest,
    },
    headerDate: {
        fontSize: 9,
        color: colors.stone,
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 25,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    footerText: {
        fontSize: 8,
        color: colors.stone,
    },
    footerPage: {
        fontSize: 9,
        color: colors.charcoal,
    },

    // Section
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.forest,
        marginBottom: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },

    // Card
    card: {
        backgroundColor: colors.surface,
        padding: 15,
        borderRadius: 4,
        marginBottom: 10,
    },

    // Table
    table: {
        width: '100%',
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

    // Metrics
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    metricLabel: {
        fontSize: 10,
        color: colors.stone,
    },
    metricValue: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.charcoal,
    },
    metricValuePositive: {
        color: colors.sage,
    },
    metricValueNegative: {
        color: colors.terracotta,
    },

    // Score
    scoreContainer: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.forest,
        borderRadius: 4,
        marginBottom: 15,
    },
    scoreValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.white,
    },
    scoreLabel: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.8)',
    },

    // Text utilities
    textBold: {
        fontWeight: 'bold',
    },
    textMuted: {
        color: colors.stone,
    },
    textSmall: {
        fontSize: 8,
    },
    textCenter: {
        textAlign: 'center',
    },
    textRight: {
        textAlign: 'right',
    },
});
