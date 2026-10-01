import { keyOf } from '../lib/answer';
import type { Lesson, LevelId, LevelSource, Word } from './types';
import { A0 } from './lessons/a0';
import { A1 } from './lessons/a1';
import { A2 } from './lessons/a2';
import { B1 } from './lessons/b1';
import { B2 } from './lessons/b2';

export const LEVEL_SOURCES: LevelSource[] = [A0, A1, A2, B1, B2];

export const LEVEL_COLORS: Record<LevelId, string> = {
  A0: '#2bb673',
  A1: '#1e9bd7',
  A2: '#7a5cff',
  B1: '#f39c12',
  B2: '#e8553d',
};

function build() {
  const lessons: Lesson[] = [];
  const wordsByKey = new Map<string, Word>();
  let index = 0;
  for (const level of LEVEL_SOURCES) {
    for (const unit of level.units) {
      for (const src of unit.lessons) {
        const words: Word[] = src.words.map(([es, de, note]) => {
          const key = keyOf(es);
          const word: Word = { key, es, de, note, lessonId: src.id, level: level.id };
          if (!wordsByKey.has(key)) wordsByKey.set(key, word);
          return word;
        });
        lessons.push({
          ...src,
          level: level.id,
          unitId: unit.id,
          unitTitle: unit.title,
          index: index++,
          words,
          phrases: src.phrases.map(([es, de]) => ({ es, de })),
        });
      }
    }
  }
  return { lessons, wordsByKey };
}

const built = build();

export const LESSONS: Lesson[] = built.lessons;
export const WORDS: Word[] = [...built.wordsByKey.values()];
export const WORD_BY_KEY: Map<string, Word> = built.wordsByKey;

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function lessonsOfLevel(level: LevelId): Lesson[] {
  return LESSONS.filter((l) => l.level === level);
}

export function wordsOfLevel(level: LevelId): Word[] {
  return WORDS.filter((w) => w.level === level);
}
