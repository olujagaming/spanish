import { Link } from 'react-router-dom';
import { useAppState } from '../lib/store';
import { GAMES } from './games/shared';
import { learnedWords } from '../lib/selectors';

export default function Games() {
  const s = useAppState();
  const pool = learnedWords(s).length;
  return (
    <div>
      <h1>🎮 Spiele</h1>
      <p className="muted">
        Lernen mit Spaß! Die Spiele benutzen die Wörter aus deinen abgeschlossenen Lektionen ({pool} Wörter) – je mehr du lernst, desto
        abwechslungsreicher wird es.
      </p>
      <div className="grid-2">
        {GAMES.map((g) => (
          <Link key={g.id} to={`/spiele/${g.id}`} className="tile">
            <span className="t-emoji">{g.emoji}</span>
            <span className="t-title">{g.title}</span>
            <span className="t-sub">{g.desc}</span>
            {s.highscores[g.id] !== undefined && <span className="badge">🏆 {s.highscores[g.id]}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
