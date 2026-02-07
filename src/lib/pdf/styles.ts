/**
 * Styles partagés pour la génération PDF
 * Design System: Nordic Minimal (Épuré, Professionnel, Moderne)
 */
import { StyleSheet } from '@react-pdf/renderer';

// Palette de couleurs "Nordic Minimal"
export const colors = {
    // Backgrounds
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceHighlight: '#F0F4F8',

    // Text & Borders
    textMain: '#1F2937',     // Gris très foncé (presque noir) pour le texte principal
    textLight: '#6B7280',    // Gris moyen pour les labels
    textMuted: '#9CA3AF',    // Gris clair pour les détails secondaires
    border: '#E5E7EB',       // Gris très clair pour les bordures

    // Accents (Professionnels & Modernes)
    primary: '#0F172A',      // Bleu nuit très profond (Slate 900) - Titres, Headers
    accent: '#3B82F6',       // Bleu vibrant mais pro (Blue 500) - Liens, Mises en avant
    success: '#10B981',      // Vert émeraude (Emerald 500) - Indicateurs positifs
    warning: '#F59E0B',      // Ambre (Amber 500) - Points d'attention
    error: '#EF4444',        // Rouge (Red 500) - Indicateurs négatifs

    // Charts & Graphs
    chart1: '#3B82F6',
    chart2: '#10B981',
    chart3: '#6366F1',
    chart4: '#F59E0B',
    white: '#FFFFFF',

    // Specific UI Colors
    forest: '#1B4332',      // Deep green
    sage: '#10B981',        // Fresh green (using success color)
    amber: '#F59E0B',       // Amber
    terracotta: '#E76F51',  // Muted red
    charcoal: '#374151',    // Dark grey
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
        alignItems: 'center',
        marginBottom: 30,
        paddingBottom: 15,
        borderBottomWidth: 2, // Ligne plus marquée
        borderBottomColor: colors.primary,
    },
    headerLogo: {
        fontSize: 20,
        fontWeight: 'extrabold',
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
