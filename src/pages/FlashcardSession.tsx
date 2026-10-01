import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getState, setState } from '../lib/store';
import { cardItem, dueKeys, type CardItem } from '../lib/selectors';
import { addXp, reviewCard } from '../lib/state';
import { newCard, previewLabel, type Rating } from '../lib/srs';
import { ProgressBar, RegionalNote, SpeakButton } from '../components/ui';
import { speak } from '../lib/speech';
import { WORDS } from '../content';
import { sample, shuffle } from '../lib/exercises';
import { playSound } from '../lib/sound';

type Dir = 'es-de' | 'de-es' | 'listen';

export default function FlashcardSession() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const mode = params.get('mode') ?? 'due';
  const level = params.get('level');
  const [dir, setDir] = useState<Dir>((params.get('dir') as Dir) ?? 'es-de');

  // Build the deck once.
  const deck = useMemo<CardItem[]>(() => {
    const s = getState();
    if (mode === 'level' && level) {
      return sample(
        WORDS.filter((w) => w.level === level).map((w) => ({ key: w.key, es: w.es, de: w.de, note: w.note, level: w.level })),
        20,
      );
    }
    if (mode === 'all') {
      return shuffle(Object.keys(s.cards))
        .slice(0, 20)
        .map((k) => cardItem(s, k))
        .filter((x): x is CardItem => !!x);
    }
    return dueKeys(s)
      .slice(0, 50)
      .map((k) => cardItem(s, k))
      .filter((x): x is CardItem => !!x);
  }, [mode, level]);

  const [queue, setQueue] = useState<CardItem[]>(deck);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(0);
  const [again, setAgain] = useState(0);
  const card = queue[0];
  const scheduled = mode === 'due';

  useEffect(() => {
    if (!card) return;
    if (dir === 'listen' || (dir === 'es-de' && getState().settings.autoplay)) speak(card.es);
  }, [card, dir]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!card) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && ['1', '2', '3', '4'].includes(e.key)) rate((Number(e.key) - 1) as Rating);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  const rate = (r: Rating) => {
    if (!card) return;
    if (scheduled) setState((s) => reviewCard(s, card.key, r));
    else setState((s) => ({ ...s, stats: { ...s.stats, reviews: s.stats.reviews + 1 } }));
    playSound(r === 0 ? 'bad' : 'tap');
    setFlipped(false);
    setDone((d) => d + 1);
    if (r === 0) {
      setAgain((a) => a + 1);
      setQueue((q) => [...q.slice(1), q[0]]);
    } else {
      setQueue((q) => q.slice(1));
    }
  };

  useEffect(() => {
    if (queue.length === 0 && done > 0) {
      playSound('done');
      setState((s) => addXp(s, Math.min(30, 5 + Math.floor(done / 2))));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue.length === 0]);

  if (!card) {
    return (
      <div className="center" style={{ paddingTop: 40 }}>
        <div className="confetti">🎉</div>
        <h1>{done ? '¡Terminado!' : 'Keine Karten'}</h1>
        <p className="muted">
          {done ? `${done} Wiederholungen – ${again}× nochmal. Super gemacht!` : 'Gerade ist nichts fällig. Komm später wieder!'}
        </p>
        <Link to="/karten" className="btn block">
          Zurück zu den Karten
        </Link>
      </div>
    );
  }

  const srs = getState().cards[card.key] ?? newCard();
  const front =
    dir === 'listen' ? (
      <>
        <SpeakButton text={card.es} size="lg" />
        <div className="muted small">Was hörst du? Was bedeutet es?</div>
      </>
    ) : dir === 'es-de' ? (
      <>
        <div className="word">{card.es}</div>
        <SpeakButton text={card.es} />
      </>
    ) : (
      <>
        <div className="word">{card.de}</div>
        <div className="muted small">Wie heißt das auf Spanisch?</div>
      </>
    );

  const total = done + queue.length;

  return (
    <div>
      <div className="lesson-top">
        <button type="button" className="icon-btn" onClick={() => navigate('/karten')} aria-label="Beenden">
          ✕
        </button>
        <ProgressBar value={done / Math.max(1, total)} />
        <span className="small muted">{queue.length}</span>
      </div>
      <div className="chips" style={{ justifyContent: 'center' }}>
        {(
          [
            ['es-de', 'ES → DE'],
            ['de-es', 'DE → ES'],
            ['listen', '👂 Hören'],
          ] as const
        ).map(([d, l]) => (
          <button key={d} type="button" className={`chip ${dir === d ? 'active' : ''}`} onClick={() => setDir(d)}>
            {l}
          </button>
        ))}
      </div>

      <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped((f) => !f)}>
        <div className="inner">
          <div className="face">{front}</div>
          <div className="face back">
            <div className="word">{card.es}</div>
            <SpeakButton text={card.es} />
            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{card.de}</div>
            <RegionalNote note={card.note} />
          </div>
        </div>
      </div>

      {!flipped ? (
        <button type="button" className="btn block" onClick={() => setFlipped(true)}>
          Antwort zeigen
        </button>
      ) : (
        <>
          <p className="center small muted">Wie gut wusstest du es?</p>
          <div className="rate-grid">
            {(
              [
                [0, 'Nochmal', 'bad'],
                [1, 'Schwer', 'secondary'],
                [2, 'Gut', 'good'],
                [3, 'Leicht', ''],
              ] as const
            ).map(([r, label, cls]) => (
              <button key={r} type="button" className={`btn ${cls}`} onClick={() => rate(r)}>
                {label}
                {scheduled && <small>{previewLabel(srs, r)}</small>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
