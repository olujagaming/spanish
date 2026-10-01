import { useEffect, useMemo, useRef, useState } from 'react';
import type { Exercise } from '../../lib/exercises';
import { checkAnswer, fold, isAccepted, normalize, tokenize } from '../../lib/answer';
import { listen, recognitionAvailable, speak } from '../../lib/speech';
import { SpeakButton, RegionalNote } from '../ui';
import { playSound } from '../../lib/sound';
import { setState } from '../../lib/store';

export interface Answer {
  correct: boolean;
  /** Text shown as the correct solution. */
  solution: string;
  /** Extra hint, e.g. about accents. */
  hint?: string;
}

interface Props {
  ex: Exercise;
  checked: boolean;
  onAnswer: (a: Answer | null) => void;
  /** For self-completing exercises (match, speak): submit immediately. */
  onAutoSubmit: (a: Answer) => void;
}

export function ExerciseView(props: Props) {
  const { ex } = props;
  switch (ex.kind) {
    case 'choice':
      return <Choice {...props} ex={ex} />;
    case 'listen':
      return <Listen {...props} ex={ex} />;
    case 'type':
      return <TypeIn {...props} ex={ex} />;
    case 'build':
      return <Build {...props} ex={ex} />;
    case 'match':
      return <Match {...props} ex={ex} />;
    case 'gap':
      return <Gap {...props} ex={ex} />;
    case 'speak':
      return <Speak {...props} ex={ex} />;
  }
}

type P<K extends Exercise['kind']> = Omit<Props, 'ex'> & { ex: Extract<Exercise, { kind: K }> };

function OptionList({
  options,
  answer,
  checked,
  selected,
  onSelect,
  speakOptions,
}: {
  options: string[];
  answer: string;
  checked: boolean;
  selected: string | null;
  onSelect: (o: string) => void;
  speakOptions?: boolean;
}) {
  // Keyboard shortcuts 1-4
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (checked) return;
      const n = Number(e.key);
      if (n >= 1 && n <= options.length) onSelect(options[n - 1]);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [options, checked, onSelect]);

  return (
    <div className="options">
      {options.map((o, i) => {
        let cls = 'option';
        if (checked) {
          if (o === answer) cls += ' correct';
          else if (o === selected) cls += ' wrong';
          else cls += ' faded';
        } else if (o === selected) cls += ' selected';
        return (
          <button
            key={o}
            type="button"
            className={cls}
            disabled={checked}
            onClick={() => {
              onSelect(o);
              if (speakOptions) speak(o);
            }}
          >
            <span className="kbd-hint muted small" style={{ marginRight: 10 }}>
              {i + 1}
            </span>
            {o}
          </button>
        );
      })}
    </div>
  );
}

function Choice({ ex, checked, onAnswer }: P<'choice'>) {
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    if (ex.speak) speak(ex.speak);
  }, [ex]);
  return (
    <div>
      <div className="ex-title">{ex.dir === 'es-de' ? 'Was bedeutet das?' : 'Wie sagt man das auf Spanisch?'}</div>
      <div className="prompt-big">
        {ex.speak && <SpeakButton text={ex.speak} />}
        <span>{ex.prompt}</span>
      </div>
      <OptionList
        options={ex.options}
        answer={ex.answer}
        checked={checked}
        selected={selected}
        speakOptions={ex.dir === 'de-es'}
        onSelect={(o) => {
          setSelected(o);
          onAnswer({ correct: o === ex.answer, solution: ex.answer });
        }}
      />
    </div>
  );
}

function Listen({ ex, checked, onAnswer }: P<'listen'>) {
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    const t = setTimeout(() => speak(ex.audio), 250);
    return () => clearTimeout(t);
  }, [ex]);
  return (
    <div>
      <div className="ex-title">Was hörst du?</div>
      <div className="row" style={{ justifyContent: 'center', margin: '10px 0 22px' }}>
        <SpeakButton text={ex.audio} size="lg" />
        <SpeakButton text={ex.audio} slow />
      </div>
      <OptionList
        options={ex.options}
        answer={ex.answer}
        checked={checked}
        selected={selected}
        onSelect={(o) => {
          setSelected(o);
          onAnswer({ correct: o === ex.answer, solution: ex.answer });
        }}
      />
    </div>
  );
}

