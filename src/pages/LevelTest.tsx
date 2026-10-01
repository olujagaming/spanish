import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { LESSONS, LEVEL_SOURCES, WORDS } from '../content';
import type { LevelId } from '../content/types';
import { reviewExercises, buildEx, sample } from '../lib/exercises';
import { ExerciseRunner, type RunResult } from '../components/exercises/ExerciseRunner';
import { setState } from '../lib/store';
import { addCards, addXp } from '../lib/state';
import { BackLink } from '../components/ui';

const ORDER: LevelId[] = ['A0', 'A1', 'A2', 'B1', 'B2'];
const PASS = 0.8;

export default function LevelTest() {
  const { level = 'A1' } = useParams();
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const src = LEVEL_SOURCES.find((l) => l.id === level);
  // Testing level X means skipping all previous levels: test words from the level before.
  const prevLevel = ORDER[ORDER.indexOf(level as LevelId) - 1];

  const exercises = useMemo(() => {
    if (!prevLevel) return [];
    const words = WORDS.filter((w) => w.level === prevLevel);
    const phrases = LESSONS.filter((l) => l.level === prevLevel).flatMap((l) => l.phrases);
    const ex = reviewExercises(words, words, 16);
    sample(phrases, 4).forEach((p) => ex.push(buildEx(p, phrases)));
    return ex;
  }, [prevLevel]);

  if (!src || !prevLevel) return <BackLink to="/mapa" />;

  const skipped = LESSONS.filter((l) => ORDER.indexOf(l.level) < ORDER.indexOf(level as LevelId));

  if (result) {
    const passed = result.score >= PASS;
    return (
      <div className="center" style={{ paddingTop: 30 }}>
        <div className="kicker">Atajo</div>
        <h1>{passed ? '¡Aprobado! Bestanden!' : 'Noch nicht ganz'}</h1>
        <p>{Math.round(result.score * 100)} % richtig</p>
        <p className="muted">
          {passed
            ? `Alle Lektionen vor ${level} wurden als erledigt markiert und ihre Wörter zu deinen Karteikarten hinzugefügt.`
            : `Du brauchst ${PASS * 100} %. Kein Problem – lerne die Lektionen davor, dann klappt es!`}
        </p>
        <Link to="/mapa" className="btn block">
          Zum Lernpfad
        </Link>
      </div>
    );
  }

  if (!started) {
    return (
      <div>
        <BackLink to="/mapa" />
        <div className="card center">
          <div className="kicker">Atajo</div>
          <h1>Abkürzung nach {level}</h1>
          <p>
            Du kannst schon etwas Spanisch? Beantworte 20 Fragen zum Stoff vor <strong>{src.title}</strong>. Mit mindestens{' '}
            {PASS * 100} % springst du direkt zu Stufe {level} – {skipped.length} Lektionen werden freigeschaltet.
          </p>
          <button type="button" className="btn block" onClick={() => setStarted(true)}>
            Test starten
          </button>
        </div>
      </div>
    );
  }

  return (
    <ExerciseRunner
      exercises={exercises}
      onQuit={() => navigate('/mapa')}
      onFinish={(r) => {
        setResult(r);
        if (r.score >= PASS) {
          setState((s) => {
            const lessons = { ...s.lessons };
            const now = Date.now();
            for (const l of skipped) if (!lessons[l.id]) lessons[l.id] = { stars: 1, best: r.score, completedAt: now };
            return addXp(
              addCards({ ...s, lessons }, skipped.flatMap((l) => l.words.map((w) => w.key))),
              30,
            );
          });
        } else {
          setState((s) => addXp(s, 5));
        }
      }}
    />
  );
}
