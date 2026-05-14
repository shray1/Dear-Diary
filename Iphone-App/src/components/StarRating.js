import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/theme';

export default function StarRating({ value = 0, onChange, maxStars = 5, size = 22 }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: maxStars }, (_, i) => {
        const starVal = i + 1;
        return (
          <TouchableOpacity
            key={i}
            onPress={() => onChange(value === starVal ? 0 : starVal)}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text style={[styles.star, { fontSize: size, color: i < value ? colors.starOn : colors.starOff }]}>
              ★
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 1,
  },
});
