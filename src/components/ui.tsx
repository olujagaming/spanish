import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { speak, ttsAvailable } from '../lib/speech';
import { REGIONS } from '../lib/progression';
import { Icon } from './Icon';
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
      <Icon name={slow ? 'lento' : 'volumen'} size={size === 'lg' ? 32 : 20} />
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

export function Tip({ children, icon = 'brujula' }: { children: ReactNode; icon?: string }) {
  return (
    <div className="tip">
      <span className="tip-ico">
        <Icon name={icon} size={20} />
      </span>
      <div>{children}</div>
    </div>
  );
}

export function LevelBadge({ level }: { level: LevelId }) {
  return (
    <span className="badge level" style={{ color: REGIONS[level].color, borderColor: REGIONS[level].color }}>
      {level}
    </span>
  );
}

/** Diamond "gems" used for lesson results and word mastery. */
export function Gems({ n, of = 3, label }: { n: number; of?: number; label?: string }) {
  return (
    <span className="gems" aria-label={label ?? `${n} von ${of}`}>
      {Array.from({ length: of }, (_, i) => (
        <span key={i} className={`gem ${i < n ? 'on' : ''}`} />
      ))}
    </span>
  );
}

export function PageHead({ kicker, icon, title, children }: { kicker: string; icon?: string; title: string; children?: ReactNode }) {
  return (
    <header className="page-head">
      <div className="kicker">
        {icon && <Icon name={icon} size={14} stroke={2} />}
        {kicker}
      </div>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </header>
  );
}

/** Shield emblem with the rank number. */
export function RankBadge({ index, size = 46 }: { index: number; size?: number }) {
  return (
    <span className="rank-badge" style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M24 3 7 10v12c0 10 7 18.5 17 23 10-4.5 17-13 17-23V10L24 3Z" fill="var(--gold-soft)" />
        <path d="M24 8 12 13v9c0 7.6 5 14 12 17.6C31 36 36 29.6 36 22v-9L24 8Z" opacity=".5" />
      </svg>
      <span style={{ fontSize: size * 0.34 }}>{index + 1}</span>
    </span>
  );
}

export function BackLink({ to, label = 'Zurück' }: { to?: string; label?: string }) {
  const navigate = useNavigate();
  return (
    <button type="button" className="back-link" onClick={() => (to ? navigate(to) : navigate(-1))}>
      <Icon name="atras" size={16} /> {label}
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
  return <span className="note">LatAm · {note.replace(/^LatAm( oft| auch)?:\s*/, '')}</span>;
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
            <div className="tiny" style={{ color: 'var(--gold)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Logro desbloqueado
            </div>
            <div className="serif" style={{ fontSize: '1.05rem' }}>{a.title}</div>
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
