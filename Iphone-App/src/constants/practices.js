export const DAILY_PRACTICES = [
  { id: 'wakeSunrise', label: 'Woke up before sunrise', type: 'checkbox' },
  {
    id: 'morningWalk',
    label: 'Morning walk or jogging',
    type: 'checkbox_stars',
    subRatings: [
      { id: 'morningWalk_suryanamaskar', label: 'Suryanamaskar (1-5)' },
      { id: 'morningWalk_pranayam', label: 'Pranayam (1-5)' },
    ],
  },
  { id: 'homemadeBreakfast', label: 'Healthy home-made breakfast', type: 'checkbox' },
  { id: 'homemadeLunch', label: 'Healthy home-made lunch', type: 'checkbox' },
  { id: 'homemadeDinner', label: 'Healthy home-made dinner', type: 'checkbox' },
  { id: 'morningPrayer', label: 'Morning prayer', type: 'checkbox_stars' },
  { id: 'eveningPrayer', label: 'Evening prayer', type: 'checkbox_stars' },
  { id: 'helpedSomeone', label: 'Helped someone today', type: 'checkbox' },
  { id: 'noAnger', label: 'Anger Management', type: 'stars_only' },
  { id: 'nsfwFree', label: 'NSFW Free', type: 'stars_only' },
  { id: 'madeHappy', label: 'Made someone happy', type: 'checkbox' },
  { id: 'spokeLess', label: 'Spoke less than usual', type: 'checkbox' },
  { id: 'familyTime', label: 'Spent time with family', type: 'checkbox' },
  { id: 'doGood', label: 'Did / heard / spoke / watched good', type: 'checkbox' },
  { id: 'apologized', label: 'Apologized for mistakes', type: 'checkbox' },
  { id: 'grateful', label: 'Practiced gratitude', type: 'checkbox' },
  { id: 'forgave', label: 'Forgave others', type: 'checkbox' },
];

export const WEEKLY_TASKS = [
  { id: 'visitedRelative', label: 'Visited a relative' },
  { id: 'highIntensity1', label: 'High intensity workout #1' },
  { id: 'highIntensity2', label: 'High intensity workout #2' },
  { id: 'foodFast', label: 'Food fast / diet discipline' },
];

export const MONTHLY_TASKS = [
  { id: 'ashram1', label: 'Visited Ashram (1st visit)' },
  { id: 'ashram2', label: 'Visited Ashram (2nd visit)' },
];

export const TIME_CATEGORIES = [
  { id: 'rest', label: 'Adequate Rest (sleep + naps)' },
  { id: 'meals', label: 'Healthy Meals' },
  { id: 'physical', label: 'Physical Activity' },
  { id: 'leisure', label: 'Leisure Time' },
  { id: 'social', label: 'Social Interaction' },
  { id: 'work', label: 'Productive Work' },
  { id: 'learning', label: 'New Learnings' },
  { id: 'financial', label: 'Financial Growth' },
  { id: 'family', label: 'Family Bonding' },
  { id: 'spiritual', label: 'Spiritual Growth' },
  { id: 'selfCare', label: 'Self Care' },
  { id: 'travel', label: 'Travel Time' },
];

export const DEFAULT_WEIGHTS = {
  daily: {
    wakeSunrise: { base: 6 },
    morningWalk: { base: 6, starsWeight: 3, suryanamaskar: 3, pranayam: 3 },
    homemadeBreakfast: { base: 5 },
    homemadeLunch: { base: 5 },
    homemadeDinner: { base: 5 },
    morningPrayer: { base: 3, starsWeight: 5 },
    eveningPrayer: { base: 3, starsWeight: 5 },
    helpedSomeone: { base: 6 },
    noAnger: { starsWeight: 8 },
    nsfwFree: { starsWeight: 8 },
    madeHappy: { base: 5 },
    spokeLess: { base: 3 },
    familyTime: { base: 5 },
    doGood: { base: 5 },
    apologized: { base: 3 },
    grateful: { base: 4 },
    forgave: { base: 4 },
  },
  weekly: {
    visitedRelative: 5,
    highIntensity1: 5,
    highIntensity2: 5,
    foodFast: 5,
  },
  monthly: {
    ashram1: 10,
    ashram2: 10,
  },
};

export const PRACTICE_LABELS = Object.fromEntries(
  DAILY_PRACTICES.map(p => [p.id, p.label])
);
