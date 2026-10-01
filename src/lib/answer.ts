/** Helpers for comparing typed answers tolerantly. */

const PUNCT = /[¿?¡!.,;:"“”«»()…\-–—]/g;

/** Lowercase, trim, collapse whitespace and drop punctuation (keeps accents). */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(PUNCT, ' ')
    .replace(/[’']/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Like normalize, but also strips accents and ñ → n. */
export function fold(text: string): string {
  return normalize(text)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export type AnswerResult = 'correct' | 'accent' | 'typo' | 'wrong';

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[b.length];
}

/** Strip a leading article for vocabulary answers ("el café" ≈ "café") */
function stripArticle(text: string): string {
  return text.replace(/^(el|la|los|las|un|una|der|die|das|ein|eine)\s+/, '');
}

/**
 * Alternatives are separated by "/" in the expected answer, e.g. "hallo / hi".
 * Returns how close the given answer is.
 */
export function checkAnswer(given: string, expected: string): AnswerResult {
  const options = expected
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean);
  // Also accept the text without bracketed parts: "(ich) bin" ≈ "bin"
  const variants = new Set<string>();
  for (const o of options) {
    variants.add(o);
    variants.add(o.replace(/\([^)]*\)/g, '').trim());
    variants.add(o.replace(/[()]/g, ''));
  }
  const g = normalize(given);
  if (!g) return 'wrong';
  let best: AnswerResult = 'wrong';
  for (const v of variants) {
    const n = normalize(v);
    if (!n) continue;
    if (g === n || stripArticle(g) === stripArticle(n)) return 'correct';
    if (fold(given) === fold(v) || stripArticle(fold(given)) === stripArticle(fold(v))) {
      best = 'accent';
      continue;
    }
    const f1 = stripArticle(fold(given));
    const f2 = stripArticle(fold(v));
    const allowed = f2.length <= 4 ? 0 : f2.length <= 10 ? 1 : 2;
    if (best === 'wrong' && levenshtein(f1, f2) <= allowed) best = 'typo';
  }
  return best;
}

export function isAccepted(result: AnswerResult): boolean {
  return result !== 'wrong';
}

/** Split a sentence into word tokens for the sentence builder. */
export function tokenize(sentence: string): string[] {
  return sentence
    .replace(/[¿?¡!.,;:…]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Stable key for a Spanish word/phrase. */
export function keyOf(es: string): string {
  return fold(es).replace(/\s+/g, '-');
}