const ACCENTS = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'];

export function AccentKeys({ onKey }: { onKey: (k: string) => void }) {
  return (
    <div className="accent-keys">
      {ACCENTS.map((k) => (
        <button key={k} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onKey(k)}>
          {k}
        </button>
      ))}
    </div>
  );
}

function TypeIn({ ex, checked, onAnswer }: P<'type'>) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  const update = (v: string) => {
    setValue(v);
    if (!v.trim()) return onAnswer(null);
    const r = checkAnswer(v, ex.answer);
    onAnswer({
      correct: isAccepted(r),
      solution: ex.answer,
      hint: r === 'accent' ? 'Achte auf die Akzente!' : r === 'typo' ? 'Kleiner Tippfehler.' : undefined,
    });
  };
  return (
    <div>
      <div className="ex-title">Schreib auf Spanisch</div>
      <div className="prompt-big">{ex.prompt}</div>
      <input
        ref={ref}
        className="input"
        value={value}
        disabled={checked}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        lang="es"
        placeholder="Auf Spanisch …"
        onChange={(e) => update(e.target.value)}
      />
      {!checked && <AccentKeys onKey={(k) => update(value + k)} />}
      {checked && ex.note && (
        <div style={{ marginTop: 8 }}>
          <RegionalNote note={ex.note} />
        </div>
      )}
    </div>
  );
}

