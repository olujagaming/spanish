import { Link } from 'react-router-dom';

const ITEMS = [
  { to: '/grammatik', emoji: '🧩', title: 'Grammatik', sub: '30 Themen – kurz erklärt mit Übungen' },
  { to: '/verben', emoji: '🔤', title: 'Verb-Trainer', sub: 'Konjugationstabellen mit Aussprache' },
  { to: '/woerterbuch', emoji: '🔎', title: 'Wörterbuch', sub: 'Alle Wörter der App durchsuchen' },
  { to: '/phrasen', emoji: '🧳', title: 'Reise-Phrasebook', sub: 'Die wichtigsten Sätze für Reise & Notfall' },
  { to: '/falsche-freunde', emoji: '🎭', title: 'Falsche Freunde', sub: 'Wörter, die anders sind, als sie klingen' },
  { to: '/kultur', emoji: '🌍', title: 'Kultur & Regionen', sub: 'Spanien und Lateinamerika verstehen' },
  { to: '/erfolge', emoji: '🏅', title: 'Erfolge', sub: 'Deine Abzeichen' },
  { to: '/statistik', emoji: '📈', title: 'Statistik', sub: 'XP, Serie und Fortschritt' },
  { to: '/einstellungen', emoji: '⚙️', title: 'Einstellungen', sub: 'Stimme, Ziel, Design, Backup' },
];

export default function More() {
  return (
    <div>
      <h1>☰ Mehr</h1>
      <div className="list">
        {ITEMS.map((i) => (
          <Link key={i.to} to={i.to} className="list-item">
            <span style={{ fontSize: '1.6rem' }}>{i.emoji}</span>
            <div className="grow">
              <div style={{ fontWeight: 800 }}>{i.title}</div>
              <div className="small muted">{i.sub}</div>
            </div>
            <span className="muted">›</span>
          </Link>
        ))}
      </div>
      <p className="small muted center" style={{ marginTop: 24 }}>
        ¡Hablemos! · Tipp: Auf dem Handy im Browser-Menü „Zum Startbildschirm hinzufügen“ wählen – dann funktioniert die App wie eine
        normale App, auch offline.
      </p>
    </div>
  );
}
