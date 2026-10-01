import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGrammar } from '../content/grammar';
import { BackLink, LevelBadge, RichText, SpeakButton } from '../components/ui';
import { setState } from '../lib/store';
import { addXp } from '../lib/state';
import { playSound } from '../lib/sound';
import { shuffle } from '../lib/exercises';
import type { GrammarExercise } from '../content/types';

function Quiz({ id, exercises }: { id: string; exercises: readonly GrammarExercise[] }) {
  const [items, setItems] = useState(() => shuffle(exercises));
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const ex = items[pos];

  if (done) {
    const pct = score / items.length;
    return (
      <div className="card center">
        <div className="kicker">{pct === 1 ? 'Perfecto' : pct >= 0.7 ? 'Muy bien' : 'Sigue así'}</div>
        <h3>
          {score} / {items.length} richtig
        </h3>
        <button
          type="button"
          className="btn secondary"
          onClick={() => {
            setItems(shuffle(exercises));
            setPos(0);
            setScore(0);
            setPicked(null);
            setDone(false);
          }}
        >
          Nochmal
        </button>
      </div>
    );
  }

  const answer = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const ok = i === ex.answer;
    playSound(ok ? 'good' : 'bad');
    if (ok) setScore((s) => s + 1);
  };

  const next = () => {
    if (pos + 1 >= items.length) {
      const final = score / items.length;
      setDone(true);
      playSound('done');
      setState((s) =>
        addXp(
          {
            ...s,
            grammar: {
              ...s.grammar,
              [id]: { best: Math.max(final, s.grammar[id]?.best ?? 0), completedAt: Date.now() },
            },
          },
          10 + Math.round(final * 10),
        ),
      );
      return;
    }
    setPos((p) => p + 1);
    setPicked(null);
  };

  const filled = picked !== null ? ex.q.replace('___', ex.options[ex.answer]) : ex.q;

  return (
    <div className="card">
      <div className="row small muted" style={{ marginBottom: 8 }}>
        <span>
          Frage {pos + 1} / {items.length}
        </span>
        <span className="spacer" />
        <span>✓ {score}</span>
      </div>
      <div className="row" style={{ marginBottom: 14 }}>
        {picked !== null && <SpeakButton text={filled.replace(/\(.*?\)/g, '')} />}
        <div style={{ fontSize: '1.15rem', fontWeight: 700 }}>{filled}</div>
      </div>
      <div className="options">
        {ex.options.map((o, i) => (
          <button
            key={o}
            type="button"
            className={`option ${picked !== null ? (i === ex.answer ? 'correct' : i === picked ? 'wrong' : 'faded') : ''}`}
            onClick={() => answer(i)}
            disabled={picked !== null}
          >
            {o}
          </button>
        ))}
      </div>
      {picked !== null && (
        <div style={{ marginTop: 12 }}>
          {ex.explain && <p className="small">💡 {ex.explain}</p>}
          <button type="button" className="btn block" onClick={next}>
            {pos + 1 >= items.length ? 'Ergebnis' : 'Weiter'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function GrammarTopicPage() {
  const { id = '' } = useParams();
  const g = getGrammar(id);
  if (!g) return <BackLink />;
  return (
    <div>
      <BackLink />
      <div className="row" style={{ marginBottom: 6 }}>
        <span className="big-emoji">{g.emoji}</span>
        <div>
          <LevelBadge level={g.level} />
          <h1 style={{ margin: '4px 0 0' }}>{g.title}</h1>
        </div>
      </div>
      <p className="muted">{g.summary}</p>
      {g.sections.map((sec) => (
        <div key={sec.heading} className="card">
          <h3>{sec.heading}</h3>
          <RichText text={sec.text} />
          {sec.table && (
            <div className="table-wrap">
              <table className="conj">
                <thead>
                  <tr>
                    {sec.table[0].map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sec.table.slice(1).map((row, i) => (
                    <tr key={i}>
                      {row.map((c, j) => (
                        <td key={j} className={j > 0 ? 'es' : ''}>
                          {c}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {sec.examples && (
            <div className="list">
              {sec.examples.map(([es, de]) => (
                <div key={es} className="list-item" style={{ padding: '8px 10px' }}>
                  <SpeakButton text={es.replace(/\(.*?\)/g, '').split('→').pop()!.split('=')[0]} />
                  <div className="grow">
                    <div className="es">{es}</div>
                    <div className="small muted">{de}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      <h2 style={{ marginTop: 22 }}>Práctica</h2>
      <Quiz id={g.id} exercises={g.exercises} />
    </div>
  );
}
