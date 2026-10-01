import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { getState, setState } from '../../lib/store';
import { addXp } from '../../lib/state';
import { playSound } from '../../lib/sound';
import { Icon } from '../../components/Icon';

export interface GameInfo {
  id: string;
  title: string;
  emoji: string;
  desc: string;
}

export const GAMES: GameInfo[] = [
  { id: 'memory', title: 'Memoria', emoji: 'tarjetas', desc: 'Finde die Paare aus Spanisch und Deutsch.' },
  { id: 'blitz', title: 'Relámpago', emoji: 'energia', desc: '60 Sekunden – so viele Wörter wie möglich!' },
  { id: 'ahorcado', title: 'El Ahorcado', emoji: 'candado', desc: 'Galgenmännchen: Errate das spanische Wort.' },
  { id: 'satzbau', title: 'Constructor', emoji: 'codice', desc: 'Bring die Wörter in die richtige Reihenfolge.' },
  { id: 'hoeren', title: 'Oído fino', emoji: 'volumen', desc: 'Hör genau hin und tippe, was du hörst.' },
  { id: 'konjugation', title: 'Duelo de verbos', emoji: 'verbos', desc: 'Konjugiere Verben gegen die Uhr.' },
  { id: 'wortregen', title: 'Lluvia de palabras', emoji: 'brujula', desc: 'Übersetze die fallenden Wörter, bevor sie unten ankommen.' },
];

/** Saves the result and returns whether it is a new highscore. */
export function finishGame(id: string, score: number): boolean {
  const prev = getState().highscores[id] ?? 0;
  const record = score > prev;
  setState((s) =>
    addXp(
      {
        ...s,
        highscores: { ...s.highscores, [id]: Math.max(prev, score) },
        stats: { ...s.stats, gamesPlayed: s.stats.gamesPlayed + 1 },
      },
      Math.min(25, 5 + Math.floor(score / 2)),
    ),
  );
  playSound('done');
  return record;
}

export function GameOver({ id, score, unit = 'Punkte', onRestart }: { id: string; score: number; unit?: string; onRestart: () => void }) {
  const navigate = useNavigate();
  const [record, setRecord] = useState(false);
  const saved = useRef(false);
  useEffect(() => {
    if (saved.current) return;
    saved.current = true;
    setRecord(finishGame(id, score));
  }, [id, score]);
  const best = Math.max(getState().highscores[id] ?? 0, score);
  return (
    <div className="center" style={{ paddingTop: 30 }}>
      <div className="result-emblem" style={{ display: 'grid', placeItems: 'center' }}>
        <Icon name={record ? 'medalla' : 'arena'} size={84} stroke={1.2} />
      </div>
      <h1>{record ? '¡Nuevo récord!' : '¡Fin del juego!'}</h1>
      <p style={{ fontSize: '1.4rem', fontWeight: 900 }}>
        {score} {unit}
      </p>
      <p className="muted">Bestwert: {best}</p>
      <div className="list">
        <button type="button" className="btn block" onClick={onRestart}>
          Nochmal spielen
        </button>
        <button type="button" className="btn secondary block" onClick={() => navigate('/arena')}>
          Andere Spiele
        </button>
      </div>
    </div>
  );
}

export function GameHeader({ title, children }: { title: string; children?: ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="lesson-top">
      <button type="button" className="icon-btn" onClick={() => navigate('/arena')} aria-label="Beenden">
        <Icon name="cerrar" size={18} />
      </button>
      <div className="spacer" style={{ fontWeight: 800 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export function useCountdown(seconds: number, running: boolean, onEnd: () => void) {
  const [left, setLeft] = useState(seconds);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;
  useEffect(() => {
    if (!running) return;
    if (left <= 0) {
      endRef.current();
      return;
    }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, running]);
  return [left, setLeft] as const;
}
