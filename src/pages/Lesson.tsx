import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getLesson, LESSONS, WORDS } from '../content';
import { getGrammar } from '../content/grammar';
import { lessonExercises } from '../lib/exercises';
import { ExerciseRunner, type RunResult } from '../components/exercises/ExerciseRunner';
import { BackLink, Gems, RegionalNote, SpeakButton, Tip } from '../components/ui';
import { Icon } from '../components/Icon';
import { BUILDINGS, isUnitComplete, REGIONS, type Building } from '../lib/progression';
import { BrandMark } from '../components/BrandMark';
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
  const [reward, setReward] = useState<{ xp: number; building?: Building }>({ xp: 0 });

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
        <BackLink to="/mapa" />
        <p>Misión nicht gefunden.</p>
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
          if (confirm('Misión abbrechen? Dein Fortschritt in dieser Misión geht verloren.')) navigate('/mapa');
        }}
        onFinish={(r) => {
          const before = getState();
          const wasBuilt = isUnitComplete(before, lesson.unitId);
          setResult(r);
          setState((s) => completeLesson(s, lesson.id, r.score, lesson.words.map((w) => w.key)));
          const after = getState();
          const building = !wasBuilt && isUnitComplete(after, lesson.unitId) ? BUILDINGS.find((b) => b.unitId === lesson.unitId) : undefined;
          setReward({ xp: after.xp - before.xp, building });
          setStep('done');
        }}
      />
    );
  }

  if (step === 'done' && result) {
    const stars = result.score >= 0.95 ? 3 : result.score >= 0.8 ? 2 : 1;
    const next = nextLesson(getState());
    return (
      <div className="center" style={{ paddingTop: 24 }}>
        <BrandMark className="result-emblem" />
        <div className="kicker">Misión cumplida</div>
        <h1>{stars === 3 ? '¡Perfecto!' : stars === 2 ? '¡Muy bien!' : '¡Hecho!'}</h1>
        <div style={{ transform: 'scale(1.6)', margin: '10px 0 16px' }}>
          <Gems n={stars} />
        </div>
        <p className="muted">
          {result.correctFirstTry} von {result.total} beim ersten Versuch richtig ({Math.round(result.score * 100)} %)
        </p>
        <div className="grid-2" style={{ marginBottom: 14 }}>
          <div className="stat-box">
            <div className="num">+{reward.xp}</div>
            <div className="lbl">XP · Reales</div>
          </div>
          <div className="stat-box">
            <div className="num">+{lesson.words.length}</div>
            <div className="lbl">Einträge im Dex</div>
          </div>
        </div>
        {reward.building && (
          <Link to="/" className="card gold card-link pop" style={{ textAlign: 'left' }}>
            <div className="kicker">Etapa completada · Neues Gebäude</div>
            <div className="serif" style={{ fontSize: '1.3rem', fontWeight: 600 }}>
              {reward.building.name}
            </div>
            <div className="small muted">steht jetzt auf deiner Plaza – schau es dir an!</div>
          </Link>
        )}
        <div className="list">
          {next && next.id !== lesson.id && (
            <Link to={`/mision/${next.id}`} className="btn block">
              Weiter: {next.title} <Icon name="flecha" size={17} />
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
            <Icon name="repetir" size={16} /> Nochmal üben
          </button>
          <Link to="/mapa" className="btn ghost block">
            Zur Karte
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 90 }}>
      <BackLink to="/mapa" label="Mapa" />
      <header className="page-head">
        <div className="kicker" style={{ color: REGIONS[lesson.level].color }}>
          {REGIONS[lesson.level].place} · Etapa {lesson.unitTitle}
        </div>
        <h1>
          {lesson.emoji} {lesson.title}
        </h1>
        <p>{lesson.goal}</p>
      </header>

      <div className="tabs">
        <button type="button" className={step === 'words' ? 'active' : ''} onClick={() => setStep('words')}>
          I · Vocabulario
        </button>
        <button type="button" className={step === 'dialogue' ? 'active' : ''} onClick={() => setStep('dialogue')}>
          II · {lesson.dialogue ? 'Diálogo' : 'Frases'}
        </button>
        <button type="button" onClick={() => setStep('practice')}>
          III · Práctica
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
            <Link to={`/codice/${grammar.id}`} className="card card-link tinted" style={{ marginTop: 14 }}>
              <div style={{ fontWeight: 800 }}>
                <span className="kicker" style={{ marginBottom: 2 }}>
                  <Icon name="codice" size={14} /> Códice
                </span>
                <br />
                {grammar.title}
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
              Weiter zu {lesson.dialogue ? 'Diálogo' : 'Frases'} <Icon name="flecha" size={17} />
            </button>
          ) : (
            <button type="button" className="btn block" onClick={() => setStep('practice')}>
              Práctica starten <Icon name="flecha" size={17} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
