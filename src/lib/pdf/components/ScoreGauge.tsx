/**
 * PDF Score Gauge Component
 * Displays the global score with visual gauge + detailed score decomposition with bars
 */
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles';
import type { ScoreDetailResultat } from '@/types/calculateur';

interface ScoreGaugeProps {
  score: number;
  label?: string;
  scoreDetail?: ScoreDetailResultat;
}

const gaugeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leftCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 15,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  rightCol: {
    flex: 1,
    paddingLeft: 15,
  },
  containerFallback: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 12,
    color: colors.textMuted,
  },
  verdictBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  verdict: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legendLabel: {
    fontSize: 6,
    color: colors.textMuted,
  },
  // Decomposition rows with bars
  decompRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  decompLabel: {
    fontSize: 8,
    color: colors.textLight,
    width: 60,
    textAlign: 'right',
    paddingRight: 6,
  },
  decompValue: {
    fontSize: 8,
    fontWeight: 'bold',
    width: 24,
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: colors.textMain,
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

const AJUSTEMENT_LABELS: Record<string, string> = {
  cashflow: 'Cash-flow',
  rentabilite: 'Rentabilité',
  hcsf: 'HCSF',
  dpe: 'DPE',
  ratio_prix_loyer: 'Ratio prix/loyer',
  reste_a_vivre: 'Reste à vivre',
};

const AJUSTEMENT_MAX: Record<string, [number, number]> = {
  cashflow: [-20, 20],
  rentabilite: [-15, 20],
  hcsf: [-25, 20],
  dpe: [-10, 5],
  ratio_prix_loyer: [-5, 10],
  reste_a_vivre: [-10, 5],
};

function getVerdict(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Bon';
  if (score >= 40) return 'Moyen';
  return 'Faible';
}

function getScoreColor(score: number): string {
  if (score >= 80) return colors.forest;
  if (score >= 60) return colors.sage;
  if (score >= 40) return colors.amber;
  return colors.terracotta;
}

function getVerdictStyle(score: number): { bg: string; border: string } {
  if (score >= 80) return { bg: '#E8F0EB', border: colors.forest };
  if (score >= 60) return { bg: '#EBF0EC', border: colors.sage };
  if (score >= 40) return { bg: '#F5EDE0', border: colors.amber };
  return { bg: '#F2E8E5', border: colors.terracotta };
}

const LEGEND_SEGMENTS = [
  { label: 'Faible', color: `${colors.terracotta}33`, width: '40%' as const },
  { label: 'Moyen', color: `${colors.amber}33`, width: '20%' as const },
  { label: 'Bon', color: `${colors.sage}33`, width: '20%' as const },
  { label: 'Excellent', color: `${colors.forest}33`, width: '20%' as const },
];

/** Horizontal bar for a single ajustement — mirrors the web AjustementBar */
function AjustementBarPdf({
  label,
  value,
  range,
}: {
  label: string;
  value: number;
  range: [number, number];
}) {
  const [min, max] = range;
  const totalRange = max - min;
  const zeroPos = (Math.abs(min) / totalRange) * 100;
  const barStart = value >= 0 ? zeroPos : zeroPos + (value / totalRange) * 100;
  const barWidth = (Math.abs(value) / totalRange) * 100;
  const barColor = value > 0 ? colors.forest : value < 0 ? colors.terracotta : colors.textMuted;

  return (
    <View style={gaugeStyles.decompRow}>
      <Text style={gaugeStyles.decompLabel}>{label}</Text>
      <View style={{ flex: 1, height: 8, backgroundColor: '#ECEAE5', borderRadius: 2 }}>
        {/* Zero reference line */}
        <View
          style={{
            position: 'absolute',
            left: `${zeroPos}%`,
            top: 0,
            width: 0.5,
            height: 8,
            backgroundColor: colors.textMuted,
          }}
        />
        {/* Value bar */}
        {value !== 0 && (
          <View
            style={{
              position: 'absolute',
              left: `${Math.max(0, barStart)}%`,
              width: `${Math.min(barWidth, 100)}%`,
              top: 1,
              height: 6,
              backgroundColor: barColor,
              borderRadius: 1,
              opacity: 0.75,
            }}
          />
        )}
      </View>
      <Text style={[gaugeStyles.decompValue, { color: barColor }]}>
        {value > 0 ? '+' : ''}
        {value}
      </Text>
    </View>
  );
}

function ScoreHero({ score, label }: { score: number; label: string }) {
  const scoreColor = getScoreColor(score);
  const verdict = getVerdict(score);
  const verdictStyle = getVerdictStyle(score);
  const markerPos = Math.min(100, Math.max(0, score));

  return (
    <>
      <Text style={gaugeStyles.sectionLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <Text style={[gaugeStyles.scoreValue, { color: scoreColor }]}>{score}</Text>
        <Text style={gaugeStyles.scoreMax}> /100</Text>
      </View>

      {/* Legend bar */}
      <View style={{ width: '90%', marginTop: 10 }}>
        <View style={{ flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden' }}>
          {LEGEND_SEGMENTS.map((seg) => (
            <View
              key={seg.label}
              style={{ width: seg.width, backgroundColor: seg.color, height: 8 }}
            />
          ))}
        </View>

        {/* Score marker — colored circle on the bar */}
        <View style={{ flexDirection: 'row', marginTop: -11 }}>
          <View style={{ width: `${markerPos}%` }} />
          <View
            style={{
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: scoreColor,
              borderWidth: 2,
              borderColor: '#FFFFFF',
              marginLeft: -7,
            }}
          />
        </View>

        {/* Labels */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          {LEGEND_SEGMENTS.map((seg) => (
            <Text key={seg.label} style={gaugeStyles.legendLabel}>
              {seg.label}
            </Text>
          ))}
        </View>
      </View>

      {/* Verdict badge */}
      <View
        style={[
          gaugeStyles.verdictBadge,
          { backgroundColor: verdictStyle.bg, borderColor: verdictStyle.border },
        ]}
      >
        <Text style={[gaugeStyles.verdict, { color: scoreColor }]}>{verdict}</Text>
      </View>
    </>
  );
}

export function ScoreGauge({
  score,
  label = 'Indice de Performance',
  scoreDetail,
}: ScoreGaugeProps) {
  const scoreColor = getScoreColor(score);

  // Fallback: no decomposition
  if (!scoreDetail) {
    return (
      <View style={gaugeStyles.containerFallback}>
        <ScoreHero score={score} label={label} />
      </View>
    );
  }

  const ajustementKeys = [
    'cashflow',
    'rentabilite',
    'hcsf',
    'dpe',
    'ratio_prix_loyer',
    'reste_a_vivre',
  ] as const;

  return (
    <View style={gaugeStyles.container}>
      {/* Left: Score Hero */}
      <View style={gaugeStyles.leftCol}>
        <ScoreHero score={score} label={label} />
      </View>

      {/* Right: Decomposition with visual bars */}
      <View style={gaugeStyles.rightCol}>
        <Text style={gaugeStyles.sectionLabel}>Décomposition du score</Text>

        {/* Base initiale */}
        <View style={[gaugeStyles.decompRow, { marginBottom: 2 }]}>
          <Text style={[gaugeStyles.decompLabel, { color: colors.textMain, fontWeight: 'bold' }]}>
            Base initiale
          </Text>
          <View style={{ flex: 1 }} />
          <Text style={[gaugeStyles.decompValue, { color: colors.textMain }]}>
            {scoreDetail.base}
          </Text>
        </View>

        {/* Ajustements with bars */}
        {ajustementKeys.map((key) => {
          const value = scoreDetail.ajustements[key];
          const range = AJUSTEMENT_MAX[key] ?? [-20, 20];
          return (
            <AjustementBarPdf
              key={key}
              label={AJUSTEMENT_LABELS[key]}
              value={value}
              range={range as [number, number]}
            />
          );
        })}

        {/* Total */}
        <View style={gaugeStyles.totalRow}>
          <Text style={gaugeStyles.totalLabel}>Total</Text>
          <Text style={[gaugeStyles.totalValue, { color: scoreColor }]}>{score}</Text>
        </View>
      </View>
    </View>
  );
}
