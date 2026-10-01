import { useMemo, useState } from 'react';
import { VERBS } from '../../content/verbs';
import { conjugate, PERSONS, TENSES, type Tense } from '../../lib/conjugate';
import { checkAnswer, isAccepted } from '../../lib/answer';
import { shuffle } from '../../lib/exercises';
import { playSound } from '../../lib/sound';
import { speak } from '../../lib/speech';
import { AccentKeys } from '../../components/exercises/ExerciseView';
import { GameHeader, GameOver, useCountdown } from './shared';

const TENSE_SETS: { label: string; tenses: Tense[] }[] = [
  { label: 'Presente', tenses: ['presente'] },
  { label: 'Vergangenheit', tenses: ['perfecto', 'indefinido', 'imperfecto'] },
  { label: 'Futur & Konditional', tenses: ['futuro', 'condicional'] },
  { label: 'Subjuntivo', tenses: ['subjuntivo'] },
  { label: 'Alles gemischt', tenses: ['presente', 'perfecto', 'indefinido', 'imperfecto', 'futuro', 'condicional', 'subjuntivo'] },
];

interface Task {
  inf: string;
  de: string;
  tense: Tense;
  person: number;
  answer: string;
}

function makeTasks(tenses: Tense[]): Task[] {
  const tasks: Task[] = [];
  for (const v of shuffle(VERBS).slice(0, 40)) {
    const tense = tenses[Math.floor(Math.random() * tenses.length)];
    const person = Math.floor(Math.random() * 6);
    const answer = conjugate(v, tense)[person];
    if (!answer || answer === '—') continue;
    tasks.push({ inf: v.inf, de: v.de, tense, person, answer });
  }
  return tasks;
}

function Play({ tenses, onRestart }: { tenses: Tense[]; onRestart: () => void }) {
  const tasks = useMemo(() => makeTasks(tenses), [tenses]);
  const [i, setI] = useState(0);
  const [value, setValue] = useState('');
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; answer: string } | null>(null);
  const [left] = useCountdown(90, !over, () => setOver(true));
  const t = tasks[i % tasks.length];

  if (over) return <GameOver id="konjugation" score={score} onRestart={onRestart} />;

  const submit = () => {
    if (feedback) {
      setFeedback(null);
      setValue('');
      setI((x) => x + 1);
      return;
    }
    // Accept answers with or without reflexive pronoun / "ha / hay" variants
    const ok = isAccepted(checkAnswer(value, t.answer)) || isAccepted(checkAnswer(value, t.answer.replace(/^(me|te|se|nos|os) /, '')));
    playSound(ok ? 'good' : 'bad');
    speak(`${PERSONS[t.person].split('/')[0]} ${t.answer}`);
    if (ok) {
      setScore((s) => s + 1);
      setValue('');
      setI((x) => x + 1);
    } else setFeedback({ ok, answer: t.answer });
  };

  return (
    <div>
      <GameHeader title="🥊 Konjugations-Duell">
        <span className="stat-pill timer">⏱ {left}s</span>
        <span className="stat-pill">⭐ {score}</span>
      </GameHeader>
      <div className="card center">
        <div className="badge" style={{ marginBottom: 8 }}>
          {TENSES.find((x) => x.id === t.tense)?.label}
        </div>
        <div style={{ fontSize: '1.6rem', fontWeight: 900 }}>{t.inf}</div>
        <div className="small muted">{t.de}</div>
        <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: 10, color: 'var(--primary)' }}>{PERSONS[t.person]}</div>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (feedback || value.trim()) submit();
        }}
      >
        <input
          className="input"
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={!!feedback}
          lang="es"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Verbform …"
        />
        {!feedback && <AccentKeys onKey={(k) => setValue((v) => v + k)} />}
        {feedback && (
          <div className="card shake" style={{ marginTop: 10, background: 'var(--bad-soft)' }}>
            ❌ Richtig: <strong>{feedback.answer}</strong>
          </div>
        )}
        <button type="submit" className="btn block" style={{ marginTop: 12 }}>
          {feedback ? 'Weiter' : 'Prüfen'}
        </button>
      </form>
    </div>
  );
}

export default function Konjugation({ onRestart }: { onRestart: () => void }) {
  const [set, setSet] = useState<Tense[] | null>(null);
  if (set) return <Play tenses={set} onRestart={onRestart} />;
  return (
    <div>
      <GameHeader title="🥊 Konjugations-Duell" />
      <p className="muted">90 Sekunden: Konjugiere so viele Verben wie möglich. Welche Zeiten willst du üben?</p>
      <div className="list">
        {TENSE_SETS.map((s) => (
          <button key={s.label} type="button" className="btn secondary block" onClick={() => setSet(s.tenses)}>
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
