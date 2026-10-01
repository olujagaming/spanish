/**
 * Spaced repetition based on the SM-2 algorithm (as used by Anki), simplified.
 * Ratings: 0 = again, 1 = hard, 2 = good, 3 = easy.
 */

export type Rating = 0 | 1 | 2 | 3;

export interface SrsCard {
  /** Interval in days. 0 = in learning (due again today). */
  interval: number;
  ease: number;
  reps: number;
  lapses: number;
  /** Due date as epoch ms. */
  due: number;
  /** Last review epoch ms. */
  last?: number;
}

const DAY = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;

export function newCard(now = Date.now()): SrsCard {
  return { interval: 0, ease: 2.5, reps: 0, lapses: 0, due: now };
}

/** Start of the local day for the given timestamp. */
export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function review(card: SrsCard, rating: Rating, now = Date.now()): SrsCard {
  let { interval, ease, reps, lapses } = card;
  let due: number;

  if (rating === 0) {
    lapses += card.reps > 0 ? 1 : 0;
    reps = 0;
    interval = 0;
    ease = Math.max(MIN_EASE, ease - 0.2);
    due = now + 60 * 1000; // see it again in this session
  } else {
    if (reps === 0) {
      interval = rating === 1 ? 0 : rating === 2 ? 1 : 3;
    } else if (reps === 1 && interval <= 1) {
      interval = rating === 1 ? 1 : rating === 2 ? 3 : 6;
    } else {
      const factor = rating === 1 ? 1.2 : rating === 2 ? ease : ease * 1.3;
      interval = Math.max(interval + 1, Math.round(interval * factor));
    }
    if (rating === 1) ease = Math.max(MIN_EASE, ease - 0.15);
    if (rating === 3) ease += 0.15;
    reps += 1;
    due = interval === 0 ? now + 5 * 60 * 1000 : startOfDay(now) + interval * DAY;
  }

  return { interval, ease, reps, lapses, due, last: now };
}

export function isDue(card: SrsCard, now = Date.now()): boolean {
  // A card is due if its due time is before the end of today.
  return card.due <= startOfDay(now) + DAY - 1;
}

/** Cards with an interval of 21+ days count as "mastered". */
export function isMastered(card: SrsCard): boolean {
  return card.interval >= 21;
}

/** Human readable label for the next interval a rating would produce. */
export function previewLabel(card: SrsCard, rating: Rating, now = Date.now()): string {
  const next = review(card, rating, now);
  if (next.interval === 0) return rating === 0 ? '1 Min' : '5 Min';
  if (next.interval === 1) return '1 Tag';
  if (next.interval < 30) return `${next.interval} Tage`;
  if (next.interval < 365) return `${Math.round(next.interval / 30)} Mon.`;
  return `${(next.interval / 365).toFixed(1)} J.`;
}
