import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { speak, ttsAvailable } from '../lib/speech';
import { LEVEL_COLORS } from '../content';
import type { LevelId } from '../content/types';
import { onAchievements } from '../lib/store';
import type { Achievement } from '../lib/achievements';
import { useAppState } from '../lib/store';

export function SpeakButton({
  text,
  size,
  slow,
  label,
}: {
  text: string;
  size?: 'lg';
  slow?: boolean;
  label?: string;
}) {
  const [speaking, setSpeaking] = useState(false);
  if (!ttsAvailable()) return null;
  return (
    <button
      type="button"
      className={`icon-btn ${size ?? ''} ${speaking ? 'speaking' : ''}`}
      aria-label={label ?? `Vorlesen: ${text}`}
      title="Anhören"
      onClick={(e) => {
        e.stopPropagation();
        setSpeaking(true);
        speak(text, { rate: slow ? 0.6 : undefined, onEnd: () => setSpeaking(false) });
        setTimeout(() => setSpeaking(false), 4000);
      }}
    >
      {slow ? '🐢' : '🔊'}
    </button>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={`progress ${className ?? ''}`} role="progressbar" aria-valuenow={Math.round(value * 100)}>
      <div style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%` }} />
    </div>
  );
}

export function Tip({ children, icon = '💡' }: { children: ReactNode; icon?: string }) {
  return (
    <div className="tip">
      <span className="tip-ico">{icon}</span>
      <div>{children}</div>
    </div>
  );
}

export function LevelBadge({ level }: { level: LevelId }) {
  return (
    <span className="badge level" style={{ background: LEVEL_COLORS[level] }}>
      {level}
    </span>
  );
}

export function Stars({ n }: { n: number }) {
  return (
    <span className="stars" aria-label={`${n} von 3 Sternen`}>
      {'★'.repeat(n)}
      <span style={{ opacity: 0.25 }}>{'★'.repeat(3 - n)}</span>
    </span>
  );
}

export function BackLink({ to, label = 'Zurück' }: { to?: string; label?: string }) {
  const navigate = useNavigate();
  return (
    <button type="button" className="back-link" onClick={() => (to ? navigate(to) : navigate(-1))}>
      ← {label}
    </button>
  );
}

/** Renders **bold** markup and line breaks from content strings. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split('\n').map((line, i) => (
        <p key={i}>
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : <span key={j}>{part}</span>,
          )}
        </p>
      ))}
    </>
  );
}

/** Shows a regional hint (e.g. LatAm alternative) if enabled in settings. */
export function RegionalNote({ note }: { note?: string }) {
  const { settings } = useAppState();
  if (!note || !settings.showRegional) return null;
  return <span className="note">🌎 {note}</span>;
}

export function AchievementToasts() {
  const [items, setItems] = useState<(Achievement & { uid: number })[]>([]);
  useEffect(
    () =>
      onAchievements((list) => {
        const stamped = list.map((a, i) => ({ ...a, uid: Date.now() + i }));
        setItems((cur) => [...cur, ...stamped]);
        for (const s of stamped) {
          setTimeout(() => setItems((cur) => cur.filter((x) => x.uid !== s.uid)), 4500);
        }
      }),
    [],
  );
  if (!items.length) return null;
  return (
    <div className="toast-wrap" aria-live="polite">
      {items.map((a) => (
        <div className="toast" key={a.uid}>
          <span className="t-emoji">{a.emoji}</span>
          <div>
            <div>Erfolg freigeschaltet: {a.title}</div>
            <div className="small" style={{ opacity: 0.8, fontWeight: 600 }}>
              {a.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Empty({ emoji, children }: { emoji: string; children: ReactNode }) {
  return (
    <div className="empty">
      <div className="big-emoji">{emoji}</div>
      {children}
    </div>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="switch">
      <span className="visually-hidden">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span />
    </label>
  );
}
