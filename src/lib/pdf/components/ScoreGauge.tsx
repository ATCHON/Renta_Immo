/**
 * PDF Score Gauge Component
 * Displays the global score with visual representation
 */
import React from 'react';
import { View, Text, StyleSheet } from '@react-pdf/renderer';
import { colors } from '../styles';

interface ScoreGaugeProps {
    score: number;
    label?: string;
}

const gaugeStyles = StyleSheet.create({
    container: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.forest,
        borderRadius: 4,
        marginBottom: 15,
    },
    scoreValue: {
        fontSize: 42,
        fontWeight: 'bold',
        color: colors.white,
    },
    scoreMax: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    label: {
        fontSize: 11,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 5,
    },
    verdictContainer: {
        marginTop: 10,
        paddingHorizontal: 15,
        paddingVertical: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 3,
    },
    verdict: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.white,
    },
    gauge: {
        flexDirection: 'row',
        width: '80%',
        height: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        marginTop: 12,
        overflow: 'hidden',
    },
    gaugeFill: {
        height: '100%',
        borderRadius: 4,
    },
});

function getVerdict(score: number): string {
    if (score >= 80) return 'EXCELLENT';
    if (score >= 60) return 'BON';
    if (score >= 40) return 'MOYEN';
    return 'FAIBLE';
}

function getGaugeColor(score: number): string {
    if (score >= 80) return colors.sage;
    if (score >= 60) return '#7CB082';
    if (score >= 40) return colors.amber;
    return colors.terracotta;
}

export function ScoreGauge({ score, label = 'Score Global' }: ScoreGaugeProps) {
    const verdict = getVerdict(score);
    const gaugeColor = getGaugeColor(score);

    return (
        <View style={gaugeStyles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                <Text style={gaugeStyles.scoreValue}>{score}</Text>
                <Text style={gaugeStyles.scoreMax}>/100</Text>
            </View>
            <Text style={gaugeStyles.label}>{label}</Text>

            {/* Visual Gauge */}
            <View style={gaugeStyles.gauge}>
                <View style={[gaugeStyles.gaugeFill, { width: `${score}%`, backgroundColor: gaugeColor }]} />
            </View>

            {/* Verdict */}
            <View style={gaugeStyles.verdictContainer}>
                <Text style={gaugeStyles.verdict}>{verdict}</Text>
            </View>
        </View>
    );
}
