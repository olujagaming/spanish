import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CONVERSATIONS, getConversation } from '../content/conversations';
import type { ConversationSource } from '../content/types';
import { BackLink, LevelBadge, SpeakButton, Tip } from '../components/ui';
import { Dialogue } from '../components/Dialogue';
import { shuffle } from '../lib/exercises';
import { listen, recognitionAvailable, speak, stopSpeaking } from '../lib/speech';
import { fold } from '../lib/answer';
import { playSound } from '../lib/sound';
import { setState } from '../lib/store';
import { addCards, addXp } from '../lib/state';
import { keyOf } from '../lib/answer';

const LEVELS = ['A0', 'A1', 'A2', 'B1', 'B2'];

/** Wrong reply options: learner lines from other conversations of a similar level. */
function distractorPool(c: ConversationSource): string[] {
  const li = LEVELS.indexOf(c.level);
  return CONVERSATIONS.filter((o) => o.id !== c.id && Math.abs(LEVELS.indexOf(o.level) - li) <= 1).flatMap((o) =>
    o.lines.filter(([s]) => s === o.you).map(([, es]) => es),
  );
}

function Roleplay({ c }: { c: ConversationSource }) {
  const navigate = useNavigate();
  const pool = useMemo(() => distractorPool(c), [c]);
  const [pos, setPos] = useState(0);
  const [wrong, setWrong] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [showDe, setShowDe] = useState(false);
  const [heard, setHeard] = useState('');
  const [listening, setListening] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const finished = pos >= c.lines.length;
  const line = c.lines[pos];
  const myTurn = !finished && line[0] === c.you;

  const options = useMemo(
    () => (myTurn ? shuffle([line[1], ...shuffle(pool.filter((p) => p !== line[1])).slice(0, 2)]) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pos],
  );

  // Other speakers talk automatically.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    if (finished) {
      playSound('done');
      setState((s) =>
        addXp(
          addCards(
            {
              ...s,
              conversations: { ...s.conversations, [c.id]: { best: Math.max(0, 1 - mistakes * 0.15), completedAt: Date.now() } },
            },
            [],
          ),
          15,
        ),
      );
      return;
    }
    if (!myTurn) {
      let cancelled = false;
      speak(line[1], {
        onEnd: () => {
          if (!cancelled) setTimeout(() => setPos((p) => (p === pos ? p + 1 : p)), 500);
        },
      });
      // Fallback if speech is unavailable or onend doesn't fire.
      const t = setTimeout(() => !cancelled && setPos((p) => (p === pos ? p + 1 : p)), 2500 + line[1].length * 70);
      return () => {
        cancelled = true;
        clearTimeout(t);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos]);

  useEffect(() => () => stopSpeaking(), []);

  const choose = (o: string) => {
    if (o === line[1]) {
      playSound('good');
      speak(o);
      setWrong([]);
      setHeard('');
      setTimeout(() => setPos((p) => p + 1), 900);
    } else {
      playSound('bad');
      setMistakes((m) => m + 1);
      setWrong((w) => [...w, o]);
    }
  };

  const say = async () => {
    setListening(true);
    try {
      const alts = await listen().result;
      const target = fold(line[1]).split(' ');
      const best = alts[0] ?? '';
      setHeard(best);
      const got = fold(best).split(' ');
      const hit = target.filter((w) => got.includes(w)).length / target.length;
      if (hit >= 0.6) {
        setState((s) => ({ ...s, stats: { ...s.stats, wordsSpoken: s.stats.wordsSpoken + 1 } }));
        choose(line[1]);
      }
    } catch {
      /* ignore */
    }
    setListening(false);
  };

  return (
    <div style={{ paddingBottom: 260 }}>
      <div className="lesson-top">
        <button type="button" className="icon-btn" onClick={() => navigate(`/gespraech/${c.id}`)} aria-label="Beenden">
          ✕
        </button>
        <div className="spacer" style={{ fontWeight: 800 }}>
          {c.emoji} {c.title}
        </div>
        <button type="button" className="btn ghost small" onClick={() => setShowDe((v) => !v)}>
          {showDe ? 'DE aus' : 'DE an'}
        </button>
      </div>
      <Tip icon="🎭">
        {c.setting} {c.roles[c.you] !== 'Du' && (
          <>
            Du spielst: <strong>{c.roles[c.you]}</strong>
          </>
        )}
      </Tip>
      {c.lines.slice(0, Math.min(pos + (myTurn ? 0 : 1), c.lines.length)).map(([who, es, de], i) => (
        <div key={i} className={`bubble-row ${who === c.you ? 'me' : ''} pop`}>
          <div className="avatar">{who === c.you ? 'Du' : who.slice(0, 2)}</div>
          <div className="speech" onClick={() => speak(es)}>
            <div className="tiny muted" style={{ fontWeight: 800 }}>
              {c.roles[who] ?? who}
            </div>
            <div className="es" style={{ fontWeight: 700 }}>
              {es}
            </div>
            {(showDe || who === c.you) && <div className="de">{de}</div>}
          </div>
        </div>
      ))}
      <div ref={endRef} />

      <div className="check-bar">
        <div className="inner" style={{ flexDirection: 'column' }}>
          {finished ? (
            <>
              <div className="center" style={{ fontWeight: 800 }}>
                🎉 ¡Muy bien! Gespräch geschafft {mistakes === 0 ? 'ohne Fehler!' : `mit ${mistakes} Fehler${mistakes > 1 ? 'n' : ''}.`}
              </div>
              <div className="row">
                <button type="button" className="btn secondary block" onClick={() => navigate(`/gespraech/${c.id}`)}>
                  Zurück
                </button>
                <Link to="/gespraeche" className="btn block">
                  Nächstes Gespräch
                </Link>
              </div>
            </>
          ) : myTurn ? (
            <>
              <div className="small muted" style={{ fontWeight: 700 }}>
                Deine Antwort ({line[2]}):
              </div>
              {options.map((o) => (
                <button
                  key={o}
                  type="button"
                  className={`option ${wrong.includes(o) ? 'wrong shake' : ''}`}
                  disabled={wrong.includes(o)}
                  onClick={() => choose(o)}
                  style={{ fontSize: '0.95rem', minHeight: 48 }}
                >
                  {o}
                </button>
              ))}
              {recognitionAvailable() && (
                <button type="button" className="btn secondary block small" onClick={say} disabled={listening}>
                  {listening ? '👂 Ich höre zu …' : '🎤 Oder laut sagen'}
                  {heard && !listening ? ` – „${heard}“` : ''}
                </button>
              )}
            </>
          ) : (
            <div className="center muted">
              {c.roles[line[0]] ?? line[0]} spricht … <SpeakButton text={line[1]} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConversationPage({ roleplay }: { roleplay?: boolean }) {
  const { id = '' } = useParams();
  const c = getConversation(id);
  const [showDe, setShowDe] = useState(true);
  if (!c) return <BackLink to="/gespraeche" />;
  if (roleplay) return <Roleplay key={c.id} c={c} />;

  return (
    <div style={{ paddingBottom: 80 }}>
      <BackLink to="/gespraeche" label="Gespräche" />
      <div className="row" style={{ marginBottom: 6 }}>
        <span className="big-emoji">{c.emoji}</span>
        <div>
          <LevelBadge level={c.level} />
          <h1 style={{ margin: '4px 0 0' }}>{c.title}</h1>
        </div>
      </div>
      <p className="muted">{c.setting}</p>
      <div className="row" style={{ justifyContent: 'flex-end' }}>
        <button type="button" className="btn ghost small" onClick={() => setShowDe((v) => !v)}>
          {showDe ? 'Übersetzung ausblenden' : 'Übersetzung zeigen'}
        </button>
      </div>
      <div className="card">
        <Dialogue
          lines={c.lines.map(([who, es, de]) => [who === c.you ? 'Tú' : (c.roles[who] ?? who), es, de] as const)}
          showDe={showDe}
        />
      </div>
      {c.keyPhrases && (
        <>
          <h3>Wichtige Ausdrücke</h3>
          <div className="list" style={{ marginBottom: 14 }}>
            {c.keyPhrases.map(([es, de]) => (
              <div key={es} className="list-item">
                <SpeakButton text={es} />
                <div className="grow">
                  <div className="es">{es}</div>
                  <div className="small muted">{de}</div>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  title="Als Karteikarte speichern"
                  onClick={() =>
                    setState((s) => {
                      const key = 'c:' + keyOf(es);
                      if (s.custom.some((x) => x.key === key)) return s;
                      return addCards({ ...s, custom: [...s.custom, { key, es, de, created: Date.now() }] }, [key]);
                    })
                  }
                >
                  ➕
                </button>
              </div>
            ))}
          </div>
        </>
      )}
      {c.tip && <Tip>{c.tip}</Tip>}
      <div className="check-bar">
        <div className="inner">
          <Link to={`/gespraech/${c.id}/spielen`} className="btn block">
            🎭 Rollenspiel starten{c.roles[c.you] !== 'Du' ? ` – du bist ${c.roles[c.you]}` : ''}
          </Link>
        </div>
      </div>
    </div>
  );
}
