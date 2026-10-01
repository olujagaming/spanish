import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { WORDS } from '../content';
import { fold } from '../lib/answer';
import { setState, useAppState } from '../lib/store';
import { addCards } from '../lib/state';
import { BackLink, LevelBadge, RegionalNote, SpeakButton } from '../components/ui';

export default function Dictionary() {
  const s = useAppState();
  const [q, setQ] = useState('');
  const results = useMemo(() => {
    const f = fold(q);
    const list = f ? WORDS.filter((w) => fold(w.es).includes(f) || fold(w.de).includes(f)) : WORDS;
    return list.slice(0, 120);
  }, [q]);

  return (
    <div>
      <BackLink />
      <h1>🔎 Wörterbuch</h1>
      <p className="muted small">{WORDS.length} Wörter und Ausdrücke aus allen Lektionen. Suche auf Deutsch oder Spanisch.</p>
      <input className="input" placeholder="z. B. Kaffee oder hablar" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 12 }} autoFocus />
      <div className="list">
        {results.map((w) => (
          <div key={w.key} className="list-item">
            <SpeakButton text={w.es} />
            <div className="grow">
              <div className="es">{w.es}</div>
              <div className="small muted">{w.de}</div>
              <RegionalNote note={w.note} />
            </div>
            <div style={{ textAlign: 'right' }}>
              <Link to={`/lektion/${w.lessonId}`}>
                <LevelBadge level={w.level} />
              </Link>
              <div>
                {s.cards[w.key] ? (
                  <span className="tiny muted">🗂️ ✓</span>
                ) : (
                  <button type="button" className="btn ghost small" onClick={() => setState((st) => addCards(st, [w.key]))} title="Zu Karteikarten">
                    ➕
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {results.length === 0 && <p className="muted center">Nichts gefunden.</p>}
      </div>
    </div>
  );
}
