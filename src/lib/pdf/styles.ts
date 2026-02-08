/**
 * Styles partagés pour la génération PDF
 * Design System: Nordic Minimal (Épuré, Professionnel, Moderne)
 */
import { StyleSheet } from '@react-pdf/renderer';

// Palette de couleurs "Earthy" — alignée sur le design system Tailwind
export const colors = {
    // Backgrounds
    background: '#FFFFFF',
    surface: '#F5F3EF',
    surfaceHighlight: '#F0EDE7',

    // Text & Borders
    textMain: '#1F1F1F',     // Charcoal — texte principal
    textLight: '#6B6B6B',    // Stone — labels
    textMuted: '#9CA3A0',    // Pebble — détails secondaires
    border: '#E8E4DD',       // Sand — bordures

    // Accents
    primary: '#1F1F1F',      // Charcoal — titres, headers
    accent: '#2D5A45',       // Forest — liens, mises en avant
    success: '#4A7C59',      // Sage — indicateurs positifs
    warning: '#C4841D',      // Amber — points d'attention
    error: '#B54A32',        // Terracotta — indicateurs négatifs

    // Charts & Graphs
    chart1: '#2D5A45',       // Forest
    chart2: '#4A7C59',       // Sage
    chart3: '#C4841D',       // Amber
    chart4: '#B54A32',       // Terracotta
    white: '#FFFFFF',

    // Specific UI Colors
    forest: '#2D5A45',
    sage: '#4A7C59',
    amber: '#C4841D',
    terracotta: '#B54A32',
    charcoal: '#1F1F1F',
} as const;

// Styles globaux
export const styles = StyleSheet.create({
    // --- Layout ---
    page: {
        padding: 30, // Marges plus aérées mais standard
        backgroundColor: colors.background,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: colors.textMain,
    },
    section: {
        marginBottom: 20,
    },
    col2: {
        flexDirection: 'row',
        gap: 20,
    },
    col3: {
        flexDirection: 'row',
        gap: 15,
    },
    flex1: {
        flex: 1,
    },

    // --- Header & Footer ---
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 30,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: colors.accent,
    },
    headerLogo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        letterSpacing: 1,
    },
    headerSub: {
        fontSize: 10,
        color: colors.textLight,
        textAlign: 'right',
    },
    footer: {
        position: 'absolute',
        bottom: 20,
        left: 30,
        right: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    footerText: {
        fontSize: 8,
        color: colors.textMuted,
    },

    // --- Typography ---
    h1: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
    },
    h2: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 12,
        marginTop: 20,
        borderLeftWidth: 4,
        borderLeftColor: colors.accent,
        paddingLeft: 10,
    },
    h3: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.textMain,
        marginBottom: 6,
        marginTop: 10,
    },
    text: {
        fontSize: 10,
        lineHeight: 1.5,
        color: colors.textMain,
    },
    label: {
        fontSize: 9,
        color: colors.textLight,
        marginBottom: 2,
    },
    value: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.textMain,
    },
    valueLarge: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.primary,
    },
    small: {
        fontSize: 8,
        color: colors.textMuted,
    },

    // --- Components ---
    card: {
        backgroundColor: colors.surface,
        padding: 15,
        borderRadius: 8, // Arrondis plus modernes
        marginBottom: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: 5,
    },
    cardTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: colors.primary,
        textTransform: 'uppercase',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        fontSize: 8,
        fontWeight: 'bold',
    },
    badgeSuccess: {
        backgroundColor: '#D1FAE5',
        color: '#065F46',
    },
    badgeWarning: {
        backgroundColor: '#FEF3C7',
        color: '#92400E',
    },
    badgeError: {
        backgroundColor: '#FEE2E2',
        color: '#991B1B',
    },

    // --- Tables ---
    table: {
        width: '100%',
        marginBottom: 15,
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.border,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: colors.surfaceHighlight,
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tableHeaderCell: {
        fontSize: 9,
        fontWeight: 'bold',
        color: colors.textLight,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingVertical: 6,
        paddingHorizontal: 6,
        backgroundColor: colors.white,
    },
    tableRowLast: {
        borderBottomWidth: 0,
    },
    tableCell: {
        fontSize: 9,
        color: colors.textMain,
    },

    // --- Utils ---
    mt10: { marginTop: 10 },
    mb10: { marginBottom: 10 },
    p10: { padding: 10 },
    textRight: { textAlign: 'right' },
    textCenter: { textAlign: 'center' },
    textSuccess: { color: colors.success },
    textWarning: { color: colors.warning },
    textError: { color: colors.error },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textBold: {
        fontWeight: 'bold',
    },
});
