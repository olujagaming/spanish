import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getLesson, LESSONS, WORDS } from '../content';
import { getGrammar } from '../content/grammar';
import { lessonExercises } from '../lib/exercises';
import { ExerciseRunner, type RunResult } from '../components/exercises/ExerciseRunner';
import { BackLink, RegionalNote, SpeakButton, Stars, Tip } from '../components/ui';
import { Dialogue } from '../components/Dialogue';
import { setState } from '../lib/store';
import { completeLesson } from '../lib/state';
import { nextLesson } from '../lib/selectors';
import { getState } from '../lib/store';

type Step = 'words' | 'dialogue' | 'practice' | 'done';

/** Remount per lesson so state resets when moving to the next lesson. */
export default function LessonRoute() {
  const { id = '' } = useParams();
  return <LessonPage key={id} id={id} />;
}

function LessonPage({ id }: { id: string }) {
  const lesson = getLesson(id);
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('words');
  const [showDe, setShowDe] = useState(true);
  const [result, setResult] = useState<RunResult | null>(null);
  const [runKey, setRunKey] = useState(0);

  const exercises = useMemo(() => {
    if (!lesson) return [];
    const levelWords = WORDS.filter((w) => w.level === lesson.level);
    const levelPhrases = LESSONS.filter((l) => l.level === lesson.level).flatMap((l) => l.phrases);
    return lessonExercises(lesson, levelWords, levelPhrases);
    // runKey regenerates exercises on retry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, runKey]);

  if (!lesson) {
    return (
      <div>
        <BackLink to="/lernen" />
        <p>Lektion nicht gefunden.</p>
      </div>
    );
  }

  const grammar = lesson.grammar ? getGrammar(lesson.grammar) : undefined;

  if (step === 'practice') {
    return (
      <ExerciseRunner
        key={runKey}
        exercises={exercises}
        onQuit={() => {
          if (confirm('Lektion abbrechen? Dein Fortschritt in dieser Lektion geht verloren.')) navigate('/lernen');
        }}
        onFinish={(r) => {
          setResult(r);
          setState((s) => completeLesson(s, lesson.id, r.score, lesson.words.map((w) => w.key)));
          setStep('done');
        }}
      />
    );
  }

  if (step === 'done' && result) {
    const stars = result.score >= 0.95 ? 3 : result.score >= 0.8 ? 2 : 1;
    const next = nextLesson(getState());
    return (
      <div className="center" style={{ paddingTop: 30 }}>
        <div className="confetti">{stars === 3 ? '🏆' : stars === 2 ? '🎉' : '👍'}</div>
        <h1>¡Lección completada!</h1>
        <div style={{ fontSize: '2rem' }}>
          <Stars n={stars} />
        </div>
        <p className="muted">
          {result.correctFirstTry} von {result.total} beim ersten Versuch richtig ({Math.round(result.score * 100)} %)
        </p>
        <div className="card" style={{ textAlign: 'left' }}>
          <div className="row">
            <span className="big-emoji">🗂️</span>
            <div>
              <strong>{lesson.words.length} Wörter</strong> wurden zu deinen Karteikarten hinzugefügt. Wiederhole sie täglich, damit sie
              hängen bleiben!
            </div>
          </div>
        </div>
        <div className="list">
          {next && next.id !== lesson.id && (
            <Link to={`/lektion/${next.id}`} className="btn block">
              Nächste Lektion: {next.emoji} {next.title}
            </Link>
          )}
          <button
            type="button"
            className="btn secondary block"
            onClick={() => {
              setRunKey((k) => k + 1);
              setStep('practice');
            }}
          >
            🔁 Nochmal üben
          </button>
          <Link to="/lernen" className="btn ghost block">
            Zum Lernpfad
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 90 }}>
      <BackLink to="/lernen" label="Lernpfad" />
      <div className="row" style={{ marginBottom: 8 }}>
        <span className="big-emoji">{lesson.emoji}</span>
        <div>
          <div className="small muted" style={{ fontWeight: 800 }}>
            {lesson.level} · {lesson.unitTitle}
          </div>
          <h1 style={{ margin: 0 }}>{lesson.title}</h1>
        </div>
      </div>
      <p className="muted">🎯 {lesson.goal}</p>

      <div className="tabs">
        <button type="button" className={step === 'words' ? 'active' : ''} onClick={() => setStep('words')}>
          1 · Wörter
        </button>
        <button type="button" className={step === 'dialogue' ? 'active' : ''} onClick={() => setStep('dialogue')}>
          2 · {lesson.dialogue ? 'Dialog' : 'Sätze'}
        </button>
        <button type="button" onClick={() => setStep('practice')}>
          3 · Üben
        </button>
      </div>

      {step === 'words' && (
        <>
          {lesson.tip && <Tip>{lesson.tip}</Tip>}
          <p className="small muted">Tippe auf 🔊, um die Aussprache zu hören. Sprich laut nach!</p>
          <div className="list">
            {lesson.words.map((w) => (
              <div key={w.key} className="list-item">
                <SpeakButton text={w.es} />
                <div className="grow">
                  <div className="es">{w.es}</div>
                  <div className="small muted">{w.de}</div>
                  <RegionalNote note={w.note} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {step === 'dialogue' && (
        <>
          <div className="row" style={{ justifyContent: 'flex-end', marginBottom: 8 }}>
            <button type="button" className="btn ghost small" onClick={() => setShowDe((v) => !v)}>
              {showDe ? 'Übersetzung ausblenden' : 'Übersetzung zeigen'}
            </button>
          </div>
          {lesson.dialogue && (
            <div className="card">
              <Dialogue lines={lesson.dialogue} showDe={showDe} />
            </div>
          )}
          <h3>Nützliche Sätze</h3>
          <div className="list">
            {lesson.phrases.map((p) => (
              <div key={p.es} className="list-item">
                <SpeakButton text={p.es} />
                <div className="grow">
                  <div className="es">{p.es}</div>
                  {showDe && <div className="small muted">{p.de}</div>}
                </div>
              </div>
            ))}
          </div>
          {grammar && (
            <Link to={`/grammatik/${grammar.id}`} className="card card-link tinted" style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 800 }}>
                {grammar.emoji} Grammatik dazu: {grammar.title}
              </div>
              <div className="small muted">{grammar.summary}</div>
            </Link>
          )}
        </>
      )}

      <div className="check-bar">
        <div className="inner">
          {step === 'words' ? (
            <button type="button" className="btn block" onClick={() => setStep('dialogue')}>
              Weiter zu {lesson.dialogue ? 'Dialog' : 'Sätzen'} →
            </button>
          ) : (
            <button type="button" className="btn block" onClick={() => setStep('practice')}>
              Übungen starten 💪
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
