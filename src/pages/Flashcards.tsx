import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setState, useAppState } from '../lib/store';
import { cardItem, cardStats } from '../lib/selectors';
import { addCards } from '../lib/state';
import { keyOf } from '../lib/answer';
import { LEVEL_SOURCES, LESSONS } from '../content';
import { Empty, SpeakButton } from '../components/ui';
import { isMastered } from '../lib/srs';

export default function Flashcards() {
  const s = useAppState();
  const navigate = useNavigate();
  const st = cardStats(s);
  const [es, setEs] = useState('');
  const [de, setDe] = useState('');
  const [showList, setShowList] = useState(false);
  const [query, setQuery] = useState('');

  const addCustom = () => {
    if (!es.trim() || !de.trim()) return;
    const key = 'c:' + keyOf(es);
    setState((cur) => {
      if (cur.custom.some((c) => c.key === key)) return cur;
      return addCards({ ...cur, custom: [...cur.custom, { key, es: es.trim(), de: de.trim(), created: Date.now() }] }, [key]);
    });
    setEs('');
    setDe('');
  };

  const allKeys = Object.keys(s.cards);
  const listed = allKeys
    .map((k) => ({ k, item: cardItem(s, k), card: s.cards[k] }))
    .filter((x) => x.item && (!query || `${x.item.es} ${x.item.de}`.toLowerCase().includes(query.toLowerCase())))
    .slice(0, 200);

  return (
    <div>
      <h1>🗂️ Karteikarten</h1>
      <p className="muted">
        Wörter aus deinen Lektionen landen automatisch hier. Das System zeigt dir jede Karte genau dann, wenn du sie fast vergessen hast
        (Spaced Repetition) – so bleiben Vokabeln langfristig im Kopf.
      </p>

      <div className="grid-3" style={{ marginBottom: 14 }}>
        <div className="stat-box">
          <div className="num" style={{ color: 'var(--primary)' }}>
            {st.due}
          </div>
          <div className="lbl">fällig</div>
        </div>
        <div className="stat-box">
          <div className="num">{st.learning + st.fresh}</div>
          <div className="lbl">im Lernen</div>
        </div>
        <div className="stat-box">
          <div className="num" style={{ color: 'var(--good)' }}>
            {st.mastered}
          </div>
          <div className="lbl">gefestigt</div>
        </div>
      </div>

      {st.total === 0 ? (
        <Empty emoji="📭">
          <p>Noch keine Karten. Schließe deine erste Lektion ab – oder lerne gleich ein Themen-Deck unten.</p>
          <Link to="/lernen" className="btn">
            Zur ersten Lektion
          </Link>
        </Empty>
      ) : (
        <div className="list" style={{ marginBottom: 10 }}>
          <button type="button" className="btn block" disabled={st.due === 0} onClick={() => navigate('/karten/lernen')}>
            {st.due > 0 ? `▶️ ${st.due} Karten wiederholen` : '✓ Für heute alles wiederholt!'}
          </button>
          <div className="grid-2">
            <button type="button" className="btn secondary small" onClick={() => navigate('/karten/lernen?mode=all&dir=de-es')}>
              🔄 DE → ES üben
            </button>
            <button type="button" className="btn secondary small" onClick={() => navigate('/karten/lernen?mode=all&dir=listen')}>
              👂 Hör-Karten
            </button>
          </div>
        </div>
      )}

      <div className="section-title">
        <h2>Themen-Decks</h2>
      </div>
      <p className="small muted">Übe die Wörter einer Stufe frei – ohne den Lernplan zu beeinflussen.</p>
      <div className="grid-2 wide-3">
        {LEVEL_SOURCES.map((l) => {
          const count = LESSONS.filter((x) => x.level === l.id).reduce((n, x) => n + x.words.length, 0);
          return (
            <button key={l.id} type="button" className="tile" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => navigate(`/karten/lernen?mode=level&level=${l.id}`)}>
              <span className="t-title">
                {l.id} · {l.title}
              </span>
              <span className="t-sub">{count} Wörter</span>
            </button>
          );
        })}
      </div>

      <div className="section-title">
        <h2>Eigene Karte</h2>
      </div>
      <div className="card">
        <input className="input" placeholder="Spanisch, z. B. la sandía" value={es} onChange={(e) => setEs(e.target.value)} lang="es" style={{ marginBottom: 8 }} />
        <input className="input" placeholder="Deutsch, z. B. die Wassermelone" value={de} onChange={(e) => setDe(e.target.value)} style={{ marginBottom: 10 }} />
        <button type="button" className="btn block" onClick={addCustom} disabled={!es.trim() || !de.trim()}>
          ➕ Karte hinzufügen
        </button>
        {s.custom.length > 0 && <p className="small muted" style={{ marginTop: 8, marginBottom: 0 }}>{s.custom.length} eigene Karten</p>}
      </div>

      {st.total > 0 && (
        <>
          <div className="section-title">
            <h2>Alle Karten ({st.total})</h2>
            <button type="button" className="btn ghost small" onClick={() => setShowList((v) => !v)}>
              {showList ? 'ausblenden' : 'anzeigen'}
            </button>
          </div>
          {showList && (
            <>
              <input className="input" placeholder="Suchen …" value={query} onChange={(e) => setQuery(e.target.value)} style={{ marginBottom: 10 }} />
              <div className="list">
                {listed.map(({ k, item, card }) => (
                  <div key={k} className="list-item">
                    <SpeakButton text={item!.es} />
                    <div className="grow">
                      <div className="es">{item!.es}</div>
                      <div className="small muted">{item!.de}</div>
                    </div>
                    <span className="tiny muted">{isMastered(card) ? '💪' : card.reps === 0 ? 'neu' : `${card.interval} T`}</span>
                    {item!.custom && (
                      <button
                        type="button"
                        className="icon-btn"
                        aria-label="Löschen"
                        onClick={() =>
                          setState((cur) => {
                            const cards = { ...cur.cards };
                            delete cards[k];
                            return { ...cur, cards, custom: cur.custom.filter((c) => c.key !== k) };
                          })
                        }
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
