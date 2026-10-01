/** Generates varied exercises from lesson content. */

import type { Lesson, Phrase, Word } from '../content/types';
import { tokenize } from './answer';

export type Exercise =
  | { kind: 'choice'; dir: 'es-de' | 'de-es'; prompt: string; speak?: string; options: string[]; answer: string; key?: string }
  | { kind: 'listen'; audio: string; options: string[]; answer: string; key?: string }
  | { kind: 'type'; prompt: string; answer: string; note?: string; key?: string }
  | { kind: 'build'; prompt: string; answer: string; tokens: string[] }
  | { kind: 'match'; pairs: [string, string][] }
  | { kind: 'gap'; before: string; after: string; de: string; options: string[]; answer: string; full: string }
  | { kind: 'speak'; text: string; de: string };

export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample<T>(arr: readonly T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

/** Picks n distinct distractor strings that differ from the answer. */
function distractors(answer: string, pool: readonly string[], n: number): string[] {
  const seen = new Set([answer.toLowerCase()]);
  const out: string[] = [];
  for (const p of shuffle(pool)) {
    const k = p.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
    if (out.length === n) break;
  }
  return out;
}

function options(answer: string, pool: readonly string[], n = 3): string[] {
  return shuffle([answer, ...distractors(answer, pool, n)]);
}

const isShort = (w: Word) => w.es.split(' ').length <= 3 && w.es.length <= 22;

export function choiceEsDe(w: Word, pool: Word[]): Exercise {
  return {
    kind: 'choice',
    dir: 'es-de',
    prompt: w.es,
    speak: w.es,
    answer: w.de,
    options: options(w.de, pool.map((p) => p.de)),
    key: w.key,
  };
}

export function choiceDeEs(w: Word, pool: Word[]): Exercise {
  return {
    kind: 'choice',
    dir: 'de-es',
    prompt: w.de,
    answer: w.es,
    options: options(w.es, pool.map((p) => p.es)),
    key: w.key,
  };
}

export function listenEx(w: Word, pool: Word[]): Exercise {
  return {
    kind: 'listen',
    audio: w.es,
    answer: w.es,
    options: options(w.es, pool.map((p) => p.es)),
    key: w.key,
  };
}

export function typeEx(w: Word): Exercise {
  return { kind: 'type', prompt: w.de, answer: w.es, note: w.note, key: w.key };
}

export function matchEx(words: Word[]): Exercise {
  // Avoid duplicate German meanings in one match round.
  const seen = new Set<string>();
  const pairs: [string, string][] = [];
  for (const w of words) {
    if (seen.has(w.de) || seen.has(w.es)) continue;
    seen.add(w.de);
    seen.add(w.es);
    pairs.push([w.es, w.de]);
  }
  return { kind: 'match', pairs };
}

export function buildEx(p: Phrase, others: Phrase[]): Exercise {
  const tokens = tokenize(p.es);
  const own = new Set(tokens.map((t) => t.toLowerCase()));
  const extra = distractors(
    '',
    others.flatMap((o) => tokenize(o.es)).filter((t) => !own.has(t.toLowerCase())),
    tokens.length > 6 ? 2 : 3,
  );
  return { kind: 'build', prompt: p.de, answer: p.es, tokens: shuffle([...tokens, ...extra]) };
}

export function gapEx(p: Phrase, others: Phrase[]): Exercise | null {
  const words = p.es.split(' ');
  const candidates = words
    .map((w, i) => ({ w: w.replace(/[¿?¡!.,;:…]/g, ''), i }))
    .filter((x) => x.w.length >= 3);
  if (!candidates.length) return null;
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  const raw = words[pick.i];
  const lead = raw.match(/^[¿¡]*/)?.[0] ?? '';
  const trail = raw.match(/[?!.,;:…]*$/)?.[0] ?? '';
  const head = words.slice(0, pick.i).join(' ');
  const tail = words.slice(pick.i + 1).join(' ');
  const before = (head ? head + ' ' : '') + lead;
  const after = trail + (tail ? ' ' + tail : '');
  const pool = others
    .flatMap((o) => tokenize(o.es))
    .filter((t) => t.length >= 3 && t.toLowerCase() !== pick.w.toLowerCase());
  if (pool.length < 2) return null;
  return {
    kind: 'gap',
    before,
    after,
    de: p.de,
    answer: pick.w,
    options: options(pick.w, pool),
    full: p.es,
  };
}

/** Builds the exercise list for a lesson. */
export function lessonExercises(lesson: Lesson, levelWords: Word[], levelPhrases: Phrase[]): Exercise[] {
  const words = shuffle(lesson.words);
  const pool = lesson.words.length >= 6 ? lesson.words : [...lesson.words, ...levelWords];
  const otherPhrases = [...lesson.phrases, ...levelPhrases];
  const ex: Exercise[] = [];

  words.slice(0, 4).forEach((w) => ex.push(choiceEsDe(w, pool)));
  words.slice(4, 7).forEach((w) => ex.push(choiceDeEs(w, pool)));
  words.slice(7, 9).forEach((w) => ex.push(listenEx(w, pool)));
  words
    .filter(isShort)
    .slice(0, 2)
    .forEach((w) => ex.push(typeEx(w)));
  ex.push(matchEx(sample(lesson.words, 5)));

  const phrases = shuffle(lesson.phrases);
  phrases.slice(0, 3).forEach((p) => ex.push(buildEx(p, otherPhrases.filter((o) => o !== p))));
  phrases.slice(3, 5).forEach((p) => {
    const g = gapEx(p, otherPhrases.filter((o) => o !== p));
    if (g) ex.push(g);
  });

  const mixed = shuffle(ex);
  // Start easy: put a recognition exercise first and a speaking task near the end.
  const firstIdx = mixed.findIndex((e) => e.kind === 'choice' && e.dir === 'es-de');
  if (firstIdx > 0) mixed.unshift(...mixed.splice(firstIdx, 1));
  if (phrases.length) mixed.splice(mixed.length - 1, 0, { kind: 'speak', text: phrases[0].es, de: phrases[0].de });
  return mixed;
}

/** Mixed review exercises for a set of words (level test, quick practice). */
export function reviewExercises(words: Word[], pool: Word[], count: number): Exercise[] {
  return sample(words, count).map((w, i) => {
    const r = i % 4;
    if (r === 0) return choiceEsDe(w, pool);
    if (r === 1) return choiceDeEs(w, pool);
    if (r === 2) return listenEx(w, pool);
    return isShort(w) ? typeEx(w) : choiceDeEs(w, pool);
  });
}
