import { PHRASEBOOK } from '../content/extras';
import { BackLink, SpeakButton } from '../components/ui';

export default function Phrasebook() {
  return (
    <div>
      <BackLink />
      <h1>🧳 Reise-Phrasebook</h1>
      <p className="muted small">Die wichtigsten Sätze zum schnellen Nachschlagen – zum Beispiel unterwegs, auch offline.</p>
      {PHRASEBOOK.map((cat) => (
        <section key={cat.id}>
          <h2 style={{ marginTop: 20 }}>
            {cat.emoji} {cat.title}
          </h2>
          <div className="list">
            {cat.phrases.map(([es, de]) => (
              <div key={es} className="list-item">
                <SpeakButton text={es} />
                <div className="grow">
                  <div className="es">{es}</div>
                  <div className="small muted">{de}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
