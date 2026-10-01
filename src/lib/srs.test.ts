import { describe, expect, it } from 'vitest';
import { isDue, newCard, review } from './srs';

const DAY = 86400000;

describe('srs', () => {
  it('schedules growing intervals for good answers', () => {
    const now = new Date(2026, 0, 1, 10).getTime();
    let c = newCard(now);
    c = review(c, 2, now);
    expect(c.interval).toBe(1);
    c = review(c, 2, now + DAY);
    expect(c.interval).toBe(3);
    c = review(c, 2, now + 4 * DAY);
    expect(c.interval).toBeGreaterThanOrEqual(7);
  });

  it('resets on again', () => {
    const now = Date.now();
    let c = review(review(newCard(now), 2, now), 2, now + DAY);
    c = review(c, 0, now + 4 * DAY);
    expect(c.interval).toBe(0);
    expect(c.lapses).toBe(1);
    expect(isDue(c, now + 4 * DAY)).toBe(true);
  });

  it('new cards are due', () => {
    expect(isDue(newCard())).toBe(true);
  });
});
