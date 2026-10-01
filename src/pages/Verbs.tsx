import { useState } from 'react';
import { Link } from 'react-router-dom';
import { VERBS } from '../content/verbs';
import { fold } from '../lib/answer';
import { BackLink } from '../components/ui';

export default function Verbs() {
  const [q, setQ] = useState('');
  const list = VERBS.filter((v) => !q || fold(v.inf).includes(fold(q)) || fold(v.de).includes(fold(q)));
  return (
    <div>
      <BackLink />
      <h1>🔤 Verb-Trainer</h1>
      <p className="muted small">
        {VERBS.length} wichtige Verben. Tippe ein Verb an, um alle Zeiten zu sehen. Zum Üben gegen die Uhr:{' '}
        <Link to="/spiele/konjugation">Konjugations-Duell</Link>.
      </p>
      <input className="input" placeholder="Verb suchen …" value={q} onChange={(e) => setQ(e.target.value)} style={{ marginBottom: 12 }} />
      <div className="list">
        {list.map((v) => (
          <Link key={v.inf} to={`/verben/${encodeURIComponent(v.inf)}`} className="list-item">
            <div className="grow">
              <span className="es">{v.inf}</span> <span className="muted small">– {v.de}</span>
            </div>
            {(v.yo || v.pret || v.fut || v.over || v.stem) && <span className="badge">unregelmäßig</span>}
            <span className="muted">›</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
