import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/theme';

const GOOD_DAY_TIME = [
  { label: 'Adequate Rest (sleep + naps)', time: '7–8 hours' },
  { label: 'Healthy Meals (home-made)', time: '1–2 hours' },
  { label: 'Physical Activity', time: '1 hour' },
  { label: 'Productive Work / Study', time: '3–4 hours' },
  { label: 'Learning / Personal Growth', time: '1 hour' },
  { label: 'Family & Social Time', time: '2 hours' },
  { label: 'Spiritual Practice', time: '30 min' },
  { label: 'Self Care', time: '1 hour' },
  { label: 'Leisure / Downtime', time: '1–1.5 hours' },
  { label: 'Financial Growth', time: '30 min' },
];

const DAILY_INTENTIONS = [
  'Wake before sunrise and start with prayer',
  'Take a morning walk — add Suryanamaskar & Pranayam',
  'Eat only healthy, home-made food',
  'Pray morning and evening with sincerity',
  'Help or give to someone today',
  'Maintain composure — avoid anger entirely',
  'Stay NSFW-free — honour your mind',
  'Spend quality time with family',
  'Do good, speak good, hear good, watch good',
  'Apologize if you made a mistake',
  'Practice gratitude and forgiveness',
];

const WEEKLY_GOALS = [
  'Visit at least one relative',
  'Complete two high-intensity workouts',
  'Observe at least one food fast or disciplined diet day',
];

const MONTHLY_GOALS = [
  'Visit the Ashram at least twice',
];

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function BulletItem({ text, detail }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>·</Text>
      <View style={styles.bulletBody}>
        <Text style={styles.bulletText}>{text}</Text>
        {detail ? <Text style={styles.bulletDetail}>{detail}</Text> : null}
      </View>
    </View>
  );
}

export default function GoalsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>The Vision</Text>
          <Text style={styles.heroSub}>
            A Good Day, a Good Week, a Good Month — one practice at a time.
          </Text>
        </View>

        <Section title="A Good Day — Time Allocation">
          <Text style={styles.note}>How to spend 1,440 minutes wisely:</Text>
          {GOOD_DAY_TIME.map((item, i) => (
            <BulletItem key={i} text={item.label} detail={item.time} />
          ))}
        </Section>

        <Section title="Daily Intentions">
          <Text style={styles.note}>Things to aspire to every single day:</Text>
          {DAILY_INTENTIONS.map((item, i) => (
            <BulletItem key={i} text={item} />
          ))}
        </Section>

        <Section title="Weekly Goals">
          {WEEKLY_GOALS.map((item, i) => (
            <BulletItem key={i} text={item} />
          ))}
        </Section>

        <Section title="Monthly Goals">
          {MONTHLY_GOALS.map((item, i) => (
            <BulletItem key={i} text={item} />
          ))}
        </Section>

        <View style={styles.quote}>
          <Text style={styles.quoteText}>
            "The aim is not perfection — it is gentle, consistent awareness."
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
  hero: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: 'Georgia',
    color: '#fff',
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  section: {
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
    fontWeight: '700',
    marginBottom: 10,
  },
  note: {
    fontSize: 13,
    color: colors.soft,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 20,
    color: colors.accent,
    marginRight: 10,
    lineHeight: 22,
  },
  bulletBody: { flex: 1 },
  bulletText: {
    fontSize: 15,
    color: colors.ink,
    lineHeight: 22,
  },
  bulletDetail: {
    fontSize: 12,
    color: colors.soft,
    marginTop: 1,
  },
  quote: {
    padding: 20,
    alignItems: 'center',
  },
  quoteText: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    color: colors.soft,
    textAlign: 'center',
    lineHeight: 24,
  },
});
