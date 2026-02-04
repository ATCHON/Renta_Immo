/**
 * PDF Footer Component
 */
import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from '../styles';

interface FooterProps {
    pageNumber: number;
    totalPages?: number;
}

export function Footer({ pageNumber, totalPages }: FooterProps) {
    return (
        <View style={styles.footer}>
            <Text style={styles.footerText}>
                Rapport de simulation - Renta Immo
            </Text>
            <Text style={styles.footerPage}>
                {totalPages ? `Page ${pageNumber} / ${totalPages}` : `Page ${pageNumber}`}
            </Text>
        </View>
    );
}
