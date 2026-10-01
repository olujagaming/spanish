import { useMemo, useState } from 'react';
import { getState } from '../../lib/store';
import { learnedWords } from '../../lib/selectors';
import { shuffle } from '../../lib/exercises';
import { speak } from '../../lib/speech';
import { playSound } from '../../lib/sound';
import { GameHeader, GameOver } from './shared';

const LETTERS = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
const MAX_MISSES = 7;
const STAGES = ['😀', '🙂', '😐', '😕', '😟', '😨', '😱', '💀'];

/** Letter without accent (á → A) so players don't need accent keys. */
const base = (ch: string) => (ch === 'ñ' || ch === 'Ñ' ? 'Ñ' : ch.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase());

export default function Ahorcado({ onRestart }: { onRestart: () => void }) {
  const words = useMemo(
    () =>
      shuffle(learnedWords(getState())).filter((w) => {
        const core = w.es.replace(/^(el|la|los|las|un|una) /, '');
        return /^[a-záéíóúüñ ]+$/i.test(core) && core.length >= 4 && core.length <= 14;
      }),
    [],
  );
  const [round, setRound] = useState(0);
  const [guessed, setGuessed] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const word = words[round % Math.max(1, words.length)];
  const target = word ? word.es.replace(/^(el|la|los|las|un|una) /, '') : '';
  const letters = target.split('');
  const misses = guessed.filter((g) => !letters.some((l) => base(l) === g)).length;
  const solved = letters.every((l) => l === ' ' || guessed.includes(base(l)));
  const lost = misses >= MAX_MISSES;

  if (!word || lives <= 0) return <GameOver id="ahorcado" score={score} unit="Wörter" onRestart={onRestart} />;

  const guess = (g: string) => {
    if (guessed.includes(g) || solved || lost) return;
    const next = [...guessed, g];
    setGuessed(next);
    const hit = letters.some((l) => base(l) === g);
    playSound(hit ? 'tap' : 'bad');
    const nowSolved = letters.every((l) => l === ' ' || next.includes(base(l)));
    if (nowSolved) {
      playSound('good');
      speak(word.es);
      setScore((s) => s + 1);
    }
    const nowMisses = next.filter((x) => !letters.some((l) => base(l) === x)).length;
    if (nowMisses >= MAX_MISSES) {
      speak(word.es);
      setLives((l) => l - 1);
    }
  };

  const nextWord = () => {
    setRound((r) => r + 1);
    setGuessed([]);
  };

  return (
    <div>
      <GameHeader title="🪢 El Ahorcado">
        <span className="stat-pill hearts">{'❤️'.repeat(lives)}</span>
        <span className="stat-pill">⭐ {score}</span>
      </GameHeader>
      <div className="card center">
        <div style={{ fontSize: '3rem' }}>{STAGES[Math.min(misses, MAX_MISSES)]}</div>
        <div className="small muted">
          Fehlversuche: {misses}/{MAX_MISSES}
        </div>
        <div className="muted" style={{ marginTop: 8 }}>
          Hinweis: <strong>{word.de}</strong>
        </div>
        <div className="hangman-word">
          {letters.map((l, i) =>
            l === ' ' ? (
              <span key={i} className="space">
                {' '}
              </span>
            ) : (
              <span key={i}>{guessed.includes(base(l)) || lost ? l.toUpperCase() : ' '}</span>
            ),
          )}
        </div>
        {(solved || lost) && (
          <div>
            <p style={{ fontWeight: 800, color: solved ? 'var(--good)' : 'var(--bad)' }}>
              {solved ? '¡Correcto! 🎉' : `Schade! Es war: ${word.es}`}
            </p>
            <button type="button" className="btn" onClick={nextWord}>
              Nächstes Wort →
            </button>
          </div>
        )}
      </div>
      {!solved && !lost && (
        <div className="keyboard">
          {LETTERS.map((l) => {
            const used = guessed.includes(l);
            const hit = used && letters.some((x) => base(x) === l);
            return (
              <button key={l} type="button" className={used ? (hit ? 'hit' : 'miss') : ''} disabled={used} onClick={() => guess(l)}>
                {l}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
