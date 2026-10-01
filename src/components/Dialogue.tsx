import { useEffect, useRef, useState } from 'react';
import { speak, stopSpeaking } from '../lib/speech';

export type Line = readonly [speaker: string, es: string, de: string];

function initials(name: string) {
  return name === 'Tú' ? 'Du' : name.slice(0, 2);
}

/** Chat-style dialogue with tap-to-listen and optional translation. */
export function Dialogue({ lines, me = 'Tú', showDe }: { lines: readonly Line[]; me?: string; showDe: boolean }) {
  const [playing, setPlaying] = useState<number | null>(null);
  const cancelled = useRef(false);

  useEffect(
    () => () => {
      cancelled.current = true;
      stopSpeaking();
    },
    [],
  );

  const playFrom = (i: number) => {
    cancelled.current = false;
    if (i >= lines.length) return setPlaying(null);
    setPlaying(i);
    speak(lines[i][1], {
      onEnd: () => {
        if (!cancelled.current) setTimeout(() => playFrom(i + 1), 350);
      },
    });
  };

  return (
    <div>
      <div className="row" style={{ marginBottom: 12 }}>
        <button
          type="button"
          className="btn small secondary"
          onClick={() => {
            if (playing !== null) {
              cancelled.current = true;
              stopSpeaking();
              setPlaying(null);
            } else playFrom(0);
          }}
        >
          {playing !== null ? '⏹ Stopp' : '▶️ Ganzes Gespräch anhören'}
        </button>
      </div>
      {lines.map(([who, es, de], i) => (
        <div key={i} className={`bubble-row ${who === me ? 'me' : ''}`}>
          <div className="avatar" title={who}>
            {initials(who)}
          </div>
          <div
            className={`speech ${playing === i ? 'playing' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => {
              cancelled.current = true;
              setPlaying(null);
              speak(es);
            }}
          >
            <div className="tiny muted" style={{ fontWeight: 800 }}>
              {who}
            </div>
            <div className="es" style={{ fontWeight: 700 }}>
              {es}
            </div>
            {showDe && <div className="de">{de}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
