import { useEffect, useMemo, useRef, useState } from 'react';
import { getState } from '../../lib/store';
import { learnedWords } from '../../lib/selectors';
import { shuffle } from '../../lib/exercises';
import { checkAnswer, isAccepted } from '../../lib/answer';
import { speak } from '../../lib/speech';
import { playSound } from '../../lib/sound';
import { SpeakButton } from '../../components/ui';
import { AccentKeys } from '../../components/exercises/ExerciseView';
import { GameHeader, GameOver } from './shared';

const ROUNDS = 10;

export default function Hoeren({ onRestart }: { onRestart: () => void }) {
  const words = useMemo(() => shuffle(learnedWords(getState()).filter((w) => w.es.split(' ').length <= 3)).slice(0, ROUNDS), []);
  const [round, setRound] = useState(0);
  const [value, setValue] = useState('');
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<'good' | 'bad' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const w = words[round];

  useEffect(() => {
    if (!w) return;
    const t = setTimeout(() => speak(w.es), 300);
    inputRef.current?.focus();
    return () => clearTimeout(t);
  }, [w]);

  if (!w) return <GameOver id="hoeren" score={score} unit={`/ ${words.length}`} onRestart={onRestart} />;

  const check = () => {
    const r = checkAnswer(value, w.es);
    const ok = isAccepted(r);
    setResult(ok ? 'good' : 'bad');
    playSound(ok ? 'good' : 'bad');
    if (ok) setScore((s) => s + 1);
  };

  const next = () => {
    setRound((r) => r + 1);
    setValue('');
    setResult(null);
  };

  return (
    <div>
      <GameHeader title="Oído fino">
        <span className="stat-pill">
          {round + 1}/{words.length}
        </span>
        <span className="stat-pill">{score} pts</span>
      </GameHeader>
      <p className="center muted">Hör zu und schreib das spanische Wort.</p>
      <div className="row" style={{ justifyContent: 'center', marginBottom: 20 }}>
        <SpeakButton text={w.es} size="lg" />
        <SpeakButton text={w.es} slow />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (result) next();
          else if (value.trim()) check();
        }}
      >
        <input
          ref={inputRef}
          className="input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!!result}
          lang="es"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Was hörst du?"
        />
        {!result && <AccentKeys onKey={(k) => setValue((v) => v + k)} />}
        {result && (
          <div className="card" style={{ marginTop: 12, background: result === 'good' ? 'var(--good-soft)' : 'var(--bad-soft)' }}>
            <strong>{result === 'good' ? '¡Bien!' : 'Richtig:'}</strong> <span className="es">{w.es}</span>
            <div className="small muted">{w.de}</div>
          </div>
        )}
        <button type="submit" className="btn block" style={{ marginTop: 12 }} disabled={!result && !value.trim()}>
          {result ? 'Weiter' : 'Überprüfen'}
        </button>
      </form>
    </div>
  );
}
