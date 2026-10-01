import { useAppState } from '../lib/store';
import { currentStreak, levelFromXp } from '../lib/state';
import { cardStats, levelProgress, weekXp } from '../lib/selectors';
import { BackLink, LevelBadge, ProgressBar } from '../components/ui';
import { LEVEL_SOURCES } from '../content';
import { CONVERSATIONS } from '../content/conversations';
import { GRAMMAR } from '../content/grammar';

export default function Stats() {
  const s = useAppState();
  const lvl = levelFromXp(s.xp);
  const week = weekXp(s);
  const max = Math.max(s.settings.dailyGoal, ...week.map((d) => d.xp));
  const cards = cardStats(s);

  return (
    <div>
      <BackLink />
      <h1>📈 Statistik</h1>
      <div className="grid-3" style={{ marginBottom: 14 }}>
        <div className="stat-box">
          <div className="num">🔥 {currentStreak(s)}</div>
          <div className="lbl">Tage Serie (Rekord {s.bestStreak})</div>
        </div>
        <div className="stat-box">
          <div className="num">{s.xp}</div>
          <div className="lbl">XP gesamt</div>
        </div>
        <div className="stat-box">
          <div className="num">{lvl.level}</div>
          <div className="lbl">Level</div>
        </div>
      </div>
      <div className="card">
        <div className="small" style={{ fontWeight: 800, marginBottom: 6 }}>
          Level {lvl.level} → {lvl.level + 1}: {lvl.into}/{lvl.needed} XP
        </div>
        <ProgressBar value={lvl.into / lvl.needed} className="accent" />
      </div>

      <div className="card">
        <h3>Letzte 7 Tage</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140 }} role="img" aria-label="XP der letzten 7 Tage">
          {week.map((d, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
              <span className="tiny muted">{d.xp || ''}</span>
              <div
                style={{
                  width: '100%',
                  maxWidth: 34,
                  height: `${Math.max(3, (d.xp / max) * 100)}%`,
                  borderRadius: '6px 6px 2px 2px',
                  background: d.xp >= s.settings.dailyGoal ? 'var(--good)' : d.xp ? 'var(--accent)' : 'var(--border)',
                }}
              />
              <span className="tiny muted">{d.day}</span>
            </div>
          ))}
        </div>
        <p className="tiny muted" style={{ marginTop: 8, marginBottom: 0 }}>
          Grün = Tagesziel ({s.settings.dailyGoal} XP) erreicht
        </p>
      </div>

      <div className="card">
        <h3>Lektionen</h3>
        {LEVEL_SOURCES.map((l) => {
          const p = levelProgress(s, l.id);
          return (
            <div key={l.id} className="row" style={{ marginBottom: 8 }}>
              <LevelBadge level={l.id} />
              <div className="spacer">
                <ProgressBar value={p.done / p.total} className="thin" />
              </div>
              <span className="small">
                {p.done}/{p.total}
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid-2">
        <div className="stat-box">
          <div className="num">{cards.total}</div>
          <div className="lbl">Karteikarten ({cards.mastered} gefestigt)</div>
        </div>
        <div className="stat-box">
          <div className="num">{s.stats.reviews}</div>
          <div className="lbl">Wiederholungen</div>
        </div>
        <div className="stat-box">
          <div className="num">
            {Object.keys(s.conversations).length}/{CONVERSATIONS.length}
          </div>
          <div className="lbl">Gespräche</div>
        </div>
        <div className="stat-box">
          <div className="num">
            {Object.keys(s.grammar).length}/{GRAMMAR.length}
          </div>
          <div className="lbl">Grammatik-Themen</div>
        </div>
        <div className="stat-box">
          <div className="num">{s.stats.gamesPlayed}</div>
          <div className="lbl">Spiele gespielt</div>
        </div>
        <div className="stat-box">
          <div className="num">{s.stats.perfectLessons}</div>
          <div className="lbl">Perfekte Lektionen</div>
        </div>
      </div>
    </div>
  );
}
