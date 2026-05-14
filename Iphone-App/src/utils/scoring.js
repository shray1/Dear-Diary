import { DEFAULT_WEIGHTS, PRACTICE_LABELS } from '../constants/practices';
import { getWeekDates, getWeekStart, getMonthWeeks } from './dates';

export function getEffectiveWeights(customWeights) {
  return customWeights || DEFAULT_WEIGHTS;
}

export function scoreDay(entry, customWeights) {
  if (!entry) return { total: 0, max: 100, breakdown: [], hasEntry: false };

  const weights = getEffectiveWeights(customWeights);
  const dw = weights.daily;
  const daily = entry.daily || {};

  let total = 0;
  const breakdown = [];

  const add = (id, label, earned, max) => {
    total += earned;
    breakdown.push({ id, label, earned: Math.round(earned * 10) / 10, max });
  };

  // wakeSunrise
  const wsW = dw.wakeSunrise?.base || 0;
  add('wakeSunrise', 'Wake before sunrise', daily.wakeSunrise ? wsW : 0, wsW);

  // morningWalk
  const mwBase = dw.morningWalk?.base || 0;
  const mwStars = dw.morningWalk?.starsWeight || 0;
  const mwSury = dw.morningWalk?.suryanamaskar || 0;
  const mwPran = dw.morningWalk?.pranayam || 0;
  const mwMax = mwBase + mwStars + mwSury + mwPran;
  let mwEarned = 0;
  if (daily.morningWalk) {
    mwEarned += mwBase;
    mwEarned += mwStars * ((daily.morningWalkRating || 0) / 5);
    mwEarned += mwSury * ((daily.morningWalk_suryanamaskar || 0) / 5);
    mwEarned += mwPran * ((daily.morningWalk_pranayam || 0) / 5);
  }
  add('morningWalk', 'Morning walk', mwEarned, mwMax);

  // morningPrayer
  const mpBase = dw.morningPrayer?.base || 0;
  const mpStars = dw.morningPrayer?.starsWeight || 0;
  let mpEarned = 0;
  if (daily.morningPrayer) {
    mpEarned += mpBase;
    mpEarned += mpStars * ((daily.morningPrayerRating || 0) / 5);
  }
  add('morningPrayer', 'Morning prayer', mpEarned, mpBase + mpStars);

  // eveningPrayer
  const epBase = dw.eveningPrayer?.base || 0;
  const epStars = dw.eveningPrayer?.starsWeight || 0;
  let epEarned = 0;
  if (daily.eveningPrayer) {
    epEarned += epBase;
    epEarned += epStars * ((daily.eveningPrayerRating || 0) / 5);
  }
  add('eveningPrayer', 'Evening prayer', epEarned, epBase + epStars);

  // noAnger (stars only)
  const naW = dw.noAnger?.starsWeight || 0;
  add('noAnger', 'Anger Management', naW * ((daily.noAngerRating || 0) / 5), naW);

  // nsfwFree (stars only)
  const nfW = dw.nsfwFree?.starsWeight || 0;
  add('nsfwFree', 'NSFW Free', nfW * ((daily.nsfwFreeRating || 0) / 5), nfW);

  // simple checkboxes
  const simpleIds = [
    'homemadeBreakfast', 'homemadeLunch', 'homemadeDinner',
    'helpedSomeone', 'madeHappy', 'spokeLess', 'familyTime',
    'doGood', 'apologized', 'grateful', 'forgave',
  ];
  for (const id of simpleIds) {
    const w = dw[id]?.base || 0;
    add(id, PRACTICE_LABELS[id] || id, daily[id] ? w : 0, w);
  }

  return { total: Math.round(total), max: 100, breakdown, hasEntry: true };
}

export function scoreWeek(weekStart, allEntries, customWeights) {
  const dates = getWeekDates(weekStart);
  const weights = getEffectiveWeights(customWeights);

  let totalDayPoints = 0;
  const dayScores = [];

  for (const date of dates) {
    const entry = allEntries[date] || null;
    const result = scoreDay(entry, customWeights);
    dayScores.push({ date, score: result.total, hasEntry: result.hasEntry });
    if (result.hasEntry) totalDayPoints += result.total;
  }

  const ww = weights.weekly;
  let weeklyPart = 0;
  const weeklyResults = {};
  for (const id of ['visitedRelative', 'highIntensity1', 'highIntensity2', 'foodFast']) {
    const done = dates.some(d => allEntries[d]?.weekly?.[id]);
    weeklyResults[id] = done;
    if (done) weeklyPart += ww[id] || 0;
  }

  const dailyPart = (totalDayPoints / 700) * 80;

  return {
    total: Math.round(dailyPart + weeklyPart),
    dailyPart: Math.round(dailyPart),
    weeklyPart: Math.round(weeklyPart),
    dayScores,
    weeklyResults,
  };
}

