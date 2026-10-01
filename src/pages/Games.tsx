import { PageHead } from '../components/ui';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useAppState } from '../lib/store';
import { GAMES } from './games/shared';
import { learnedWords } from '../lib/selectors';

export default function Games() {
  const s = useAppState();
  const pool = learnedWords(s).length;
  return (
    <div>
      <PageHead kicker="Arena" icon="arena" title="Spiele" />
      <p className="muted">
        Kurze Duelle gegen die Uhr. Die Spiele benutzen die Wörter aus deinen abgeschlossenen Lektionen ({pool} Wörter) – je mehr du lernst, desto
        abwechslungsreicher wird es.
      </p>
      <div className="grid-2">
        {GAMES.map((g) => (
          <Link key={g.id} to={`/arena/${g.id}`} className="tile">
            <span className="t-emoji">
              <Icon name={g.emoji} size={26} />
            </span>
            <span className="t-title">{g.title}</span>
            <span className="t-sub">{g.desc}</span>
            {s.highscores[g.id] !== undefined && <span className="badge">Récord · {s.highscores[g.id]}</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
