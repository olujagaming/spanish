import { Link } from 'react-router-dom';
import { useState } from 'react';
import { setState, useAppState } from '../lib/store';
import { currentStreak, levelFromXp, todayXp } from '../lib/state';
import { cardStats, dailyCulture, dailyPhrase, levelProgress, nextLesson } from '../lib/selectors';
import { LevelBadge, ProgressBar, SpeakButton } from '../components/ui';
import { CONVERSATIONS } from '../content/conversations';
import { LEVEL_SOURCES } from '../content';

function Welcome() {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState(30);
  return (
    <div className="card pop">
      <div className="big-emoji">👋</div>
      <h1>¡Bienvenido! Willkommen!</h1>
      <p>
        Mit <strong>¡Hablemos!</strong> lernst du natürliches Alltagsspanisch – ganz von vorne bis zu einem fortgeschrittenen Niveau.
        Ein paar Minuten am Tag reichen.
      </p>
      <label className="small muted" htmlFor="name">
        Wie heißt du? (optional)
      </label>
      <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Dein Name" style={{ marginBottom: 14 }} />
      <div className="small muted" style={{ marginBottom: 6 }}>
        Tagesziel
      </div>
      <div className="chips" style={{ marginBottom: 18 }}>
        {[
          [10, 'Locker · 5 Min'],
          [30, 'Normal · 10 Min'],
          [50, 'Ernsthaft · 15 Min'],
          [80, 'Intensiv · 20+ Min'],
        ].map(([v, l]) => (
          <button key={v} type="button" className={`chip ${goal === v ? 'active' : ''}`} onClick={() => setGoal(v as number)}>
            {l}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn block"
        onClick={() => setState((s) => ({ ...s, settings: { ...s.settings, name: name.trim() || '¡Amigo!', dailyGoal: goal } }))}
      >
        ¡Vamos! Los geht’s
      </button>
      <p className="small muted center" style={{ marginTop: 12 }}>
        Du kannst schon etwas? Im Lernpfad kannst du per Test ganze Stufen überspringen.
      </p>
    </div>
  );
}

export default function Home() {
  const s = useAppState();
  if (!s.settings.name) return <Welcome />;

  const next = nextLesson(s);
  const cards = cardStats(s);
  const phrase = dailyPhrase();
  const culture = dailyCulture();
  const lvl = levelFromXp(s.xp);
  const today = todayXp(s);
  const goalPct = Math.min(100, Math.round((today / s.settings.dailyGoal) * 100));
  const convo = CONVERSATIONS.find((c) => !s.conversations[c.id] && (!next || c.level <= next.level)) ?? CONVERSATIONS[0];
  const hour = new Date().getHours();
  const greet = hour < 12 ? '¡Buenos días' : hour < 20 ? '¡Buenas tardes' : '¡Buenas noches';

  return (
    <div>
      <div className="hero">
        <div className="deco">🇪🇸</div>
        <div className="small" style={{ opacity: 0.9, fontWeight: 700 }}>
          {greet}, {s.settings.name}!
        </div>
        {next ? (
          <>
            <h1>
              {next.emoji} {next.title}
            </h1>
            <p style={{ opacity: 0.92 }}>{next.goal}</p>
            <Link to={`/lektion/${next.id}`} className="btn">
              {Object.keys(s.lessons).length ? 'Weiterlernen' : 'Erste Lektion starten'} →
            </Link>
          </>
        ) : (
          <>
            <h1>¡Felicidades! 🎓</h1>
            <p>Du hast alle Lektionen geschafft. Wiederhole mit Karteikarten, Gesprächen und Spielen!</p>
          </>
        )}
      </div>

      <div className="card">
        <div className="row">
          <div className="ring" style={{ ['--p' as string]: goalPct }}>
            <span>{goalPct}%</span>
          </div>
          <div className="spacer">
            <div style={{ fontWeight: 800 }}>{goalPct >= 100 ? 'Tagesziel geschafft! 🎉' : 'Tagesziel'}</div>
            <div className="small muted">
              {today} / {s.settings.dailyGoal} XP heute · 🔥 {currentStreak(s)} Tage in Folge
            </div>
            <div className="small muted">
              Level {lvl.level} · {s.xp} XP gesamt
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        <Link to="/karten" className="tile">
          <span className="t-emoji">🗂️</span>
          <span className="t-title">Karteikarten</span>
          <span className="t-sub">{cards.due > 0 ? `${cards.due} fällig heute` : cards.total ? 'Alles wiederholt ✓' : 'Noch keine Karten'}</span>
        </Link>
        <Link to={`/gespraech/${convo.id}`} className="tile">
          <span className="t-emoji">{convo.emoji}</span>
          <span className="t-title">Gespräch</span>
          <span className="t-sub">{convo.title}</span>
        </Link>
        <Link to="/grammatik" className="tile">
          <span className="t-emoji">🧩</span>
          <span className="t-title">Grammatik</span>
          <span className="t-sub">{Object.keys(s.grammar).length} Themen geübt</span>
        </Link>
        <Link to="/spiele" className="tile">
          <span className="t-emoji">🎮</span>
          <span className="t-title">Spielen</span>
          <span className="t-sub">Memory, Quiz, Galgenmännchen …</span>
        </Link>
      </div>

      <div className="section-title">
        <h2>Frase del día</h2>
      </div>
      <div className="card">
        <div className="row">
          <SpeakButton text={phrase[0]} />
          <div>
            <div className="es" style={{ fontSize: '1.2rem' }}>
              {phrase[0]}
            </div>
            <div className="muted">{phrase[1]}</div>
          </div>
        </div>
        <p className="small" style={{ marginTop: 10, marginBottom: 0 }}>
          {phrase[2]}
        </p>
      </div>

      <div className="section-title">
        <h2>Dein Fortschritt</h2>
        <Link to="/lernen" className="small">
          Lernpfad →
        </Link>
      </div>
      <div className="card">
        {LEVEL_SOURCES.map((l) => {
          const p = levelProgress(s, l.id);
          return (
            <div key={l.id} className="row" style={{ marginBottom: 10 }}>
              <LevelBadge level={l.id} />
              <div className="spacer">
                <div className="small" style={{ fontWeight: 700 }}>
                  {l.title} <span className="muted">· {p.done}/{p.total}</span>
                </div>
                <ProgressBar value={p.done / p.total} className="thin" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="section-title">
        <h2>Wusstest du?</h2>
      </div>
      <Link to="/kultur" className="card card-link tinted">
        <div style={{ fontWeight: 800, marginBottom: 4 }}>🌍 {culture[0]}</div>
        <div className="small">{culture[1]}</div>
      </Link>
    </div>
  );
}
