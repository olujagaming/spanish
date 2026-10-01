/** App state (progress, cards, settings) and pure update functions. */

import { newCard, review, type Rating, type SrsCard } from './srs';
import type { Region } from './speech';

export interface LessonProgress {
  stars: number;
  best: number;
  completedAt: number;
}

export interface CustomCard {
  key: string;
  es: string;
  de: string;
  created: number;
}

export interface Settings {
  dailyGoal: number;
  region: Region;
  rate: number;
  voiceURI?: string;
  theme: 'auto' | 'light' | 'dark';
  sound: boolean;
  autoplay: boolean;
  /** Show Latin-American hints. */
  showRegional: boolean;
  /** Allow opening any lesson without unlocking. */
  freeMode: boolean;
  name: string;
}

export interface AppState {
  version: 1;
  xp: number;
  /** XP earned per day, key = YYYY-MM-DD. */
  days: Record<string, number>;
  streak: number;
  bestStreak: number;
  lastActive?: string;
  lessons: Record<string, LessonProgress>;
  conversations: Record<string, { best: number; completedAt: number }>;
  grammar: Record<string, { best: number; completedAt: number }>;
  /** Spaced repetition cards keyed by word key. */
  cards: Record<string, SrsCard>;
  custom: CustomCard[];
  achievements: Record<string, number>;
  highscores: Record<string, number>;
  stats: {
    reviews: number;
    gamesPlayed: number;
    perfectLessons: number;
    wordsSpoken: number;
  };
  settings: Settings;
  /** In-game currency, earned 1:1 with XP, spent on plaza decorations. */
  reales: number;
  /** Bought decorations: decoration id → count owned. */
  inventory: Record<string, number>;
  /** Decorations placed on the plaza: slot id → decoration id. */
  plaza: Record<string, string>;
}

export const DEFAULT_SETTINGS: Settings = {
  dailyGoal: 30,
  region: 'es',
  rate: 0.9,
  theme: 'dark',
  sound: true,
  autoplay: true,
  showRegional: true,
  freeMode: false,
  name: '',
};

export function initialState(): AppState {
  return {
    version: 1,
    xp: 0,
    days: {},
    streak: 0,
    bestStreak: 0,
    lessons: {},
    conversations: {},
    grammar: {},
    cards: {},
    custom: [],
    achievements: {},
    highscores: {},
    stats: { reviews: 0, gamesPlayed: 0, perfectLessons: 0, wordsSpoken: 0 },
    settings: { ...DEFAULT_SETTINGS },
    reales: 0,
    inventory: {},
    plaza: {},
  };
}

/** Merge a possibly old/partial saved state with defaults. */
export function migrate(raw: unknown): AppState {
  const base = initialState();
  if (!raw || typeof raw !== 'object') return base;
  const s = raw as Partial<AppState>;
  // Saves from before the plaza existed: grant reales for past XP and switch to the new dark look.
  const legacy = s.reales === undefined;
  const settings = { ...base.settings, ...(s.settings ?? {}) };
  if (legacy && settings.theme === 'auto') settings.theme = 'dark';
  return {
    ...base,
    ...s,
    version: 1,
    stats: { ...base.stats, ...(s.stats ?? {}) },
    settings,
    reales: legacy ? (s.xp ?? 0) : (s.reales ?? 0),
    inventory: s.inventory ?? {},
    plaza: s.plaza ?? {},
  };
}

export function dayKey(ts = Date.now()): string {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function previousDayKey(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d - 1);
  return dayKey(date.getTime());
}

/** Streak as it should be displayed today (0 if a day was missed). */
export function currentStreak(s: AppState, now = Date.now()): number {
  if (!s.lastActive) return 0;
  const today = dayKey(now);
  if (s.lastActive === today || s.lastActive === previousDayKey(today)) return s.streak;
  return 0;
}

export function addXp(s: AppState, amount: number, now = Date.now()): AppState {
  const today = dayKey(now);
  let streak = s.streak;
  if (s.lastActive !== today) {
    streak = s.lastActive === previousDayKey(today) ? s.streak + 1 : 1;
  }
  return {
    ...s,
    xp: s.xp + amount,
    reales: s.reales + amount,
    days: { ...s.days, [today]: (s.days[today] ?? 0) + amount },
    streak,
    bestStreak: Math.max(s.bestStreak, streak),
    lastActive: today,
  };
}

export function todayXp(s: AppState, now = Date.now()): number {
  return s.days[dayKey(now)] ?? 0;
}

/** Level from XP – each level needs a bit more XP than the one before. */
export function levelFromXp(xp: number): { level: number; into: number; needed: number } {
  let level = 1;
  let needed = 100;
  let rest = xp;
  while (rest >= needed) {
    rest -= needed;
    level += 1;
    needed = Math.round(needed * 1.15);
  }
  return { level, into: rest, needed };
}

export function addCards(s: AppState, keys: string[], now = Date.now()): AppState {
  const cards = { ...s.cards };
  let changed = false;
  for (const k of keys) {
    if (!cards[k]) {
      cards[k] = newCard(now);
      changed = true;
    }
  }
  return changed ? { ...s, cards } : s;
}

export function reviewCard(s: AppState, key: string, rating: Rating, now = Date.now()): AppState {
  const card = s.cards[key] ?? newCard(now);
  return {
    ...s,
    cards: { ...s.cards, [key]: review(card, rating, now) },
    stats: { ...s.stats, reviews: s.stats.reviews + 1 },
  };
}

export function completeLesson(
  s: AppState,
  lessonId: string,
  score: number,
  wordKeys: string[],
  now = Date.now(),
): AppState {
  const stars = score >= 0.95 ? 3 : score >= 0.8 ? 2 : 1;
  const prev = s.lessons[lessonId];
  const first = !prev;
  let next: AppState = {
    ...s,
    lessons: {
      ...s.lessons,
      [lessonId]: {
        stars: Math.max(stars, prev?.stars ?? 0),
        best: Math.max(score, prev?.best ?? 0),
        completedAt: now,
      },
    },
    stats: {
      ...s.stats,
      perfectLessons: s.stats.perfectLessons + (score >= 1 ? 1 : 0),
    },
  };
  next = addCards(next, wordKeys, now);
  return addXp(next, first ? 20 + stars * 5 : 10, now);
}
