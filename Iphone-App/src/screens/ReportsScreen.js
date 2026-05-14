import React, { useState, useCallback } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getAllEntries, getWeights } from '../utils/storage';
import { scoreDay, scoreWeek, scoreMonth, scoreYear, getGrade } from '../utils/scoring';
import {
  today, getWeekStart, getWeekDates, getMonthWeeks, formatDate,
  formatShortDate, getDayName, formatMonthYear, getMonthName, addDays,
} from '../utils/dates';
import { DAILY_PRACTICES, WEEKLY_TASKS, MONTHLY_TASKS } from '../constants/practices';
import { colors } from '../constants/theme';
import ScoreDisplay from '../components/ScoreDisplay';

const PERIODS = ['Day', 'Week', 'Month', 'Year'];

function ProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <View style={pbStyles.bar}>
      <View style={[pbStyles.fill, { width: `${pct}%`, backgroundColor: color || colors.accent }]} />
    </View>
  );
}
const pbStyles = StyleSheet.create({
  bar: { height: 7, backgroundColor: colors.line, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});

export default function ReportsScreen() {
  const [period, setPeriod] = useState('Day');
  const [allEntries, setAllEntries] = useState({});
  const [weights, setWeights] = useState(null);
  const [refDate, setRefDate] = useState(today());

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const load = async () => {
    const all = await getAllEntries();
    const w = await getWeights();
    setAllEntries(all);
    setWeights(w);
  };

  const shiftRef = (delta) => {
    if (period === 'Day') setRefDate(prev => addDays(prev, delta));
    else if (period === 'Week') setRefDate(prev => addDays(prev, delta * 7));
    else if (period === 'Month') {
      setRefDate(prev => {
        const [y, m] = prev.split('-').map(Number);
        const newM = m + delta;
        const date = new Date(y, newM - 1, 1);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
      });
    } else if (period === 'Year') {
      setRefDate(prev => {
        const [y] = prev.split('-').map(Number);
        return `${y + delta}-01-01`;
      });
    }
  };

  const renderPeriodLabel = () => {
    const [y, m, d] = refDate.split('-').map(Number);
    if (period === 'Day') return formatDate(refDate);
    if (period === 'Week') {
      const ws = getWeekStart(refDate);
      const we = addDays(ws, 6);
      return `${formatShortDate(ws)} – ${formatShortDate(we)}, ${y}`;
    }
    if (period === 'Month') return formatMonthYear(y, m - 1);
    return `Year ${y}`;
  };

  const renderDay = () => {
    const entry = allEntries[refDate];
    const result = scoreDay(entry, weights);
    if (!result.hasEntry) {
      return (
        <View style={styles.noData}>
          <Text style={styles.noDataIcon}>📭</Text>
          <Text style={styles.noDataText}>No entry for this day.</Text>
        </View>
      );
    }
    const { grade, color } = getGrade(result.total);
    return (
      <>
        <ScoreDisplay score={result.total} label="Day Score" />

        {entry.wakeTime && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Sleep</Text>
            <View style={styles.sleepInfo}>
              <View style={styles.sleepItem}>
                <Text style={styles.sleepVal}>{entry.wakeTime}</Text>
                <Text style={styles.sleepLbl}>Wake</Text>
              </View>
              <View style={styles.sleepItem}>
                <Text style={styles.sleepVal}>{entry.bedTime}</Text>
                <Text style={styles.sleepLbl}>Bed</Text>
              </View>
              <View style={styles.sleepItem}>
                <Text style={styles.sleepVal}>
                  {entry.mood ? ['', '😢', '😐', '😑', '😊', '😄'][entry.mood] : '—'}
                </Text>
                <Text style={styles.sleepLbl}>Mood</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Practices Breakdown</Text>
          {result.breakdown.map(item => (
            <View key={item.id} style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>{item.label}</Text>
              <View style={styles.breakdownRight}>
                <ProgressBar value={item.earned} max={item.max} color={item.earned >= item.max * 0.9 ? colors.good : colors.accent} />
                <Text style={styles.breakdownScore}>{Math.round(item.earned)}/{item.max}</Text>
              </View>
            </View>
          ))}
        </View>

        {Object.keys(entry.minutes || {}).length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Time Allocation</Text>
            {Object.entries(entry.minutes).map(([k, v]) =>
              v > 0 ? (
                <View key={k} style={styles.minuteRow}>
                  <Text style={styles.minuteLabel}>{k}</Text>
                  <Text style={styles.minuteVal}>{v} min ({Math.round(v / 6) / 10}h)</Text>
                </View>
              ) : null,
            )}
          </View>
        )}

        {(entry.actual || entry.grateful || entry.lesson) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Reflection</Text>
            {entry.actual ? <><Text style={styles.reflLabel}>Day</Text><Text style={styles.reflText}>{entry.actual}</Text></> : null}
            {entry.grateful ? <><Text style={styles.reflLabel}>Grateful for</Text><Text style={styles.reflText}>{entry.grateful}</Text></> : null}
            {entry.lesson ? <><Text style={styles.reflLabel}>Learned</Text><Text style={styles.reflText}>{entry.lesson}</Text></> : null}
          </View>
        )}
      </>
    );
  };

  const renderWeek = () => {
    const ws = getWeekStart(refDate);
    const result = scoreWeek(ws, allEntries, weights);
    const hasAny = result.dayScores.some(d => d.hasEntry);
    if (!hasAny) return <View style={styles.noData}><Text style={styles.noDataIcon}>📭</Text><Text style={styles.noDataText}>No entries this week.</Text></View>;

    return (
      <>
        <ScoreDisplay score={result.total} label="Week Score" />
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Scores</Text>
          {result.dayScores.map(({ date, score, hasEntry }) => {
            const { color } = getGrade(score);
            return (
              <View key={date} style={styles.dayRow}>
                <Text style={styles.dayName}>{getDayName(date)}</Text>
                <Text style={styles.dayDate}>{formatShortDate(date)}</Text>
                {hasEntry ? (
                  <>
                    <ProgressBar value={score} max={100} color={color} />
                    <Text style={[styles.dayScore, { color }]}>{score}</Text>
                  </>
                ) : (
                  <Text style={styles.noEntry}>—</Text>
                )}
              </View>
            );
          })}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Tasks</Text>
          {WEEKLY_TASKS.map(task => (
            <View key={task.id} style={styles.taskRow}>
              <Text style={[styles.taskDot, { color: result.weeklyResults[task.id] ? colors.good : colors.line }]}>●</Text>
              <Text style={[styles.taskLabel, !result.weeklyResults[task.id] && styles.taskLabelOff]}>{task.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Score Breakdown</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Daily average</Text>
            <Text style={styles.breakdownScore}>{result.dailyPart}/80</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Weekly tasks</Text>
            <Text style={styles.breakdownScore}>{result.weeklyPart}/20</Text>
          </View>
        </View>
      </>
    );
  };

  const renderMonth = () => {
    const [y, m] = refDate.split('-').map(Number);
    const result = scoreMonth(y, m - 1, allEntries, weights);
    const hasAny = result.weekResults.some(w => w.hasEntries);
    if (!hasAny) return <View style={styles.noData}><Text style={styles.noDataIcon}>📭</Text><Text style={styles.noDataText}>No entries this month.</Text></View>;

    return (
      <>
        <ScoreDisplay score={result.total} label="Month Score" />
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Scores</Text>
          {result.weekResults.filter(w => w.hasEntries).map(w => {
            const { color } = getGrade(w.total);
            return (
              <View key={w.weekStart} style={styles.dayRow}>
                <Text style={styles.dayDate}>{formatShortDate(w.weekStart)} wk</Text>
                <ProgressBar value={w.total} max={100} color={color} />
                <Text style={[styles.dayScore, { color }]}>{w.total}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Tasks</Text>
          {MONTHLY_TASKS.map(task => (
            <View key={task.id} style={styles.taskRow}>
              <Text style={[styles.taskDot, { color: result.monthlyResults[task.id] ? colors.good : colors.line }]}>●</Text>
              <Text style={[styles.taskLabel, !result.monthlyResults[task.id] && styles.taskLabelOff]}>{task.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Score Breakdown</Text>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Weekly average</Text>
            <Text style={styles.breakdownScore}>{result.weeklyPart}/80</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Monthly tasks</Text>
            <Text style={styles.breakdownScore}>{result.monthlyPart}/20</Text>
          </View>
        </View>
      </>
    );
  };

  const renderYear = () => {
    const [y] = refDate.split('-').map(Number);
    const result = scoreYear(y, allEntries, weights);
    const activeMonths = result.monthResults.filter(mr => mr.weekResults.some(w => w.hasEntries));
    if (activeMonths.length === 0) return <View style={styles.noData}><Text style={styles.noDataIcon}>📭</Text><Text style={styles.noDataText}>No entries this year.</Text></View>;

    return (
      <>
        <ScoreDisplay score={result.total} label={`Year ${y} Score`} />
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Monthly Scores</Text>
          {result.monthResults.map(mr => {
            const hasAny = mr.weekResults.some(w => w.hasEntries);
            if (!hasAny) return null;
            const { color } = getGrade(mr.total);
            return (
              <View key={mr.month} style={styles.dayRow}>
                <Text style={styles.dayDate}>{getMonthName(mr.month).slice(0, 3)}</Text>
                <ProgressBar value={mr.total} max={100} color={color} />
                <Text style={[styles.dayScore, { color }]}>{mr.total}</Text>
              </View>
            );
          })}
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
      </View>

      {/* Period Tabs */}
      <View style={styles.tabs}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p}
            style={[styles.tab, period === p && styles.tabActive]}
            onPress={() => setPeriod(p)}
          >
            <Text style={[styles.tabText, period === p && styles.tabTextActive]}>{p}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Period Nav */}
      <View style={styles.periodNav}>
        <TouchableOpacity onPress={() => shiftRef(-1)} style={styles.periodNavBtn}>
          <Text style={styles.periodNavArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.periodLabel}>{renderPeriodLabel()}</Text>
        <TouchableOpacity onPress={() => shiftRef(1)} style={styles.periodNavBtn}>
          <Text style={styles.periodNavArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {period === 'Day' && renderDay()}
        {period === 'Week' && renderWeek()}
        {period === 'Month' && renderMonth()}
        {period === 'Year' && renderYear()}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Georgia',
    color: colors.ink,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
  },
  tabActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tabText: {
    fontSize: 13,
    color: colors.soft,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  periodNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  periodNavBtn: {
    padding: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  periodNavArrow: {
    fontSize: 26,
    color: colors.accent,
  },
  periodLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    color: colors.ink,
    fontFamily: 'Georgia',
  },
  content: { padding: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.soft,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  sleepInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sleepItem: { alignItems: 'center' },
  sleepVal: { fontSize: 20, fontFamily: 'Georgia', color: colors.ink },
  sleepLbl: { fontSize: 11, color: colors.soft, marginTop: 2 },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.ink,
  },
  breakdownRight: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
  },
  breakdownScore: {
    width: 50,
    textAlign: 'right',
    fontSize: 12,
    color: colors.soft,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  dayName: {
    width: 32,
    fontSize: 13,
    color: colors.soft,
    fontWeight: '600',
  },
  dayDate: {
    width: 54,
    fontSize: 12,
    color: colors.soft,
  },
  dayScore: {
    width: 32,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  noEntry: {
    flex: 1,
    fontSize: 14,
    color: colors.line,
    textAlign: 'center',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  taskDot: {
    fontSize: 10,
    marginRight: 10,
  },
  taskLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
  },
  taskLabelOff: {
    color: colors.soft,
  },
  minuteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  minuteLabel: { fontSize: 13, color: colors.ink },
  minuteVal: { fontSize: 13, color: colors.soft },
  reflLabel: {
    fontSize: 11,
    color: colors.soft,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 2,
  },
  reflText: {
    fontSize: 14,
    color: colors.ink,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  noData: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noDataIcon: { fontSize: 40, marginBottom: 12 },
  noDataText: {
    fontSize: 16,
    color: colors.soft,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
});
