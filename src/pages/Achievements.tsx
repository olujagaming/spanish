import { ACHIEVEMENTS } from '../lib/achievements';
import { useAppState } from '../lib/store';
import { BackLink, PageHead } from '../components/ui';

export default function Achievements() {
  const s = useAppState();
  const got = ACHIEVEMENTS.filter((a) => s.achievements[a.id]).length;
  return (
    <div>
      <BackLink />
      <PageHead kicker="Logros" icon="medalla" title="Deine Erfolge" />
      <p className="muted">
        {got} von {ACHIEVEMENTS.length} freigeschaltet
      </p>
      <div className="grid-2 wide-3">
        {ACHIEVEMENTS.map((a) => {
          const when = s.achievements[a.id];
          return (
            <div key={a.id} className="tile" style={{ opacity: when ? 1 : 0.45, filter: when ? 'none' : 'grayscale(1)' }}>
              <span className="t-emoji">{a.emoji}</span>
              <span className="t-title">{a.title}</span>
              <span className="t-sub">{a.desc}</span>
              {when && <span className="tiny muted">{new Date(when).toLocaleDateString('de-DE')}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
