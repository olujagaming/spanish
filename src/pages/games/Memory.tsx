import { useMemo, useState } from 'react';
import { getState } from '../../lib/store';
import { learnedWords } from '../../lib/selectors';
import { sample, shuffle } from '../../lib/exercises';
import { speak } from '../../lib/speech';
import { playSound } from '../../lib/sound';
import { GameHeader, GameOver } from './shared';

interface MCard {
  id: number;
  pair: number;
  text: string;
  es: boolean;
}

export default function Memory({ onRestart }: { onRestart: () => void }) {
  const cards = useMemo<MCard[]>(() => {
    const seen = new Set<string>();
    const words = sample(learnedWords(getState()), 30)
      .filter((w) => w.es.length <= 22 && w.de.length <= 28 && !seen.has(w.de) && seen.add(w.de))
      .slice(0, 8);
    return shuffle(
      words.flatMap((w, i) => [
        { id: i * 2, pair: i, text: w.es, es: true },
        { id: i * 2 + 1, pair: i, text: w.de, es: false },
      ]),
    );
  }, []);
  const [open, setOpen] = useState<number[]>([]);
  const [found, setFound] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const pairs = cards.length / 2;

  if (found.length === pairs) {
    // Fewer moves = more points.
    const score = Math.max(1, pairs * 3 - (moves - pairs));
    return <GameOver id="memory" score={score} onRestart={onRestart} />;
  }

  const flip = (c: MCard) => {
    if (open.length === 2 || open.includes(c.id) || found.includes(c.pair)) return;
    if (c.es) speak(c.text);
    const next = [...open, c.id];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((id) => cards.find((x) => x.id === id)!);
      if (a.pair === b.pair) {
        playSound('good');
        setTimeout(() => {
          setFound((f) => [...f, a.pair]);
          setOpen([]);
        }, 400);
      } else {
        setTimeout(() => setOpen([]), 1000);
      }
    }
  };

  return (
    <div>
      <GameHeader title="Memoria">
        <span className="stat-pill">Züge: {moves}</span>
      </GameHeader>
      <div className="memory-grid">
        {cards.map((c) => {
          const isOpen = open.includes(c.id);
          const done = found.includes(c.pair);
          return (
            <button key={c.id} type="button" className={`memory-card ${isOpen ? 'open' : ''} ${done ? 'done' : ''}`} onClick={() => flip(c)}>
              {isOpen || done ? c.text : c.es ? '🇪🇸' : '🇩🇪'}
            </button>
          );
        })}
      </div>
      <p className="small muted center" style={{ marginTop: 12 }}>
        🇪🇸 = spanisches Wort, 🇩🇪 = deutsche Bedeutung
      </p>
    </div>
  );
}
