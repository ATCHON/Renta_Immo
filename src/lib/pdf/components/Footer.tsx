/**
 * PDF Footer Component
 */
import React from 'react';
import { View, Text } from '@react-pdf/renderer';
import { styles } from '../styles';

interface FooterProps {
  pageNumber: number;
  totalPages?: number;
  adresse?: string;
}

export function Footer({ pageNumber, totalPages, adresse }: FooterProps) {
  const leftText = adresse
    ? `Rapport de simulation — ${adresse}`
    : 'Rapport de simulation - Renta Immo';

  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>{leftText}</Text>
      <Text style={styles.footerText}>
        {totalPages ? `Page ${pageNumber} / ${totalPages}` : `Page ${pageNumber}`}
      </Text>
    </View>
  );
}
