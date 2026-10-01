import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppState } from '../lib/store';
import { LEVEL_SOURCES, LESSONS } from '../content';
import { isLessonDone, isUnlocked, levelProgress, nextLesson } from '../lib/selectors';
import { BUILDINGS, REGIONS, unitProgress } from '../lib/progression';
import { Gems, PageHead, ProgressBar } from '../components/ui';
import { Icon } from '../components/Icon';
import GrammarList from './GrammarList';

export default function Learn() {
  const s = useAppState();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'route' | 'codice'>('route');
  const next = nextLesson(s);

  return (
    <div>
      <PageHead kicker="Mapa" icon="mapa" title="Tu ruta">
        Fünf Regionen von Madrid bis Cartagena. Jede Etappe bringt ein neues Gebäude für deine Plaza.
      </PageHead>
      <div className="tabs" role="tablist">
        <button type="button" className={tab === 'route' ? 'active' : ''} onClick={() => setTab('route')}>
          Misiones
        </button>
        <button type="button" className={tab === 'codice' ? 'active' : ''} onClick={() => setTab('codice')}>
          Códice
        </button>
      </div>

      {tab === 'codice' ? (
        <GrammarList embedded />
      ) : (
        LEVEL_SOURCES.map((level) => {
          const region = REGIONS[level.id];
          const p = levelProgress(s, level.id);
          const allDone = p.done === p.total;
          return (
            <section key={level.id} style={{ ['--rc' as string]: region.color }}>
              <div className="region-head">
                <span className="lvl">{level.id}</span>
                <div className="place">{region.place}</div>
                <h2>{region.name}</h2>
                <p className="small muted" style={{ margin: '0 0 12px' }}>
                  {region.tagline}
                </p>
                <div className="row">
                  <div className="spacer">
                    <ProgressBar value={p.done / p.total} className="thin" />
                  </div>
                  <span className="tiny muted">
                    {p.done}/{p.total} Misiones
                  </span>
                </div>
                {!allDone && level.id !== 'A0' && (
                  <button type="button" className="btn small secondary" style={{ marginTop: 12 }} onClick={() => navigate(`/atajo/${level.id}`)}>
                    <Icon name="atajo" size={15} /> Atajo – direkt hierher springen
                  </button>
                )}
              </div>
              {level.units.map((unit) => {
                const up = unitProgress(s, unit.id);
                const building = BUILDINGS.find((b) => b.unitId === unit.id);
                const lessons = LESSONS.filter((l) => l.unitId === unit.id);
                return (
                  <div key={unit.id} className="route">
                    <div className="stage-label">
                      Etapa · {unit.title}
                      <span style={{ color: up.done === up.total ? region.color : undefined }}>
                        {up.done === up.total ? `✓ ${building?.name}` : `→ ${building?.name}`}
                      </span>
                    </div>
                    {lessons.map((l, i) => {
                      const done = isLessonDone(s, l.id);
                      const unlocked = isUnlocked(s, l);
                      const current = next?.id === l.id;
                      const last = i === lessons.length - 1;
                      return (
                        <button
                          key={l.id}
                          type="button"
                          className={`station ${done ? 'done' : ''} ${current ? 'current' : ''} ${!unlocked ? 'locked' : ''}`}
                          onClick={() => {
                            if (unlocked) navigate(`/mision/${l.id}`);
                            else if (confirm('Diese Misión ist noch gesperrt. Trotzdem öffnen?')) navigate(`/mision/${l.id}`);
                          }}
                        >
                          {!last && (
                            <span
                              aria-hidden="true"
                              style={{
                                position: 'absolute',
                                left: 22,
                                top: 'calc(50% + 23px)',
                                height: 'calc(100% - 46px + 16px)',
                                width: 2,
                                background: done ? region.color : 'var(--line-strong)',
                                opacity: done ? 0.8 : 1,
                              }}
                            />
                          )}
                          <span className="node">{unlocked ? l.emoji : <Icon name="candado" size={18} />}</span>
                          <span className="info">
                            <span className="row" style={{ gap: 8 }}>
                              <span className="spacer">
                                <span className="serif" style={{ fontWeight: 600, display: 'block', fontSize: '1.02rem' }}>
                                  {l.title}
                                </span>
                                <span className="tiny muted">{l.goal}</span>
                              </span>
                              {done && <Gems n={s.lessons[l.id].stars} />}
                              {current && <span style={{ color: 'var(--gold)', display: 'flex' }}>
                                  <Icon name="flecha" size={18} />
                                </span>}
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </section>
          );
        })
      )}
    </div>
  );
}
