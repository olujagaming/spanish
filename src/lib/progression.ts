/**
 * The game layer: regions (levels), ranks (XP titles), the plaza with buildings and decorations,
 * and the word collection ("Dex").
 */

import { LESSONS, LEVEL_SOURCES, WORDS } from '../content';
import type { LevelId, Word } from '../content/types';
import type { AppState } from './state';
import { isMastered, type SrsCard } from './srs';

/* ---------------- Regions ---------------- */

export interface RegionInfo {
  level: LevelId;
  name: string;
  place: string;
  /** German one-liner. */
  tagline: string;
  color: string;
  /** Second gradient color for headers. */
  color2: string;
}

export const REGIONS: Record<LevelId, RegionInfo> = {
  A0: { level: 'A0', name: 'La llegada', place: 'Madrid', tagline: 'Du kommst an – erste Worte am Flughafen und in der Bar', color: '#e8b65a', color2: '#b5793a' },
  A1: { level: 'A1', name: 'Calles de azahar', place: 'Andalucía', tagline: 'Alltag zwischen Plazas, Märkten und Orangenbäumen', color: '#e2725b', color2: '#a2443a' },
  A2: { level: 'A2', name: 'Ciudad de colores', place: 'Ciudad de México', tagline: 'Erzählen, planen und reisen in der Megastadt', color: '#4fb39a', color2: '#24705f' },
  B1: { level: 'B1', name: 'Noches de tango', place: 'Buenos Aires', tagline: 'Meinungen, Gefühle und echte Gespräche', color: '#7d8cff', color2: '#4651b8' },
  B2: { level: 'B2', name: 'Entre montañas y mar', place: 'Bogotá & Cartagena', tagline: 'Nuancen, Redewendungen, Debatten – wie ein Local', color: '#c58cff', color2: '#7b45b5' },
};

/* ---------------- Ranks ---------------- */

export interface Rank {
  index: number;
  title: string;
  de: string;
  min: number;
}

export const RANKS: Rank[] = [
  { index: 0, title: 'Turista', de: 'Tourist', min: 0 },
  { index: 1, title: 'Mochilero', de: 'Rucksackreisender', min: 150 },
  { index: 2, title: 'Viajero', de: 'Reisender', min: 400 },
  { index: 3, title: 'Explorador', de: 'Entdecker', min: 900 },
  { index: 4, title: 'Vecino', de: 'Nachbar', min: 1800 },
  { index: 5, title: 'Local', de: 'Einheimischer', min: 3500 },
  { index: 6, title: 'Maestro', de: 'Meister', min: 6000 },
  { index: 7, title: 'Leyenda', de: 'Legende', min: 10000 },
];

export function rankFromXp(xp: number): { rank: Rank; next?: Rank; progress: number } {
  let rank = RANKS[0];
  for (const r of RANKS) if (xp >= r.min) rank = r;
  const next = RANKS[rank.index + 1];
  const progress = next ? (xp - rank.min) / (next.min - rank.min) : 1;
  return { rank, next, progress };
}

/* ---------------- Plaza: buildings ---------------- */

export type Roof = 'flat' | 'pyramid' | 'dome' | 'tower';

export interface Building {
  unitId: string;
  name: string;
  de: string;
  /** Route opened when tapping the building. */
  to: string;
  /** Wall color (right face); left face and roof are derived. */
  color: string;
  roof: Roof;
  roofColor: string;
  height: number;
  /** Grid position on the 5×5 plaza. */
  row: number;
  col: number;
}

