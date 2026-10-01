import { CULTURE } from '../content/extras';
import { BackLink } from '../components/ui';

export default function Culture() {
  return (
    <div>
      <BackLink />
      <h1>🌍 Kultur & Regionen</h1>
      <p className="muted small">
        Die App lehrt neutrales Spanisch mit Basis Spanien. Wo es in Lateinamerika anders heißt, siehst du einen 🌎-Hinweis.
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
