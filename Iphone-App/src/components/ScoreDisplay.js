import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getGrade } from '../utils/scoring';
import { colors } from '../constants/theme';

export default function ScoreDisplay({ score, label, compact = false }) {
  const { grade, text, color } = getGrade(score);
  const pct = Math.min(100, Math.max(0, score));

  if (compact) {
    return (
      <View style={[styles.compact, { borderLeftColor: color }]}>
        <Text style={[styles.compactScore, { color }]}>{score}</Text>
        <Text style={styles.compactLabel}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.sectionLabel}>{label}</Text> : null}
      <View style={styles.scoreRow}>
        <Text style={[styles.scoreNum, { color }]}>{score}</Text>
        <Text style={styles.scoreMax}>/100</Text>
      </View>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.gradeText, { color }]}>{grade} — {text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sectionLabel: {
    fontSize: 11,
    color: colors.soft,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreNum: {
    fontSize: 52,
    fontFamily: 'Georgia',
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 22,
    color: colors.soft,
    marginLeft: 4,
  },
  bar: {
    height: 8,
    backgroundColor: colors.line,
    borderRadius: 4,
    marginVertical: 10,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  gradeText: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderLeftWidth: 4,
    marginVertical: 2,
  },
  compactScore: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    width: 44,
  },
  compactLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.soft,
  },
});