export const BUILDINGS: Building[] = [
  { unitId: 'a0-u1', name: 'Tu casa', de: 'Dein Zuhause', to: '/logros', color: '#e9dcc4', roof: 'pyramid', roofColor: '#c45c3e', height: 26, row: 0, col: 0 },
  { unitId: 'a0-u2', name: 'Quiosco', de: 'Kiosk', to: '/arena', color: '#d9c6a3', roof: 'flat', roofColor: '#3f6e8c', height: 18, row: 0, col: 1 },
  { unitId: 'a0-u3', name: 'Café', de: 'Café', to: '/tertulias', color: '#efe3cf', roof: 'flat', roofColor: '#8c3b2e', height: 22, row: 0, col: 2 },
  { unitId: 'a1-u1', name: 'Ayuntamiento', de: 'Rathaus', to: '/estadistica', color: '#e6d3b0', roof: 'tower', roofColor: '#9a6b2f', height: 34, row: 0, col: 3 },
  { unitId: 'a1-u2', name: 'Mercado', de: 'Markthalle', to: '/dex', color: '#dfc79d', roof: 'pyramid', roofColor: '#4f7f5a', height: 24, row: 0, col: 4 },
  { unitId: 'a1-u3', name: 'Panadería', de: 'Bäckerei', to: '/repasar', color: '#f1e1c2', roof: 'pyramid', roofColor: '#b0543c', height: 20, row: 1, col: 4 },
  { unitId: 'a1-u4', name: 'Estación', de: 'Bahnhof', to: '/mapa', color: '#d4c4a8', roof: 'dome', roofColor: '#5d7f8f', height: 24, row: 2, col: 4 },
  { unitId: 'a2-u1', name: 'Biblioteca', de: 'Bibliothek', to: '/codice', color: '#e1cfae', roof: 'dome', roofColor: '#7a5f9c', height: 30, row: 3, col: 4 },
  { unitId: 'a2-u2', name: 'Hotel', de: 'Hotel', to: '/frases', color: '#f0d9c9', roof: 'flat', roofColor: '#3d7c74', height: 38, row: 4, col: 4 },
  { unitId: 'a2-u3', name: 'Teatro', de: 'Theater', to: '/tertulias', color: '#e8c9b5', roof: 'dome', roofColor: '#a43d4a', height: 28, row: 4, col: 3 },
  { unitId: 'a2-u4', name: 'Invernadero', de: 'Gewächshaus', to: '/cultura', color: '#cfe0d0', roof: 'pyramid', roofColor: '#4f8a63', height: 20, row: 4, col: 2 },
  { unitId: 'b1-u1', name: 'Universidad', de: 'Universität', to: '/codice', color: '#e4d6bf', roof: 'tower', roofColor: '#7c4d33', height: 32, row: 4, col: 1 },
  { unitId: 'b1-u2', name: 'Correos', de: 'Post', to: '/verbos', color: '#f2e2a8', roof: 'flat', roofColor: '#b58a2a', height: 22, row: 4, col: 0 },
  { unitId: 'b1-u3', name: 'Farmacia', de: 'Apotheke', to: '/falsos-amigos', color: '#dce8e1', roof: 'flat', roofColor: '#3f8b5c', height: 22, row: 3, col: 0 },
  { unitId: 'b2-u1', name: 'Torre del reloj', de: 'Uhrturm', to: '/estadistica', color: '#d7c3a0', roof: 'tower', roofColor: '#5b4a8a', height: 46, row: 2, col: 0 },
  { unitId: 'b2-u2', name: 'Faro', de: 'Leuchtturm', to: '/logros', color: '#f3eee6', roof: 'tower', roofColor: '#b8403a', height: 52, row: 1, col: 0 },
];

export function isUnitComplete(s: AppState, unitId: string): boolean {
  const lessons = LESSONS.filter((l) => l.unitId === unitId);
  return lessons.length > 0 && lessons.every((l) => s.lessons[l.id]);
}

export function unitProgress(s: AppState, unitId: string): { done: number; total: number } {
  const lessons = LESSONS.filter((l) => l.unitId === unitId);
  return { done: lessons.filter((l) => s.lessons[l.id]).length, total: lessons.length };
}

export function builtBuildings(s: AppState): Building[] {
  return BUILDINGS.filter((b) => isUnitComplete(s, b.unitId));
}

export function unitTitle(unitId: string): string {
  for (const level of LEVEL_SOURCES) for (const u of level.units) if (u.id === unitId) return u.title;
  return unitId;
}

/* ---------------- Plaza: decorations ---------------- */

export type DecoShape =
  | 'farola'
  | 'naranjo'
  | 'palmera'
  | 'cactus'
  | 'banco'
  | 'maceta'
  | 'banderines'
  | 'sombrilla'
  | 'estatua'
  | 'gato'
  | 'cipres'
  | 'carreta';

export interface Decoration {
  id: DecoShape;
  name: string;
  de: string;
  price: number;
}

export const DECORATIONS: Decoration[] = [
  { id: 'maceta', name: 'Maceta', de: 'Blumentopf', price: 30 },
  { id: 'banco', name: 'Banco', de: 'Parkbank', price: 50 },
  { id: 'farola', name: 'Farola', de: 'Laterne', price: 60 },
  { id: 'gato', name: 'Gato callejero', de: 'Straßenkatze', price: 80 },
  { id: 'naranjo', name: 'Naranjo', de: 'Orangenbaum', price: 120 },
  { id: 'cactus', name: 'Cactus', de: 'Kaktus', price: 120 },
  { id: 'cipres', name: 'Ciprés', de: 'Zypresse', price: 150 },
  { id: 'sombrilla', name: 'Terraza', de: 'Café-Tisch mit Schirm', price: 180 },
  { id: 'palmera', name: 'Palmera', de: 'Palme', price: 220 },
  { id: 'banderines', name: 'Banderines', de: 'Fähnchengirlande', price: 260 },
  { id: 'carreta', name: 'Carreta de flores', de: 'Blumenkarren', price: 320 },
  { id: 'estatua', name: 'Estatua', de: 'Statue', price: 500 },
];