function Build({ ex, checked, onAnswer }: P<'build'>) {
  const [picked, setPicked] = useState<number[]>([]);
  const update = (next: number[]) => {
    setPicked(next);
    if (!next.length) return onAnswer(null);
    const sentence = next.map((i) => ex.tokens[i]).join(' ');
    onAnswer({ correct: fold(sentence) === fold(tokenize(ex.answer).join(' ')), solution: ex.answer });
  };
  return (
    <div>
      <div className="ex-title">Bilde den Satz</div>
      <div className="prompt-big" style={{ fontSize: '1.2rem' }}>
        {ex.prompt}
      </div>
      <div className="token-area">
        {picked.map((i) => (
          <button key={i} type="button" className="token" disabled={checked} onClick={() => update(picked.filter((x) => x !== i))}>
            {ex.tokens[i]}
          </button>
        ))}
      </div>
      <div className="token-bank">
        {ex.tokens.map((t, i) => (
          <button
            key={i}
            type="button"
            className={`token ${picked.includes(i) ? 'used' : ''}`}
            disabled={checked}
            onClick={() => {
              speak(t);
              update([...picked, i]);
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}

function Match({ ex, onAutoSubmit }: P<'match'>) {
  const left = useMemo(() => [...ex.pairs].sort(() => Math.random() - 0.5).map((p) => p[0]), [ex]);
  const right = useMemo(() => [...ex.pairs].sort(() => Math.random() - 0.5).map((p) => p[1]), [ex]);
  const [selL, setSelL] = useState<string | null>(null);
  const [selR, setSelR] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);

  useEffect(() => {
    if (!selL || !selR) return;
    const ok = ex.pairs.some(([es, de]) => es === selL && de === selR);
    if (ok) {
      playSound('tap');
      const next = [...done, selL, selR];
      setDone(next);
      if (next.length === ex.pairs.length * 2) {
        onAutoSubmit({ correct: mistakes <= 1, solution: 'Alle Paare gefunden!' });
      }
    } else {
      setMistakes((m) => m + 1);
      setWrong([selL, selR]);
      setTimeout(() => setWrong([]), 500);
    }
    setSelL(null);
    setSelR(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selL, selR]);

  const cls = (v: string, sel: string | null) =>
    `option ${done.includes(v) ? 'correct faded' : ''} ${wrong.includes(v) ? 'wrong shake' : ''} ${sel === v ? 'selected' : ''}`;

  return (
    <div>
      <div className="ex-title">Finde die Paare</div>
      <div className="match-grid">
        <div className="options">
          {left.map((v) => (
            <button
              key={v}
              type="button"
              className={cls(v, selL)}
              disabled={done.includes(v)}
              onClick={() => {
                speak(v);
                setSelL(v);
              }}
            >
              {v}
            </button>
          ))}
        </div>
        <div className="options">
          {right.map((v) => (
            <button key={v} type="button" className={cls(v, selR)} disabled={done.includes(v)} onClick={() => setSelR(v)}>
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Gap({ ex, checked, onAnswer }: P<'gap'>) {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div>
      <div className="ex-title">Ergänze den Satz</div>
      <div className="gap-sentence">
        {ex.before}
        <span className="gap-blank">{selected ?? ' '}</span>
        {ex.after}
      </div>
      <p className="muted">{ex.de}</p>
      <OptionList
        options={ex.options}
        answer={ex.answer}
        checked={checked}
        selected={selected}
        onSelect={(o) => {
          setSelected(o);
          onAnswer({ correct: o === ex.answer, solution: ex.full });
        }}
      />
    </div>
  );
}

function Speak({ ex, onAutoSubmit, onAnswer }: P<'speak'>) {
  const [state, setStateLocal] = useState<'idle' | 'listening' | 'heard'>('idle');
  const [heard, setHeard] = useState('');
  const available = recognitionAvailable();

  useEffect(() => {
    // Allow skipping without mic: counts as correct (practice only).
    onAnswer({ correct: true, solution: ex.text, hint: 'Sprich den Satz laut nach!' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex]);

  const start = async () => {
    setStateLocal('listening');
    try {
      const alts = await listen().result;
      const target = normalize(ex.text);
      const best = alts.find((a) => fold(a) === fold(target)) ?? alts[0] ?? '';
      setHeard(best);
      setStateLocal('heard');
      const r = checkAnswer(best, ex.text);
      const words = fold(ex.text).split(' ');
      const got = fold(best).split(' ');
      const hit = words.filter((w) => got.includes(w)).length / words.length;
      if (isAccepted(r) || hit >= 0.7) {
        setState((s) => ({ ...s, stats: { ...s.stats, wordsSpoken: s.stats.wordsSpoken + 1 } }));
        onAutoSubmit({ correct: true, solution: ex.text, hint: '¡Muy bien pronunciado! 🎉' });
      }
    } catch {
      setStateLocal('idle');
    }
  };

  return (
    <div>
      <div className="ex-title">Sprich nach</div>
      <div className="prompt-big" style={{ fontSize: '1.3rem' }}>
        <SpeakButton text={ex.text} />
        <span>{ex.text}</span>
      </div>
      <p className="muted">{ex.de}</p>
      {available ? (
        <div className="center" style={{ marginTop: 20 }}>
          <button type="button" className="icon-btn lg" onClick={start} disabled={state === 'listening'} aria-label="Aufnahme starten">
            {state === 'listening' ? '👂' : '🎤'}
          </button>
          <p className="muted small" style={{ marginTop: 10 }}>
            {state === 'listening' ? 'Ich höre zu …' : 'Tippe aufs Mikrofon und sprich den Satz.'}
          </p>
          {state === 'heard' && (
            <p>
              Ich habe verstanden: <strong>„{heard || '…'}“</strong>
              <br />
              <span className="muted small">Versuch es noch einmal oder tippe auf „Weiter“.</span>
            </p>
          )}
        </div>
      ) : (
        <p className="muted small">
          Dein Browser unterstützt keine Spracherkennung. Sprich den Satz trotzdem laut nach – das trainiert die Aussprache!
        </p>
      )}
    </div>
  );
}
