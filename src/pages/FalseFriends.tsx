import { FALSE_FRIENDS } from '../content/extras';
import { BackLink, SpeakButton } from '../components/ui';

export default function FalseFriends() {
  return (
    <div>
      <BackLink />
      <h1>🎭 Falsche Freunde</h1>
      <p className="muted small">Diese Wörter klingen vertraut – bedeuten aber etwas anderes. Hier lauern die lustigsten Missverständnisse!</p>
      <div className="list">
        {FALSE_FRIENDS.map(([es, means, notMeans, instead]) => (
          <div key={es} className="card flat" style={{ marginBottom: 0 }}>
            <div className="row">
              <SpeakButton text={es} />
              <div className="es" style={{ fontSize: '1.15rem' }}>
                {es}
              </div>
            </div>
            <div style={{ marginTop: 6 }}>
              ✅ heißt: <strong>{means}</strong>
            </div>
            <div className="small muted">
              ❌ nicht: {notMeans} → dafür sagt man <strong>{instead}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
