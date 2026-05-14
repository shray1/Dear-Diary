import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import StarRating from './StarRating';
import { colors } from '../constants/theme';

export default function PracticeItem({ practice, daily, onChange }) {
  const { id, label, type, subRatings } = practice;
  const checked = !!daily[id];
  const rating = daily[`${id}Rating`] || 0;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {type !== 'stars_only' && (
          <TouchableOpacity
            onPress={() => onChange(id, !checked)}
            style={styles.checkboxBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
              {checked && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        )}
        <Text style={[styles.label, type === 'stars_only' && styles.labelIndent, !checked && type !== 'stars_only' && styles.labelUnchecked]}>
          {label}
        </Text>
        {(type === 'checkbox_stars' || type === 'stars_only') && (
          <StarRating
            value={rating}
            onChange={val => onChange(`${id}Rating`, val)}
            size={20}
          />
        )}
      </View>

      {type === 'checkbox_stars' && checked && subRatings && subRatings.map(sub => (
        <View key={sub.id} style={styles.subRow}>
          <Text style={styles.subLabel}>{sub.label}</Text>
          <StarRating
            value={daily[sub.id] || 0}
            onChange={val => onChange(sub.id, val)}
            size={17}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
  },
  checkboxBtn: {
    marginRight: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  checkboxChecked: {
    backgroundColor: colors.good,
    borderColor: colors.good,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  label: {
    flex: 1,
    fontSize: 15,
    color: colors.ink,
    lineHeight: 20,
  },
  labelIndent: {
    marginLeft: 34,
  },
  labelUnchecked: {
    color: colors.soft,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 34,
    marginTop: 4,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: colors.line,
  },
  subLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.soft,
  },
});
