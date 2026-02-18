/**
 * PDF Header Component
 * Breadcrumb layout aligned with the Dashboard screen header
 */
import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles, colors } from '../styles';

interface HeaderProps {
  sectionTitle: string;
  adresse?: string;
  date?: Date;
}

export function Header({ sectionTitle, adresse, date = new Date() }: HeaderProps) {
  const formattedDate = date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.header}>
      <View>
        <Text
          style={{
            fontSize: 9,
            fontWeight: 'bold',
            color: colors.textLight,
            letterSpacing: 2,
            textTransform: 'uppercase',
            marginBottom: adresse ? 4 : 0,
          }}
        >
          Renta Immo / {sectionTitle}
        </Text>
        {adresse && (
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: colors.primary,
            }}
          >
            {adresse}
          </Text>
        )}
      </View>
      <Text style={styles.headerSub}>Généré le {formattedDate}</Text>
    </View>
  );
}
