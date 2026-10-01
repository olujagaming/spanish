import { Link } from 'react-router-dom';
import { GRAMMAR } from '../content/grammar';
import { useAppState } from '../lib/store';
import { LevelBadge, PageHead } from '../components/ui';

export default function GrammarList({ embedded }: { embedded?: boolean }) {
  const s = useAppState();
  return (
    <div>
      {!embedded && <PageHead kicker="Códice" icon="codice" title="Grammatik" />}
      <p className="muted">
        Kurze, alltagsnahe Erklärungen mit Beispielen und Mini-Übungen. Grammatik hilft – aber Sprechen ist wichtiger! Lies ein Thema,
        wenn es in einer Lektion auftaucht.
      </p>
      <div className="list">
        {GRAMMAR.map((g) => {
          const p = s.grammar[g.id];
          return (
            <Link key={g.id} to={`/codice/${g.id}`} className="list-item">
              <span className="big-emoji" style={{ fontSize: '1.8rem' }}>
                {g.emoji}
              </span>
              <div className="grow">
                <div style={{ fontWeight: 800 }}>{g.title}</div>
                <div className="small muted">{g.summary}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <LevelBadge level={g.level} />
                {p && <div className="tiny" style={{ marginTop: 4, color: 'var(--good)', fontWeight: 800 }}>✓ {Math.round(p.best * 100)}%</div>}
              </div>
            </Link>
          );
        })}
      </div>
      <Link to="/verbos" className="card card-link tinted" style={{ marginTop: 16 }}>
        <div style={{ fontWeight: 800 }}>🔤 Verb-Trainer</div>
        <div className="small muted">Konjugationstabellen für 78 Verben in allen wichtigen Zeiten – mit Aussprache.</div>
      </Link>
    </div>
  );
}
