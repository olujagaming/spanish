/**
 * Small Spanish conjugation engine: regular rules + stem changes + a few irregular fields per verb.
 * Covers the tenses a learner needs up to B2.
 */

export type Tense =
  | 'presente'
  | 'indefinido'
  | 'imperfecto'
  | 'perfecto'
  | 'futuro'
  | 'condicional'
  | 'subjuntivo'
  | 'imperativo';

export const TENSES: { id: Tense; label: string; de: string; level: string }[] = [
  { id: 'presente', label: 'Presente', de: 'Gegenwart', level: 'A1' },
  { id: 'perfecto', label: 'Pretérito perfecto', de: 'Perfekt (habe gemacht)', level: 'A2' },
  { id: 'indefinido', label: 'Pretérito indefinido', de: 'Vergangenheit (abgeschlossen)', level: 'A2' },
  { id: 'imperfecto', label: 'Pretérito imperfecto', de: 'Vergangenheit (Gewohnheit, Hintergrund)', level: 'A2' },
  { id: 'futuro', label: 'Futuro simple', de: 'Zukunft', level: 'B1' },
  { id: 'condicional', label: 'Condicional', de: 'Konditional (würde)', level: 'B1' },
  { id: 'imperativo', label: 'Imperativo', de: 'Befehlsform', level: 'B1' },
  { id: 'subjuntivo', label: 'Presente de subjuntivo', de: 'Subjunktiv (Möglichkeit, Wunsch)', level: 'B1' },
];

export const PERSONS = ['yo', 'tú', 'él/ella/usted', 'nosotros', 'vosotros', 'ellos/ustedes'];
export const IMPERATIVE_PERSONS = ['—', 'tú', 'usted', 'nosotros', 'vosotros', 'ustedes'];

type StemChange = 'ie' | 'ue' | 'i' | 'u-ue';

export interface VerbDef {
  inf: string;
  de: string;
  stem?: StemChange;
  /** Irregular yo form in the present (tengo, hago, conozco). Also drives the subjunctive. */
  yo?: string;
  /** Strong preterite stem (tuv, hic, dij). */
  pret?: string;
  /** Irregular future/conditional stem (tendr, har). */
  fut?: string;
  part?: string;
  ger?: string;
  /** Irregular affirmative tú imperative (ten, haz). */
  impTu?: string;
  /** Full overrides per tense (6 forms). */
  over?: Partial<Record<Tense, readonly string[]>>;
  /** Frequency group used for the trainer. */
  level?: 'A1' | 'A2' | 'B1';
}

const ENDINGS = {
  presente: {
    ar: ['o', 'as', 'a', 'amos', 'áis', 'an'],
    er: ['o', 'es', 'e', 'emos', 'éis', 'en'],
    ir: ['o', 'es', 'e', 'imos', 'ís', 'en'],
  },
  indefinido: {
    ar: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'],
    er: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
    ir: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
  },
  imperfecto: {
    ar: ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'],
    er: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    ir: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
  },
  subjuntivo: {
    ar: ['e', 'es', 'e', 'emos', 'éis', 'en'],
    er: ['a', 'as', 'a', 'amos', 'áis', 'an'],
    ir: ['a', 'as', 'a', 'amos', 'áis', 'an'],
  },
} as const;

const FUT = ['é', 'ás', 'á', 'emos', 'éis', 'án'];
const COND = ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'];
const HABER = ['he', 'has', 'ha', 'hemos', 'habéis', 'han'];
const REFL = ['me', 'te', 'se', 'nos', 'os', 'se'];
const STRONG = ['e', 'iste', 'o', 'imos', 'isteis', 'ieron'];

type Group = 'ar' | 'er' | 'ir';

interface Parsed {
  base: string; // infinitive without "se"
  stem: string;
  group: Group;
  reflexive: boolean;
}

function parse(inf: string): Parsed {
  const reflexive = inf.endsWith('se');
  const base = reflexive ? inf.slice(0, -2) : inf;
  const ending = base.slice(-2).replace('í', 'i');
  return { base, stem: base.slice(0, -2), group: ending as Group, reflexive };
}

/** Replace the last occurrence of `from` in stem. */
function replaceLast(stem: string, from: string, to: string): string {
  const i = stem.lastIndexOf(from);
  return i < 0 ? stem : stem.slice(0, i) + to + stem.slice(i + from.length);
}

function changedStem(stem: string, change: StemChange): string {
  switch (change) {
    case 'ie':
      return replaceLast(stem, 'e', 'ie');
    case 'ue':
      return replaceLast(stem, 'o', 'ue');
    case 'i':
      return replaceLast(stem, 'e', 'i');
    case 'u-ue':
      return replaceLast(stem, 'u', 'ue');
  }
}

/** Weak stem change of -ir verbs (e→i, o→u) in some forms. */
function weakIrStem(stem: string, change?: StemChange): string {
  if (!change) return stem;
  if (change === 'ue') return replaceLast(stem, 'o', 'u');
  if (change === 'ie' || change === 'i') return replaceLast(stem, 'e', 'i');
  return stem;
}

const VOWELS = 'aeiouáéíóú';
function endsWithVowel(stem: string): boolean {
  if (stem.endsWith('gu') || stem.endsWith('qu')) return false;
  return VOWELS.includes(stem.slice(-1));
}

