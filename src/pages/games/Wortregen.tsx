import { useEffect, useMemo, useRef, useState } from 'react';
import { getState } from '../../lib/store';
import { learnedWords } from '../../lib/selectors';
import { shuffle } from '../../lib/exercises';
import { checkAnswer, isAccepted } from '../../lib/answer';
import { playSound } from '../../lib/sound';
import { speak } from '../../lib/speech';
import { GameHeader, GameOver } from './shared';
import type { Word } from '../../content/types';

interface Drop {
  id: number;
  word: Word;
  x: number;
  y: number;
}

/** Spanish words fall down; type the German meaning before they land. */
export default function Wortregen({ onRestart }: { onRestart: () => void }) {
  const words = useMemo(
    () => shuffle(learnedWords(getState()).filter((w) => w.es.length <= 18 && w.de.length <= 30)),
    [],
  );
  const [drops, setDrops] = useState<Drop[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [value, setValue] = useState('');
  const [missed, setMissed] = useState<Word | null>(null);
  const nextId = useRef(0);
  // The ref is the source of truth for the animation loop; state mirrors it for rendering.
  const dropsRef = useRef<Drop[]>([]);
  const speed = 0.06 + score * 0.004; // % of height per frame tick
  const over = lives <= 0;

  // Spawn
  useEffect(() => {
    if (over) return;
    const spawn = () => {
      const w = words[nextId.current % words.length];
      dropsRef.current = [...dropsRef.current, { id: nextId.current++, word: w, x: 15 + Math.random() * 70, y: 0 }];
      setDrops(dropsRef.current);
    };
    spawn();
    const t = setInterval(spawn, Math.max(1600, 3600 - score * 120));
    return () => clearInterval(t);
  }, [over, score, words]);

  // Fall
  useEffect(() => {
    if (over) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 16.7;
      last = now;
      const moved = dropsRef.current.map((x) => ({ ...x, y: x.y + speed * dt }));
      const landed = moved.filter((x) => x.y >= 92);
      if (landed.length) {
        setLives((l) => l - landed.length);
        setMissed(landed[0].word);
        playSound('bad');
      }
      const rest = moved.filter((x) => x.y < 92);
      dropsRef.current = rest;
      setDrops(rest);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [over, speed]);

  if (over) return <GameOver id="wortregen" score={score} unit="Wörter" onRestart={onRestart} />;

  const submit = () => {
    const hit = drops.find((d) => isAccepted(checkAnswer(value, d.word.de)) || isAccepted(checkAnswer(value, d.word.es)));
    if (hit) {
      playSound('good');
      speak(hit.word.es);
      dropsRef.current = dropsRef.current.filter((x) => x.id !== hit.id);
      setDrops(dropsRef.current);
      setScore((s) => s + 1);
      setValue('');
    } else {
      playSound('bad');
    }
  };

  return (
    <div>
      <GameHeader title="Lluvia de palabras">
        <span className="stat-pill hearts">{'❤️'.repeat(Math.max(0, lives))}</span>
        <span className="stat-pill">{score} pts</span>
      </GameHeader>
      <div className="rain-field">
        {drops.map((d) => (
          <div key={d.id} className="rain-drop" style={{ left: `${d.x}%`, top: `${d.y}%` }}>
            {d.word.es}
          </div>
        ))}
      </div>
      {missed && (
        <p className="small center muted">
          Verpasst: <strong>{missed.es}</strong> = {missed.de}
        </p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) submit();
        }}
      >
        <div className="row">
          <input
            className="input"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Deutsche Bedeutung …"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button type="submit" className="btn">
            ↵
          </button>
        </div>
      </form>
    </div>
  );
}