export interface Slot {
  id: string;
  row: number;
  col: number;
}

/** Free tiles of the 5×5 grid (center is the fountain). */
export const DECO_SLOTS: Slot[] = [
  { id: 's1', row: 1, col: 1 },
  { id: 's2', row: 1, col: 2 },
  { id: 's3', row: 1, col: 3 },
  { id: 's4', row: 2, col: 3 },
  { id: 's5', row: 3, col: 3 },
  { id: 's6', row: 3, col: 2 },
  { id: 's7', row: 3, col: 1 },
  { id: 's8', row: 2, col: 1 },
];

export const FOUNTAIN = { row: 2, col: 2 };

export function decoById(id: string): Decoration | undefined {
  return DECORATIONS.find((d) => d.id === id);
}

export function buyDecoration(s: AppState, id: string): AppState {
  const deco = decoById(id);
  if (!deco || s.reales < deco.price) return s;
  return {
    ...s,
    reales: s.reales - deco.price,
    inventory: { ...s.inventory, [id]: (s.inventory[id] ?? 0) + 1 },
  };
}

/** How many of a decoration are still unplaced. */
export function available(s: AppState, id: string): number {
  const placed = Object.values(s.plaza).filter((d) => d === id).length;
  return (s.inventory[id] ?? 0) - placed;
}

export function placeDecoration(s: AppState, slotId: string, decoId: string | null): AppState {
  if (!DECO_SLOTS.some((x) => x.id === slotId)) return s;
  const plaza = { ...s.plaza };
  if (decoId === null) {
    delete plaza[slotId];
    return { ...s, plaza };
  }
  // Moving the existing item out of this slot frees it first.
  const without = { ...s, plaza: Object.fromEntries(Object.entries(plaza).filter(([k]) => k !== slotId)) };
  if (available(without, decoId) <= 0) return s;
  plaza[slotId] = decoId;
  return { ...s, plaza };
}

/* ---------------- Dex ---------------- */

export type Rarity = 'comun' | 'corriente' | 'rara' | 'epica' | 'legendaria';

export const RARITY: Record<LevelId, { id: Rarity; label: string; color: string }> = {
  A0: { id: 'comun', label: 'Común', color: '#a9b0c4' },
  A1: { id: 'corriente', label: 'Corriente', color: '#7fc8a9' },
  A2: { id: 'rara', label: 'Rara', color: '#6fa8ff' },
  B1: { id: 'epica', label: 'Épica', color: '#c58cff' },
  B2: { id: 'legendaria', label: 'Legendaria', color: '#e8b65a' },
};

export const MASTERY = ['Oculto', 'Nuevo', 'Aprendiendo', 'Sólido', 'Dominado'] as const;
export const MASTERY_DE = ['Noch nicht entdeckt', 'Neu', 'Im Lernen', 'Sitzt gut', 'Gemeistert'] as const;

/** 0 = undiscovered … 4 = mastered. */
export function masteryOf(card: SrsCard | undefined): number {
  if (!card) return 0;
  if (isMastered(card)) return 4;
  if (card.interval >= 7) return 3;
  if (card.reps > 0) return 2;
  return 1;
}

export interface DexEntry {
  no: number;
  word: Word;
}

export const DEX: DexEntry[] = WORDS.map((word, i) => ({ no: i + 1, word }));

export function dexNumber(no: number): string {
  return '#' + String(no).padStart(3, '0');
}

export function dexStats(s: AppState) {
  let found = 0;
  let mastered = 0;
  for (const e of DEX) {
    const m = masteryOf(s.cards[e.word.key]);
    if (m > 0) found++;
    if (m === 4) mastered++;
  }
  return { found, mastered, total: DEX.length };
}

/** Example sentences from lessons that contain the word (without article). */
export function examplesFor(word: Word, max = 3): { es: string; de: string }[] {
  const core = word.es
    .replace(/^(el|la|los|las|un|una)\s+/i, '')
    .replace(/[¿?¡!]/g, '')
    .toLowerCase()
    .trim();
  if (core.length < 2) return [];
  const out: { es: string; de: string }[] = [];
  for (const l of LESSONS) {
    for (const p of l.phrases) {
      if (p.es.toLowerCase().includes(core)) out.push(p);
      if (out.length >= max) return out;
    }
  }
  return out;
}
