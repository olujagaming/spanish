import { useMemo, useState } from 'react';
import { getState } from '../../lib/store';
import { learnedWords } from '../../lib/selectors';
import { choiceDeEs, choiceEsDe, shuffle, type Exercise } from '../../lib/exercises';
import { playSound } from '../../lib/sound';
import { GameHeader, GameOver, useCountdown } from './shared';

export default function Blitz({ onRestart }: { onRestart: () => void }) {
  const words = useMemo(() => shuffle(learnedWords(getState())), []);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null);
  const [left] = useCountdown(60, !over, () => setOver(true));

  const ex = useMemo(() => {
    const w = words[i % words.length];
    return (i % 2 ? choiceDeEs(w, words) : choiceEsDe(w, words)) as Extract<Exercise, { kind: 'choice' }>;
  }, [i, words]);

  if (over) return <GameOver id="blitz" score={score} onRestart={onRestart} />;

  const pick = (o: string) => {
    const ok = o === ex.answer;
    playSound(ok ? 'good' : 'bad');
    setFlash(ok ? 'good' : 'bad');
    setTimeout(() => setFlash(null), 250);
    setScore((s) => Math.max(0, s + (ok ? 1 : -1)));
    setI((x) => x + 1);
  };

  return (
    <div>
      <GameHeader title="⚡ Blitz-Quiz">
        <span className="stat-pill timer">⏱ {left}s</span>
        <span className="stat-pill">⭐ {score}</span>
      </GameHeader>
      <div className={`card center ${flash === 'bad' ? 'shake' : ''}`} style={{ background: flash === 'good' ? 'var(--good-soft)' : flash === 'bad' ? 'var(--bad-soft)' : undefined }}>
        <div className="small muted">{ex.dir === 'es-de' ? 'Was bedeutet …' : 'Auf Spanisch:'}</div>
        <div style={{ fontSize: '1.7rem', fontWeight: 900 }}>{ex.prompt}</div>
      </div>
      <div className="options">
        {ex.options.map((o) => (
          <button key={o} type="button" className="option" onClick={() => pick(o)}>
            {o}
          </button>
        ))}
      </div>
      <p className="small muted center" style={{ marginTop: 10 }}>
        +1 für richtig, −1 für falsch
      </p>
    </div>
  );
}
