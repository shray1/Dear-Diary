import AsyncStorage from '@react-native-async-storage/async-storage';

const ENTRIES_KEY = 'dearDiary_entries_v1';
const WEIGHTS_KEY = 'dearDiary_weights_v1';

export async function getAllEntries() {
  try {
    const json = await AsyncStorage.getItem(ENTRIES_KEY);
    return json ? JSON.parse(json) : {};
  } catch {
    return {};
  }
}

export async function setAllEntries(entries) {
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export async function saveEntry(entry) {
  const all = await getAllEntries();
  all[entry.date] = entry;
  await setAllEntries(all);
}

export async function getWeights() {
  try {
    const json = await AsyncStorage.getItem(WEIGHTS_KEY);
    return json ? JSON.parse(json) : null;
  } catch {
    return null;
  }
}

export async function saveWeights(weights) {
  await AsyncStorage.setItem(WEIGHTS_KEY, JSON.stringify(weights));
}

export async function clearAllData() {
  await AsyncStorage.multiRemove([ENTRIES_KEY, WEIGHTS_KEY]);
}
