import { describe, expect, it } from 'vitest';
import { LESSONS, WORDS, LEVEL_SOURCES } from './index';
import { GRAMMAR, getGrammar } from './grammar';
import { CONVERSATIONS } from './conversations';
import { DAILY_PHRASES, PHRASEBOOK } from './extras';
import { lessonExercises } from '../lib/exercises';

describe('content', () => {
  it('has unique lesson ids and enough content', () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(LESSONS.length).toBeGreaterThanOrEqual(55);
    expect(WORDS.length).toBeGreaterThanOrEqual(900);
  });

  it('every level has lessons', () => {
    for (const level of LEVEL_SOURCES) {
      expect(level.units.flatMap((u) => u.lessons).length, level.id).toBeGreaterThan(5);
    }
  });

  it('lessons are well-formed', () => {
    for (const l of LESSONS) {
      expect(l.words.length, l.id).toBeGreaterThanOrEqual(10);
      expect(l.phrases.length, l.id).toBeGreaterThanOrEqual(4);
      for (const w of l.words) {
        expect(w.es.trim(), l.id).toBe(w.es);
        expect(w.de.length, `${l.id} ${w.es}`).toBeGreaterThan(0);
      }
      if (l.grammar) expect(getGrammar(l.grammar), `${l.id} → ${l.grammar}`).toBeDefined();
      for (const p of l.phrases) {
        if (p.es.includes('?')) expect(p.es, l.id).toContain('¿');
      }
    }
  });

  it('generates valid exercises for every lesson', () => {
    for (const l of LESSONS) {
      const levelWords = WORDS.filter((w) => w.level === l.level);
      const levelPhrases = LESSONS.filter((x) => x.level === l.level).flatMap((x) => x.phrases);
      const ex = lessonExercises(l, levelWords, levelPhrases);
      expect(ex.length, l.id).toBeGreaterThanOrEqual(12);
      for (const e of ex) {
        if (e.kind === 'choice' || e.kind === 'listen' || e.kind === 'gap') {
          expect(e.options, l.id).toContain(e.answer);
          expect(new Set(e.options).size, l.id).toBe(e.options.length);
          expect(e.options.length, l.id).toBeGreaterThanOrEqual(3);
        }
        if (e.kind === 'gap') expect(`${e.before}${e.answer}${e.after}`).toBe(e.full);
        if (e.kind === 'match') expect(e.pairs.length, l.id).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('grammar topics are well-formed', () => {
    const ids = GRAMMAR.map((g) => g.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(GRAMMAR.length).toBeGreaterThanOrEqual(25);
    for (const g of GRAMMAR) {
      expect(g.exercises.length, g.id).toBeGreaterThanOrEqual(4);
      for (const e of g.exercises) {
        expect(e.answer, `${g.id}: ${e.q}`).toBeLessThan(e.options.length);
        expect(new Set(e.options).size, `${g.id}: ${e.q}`).toBe(e.options.length);
      }
    }
  });

  it('conversations are well-formed', () => {
    const ids = CONVERSATIONS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(CONVERSATIONS.length).toBeGreaterThanOrEqual(35);
    for (const c of CONVERSATIONS) {
      expect(c.roles[c.you], c.id).toBeDefined();
      const youLines = c.lines.filter(([s]) => s === c.you);
      expect(youLines.length, c.id).toBeGreaterThanOrEqual(2);
      for (const [speaker] of c.lines) expect(c.roles[speaker], `${c.id}: ${speaker}`).toBeDefined();
    }
  });

  it('extras exist', () => {
    expect(DAILY_PHRASES.length).toBeGreaterThanOrEqual(30);
    expect(PHRASEBOOK.length).toBeGreaterThanOrEqual(5);
  });
});
