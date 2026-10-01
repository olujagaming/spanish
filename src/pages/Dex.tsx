import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setState, useAppState } from '../lib/store';
import { cardStats } from '../lib/selectors';
import { DEX, dexNumber, dexStats, masteryOf, MASTERY, RARITY, REGIONS } from '../lib/progression';
import { addCards } from '../lib/state';
import { fold, keyOf } from '../lib/answer';
import type { LevelId } from '../content/types';
import { Gems, PageHead, ProgressBar, SpeakButton } from '../components/ui';
import { Icon } from '../components/Icon';

const LEVELS: LevelId[] = ['A0', 'A1', 'A2', 'B1', 'B2'];
const PAGE = 120;

export default function Dex() {
  const s = useAppState();
  const navigate = useNavigate();
  const st = dexStats(s);
  const cards = cardStats(s);
  const [level, setLevel] = useState<LevelId | 'all'>('all');
  const [filter, setFilter] = useState<'all' | 'found' | 'learning' | 'mastered'>('all');
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [showCustom, setShowCustom] = useState(false);
  const [es, setEs] = useState('');
  const [de, setDe] = useState('');

  const list = useMemo(() => {
    const f = fold(q);
    return DEX.filter((e) => {
      if (level !== 'all' && e.word.level !== level) return false;
      const m = masteryOf(s.cards[e.word.key]);
      if (filter === 'found' && m === 0) return false;
      if (filter === 'learning' && (m === 0 || m === 4)) return false;
      if (filter === 'mastered' && m !== 4) return false;
      // Searching only reveals words that were already discovered.
      if (f && !(m > 0 && (fold(e.word.es).includes(f) || fold(e.word.de).includes(f)))) return false;
      return true;
    });
  }, [s.cards, level, filter, q]);

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

  return (
    <div>
      <PageHead kicker="Dex" icon="dex" title="Tu colección">
        Jedes Wort, das du auf deiner Reise triffst, landet hier. Wiederhole es, bis es <em>dominado</em> ist.
      </PageHead>

      <div className="card gold">
        <div className="row">
          <div className="spacer">
            <div className="serif" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
              {st.found} <span className="muted" style={{ fontSize: '1rem' }}>/ {st.total}</span>
            </div>
            <div className="tiny muted">entdeckt · {st.mastered} gemeistert</div>
          </div>
          <button type="button" className="btn" disabled={cards.due === 0} onClick={() => navigate('/repasar')}>
            <Icon name="repetir" size={17} /> {cards.due > 0 ? `Repasar · ${cards.due}` : 'Alles frisch'}
          </button>
        </div>
        <div style={{ marginTop: 12 }}>
          <ProgressBar value={st.found / st.total} className="thin" />
        </div>
        {cards.total > 0 && (
          <div className="row" style={{ marginTop: 12, gap: 8 }}>
            <button type="button" className="btn secondary small" onClick={() => navigate('/repasar?mode=all&dir=de-es')}>
              DE → ES üben
            </button>
            <button type="button" className="btn secondary small" onClick={() => navigate('/repasar?mode=all&dir=listen')}>
              <Icon name="volumen" size={15} /> Hören
            </button>
          </div>
        )}
      </div>

      <div className="chips" style={{ marginBottom: 8 }}>
        <button type="button" className={`chip ${level === 'all' ? 'active' : ''}`} onClick={() => setLevel('all')}>
          Alle Regionen
        </button>
        {LEVELS.map((l) => (
          <button key={l} type="button" className={`chip ${level === l ? 'active' : ''}`} onClick={() => setLevel(l)} title={REGIONS[l].place}>
            <span style={{ color: RARITY[l].color }}>◆</span> {RARITY[l].label}
          </button>
        ))}
      </div>
      <div className="chips" style={{ marginBottom: 10 }}>
        {(
          [
            ['all', 'Alle'],
            ['found', 'Entdeckt'],
            ['learning', 'Im Lernen'],
            ['mastered', 'Gemeistert'],
          ] as const
        ).map(([id, l]) => (
          <button key={id} type="button" className={`chip ${filter === id ? 'active' : ''}`} onClick={() => setFilter(id)}>
            {l}
          </button>
        ))}
      </div>
      <input className="input" placeholder="Entdeckte Wörter durchsuchen …" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 12 }} />

      <div className="dex-grid">
        {list.slice(0, limit).map((e) => {
          const m = masteryOf(s.cards[e.word.key]);
          const rar = RARITY[e.word.level];
          return m === 0 ? (
            <div key={e.no} className="dex-card hidden" style={{ ['--rar' as string]: rar.color }}>
              <span className="no">{dexNumber(e.no)}</span>
              <span className="w">???</span>
              <span className="d">{REGIONS[e.word.level].place}</span>
            </div>
          ) : (
            <Link key={e.no} to={`/dex/${e.no}`} className="dex-card" style={{ ['--rar' as string]: rar.color }}>
              <span className="no">{dexNumber(e.no)}</span>
              <span className="w">{e.word.es}</span>
              <span className="d">{e.word.de}</span>
              <Gems n={m} of={4} label={MASTERY[m]} />
            </Link>
          );
        })}
      </div>
      {list.length > limit && (
        <button type="button" className="btn secondary block" style={{ marginTop: 12 }} onClick={() => setLimit((x) => x + PAGE)}>
          Mehr anzeigen ({list.length - limit})
        </button>
      )}
      {list.length === 0 && <p className="muted center">Keine Einträge.</p>}

      <div className="section-title">
        <h2>Eigene Einträge</h2>
        <button type="button" className="btn ghost small" onClick={() => setShowCustom((v) => !v)}>
          {showCustom ? 'schließen' : 'hinzufügen'}
        </button>
      </div>
      {showCustom && (
        <div className="card">
          <input className="input" placeholder="Spanisch, z. B. la sandía" value={es} onChange={(e) => setEs(e.target.value)} lang="es" style={{ marginBottom: 8 }} />
          <input className="input" placeholder="Deutsch, z. B. die Wassermelone" value={de} onChange={(e) => setDe(e.target.value)} style={{ marginBottom: 10 }} />
          <button type="button" className="btn block" onClick={addCustom} disabled={!es.trim() || !de.trim()}>
            <Icon name="mas_add" size={16} /> Zum Dex hinzufügen
          </button>
        </div>
      )}
      {s.custom.length > 0 && (
        <div className="list">
          {s.custom.map((c) => (
            <div key={c.key} className="list-item">
              <SpeakButton text={c.es} />
              <div className="grow">
                <div className="es">{c.es}</div>
                <div className="small muted">{c.de}</div>
              </div>
              <Gems n={masteryOf(s.cards[c.key])} of={4} />
              <button
                type="button"
                className="icon-btn"
                aria-label="Löschen"
                onClick={() =>
                  setState((cur) => {
                    const next = { ...cur.cards };
                    delete next[c.key];
                    return { ...cur, cards: next, custom: cur.custom.filter((x) => x.key !== c.key) };
                  })
                }
              >
                <Icon name="papelera" size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
