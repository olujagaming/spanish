import { CULTURE } from '../content/extras';
import { BackLink, PageHead } from '../components/ui';

export default function Culture() {
  return (
    <div>
      <BackLink />
      <PageHead kicker="Cultura" icon="globo" title="Kultur & Regionen" />
      <p className="muted small">
        Die App lehrt neutrales Spanisch mit Basis Spanien. Wo es in Lateinamerika anders heißt, siehst du einen „LatAm“-Hinweis.
      </p>
      {CULTURE.map(([title, text]) => (
        <div key={title} className="card">
          <h3>{title}</h3>
          <p style={{ margin: 0 }}>{text}</p>
        </div>
      ))}
    </div>
  );
}
