/**
 * PDF Points d'Attention Component
 * Displays structured attention points with severity badges
 */
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles';
import type { PointAttentionDetail } from '@/types/calculateur';

interface PointsAttentionProps {
  points?: string[];
  pointsDetail?: PointAttentionDetail[];
}

const SEVERITY_ORDER: Record<string, number> = { error: 0, warning: 1, info: 2 };

const SEVERITY_CONFIG = {
  error: {
    label: 'CRITIQUE',
    bg: `${colors.terracotta}20`,
    color: colors.terracotta,
    dotColor: colors.terracotta,
  },
  warning: {
    label: 'ALERTE',
    bg: `${colors.amber}20`,
    color: colors.amber,
    dotColor: colors.amber,
  },
  info: {
    label: 'INFO',
    bg: `${colors.forest}15`,
    color: colors.forest,
    dotColor: colors.forest,
  },
} as const;

const localStyles = StyleSheet.create({
  container: {
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHighlight,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.textMain,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pointRowLast: {
    borderBottomWidth: 0,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginRight: 8,
    marginTop: 1,
  },
  badgeText: {
    fontSize: 6,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  pointContent: {
    flex: 1,
  },
  message: {
    fontSize: 9,
    color: colors.textMain,
    lineHeight: 1.4,
  },
  conseil: {
    fontSize: 8,
    color: colors.textLight,
    fontStyle: 'italic',
    marginTop: 2,
  },
  // Simple fallback for string-only points
  simpleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.warning,
    marginRight: 8,
    marginTop: 4,
  },
});

function sortByServerity(a: PointAttentionDetail, b: PointAttentionDetail): number {
  return (SEVERITY_ORDER[a.type] ?? 2) - (SEVERITY_ORDER[b.type] ?? 2);
}

export function PointsAttention({ points, pointsDetail }: PointsAttentionProps) {
  // Nothing to display
  if ((!pointsDetail || pointsDetail.length === 0) && (!points || points.length === 0)) {
    return null;
  }

  // Structured detail mode
  if (pointsDetail && pointsDetail.length > 0) {
    const sorted = [...pointsDetail].sort(sortByServerity);

    return (
      <View style={localStyles.container} wrap={false}>
        <View style={localStyles.header}>
          <Text style={localStyles.headerText}>Points d&apos;attention</Text>
        </View>
        {sorted.map((point, index) => {
          const config = SEVERITY_CONFIG[point.type] ?? SEVERITY_CONFIG.info;
          const isLast = index === sorted.length - 1;

          return (
            <View
              key={index}
              style={[localStyles.pointRow, isLast ? localStyles.pointRowLast : {}]}
            >
              <View style={[localStyles.badge, { backgroundColor: config.bg }]}>
                <Text style={[localStyles.badgeText, { color: config.color }]}>{config.label}</Text>
              </View>
              <View style={localStyles.pointContent}>
                <Text style={localStyles.message}>{point.message}</Text>
                {point.conseil && <Text style={localStyles.conseil}>{point.conseil}</Text>}
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  // Simple fallback mode: string-only points
  return (
    <View style={localStyles.container} wrap={false}>
      <View style={localStyles.header}>
        <Text style={localStyles.headerText}>Points d&apos;attention</Text>
      </View>
      {points!.map((point, index) => {
        const isLast = index === points!.length - 1;
        return (
          <View key={index} style={[localStyles.pointRow, isLast ? localStyles.pointRowLast : {}]}>
            <View style={localStyles.simpleDot} />
            <Text style={localStyles.message}>{point}</Text>
          </View>
        );
      })}
    </View>
  );
}
