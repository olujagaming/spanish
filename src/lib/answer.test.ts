import { describe, expect, it } from 'vitest';
import { checkAnswer, fold, normalize } from './answer';

describe('answer checking', () => {
  it('normalizes punctuation and case', () => {
    expect(normalize('¿Cómo estás?')).toBe('cómo estás');
    expect(fold('¿Cómo estás?')).toBe('como estas');
  });

  it('accepts exact answers and alternatives', () => {
    expect(checkAnswer('hola', 'hola')).toBe('correct');
    expect(checkAnswer('¡Hola!', 'hola')).toBe('correct');
    expect(checkAnswer('tschüss', 'tschüss / auf Wiedersehen')).toBe('correct');
    expect(checkAnswer('auf wiedersehen', 'tschüss / auf Wiedersehen')).toBe('correct');
  });

  it('accepts missing articles', () => {
    expect(checkAnswer('café', 'el café')).toBe('correct');
  });

  it('flags missing accents and typos', () => {
    expect(checkAnswer('como estas', '¿cómo estás?')).toBe('accent');
    expect(checkAnswer('manzanna', 'la manzana')).toBe('typo');
    expect(checkAnswer('perro', 'el gato')).toBe('wrong');
    expect(checkAnswer('', 'hola')).toBe('wrong');
  });

  it('ignores bracketed parts', () => {
    expect(checkAnswer('müde', 'müde (m)')).toBe('correct');
  });
});
