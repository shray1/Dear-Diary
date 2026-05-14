import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PracticeItem from '../components/PracticeItem';
import StarRating from '../components/StarRating';
import { colors } from '../constants/theme';
import {
  DAILY_PRACTICES, WEEKLY_TASKS, MONTHLY_TASKS, TIME_CATEGORIES,
} from '../constants/practices';
import { getAllEntries, setAllEntries, getWeights } from '../utils/storage';
import { today, formatDate, addDays } from '../utils/dates';
import { propagateWeeklyMonthly } from '../utils/scoring';

// Generate time slots from 04:00 to 12:00 next day in 15-min increments
function buildTimeSlots() {
  const slots = [];
  for (let h = 4; h <= 36; h++) {
    for (let m = 0; m < 60; m += 15) {
      const realH = h % 24;
      const label =
        `${String(realH).padStart(2, '0')}:${String(m).padStart(2, '0')}` +
        (h >= 24 ? ' (+1)' : '');
      const value = `${String(realH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      slots.push({ label, value });
    }
  }
  return slots;
}
const TIME_SLOTS = buildTimeSlots();

function emptyEntry(date) {
  return {
    date,
    mood: '3',
    wakeTime: '06:00',
    bedTime: '22:00',
    plan: '',
    actual: '',
    grateful: '',
    apology: '',
    kindness: '',
    lesson: '',
    daily: {},
    weekly: {},
    weeklyOn: {},
    monthly: {},
    monthlyOn: {},
    minutes: {},
  };
}

const MOOD_LABELS = ['', 'Very Poor', 'Poor', 'Neutral', 'Good', 'Excellent'];
const MOOD_COLORS = ['', colors.danger, colors.warn, colors.soft, colors.accent, colors.good];

export default function TodayScreen({ route }) {
  const paramDate = route?.params?.date;
  const [selectedDate, setSelectedDate] = useState(paramDate || today());
  const [entry, setEntry] = useState(emptyEntry(paramDate || today()));
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved
  const [timePickerField, setTimePickerField] = useState(null); // 'wakeTime' | 'bedTime'
  const autosaveTimer = useRef(null);

  // When navigating from History, switch to the requested date
  React.useEffect(() => {
    if (paramDate && paramDate !== selectedDate) {
      setSelectedDate(paramDate);
    }
  }, [paramDate]);

  useEffect(() => {
    loadEntry(selectedDate);
  }, [selectedDate]);

  const loadEntry = async (date) => {
    const all = await getAllEntries();
    setEntry(all[date] ? { ...emptyEntry(date), ...all[date] } : emptyEntry(date));
  };

  const triggerAutosave = useCallback(() => {
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      handleSave(true);
    }, 1500);
  }, [entry]);

  const handleSave = async (silent = false) => {
    if (!silent) setSaveStatus('saving');
    try {
      const all = await getAllEntries();
      const { updatedEntries } = propagateWeeklyMonthly(entry, all);
      await setAllEntries(updatedEntries);
      if (!silent) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    } catch (e) {
      if (!silent) setSaveStatus('idle');
    }
  };

  const update = (field, value) => {
    setEntry(prev => {
      const next = { ...prev, [field]: value };
      return next;
    });
  };

  const updateDaily = (id, value) => {
    setEntry(prev => ({ ...prev, daily: { ...prev.daily, [id]: value } }));
  };

  const updateWeekly = (id, value) => {
    setEntry(prev => ({ ...prev, weekly: { ...prev.weekly, [id]: value } }));
  };

  const updateMonthly = (id, value) => {
    setEntry(prev => ({ ...prev, monthly: { ...prev.monthly, [id]: value } }));
  };

  const updateMinutes = (id, rawValue) => {
    const num = parseInt(rawValue, 10);
    setEntry(prev => ({
      ...prev,
      minutes: { ...prev.minutes, [id]: isNaN(num) ? 0 : Math.max(0, num) },
    }));
  };

  const totalMinutes = Object.values(entry.minutes || {}).reduce((a, b) => a + (b || 0), 0);

  const goDay = (delta) => setSelectedDate(addDays(selectedDate, delta));

  const isToday = selectedDate === today();

  return (
    <SafeAreaView style={styles.safe}>
      {/* Date Nav */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={() => goDay(-1)} style={styles.navBtn}>
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.dateCenterBox}>
          <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          {isToday && <Text style={styles.todayBadge}>TODAY</Text>}
        </View>
        <TouchableOpacity onPress={() => goDay(1)} style={styles.navBtn}>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          {/* Mood */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>How are you feeling?</Text>
            <View style={styles.moodRow}>
              {[1, 2, 3, 4, 5].map(m => {
                const active = entry.mood === String(m);
                return (
                  <TouchableOpacity
                    key={m}
                    onPress={() => update('mood', String(m))}
                    style={[styles.moodBtn, active && { backgroundColor: MOOD_COLORS[m], borderColor: MOOD_COLORS[m] }]}
                  >
                    <Text style={[styles.moodNum, active && styles.moodNumActive]}>{m}</Text>
                    <Text style={[styles.moodLabel, active && styles.moodLabelActive]}>{MOOD_LABELS[m]}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Sleep Schedule */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Sleep Schedule</Text>
            <View style={styles.sleepRow}>
              <View style={styles.sleepField}>
                <Text style={styles.fieldLabel}>Wake Time</Text>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() => setTimePickerField('wakeTime')}
                >
                  <Text style={styles.timeBtnText}>{entry.wakeTime || '—'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.sleepDivider} />
              <View style={styles.sleepField}>
                <Text style={styles.fieldLabel}>Bed Time</Text>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() => setTimePickerField('bedTime')}
                >
                  <Text style={styles.timeBtnText}>{entry.bedTime || '—'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Morning Plan */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Morning Plan</Text>
            <TextInput
              style={styles.textarea}
              multiline
              value={entry.plan}
              onChangeText={v => update('plan', v)}
              placeholder="What do you intend to do today?"
              placeholderTextColor={colors.soft}
              onEndEditing={triggerAutosave}
            />
          </View>

          {/* Daily Practices */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Daily Practices</Text>
            <Text style={styles.subtitle}>
              {DAILY_PRACTICES.filter(p => p.type !== 'stars_only' && entry.daily?.[p.id]).length}
              /{DAILY_PRACTICES.filter(p => p.type !== 'stars_only').length} completed
            </Text>
            {DAILY_PRACTICES.map(practice => (
              <PracticeItem
                key={practice.id}
                practice={practice}
                daily={entry.daily || {}}
                onChange={updateDaily}
              />
            ))}
          </View>

          {/* Time Allocation */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Time Allocation</Text>
            <Text style={styles.subtitle}>
              {totalMinutes} min logged ({Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m)
              {totalMinutes > 1440 ? ' ⚠ Over 24h' : ''}
            </Text>
            {TIME_CATEGORIES.map(cat => (
              <View key={cat.id} style={styles.minuteRow}>
                <Text style={styles.minuteLabel}>{cat.label}</Text>
                <TextInput
                  style={styles.minuteInput}
                  value={entry.minutes?.[cat.id] ? String(entry.minutes[cat.id]) : ''}
                  onChangeText={v => updateMinutes(cat.id, v)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.line}
                  onEndEditing={triggerAutosave}
                />
                <Text style={styles.minLabel}>min</Text>
              </View>
            ))}
          </View>

          {/* Weekly Tasks */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Weekly Tasks</Text>
            <Text style={styles.subtitle}>Checking any of these marks the task for the entire week.</Text>
            {WEEKLY_TASKS.map(task => {
              const checked = !!entry.weekly?.[task.id];
              return (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskRow}
                  onPress={() => updateWeekly(task.id, !checked)}
                >
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked && <Text style={styles.checkmarkTxt}>✓</Text>}
                  </View>
                  <Text style={[styles.taskLabel, !checked && styles.taskLabelOff]}>{task.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Monthly Tasks */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Monthly Tasks</Text>
            {MONTHLY_TASKS.map(task => {
              const checked = !!entry.monthly?.[task.id];
              return (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskRow}
                  onPress={() => updateMonthly(task.id, !checked)}
                >
                  <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                    {checked && <Text style={styles.checkmarkTxt}>✓</Text>}
                  </View>
                  <Text style={[styles.taskLabel, !checked && styles.taskLabelOff]}>{task.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Evening Reflection */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Evening Reflection</Text>

            <Text style={styles.fieldLabel}>How did the day go?</Text>
            <TextInput
              style={styles.textarea}
              multiline
              value={entry.actual}
              onChangeText={v => update('actual', v)}
              placeholder="Reflect on your day..."
              placeholderTextColor={colors.soft}
              onEndEditing={triggerAutosave}
            />

            <Text style={styles.fieldLabel}>Three things I'm grateful for</Text>
            <TextInput
              style={styles.textarea}
              multiline
              value={entry.grateful}
              onChangeText={v => update('grateful', v)}
              placeholder="1. …&#10;2. …&#10;3. …"
              placeholderTextColor={colors.soft}
              onEndEditing={triggerAutosave}
            />

            <Text style={styles.fieldLabel}>Mistakes to learn from / Apologies</Text>
            <TextInput
              style={styles.textarea}
              multiline
              value={entry.apology}
              onChangeText={v => update('apology', v)}
              placeholder="What would I do differently?"
              placeholderTextColor={colors.soft}
              onEndEditing={triggerAutosave}
            />

            <Text style={styles.fieldLabel}>Kindness offered today</Text>
            <TextInput
              style={styles.textarea}
              multiline
              value={entry.kindness}
              onChangeText={v => update('kindness', v)}
              placeholder="How did I help or give today?"
              placeholderTextColor={colors.soft}
              onEndEditing={triggerAutosave}
            />

            <Text style={styles.fieldLabel}>Something I learned</Text>
            <TextInput
              style={styles.textarea}
              multiline
              value={entry.lesson}
              onChangeText={v => update('lesson', v)}
              placeholder="Insight, skill, or wisdom..."
              placeholderTextColor={colors.soft}
              onEndEditing={triggerAutosave}
            />
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.saveBtn, saveStatus === 'saved' && styles.saveBtnDone]}
            onPress={() => handleSave(false)}
            disabled={saveStatus === 'saving'}
          >
            <Text style={styles.saveBtnText}>
              {saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓  Saved' : 'Save Entry'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() =>
              Alert.alert('Clear Entry', 'Clear all fields for this date?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: () => setEntry(emptyEntry(selectedDate)) },
              ])
            }
          >
            <Text style={styles.clearBtnText}>Clear Form</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Time Picker Modal */}
      <Modal
        visible={!!timePickerField}
        transparent
        animationType="slide"
        onRequestClose={() => setTimePickerField(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTimePickerField(null)}
        >
          <View style={styles.timePicker}>
            <View style={styles.timePickerHeader}>
              <Text style={styles.timePickerTitle}>
                {timePickerField === 'wakeTime' ? 'Wake Time' : 'Bed Time'}
              </Text>
              <TouchableOpacity onPress={() => setTimePickerField(null)}>
                <Text style={styles.timePickerDone}>Done</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={TIME_SLOTS}
              keyExtractor={item => item.value + item.label}
              getItemLayout={(_, i) => ({ length: 48, offset: 48 * i, index: i })}
              initialScrollIndex={Math.max(
                0,
                TIME_SLOTS.findIndex(s => s.value === entry[timePickerField]) - 3,
              )}
              renderItem={({ item }) => {
                const selected = item.value === entry[timePickerField];
                return (
                  <TouchableOpacity
                    style={[styles.timeSlot, selected && styles.timeSlotSelected]}
                    onPress={() => {
                      update(timePickerField, item.value);
                      setTimePickerField(null);
                    }}
                  >
                    <Text style={[styles.timeSlotText, selected && styles.timeSlotTextSelected]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  navBtn: {
    padding: 8,
    minWidth: 44,
    alignItems: 'center',
  },
  navArrow: {
    fontSize: 28,
    color: colors.accent,
    lineHeight: 32,
  },
  dateCenterBox: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: colors.ink,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  todayBadge: {
    fontSize: 10,
    color: colors.good,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  scroll: { flex: 1 },
  content: { padding: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  sectionTitle: {
    fontSize: 17,
    fontFamily: 'Georgia',
    color: colors.ink,
    marginBottom: 10,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 12,
    color: colors.soft,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  moodBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  moodNum: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.soft,
  },
  moodNumActive: {
    color: '#fff',
  },
  moodLabel: {
    fontSize: 9,
    color: colors.soft,
    marginTop: 2,
    textAlign: 'center',
  },
  moodLabelActive: {
    color: 'rgba(255,255,255,0.9)',
  },
  sleepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sleepField: {
    flex: 1,
    alignItems: 'center',
  },
  sleepDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.line,
    marginHorizontal: 12,
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.soft,
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  timeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.accentSoft,
    backgroundColor: colors.bg,
  },
  timeBtnText: {
    fontSize: 22,
    color: colors.accent,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  textarea: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.bg,
    minHeight: 80,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  minuteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  minuteLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.ink,
  },
  minuteInput: {
    width: 60,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    padding: 6,
    textAlign: 'center',
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.bg,
  },
  minLabel: {
    width: 32,
    fontSize: 12,
    color: colors.soft,
    marginLeft: 6,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.line,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  checkboxChecked: {
    backgroundColor: colors.good,
    borderColor: colors.good,
  },
  checkmarkTxt: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
  },
  taskLabelOff: {
    color: colors.soft,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveBtnDone: {
    backgroundColor: colors.good,
  },
  saveBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  clearBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  clearBtnText: {
    fontSize: 15,
    color: colors.soft,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  timePicker: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 380,
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  timePickerTitle: {
    fontSize: 17,
    fontFamily: 'Georgia',
    color: colors.ink,
    fontWeight: '600',
  },
  timePickerDone: {
    fontSize: 16,
    color: colors.accent,
    fontWeight: '600',
  },
  timeSlot: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  timeSlotSelected: {
    backgroundColor: colors.accentSoft,
  },
  timeSlotText: {
    fontSize: 17,
    color: colors.ink,
    fontFamily: 'Georgia',
  },
  timeSlotTextSelected: {
    color: colors.accent,
    fontWeight: '700',
  },
});
