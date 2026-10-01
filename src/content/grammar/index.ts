import type { GrammarTopic } from '../types';
import { GRAMMAR_BASIC } from './basic';
import { GRAMMAR_ADVANCED } from './advanced';

const ORDER = ['A0', 'A1', 'A2', 'B1', 'B2'];

export const GRAMMAR: GrammarTopic[] = [...GRAMMAR_BASIC, ...GRAMMAR_ADVANCED].sort(
  (a, b) => ORDER.indexOf(a.level) - ORDER.indexOf(b.level),
);

export function getGrammar(id: string): GrammarTopic | undefined {
  return GRAMMAR.find((g) => g.id === id);
}
