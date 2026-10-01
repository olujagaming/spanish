import { Link } from 'react-router-dom';
import { useState } from 'react';
import { CONVERSATIONS } from '../content/conversations';
import { useAppState } from '../lib/store';
import { LevelBadge } from '../components/ui';
import type { LevelId } from '../content/types';

const LEVELS: (LevelId | 'all')[] = ['all', 'A0', 'A1', 'A2', 'B1', 'B2'];

export default function Conversations() {
  const s = useAppState();
  const [filter, setFilter] = useState<LevelId | 'all'>('all');
  const list = CONVERSATIONS.filter((c) => filter === 'all' || c.level === filter);
  const done = Object.keys(s.conversations).length;
  return (
    <div>
      <h1>💬 Gespräche</h1>
      <p className="muted">
        Echte Alltagssituationen: erst anhören und mitlesen, dann selbst im <strong>Rollenspiel</strong> antworten. {done} von{' '}
        {CONVERSATIONS.length} geführt.
      </p>
      <div className="chips" style={{ marginBottom: 14 }}>
        {LEVELS.map((l) => (
          <button key={l} type="button" className={`chip ${filter === l ? 'active' : ''}`} onClick={() => setFilter(l)}>
            {l === 'all' ? 'Alle' : l}
          </button>
        ))}
      </div>
      <div className="list">
        {list.map((c) => (
          <Link key={c.id} to={`/gespraech/${c.id}`} className="list-item">
            <span style={{ fontSize: '1.8rem' }}>{c.emoji}</span>
            <div className="grow">
              <div style={{ fontWeight: 800 }}>{c.title}</div>
              <div className="small muted">{c.setting}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <LevelBadge level={c.level} />
              {s.conversations[c.id] && <div style={{ color: 'var(--good)', fontWeight: 900 }}>✓</div>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
