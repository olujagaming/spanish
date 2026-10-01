/**
 * Content types. Content is authored in a compact tuple format to keep the data files readable;
 * helpers in `content/index.ts` expand it into richer objects.
 */

export type LevelId = 'A0' | 'A1' | 'A2' | 'B1' | 'B2';

/** [spanish, german, note?] – note is shown as a hint (e.g. "LatAm: carro"). */
export type WordTuple = readonly [es: string, de: string, note?: string];

/** [spanish, german] */
export type PhraseTuple = readonly [es: string, de: string];

/** [speaker, spanish, german] */
export type LineTuple = readonly [speaker: string, es: string, de: string];

export interface LessonSource {
  id: string;
  title: string;
  /** Short German description of what you will be able to do afterwards. */
  goal: string;
  emoji: string;
  words: readonly WordTuple[];
  phrases: readonly PhraseTuple[];
  dialogue?: readonly LineTuple[];
  /** Short "good to know" tip in German (culture, pronunciation, usage). */
  tip?: string;
  /** Id of a related grammar topic. */
  grammar?: string;
}

export interface UnitSource {
  id: string;
  title: string;
  lessons: readonly LessonSource[];
}

export interface LevelSource {
  id: LevelId;
  title: string;
  subtitle: string;
  units: readonly UnitSource[];
}

export interface Word {
  /** Stable key, derived from the Spanish text. Used for flashcards. */
  key: string;
  es: string;
  de: string;
  note?: string;
  lessonId: string;
  level: LevelId;
}

export interface Phrase {
  es: string;
  de: string;
}

export interface Lesson extends Omit<LessonSource, 'words' | 'phrases'> {
  level: LevelId;
  unitId: string;
  unitTitle: string;
  index: number;
  words: Word[];
  phrases: Phrase[];
}

export interface ConversationSource {
  id: string;
  level: LevelId;
  title: string;
  emoji: string;
  /** German description of the situation. */
  setting: string;
  /** Speaker labels. The learner plays role `you`. */
  roles: Record<string, string>;
  you: string;
  lines: readonly LineTuple[];
  /** Useful expressions from the conversation. */
  keyPhrases?: readonly PhraseTuple[];
  tip?: string;
}

export interface GrammarExercise {
  /** Sentence with ___ for the gap, or a question. */
  q: string;
  options: readonly string[];
  /** Index into options. */
  answer: number;
  /** German explanation shown after answering. */
  explain?: string;
}

export interface GrammarSection {
  heading: string;
  /** German explanation. Supports **bold** and line breaks. */
  text: string;
  examples?: readonly PhraseTuple[];
  /** Optional table, first row is the header. */
  table?: readonly (readonly string[])[];
}

export interface GrammarTopic {
  id: string;
  level: LevelId;
  title: string;
  emoji: string;
  summary: string;
  sections: readonly GrammarSection[];
  exercises: readonly GrammarExercise[];
}
