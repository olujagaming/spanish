import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { setState, useAppState } from '../lib/store';
import { currentStreak, todayXp } from '../lib/state';
import { cardStats, dailyCulture, dailyPhrase, nextLesson } from '../lib/selectors';
import { builtBuildings, BUILDINGS, rankFromXp, REGIONS, unitTitle, type Building } from '../lib/progression';
import { ProgressBar, RankBadge, SpeakButton } from '../components/ui';
import { Icon } from '../components/Icon';
import { Plaza } from '../components/Plaza';
import { BrandMark } from '../components/BrandMark';
import { CONVERSATIONS } from '../content/conversations';

function Welcome() {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(30);
  return (
    <div className="pop" style={{ paddingTop: 12 }}>
      <div className="center" style={{ marginBottom: 18 }}>
        <BrandMark className="result-emblem" />
        <div className="kicker">Bienvenido · Willkommen</div>
        <h1 style={{ fontSize: '2.2rem' }}>Tu viaje empieza aquí</h1>
        <p className="muted">
          Du reist von Madrid bis Cartagena, lernst unterwegs echtes Alltagsspanisch – und baust dir mit jedem Etappenziel deine eigene
          Plaza auf.
        </p>
      </div>
      <div className="card">
        <label className="small muted" htmlFor="name">
          Wie heißt du?
        </label>
        <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dein Name" style={{ margin: '6px 0 16px' }} />
        <div className="small muted" style={{ marginBottom: 8 }}>
          Energía del día – dein tägliches Ziel
        </div>
        <div className="chips" style={{ marginBottom: 18 }}>
          {[
            [10, 'Paseo · 5 Min'],
            [30, 'Viaje · 10 Min'],
            [50, 'Aventura · 15 Min'],
            [80, 'Expedición · 20+ Min'],
          ].map(([v, l]) => (
            <button key={v} type="button" className={`chip ${goal === v ? 'active' : ''}`} onClick={() => setGoal(v as number)}>
              {l}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn block"
          onClick={() => setState((s) => ({ ...s, settings: { ...s.settings, name: name.trim() || 'Viajero', dailyGoal: goal } }))}
        >
          Reise beginnen <Icon name="flecha" size={18} />
        </button>
        <p className="tiny muted center" style={{ marginTop: 12, marginBottom: 0 }}>
          Schon Vorkenntnisse? Auf der Karte kannst du per „Atajo“ ganze Regionen überspringen.
        </p>
      </div>
    </div>
  );
}

export default function Home() {
  const s = useAppState();
  const navigate = useNavigate();
  const [picked, setPicked] = useState<Building | null>(null);
  if (!s.settings.name) return <Welcome />;

  const next = nextLesson(s);
  const cards = cardStats(s);
  const phrase = dailyPhrase();
  const culture = dailyCulture();
  const { rank, next: nextRank, progress } = rankFromXp(s.xp);
  const today = todayXp(s);
  const goalPct = Math.min(100, Math.round((today / s.settings.dailyGoal) * 100));
  const built = builtBuildings(s).length;
  const convo = CONVERSATIONS.find((c) => !s.conversations[c.id] && (!next || c.level <= next.level)) ?? CONVERSATIONS[0];
  const nextBuilding = next ? BUILDINGS.find((b) => b.unitId === next.unitId) : undefined;
  const streak = currentStreak(s);

  return (
    <div>
      <Plaza state={s} onBuilding={setPicked}>
        <div className="plaza-caption">
          <div>
            <div className="kicker">Mi plaza</div>
            <div className="title">La plaza de {s.settings.name}</div>
          </div>
          <span className="stat-pill">
            {built}/{BUILDINGS.length}
          </span>
        </div>
      </Plaza>

      {picked ? (
        <div className="card gold pop">
          <div className="row">
            <div className="spacer">
              <div className="kicker">Etapa completada</div>
              <h3 style={{ margin: 0 }}>{picked.name}</h3>
              <div className="small muted">
                {picked.de} · für „{unitTitle(picked.unitId)}“
              </div>
            </div>
            <button type="button" className="icon-btn" onClick={() => setPicked(null)} aria-label="Schließen">
              <Icon name="cerrar" size={18} />
            </button>
          </div>
          <button type="button" className="btn small" style={{ marginTop: 12 }} onClick={() => navigate(picked.to)}>
            Eintreten <Icon name="flecha" size={16} />
          </button>
        </div>
      ) : (
        <div className="row" style={{ marginBottom: 14 }}>
          <Link to="/tienda" className="btn secondary small">
            <Icon name="tienda" size={16} /> Gestalten
          </Link>
          <span className="small muted">
            {built === 0 ? 'Schließe deine erste Etappe ab – dann entsteht dein erstes Gebäude.' : 'Tippe auf ein Gebäude, um es zu betreten.'}
          </span>
        </div>
      )}

      {next ? (
        <div className="hero">
          <div className="kicker" style={{ color: REGIONS[next.level].color }}>
            <Icon name="brujula" size={14} stroke={2} /> {REGIONS[next.level].place} · Próxima misión
          </div>
          <h2>
            {next.emoji} {next.title}
          </h2>
          <p className="muted small">{next.goal}</p>
          {nextBuilding && (
            <p className="tiny muted" style={{ marginTop: -4 }}>
              Etappenziel: <strong style={{ color: 'var(--text)' }}>{nextBuilding.name}</strong> für deine Plaza
            </p>
          )}
          <Link to={`/mision/${next.id}`} className="btn">
            {Object.keys(s.lessons).length ? 'Continuar' : 'Erste Misión starten'} <Icon name="flecha" size={18} />
          </Link>
        </div>
      ) : (
        <div className="hero">
          <div className="kicker">Fin del viaje</div>
          <h2>¡Eres una leyenda!</h2>
          <p className="muted">Alle Misiones geschafft. Halte deinen Dex frisch und führe Tertulias.</p>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 14 }}>
        <Link to="/estadistica" className="card card-link" style={{ marginBottom: 0 }}>
          <div className="row" style={{ gap: 8 }}>
            <RankBadge index={rank.index} size={42} />
            <div className="spacer">
              <div className="tiny muted">Rang</div>
              <div className="serif" style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                {rank.title}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            <ProgressBar value={progress} className="thin" />
            <div className="tiny muted" style={{ marginTop: 4 }}>
              {nextRank ? `${nextRank.min - s.xp} XP bis ${nextRank.title}` : 'Höchster Rang'}
            </div>
          </div>
        </Link>
        <Link to="/estadistica" className="card card-link" style={{ marginBottom: 0 }}>
          <div className="row" style={{ gap: 8 }}>
            <div className="ring" style={{ ['--p' as string]: goalPct, width: 42, height: 42 }}>
              <span style={{ width: 34, height: 34 }}>
                <Icon name="energia" size={16} />
              </span>
            </div>
            <div className="spacer">
              <div className="tiny muted">Energía</div>
              <div className="serif" style={{ fontSize: '1.05rem', fontWeight: 600 }}>
                {today}/{s.settings.dailyGoal}
              </div>
            </div>
          </div>
          <div className="tiny muted" style={{ marginTop: 12 }}>
            Racha: {streak} {streak === 1 ? 'Tag' : 'Tage'} in Folge
          </div>
        </Link>
      </div>

      <div className="grid-2">
        <Link to={cards.due ? '/repasar' : '/dex'} className="tile">
          <span className="t-emoji">
            <Icon name="tarjetas" size={26} />
          </span>
          <span className="t-title">Repasar</span>
          <span className="t-sub">{cards.due > 0 ? `${cards.due} Wörter wollen wiederholt werden` : cards.total ? 'Alles frisch im Kopf' : 'Dein Dex ist noch leer'}</span>
        </Link>
        <Link to={`/tertulia/${convo.id}`} className="tile">
          <span className="t-emoji">
            <Icon name="tertulia" size={26} />
          </span>
          <span className="t-title">Tertulia</span>
          <span className="t-sub">{convo.title}</span>
        </Link>
        <Link to="/codice" className="tile">
          <span className="t-emoji">
            <Icon name="codice" size={26} />
          </span>
          <span className="t-title">Códice</span>
          <span className="t-sub">Grammatik, kurz und klar</span>
        </Link>
        <Link to="/arena" className="tile">
          <span className="t-emoji">
            <Icon name="arena" size={26} />
          </span>
          <span className="t-title">Arena</span>
          <span className="t-sub">7 Spiele gegen die Uhr</span>
        </Link>
      </div>

      <div className="section-title">
        <h2>Frase del día</h2>
      </div>
      <div className="card">
        <div className="row">
          <SpeakButton text={phrase[0]} />
          <div>
            <div className="es" style={{ fontSize: '1.3rem' }}>
              {phrase[0]}
            </div>
            <div className="muted small">{phrase[1]}</div>
          </div>
        </div>
        <p className="small muted" style={{ marginTop: 10, marginBottom: 0 }}>
          {phrase[2]}
        </p>
      </div>

      <div className="section-title">
        <h2>Cuaderno de viaje</h2>
      </div>
      <Link to="/cultura" className="card card-link">
        <div className="kicker">
          <Icon name="globo" size={14} stroke={2} /> {culture[0]}
        </div>
        <div className="small">{culture[1]}</div>
      </Link>
    </div>
  );
}
