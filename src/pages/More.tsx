import { Link } from 'react-router-dom';
import { PageHead } from '../components/ui';
import { Icon } from '../components/Icon';

const ITEMS = [
  { to: '/tienda', icon: 'tienda', title: 'Tienda', sub: 'Dekorationen für deine Plaza' },
  { to: '/codice', icon: 'codice', title: 'Códice', sub: '30 Grammatik-Themen – kurz erklärt mit Übungen' },
  { to: '/verbos', icon: 'verbos', title: 'Verbos', sub: 'Konjugationstabellen mit Aussprache' },
  { to: '/diccionario', icon: 'buscar', title: 'Diccionario', sub: 'Alle Wörter der Reise durchsuchen' },
  { to: '/frases', icon: 'maleta', title: 'Frases de viaje', sub: 'Die wichtigsten Sätze für Reise & Notfall' },
  { to: '/falsos-amigos', icon: 'mascaras', title: 'Falsos amigos', sub: 'Wörter, die anders sind, als sie klingen' },
  { to: '/cultura', icon: 'globo', title: 'Cultura', sub: 'Spanien und Lateinamerika verstehen' },
  { to: '/logros', icon: 'medalla', title: 'Logros', sub: 'Deine Erfolge' },
  { to: '/estadistica', icon: 'grafica', title: 'Estadística', sub: 'Rang, Racha und Fortschritt' },
  { to: '/ajustes', icon: 'ajustes', title: 'Ajustes', sub: 'Stimme, Ziel, Design, Backup' },
];

export default function More() {
  return (
    <div>
      <PageHead kicker="Más" icon="mas" title="Alles weitere" />
      <div className="list">
        {ITEMS.map((i) => (
          <Link key={i.to} to={i.to} className="list-item">
            <span className="list-ico">
              <Icon name={i.icon} size={20} />
            </span>
            <div className="grow">
              <div className="serif" style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                {i.title}
              </div>
              <div className="small muted">{i.sub}</div>
            </div>
            <Icon name="flecha" size={16} className="muted" />
          </Link>
        ))}
      </div>
      <p className="small muted center" style={{ marginTop: 24 }}>
        Tipp: Im Browser-Menü „Zum Startbildschirm hinzufügen“ wählen – dann läuft Hablemos wie eine App, auch offline.
      </p>
    </div>
  );
}
