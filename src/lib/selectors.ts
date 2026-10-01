/** Derived data from state + content. */

import { LESSONS, WORD_BY_KEY } from '../content';
import type { Lesson, LevelId, Word } from '../content/types';
import { DAILY_PHRASES, CULTURE } from '../content/extras';
import type { AppState } from './state';
import { dayKey } from './state';
import { isDue, isMastered } from './srs';

export function isLessonDone(s: AppState, id: string): boolean {
  return !!s.lessons[id];
}

/** A lesson is unlocked if it is the first one, the previous one is done, or free mode is on. */
export function isUnlocked(s: AppState, lesson: Lesson): boolean {
  if (s.settings.freeMode || lesson.index === 0) return true;
  if (isLessonDone(s, lesson.id)) return true;
  const prev = LESSONS[lesson.index - 1];
  return !!prev && isLessonDone(s, prev.id);
}

export function nextLesson(s: AppState): Lesson | undefined {
  return LESSONS.find((l) => !isLessonDone(s, l.id) && isUnlocked(s, l)) ?? LESSONS.find((l) => !isLessonDone(s, l.id));
}

export function currentLevel(s: AppState): LevelId {
  return nextLesson(s)?.level ?? 'B2';
}

export interface CardItem {
  key: string;
  es: string;
  de: string;
  note?: string;
  level?: LevelId;
  lessonId?: string;
  custom?: boolean;
}

export function cardItem(s: AppState, key: string): CardItem | undefined {
  const w = WORD_BY_KEY.get(key);
  if (w) return { key, es: w.es, de: w.de, note: w.note, level: w.level, lessonId: w.lessonId };
  const c = s.custom.find((x) => x.key === key);
  if (c) return { key, es: c.es, de: c.de, custom: true };
  return undefined;
}

export function dueKeys(s: AppState, now = Date.now()): string[] {
  return Object.entries(s.cards)
    .filter(([k, c]) => isDue(c, now) && cardItem(s, k))
    .sort((a, b) => a[1].due - b[1].due)
    .map(([k]) => k);
}

export function cardStats(s: AppState, now = Date.now()) {
  const entries = Object.values(s.cards);
  return {
    total: entries.length,
    due: dueKeys(s, now).length,
    mastered: entries.filter(isMastered).length,
    learning: entries.filter((c) => c.reps > 0 && !isMastered(c)).length,
    fresh: entries.filter((c) => c.reps === 0).length,
  };
}

/** Words the learner has met (in completed lessons). Falls back to A0 words for new users. */
export function learnedWords(s: AppState): Word[] {
  const done = new Set(Object.keys(s.lessons));
  const words = LESSONS.filter((l) => done.has(l.id)).flatMap((l) => l.words);
  if (words.length >= 12) return words;
  return LESSONS.filter((l) => l.level === 'A0').flatMap((l) => l.words);
}

function dayIndex(now = Date.now()): number {
  return Math.floor(new Date(dayKey(now)).getTime() / 86400000);
}

export function dailyPhrase(now = Date.now()) {
  return DAILY_PHRASES[dayIndex(now) % DAILY_PHRASES.length];
}

export function dailyCulture(now = Date.now()) {
  return CULTURE[dayIndex(now) % CULTURE.length];
}

export function levelProgress(s: AppState, level: LevelId): { done: number; total: number } {
  const ls = LESSONS.filter((l) => l.level === level);
  return { done: ls.filter((l) => isLessonDone(s, l.id)).length, total: ls.length };
}

/** XP for the last 7 days, oldest first. */
export function weekXp(s: AppState, now = Date.now()): { day: string; xp: number }[] {
  const out = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    out.push({
      day: d.toLocaleDateString('de-DE', { weekday: 'short' }).slice(0, 2),
      xp: s.days[dayKey(d.getTime())] ?? 0,
    });
  }
  return out;
}
