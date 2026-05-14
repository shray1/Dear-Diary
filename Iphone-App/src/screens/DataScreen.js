import React, { useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getAllEntries, setAllEntries, clearAllData } from '../utils/storage';
import { today } from '../utils/dates';
import { colors } from '../constants/theme';

function mergeEntries(base, incoming) {
  const merged = { ...base };
  for (const [date, entry] of Object.entries(incoming)) {
    if (!merged[date]) {
      merged[date] = entry;
    } else {
      const existing = merged[date];
      const result = { ...existing };
      for (const [k, v] of Object.entries(entry)) {
        if (typeof v === 'string') {
          result[k] = (v || '').length >= (existing[k] || '').length ? v : existing[k];
        } else if (typeof v === 'boolean') {
          result[k] = v || existing[k];
        } else if (typeof v === 'number') {
          result[k] = Math.max(v, existing[k] || 0);
        } else if (v && typeof v === 'object') {
          result[k] = { ...(existing[k] || {}), ...v };
        }
      }
      merged[date] = result;
    }
  }
  return merged;
}

export default function DataScreen() {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const showStatus = (msg, isError = false) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 4000);
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const entries = await getAllEntries();
      const json = JSON.stringify(entries, null, 2);
      const filename = `dear-diary-backup-${today()}.json`;
      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, json, { encoding: FileSystem.EncodingType.UTF8 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/json',
          dialogTitle: 'Save or share your Dear Diary backup',
        });
      } else {
        showStatus('Sharing is not available on this device.');
      }
    } catch (e) {
      showStatus('Export failed: ' + e.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.length) return;
      setLoading(true);
      const fileUri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });
      const incoming = JSON.parse(content);
      if (typeof incoming !== 'object' || Array.isArray(incoming)) {
        showStatus('Invalid backup file format.', true);
        return;
      }
      const existing = await getAllEntries();
      const merged = mergeEntries(existing, incoming);
      await setAllEntries(merged);
      const count = Object.keys(incoming).length;
      showStatus(`Imported ${count} entries successfully.`);
    } catch (e) {
      showStatus('Import failed: ' + e.message, true);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      'Erase All Data',
      'This will permanently delete all diary entries and custom weights. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase Everything',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            await clearAllData();
            setLoading(false);
            showStatus('All data erased.');
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Data</Text>
        <Text style={styles.intro}>
          Export your diary to keep a backup, or import a previous backup to restore your entries.
          Importing merges data — it does not overwrite.
        </Text>

        {statusMsg ? (
          <View style={styles.statusBanner}>
            <Text style={styles.statusText}>{statusMsg}</Text>
          </View>
        ) : null}

        {/* Export */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Export Backup</Text>
          <Text style={styles.cardDesc}>
            Saves all your entries to a JSON file. You can share it via Files, iCloud, email, or AirDrop.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleExport} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Export JSON Backup</Text>}
          </TouchableOpacity>
        </View>

        {/* Import */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Import Backup</Text>
          <Text style={styles.cardDesc}>
            Select a previously exported JSON backup file. Entries will be merged with your current data.
          </Text>
          <TouchableOpacity style={styles.secondaryBtn} onPress={handleImport} disabled={loading}>
            <Text style={styles.secondaryBtnText}>Import JSON Backup</Text>
          </TouchableOpacity>
        </View>

        {/* Erase */}
        <View style={[styles.card, styles.dangerCard]}>
          <Text style={styles.cardTitle}>Erase All Data</Text>
          <Text style={styles.cardDesc}>
            Permanently deletes all diary entries and custom scoring weights. Export a backup first.
          </Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={handleClear} disabled={loading}>
            <Text style={styles.dangerBtnText}>Erase All Entries</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Cross-device transfer</Text>
          <Text style={styles.infoText}>
            To transfer your diary to another phone:{'\n'}
            1. Export backup on this phone{'\n'}
            2. Share the JSON file via AirDrop, iCloud, or email{'\n'}
            3. Open the Dear Diary app on the new phone{'\n'}
            4. Use Import to load your backup
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  statusBanner: {
    backgroundColor: colors.good,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dangerCard: {
    borderColor: colors.danger + '60',
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: 'Georgia',
    color: colors.ink,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: colors.soft,
    lineHeight: 20,
    marginBottom: 14,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  secondaryBtn: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.accent,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  dangerBtn: {
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.danger,
  },
  dangerBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.danger,
  },
  infoBox: {
    backgroundColor: colors.accentSoft + '40',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.ink,
    lineHeight: 22,
  },
});
