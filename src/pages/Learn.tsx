import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppState } from '../lib/store';
import { LEVEL_COLORS, LEVEL_SOURCES, LESSONS } from '../content';
import { isLessonDone, isUnlocked, levelProgress, nextLesson } from '../lib/selectors';
import { Stars, ProgressBar } from '../components/ui';
import GrammarList from './GrammarList';

export default function Learn() {
  const s = useAppState();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'path' | 'grammar'>('path');
  const next = nextLesson(s);

  return (
    <div>
      <div className="tabs" role="tablist">
        <button type="button" className={tab === 'path' ? 'active' : ''} onClick={() => setTab('path')}>
          📚 Lektionen
        </button>
        <button type="button" className={tab === 'grammar' ? 'active' : ''} onClick={() => setTab('grammar')}>
          🧩 Grammatik
        </button>
      </div>

      {tab === 'grammar' ? (
        <GrammarList embedded />
      ) : (
        LEVEL_SOURCES.map((level) => {
          const p = levelProgress(s, level.id);
          const levelLessons = LESSONS.filter((l) => l.level === level.id);
          const allDone = p.done === p.total;
          return (
            <section key={level.id}>
              <div className="level-header" style={{ background: LEVEL_COLORS[level.id] }}>
                <div className="row">
                  <div className="spacer">
                    <div className="small" style={{ fontWeight: 800, opacity: 0.9 }}>
                      Stufe {level.id}
                    </div>
                    <h2>{level.title}</h2>
                    <p className="small">{level.subtitle}</p>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>
                    {p.done}/{p.total}
                  </div>
                </div>
                <div style={{ marginTop: 10 }}>
                  <ProgressBar value={p.done / p.total} className="thin accent" />
                </div>
                {!allDone && level.id !== 'A0' && (
                  <button
                    type="button"
                    className="btn small secondary"
                    style={{ marginTop: 12 }}
                    onClick={() => navigate(`/test/${level.id}`)}
                  >
                    ⏩ Einstufungstest: Stufe überspringen
                  </button>
                )}
              </div>
              {level.units.map((unit) => (
                <div key={unit.id}>
                  <div className="unit-title">{unit.title}</div>
                  {levelLessons
                    .filter((l) => l.unitId === unit.id)
                    .map((l) => {
                      const done = isLessonDone(s, l.id);
                      const unlocked = isUnlocked(s, l);
                      const current = next?.id === l.id;
                      return (
                        <button
                          key={l.id}
                          type="button"
                          className={`lesson-node ${done ? 'done' : ''} ${current ? 'current' : ''} ${!unlocked ? 'locked' : ''}`}
                          onClick={() => {
                            if (unlocked) navigate(`/lektion/${l.id}`);
                            else if (confirm('Diese Lektion ist noch gesperrt. Trotzdem öffnen?')) navigate(`/lektion/${l.id}`);
                          }}
                        >
                          <span className="bubble">{unlocked ? l.emoji : '🔒'}</span>
                          <span className="spacer">
                            <span style={{ fontWeight: 800, display: 'block' }}>{l.title}</span>
                            <span className="small muted">{l.goal}</span>
                          </span>
                          {done && <Stars n={s.lessons[l.id].stars} />}
                          {current && <span className="badge" style={{ background: 'var(--primary)', color: 'white' }}>Start</span>}
                        </button>
                      );
                    })}
                </div>
              ))}
            </section>
          );
        })
      )}
    </div>
  );
}
