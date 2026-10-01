import { useCallback, useEffect, useState } from 'react';
import type { Exercise } from '../../lib/exercises';
import { ExerciseView, type Answer } from './ExerciseView';
import { ProgressBar } from '../ui';
import { playSound } from '../../lib/sound';
import { speak } from '../../lib/speech';

interface Item {
  ex: Exercise;
  retry: boolean;
  id: number;
}

export interface RunResult {
  score: number;
  total: number;
  correctFirstTry: number;
  missedKeys: string[];
}

const PRAISE = ['¡Muy bien!', '¡Genial!', '¡Perfecto!', '¡Eso es!', '¡Excelente!', '¡Bravo!', '¡Fenomenal!'];

/** Runs a sequence of exercises; wrong answers are repeated once at the end. */
export function ExerciseRunner({
  exercises,
  onFinish,
  onQuit,
}: {
  exercises: Exercise[];
  onFinish: (r: RunResult) => void;
  onQuit: () => void;
}) {
  const [queue, setQueue] = useState<Item[]>(() => exercises.map((ex, id) => ({ ex, retry: false, id })));
  const [pos, setPos] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [checked, setChecked] = useState(false);
  const [firstTry, setFirstTry] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const [praise, setPraise] = useState(PRAISE[0]);

  const item = queue[pos];
  const progress = pos / queue.length;

  const submit = useCallback(
    (a: Answer) => {
      if (checked) return;
      setAnswer(a);
      setChecked(true);
      playSound(a.correct ? 'good' : 'bad');
      setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
      if (a.correct && !item.retry) setFirstTry((n) => n + 1);
      if (!a.correct) {
        if (!item.retry) setQueue((q) => [...q, { ...item, retry: true, id: q.length + 1000 }]);
        const key = 'key' in item.ex ? item.ex.key : undefined;
        if (key) setMissed((m) => [...m, key]);
      }
      // Read the full Spanish solution aloud for sentence exercises.
      if (item.ex.kind === 'build' || item.ex.kind === 'gap') speak(item.ex.kind === 'gap' ? item.ex.full : item.ex.answer);
    },
    [checked, item],
  );

  const next = useCallback(() => {
    if (pos + 1 >= queue.length) {
      playSound('done');
      onFinish({
        score: firstTry / exercises.length,
        total: exercises.length,
        correctFirstTry: firstTry,
        missedKeys: missed,
      });
      return;
    }
    setPos((p) => p + 1);
    setAnswer(null);
    setChecked(false);
  }, [pos, queue.length, firstTry, exercises.length, missed, onFinish]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      // A focused button already handles Enter itself.
      if ((e.target as HTMLElement | null)?.tagName === 'BUTTON') return;
      if (checked) next();
      else if (answer) submit(answer);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [checked, answer, next, submit]);

  if (!item) return null;

  return (
    <div>
      <div className="lesson-top">
        <button type="button" className="icon-btn" onClick={onQuit} aria-label="Beenden">
          ✕
        </button>
        <ProgressBar value={progress} />
      </div>
      <div className="ex-body" key={item.id}>
        {item.retry && <p className="badge" style={{ marginBottom: 10 }}>🔁 Noch einmal</p>}
        <ExerciseView ex={item.ex} checked={checked} onAnswer={setAnswer} onAutoSubmit={submit} />
      </div>

      {checked && answer ? (
        <div className={`feedback ${answer.correct ? 'good' : 'bad'}`}>
          <div className="inner">
            <h3>{answer.correct ? `✅ ${praise}` : '❌ Nicht ganz'}</h3>
            {(!answer.correct || answer.hint) && (
              <div className="solution">
                {!answer.correct && (
                  <>
                    Richtig: <strong>{answer.solution}</strong>
                  </>
                )}
                {answer.hint && <div className="small">{answer.hint}</div>}
                {answer.correct && answer.hint && answer.solution && item.ex.kind === 'type' && (
                  <div className="small">
                    Richtig geschrieben: <strong>{answer.solution}</strong>
                  </div>
                )}
              </div>
            )}
            <button type="button" className={`btn block ${answer.correct ? 'good' : 'bad'}`} onClick={next} autoFocus>
              Weiter
            </button>
          </div>
        </div>
      ) : (
        <div className="check-bar">
          <div className="inner">
            {item.ex.kind === 'speak' ? (
              <button type="button" className="btn block" onClick={() => answer && submit(answer)}>
                Weiter
              </button>
            ) : item.ex.kind === 'match' ? (
              <button type="button" className="btn secondary block" onClick={() => submit({ correct: false, solution: 'Übersprungen' })}>
                Überspringen
              </button>
            ) : (
              <button type="button" className="btn block" disabled={!answer} onClick={() => answer && submit(answer)}>
                Überprüfen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
