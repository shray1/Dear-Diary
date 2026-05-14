import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getAllEntries, getWeights } from '../utils/storage';
import { scoreDay, getGrade } from '../utils/scoring';
import { formatDate, today } from '../utils/dates';
import { DAILY_PRACTICES } from '../constants/practices';
import { colors } from '../constants/theme';

const MOOD_LABELS = ['', 'Very Poor', 'Poor', 'Neutral', 'Good', 'Excellent'];

export default function HistoryScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [weights, setWeights] = useState(null);
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const load = async () => {
    const all = await getAllEntries();
    const w = await getWeights();
    setWeights(w);
    const sorted = Object.values(all).sort((a, b) => b.date.localeCompare(a.date));
    setEntries(sorted);
  };

  const filtered = search.trim()
    ? entries.filter(e => e.date.includes(search) || (e.plan || '').toLowerCase().includes(search.toLowerCase()) || (e.actual || '').toLowerCase().includes(search.toLowerCase()))
    : entries;

  const checkCount = (entry) =>
    DAILY_PRACTICES.filter(p => p.type !== 'stars_only' && entry.daily?.[p.id]).length;

  const renderItem = ({ item }) => {
    const result = scoreDay(item, weights);
    const { color } = getGrade(result.total);
    const isToday = item.date === today();

    return (
      <TouchableOpacity
        style={[styles.item, isToday && styles.itemToday]}
        onPress={() => navigation.navigate('Today', { date: item.date })}
        activeOpacity={0.7}
      >
        <View style={[styles.scorePill, { backgroundColor: color }]}>
          <Text style={styles.scorePillText}>{result.total}</Text>
        </View>
        <View style={styles.itemBody}>
          <Text style={styles.itemDate}>
            {formatDate(item.date)}{isToday ? '  · Today' : ''}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaChip}>{checkCount(item)}/15 practices</Text>
            {item.mood && (
              <Text style={styles.metaChip}>Mood: {MOOD_LABELS[item.mood] || item.mood}</Text>
            )}
          </View>
          {item.plan ? (
            <Text style={styles.planSnippet} numberOfLines={2}>{item.plan}</Text>
          ) : null}
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.count}>{entries.length} entries</Text>
      </View>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="Search entries..."
          placeholderTextColor={colors.soft}
          clearButtonMode="while-editing"
        />
      </View>
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📖</Text>
          <Text style={styles.emptyText}>
            {entries.length === 0 ? 'No entries yet.\nStart writing in the Today tab.' : 'No results found.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.date}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
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
  count: {
    fontSize: 13,
    color: colors.soft,
  },
  searchBox: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  search: {
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.ink,
    borderWidth: 1,
    borderColor: colors.line,
  },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  itemToday: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  scorePill: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  scorePillText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  itemBody: { flex: 1 },
  itemDate: {
    fontSize: 13,
    color: colors.soft,
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  metaChip: {
    fontSize: 12,
    color: colors.accent,
    backgroundColor: colors.accentSoft + '50',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  planSnippet: {
    fontSize: 13,
    color: colors.soft,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  chevron: {
    fontSize: 22,
    color: colors.soft,
    marginLeft: 8,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: colors.soft,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
});
