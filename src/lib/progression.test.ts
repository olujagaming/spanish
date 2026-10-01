import { describe, expect, it } from 'vitest';
import { LEVEL_SOURCES, LESSONS, WORDS } from '../content';
import {
  BUILDINGS,
  DECO_SLOTS,
  DECORATIONS,
  DEX,
  FOUNTAIN,
  available,
  buyDecoration,
  builtBuildings,
  masteryOf,
  placeDecoration,
  rankFromXp,
} from './progression';
import { addXp, completeLesson, initialState, migrate } from './state';
import { newCard } from './srs';

describe('ranks', () => {
  it('maps xp to titles', () => {
    expect(rankFromXp(0).rank.title).toBe('Turista');
    expect(rankFromXp(149).rank.title).toBe('Turista');
    expect(rankFromXp(150).rank.title).toBe('Mochilero');
    expect(rankFromXp(99999).rank.title).toBe('Leyenda');
    expect(rankFromXp(99999).next).toBeUndefined();
    expect(rankFromXp(275).progress).toBeCloseTo(0.5);
  });
});

describe('buildings', () => {
  it('one building per unit, unique tiles that avoid slots and the fountain', () => {
    const units = LEVEL_SOURCES.flatMap((l) => l.units.map((u) => u.id));
    expect(BUILDINGS.map((b) => b.unitId).sort()).toEqual([...units].sort());
    const tiles = [...BUILDINGS, ...DECO_SLOTS, FOUNTAIN].map((t) => `${t.row}-${t.col}`);
    expect(new Set(tiles).size).toBe(tiles.length);
    expect(tiles.length).toBe(25);
  });

  it('a building appears once all lessons of its unit are done', () => {
    let s = initialState();
    const unit = LESSONS.filter((l) => l.unitId === 'a0-u1');
    for (const l of unit.slice(0, -1)) s = completeLesson(s, l.id, 1, []);
    expect(builtBuildings(s)).toHaveLength(0);
    s = completeLesson(s, unit[unit.length - 1].id, 1, []);
    expect(builtBuildings(s).map((b) => b.unitId)).toEqual(['a0-u1']);
  });
});

describe('reales and decorations', () => {
  it('earns reales with xp and cannot overspend', () => {
    let s = addXp(initialState(), 40);
    expect(s.reales).toBe(40);
    const cheap = DECORATIONS[0];
    s = buyDecoration(s, cheap.id);
    expect(s.reales).toBe(40 - cheap.price);
    const before = s;
    s = buyDecoration(s, 'estatua');
    expect(s).toBe(before);
    expect(s.reales).toBeGreaterThanOrEqual(0);
  });

  it('places only owned decorations and can move them', () => {
    let s = addXp(initialState(), 100);
    s = buyDecoration(s, 'maceta');
    s = placeDecoration(s, 's1', 'maceta');
    expect(s.plaza.s1).toBe('maceta');
    expect(available(s, 'maceta')).toBe(0);
    const blocked = placeDecoration(s, 's2', 'maceta');
    expect(blocked.plaza.s2).toBeUndefined();
    s = placeDecoration(s, 's1', 'maceta'); // re-placing the same item is fine
    s = placeDecoration(s, 's1', null);
    expect(available(s, 'maceta')).toBe(1);
  });
});

describe('dex', () => {
  it('numbers every word once', () => {
    expect(DEX).toHaveLength(WORDS.length);
    expect(DEX[0].no).toBe(1);
    expect(new Set(DEX.map((e) => e.word.key)).size).toBe(DEX.length);
  });

  it('derives mastery from srs', () => {
    expect(masteryOf(undefined)).toBe(0);
    expect(masteryOf(newCard())).toBe(1);
    expect(masteryOf({ ...newCard(), reps: 2, interval: 3 })).toBe(2);
    expect(masteryOf({ ...newCard(), reps: 4, interval: 10 })).toBe(3);
    expect(masteryOf({ ...newCard(), reps: 6, interval: 30 })).toBe(4);
  });
});

describe('migration', () => {
  it('gives old saves reales for their xp and the dark theme', () => {
    const old = { xp: 321, settings: { theme: 'auto', name: 'Ana' } };
    const s = migrate(old);
    expect(s.reales).toBe(321);
    expect(s.settings.theme).toBe('dark');
    expect(s.plaza).toEqual({});
    const fresh = migrate({ ...s, reales: 5, settings: { ...s.settings, theme: 'auto' } });
    expect(fresh.reales).toBe(5);
    expect(fresh.settings.theme).toBe('auto');
  });
});
