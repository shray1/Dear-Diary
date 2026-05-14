import React, { useState, useEffect } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getWeights, saveWeights } from '../utils/storage';
import { DEFAULT_WEIGHTS, DAILY_PRACTICES, WEEKLY_TASKS, MONTHLY_TASKS } from '../constants/practices';
import { colors } from '../constants/theme';

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function sumDailyTotal(dw) {
  let total = 0;
  for (const id of Object.keys(dw)) {
    const w = dw[id];
    total += (w.base || 0) + (w.starsWeight || 0) + (w.suryanamaskar || 0) + (w.pranayam || 0);
  }
  return Math.round(total * 10) / 10;
}

function sumObj(obj) {
  return Object.values(obj).reduce((a, b) => a + (Number(b) || 0), 0);
}

export default function ScoringScreen() {
  const [weights, setWeights] = useState(deepClone(DEFAULT_WEIGHTS));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const w = await getWeights();
    setWeights(w ? deepClone(w) : deepClone(DEFAULT_WEIGHTS));
  };

  const setDailyWeight = (id, field, rawVal) => {
    const val = parseFloat(rawVal) || 0;
    setWeights(prev => ({
      ...prev,
      daily: {
        ...prev.daily,
        [id]: { ...prev.daily[id], [field]: val },
      },
    }));
  };

  const setWeeklyWeight = (id, rawVal) => {
    const val = parseFloat(rawVal) || 0;
    setWeights(prev => ({ ...prev, weekly: { ...prev.weekly, [id]: val } }));
  };

  const setMonthlyWeight = (id, rawVal) => {
    const val = parseFloat(rawVal) || 0;
    setWeights(prev => ({ ...prev, monthly: { ...prev.monthly, [id]: val } }));
  };

  const handleSave = async () => {
    const dailySum = sumDailyTotal(weights.daily);
    const weeklySum = sumObj(weights.weekly);
    const monthlySum = sumObj(weights.monthly);
    if (Math.abs(dailySum - 100) > 0.5) {
      Alert.alert('Invalid Weights', `Daily weights must sum to 100. Current total: ${dailySum}`);
      return;
    }
    if (Math.abs(weeklySum - 20) > 0.5) {
      Alert.alert('Invalid Weights', `Weekly weights must sum to 20. Current total: ${weeklySum}`);
      return;
    }
    if (Math.abs(monthlySum - 20) > 0.5) {
      Alert.alert('Invalid Weights', `Monthly weights must sum to 20. Current total: ${monthlySum}`);
      return;
    }
    await saveWeights(weights);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    Alert.alert('Reset Weights', 'Reset all scoring weights to defaults?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          const def = deepClone(DEFAULT_WEIGHTS);
          setWeights(def);
          await saveWeights(def);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      },
    ]);
  };

  const dailySum = sumDailyTotal(weights.daily);
  const weeklySum = sumObj(weights.weekly);
  const monthlySum = sumObj(weights.monthly);

  const WeightInput = ({ value, onChangeText }) => (
    <TextInput
      style={styles.wInput}
      value={String(value || 0)}
      onChangeText={onChangeText}
      keyboardType="decimal-pad"
      selectTextOnFocus
    />
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Scoring Weights</Text>
          <Text style={styles.intro}>
            Customise how each practice contributes to your daily score.
            Daily weights must sum to 100, weekly and monthly to 20 each.
          </Text>

          {/* Daily */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Daily Practices</Text>
              <Text style={[styles.sumLabel, Math.abs(dailySum - 100) > 0.5 && styles.sumBad]}>
                {dailySum}/100
              </Text>
            </View>

            {DAILY_PRACTICES.map(practice => {
              const w = weights.daily[practice.id] || {};
              return (
                <View key={practice.id} style={styles.practiceBlock}>
                  <Text style={styles.practiceLabel}>{practice.label}</Text>
                  <View style={styles.weightRow}>
                    {practice.type !== 'stars_only' && (
                      <View style={styles.weightField}>
                        <Text style={styles.wFieldLabel}>Base</Text>
                        <WeightInput
                          value={w.base}
                          onChangeText={v => setDailyWeight(practice.id, 'base', v)}
                        />
                      </View>
                    )}
                    {(practice.type === 'checkbox_stars' || practice.type === 'stars_only') && (
                      <View style={styles.weightField}>
                        <Text style={styles.wFieldLabel}>Stars</Text>
                        <WeightInput
                          value={w.starsWeight}
                          onChangeText={v => setDailyWeight(practice.id, 'starsWeight', v)}
                        />
                      </View>
                    )}
                    {practice.subRatings?.map(sub => {
                      const subKey = sub.id.replace(practice.id + '_', '');
                      return (
                        <View key={sub.id} style={styles.weightField}>
                          <Text style={styles.wFieldLabel}>{subKey.slice(0, 6)}</Text>
                          <WeightInput
                            value={w[subKey]}
                            onChangeText={v => setDailyWeight(practice.id, subKey, v)}
                          />
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Weekly */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Weekly Tasks</Text>
              <Text style={[styles.sumLabel, Math.abs(weeklySum - 20) > 0.5 && styles.sumBad]}>
                {weeklySum}/20
              </Text>
            </View>
            {WEEKLY_TASKS.map(task => (
              <View key={task.id} style={styles.simpleRow}>
                <Text style={styles.simpleLabel}>{task.label}</Text>
                <WeightInput
                  value={weights.weekly[task.id]}
                  onChangeText={v => setWeeklyWeight(task.id, v)}
                />
              </View>
            ))}
          </View>

          {/* Monthly */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Monthly Tasks</Text>
              <Text style={[styles.sumLabel, Math.abs(monthlySum - 20) > 0.5 && styles.sumBad]}>
                {monthlySum}/20
              </Text>
            </View>
            {MONTHLY_TASKS.map(task => (
              <View key={task.id} style={styles.simpleRow}>
                <Text style={styles.simpleLabel}>{task.label}</Text>
                <WeightInput
                  value={weights.monthly[task.id]}
                  onChangeText={v => setMonthlyWeight(task.id, v)}
                />
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnDone]}
            onPress={handleSave}
          >
            <Text style={styles.saveBtnText}>{saved ? '✓  Saved' : 'Save Weights'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>Reset to Defaults</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  title: {
    fontSize: 26,
    fontFamily: 'Georgia',
    color: colors.ink,
    fontWeight: '700',
    marginBottom: 8,
  },
  intro: {
    fontSize: 14,
    color: colors.soft,
    lineHeight: 20,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Georgia',
    color: colors.ink,
    fontWeight: '700',
  },
  sumLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.good,
  },
  sumBad: {
    color: colors.danger,
  },
  practiceBlock: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  practiceLabel: {
    fontSize: 13,
    color: colors.ink,
    marginBottom: 6,
  },
  weightRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  weightField: {
    alignItems: 'center',
  },
  wFieldLabel: {
    fontSize: 10,
    color: colors.soft,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  wInput: {
    width: 54,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    textAlign: 'center',
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.bg,
  },
  simpleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  simpleLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveBtnDone: { backgroundColor: colors.good },
  saveBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  resetBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  resetBtnText: {
    fontSize: 15,
    color: colors.soft,
  },
});
