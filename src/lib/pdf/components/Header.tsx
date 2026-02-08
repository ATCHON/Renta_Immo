/**
 * PDF Header Component
 */
import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from '../styles';

interface HeaderProps {
    title?: string;
    date?: Date;
}

export function Header({ title = 'Renta Immo', date = new Date() }: HeaderProps) {
    const formattedDate = date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    return (
        <View style={styles.header}>
            <Text style={styles.headerLogo}>{title}</Text>
            <Text style={styles.headerSub}>Généré le {formattedDate}</Text>
        </View>
    );
}
