import { useMemo, useState } from 'react';
import { getState } from '../../lib/store';
import { LESSONS } from '../../content';
import { shuffle } from '../../lib/exercises';
import { fold, tokenize } from '../../lib/answer';
import { speak } from '../../lib/speech';
import { playSound } from '../../lib/sound';
import { GameHeader, GameOver } from './shared';

const ROUNDS = 8;

export default function Satzbau({ onRestart }: { onRestart: () => void }) {
  const phrases = useMemo(() => {
    const s = getState();
    const done = LESSONS.filter((l) => s.lessons[l.id]);
    const src = done.length >= 2 ? done : LESSONS.filter((l) => l.level === 'A0');
    return shuffle(src.flatMap((l) => l.phrases).filter((p) => tokenize(p.es).length >= 3 && tokenize(p.es).length <= 9)).slice(0, ROUNDS);
  }, []);
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [state, setStateLocal] = useState<'play' | 'good' | 'bad'>('play');
  const p = phrases[round];
  const tokens = useMemo(() => (p ? shuffle(tokenize(p.es)) : []), [p]);

  if (!p) return <GameOver id="satzbau" score={score} unit={`/ ${phrases.length} Sätze`} onRestart={onRestart} />;

  const check = () => {
    const ok = fold(picked.map((i) => tokens[i]).join(' ')) === fold(tokenize(p.es).join(' '));
    setStateLocal(ok ? 'good' : 'bad');
    playSound(ok ? 'good' : 'bad');
    speak(p.es);
    if (ok) setScore((s) => s + 1);
  };

  const next = () => {
    setRound((r) => r + 1);
    setPicked([]);
    setStateLocal('play');
  };

  return (
    <div>
      <GameHeader title="Constructor">
        <span className="stat-pill">
          {round + 1}/{phrases.length}
        </span>
        <span className="stat-pill">{score} pts</span>
      </GameHeader>
      <div className="prompt-big" style={{ fontSize: '1.2rem' }}>
        {p.de}
      </div>
      <div className="token-area">
        {picked.map((i) => (
          <button key={i} type="button" className="token" disabled={state !== 'play'} onClick={() => setPicked(picked.filter((x) => x !== i))}>
            {tokens[i]}
          </button>
        ))}
      </div>
      <div className="token-bank" style={{ marginBottom: 20 }}>
        {tokens.map((t, i) => (
          <button key={i} type="button" className={`token ${picked.includes(i) ? 'used' : ''}`} disabled={state !== 'play'} onClick={() => setPicked([...picked, i])}>
            {t}
          </button>
        ))}
      </div>
      {state === 'play' ? (
        <button type="button" className="btn block" disabled={picked.length !== tokens.length} onClick={check}>
          Überprüfen
        </button>
      ) : (
        <div className={`card ${state === 'good' ? '' : 'shake'}`} style={{ background: state === 'good' ? 'var(--good-soft)' : 'var(--bad-soft)' }}>
          <strong>{state === 'good' ? '¡Perfecto!' : 'Richtig wäre:'}</strong>
          <div className="es">{p.es}</div>
          <button type="button" className="btn block" style={{ marginTop: 10 }} onClick={next}>
            Weiter
          </button>
        </div>
      )}
    </div>
  );
}