/** Spelling changes before e for -ar verbs: c→qu, g→gu, z→c. */
function arBeforeE(stem: string): string {
  if (stem.endsWith('c')) return stem.slice(0, -1) + 'qu';
  if (stem.endsWith('g')) return stem.slice(0, -1) + 'gu';
  if (stem.endsWith('z')) return stem.slice(0, -1) + 'c';
  return stem;
}

/** Spelling changes before o/a for -er/-ir verbs: g→j, gu→g. */
function erirBeforeOA(stem: string): string {
  if (stem.endsWith('gu')) return stem.slice(0, -2) + 'g';
  if (stem.endsWith('g')) return stem.slice(0, -1) + 'j';
  return stem;
}

function presente(v: VerbDef, p: Parsed): string[] {
  const end = ENDINGS.presente[p.group];
  return end.map((e, i) => {
    const boot = i === 0 || i === 1 || i === 2 || i === 5;
    if (i === 0 && v.yo) return v.yo;
    let stem = boot && v.stem ? changedStem(p.stem, v.stem) : p.stem;
    if (i === 0 && p.group !== 'ar') stem = erirBeforeOA(stem);
    if (p.base.endsWith('uir') && !p.base.endsWith('guir') && boot) stem += 'y';
    return stem + e;
  });
}

function subjStem(v: VerbDef, p: Parsed): string {
  if (v.yo && v.yo.endsWith('o')) return v.yo.slice(0, -1);
  const pres = presente(v, p)[0];
  return pres.slice(0, -1);
}

function subjuntivo(v: VerbDef, p: Parsed): string[] {
  const end = ENDINGS.subjuntivo[p.group];
  const yoStem = subjStem(v, p);
  return end.map((e, i) => {
    const nosVos = i === 3 || i === 4;
    let stem = yoStem;
    if (nosVos && v.stem && !v.yo) {
      stem = p.group === 'ir' ? weakIrStem(p.stem, v.stem) : p.stem;
      if (p.group !== 'ar') stem = erirBeforeOA(stem);
    }
    if (p.group === 'ar') stem = arBeforeE(stem);
    return stem + e;
  });
}

function indefinido(v: VerbDef, p: Parsed): string[] {
  if (v.pret) {
    const j = v.pret.endsWith('j');
    return STRONG.map((e, i) => {
      if (i === 5 && j) return v.pret + 'eron';
      if (i === 2 && v.pret!.endsWith('c')) return v.pret!.slice(0, -1) + 'zo';
      return v.pret + e;
    });
  }
  const end = ENDINGS.indefinido[p.group];
  if (p.group !== 'ar' && endsWithVowel(p.stem)) {
    const isUir = p.base.endsWith('uir');
    return [
      p.stem + 'í',
      p.stem + (isUir ? 'iste' : 'íste'),
      p.stem + 'yó',
      p.stem + (isUir ? 'imos' : 'ímos'),
      p.stem + (isUir ? 'isteis' : 'ísteis'),
      p.stem + 'yeron',
    ];
  }
  return end.map((e, i) => {
    let stem = p.stem;
    if (i === 0 && p.group === 'ar') stem = arBeforeE(stem);
    if ((i === 2 || i === 5) && p.group === 'ir') stem = weakIrStem(stem, v.stem);
    return stem + e;
  });
}

function imperfecto(_v: VerbDef, p: Parsed): string[] {
  return ENDINGS.imperfecto[p.group].map((e) => p.stem + e);
}

function futStem(v: VerbDef, p: Parsed): string {
  return v.fut ?? p.base.replace('í', 'i');
}

export function participle(v: VerbDef): string {
  if (v.part) return v.part;
  const p = parse(v.inf);
  if (p.group === 'ar') return p.stem + 'ado';
  if (endsWithVowel(p.stem) && !p.base.endsWith('uir')) return p.stem + 'ído';
  return p.stem + 'ido';
}

export function gerund(v: VerbDef): string {
  if (v.ger) return v.ger;
  const p = parse(v.inf);
  if (p.group === 'ar') return p.stem + 'ando';
  if (endsWithVowel(p.stem)) return p.stem + 'yendo';
  const stem = p.group === 'ir' ? weakIrStem(p.stem, v.stem) : p.stem;
  return stem + 'iendo';
}

function imperativo(v: VerbDef, p: Parsed): string[] {
  if (p.reflexive) return [];
  const pres = presente(v, p);
  const subj = subjuntivo(v, p);
  const tu = v.impTu ?? pres[2];
  const vos = p.base.replace(/r$/, 'd');
  return ['—', tu, subj[2], subj[3], vos, subj[5]];
}

function raw(v: VerbDef, tense: Tense): string[] {
  const over = v.over?.[tense];
  if (over) return [...over];
  const p = parse(v.inf);
  switch (tense) {
    case 'presente':
      return presente(v, p);
    case 'subjuntivo':
      return subjuntivo(v, p);
    case 'indefinido':
      return indefinido(v, p);
    case 'imperfecto':
      return imperfecto(v, p);
    case 'futuro':
      return FUT.map((e) => futStem(v, p) + e);
    case 'condicional':
      return COND.map((e) => futStem(v, p) + e);
    case 'perfecto':
      return HABER.map((h) => `${h} ${participle(v)}`);
    case 'imperativo':
      return imperativo(v, p);
  }
}

/** Returns six forms (yo … ellos). Reflexive verbs include the pronoun. */
export function conjugate(v: VerbDef, tense: Tense): string[] {
  const forms = raw(v, tense);
  const p = parse(v.inf);
  if (!p.reflexive || tense === 'imperativo') return forms;
  return forms.map((f, i) => `${REFL[i]} ${f}`);
}