export function scoreMonth(year, month, allEntries, customWeights) {
  const weekStarts = getMonthWeeks(year, month);
  const weights = getEffectiveWeights(customWeights);

  let totalWeekScore = 0;
  let activeWeeks = 0;
  const weekResults = [];

  for (const ws of weekStarts) {
    const result = scoreWeek(ws, allEntries, customWeights);
    const hasAny = getWeekDates(ws).some(d => allEntries[d]);
    weekResults.push({ weekStart: ws, hasEntries: hasAny, ...result });
    if (hasAny) {
      totalWeekScore += result.total;
      activeWeeks++;
    }
  }

  // collect all days that fall in this month
  const monthDates = [];
  for (const ws of weekStarts) {
    for (const d of getWeekDates(ws)) {
      const [dy, dm] = d.split('-').map(Number);
      if (dy === year && dm === month + 1) monthDates.push(d);
    }
  }

  const mw = weights.monthly;
  let monthlyPart = 0;
  const monthlyResults = {};
  for (const id of ['ashram1', 'ashram2']) {
    const done = monthDates.some(d => allEntries[d]?.monthly?.[id]);
    monthlyResults[id] = done;
    if (done) monthlyPart += mw[id] || 0;
  }

  const weeklyPart = activeWeeks > 0 ? (totalWeekScore / (activeWeeks * 100)) * 80 : 0;

  return {
    total: Math.round(weeklyPart + monthlyPart),
    weeklyPart: Math.round(weeklyPart),
    monthlyPart: Math.round(monthlyPart),
    weekResults,
    monthlyResults,
  };
}

export function scoreYear(year, allEntries, customWeights) {
  let total = 0;
  let activeMonths = 0;
  const monthResults = [];

  for (let m = 0; m < 12; m++) {
    const result = scoreMonth(year, m, allEntries, customWeights);
    monthResults.push({ month: m, ...result });
    if (result.weekResults.some(w => w.hasEntries)) {
      total += result.total;
      activeMonths++;
    }
  }

  return {
    total: activeMonths > 0 ? Math.round(total / activeMonths) : 0,
    monthResults,
  };
}

export function getGrade(score) {
  if (score >= 90) return { grade: 'Excellent', text: 'A beautiful day', color: '#5a8a5a' };
  if (score >= 75) return { grade: 'Strong', text: 'Keep going', color: '#5a8a5a' };
  if (score >= 60) return { grade: 'Steady', text: 'Good base', color: '#8b6f47' };
  if (score >= 40) return { grade: 'Mixed', text: 'Room to grow', color: '#c97a4f' };
  if (score >= 20) return { grade: 'Low', text: 'Gentle reset tomorrow', color: '#c97a4f' };
  return { grade: 'Very low', text: 'Be kind to yourself', color: '#c0392b' };
}

export function propagateWeeklyMonthly(entry, allEntries) {
  const weekStart = getWeekStart(entry.date);
  const weekDates = getWeekDates(weekStart);

  // union weekly across the week
  const weeklyUnion = { ...(entry.weekly || {}) };
  for (const d of weekDates) {
    if (d !== entry.date && allEntries[d]) {
      for (const k of Object.keys(allEntries[d].weekly || {})) {
        if (allEntries[d].weekly[k]) weeklyUnion[k] = true;
      }
    }
  }

  // union monthly across the month
  const [y, m] = entry.date.split('-').map(Number);
  const monthWeeks = getMonthWeeks(y, m - 1);
  const monthDates = [];
  for (const ws of monthWeeks) {
    for (const d of getWeekDates(ws)) {
      const [dy, dm] = d.split('-').map(Number);
      if (dy === y && dm === m) monthDates.push(d);
    }
  }
  const monthlyUnion = { ...(entry.monthly || {}) };
  for (const d of monthDates) {
    if (d !== entry.date && allEntries[d]) {
      for (const k of Object.keys(allEntries[d].monthly || {})) {
        if (allEntries[d].monthly[k]) monthlyUnion[k] = true;
      }
    }
  }

  const updatedEntry = { ...entry, weekly: weeklyUnion, monthly: monthlyUnion };

  // propagate back to sibling days
  const updated = { ...allEntries };
  for (const d of weekDates) {
    if (updated[d] && d !== entry.date) {
      updated[d] = { ...updated[d], weekly: weeklyUnion };
    }
  }
  for (const d of monthDates) {
    if (updated[d] && d !== entry.date) {
      updated[d] = { ...updated[d], monthly: monthlyUnion };
    }
  }
  updated[entry.date] = updatedEntry;

  return { updatedEntries: updated, updatedEntry };
}
